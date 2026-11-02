import { env } from "../../../config/env";
import { httpClient } from "../../../services/http/client";
import { getCurrentActaUser } from "../../../services/api/auth/auth.api";
import type { CatoChat, CatoCycle, CatoMessage } from "../../../types/cato";

type JsonObject = Record<string, unknown>;

function apiUrl(path: string) {
  if (!env.apiCatoUrl) throw new Error("A URL da API do Cato não está configurada.");
  return `${env.apiCatoUrl.replace(/\/$/, "")}${path}`;
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function firstString(object: JsonObject, keys: string[]) {
  for (const key of keys) if (typeof object[key] === "string" && object[key]) return object[key] as string;
  return "";
}

function firstNumber(object: JsonObject, keys: string[]) {
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
    if (typeof value === "string" && /^\d+$/.test(value) && Number(value) > 0) return Number(value);
  }
  return 0;
}

function unwrapList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const object = asObject(value);
  if (!object) return [];
  for (const key of ["chats", "conversas", "ciclos", "items", "data", "mensagens", "messages", "results"]) {
    if (Array.isArray(object[key])) return object[key] as unknown[];
  }
  return [];
}

export async function listarCiclos(): Promise<CatoCycle[]> {
  if (!env.apiPgUrl) throw new Error("A URL da API PostgreSQL não está configurada.");
  const usuario = await getCurrentActaUser();
  if (usuario.estadoPerfil !== "PERFIL_CRIADO") return [];

  const apiPgBase = env.apiPgUrl.replace(/\/+$/, "");
  const response = await httpClient<unknown>(
    `${apiPgBase}/api/v1/usuario/ciclos-usuario/${usuario.idUsuario}`,
  );
  return unwrapList(response).flatMap((item) => {
    const object = asObject(item);
    if (!object) return [];
    const id = firstNumber(object, ["idCiclo", "id_ciclo", "id", "cycle_id"]);
    if (!id) return [];
    return [{
      id,
      title: firstString(object, ["nomeCiclo", "titulo", "title", "nome"]) || `Ciclo ${id}`,
      status: firstString(object, ["statusCiclo", "status", "estado"]),
    }];
  });
}

export async function listarConversas(): Promise<CatoChat[]> {
  const response = await httpClient<unknown>(apiUrl("/listar_chats?limit=50"));
  return unwrapList(response).flatMap((item) => {
    const object = asObject(item);
    if (!object) return [];
    const sessionId = firstString(object, ["session_id", "sessionId", "id", "chat_id"]);
    if (!sessionId) return [];
    return [{
      sessionId,
      title: firstString(object, ["title", "titulo", "nome", "last_message", "ultima_mensagem"]) || "Conversa sem título",
      updatedAt: firstString(object, ["updated_at", "updatedAt", "created_at", "data"]),
    }];
  });
}

export async function listarMensagens(sessionId: string): Promise<CatoMessage[]> {
  const response = await httpClient<unknown>(apiUrl(`/chats/${encodeURIComponent(sessionId)}/mensagens?limit=100`));
  return unwrapList(response).flatMap((item, index) => {
    const object = asObject(item);
    if (!object) return [];
    const rawContent = firstString(object, ["content", "message", "mensagem", "texto", "conteudo"]);
    if (!rawContent) return [];
    const rawRole = firstString(object, ["role", "papel", "autor", "sender", "remetente"]).toLocaleLowerCase("pt-BR");
    return [{
      id: firstString(object, ["id", "message_id"]) || `${sessionId}-${index}`,
      role: ["user", "usuario", "usuário", "human"].includes(rawRole) ? "user" : "assistant",
      content: rawContent,
      createdAt: firstString(object, ["created_at", "createdAt", "timestamp", "data"]),
    }];
  });
}

export async function enviarMensagem(input: {
  message: string;
  sessionId: string;
  cycleIds?: number[];
  activeCycleId?: number | null;
}): Promise<string> {
  const response = await httpClient<unknown>(apiUrl("/chat"), {
    method: "POST",
    body: JSON.stringify({
      message: input.message,
      session_id: input.sessionId,
      ...(input.cycleIds ? { id_ciclo: input.cycleIds } : {}),
      ...(input.activeCycleId !== undefined ? { ciclo_ativo: input.activeCycleId } : {}),
    }),
  });
  const object = asObject(response);
  const answer = object && firstString(object, ["response", "resposta", "answer", "message", "mensagem", "content", "conteudo"]);
  if (!answer) throw new Error("O Cato respondeu em um formato inesperado.");
  return answer;
}

export async function enviarAudio(input: {
  audio: Blob;
  sessionId: string;
  cycleIds?: number[];
  activeCycleId?: number | null;
}): Promise<{ transcription: string; response: string }> {
  const form = new FormData();
  form.set("session_id", input.sessionId);
  form.set("audio", input.audio, input.audio.type.includes("ogg") ? "audio.ogg" : "audio.webm");
  for (const cycleId of input.cycleIds ?? []) form.append("id_ciclo", String(cycleId));
  if (input.activeCycleId) form.set("ciclo_ativo", String(input.activeCycleId));

  const result = asObject(await httpClient<unknown>(apiUrl("/chat/audio"), {
    method: "POST",
    body: form,
  }));
  const transcription = result && firstString(result, ["transcricao", "transcription"]);
  const response = result && firstString(result, ["resposta", "response", "answer"]);
  if (!transcription || !response) throw new Error("Não foi possível obter a transcrição do áudio.");
  return { transcription, response };
}

export async function criarNovaConversa(currentSessionId: string | null): Promise<string> {
  const response = await httpClient<unknown>(apiUrl("/nova_conversa"), {
    method: "POST",
    body: JSON.stringify({ session_id_atual: currentSessionId }),
  });
  const object = asObject(response);
  return object ? firstString(object, ["session_id", "sessionId", "id"]) : "";
}

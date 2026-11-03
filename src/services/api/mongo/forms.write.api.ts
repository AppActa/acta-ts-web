import { env } from "../../../config/env";
import { ApiError, httpClient } from "../../http/client";
import type { FormularioMongo, LicaoAprendidaMongo, PerguntaFormularioMongo, StatusFormularioMongo, TipoFormularioMongo, TipoRespostaMongo, RespostaFormularioMongo, RespostaPerguntaFormularioMongo } from "../../../types/mongo";
import { MongoReadError } from "./dashboard.read.api";
import { obterFormularioMongo } from "./dashboard.read.api";

export interface DadosFormularioMongo {
  titulo: string;
  descricao: string | null;
  tipo: TipoFormularioMongo;
  perguntas: Array<Omit<PerguntaFormularioMongo, "id"> & { id?: string }>;
  idsUsuariosDestinatarios: number[];
  idIshikawa?: string | null;
}

export interface DadosLicaoAprendidaMongo {
  titulo: string; licao: string; tags: string[]; faseOrigem: string; resultado: string; severidade: string; area: string;
}

function baseUrl(): URL {
  try {
    const value = env.apiMongoUrl;
    if (!value || value.trim() !== value) throw new Error();
    const url = new URL(value);
    const devHttp = import.meta.env.DEV && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    if ((url.protocol !== "https:" && !devHttp) || url.username || url.password || /[?#]/.test(value) || url.pathname !== "/") throw new Error();
    return url;
  } catch { throw new MongoReadError("INVALID_CONFIGURATION"); }
}
function endpoint(path: string): URL { return new URL(`/api/v1${path}`, baseUrl().origin); }
function validUuid(id: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id); }
function validateForm(data: DadosFormularioMongo) {
  if (!data.titulo.trim() || data.titulo !== data.titulo.trim() || data.titulo.length > 160 || (data.descricao !== null && data.descricao.length > 2000)
    || !data.perguntas.length || data.perguntas.some((q) => !q.titulo.trim() || q.titulo !== q.titulo.trim() || !["TEXTO", "RADIO", "CHECKBOX", "DATA", "EMAIL", "NUMERO_INTEIRO", "NUMERO_DECIMAL", "RANGE", "TELEFONE", "SIM_NAO", "CPF", "ARQUIVO", "CEP"].includes(q.tipo as TipoRespostaMongo)
      || typeof q.obrigatoria !== "boolean" || !Array.isArray(q.opcoes) || q.opcoes.some((o) => !o.trim()) || (["RADIO", "CHECKBOX"].includes(q.tipo) && q.opcoes.length < 2) || (q.id !== undefined && !validUuid(q.id)))
    || data.idsUsuariosDestinatarios.some((id) => !Number.isSafeInteger(id) || id <= 0) || new Set(data.idsUsuariosDestinatarios).size !== data.idsUsuariosDestinatarios.length
    || (data.idIshikawa != null && !validUuid(data.idIshikawa))) throw new MongoReadError("INVALID_INPUT");
}
async function send<T>(path: string, method: "POST" | "PATCH", body: unknown, signal: AbortSignal, expectedStatus?: 201): Promise<T> {
  try {
    return await httpClient<T>(endpoint(path), { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal, retryOnUnauthorized: false, ...(expectedStatus ? { expectedStatus } : {}) });
  } catch (e) { if (e instanceof ApiError || e instanceof MongoReadError || (e instanceof DOMException && e.name === "AbortError")) throw e; throw new MongoReadError("UNAVAILABLE"); }
}
function assertForm(value: unknown, cycleId: number): FormularioMongo {
  if (!value || typeof value !== "object") throw new MongoReadError("INVALID_RESPONSE");
  const form = value as FormularioMongo;
  if (!validUuid(form.id) || !Number.isSafeInteger(form.idEmpresa) || form.idEmpresa <= 0 || form.idCiclo !== cycleId || !form.titulo
    || !["RASCUNHO", "ATIVO", "INATIVO"].includes(form.status) || !Array.isArray(form.perguntas) || !form.perguntas.length
    || !Array.isArray(form.idsUsuariosDestinatarios) || form.idsUsuariosDestinatarios.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new MongoReadError("INVALID_RESPONSE");
  return form;
}

export async function criarFormularioMongo(idCiclo: number, data: DadosFormularioMongo, signal: AbortSignal): Promise<FormularioMongo> {
  if (!Number.isSafeInteger(idCiclo) || idCiclo <= 0) throw new MongoReadError("INVALID_INPUT");
  validateForm(data);
  return assertForm(await send(`/ciclos/${idCiclo}/formularios`, "POST", { ...data, perguntas: data.perguntas.map(({ id: _id, ...q }) => q) }, signal, 201), idCiclo);
}

export async function atualizarFormularioMongo(id: string, idCiclo: number, data: DadosFormularioMongo, signal: AbortSignal): Promise<FormularioMongo> {
  if (!validUuid(id) || !Number.isSafeInteger(idCiclo) || idCiclo <= 0) throw new MongoReadError("INVALID_INPUT");
  validateForm(data);
  const current = await obterFormularioMongo(id, signal);
  if (current.idCiclo !== idCiclo) throw new MongoReadError("INVALID_INPUT");
  const saved = assertForm(await send(`/formularios/${id}`, "PATCH", { ...data, status: current.status, perguntas: data.perguntas }, signal), idCiclo);
  if (saved.id !== id) throw new MongoReadError("INVALID_RESPONSE");
  return saved;
}

export async function publicarFormularioMongo(id: string, idCiclo: number, signal: AbortSignal): Promise<FormularioMongo> {
  if (!validUuid(id)) throw new MongoReadError("INVALID_INPUT");
  const current = await obterFormularioMongo(id, signal);
  if (current.idCiclo !== idCiclo) throw new MongoReadError("INVALID_INPUT");
  return assertForm(await send(`/formularios/${id}`, "PATCH", { status: "ATIVO" satisfies StatusFormularioMongo }, signal), idCiclo);
}

export async function enviarRespostaFormularioMongo(idFormulario: string, respostas: RespostaPerguntaFormularioMongo[], signal: AbortSignal): Promise<RespostaFormularioMongo> {
  if (!validUuid(idFormulario) || !respostas.length || respostas.some((r) => !validUuid(r.idPergunta))) throw new MongoReadError("INVALID_INPUT");
  const value = await send<unknown>(`/formularios/${idFormulario}/respostas`, "POST", { respostas }, signal, 201);
  if (!value || typeof value !== "object") throw new MongoReadError("INVALID_RESPONSE");
  const answer = value as RespostaFormularioMongo;
  if (!validUuid(answer.id) || answer.idFormulario !== idFormulario || !Array.isArray(answer.respostas) || answer.respostas.some((r) => !validUuid(r.idPergunta))) throw new MongoReadError("INVALID_RESPONSE");
  return answer;
}

export async function criarLicaoAprendidaMongo(idCiclo: number, data: DadosLicaoAprendidaMongo, signal: AbortSignal): Promise<LicaoAprendidaMongo> {
  if (!Number.isSafeInteger(idCiclo) || idCiclo <= 0) throw new MongoReadError("INVALID_INPUT");
  validarLicao(data);
  return validarLicaoResponse(await send(`/ciclos/${idCiclo}/licoes-aprendidas`, "POST", data, signal, 201), idCiclo);
}

export async function atualizarLicaoAprendidaMongo(id: string, idCiclo: number, data: DadosLicaoAprendidaMongo, signal: AbortSignal): Promise<LicaoAprendidaMongo> {
  if (!validUuid(id)) throw new MongoReadError("INVALID_INPUT");
  validarLicao(data);
  const value = validarLicaoResponse(await send(`/licoes-aprendidas/${id}`, "PATCH", data, signal), idCiclo);
  if (value.id !== id) throw new MongoReadError("INVALID_RESPONSE");
  return value;
}

function validarLicao(data: DadosLicaoAprendidaMongo) {
  if ([data.titulo, data.licao, data.faseOrigem, data.resultado, data.severidade, data.area].some((v) => !v.trim() || v !== v.trim() || v.length > 2000)
    || data.tags.some((t) => !t.trim() || t !== t.trim()) || new Set(data.tags).size !== data.tags.length) throw new MongoReadError("INVALID_INPUT");
}
function validarLicaoResponse(value: unknown, cycleId: number): LicaoAprendidaMongo {
  if (!value || typeof value !== "object") throw new MongoReadError("INVALID_RESPONSE");
  const item = value as LicaoAprendidaMongo;
  if (!validUuid(item.id) || !Number.isSafeInteger(item.idEmpresa) || item.idEmpresa <= 0 || item.idCiclo !== cycleId || !item.titulo || !item.licao
    || !Array.isArray(item.tags) && item.tags !== null || !item.faseOrigem || !item.resultado || !item.severidade || !item.area) throw new MongoReadError("INVALID_RESPONSE");
  return item;
}

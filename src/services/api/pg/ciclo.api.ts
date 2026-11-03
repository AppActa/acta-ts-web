import { env } from "../../../config/env";
import { ApiError, httpClient } from "../../http/client";
import type { CicloPg } from "./dashboard.read.api";

const PG_ORIGIN = "https://acta-pg-api.34-232-250-240.sslip.io";

export type NovoCicloPg = {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataEstimadaFim: string;
  idGestor: number;
};

export type PapelCicloPg = "RESPONSAVEL" | "PARTICIPANTE" | "EXECUTOR" | "VALIDADOR" | "OBSERVADOR";

export class CicloWriteError extends Error {
  constructor(readonly code: "INVALID_CONFIGURATION" | "INVALID_INPUT" | "INVALID_RESPONSE") {
    super("Não foi possível criar o ciclo.");
    this.name = "CicloWriteError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(0);
  parsed.setUTCFullYear(year, month - 1, day);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function validBaseUrl(): URL {
  try {
    const configured = env.apiPgUrl;
    if (!configured || configured.trim() !== configured) throw new Error();
    const url = new URL(configured);
    if (url.protocol !== "https:" || url.origin !== PG_ORIGIN || url.username || url.password
      || /[?#]/.test(configured) || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) throw new Error();
    return url;
  } catch {
    throw new CicloWriteError("INVALID_CONFIGURATION");
  }
}

function dataCorresponde(resposta: unknown, dataIso: string): boolean {
  const [year, month, day] = dataIso.split("-");
  return resposta === dataIso || resposta === day + "/" + month + "/" + year;
}

function parseCicloCriado(value: unknown, dados: NovoCicloPg, idEmpresaEsperada: number): CicloPg {
  if (!isRecord(value) || !positiveId(value.id) || value.titulo !== dados.titulo || value.status !== "PLANEJAMENTO"
    || !dataCorresponde(value.dataInicio, dados.dataInicio) || !dataCorresponde(value.dataEstimadaFim, dados.dataEstimadaFim)
    || value.idEmpresa !== idEmpresaEsperada || value.idGestor !== dados.idGestor
    || typeof value.dataInicio !== "string" || typeof value.dataEstimadaFim !== "string") {
    throw new CicloWriteError("INVALID_RESPONSE");
  }
  return {
    id: value.id,
    titulo: dados.titulo,
    status: "PLANEJAMENTO",
    dataInicio: value.dataInicio,
    dataEstimadaFim: value.dataEstimadaFim,
    idEmpresa: value.idEmpresa,
  };
}

export async function adicionarUsuarioAoCicloPg(
  idCiclo: number,
  idUsuario: number,
  nomeUsuario: string,
  papelCiclo: PapelCicloPg,
  signal: AbortSignal,
): Promise<void> {
  if (!positiveId(idCiclo) || !positiveId(idUsuario) || !nomeUsuario.trim()) throw new CicloWriteError("INVALID_INPUT");

  const url = new URL("/api/v1/ciclo/" + idCiclo + "/usuario", validBaseUrl().origin);

  try {
    const resposta: unknown = await httpClient(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario, papelCiclo }),
      signal,
      retryOnUnauthorized: false,
      expectedStatus: 201,
    });

    if (!isRecord(resposta) || resposta.idCiclo !== idCiclo || resposta.idUsuario !== idUsuario
      || resposta.nomeUsuario !== nomeUsuario || resposta.papelCiclo !== papelCiclo) throw new CicloWriteError("INVALID_RESPONSE");
  } catch (error) {
    if (error instanceof ApiError || error instanceof CicloWriteError
      || (error instanceof DOMException && error.name === "AbortError")) throw error;
    throw new CicloWriteError("INVALID_RESPONSE");
  }
}

export async function atualizarTituloCicloPg(idCiclo: number, idEmpresa: number, titulo: string, signal: AbortSignal): Promise<void> {
  if (!positiveId(idCiclo) || !positiveId(idEmpresa) || !titulo.trim() || titulo !== titulo.trim() || titulo.length > 160) throw new CicloWriteError("INVALID_INPUT");
  const resposta: unknown = await httpClient(new URL("/api/v1/ciclo/" + idCiclo, validBaseUrl().origin), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo }), signal, retryOnUnauthorized: false,
  });
  if (!isRecord(resposta) || resposta.id !== idCiclo || resposta.idEmpresa !== idEmpresa || resposta.titulo !== titulo) throw new CicloWriteError("INVALID_RESPONSE");
}

export async function excluirCicloPg(idCiclo: number, signal: AbortSignal): Promise<void> {
  if (!positiveId(idCiclo)) throw new CicloWriteError("INVALID_INPUT");
  await httpClient<void>(new URL("/api/v1/ciclo/" + idCiclo, validBaseUrl().origin), { method: "DELETE", signal, retryOnUnauthorized: false });
}

export async function criarCicloPg(dados: NovoCicloPg, idEmpresaEsperada: number, signal: AbortSignal): Promise<CicloPg> {
  const titulo = dados.titulo.trim();
  const descricao = dados.descricao.trim();
  const hoje = new Date();
  const hojeIso = String(hoje.getFullYear()).padStart(4, "0") + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");
  if (!titulo || titulo.length > 160 || titulo !== dados.titulo || !descricao || descricao.length > 1000 || descricao !== dados.descricao
    || !validDate(dados.dataInicio) || !validDate(dados.dataEstimadaFim) || dados.dataInicio < hojeIso
    || dados.dataEstimadaFim < dados.dataInicio || !positiveId(dados.idGestor) || !positiveId(idEmpresaEsperada)) throw new CicloWriteError("INVALID_INPUT");

  const url = new URL("/api/v1/ciclo", validBaseUrl().origin);
  try {
    const resposta = await httpClient<unknown>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, titulo, descricao }),
      signal,
      retryOnUnauthorized: false,
      expectedStatus: 201,
    });
    return parseCicloCriado(resposta, { ...dados, titulo, descricao }, idEmpresaEsperada);
  } catch (error) {
    if (error instanceof ApiError || (error instanceof DOMException && error.name === "AbortError")) throw error;
    throw new CicloWriteError("INVALID_RESPONSE");
  }
}

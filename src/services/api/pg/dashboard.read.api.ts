import { env } from "../../../config/env";
import { httpClient } from "../../http/client";

export type StatusCicloPg = "PLANEJAMENTO" | "EXECUCAO" | "VERIFICACAO" | "PADRONIZACAO" | "CONCLUIDO" | "CANCELADO" | "PAUSADO";
export type StatusTarefaPg = "PENDENTE" | "EM_ANDAMENTO" | "BLOQUEADA" | "CONCLUIDA" | "ATRASADA" | "CANCELADA";
export type StatusPlanoAcaoPg = "RASCUNHO" | "APROVADO" | "EM_EXECUCAO" | "CONCLUIDO" | "CANCELADO";
export type StatusMetaPg = "NAO_INICIADA" | "EM_ANDAMENTO" | "ATINGIDA" | "PARCIALMENTE_ATINGIDA" | "NAO_ATINGIDA" | "CANCELADA";
export type StatusVerificacaoPg = "NAO_VERIFICADO" | "APROVADO" | "PARCIAL" | "REPROVADO";

export type CicloPg = { id: number; titulo: string; status: StatusCicloPg; dataInicio: string | null; dataEstimadaFim: string | null; idEmpresa: number };
export type TarefaPg = { id: number; titulo: string; status: StatusTarefaPg };
export type PlanoAcaoPg = { id: number; nome: string; status: StatusPlanoAcaoPg; idCiclo: number };
export type MetaPg = { id: number; objetivo: string; status: StatusMetaPg; idCiclo: number; valorBase: number; valorAlvo: number };
export type VerificacaoPg = { id: number; status: StatusVerificacaoPg; idCiclo: number };
export type CausaRaizPg = { id: number; descricao: string; aceita: boolean | null; idCiclo: number };

export class PgReadError extends Error {
  constructor(readonly code: "INVALID_CONFIGURATION" | "INVALID_INPUT" | "INVALID_RESPONSE" | "UNAVAILABLE") {
    super(code === "INVALID_CONFIGURATION" ? "A origem configurada para o serviço não é válida." : "Não foi possível carregar os dados do serviço.");
    this.name = "PgReadError";
  }
}

const PG_ORIGIN = "https://acta-pg-api.34-232-250-240.sslip.io";
const CYCLE_STATUSES = ["PLANEJAMENTO", "EXECUCAO", "VERIFICACAO", "PADRONIZACAO", "CONCLUIDO", "CANCELADO", "PAUSADO"] as const;
const TASK_STATUSES = ["PENDENTE", "EM_ANDAMENTO", "BLOQUEADA", "CONCLUIDA", "ATRASADA", "CANCELADA"] as const;
const PLAN_STATUSES = ["RASCUNHO", "APROVADO", "EM_EXECUCAO", "CONCLUIDO", "CANCELADO"] as const;
const GOAL_STATUSES = ["NAO_INICIADA", "EM_ANDAMENTO", "ATINGIDA", "PARCIALMENTE_ATINGIDA", "NAO_ATINGIDA", "CANCELADA"] as const;
const VERIFICATION_STATUSES = ["NAO_VERIFICADO", "APROVADO", "PARCIAL", "REPROVADO"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function requiredText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validBaseUrl(): URL {
  try {
    const configured = env.apiPgUrl;
    if (!configured || configured.trim() !== configured) throw new Error();
    const url = new URL(configured);
    if (url.protocol !== "https:" || url.origin !== PG_ORIGIN || url.username || url.password || /[?#]/.test(configured) || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) throw new Error();
    return url;
  } catch {
    throw new PgReadError("INVALID_CONFIGURATION");
  }
}

function readId(value: unknown): number {
  if (!positiveId(value)) throw new PgReadError("INVALID_INPUT");
  return value;
}

function endpointUrl(path: string): URL {
  const base = validBaseUrl();
  const url = new URL(`/api/v1${path}`, base.origin);
  if (url.origin !== PG_ORIGIN || url.pathname !== `/api/v1${path}` || url.search || url.hash) throw new PgReadError("INVALID_INPUT");
  return url;
}

async function get(path: string, signal?: AbortSignal): Promise<unknown> {
  const url = endpointUrl(path);
  try {
    return await httpClient<unknown>(url, { method: "GET", cache: "no-store", ...(signal ? { signal } : {}) });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new PgReadError("UNAVAILABLE");
  }
}

function parseArray<T>(value: unknown, parseItem: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new PgReadError("INVALID_RESPONSE");
  try { return value.map(parseItem); } catch { throw new PgReadError("INVALID_RESPONSE"); }
}

function validDataCiclo(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [dia, mes, ano] = value.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

function parseCiclo(value: unknown, idEmpresaEsperada: number): CicloPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo) || !CYCLE_STATUSES.includes(value.status as StatusCicloPg) || !positiveId(value.idEmpresa) || value.idEmpresa !== idEmpresaEsperada || !validDataCiclo(value.dataInicio) || !validDataCiclo(value.dataEstimadaFim)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, titulo: value.titulo, status: value.status as StatusCicloPg, dataInicio: value.dataInicio, dataEstimadaFim: value.dataEstimadaFim, idEmpresa: value.idEmpresa };
}

function parseTarefa(value: unknown): TarefaPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo) || !TASK_STATUSES.includes(value.status as StatusTarefaPg)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, titulo: value.titulo, status: value.status as StatusTarefaPg };
}

function parsePlano(value: unknown): PlanoAcaoPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.nome) || !positiveId(value.idCiclo) || !PLAN_STATUSES.includes(value.status as StatusPlanoAcaoPg)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, nome: value.nome, status: value.status as StatusPlanoAcaoPg, idCiclo: value.idCiclo };
}

function parseMeta(value: unknown): MetaPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.objetivo) || !positiveId(value.idCiclo) || !finiteNumber(value.valorBase) || !finiteNumber(value.valorAlvo) || !GOAL_STATUSES.includes(value.status as StatusMetaPg)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, objetivo: value.objetivo, status: value.status as StatusMetaPg, idCiclo: value.idCiclo, valorBase: value.valorBase, valorAlvo: value.valorAlvo };
}

function parseVerificacao(value: unknown): VerificacaoPg {
  if (!isRecord(value) || !positiveId(value.id) || !positiveId(value.idCiclo) || !VERIFICATION_STATUSES.includes(value.status as StatusVerificacaoPg)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, status: value.status as StatusVerificacaoPg, idCiclo: value.idCiclo };
}

function parseCausa(value: unknown): CausaRaizPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.descricao) || (value.aceita !== null && typeof value.aceita !== "boolean") || !positiveId(value.idCiclo)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, descricao: value.descricao, aceita: value.aceita, idCiclo: value.idCiclo };
}

export async function listarCiclosPg(idEmpresa: number, signal?: AbortSignal): Promise<CicloPg[]> {
  const idEmpresaValidada = readId(idEmpresa);
  return parseArray(await get("/ciclo", signal), (item) => parseCiclo(item, idEmpresaValidada));
}

export async function listarMinhasTarefasPg(signal?: AbortSignal): Promise<TarefaPg[]> {
  return parseArray(await get("/tarefa/minhas", signal), parseTarefa);
}

export async function listarPlanosPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<PlanoAcaoPg[]> {
  const id = readId(idCiclo);
  return parseArray(await get(`/ciclo/${id}/plano-acao`, signal), parsePlano);
}

export async function listarCausasRaizPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<CausaRaizPg[]> {
  const id = readId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/causas-raiz`, signal), parseCausa);
}

export async function listarMetasPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<MetaPg[]> {
  const id = readId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/meta`, signal), parseMeta);
}

export async function listarVerificacoesPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<VerificacaoPg[]> {
  const id = readId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/verificacoes`, signal), parseVerificacao);
}

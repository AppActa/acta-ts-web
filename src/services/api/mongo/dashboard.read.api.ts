import { env } from "../../../config/env";
import { httpClient } from "../../http/client";

export type TipoFormularioMongo = "ANALISE_FENOMENO" | "PARETO" | "ISHIKAWA" | "PLANO_ACAO" | "TREINAMENTO" | "PADRONIZACAO" | "CHECKLIST";
export type StatusFormularioMongo = "RASCUNHO" | "ATIVO" | "INATIVO";
export type TipoRespostaMongo = "TEXTO" | "RADIO" | "CHECKBOX" | "DATA" | "EMAIL" | "NUMERO_INTEIRO" | "NUMERO_DECIMAL" | "RANGE" | "TELEFONE" | "SIM_NAO" | "CPF" | "ARQUIVO" | "CEP";
export type CategoriaIshikawaMongo = "METODO" | "MAO_DE_OBRA" | "MAQUINA" | "MATERIAL" | "MEDICAO" | "MEIO_AMBIENTE";

export type PerguntaFormularioMongo = { id: string; titulo: string; tipo: TipoRespostaMongo; obrigatoria: boolean; opcoes: string[] | null };
export type FormularioMongo = { id: string; idEmpresa: number; idCiclo: number; titulo: string; tipo: TipoFormularioMongo; status: StatusFormularioMongo; perguntas: PerguntaFormularioMongo[] };
export type CausaIshikawaMongo = { id: string; categoria: CategoriaIshikawaMongo; descricao: string };
export type IshikawaMongo = { id: string; idEmpresa: number; idCiclo: number; problema: string; causas: CausaIshikawaMongo[] };
export type PorqueMongo = { ordem: number; pergunta: string; resposta: string };
export type CincoPorquesMongo = { id: string; idIshikawa: string; hipotese: string; porques: PorqueMongo[] };
export type LicaoAprendidaMongo = { id: string; idEmpresa: number; idCiclo: number; titulo: string; licao: string; tags: string[] | null };

export class MongoReadError extends Error {
  constructor(readonly code: "INVALID_CONFIGURATION" | "INVALID_INPUT" | "INVALID_RESPONSE" | "UNAVAILABLE") {
    super(code === "INVALID_CONFIGURATION" ? "A origem configurada para o serviço não é válida." : "Não foi possível carregar os dados do serviço.");
    this.name = "MongoReadError";
  }
}

const MONGO_ORIGIN = "https://acta-mongo-api.onrender.com";
const FORM_TYPES = ["ANALISE_FENOMENO", "PARETO", "ISHIKAWA", "PLANO_ACAO", "TREINAMENTO", "PADRONIZACAO", "CHECKLIST"] as const;
const FORM_STATUSES = ["RASCUNHO", "ATIVO", "INATIVO"] as const;
const ANSWER_TYPES = ["TEXTO", "RADIO", "CHECKBOX", "DATA", "EMAIL", "NUMERO_INTEIRO", "NUMERO_DECIMAL", "RANGE", "TELEFONE", "SIM_NAO", "CPF", "ARQUIVO", "CEP"] as const;
const ISHIKAWA_CATEGORIES = ["METODO", "MAO_DE_OBRA", "MAQUINA", "MATERIAL", "MEDICAO", "MEIO_AMBIENTE"] as const;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function requiredText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function validBaseUrl(): URL {
  try {
    const configured = env.apiMongoUrl;
    if (!configured || configured.trim() !== configured) throw new Error();
    const url = new URL(configured);
    if (url.protocol !== "https:" || url.origin !== MONGO_ORIGIN || url.username || url.password || /[?#]/.test(configured) || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) throw new Error();
    return url;
  } catch {
    throw new MongoReadError("INVALID_CONFIGURATION");
  }
}

function readNumericId(value: unknown): number {
  if (!positiveId(value)) throw new MongoReadError("INVALID_INPUT");
  return value;
}

function readUuid(value: unknown): string {
  if (!validUuid(value)) throw new MongoReadError("INVALID_INPUT");
  return value;
}

function endpointUrl(path: string): URL {
  const base = validBaseUrl();
  const url = new URL(`/api/v1${path}`, base.origin);
  if (url.origin !== MONGO_ORIGIN || url.pathname !== `/api/v1${path}` || url.search || url.hash) throw new MongoReadError("INVALID_INPUT");
  return url;
}

async function get(path: string, signal?: AbortSignal): Promise<unknown> {
  const url = endpointUrl(path);
  try {
    return await httpClient<unknown>(url, { method: "GET", ...(signal ? { signal } : {}) });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new MongoReadError("UNAVAILABLE");
  }
}

function parseArray<T>(value: unknown, parseItem: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new MongoReadError("INVALID_RESPONSE");
  try { return value.map(parseItem); } catch { throw new MongoReadError("INVALID_RESPONSE"); }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every(requiredText)) throw new MongoReadError("INVALID_RESPONSE");
  return value;
}

function parseNullableStringArray(value: unknown): string[] | null {
  return value === null ? null : parseStringArray(value);
}

function parsePergunta(value: unknown): PerguntaFormularioMongo {
  if (!isRecord(value) || !validUuid(value.id) || !requiredText(value.titulo) || !ANSWER_TYPES.includes(value.tipo as TipoRespostaMongo) || typeof value.obrigatoria !== "boolean") throw new MongoReadError("INVALID_RESPONSE");
  return { id: value.id, titulo: value.titulo, tipo: value.tipo as TipoRespostaMongo, obrigatoria: value.obrigatoria, opcoes: parseNullableStringArray(value.opcoes) };
}

function parseFormulario(value: unknown): FormularioMongo {
  if (!isRecord(value) || !validUuid(value.id) || !positiveId(value.idEmpresa) || !positiveId(value.idCiclo) || !requiredText(value.titulo) || !FORM_TYPES.includes(value.tipo as TipoFormularioMongo) || !FORM_STATUSES.includes(value.status as StatusFormularioMongo)) throw new MongoReadError("INVALID_RESPONSE");
  return { id: value.id, idEmpresa: value.idEmpresa, idCiclo: value.idCiclo, titulo: value.titulo, tipo: value.tipo as TipoFormularioMongo, status: value.status as StatusFormularioMongo, perguntas: parseArray(value.perguntas, parsePergunta) };
}

function parseCausa(value: unknown): CausaIshikawaMongo {
  if (!isRecord(value) || !validUuid(value.id) || !ISHIKAWA_CATEGORIES.includes(value.categoria as CategoriaIshikawaMongo) || !requiredText(value.descricao)) throw new MongoReadError("INVALID_RESPONSE");
  return { id: value.id, categoria: value.categoria as CategoriaIshikawaMongo, descricao: value.descricao };
}

function parseIshikawa(value: unknown): IshikawaMongo {
  if (!isRecord(value) || !validUuid(value.id) || !positiveId(value.idEmpresa) || !positiveId(value.idCiclo) || !requiredText(value.problema)) throw new MongoReadError("INVALID_RESPONSE");
  return { id: value.id, idEmpresa: value.idEmpresa, idCiclo: value.idCiclo, problema: value.problema, causas: parseArray(value.causas, parseCausa) };
}

function parsePorque(value: unknown): PorqueMongo {
  if (!isRecord(value) || typeof value.ordem !== "number" || !Number.isSafeInteger(value.ordem) || value.ordem < 1 || !requiredText(value.pergunta) || !requiredText(value.resposta)) throw new MongoReadError("INVALID_RESPONSE");
  return { ordem: value.ordem, pergunta: value.pergunta, resposta: value.resposta };
}

function parseCincoPorques(value: unknown): CincoPorquesMongo {
  if (!isRecord(value) || !validUuid(value.id) || !validUuid(value.idIshikawa) || !requiredText(value.hipotese)) throw new MongoReadError("INVALID_RESPONSE");
  return { id: value.id, idIshikawa: value.idIshikawa, hipotese: value.hipotese, porques: parseArray(value.porques, parsePorque) };
}

function parseLicao(value: unknown): LicaoAprendidaMongo {
  if (!isRecord(value) || !validUuid(value.id) || !positiveId(value.idEmpresa) || !positiveId(value.idCiclo) || !requiredText(value.titulo) || !requiredText(value.licao)) throw new MongoReadError("INVALID_RESPONSE");
  return { id: value.id, idEmpresa: value.idEmpresa, idCiclo: value.idCiclo, titulo: value.titulo, licao: value.licao, tags: parseNullableStringArray(value.tags) };
}

export async function listarFormulariosMongo(idCiclo: number, signal?: AbortSignal): Promise<FormularioMongo[]> {
  const id = readNumericId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/formularios`, signal), parseFormulario);
}

export async function obterFormularioMongo(idFormulario: string, signal?: AbortSignal): Promise<FormularioMongo> {
  const id = readUuid(idFormulario);
  return parseFormulario(await get(`/formularios/${id}`, signal));
}

export async function listarIshikawasMongo(idCiclo: number, signal?: AbortSignal): Promise<IshikawaMongo[]> {
  const id = readNumericId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/ishikawas`, signal), parseIshikawa);
}

export async function listarCincoPorquesMongo(idIshikawa: string, signal?: AbortSignal): Promise<CincoPorquesMongo[]> {
  const id = readUuid(idIshikawa);
  return parseArray(await get(`/ishikawas/${id}/cinco-porques`, signal), parseCincoPorques);
}

export async function listarLicoesAprendidasMongo(idCiclo: number, signal?: AbortSignal): Promise<LicaoAprendidaMongo[]> {
  const id = readNumericId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/licoes-aprendidas`, signal), parseLicao);
}

import { env } from "../../../config/env";
import { httpClient } from "../../http/client";

export type StatusCicloPg = "PLANEJAMENTO" | "EXECUCAO" | "VERIFICACAO" | "PADRONIZACAO" | "CONCLUIDO" | "CANCELADO" | "PAUSADO";
export type StatusTarefaPg = "PENDENTE" | "EM_ANDAMENTO" | "BLOQUEADA" | "CONCLUIDA" | "ATRASADA" | "CANCELADA";
export type StatusPlanoAcaoPg = "RASCUNHO" | "APROVADO" | "EM_EXECUCAO" | "CONCLUIDO" | "CANCELADO";
export type StatusMetaPg = "NAO_INICIADA" | "EM_ANDAMENTO" | "ATINGIDA" | "PARCIALMENTE_ATINGIDA" | "NAO_ATINGIDA" | "CANCELADA";
export type StatusVerificacaoPg = "NAO_VERIFICADO" | "APROVADO" | "PARCIAL" | "REPROVADO";
export type StatusProblemaPg = "ABERTO" | "EM_ANALISE" | "PRIORIZADO" | "RESOLVIDO" | "DESCARTADO";
export type OrigemProblemaPg = "MANUAL" | "IA" | "FORMULARIO" | "IMPORTACAO" | "SISTEMA";
export type TipoEfeitoPg = "POSITIVO" | "NEGATIVO";
export type PrioridadeTarefaPg = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type CicloPg = { id: number; titulo: string; status: StatusCicloPg; dataInicio: string | null; dataEstimadaFim: string | null; idEmpresa: number };
export type TarefaPg = { id: number; titulo: string; status: StatusTarefaPg };
export type TarefaDoPlanoPg = {
  id: number;
  titulo: string;
  descricao: string | null;
  status: StatusTarefaPg;
  dataInicioReal: string | null;
  dataFimPrevista: string | null;
  dataFimReal: string | null;
  idPlanoAcao: number;
  idResponsavel: number | null;
  nomeResponsavel: string | null;
};
export type UsuarioDoCicloPg = { idUsuario: number; idCiclo: number; nomeUsuario: string };
export type UsuarioDaEmpresaPg = { id: number; nome: string; idEmpresa: number; status: "ATIVO" };
export type TarefaReadbackEsperadaPg = { id: number; titulo: string; descricao: string; prioridade: PrioridadeTarefaPg; dataFimPrevista: string; idResponsavel: number };
type TarefaReadbackPg = Omit<TarefaReadbackEsperadaPg, "dataFimPrevista"> & { dataFimPrevista: string | null; idPlanoAcao: number; status: StatusTarefaPg; dataInicioReal: string | null; dataFimReal: string | null; nomeResponsavel: string | null };
export type PlanoAcaoPg = { id: number; nome: string; status: StatusPlanoAcaoPg; idCiclo: number };
export type MetaPg = { id: number; objetivo: string; status: StatusMetaPg; idCiclo: number; valorBase: number | null; valorAlvo: number | null; unidadeMedida: string | null; prazo: string | null };
export type EfeitoSecundarioPg = { id: number; descricao: string | null; peso: number | null; impactoEstimado: string | null; idVerificacaoResultado: number; tipo: TipoEfeitoPg | null; criadoEm: string | null; atualizadoEm: string | null };
export type VerificacaoPg = { id: number; status: StatusVerificacaoPg; idCiclo: number; resumo: string | null; observacao: string | null; criadoEm: string | null; efeitosSecundarios: readonly EfeitoSecundarioPg[] };
export type ResumoProblemaPg = { id: number; titulo: string; peso: number | null; status: StatusProblemaPg | null; origem: OrigemProblemaPg | null; criadoEm: string | null };
export type ProblemaPg = ResumoProblemaPg & { descricao: string | null; persistente: boolean | null; idProblemaPai: number | null; idCiclo: number; subProblemas: readonly ResumoProblemaPg[]; atualizadoEm: string | null };
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
const TASK_STATUSES_DO = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "BLOQUEADA", "ATRASADA", "CANCELADA"] as const;
const TASK_PRIORITIES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
const PLAN_STATUSES = ["RASCUNHO", "APROVADO", "EM_EXECUCAO", "CONCLUIDO", "CANCELADO"] as const;
const GOAL_STATUSES = ["NAO_INICIADA", "EM_ANDAMENTO", "ATINGIDA", "PARCIALMENTE_ATINGIDA", "NAO_ATINGIDA", "CANCELADA"] as const;
const VERIFICATION_STATUSES = ["NAO_VERIFICADO", "APROVADO", "PARCIAL", "REPROVADO"] as const;
const PROBLEM_STATUSES = ["ABERTO", "EM_ANALISE", "PRIORIZADO", "RESOLVIDO", "DESCARTADO"] as const;
const PROBLEM_ORIGINS = ["MANUAL", "IA", "FORMULARIO", "IMPORTACAO", "SISTEMA"] as const;
const EFFECT_TYPES = ["POSITIVO", "NEGATIVO"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isTaskPriority(value: unknown): value is PrioridadeTarefaPg {
  return TASK_PRIORITIES.some((prioridade) => prioridade === value);
}

function requiredText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function nullableText(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function nullableNumber(value: unknown): value is number | null {
  return value === null || finiteNumber(value);
}

function validTimestamp(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  const [year, month, day, hour, minute, second] = value.slice(0, 19).split(/[-T:]/).map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    && hour < 24 && minute < 60 && second < 60
    && (value.endsWith("Z") || (Number(value.slice(-5, -3)) <= 18 && Number(value.slice(-2)) < 60
      && (Number(value.slice(-5, -3)) !== 18 || Number(value.slice(-2)) === 0)))
    && Number.isFinite(Date.parse(value));
}

function validWeight(value: unknown): value is number | null {
  return value === null || (finiteNumber(value) && value >= 0 && value <= 1);
}

function uniqueIds<T extends { id: number }>(items: T[]): T[] {
  if (new Set(items.map((item) => item.id)).size !== items.length) throw new PgReadError("INVALID_RESPONSE");
  return items;
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

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [ano, mes, dia] = value.split("-").map(Number);
  const data = new Date(0);
  data.setUTCFullYear(ano, mes - 1, dia);
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

function validDataTarefa(value: unknown): value is string | null {
  return value === null || validDataCiclo(value) || validIsoDate(value);
}

function parseCiclo(value: unknown, idEmpresaEsperada: number): CicloPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo) || !CYCLE_STATUSES.includes(value.status as StatusCicloPg) || !positiveId(value.idEmpresa) || value.idEmpresa !== idEmpresaEsperada || !validDataCiclo(value.dataInicio) || !validDataCiclo(value.dataEstimadaFim)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, titulo: value.titulo, status: value.status as StatusCicloPg, dataInicio: value.dataInicio, dataEstimadaFim: value.dataEstimadaFim, idEmpresa: value.idEmpresa };
}

function parseTarefa(value: unknown): TarefaPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo) || !TASK_STATUSES.includes(value.status as StatusTarefaPg)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, titulo: value.titulo, status: value.status as StatusTarefaPg };
}

function parseTarefaDoPlano(value: unknown): TarefaDoPlanoPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo)
    || !nullableText(value.descricao) || !TASK_STATUSES_DO.includes(value.status as StatusTarefaPg)
    || !validDataTarefa(value.dataInicioReal) || !validDataTarefa(value.dataFimPrevista) || !validDataTarefa(value.dataFimReal)
    || !positiveId(value.idPlanoAcao) || (value.idResponsavel !== null && !positiveId(value.idResponsavel))
    || !nullableText(value.nomeResponsavel)) throw new PgReadError("INVALID_RESPONSE");
  return {
    id: value.id, titulo: value.titulo, descricao: value.descricao, status: value.status as StatusTarefaPg,
    dataInicioReal: value.dataInicioReal, dataFimPrevista: value.dataFimPrevista, dataFimReal: value.dataFimReal,
    idPlanoAcao: value.idPlanoAcao, idResponsavel: value.idResponsavel as number | null,
    nomeResponsavel: value.nomeResponsavel,
  };
}

function parseTarefaReadback(value: unknown): TarefaReadbackPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo) || !requiredText(value.descricao)
    || !isTaskPriority(value.prioridade) || !TASK_STATUSES_DO.includes(value.status as StatusTarefaPg)
    || !validDataTarefa(value.dataInicioReal) || !validDataTarefa(value.dataFimPrevista) || !validDataTarefa(value.dataFimReal)
    || !positiveId(value.idPlanoAcao) || !positiveId(value.idResponsavel)
    || !nullableText(value.nomeResponsavel)) throw new PgReadError("INVALID_RESPONSE");
  return {
    id: value.id, titulo: value.titulo, descricao: value.descricao, prioridade: value.prioridade,
    dataFimPrevista: value.dataFimPrevista, idResponsavel: value.idResponsavel,
    idPlanoAcao: value.idPlanoAcao, status: value.status as StatusTarefaPg,
    dataInicioReal: value.dataInicioReal, dataFimReal: value.dataFimReal, nomeResponsavel: value.nomeResponsavel,
  };
}

function parsePlano(value: unknown): PlanoAcaoPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.nome) || !positiveId(value.idCiclo) || !PLAN_STATUSES.includes(value.status as StatusPlanoAcaoPg)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, nome: value.nome, status: value.status as StatusPlanoAcaoPg, idCiclo: value.idCiclo };
}

function parseMeta(value: unknown, idCiclo: number): MetaPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.objetivo) || value.idCiclo !== idCiclo || !nullableNumber(value.valorBase) || !nullableNumber(value.valorAlvo) || !GOAL_STATUSES.includes(value.status as StatusMetaPg) || !nullableText(value.unidadeMedida) || !validDataCiclo(value.prazo)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, objetivo: value.objetivo, status: value.status as StatusMetaPg, idCiclo, valorBase: value.valorBase, valorAlvo: value.valorAlvo, unidadeMedida: value.unidadeMedida, prazo: value.prazo };
}

function parseEfeito(value: unknown, idVerificacao: number): EfeitoSecundarioPg {
  if (!isRecord(value) || !positiveId(value.id) || value.idVerificacaoResultado !== idVerificacao || !nullableText(value.descricao) || !nullableNumber(value.peso) || !nullableText(value.impactoEstimado) || (value.tipo !== null && !EFFECT_TYPES.includes(value.tipo as TipoEfeitoPg)) || !validTimestamp(value.criadoEm) || !validTimestamp(value.atualizadoEm)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, descricao: value.descricao, peso: value.peso, impactoEstimado: value.impactoEstimado, idVerificacaoResultado: idVerificacao, tipo: value.tipo as TipoEfeitoPg | null, criadoEm: value.criadoEm, atualizadoEm: value.atualizadoEm };
}

function parseVerificacao(value: unknown, idCiclo: number): VerificacaoPg {
  if (!isRecord(value) || !positiveId(value.id) || value.idCiclo !== idCiclo || !VERIFICATION_STATUSES.includes(value.status as StatusVerificacaoPg) || !nullableText(value.resumo) || !nullableText(value.observacao) || !validTimestamp(value.criadoEm)) throw new PgReadError("INVALID_RESPONSE");
  const id = value.id;
  const efeitosSecundarios = uniqueIds(parseArray(value.efeitosSecundarios, (item) => parseEfeito(item, id)));
  return { id, status: value.status as StatusVerificacaoPg, idCiclo, resumo: value.resumo, observacao: value.observacao, criadoEm: value.criadoEm, efeitosSecundarios };
}

function parseResumoProblema(value: unknown): ResumoProblemaPg {
  if (!isRecord(value) || !positiveId(value.id) || !requiredText(value.titulo) || !validWeight(value.peso) || (value.status !== null && !PROBLEM_STATUSES.includes(value.status as StatusProblemaPg)) || (value.origem !== null && !PROBLEM_ORIGINS.includes(value.origem as OrigemProblemaPg)) || !validTimestamp(value.criadoEm)) throw new PgReadError("INVALID_RESPONSE");
  return { id: value.id, titulo: value.titulo, peso: value.peso, status: value.status as StatusProblemaPg | null, origem: value.origem as OrigemProblemaPg | null, criadoEm: value.criadoEm };
}

function parseProblema(value: unknown, idCiclo: number): ProblemaPg {
  const resumo = parseResumoProblema(value);
  if (!isRecord(value) || value.idCiclo !== idCiclo || !nullableText(value.descricao) || (value.persistente !== null && typeof value.persistente !== "boolean") || (value.idProblemaPai !== null && !positiveId(value.idProblemaPai)) || value.idProblemaPai === resumo.id || !validTimestamp(value.atualizadoEm)) throw new PgReadError("INVALID_RESPONSE");
  const subProblemas = uniqueIds(parseArray(value.subProblemas, parseResumoProblema));
  if (subProblemas.some((item) => item.id === resumo.id || item.id === value.idProblemaPai)) throw new PgReadError("INVALID_RESPONSE");
  return { ...resumo, descricao: value.descricao, persistente: value.persistente, idProblemaPai: value.idProblemaPai as number | null, idCiclo, subProblemas, atualizadoEm: value.atualizadoEm };
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
  return uniqueIds(parseArray(await get(`/ciclo/${id}/plano-acao`, signal), (item) => {
    const plano = parsePlano(item);
    if (plano.idCiclo !== id) throw new PgReadError("INVALID_RESPONSE");
    return plano;
  }));
}

export async function listarTarefasPorPlanoPg(idPlanoAcao: number, signal?: AbortSignal): Promise<TarefaDoPlanoPg[]> {
  const id = readId(idPlanoAcao);
  const tarefas = uniqueIds(parseArray(await get(`/plano-acao/${id}/tarefa`, signal), parseTarefaDoPlano));
  if (tarefas.some((tarefa) => tarefa.idPlanoAcao !== id)) throw new PgReadError("INVALID_RESPONSE");
  return tarefas;
}

export async function listarUsuariosDoCicloPg(idCiclo: number, signal?: AbortSignal): Promise<UsuarioDoCicloPg[]> {
  const id = readId(idCiclo);
  const usuarios = parseArray(await get(`/ciclo/${id}/usuario`, signal), (value): UsuarioDoCicloPg => {
    if (!isRecord(value) || !positiveId(value.idUsuario) || value.idCiclo !== id || !requiredText(value.nomeUsuario)) throw new PgReadError("INVALID_RESPONSE");
    return { idUsuario: value.idUsuario, idCiclo: id, nomeUsuario: value.nomeUsuario.trim() };
  });
  if (new Set(usuarios.map((usuario) => usuario.idUsuario)).size !== usuarios.length) throw new PgReadError("INVALID_RESPONSE");
  return usuarios;
}

export async function listarUsuariosDaEmpresaPg(idEmpresa: number, signal?: AbortSignal): Promise<UsuarioDaEmpresaPg[]> {
  const id = readId(idEmpresa);
  return uniqueIds(parseArray(await get("/usuario/empresa", signal), (value): UsuarioDaEmpresaPg => {
    if (!isRecord(value) || !positiveId(value.id) || value.idEmpresa !== id || !requiredText(value.nome) || value.status !== "ATIVO") throw new PgReadError("INVALID_RESPONSE");
    return { id: value.id, nome: value.nome.trim(), idEmpresa: id, status: "ATIVO" };
  }));
}

export async function confirmarTarefaPorPlanoPg(idPlanoAcao: number, esperada: TarefaReadbackEsperadaPg, signal?: AbortSignal): Promise<TarefaDoPlanoPg> {
  const idPlano = readId(idPlanoAcao);
  if (!positiveId(esperada.id) || !requiredText(esperada.titulo) || !requiredText(esperada.descricao)
    || !isTaskPriority(esperada.prioridade) || !validIsoDate(esperada.dataFimPrevista) || !positiveId(esperada.idResponsavel)) throw new PgReadError("INVALID_INPUT");
  const tarefas = parseArray(await get(`/plano-acao/${idPlano}/tarefa`, signal), parseTarefaReadback);
  if (new Set(tarefas.map((tarefa) => tarefa.id)).size !== tarefas.length || tarefas.some((tarefa) => tarefa.idPlanoAcao !== idPlano)) throw new PgReadError("INVALID_RESPONSE");
  const tarefa = tarefas.find((item) => item.id === esperada.id);
  const [ano, mes, dia] = esperada.dataFimPrevista.split("-");
  const dataLegada = `${dia}/${mes}/${ano}`;
  if (!tarefa || tarefa.id !== esperada.id || tarefa.idPlanoAcao !== idPlano || tarefa.status !== "PENDENTE"
    || tarefa.titulo !== esperada.titulo || tarefa.descricao !== esperada.descricao || tarefa.prioridade !== esperada.prioridade
    || (tarefa.dataFimPrevista !== esperada.dataFimPrevista && tarefa.dataFimPrevista !== dataLegada)
    || tarefa.idResponsavel !== esperada.idResponsavel) throw new PgReadError("INVALID_RESPONSE");
  return tarefa;
}

export async function listarCausasRaizPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<CausaRaizPg[]> {
  const id = readId(idCiclo);
  return parseArray(await get(`/ciclos/${id}/causas-raiz`, signal), parseCausa);
}

export async function listarMetasPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<MetaPg[]> {
  const id = readId(idCiclo);
  return uniqueIds(parseArray(await get(`/ciclos/${id}/meta`, signal), (item) => parseMeta(item, id)));
}

export async function listarVerificacoesPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<VerificacaoPg[]> {
  const id = readId(idCiclo);
  return uniqueIds(parseArray(await get(`/ciclos/${id}/verificacoes`, signal), (item) => parseVerificacao(item, id)));
}

export async function listarProblemasPorCicloPg(idCiclo: number, signal?: AbortSignal): Promise<ProblemaPg[]> {
  const id = readId(idCiclo);
  const problemas = uniqueIds(parseArray(await get(`/ciclo/${id}/problema`, signal), (item) => parseProblema(item, id)));
  const porId = new Map(problemas.map((item) => [item.id, item]));
  const paisPorFilho = new Map<number, number>();
  for (const problema of problemas) {
    for (const filho of problema.subProblemas) {
      const completo = porId.get(filho.id);
      const paiConhecido = paisPorFilho.get(filho.id);
      if ((paiConhecido !== undefined && paiConhecido !== problema.id) || (completo && (completo.idProblemaPai !== problema.id || completo.titulo !== filho.titulo || completo.peso !== filho.peso || completo.status !== filho.status || completo.origem !== filho.origem || completo.criadoEm !== filho.criadoEm))) throw new PgReadError("INVALID_RESPONSE");
      paisPorFilho.set(filho.id, problema.id);
    }
    const vistos = new Set<number>([problema.id]);
    let pai = problema.idProblemaPai;
    while (pai !== null) {
      if (vistos.has(pai)) throw new PgReadError("INVALID_RESPONSE");
      vistos.add(pai);
      const ancestral = porId.get(pai);
      if (!ancestral || !ancestral.subProblemas.some((item) => item.id === problema.id || vistos.has(item.id))) throw new PgReadError("INVALID_RESPONSE");
      pai = ancestral.idProblemaPai;
    }
  }
  return problemas;
}

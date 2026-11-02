import { env } from "../../../config/env";
import { ApiError, httpClient } from "../../http/client";
import type { PrioridadeTarefaPg, StatusVerificacaoPg } from "./dashboard.read.api";

const PG_ORIGIN = "https://acta-pg-api.34-232-250-240.sslip.io";
const STATUS_VERIFICACAO = ["NAO_VERIFICADO", "APROVADO", "PARCIAL", "REPROVADO"] as const;

export type NovoProblemaPg = { titulo: string; descricao: string; pesoPercentual: number; persistente: boolean };
export type AlteracaoProblemaPg = { titulo: string; descricao: string; pesoPercentual: number };
export type NovaMetaPg = { objetivo: string; valorBase: number | null; valorAlvo: number | null; unidadeMedida: string | null; prazo: string; prioridade: PrioridadeTarefaPg; area: string | null; categoria: string | null; responsaveis: number[] };
export type NovaVerificacaoPg = { status: StatusVerificacaoPg; resumo: string; observacao: string };
export type NovaTarefaPg = { titulo: string; descricao: string; prioridade: PrioridadeTarefaPg; dataFimPrevista: string; idResponsavel: number };
export type TarefaCriadaPg = NovaTarefaPg & { id: number; idPlanoAcao: number; status: "PENDENTE" };
export type ProblemaCriadoPg = {
  id: number;
  idCiclo: number;
  titulo: string;
  descricao: string;
  peso: number;
  origem: "MANUAL";
  persistente: boolean;
  status: "ABERTO";
};
export type VerificacaoCriadaPg = { id: number; idCiclo: number; status: StatusVerificacaoPg; resumo: string; observacao: string | null };

export class PdcaWriteError extends Error {
  constructor(readonly code: "INVALID_CONFIGURATION" | "INVALID_INPUT" | "INVALID_RESPONSE") {
    super("Não foi possível validar a solicitação.");
    this.name = "PdcaWriteError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function nullableText(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStatusVerificacao(value: unknown): value is StatusVerificacaoPg {
  return STATUS_VERIFICACAO.some((status) => status === value);
}

const PRIORIDADES_TAREFA = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;

function isPrioridadeTarefa(value: unknown): value is PrioridadeTarefaPg {
  return PRIORIDADES_TAREFA.some((prioridade) => prioridade === value);
}

function dataIsoFuturaValida(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [ano, mes, dia] = value.split("-").map(Number);
  const data = new Date(0);
  data.setUTCFullYear(ano, mes - 1, dia);
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return false;
  const hoje = new Date();
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  return value > hojeIso;
}

function dataRespostaConfere(value: unknown, dataIso: string): boolean {
  const [ano, mes, dia] = dataIso.split("-");
  return value === dataIso || value === `${dia}/${mes}/${ano}`;
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
    throw new PdcaWriteError("INVALID_CONFIGURATION");
  }
}

function readId(value: number): number {
  if (!positiveId(value)) throw new PdcaWriteError("INVALID_INPUT");
  return value;
}

function endpointUrl(path: string): URL {
  const base = validBaseUrl();
  const url = new URL(`/api/v1${path}`, base.origin);
  if (url.origin !== PG_ORIGIN || url.pathname !== `/api/v1${path}` || url.search || url.hash) throw new PdcaWriteError("INVALID_INPUT");
  return url;
}

async function post(path: string, body: unknown, signal: AbortSignal): Promise<unknown> {
  try {
    return await httpClient<unknown>(endpointUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
      retryOnUnauthorized: false,
      expectedStatus: 201,
    });
  } catch (error) {
    if (error instanceof ApiError || (error instanceof DOMException && error.name === "AbortError")) throw error;
    throw new PdcaWriteError("INVALID_RESPONSE");
  }
}

function parseProblema(value: unknown, idCiclo: number, dados: NovoProblemaPg): ProblemaCriadoPg {
  if (!isRecord(value)) throw new PdcaWriteError("INVALID_RESPONSE");
  const id = value.id;
  const titulo = value.titulo;
  const descricao = value.descricao;
  const peso = value.peso;
  if (!positiveId(id) || value.idCiclo !== idCiclo || value.status !== "ABERTO"
    || typeof titulo !== "string" || titulo !== dados.titulo || typeof descricao !== "string" || descricao !== dados.descricao
    || typeof peso !== "number" || !Number.isFinite(peso) || peso !== dados.pesoPercentual / 100
    || value.origem !== "MANUAL" || value.persistente !== dados.persistente
    || ("idProblemaPai" in value && value.idProblemaPai !== null)) throw new PdcaWriteError("INVALID_RESPONSE");
  return { id, idCiclo, titulo, descricao, peso, origem: "MANUAL", persistente: dados.persistente, status: "ABERTO" };
}

function parseVerificacao(value: unknown, idCiclo: number, dados: NovaVerificacaoPg): VerificacaoCriadaPg {
  if (!isRecord(value)) throw new PdcaWriteError("INVALID_RESPONSE");
  const id = value.id;
  const status = value.status;
  const resumo = value.resumo;
  const observacao = value.observacao;
  const resumoEsperado = dados.resumo.trim();
  const observacaoEsperada = dados.observacao.trim();
  const observacaoConfere = observacao === observacaoEsperada || (!observacaoEsperada && (observacao === null || observacao === ""));
  if (!positiveId(id) || value.idCiclo !== idCiclo || !isStatusVerificacao(status) || status !== dados.status
    || typeof resumo !== "string" || resumo !== resumoEsperado || !nullableText(observacao) || !observacaoConfere) {
    throw new PdcaWriteError("INVALID_RESPONSE");
  }
  return { id, idCiclo, status, resumo, observacao };
}

export async function criarProblemaPg(idCiclo: number, dados: NovoProblemaPg, signal: AbortSignal): Promise<ProblemaCriadoPg> {
  const id = readId(idCiclo);
  if (!dados.titulo.trim() || dados.titulo.trim().length > 160 || dados.titulo !== dados.titulo.trim()
    || !dados.descricao.trim() || dados.descricao.trim().length > 1000 || dados.descricao !== dados.descricao.trim()
    || !Number.isSafeInteger(dados.pesoPercentual) || dados.pesoPercentual < 0 || dados.pesoPercentual > 100
    || typeof dados.persistente !== "boolean") throw new PdcaWriteError("INVALID_INPUT");
  const body = {
    titulo: dados.titulo,
    descricao: dados.descricao,
    peso: dados.pesoPercentual / 100,
    origem: "MANUAL" as const,
    persistente: dados.persistente,
  };
  return parseProblema(await post(`/ciclos/${id}/problema`, body, signal), id, dados);
}

export async function atualizarProblemaPg(idProblema: number, idCiclo: number, dados: AlteracaoProblemaPg, signal: AbortSignal): Promise<void> {
  const id = readId(idProblema);
  readId(idCiclo);
  if (!dados.titulo.trim() || dados.titulo !== dados.titulo.trim() || dados.titulo.length > 160
    || !dados.descricao.trim() || dados.descricao !== dados.descricao.trim() || dados.descricao.length > 1000
    || !Number.isSafeInteger(dados.pesoPercentual) || dados.pesoPercentual < 0 || dados.pesoPercentual > 100) throw new PdcaWriteError("INVALID_INPUT");
  const body = { titulo: dados.titulo, descricao: dados.descricao, peso: dados.pesoPercentual / 100 };
  const value: unknown = await httpClient<unknown>(endpointUrl(`/problema/${id}`), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal, retryOnUnauthorized: false,
  });
  if (!isRecord(value) || value.id !== id || value.idCiclo !== idCiclo || value.titulo !== body.titulo
    || value.descricao !== body.descricao || value.peso !== body.peso || value.status !== "ABERTO") throw new PdcaWriteError("INVALID_RESPONSE");
}

export async function atualizarDescricaoCausaPg(idCausa: number, idCiclo: number, descricao: string, signal: AbortSignal): Promise<void> {
  const id = readId(idCausa);
  readId(idCiclo);
  if (!descricao.trim() || descricao !== descricao.trim() || descricao.length > 1000) throw new PdcaWriteError("INVALID_INPUT");
  const value: unknown = await httpClient<unknown>(endpointUrl(`/causas-raiz/${id}`), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ descricao }), signal, retryOnUnauthorized: false,
  });
  if (!isRecord(value) || value.id !== id || value.idCiclo !== idCiclo || value.descricao !== descricao) throw new PdcaWriteError("INVALID_RESPONSE");
}

export async function atualizarMetaPg(idMeta: number, idCiclo: number, objetivo: string, valorAlvo: number | null, signal: AbortSignal): Promise<void> {
  const id = readId(idMeta);
  readId(idCiclo);
  if (!objetivo.trim() || objetivo !== objetivo.trim() || objetivo.length > 1000 || (valorAlvo !== null && (!Number.isFinite(valorAlvo) || valorAlvo <= 0 || valorAlvo >= 1e13 || Math.abs(valorAlvo * 100 - Math.round(valorAlvo * 100)) > 1e-7))) throw new PdcaWriteError("INVALID_INPUT");
  const body = valorAlvo === null ? { objetivo } : { objetivo, valorAlvo };
  const value: unknown = await httpClient<unknown>(endpointUrl(`/meta/${id}`), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal, retryOnUnauthorized: false,
  });
  if (!isRecord(value) || value.id !== id || value.idCiclo !== idCiclo || value.objetivo !== objetivo || (valorAlvo !== null && value.valorAlvo !== valorAlvo)) throw new PdcaWriteError("INVALID_RESPONSE");
}

export async function atualizarNomePlanoPg(idPlano: number, idCiclo: number, nome: string, signal: AbortSignal): Promise<void> {
  const id = readId(idPlano);
  readId(idCiclo);
  if (!nome.trim() || nome !== nome.trim() || nome.length > 160) throw new PdcaWriteError("INVALID_INPUT");
  const value: unknown = await httpClient<unknown>(endpointUrl(`/plano-acao/${id}`), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }), signal, retryOnUnauthorized: false,
  });
  if (!isRecord(value) || value.id !== id || value.idCiclo !== idCiclo || value.nome !== nome) throw new PdcaWriteError("INVALID_RESPONSE");
}

export async function criarMetaPg(idPlano: number, idCiclo: number, dados: NovaMetaPg, signal: AbortSignal): Promise<number> {
  const id = readId(idPlano); readId(idCiclo);
  const numeroValido = (valor: number | null, positivo: boolean) => valor === null || (Number.isFinite(valor) && (positivo ? valor > 0 : valor >= 0) && valor < 1e13 && Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-7);
  if (!dados.objetivo.trim() || dados.objetivo !== dados.objetivo.trim() || dados.objetivo.length > 1000 || !numeroValido(dados.valorBase, false) || !numeroValido(dados.valorAlvo, true)
    || (dados.unidadeMedida !== null && dados.unidadeMedida.length > 30) || (dados.area !== null && dados.area.length > 100) || (dados.categoria !== null && dados.categoria.length > 100)
    || !dataIsoFuturaValida(dados.prazo) || !isPrioridadeTarefa(dados.prioridade) || !dados.responsaveis.length || dados.responsaveis.some((item) => !positiveId(item)) || new Set(dados.responsaveis).size !== dados.responsaveis.length) throw new PdcaWriteError("INVALID_INPUT");
  const value = await post(`/plano-acao/${id}/meta`, dados, signal);
  if (!isRecord(value) || !positiveId(value.id) || value.idCiclo !== idCiclo || value.idPlanoAcao !== id || value.objetivo !== dados.objetivo || value.status !== "NAO_INICIADA"
    || value.valorBase !== dados.valorBase || value.valorAlvo !== dados.valorAlvo || value.unidadeMedida !== dados.unidadeMedida || value.area !== dados.area || value.categoria !== dados.categoria || !dataRespostaConfere(value.prazo, dados.prazo) || value.prioridade !== dados.prioridade
    || !Array.isArray(value.responsaveis) || value.responsaveis.length !== dados.responsaveis.length || !value.responsaveis.every((item) => isRecord(item) && positiveId(item.id) && dados.responsaveis.includes(item.id)) || new Set(value.responsaveis.map((item) => isRecord(item) ? item.id : null)).size !== dados.responsaveis.length) throw new PdcaWriteError("INVALID_RESPONSE");
  return value.id;
}

export async function criarVerificacaoPg(idCiclo: number, dados: NovaVerificacaoPg, signal: AbortSignal): Promise<VerificacaoCriadaPg> {
  const id = readId(idCiclo);
  const resumo = dados.resumo.trim();
  const observacao = dados.observacao.trim();
  if (!isStatusVerificacao(dados.status) || !resumo || resumo.length > 1000 || observacao.length > 1000
    || (dados.status !== "APROVADO" && !observacao)) throw new PdcaWriteError("INVALID_INPUT");
  const body = { status: dados.status, resumo, observacao };
  return parseVerificacao(await post(`/ciclos/${id}/verificacoes`, body, signal), id, body);
}

export async function criarTarefaPg(idPlanoAcao: number, dados: NovaTarefaPg, signal: AbortSignal): Promise<TarefaCriadaPg> {
  const idPlano = readId(idPlanoAcao);
  const titulo = dados.titulo;
  const descricao = dados.descricao;
  if (typeof titulo !== "string" || !titulo.trim() || titulo !== titulo.trim() || titulo.length > 160
    || typeof descricao !== "string" || !descricao.trim() || descricao !== descricao.trim() || descricao.length > 1000
    || !isPrioridadeTarefa(dados.prioridade) || !dataIsoFuturaValida(dados.dataFimPrevista)
    || !positiveId(dados.idResponsavel)) throw new PdcaWriteError("INVALID_INPUT");
  const body = { titulo, descricao, prioridade: dados.prioridade, dataFimPrevista: dados.dataFimPrevista, idResponsavel: dados.idResponsavel };
  const value = await post(`/plano-acao/${idPlano}/tarefa`, body, signal);
  if (!isRecord(value) || !positiveId(value.id) || value.idPlanoAcao !== idPlano || value.status !== "PENDENTE"
    || value.titulo !== titulo || value.descricao !== descricao || value.prioridade !== dados.prioridade
    || !dataRespostaConfere(value.dataFimPrevista, dados.dataFimPrevista) || value.idResponsavel !== dados.idResponsavel) {
    throw new PdcaWriteError("INVALID_RESPONSE");
  }
  return { id: value.id, idPlanoAcao: idPlano, titulo, descricao, prioridade: dados.prioridade, dataFimPrevista: dados.dataFimPrevista, idResponsavel: dados.idResponsavel, status: "PENDENTE" };
}

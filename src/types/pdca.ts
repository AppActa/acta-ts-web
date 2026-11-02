export type StatusCicloPg = "PLANEJAMENTO" | "EXECUCAO" | "VERIFICACAO" | "PADRONIZACAO" | "CONCLUIDO" | "CANCELADO" | "PAUSADO";
export type StatusTarefaPg = "PENDENTE" | "EM_ANDAMENTO" | "BLOQUEADA" | "CONCLUIDA" | "ATRASADA" | "CANCELADA";
export type StatusPlanoAcaoPg = "RASCUNHO" | "APROVADO" | "EM_EXECUCAO" | "CONCLUIDO" | "CANCELADO";
export type StatusMetaPg = "NAO_INICIADA" | "EM_ANDAMENTO" | "ATINGIDA" | "PARCIALMENTE_ATINGIDA" | "NAO_ATINGIDA" | "CANCELADA";
export type StatusVerificacaoPg = "NAO_VERIFICADO" | "APROVADO" | "PARCIAL" | "REPROVADO";
export type StatusProblemaPg = "ABERTO" | "EM_ANALISE" | "PRIORIZADO" | "RESOLVIDO" | "DESCARTADO";
export type OrigemProblemaPg = "MANUAL" | "IA" | "FORMULARIO" | "IMPORTACAO" | "SISTEMA";
export type TipoEfeitoPg = "POSITIVO" | "NEGATIVO";
export type PrioridadeTarefaPg = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export interface CicloPg { id: number; titulo: string; status: StatusCicloPg; dataInicio: string | null; dataEstimadaFim: string | null; idEmpresa: number }
export interface TarefaPg { id: number; titulo: string; status: StatusTarefaPg }
export interface TarefaDoPlanoPg {
  id: number;
  prioridade: PrioridadeTarefaPg | null;
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
export interface UsuarioDoCicloPg { idUsuario: number; idCiclo: number; nomeUsuario: string }
export interface ParticipanteTreinamentoPg { idUsuario: number; nomeUsuario: string; status: "PENDENTE" | "CONFIRMADO" | "CONCLUIDO" | "DISPENSADO" | "CANCELADO"; obrigatorio: boolean }
export interface TreinamentoPg { id: number; idCiclo: number; titulo: string; descricao: string; dataTreinamento: string; obrigatorio: boolean; idResponsavel: number; nomeResponsavel: string; participantes: ParticipanteTreinamentoPg[] }
export interface UsuarioDaEmpresaPg { id: number; nome: string; idEmpresa: number; status: "ATIVO" }
export interface TarefaReadbackEsperadaPg { id: number; titulo: string; descricao: string; prioridade: PrioridadeTarefaPg; dataFimPrevista: string; idResponsavel: number }
export interface TarefaReadbackPg extends Omit<TarefaReadbackEsperadaPg, "dataFimPrevista"> {
  dataFimPrevista: string | null;
  idPlanoAcao: number;
  status: StatusTarefaPg;
  dataInicioReal: string | null;
  dataFimReal: string | null;
  nomeResponsavel: string | null;
}
export interface PlanoAcaoPg { id: number; nome: string; status: StatusPlanoAcaoPg; idCiclo: number }
export interface Plano5W2HPg { id: number; idPlanoAcao: number; whatAcao: string; whyJustificativa: string; whereLocal: string; whenInicio: string | null; whenFim: string; howModoExecucao: string; howMuchCusto: number; idWhoResponsavel: number }
export interface MetaPg { id: number; objetivo: string; status: StatusMetaPg; idCiclo: number; valorBase: number | null; valorAlvo: number | null; unidadeMedida: string | null; prazo: string | null }
export interface EfeitoSecundarioPg { id: number; descricao: string | null; peso: number | null; impactoEstimado: string | null; idVerificacaoResultado: number; tipo: TipoEfeitoPg | null; criadoEm: string | null; atualizadoEm: string | null }
export interface VerificacaoPg { id: number; status: StatusVerificacaoPg; idCiclo: number; resumo: string | null; observacao: string | null; criadoEm: string | null; efeitosSecundarios: readonly EfeitoSecundarioPg[] }
export interface ResumoProblemaPg { id: number; titulo: string; peso: number | null; status: StatusProblemaPg | null; origem: OrigemProblemaPg | null; criadoEm: string | null }
export interface ProblemaPg extends ResumoProblemaPg { descricao: string | null; persistente: boolean | null; idProblemaPai: number | null; idCiclo: number; subProblemas: readonly ResumoProblemaPg[]; atualizadoEm: string | null }
export interface CausaRaizPg { id: number; descricao: string; aceita: boolean | null; idCiclo: number }
export interface NovoProblemaPg { titulo: string; descricao: string; pesoPercentual: number; persistente: boolean }
export interface AlteracaoProblemaPg { titulo: string; descricao: string; pesoPercentual: number }
export interface NovaMetaPg {
  objetivo: string;
  valorBase: number | null;
  valorAlvo: number | null;
  unidadeMedida: string | null;
  prazo: string;
  prioridade: PrioridadeTarefaPg;
  area: string | null;
  categoria: string | null;
  responsaveis: number[];
}
export interface NovaVerificacaoPg { status: StatusVerificacaoPg; resumo: string; observacao: string }
export interface NovaTarefaPg { titulo: string; descricao: string; prioridade: PrioridadeTarefaPg; dataFimPrevista: string; idResponsavel: number }
export type EdicaoTarefaPg = Pick<NovaTarefaPg, "titulo" | "descricao" | "prioridade" | "dataFimPrevista">;
export interface NovoTreinamentoPg { titulo: string; descricao: string; dataTreinamento: string; obrigatorio: boolean; idResponsavel: number }
export interface NovoPlano5W2HPg { whatAcao: string; whyJustificativa: string; whereLocal: string; howModoExecucao: string; whenInicio: string | null; whenFim: string; howMuchCusto: number; idWhoResponsavel: number }
export interface TarefaCriadaPg extends NovaTarefaPg { id: number; idPlanoAcao: number; status: "PENDENTE" }
export interface ProblemaCriadoPg {
  id: number;
  idCiclo: number;
  titulo: string;
  descricao: string;
  peso: number;
  origem: "MANUAL";
  persistente: boolean;
  status: "ABERTO";
}
export interface VerificacaoCriadaPg { id: number; idCiclo: number; status: StatusVerificacaoPg; resumo: string; observacao: string | null }

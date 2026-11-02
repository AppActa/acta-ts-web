import type { ReactNode } from "react";
import type { CausaRaizPg, CicloPg, MetaPg, PlanoAcaoPg, ProblemaPg, TarefaDoPlanoPg, VerificacaoPg } from "./pdca";
import type { FormularioMongo } from "./mongo";
export type VarianteMetricaPlanCiclos = "azul" | "ciano" | "laranja" | "verde";
export interface MetricaPlanCiclos { id: string; titulo: string; valor: number | string; contexto: string; variante: VarianteMetricaPlanCiclos }
export interface CausasPorCicloPlan { id: string; ciclo: string; aceitas: number; aguardandoValidacao: number }
export interface CicloEmAcompanhamentoPlan { id: string; ciclo: string; responsavel: string; prazo: string; pendencia: string; status: string; varianteStatus: "andamento" | "atencao" | "revisao" }
export interface DadosPlanTodosCiclos {
  metricas: readonly [MetricaPlanCiclos, MetricaPlanCiclos, MetricaPlanCiclos, MetricaPlanCiclos];
  causasPorCiclo: readonly CausasPorCicloPlan[];
  planosAcao: { total: number; rascunho: number; aprovado: number };
  ciclosAcompanhamento: readonly CicloEmAcompanhamentoPlan[];
}
export interface PlanoAcaoGlobal { ciclo: CicloPg; plano: PlanoAcaoPg; tarefas: readonly TarefaDoPlanoPg[] }
export interface DadosCicloPlanApi {
  ciclo: CicloPg;
  causas: readonly CausaRaizPg[] | null;
  problemas: readonly ProblemaPg[] | null;
  metas: readonly MetaPg[] | null;
  verificacoes: readonly VerificacaoPg[] | null;
  formularios: readonly FormularioMongo[] | null;
  planos: readonly PlanoAcaoGlobal[] | null;
}
export type ResultadoProblemasDoCiclo =
  | { estado: "carregando" | "erro" | "indisponivel" }
  | { estado: "sucesso" | "vazio"; dados: readonly ProblemaPg[] };
export interface ProblemaPlan {
  id: string;
  titulo: string;
  descricao: string | null;
  peso: number | null;
  origem: string;
  persistencia: string;
  subproblemas: readonly { id: string; titulo: string }[];
}
export interface ConteudoProblemasRegistradosProps { resultado: ResultadoProblemasDoCiclo; cicloId: number }
export interface ProblemasDoCicloValidadoProps { idCiclo: number }

export type TipoRegistroPlan = "causa" | "meta" | "plano";
export type TipoListaPlan = "metas" | "planos";
export type TipoInvestigacaoPlan = "ishikawa" | "porques";
export interface ConteudoPlanValidadoProps { idCiclo: number }
export interface CausasDoCicloProps { cicloId: number }
export interface FormularioMetaProps { cicloId: number; cicloAberto: boolean }
export interface ConteudoMetasPlanosProps { cicloId: number; tipo: TipoListaPlan }
export interface PaginaPlanMetasEPlanosProps { tipo: TipoListaPlan }
export interface DetalheProblemaProps { cicloId: number; problemaId: number }
export interface EditorRegistroPlanProps { cicloId: number; registroId: number; tipo: TipoRegistroPlan; cicloAberto: boolean }
export interface PaginaPlanEditarRegistroProps { tipo: TipoRegistroPlan }
export interface ConteudoInvestigacaoPlanProps { cicloId: number; tipo: TipoInvestigacaoPlan }
export interface PaginaPlanInvestigacaoProps { tipo: TipoInvestigacaoPlan }
export interface FormularioEdicaoProblemaProps { cicloId: number; problemaId: number; cicloAberto: boolean }
export interface EditorDadosProblemaProps { problema: ProblemaPg; cicloId: number; voltar: string; cicloAberto: boolean }
export interface FormularioInvestigacaoProps { cicloId: number; investigacaoId?: string; cicloAberto: boolean }

export interface ModalErroPlanProps { titulo: string; mensagem: string; aoFechar: () => void }
export interface CamposCriarProblema { titulo: string; descricao: string; peso: string; persistente: "" | "sim" | "nao" }
export interface DadosEnvioCriarProblema { titulo: string; descricao: string; pesoPercentual: number; persistente: boolean }
export type FeedbackEnvioProblema = { tipo: "erro" | "aviso"; mensagem: string } | null;
export interface FormularioCriarProblemaProps {
  acaoFechar: ReactNode;
  podeEnviar: boolean;
  enviando: boolean;
  mensagemElegibilidade?: string;
  onSubmit: (dados: DadosEnvioCriarProblema) => void;
}

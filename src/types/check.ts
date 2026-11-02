import type { ReactNode } from "react";
import type { CicloPg, MetaPg, StatusVerificacaoPg, VerificacaoPg } from "./pdca";
export type VarianteMetricaCheck = "indicadores" | "metas" | "verificacoes" | "efeitos";
export interface MetricaCheck { id: string; titulo: string; valor: number | string; contexto: string; variante: VarianteMetricaCheck }
export interface ResultadoVerificacaoPorCiclo { id: string; ciclo: string; aprovadas: number; parciais: number; reprovadas: number }
export interface SituacaoMetasCheck { total: number; atingidas: number; emAndamento: number; naoAtingidas: number }
export interface CicloAcompanhamentoCheck { id: string; cicloId: number; ciclo: string; indicador: string; antesAtual: string; meta: string; situacao: string; varianteSituacao: "acompanhar" | "atingida" }
export interface DadosCheckTodosCiclos {
  metricas: readonly [MetricaCheck, MetricaCheck, MetricaCheck, MetricaCheck];
  resultadosPorCiclo: readonly ResultadoVerificacaoPorCiclo[];
  situacaoMetas: SituacaoMetasCheck;
  ciclosAcompanhamento: readonly CicloAcompanhamentoCheck[];
}
export interface DadosCheckDoCiclo { metas: readonly MetaPg[]; verificacoes: readonly VerificacaoPg[] }
export interface DadosCicloCheckApi { ciclo: CicloPg; metas: readonly MetaPg[] | null; verificacoes: readonly VerificacaoPg[] | null }
export interface CheckDoCicloValidadoProps { idCiclo: number }
export interface VerificacaoDoCicloValidadoProps { cicloId: number; verificacaoId: number; acaoFechar: ReactNode }

export interface MetricaCicloCheck { valor: number | null; contexto?: string }
export type SituacaoIndicadorCheck = "atingida" | "acompanhar" | "indisponivel";
export interface ResultadoIndicadorCheck {
  id: string;
  titulo: string;
  antes: number | null;
  atual: number | null;
  meta: number | null;
  unidade: string;
  periodo: string;
  situacao: SituacaoIndicadorCheck;
};
export interface VerificacaoCicloCheck {
  id: string;
  titulo: string;
  detalhe?: string;
  situacao: "registrada" | "acompanhar" | "indisponivel" | "nao-verificado" | "aprovado" | "parcial" | "reprovado";
  data?: string | null;
  acaoDetalhe?: ReactNode;
};
export interface MetaCicloCheck {
  id: string;
  objetivo: string;
  base: number | null;
  alvo: number | null;
  unidade: string | null;
  prazo: string | null;
  status: "NAO_INICIADA" | "EM_ANDAMENTO" | "ATINGIDA" | "PARCIALMENTE_ATINGIDA" | "NAO_ATINGIDA" | "CANCELADA";
};
export interface ComparacaoCicloCheck {
  id: string;
  titulo: string;
  antes: number;
  atual: number;
  unidade: string;
  periodo: string;
  escalaMaxima: number;
};
export interface DadosCicloCheck {
  metricas: {
    indicadores: MetricaCicloCheck;
    metasAtingidas: MetricaCicloCheck;
    verificacoes: MetricaCicloCheck;
    efeitosSecundarios: MetricaCicloCheck;
  };
  resultados: readonly ResultadoIndicadorCheck[] | null;
  metas: readonly MetaCicloCheck[] | null;
  verificacoes: readonly VerificacaoCicloCheck[];
  comparacoes: readonly ComparacaoCicloCheck[] | null;
};
export type EstadoConteudoCicloCheck =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "vazio"; dados?: DadosCicloCheck }
  | { estado: "indisponivel" }
  | { estado: "sucesso"; dados: DadosCicloCheck };
export interface ConteudoCicloCheckProps { resultado?: EstadoConteudoCicloCheck; acaoRegistrar?: ReactNode }
export interface ComparacaoCicloCheckProps { item: ComparacaoCicloCheck }

export interface DadosDetalheVerificacao {
  resumo: string | null;
  observacao: string | null;
  status: StatusVerificacaoPg;
  criadoEm: string | null;
  efeitosSecundarios: readonly {
    id: number;
    descricao: string | null;
    impactoEstimado: string | null;
    tipo: "POSITIVO" | "NEGATIVO" | null;
  }[];
};
export type ResultadoDetalheVerificacao =
  | { estado: "carregando" | "erro" | "nao-encontrado" | "indisponivel" }
  | { estado: "sucesso"; dados: DadosDetalheVerificacao };
export interface DetalheVerificacaoProps { acaoFechar?: ReactNode; resultado?: ResultadoDetalheVerificacao }
export interface DetalheIndicadorProps {
  acaoFechar?: ReactNode;
  estado?: "carregando" | "erro" | "nao-encontrado" | "indisponivel";
}
export interface CamposRegistrarVerificacao { status: StatusVerificacaoPg | ""; resumo: string; observacao: string }
export interface DadosEnvioRegistrarVerificacao { status: StatusVerificacaoPg; resumo: string; observacao: string }
export type FeedbackEnvioFormulario = { tipo: "erro" | "aviso"; mensagem: string } | null;
export interface FormularioRegistrarVerificacaoProps {
  acaoFechar: ReactNode;
  podeEnviar: boolean;
  enviando: boolean;
  feedback: FeedbackEnvioFormulario;
  mensagemElegibilidade?: string;
  onSubmit: (campos: DadosEnvioRegistrarVerificacao) => void;
}

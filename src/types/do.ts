import type { ReactNode } from "react";
import type { CicloPg, PrioridadeTarefaPg, StatusPlanoAcaoPg, TarefaDoPlanoPg } from "./pdca";
export type VarianteMetricaDo = "abertas" | "andamento" | "atrasadas" | "treinamentos";
export interface MetricaDo { id: string; titulo: string; valor: number | string; contexto: string; variante: VarianteMetricaDo }
export interface ExecucaoPorCicloDo { id: string; ciclo: string; concluidas: number; emAndamento: number; pendentes: number; outrosEstados: number }
export interface SituacaoTarefasDo { total: number; concluidas: number; emAndamento: number; pendentes: number; outrosEstados: number }
export interface CicloAcompanhamentoDo { id: string; cicloId: number; tarefa: string; ciclo: string; responsavel: string; prazo: string; status: string; varianteStatus: "andamento" | "atrasada" | "pendente" }
export interface DadosDoTodosCiclos {
  metricas: readonly [MetricaDo, MetricaDo, MetricaDo, MetricaDo];
  execucaoPorCiclo: readonly ExecucaoPorCicloDo[];
  situacaoTarefas: SituacaoTarefasDo;
  ciclosAcompanhamento: readonly CicloAcompanhamentoDo[];
}
export interface TarefaCicloDo { ciclo: CicloPg; tarefa: TarefaDoPlanoPg }

export type { PrioridadeTarefaPg, StatusPlanoAcaoPg, TarefaDoPlanoPg } from "./pdca";
export interface ResumoTarefasDoCicloProps { idCiclo: number }
export interface AbasDoCicloProps { cicloId: number }
export interface AbasTreinamentoProps { cicloId: string | undefined }
export interface PessoaEquipeDo { id: string; nome: string; papel: string; participacao: string; estadoParticipacao?: "ativa" | "pendente" | "neutra" | (string & {}); acesso: string }
export interface PaginaCicloDoEquipeProps { pessoas?: readonly PessoaEquipeDo[] | null }
export interface Treinamento { id: string; titulo: string; responsavel: string; data: string; material: string; status: "andamento" | "concluidos" }
export interface DetalheTarefaDoProps { tarefa: TarefaDoPlanoPg; nomePlano: string; tituloCiclo: string; acaoFechar: ReactNode }
export interface ModalSucessoDoProps { titulo: string; descricao: string; larguraDescricao?: number; topoDescricao?: number; hrefConcluido: string }
export interface PlanoOpcaoCriarTarefaDo { id: number; nome: string; idCiclo: number; status: StatusPlanoAcaoPg }
export interface ResponsavelOpcaoCriarTarefaDo { id: number; nome: string }
export interface DadosEnvioCriarTarefaDo { idPlanoAcao: number; titulo: string; descricao: string; prioridade: PrioridadeTarefaPg; dataFimPrevista: string; idResponsavel: number }
export type FeedbackCriarTarefaDo = { tipo: "erro" | "aviso"; mensagem: string } | null;
export interface FormularioCriarTarefaDoProps {
  planos: readonly PlanoOpcaoCriarTarefaDo[];
  responsaveis: readonly ResponsavelOpcaoCriarTarefaDo[];
  estadoOpcoes: "carregando" | "erro" | "indisponivel" | "sucesso";
  podeEnviar: boolean;
  enviando: boolean;
  feedback: FeedbackCriarTarefaDo;
  mensagemElegibilidade?: string;
  acaoFechar: ReactNode;
  onSubmit: (dados: DadosEnvioCriarTarefaDo) => void;
}

import type { CicloPg, PlanoAcaoPg, TarefaDoPlanoPg } from "./pdca";
import type { FormularioMongo, LicaoAprendidaMongo } from "./mongo";

export interface DetalheCicloAct { destaque: string; descricao: string | null }
export interface ProgressoCicloAct { concluidos: number; total: number }
export interface DadosCicloAct {
  metricas: { itensPadrao: number | null; licoes: number | null };
  documentoPadrao: DetalheCicloAct | null;
  licoesAprendidas: DetalheCicloAct | null;
  progresso: ProgressoCicloAct | null;
};
export type EstadoConteudoCicloAct =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "vazio" }
  | { estado: "indisponivel" }
  | { estado: "sucesso"; dados: DadosCicloAct };
export interface ConteudoCicloActProps { resultado?: EstadoConteudoCicloAct; cicloId?: number }
export interface DetalheCicloActProps { dados: DetalheCicloAct | null | undefined; mensagem: string }
export interface PlanoActGlobal { plano: PlanoAcaoPg; tarefas: readonly TarefaDoPlanoPg[] | null }
export interface DadosCicloActGlobal {
  ciclo: CicloPg;
  planos: readonly PlanoActGlobal[] | null;
  formularios: readonly FormularioMongo[] | null;
  licoes: readonly LicaoAprendidaMongo[] | null;
}

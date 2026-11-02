export type TipoFormularioMongo = "ANALISE_FENOMENO" | "PARETO" | "ISHIKAWA" | "PLANO_ACAO" | "TREINAMENTO" | "PADRONIZACAO" | "CHECKLIST";
export type StatusFormularioMongo = "RASCUNHO" | "ATIVO" | "INATIVO";
export type TipoRespostaMongo = "TEXTO" | "RADIO" | "CHECKBOX" | "DATA" | "EMAIL" | "NUMERO_INTEIRO" | "NUMERO_DECIMAL" | "RANGE" | "TELEFONE" | "SIM_NAO" | "CPF" | "ARQUIVO" | "CEP";
export type CategoriaIshikawaMongo = "METODO" | "MAO_DE_OBRA" | "MAQUINA" | "MATERIAL" | "MEDICAO" | "MEIO_AMBIENTE";
export interface PerguntaFormularioMongo { id: string; titulo: string; tipo: TipoRespostaMongo; obrigatoria: boolean; opcoes: string[] | null }
export interface FormularioMongo { id: string; idEmpresa: number; idCiclo: number; titulo: string; tipo: TipoFormularioMongo; status: StatusFormularioMongo; perguntas: PerguntaFormularioMongo[] }
export interface CausaIshikawaMongo { id: string; categoria: CategoriaIshikawaMongo; descricao: string }
export interface IshikawaMongo { id: string; idEmpresa: number; idCiclo: number; problema: string; causas: CausaIshikawaMongo[] }
export interface PorqueMongo { ordem: number; pergunta: string; resposta: string }
export interface CincoPorquesMongo { id: string; idIshikawa: string; idCausaIshikawa: string | null; hipotese: string; porques: PorqueMongo[] }
export interface LicaoAprendidaMongo { id: string; idEmpresa: number; idCiclo: number; titulo: string; licao: string; tags: string[] | null; resultado: string | null; area: string | null }

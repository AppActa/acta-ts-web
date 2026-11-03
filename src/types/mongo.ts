export type TipoFormularioMongo = "ANALISE_FENOMENO" | "PARETO" | "ISHIKAWA" | "PLANO_ACAO" | "TREINAMENTO" | "PADRONIZACAO" | "CHECKLIST";
export type StatusFormularioMongo = "RASCUNHO" | "ATIVO" | "INATIVO";
export type TipoRespostaMongo = "TEXTO" | "RADIO" | "CHECKBOX" | "DATA" | "EMAIL" | "NUMERO_INTEIRO" | "NUMERO_DECIMAL" | "RANGE" | "TELEFONE" | "SIM_NAO" | "CPF" | "ARQUIVO" | "CEP";
export type CategoriaIshikawaMongo = "METODO" | "MAO_DE_OBRA" | "MAQUINA" | "MATERIAL" | "MEDICAO" | "MEIO_AMBIENTE";
export interface PerguntaFormularioMongo { id: string; titulo: string; tipo: TipoRespostaMongo; obrigatoria: boolean; opcoes: string[] }
export interface FormularioMongo { id: string; idEmpresa: number; idCiclo: number; titulo: string; descricao: string | null; tipo: TipoFormularioMongo; status: StatusFormularioMongo; perguntas: PerguntaFormularioMongo[]; idIshikawa: string | null; idsUsuariosDestinatarios: number[] }
export interface RespostaPerguntaFormularioMongo { idPergunta: string; resposta: unknown }
export type RespostaPerguntaMongo = RespostaPerguntaFormularioMongo;
export interface RespostaFormularioMongo { id: string; idEmpresa: number; idCiclo: number; idFormulario: string; idUsuario: number; respostas: RespostaPerguntaFormularioMongo[]; respondidoEm: string }
export interface CausaIshikawaMongo { id: string; categoria: CategoriaIshikawaMongo; descricao: string }
export interface IshikawaMongo { id: string; idEmpresa: number; idCiclo: number; problema: string; causas: CausaIshikawaMongo[] }
export interface PorqueMongo { ordem: number; pergunta: string; resposta: string }
export interface CincoPorquesMongo { id: string; idIshikawa: string; idCausaIshikawa: string | null; hipotese: string; porques: PorqueMongo[] }
export interface LicaoAprendidaMongo { id: string; idEmpresa: number; idCiclo: number; titulo: string; licao: string; tags: string[] | null; faseOrigem: string; resultado: string; severidade: string; area: string }

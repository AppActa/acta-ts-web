import type { FormEvent, ReactNode } from "react";

export type NomeIcone = "acessibilidade" | "alto-contraste" | "equipe" | "perfil" | "reproduzir" | "sair" | "som" | "sol" | "tarefa" | "tamanho-fonte" | "varinha" | "verificacao";
export interface AlternadorProps { ativo: boolean; aoMudar: (ativo: boolean) => void; rotulo: string }
export interface FormularioEditarPerfilProps {
  nome: string;
  email: string;
  erro: string;
  enviando: boolean;
  aoAlterarNome: (nome: string) => void;
  aoSalvar: (evento: FormEvent<HTMLFormElement>) => void;
}
export interface IconeProps { nome: NomeIcone; tamanho?: number }
export interface ItemConfiguracaoProps {
  aoClicar?: () => void;
  acao?: ReactNode;
  desabilitado?: boolean;
  destino?: string;
  icone?: NomeIcone;
  imagemIcone?: string;
  selecionado?: boolean;
  texto: string;
}
export interface PreferenciasPerfil {
  tema: "claro" | "escuro";
  altoContraste: boolean;
  fonteGrande: boolean;
}
export interface PreferenciasPersistidas extends PreferenciasPerfil { _versao: 3 }
export type ModalEdicaoPerfilProps =
  | { tipo: "sucesso"; aoConfirmar: () => void; aoCancelar?: never; aguardando?: never; mensagemErro?: never }
  | { tipo: "confirmacao" | "saida"; aoConfirmar: () => void; aoCancelar: () => void; aguardando?: boolean; mensagemErro?: string | null };

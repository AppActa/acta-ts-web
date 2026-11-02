import type { ReactNode } from "react";

export type NomeIcone = "acessibilidade" | "alto-contraste" | "equipe" | "notificacao" | "perfil" | "reproduzir" | "sair" | "som" | "sol" | "tarefa" | "tamanho-fonte" | "varinha" | "verificacao";
export interface AlternadorProps { ativo: boolean; aoMudar: (ativo: boolean) => void; rotulo: string }
export interface FormularioEditarPerfilProps { aoConcluir: () => void }
export interface IconeProps { nome: NomeIcone; tamanho?: number }
export interface ItemConfiguracaoProps {
  aoClicar?: () => void;
  acao?: ReactNode;
  desabilitado?: boolean;
  destino?: string;
  icone?: NomeIcone;
  imagemIcone?: string;
  texto: string;
}
export interface PreferenciasPerfil {
  notificacoes: boolean;
  tema: "claro" | "escuro";
  altoContraste: boolean;
  assistenteLibras: boolean;
  leitorTela: boolean;
  fonteGrande: boolean;
}
export interface PreferenciasPersistidas extends PreferenciasPerfil { _versao: 1 }
export type ModalEdicaoPerfilProps =
  | { tipo: "sucesso"; aoConfirmar: () => void; aoCancelar?: never; aguardando?: never; mensagemErro?: never }
  | { tipo: "confirmacao" | "saida"; aoConfirmar: () => void; aoCancelar: () => void; aguardando?: boolean; mensagemErro?: string | null };

export interface BotaoLoginGoogleProps { aoClicar: () => void; desabilitado?: boolean }
export interface CampoLoginProps {
  autoComplete: string;
  id: string;
  label: string;
  name: string;
  type: "email" | "password";
  bloquearColagem?: boolean;
  erro?: string | null;
  aoAlterar?: () => void;
}
export interface FormularioLoginProps { solicitarRedefinicao: (email: string) => Promise<void> }
export interface MensagemErroLoginProps { mensagem: string | null }
export interface ModalRecuperarSenhaProps {
  visivel: boolean;
  aoFechar: () => void;
  aoSolicitarRedefinicao: (email: string) => Promise<void>;
}
export type StatusUsuario = "ATIVO" | "INATIVO" | "PENDENTE" | "BLOQUEADO" | "ARQUIVADO";
export interface DadosPerfil {
  firebaseUid: string;
  idColaborador: number | null;
  nome: string;
  email: string;
  nomeEmpresa: string;
  permissaoGestor: boolean;
}
export type CurrentUser = DadosPerfil & (
  | { estadoPerfil: "CADASTRO_NAO_INICIADO"; idUsuario?: null; idEmpresa?: null; tipo?: null; status?: null }
  | { estadoPerfil: "PERFIL_CRIADO"; idUsuario: number; idEmpresa: number; tipo: string; status: StatusUsuario }
);

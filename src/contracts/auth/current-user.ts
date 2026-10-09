export type CurrentUser = {
  estadoPerfil: "CADASTRO_NAO_INICIADO" | "PERFIL_CRIADO" | string;
  firebaseUid: string;
  idUsuario: number;
  idEmpresa: number;
  idColaborador: number | null;
  nome: string;
  email: string;
  nomeEmpresa: string;
  tipo: string;
  permissaoGestor: boolean;
  status: "ATIVO" | "INATIVO" | "PENDENTE" | "BLOQUEADO" | "ARQUIVADO";
};
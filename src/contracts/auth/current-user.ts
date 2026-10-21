type StatusUsuario = "ATIVO" | "INATIVO" | "PENDENTE" | "BLOQUEADO" | "ARQUIVADO";

type DadosPerfil = {
  firebaseUid: string;
  idColaborador: number | null;
  nome: string;
  email: string;
  nomeEmpresa: string;
  permissaoGestor: boolean;
};

export type CurrentUser = DadosPerfil & (
  | {
      estadoPerfil: "CADASTRO_NAO_INICIADO";
      idUsuario?: null;
      idEmpresa?: null;
      tipo?: null;
      status?: null;
    }
  | {
      estadoPerfil: "PERFIL_CRIADO";
      idUsuario: number;
      idEmpresa: number;
      tipo: string;
      status: StatusUsuario;
    }
);
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { CarregandoAutenticacao } from "../CarregandoAutenticacao";
import { LayoutSimples } from "../../layout/LayoutSimples";

export function PrivateRoute() {
  const { firebaseUser, actaUser, loading, error, errorStatus, logout, refreshActaUser } = useAuth();
  const location = useLocation();
  const usarLayoutApp = /^\/do\/ciclo\/\d+\/(?:tarefas\/criar|treinamentos\/criar(?:\/sucesso)?|treinamentos\/\d+\/lembrete\/sucesso|check\/verificacoes\/criar|plan\/(?:causas\/criar|causas\/\d+\/editar|metas\/(?:criar|\d+\/editar)|planos\/(?:criar|\d+\/editar)|coleta\/(?:nova|criar|aviso)|identificacao-problema\/criar|identificacao-problema\/\d+\/editar))$/.test(location.pathname);

  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!firebaseUser.emailVerified || actaUser?.estadoPerfil === "CADASTRO_NAO_INICIADO" || (!actaUser && errorStatus === 404)) return <Navigate to="/onboarding" replace />;
  if (actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status !== "ATIVO") return <main className="page-shell" role="alert"><h1>Acesso pendente ou indisponível</h1><p>Seu perfil ainda não está ativo. Entre em contato com o suporte.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;
  if (actaUser && actaUser.status !== "ATIVO") return <main className="page-shell" role="alert"><h1>Acesso indisponível</h1><p>Sua conta está {actaUser.status.toLowerCase()}. Entre em contato com o administrador da empresa.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;

  if (!actaUser) return <main role="alert" className="page-shell"><h1>Acesso ao ACTA indisponível</h1><p>{error ?? "Não foi possível validar sua conta."}</p><button className="page-shell_botao" type="button" onClick={() => void refreshActaUser()}>Tentar novamente</button><button className="page-shell_botao page-shell_botao--secundario" type="button" onClick={() => void logout()}>Sair</button></main>;

  return usarLayoutApp ? <LayoutSimples><Outlet /></LayoutSimples> : <Outlet />;
}

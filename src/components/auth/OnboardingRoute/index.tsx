import { lazy, Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { CarregandoAutenticacao } from "../CarregandoAutenticacao";
import { CarregandoPagina } from "../../layout/CarregandoPagina";

const PaginaOnboarding = lazy(() => import("../../../pages/empresas/PaginaOnboarding").then((mod) => ({ default: mod.PaginaOnboarding })));

export function OnboardingRoute() {
  const { firebaseUser, actaUser, loading, error, errorStatus, logout, refreshActaUser } = useAuth();
  const location = useLocation();

  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO") return <Navigate to="/" replace />;
  if (actaUser && actaUser.estadoPerfil !== "CADASTRO_NAO_INICIADO") return <main className="page-shell" role="alert"><h1>Cadastro pendente ou inconsistente</h1><p>Não foi possível confirmar um perfil ativo para esta conta. Procure o suporte do ACTA.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;
  if (!actaUser && errorStatus !== 404 && firebaseUser.emailVerified) return <main role="alert" className="page-shell"><h1>{errorStatus === 403 ? "Acesso não autorizado" : "Não foi possível consultar sua conta"}</h1><p>{error}</p><button type="button" onClick={() => void refreshActaUser()}>Tentar novamente</button><button type="button" onClick={() => void logout()}>Sair</button></main>;
  return <Suspense fallback={<CarregandoPagina />}><PaginaOnboarding /></Suspense>;
}

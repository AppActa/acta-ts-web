import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { PaginaLogin } from "../../features/auth";
import { PaginaCadastroConta } from "../../features/auth/pages/PaginaCadastroConta";
import { PaginaEditarPerfil, PaginaPerfil } from "../../features/perfil";
import { HomePage } from "../../features/dashboard/pages/HomePage";
import { PaginaDo } from "../../features/do/pages/PaginaDo";
import { PaginaCicloDo } from "../../features/do/pages/PaginaCicloDo";
import { PaginaCicloDoTarefas } from "../../features/do/pages/PaginaCicloDoTarefas";
import { PaginaCicloDoTreinamentos } from "../../features/do/pages/PaginaCicloDoTreinamentos";
import { PaginaCicloDoTreinamentoEspecifico } from "../../features/do/pages/PaginaCicloDoTreinamentoEspecifico";
import { PaginaCriarTreinamentoDo } from "../../features/do/pages/PaginaCriarTreinamentoDo";
import { PaginaSucessoTreinamentoCriadoDo } from "../../features/do/pages/PaginaSucessoTreinamentoCriadoDo";
import { PaginaSucessoLembreteDo } from "../../features/do/pages/PaginaSucessoLembreteDo";
import { PaginaCicloDoCronograma } from "../../features/do/pages/PaginaCicloDoCronograma";
import { PaginaCicloPlan } from "../../features/plan/pages/PaginaCicloPlan";
import { PaginaPlanColeta } from "../../features/plan/pages/PaginaPlanColeta";
import { PaginaPlanCriarFormulario } from "../../features/plan/pages/PaginaPlanCriarFormulario";
import { PaginaPlanIdentificacaoProblema } from "../../features/plan/pages/PaginaPlanIdentificacaoProblema";
import { PaginaPlanAvisoColeta } from "../../features/plan/pages/PaginaPlanAvisoColeta";
import { PaginaTodosCiclos } from "../../features/ciclos/pages/PaginaTodosCiclos";
import { PaginaRelatorios } from "../../features/relatorios/pages/PaginaRelatorios";
import { PaginaNaoEncontrada } from "../../features/layout/pages/PaginaNaoEncontrada";
import { PaginaOnboarding } from "../../features/empresas/pages/PaginaOnboarding";

function CarregandoAutenticacao() {
  return <main role="status" aria-live="polite">Carregando sua conta…</main>;
}

function RotaOnboarding() {
  const { firebaseUser, actaUser, loading, error, errorStatus, logout, refreshActaUser } = useAuth();
  const location = useLocation();
  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO") return <Navigate to="/" replace />;
  if (actaUser && actaUser.estadoPerfil !== "CADASTRO_NAO_INICIADO") return <main className="page-shell" role="alert"><h1>Cadastro pendente ou inconsistente</h1><p>Não foi possível confirmar um perfil ativo para esta conta. Procure o suporte do ACTA.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;
  if (!actaUser && errorStatus !== 404 && errorStatus !== 403 && firebaseUser.emailVerified) return <main role="alert" className="page-shell"><h1>Não foi possível consultar sua conta</h1><p>{error}</p><button type="button" onClick={() => void refreshActaUser()}>Tentar novamente</button><button type="button" onClick={() => void logout()}>Sair</button></main>;
  return <PaginaOnboarding pendente={actaUser?.status === "PENDENTE"} />;
}

function RotaPrivada() {
  const { firebaseUser, actaUser, loading, error, errorStatus, logout, refreshActaUser } = useAuth();
  const location = useLocation();

  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!firebaseUser.emailVerified || actaUser?.estadoPerfil === "CADASTRO_NAO_INICIADO" || (!actaUser && errorStatus === 404)) return <Navigate to="/onboarding" replace />;
  if (actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status !== "ATIVO") return <main className="page-shell" role="alert"><h1>Acesso pendente ou indisponível</h1><p>Seu perfil ainda não está ativo. Entre em contato com o suporte.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;
  if (actaUser && actaUser.status !== "ATIVO") return <main className="page-shell" role="alert"><h1>Acesso indisponível</h1><p>Sua conta está {actaUser.status.toLowerCase()}. Entre em contato com o administrador da empresa.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;

  if (!actaUser) {
    return (
      <main role="alert" className="page-shell">
        <h1>Acesso ao ACTA indisponível</h1>
        <p>{error ?? "Não foi possível validar sua conta."}</p>
        <button className="page-shell_botao" type="button" onClick={() => void refreshActaUser()}>
          Tentar novamente
        </button>
        <button
          className="page-shell_botao page-shell_botao--secundario"
          type="button"
          onClick={() => void logout()}
        >
          Sair
        </button>
      </main>
    );
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <PaginaLogin /> },
  { path: "/criar-conta", element: <PaginaCadastroConta /> },
  { path: "/onboarding", element: <RotaOnboarding /> },
  {
    path: "/",
    element: <RotaPrivada />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "perfil", element: <PaginaPerfil /> },
      { path: "do", element: <PaginaDo /> },
      { path: "ciclos", element: <PaginaTodosCiclos /> },
      { path: "relatorios", element: <PaginaRelatorios /> },
      { path: "do/ciclo/:cicloId/plan", element: <PaginaCicloPlan /> },
      { path: "do/ciclo/:cicloId/plan/coleta", element: <PaginaPlanColeta /> },
      { path: "do/ciclo/:cicloId/plan/coleta/criar", element: <PaginaPlanCriarFormulario /> },
      { path: "do/ciclo/:cicloId/plan/coleta/aviso", element: <PaginaPlanAvisoColeta /> },
      { path: "do/ciclo/:cicloId/plan/identificacao-problema", element: <PaginaPlanIdentificacaoProblema /> },
      { path: "do/ciclo/:cicloId", element: <PaginaCicloDo /> },
      { path: "do/ciclo/:cicloId/visao-geral", element: <PaginaCicloDo /> },
      { path: "do/ciclo/:cicloId/cronograma", element: <PaginaCicloDoCronograma /> },
      { path: "do/ciclo/:cicloId/tarefas", element: <PaginaCicloDoTarefas /> },
      { path: "do/ciclo/:cicloId/treinamentos", element: <PaginaCicloDoTreinamentos /> },
      { path: "do/ciclo/:cicloId/treinamentos/criar/sucesso", element: <PaginaSucessoTreinamentoCriadoDo /> },
      { path: "do/ciclo/:cicloId/treinamentos/criar", element: <PaginaCriarTreinamentoDo /> },
      { path: "do/ciclo/:cicloId/treinamentos/:treinamentoId/lembrete/sucesso", element: <PaginaSucessoLembreteDo /> },
      { path: "do/ciclo/:cicloId/treinamentos/:treinamentoId", element: <PaginaCicloDoTreinamentoEspecifico /> },
      { path: "perfil/editar", element: <PaginaEditarPerfil /> },
    ],
  },
  { path: "*", element: <PaginaNaoEncontrada /> },
]);

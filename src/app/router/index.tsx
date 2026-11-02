import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { PaginaLogin } from "../../features/auth";
import { PaginaCadastroConta } from "../../features/auth/pages/PaginaCadastroConta";
import { PaginaEditarPerfil, PaginaPerfil } from "../../features/perfil";
import { HomePageConectada } from "../../features/dashboard/pages/HomePageConectada";
import { PaginaDo } from "../../features/do/pages/PaginaDo";
import { PaginaCicloDo } from "../../features/do/pages/PaginaCicloDo";
import { PaginaCicloDoEquipe } from "../../features/do/pages/PaginaCicloDoEquipe";
import { PaginaCicloDoTarefas } from "../../features/do/pages/PaginaCicloDoTarefas";
import { PaginaCriarTarefaDo } from "../../features/do/pages/PaginaCriarTarefaDo";
import { PaginaDetalheTarefaDo } from "../../features/do/pages/PaginaDetalheTarefaDo";
import { PaginaCicloDoTreinamentos } from "../../features/do/pages/PaginaCicloDoTreinamentos";
import { PaginaCicloDoTreinamentoEspecifico } from "../../features/do/pages/PaginaCicloDoTreinamentoEspecifico";
import { PaginaCriarTreinamentoDo } from "../../features/do/pages/PaginaCriarTreinamentoDo";
import { PaginaSucessoTreinamentoCriadoDo } from "../../features/do/pages/PaginaSucessoTreinamentoCriadoDo";
import { PaginaSucessoLembreteDo } from "../../features/do/pages/PaginaSucessoLembreteDo";
import { PaginaCicloDoCronograma } from "../../features/do/pages/PaginaCicloDoCronograma";
import { PaginaCicloPlan } from "../../features/plan/pages/PaginaCicloPlan";
import { PaginaPlanColeta } from "../../features/plan/pages/PaginaPlanColeta";
import { PaginaPlanCausas } from "../../features/plan/pages/PaginaPlanCausas";
import { PaginaPlanCriarMeta } from "../../features/plan/pages/PaginaPlanCriarMeta";
import { PaginaPlanEditarRegistro } from "../../features/plan/pages/PaginaPlanEditarRegistro";
import { PaginaPlanCriarPlano } from "../../features/plan/pages/PaginaPlanCriarPlano";
import { PaginaPlanCriarCausa } from "../../features/plan/pages/PaginaPlanCriarCausa";
import { PaginaPlanInvestigacao } from "../../features/plan/pages/PaginaPlanInvestigacao";
import { PaginaPlanEditarInvestigacao } from "../../features/plan/pages/PaginaPlanEditarInvestigacao";
import { PaginaPlanMetasEPlanos } from "../../features/plan/pages/PaginaPlanMetasEPlanos";
import { PaginaPlanNovaColeta } from "../../features/plan/pages/PaginaPlanNovaColeta";
import { PaginaPlanCriarFormulario } from "../../features/plan/pages/PaginaPlanCriarFormulario";
import { PaginaPlanProblemasRegistrados } from "../../features/plan/pages/PaginaPlanProblemasRegistrados";
import { PaginaPlanCriarProblema } from "../../features/plan/pages/PaginaPlanCriarProblema";
import { PaginaPlanDetalheProblema } from "../../features/plan/pages/PaginaPlanDetalheProblema";
import { PaginaPlanEditarProblema } from "../../features/plan/pages/PaginaPlanEditarProblema";
import { PaginaPlanAvisoColeta } from "../../features/plan/pages/PaginaPlanAvisoColeta";
import { PaginaPlanTodosCiclos } from "../../features/plan/pages/PaginaPlanTodosCiclos";
import { PaginaCheckTodosCiclos } from "../../features/check/pages/PaginaCheckTodosCiclos";
import { PaginaCicloCheck } from "../../features/check/pages/PaginaCicloCheck";
import { PaginaRegistrarVerificacao } from "../../features/check/pages/PaginaRegistrarVerificacao";
import { PaginaDetalheIndicador } from "../../features/check/pages/PaginaDetalheIndicador";
import { PaginaDetalheVerificacao } from "../../features/check/pages/PaginaDetalheVerificacao";
import { PaginaCicloAct } from "../../features/act/pages/PaginaCicloAct";
import { PaginaActTodosCiclos } from "../../features/act/pages/PaginaActTodosCiclos";
import { PaginaTodosCiclos } from "../../features/ciclos/pages/PaginaTodosCiclos";
import { PaginaRelatorios } from "../../features/relatorios/pages/PaginaRelatorios";
import { PaginaNaoEncontrada } from "../../features/layout/pages/PaginaNaoEncontrada";
import { PaginaOnboarding } from "../../features/empresas/pages/PaginaOnboarding";

function CarregandoAutenticacao() {
  return <main role="status" aria-live="polite">Carregando sua conta…</main>;
}

function RotaAutenticada() {
  const { firebaseUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function RotaOnboarding() {
  const { firebaseUser, actaUser, loading, error, errorStatus, logout, refreshActaUser } = useAuth();
  const location = useLocation();
  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO") return <Navigate to="/" replace />;
  if (actaUser && actaUser.estadoPerfil !== "CADASTRO_NAO_INICIADO") return <main className="page-shell" role="alert"><h1>Cadastro pendente ou inconsistente</h1><p>Não foi possível confirmar um perfil ativo para esta conta. Procure o suporte do ACTA.</p><button type="button" onClick={() => void logout()}>Sair</button></main>;
  if (!actaUser && errorStatus !== 404 && firebaseUser.emailVerified) return <main role="alert" className="page-shell"><h1>{errorStatus === 403 ? "Acesso não autorizado" : "Não foi possível consultar sua conta"}</h1><p>{error}</p><button type="button" onClick={() => void refreshActaUser()}>Tentar novamente</button><button type="button" onClick={() => void logout()}>Sair</button></main>;
  return <PaginaOnboarding />;
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
  {
    path: "/",
    element: <RotaAutenticada />,
    children: [
      { path: "criar-conta", element: <PaginaCadastroConta /> },
      { path: "onboarding", element: <RotaOnboarding /> },
      {
        element: <RotaPrivada />,
        children: [
          { index: true, element: <HomePageConectada /> },
          { path: "perfil", element: <PaginaPerfil /> },
          { path: "do", element: <PaginaDo /> },
          { path: "act", element: <PaginaActTodosCiclos /> },
          { path: "check", element: <PaginaCheckTodosCiclos /> },
          { path: "do/ciclo/:cicloId/check", element: <PaginaCicloCheck /> },
          { path: "do/ciclo/:cicloId/check/verificacoes/criar", element: <PaginaRegistrarVerificacao /> },
          { path: "do/ciclo/:cicloId/check/verificacoes/:verificacaoId", element: <PaginaDetalheVerificacao /> },
          { path: "do/ciclo/:cicloId/check/indicadores/:indicadorId", element: <PaginaDetalheIndicador /> },
          { path: "do/ciclo/:cicloId/act", element: <PaginaCicloAct /> },
          { path: "ciclos", element: <PaginaTodosCiclos /> },
          { path: "relatorios", element: <PaginaRelatorios /> },
          { path: "relatorios/criar", element: <PaginaRelatorios /> },
          { path: "relatorios/:relatorioId", element: <PaginaRelatorios /> },
          { path: "plan/ciclos", element: <PaginaPlanTodosCiclos /> },
          { path: "do/ciclo/:cicloId/plan", element: <PaginaCicloPlan /> },
          { path: "do/ciclo/:cicloId/plan/coleta", element: <PaginaPlanColeta /> },
          { path: "do/ciclo/:cicloId/plan/causas", element: <PaginaPlanCausas /> },
          { path: "do/ciclo/:cicloId/plan/causas/criar", element: <PaginaPlanCriarCausa /> },
          { path: "do/ciclo/:cicloId/plan/causas/:registroId/editar", element: <PaginaPlanEditarRegistro tipo="causa" /> },
          { path: "do/ciclo/:cicloId/plan/ishikawa", element: <PaginaPlanInvestigacao tipo="ishikawa" /> },
          { path: "do/ciclo/:cicloId/plan/porques", element: <PaginaPlanInvestigacao tipo="porques" /> },
          { path: "do/ciclo/:cicloId/plan/porques/criar", element: <PaginaPlanEditarInvestigacao /> },
          { path: "do/ciclo/:cicloId/plan/porques/:investigacaoId/editar", element: <PaginaPlanEditarInvestigacao /> },
          { path: "do/ciclo/:cicloId/plan/metas", element: <PaginaPlanMetasEPlanos tipo="metas" /> },
          { path: "do/ciclo/:cicloId/plan/metas/criar", element: <PaginaPlanCriarMeta /> },
          { path: "do/ciclo/:cicloId/plan/metas/:registroId/editar", element: <PaginaPlanEditarRegistro tipo="meta" /> },
          { path: "do/ciclo/:cicloId/plan/planos", element: <PaginaPlanMetasEPlanos tipo="planos" /> },
          { path: "do/ciclo/:cicloId/plan/planos/criar", element: <PaginaPlanCriarPlano /> },
          { path: "do/ciclo/:cicloId/plan/planos/:registroId/editar", element: <PaginaPlanEditarRegistro tipo="plano" /> },
          { path: "do/ciclo/:cicloId/plan/coleta/nova", element: <PaginaPlanNovaColeta /> },
          { path: "do/ciclo/:cicloId/plan/coleta/criar", element: <PaginaPlanCriarFormulario /> },
          { path: "do/ciclo/:cicloId/plan/coleta/aviso", element: <PaginaPlanAvisoColeta /> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema", element: <PaginaPlanProblemasRegistrados /> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/lista", element: <PaginaPlanProblemasRegistrados /> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/criar", element: <PaginaPlanCriarProblema /> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/:problemaId", element: <PaginaPlanDetalheProblema /> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/:problemaId/editar", element: <PaginaPlanEditarProblema /> },
          { path: "do/ciclo/:cicloId", element: <PaginaCicloDo /> },
          { path: "do/ciclo/:cicloId/visao-geral", element: <PaginaCicloDo /> },
          { path: "do/ciclo/:cicloId/equipe", element: <PaginaCicloDoEquipe /> },
          { path: "do/ciclo/:cicloId/cronograma", element: <PaginaCicloDoCronograma /> },
          { path: "do/ciclo/:cicloId/tarefas", element: <PaginaCicloDoTarefas /> },
          { path: "do/ciclo/:cicloId/tarefas/criar", element: <PaginaCriarTarefaDo /> },
          { path: "do/ciclo/:cicloId/tarefas/:tarefaId", element: <PaginaDetalheTarefaDo /> },
          { path: "do/ciclo/:cicloId/treinamentos", element: <PaginaCicloDoTreinamentos /> },
          { path: "do/ciclo/:cicloId/treinamentos/criar/sucesso", element: <PaginaSucessoTreinamentoCriadoDo /> },
          { path: "do/ciclo/:cicloId/treinamentos/criar", element: <PaginaCriarTreinamentoDo /> },
          { path: "do/ciclo/:cicloId/treinamentos/:treinamentoId/lembrete/sucesso", element: <PaginaSucessoLembreteDo /> },
          { path: "do/ciclo/:cicloId/treinamentos/:treinamentoId", element: <PaginaCicloDoTreinamentoEspecifico /> },
          { path: "perfil/editar", element: <PaginaEditarPerfil /> },
        ],
      },
      { path: "*", element: <PaginaNaoEncontrada /> },
    ],
  },
]);

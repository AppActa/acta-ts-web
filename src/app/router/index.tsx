import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AuthenticatedRoute } from "../../components/auth/AuthenticatedRoute";
import { OnboardingRoute } from "../../components/auth/OnboardingRoute";
import { PrivateRoute } from "../../components/auth/PrivateRoute";
import { CarregandoPagina } from "../../components/layout/CarregandoPagina";
import { PaginaErroAplicacao } from "../../pages/layout/PaginaErroAplicacao";
const PaginaLogin = lazy(() => import("../../pages/auth/PaginaLogin").then((mod) => ({ default: mod.PaginaLogin })));
const PaginaCadastroConta = lazy(() => import("../../pages/auth/PaginaCadastroConta").then((mod) => ({ default: mod.PaginaCadastroConta })));
const PaginaEditarPerfil = lazy(() => import("../../pages/perfil/PaginaEditarPerfil").then((mod) => ({ default: mod.PaginaEditarPerfil })));
const PaginaPerfil = lazy(() => import("../../pages/perfil/PaginaPerfil").then((mod) => ({ default: mod.PaginaPerfil })));
const HomePageConectada = lazy(() => import("../../pages/dashboard/HomePageConectada").then((mod) => ({ default: mod.HomePageConectada })));
const PaginaDo = lazy(() => import("../../pages/do/PaginaDo").then((mod) => ({ default: mod.PaginaDo })));
const PaginaCicloDo = lazy(() => import("../../pages/do/PaginaCicloDo").then((mod) => ({ default: mod.PaginaCicloDo })));
const PaginaCicloDoEquipe = lazy(() => import("../../pages/do/PaginaCicloDoEquipe").then((mod) => ({ default: mod.PaginaCicloDoEquipe })));
const PaginaCicloDoTarefas = lazy(() => import("../../pages/do/PaginaCicloDoTarefas").then((mod) => ({ default: mod.PaginaCicloDoTarefas })));
const PaginaCriarTarefaDo = lazy(() => import("../../pages/do/PaginaCriarTarefaDo").then((mod) => ({ default: mod.PaginaCriarTarefaDo })));
const PaginaDetalheTarefaDo = lazy(() => import("../../pages/do/PaginaDetalheTarefaDo").then((mod) => ({ default: mod.PaginaDetalheTarefaDo })));
const PaginaCicloDoTreinamentos = lazy(() => import("../../pages/do/PaginaCicloDoTreinamentos").then((mod) => ({ default: mod.PaginaCicloDoTreinamentos })));
const PaginaCicloDoTreinamentoEspecifico = lazy(() => import("../../pages/do/PaginaCicloDoTreinamentoEspecifico").then((mod) => ({ default: mod.PaginaCicloDoTreinamentoEspecifico })));
const PaginaCriarTreinamentoDo = lazy(() => import("../../pages/do/PaginaCriarTreinamentoDo").then((mod) => ({ default: mod.PaginaCriarTreinamentoDo })));
const PaginaSucessoTreinamentoCriadoDo = lazy(() => import("../../pages/do/PaginaSucessoTreinamentoCriadoDo").then((mod) => ({ default: mod.PaginaSucessoTreinamentoCriadoDo })));
const PaginaSucessoLembreteDo = lazy(() => import("../../pages/do/PaginaSucessoLembreteDo").then((mod) => ({ default: mod.PaginaSucessoLembreteDo })));
const PaginaCicloDoCronograma = lazy(() => import("../../pages/do/PaginaCicloDoCronograma").then((mod) => ({ default: mod.PaginaCicloDoCronograma })));
const PaginaCicloPlan = lazy(() => import("../../pages/plan/PaginaCicloPlan").then((mod) => ({ default: mod.PaginaCicloPlan })));
const PaginaPlanColeta = lazy(() => import("../../pages/plan/PaginaPlanColeta").then((mod) => ({ default: mod.PaginaPlanColeta })));
const PaginaPlanCausas = lazy(() => import("../../pages/plan/PaginaPlanCausas").then((mod) => ({ default: mod.PaginaPlanCausas })));
const PaginaPlanCriarMeta = lazy(() => import("../../pages/plan/PaginaPlanCriarMeta").then((mod) => ({ default: mod.PaginaPlanCriarMeta })));
const PaginaPlanEditarRegistro = lazy(() => import("../../pages/plan/PaginaPlanEditarRegistro").then((mod) => ({ default: mod.PaginaPlanEditarRegistro })));
const PaginaPlanCriarPlano = lazy(() => import("../../pages/plan/PaginaPlanCriarPlano").then((mod) => ({ default: mod.PaginaPlanCriarPlano })));
const PaginaPlanCriarCausa = lazy(() => import("../../pages/plan/PaginaPlanCriarCausa").then((mod) => ({ default: mod.PaginaPlanCriarCausa })));
const PaginaPlanInvestigacao = lazy(() => import("../../pages/plan/PaginaPlanInvestigacao").then((mod) => ({ default: mod.PaginaPlanInvestigacao })));
const PaginaPlanEditarInvestigacao = lazy(() => import("../../pages/plan/PaginaPlanEditarInvestigacao").then((mod) => ({ default: mod.PaginaPlanEditarInvestigacao })));
const PaginaPlanMetasEPlanos = lazy(() => import("../../pages/plan/PaginaPlanMetasEPlanos").then((mod) => ({ default: mod.PaginaPlanMetasEPlanos })));
const PaginaPlanNovaColeta = lazy(() => import("../../pages/plan/PaginaPlanNovaColeta").then((mod) => ({ default: mod.PaginaPlanNovaColeta })));
const PaginaFormularioMongo = lazy(() => import("../../pages/plan/PaginaFormularioMongo").then((mod) => ({ default: mod.PaginaFormularioMongo })));
const PaginaResponderFormulario = lazy(() => import("../../pages/plan/PaginaResponderFormulario").then((mod) => ({ default: mod.PaginaResponderFormulario })));
const PaginaPlanProblemasRegistrados = lazy(() => import("../../pages/plan/PaginaPlanProblemasRegistrados").then((mod) => ({ default: mod.PaginaPlanProblemasRegistrados })));
const PaginaPlanCriarProblema = lazy(() => import("../../pages/plan/PaginaPlanCriarProblema").then((mod) => ({ default: mod.PaginaPlanCriarProblema })));
const PaginaPlanDetalheProblema = lazy(() => import("../../pages/plan/PaginaPlanDetalheProblema").then((mod) => ({ default: mod.PaginaPlanDetalheProblema })));
const PaginaPlanEditarProblema = lazy(() => import("../../pages/plan/PaginaPlanEditarProblema").then((mod) => ({ default: mod.PaginaPlanEditarProblema })));
const PaginaPlanAvisoColeta = lazy(() => import("../../pages/plan/PaginaPlanAvisoColeta").then((mod) => ({ default: mod.PaginaPlanAvisoColeta })));
const PaginaPlanTodosCiclos = lazy(() => import("../../pages/plan/PaginaPlanTodosCiclos").then((mod) => ({ default: mod.PaginaPlanTodosCiclos })));
const PaginaCheckTodosCiclos = lazy(() => import("../../pages/check/PaginaCheckTodosCiclos").then((mod) => ({ default: mod.PaginaCheckTodosCiclos })));
const PaginaCicloCheck = lazy(() => import("../../pages/check/PaginaCicloCheck").then((mod) => ({ default: mod.PaginaCicloCheck })));
const PaginaRegistrarVerificacao = lazy(() => import("../../pages/check/PaginaRegistrarVerificacao").then((mod) => ({ default: mod.PaginaRegistrarVerificacao })));
const PaginaDetalheIndicador = lazy(() => import("../../pages/check/PaginaDetalheIndicador").then((mod) => ({ default: mod.PaginaDetalheIndicador })));
const PaginaDetalheVerificacao = lazy(() => import("../../pages/check/PaginaDetalheVerificacao").then((mod) => ({ default: mod.PaginaDetalheVerificacao })));
const PaginaCicloAct = lazy(() => import("../../pages/act/PaginaCicloAct").then((mod) => ({ default: mod.PaginaCicloAct })));
const PaginaAprendizadosAct = lazy(() => import("../../pages/act/PaginaAprendizadosAct").then((mod) => ({ default: mod.PaginaAprendizadosAct })));
const PaginaEditarLicaoAprendida = lazy(() => import("../../pages/act/PaginaEditarLicaoAprendida").then((mod) => ({ default: mod.PaginaEditarLicaoAprendida })));
const PaginaActTodosCiclos = lazy(() => import("../../pages/act/PaginaActTodosCiclos").then((mod) => ({ default: mod.PaginaActTodosCiclos })));
const PaginaTodosCiclos = lazy(() => import("../../pages/ciclos/PaginaTodosCiclos").then((mod) => ({ default: mod.PaginaTodosCiclos })));
const PaginaNaoEncontrada = lazy(() => import("../../pages/layout/PaginaNaoEncontrada").then((mod) => ({ default: mod.PaginaNaoEncontrada })));
const PaginaCato = lazy(() => import("../../pages/cato/PaginaCato").then((mod) => ({ default: mod.PaginaCato })));
export const router = createBrowserRouter([
  { path: "/login", element: <Suspense fallback={<CarregandoPagina />} ><PaginaLogin /></Suspense>, errorElement: <PaginaErroAplicacao /> },
  { path: "/criar-conta", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCadastroConta /></Suspense>, errorElement: <PaginaErroAplicacao /> },
  {
    path: "/",
    element: <AuthenticatedRoute />,
    errorElement: <PaginaErroAplicacao />,
    children: [
      { path: "onboarding", element: <OnboardingRoute /> },
      {
        element: <PrivateRoute />,
        children: [
          { index: true, element: <Suspense fallback={<CarregandoPagina />} ><HomePageConectada /></Suspense> },
          { path: "perfil", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPerfil /></Suspense> },
          { path: "cato", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCato /></Suspense> },
          { path: "do", element: <Suspense fallback={<CarregandoPagina />} ><PaginaDo /></Suspense> },
          { path: "act", element: <Suspense fallback={<CarregandoPagina />} ><PaginaActTodosCiclos /></Suspense> },
          { path: "check", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCheckTodosCiclos /></Suspense> },
          { path: "do/ciclo/:cicloId/check", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloCheck /></Suspense> },
          { path: "do/ciclo/:cicloId/check/verificacoes/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaRegistrarVerificacao /></Suspense> },
          { path: "do/ciclo/:cicloId/check/verificacoes/:verificacaoId", element: <Suspense fallback={<CarregandoPagina />} ><PaginaDetalheVerificacao /></Suspense> },
          { path: "do/ciclo/:cicloId/check/indicadores/:indicadorId", element: <Suspense fallback={<CarregandoPagina />} ><PaginaDetalheIndicador /></Suspense> },
          { path: "do/ciclo/:cicloId/act", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloAct /></Suspense> },
          { path: "do/ciclo/:cicloId/act/aprendizados", element: <Suspense fallback={<CarregandoPagina />} ><PaginaAprendizadosAct /></Suspense> },
          { path: "do/ciclo/:cicloId/act/aprendizados/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaEditarLicaoAprendida /></Suspense> },
          { path: "do/ciclo/:cicloId/act/aprendizados/:licaoId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaEditarLicaoAprendida /></Suspense> },
          { path: "ciclos", element: <Suspense fallback={<CarregandoPagina />} ><PaginaTodosCiclos /></Suspense> },
          { path: "ciclos/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaTodosCiclos /></Suspense> },
          { path: "plan/ciclos", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanTodosCiclos /></Suspense> },
          { path: "do/ciclo/:cicloId/plan", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloPlan /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/coleta", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanColeta /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/causas", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanCausas /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/causas/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanCriarCausa /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/causas/:registroId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanEditarRegistro tipo="causa" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/ishikawa", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanInvestigacao tipo="ishikawa" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/porques", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanInvestigacao tipo="porques" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/porques/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanEditarInvestigacao /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/porques/:investigacaoId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanEditarInvestigacao /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/metas", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanMetasEPlanos tipo="metas" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/metas/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanCriarMeta /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/metas/:registroId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanEditarRegistro tipo="meta" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/planos", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanMetasEPlanos tipo="planos" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/planos/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanCriarPlano /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/planos/:registroId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanEditarRegistro tipo="plano" /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/coleta/nova", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanNovaColeta /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/coleta/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaFormularioMongo /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/coleta/formularios/:formularioId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaFormularioMongo /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/coleta/formularios/:formularioId/responder", element: <Suspense fallback={<CarregandoPagina />} ><PaginaResponderFormulario /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/coleta/aviso", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanAvisoColeta /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanProblemasRegistrados /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/lista", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanProblemasRegistrados /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanCriarProblema /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/:problemaId", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanDetalheProblema /></Suspense> },
          { path: "do/ciclo/:cicloId/plan/identificacao-problema/:problemaId/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaPlanEditarProblema /></Suspense> },
          { path: "do/ciclo/:cicloId", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDo /></Suspense> },
          { path: "do/ciclo/:cicloId/visao-geral", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDo /></Suspense> },
          { path: "do/ciclo/:cicloId/equipe", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDoEquipe /></Suspense> },
          { path: "do/ciclo/:cicloId/cronograma", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDoCronograma /></Suspense> },
          { path: "do/ciclo/:cicloId/tarefas", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDoTarefas /></Suspense> },
          { path: "do/ciclo/:cicloId/tarefas/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCriarTarefaDo /></Suspense> },
          { path: "do/ciclo/:cicloId/tarefas/:tarefaId", element: <Suspense fallback={<CarregandoPagina />} ><PaginaDetalheTarefaDo /></Suspense> },
          { path: "do/ciclo/:cicloId/treinamentos", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDoTreinamentos /></Suspense> },
          { path: "do/ciclo/:cicloId/treinamentos/criar/sucesso", element: <Suspense fallback={<CarregandoPagina />} ><PaginaSucessoTreinamentoCriadoDo /></Suspense> },
          { path: "do/ciclo/:cicloId/treinamentos/criar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCriarTreinamentoDo /></Suspense> },
          { path: "do/ciclo/:cicloId/treinamentos/:treinamentoId/lembrete/sucesso", element: <Suspense fallback={<CarregandoPagina />} ><PaginaSucessoLembreteDo /></Suspense> },
          { path: "do/ciclo/:cicloId/treinamentos/:treinamentoId", element: <Suspense fallback={<CarregandoPagina />} ><PaginaCicloDoTreinamentoEspecifico /></Suspense> },
          { path: "perfil/editar", element: <Suspense fallback={<CarregandoPagina />} ><PaginaEditarPerfil /></Suspense> },
        ],
      },
      { path: "*", element: <Suspense fallback={<CarregandoPagina />} ><PaginaNaoEncontrada /></Suspense> },
    ],
  },
]);

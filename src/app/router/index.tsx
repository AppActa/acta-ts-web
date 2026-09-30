import { createBrowserRouter } from "react-router-dom";
import { PaginaLogin } from "../../features/auth";
import { PaginaEditarPerfil, PaginaPerfil } from "../../features/perfil";
import { HomePage } from "../../pages/HomePage";
import { PaginaDo } from "../../pages/PaginaDo";
import { PaginaCicloDo } from "../../pages/PaginaCicloDo";
import { PaginaCicloDoTarefas } from "../../pages/PaginaCicloDoTarefas";
import { PaginaCicloDoTreinamentos } from "../../pages/PaginaCicloDoTreinamentos";
import { PaginaCicloDoTreinamentoEspecifico } from "../../pages/PaginaCicloDoTreinamentoEspecifico";
import { PaginaCriarTreinamentoDo } from "../../pages/PaginaCriarTreinamentoDo";
import { PaginaSucessoTreinamentoCriadoDo } from "../../pages/PaginaSucessoTreinamentoCriadoDo";
import { PaginaSucessoLembreteDo } from "../../pages/PaginaSucessoLembreteDo";
import { PaginaCicloDoCronograma } from "../../pages/PaginaCicloDoCronograma";
import { PaginaCicloPlan } from "../../pages/PaginaCicloPlan";
import { PaginaPlanColeta } from "../../pages/PaginaPlanColeta";
import { PaginaPlanCriarFormulario } from "../../pages/PaginaPlanCriarFormulario";
import { PaginaPlanIdentificacaoProblema } from "../../pages/PaginaPlanIdentificacaoProblema";
import { PaginaPlanAvisoColeta } from "../../pages/PaginaPlanAvisoColeta";
import { PaginaTodosCiclos } from "../../pages/PaginaTodosCiclos";
import { PaginaRelatorios } from "../../pages/PaginaRelatorios";
import { PaginaNaoEncontrada } from "../../pages/PaginaNaoEncontrada";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <PaginaLogin />,
  },
  {
    path: "/perfil",
    element: <PaginaPerfil />,
  },
  {
    path: "/do",
    element: <PaginaDo />,
  },
  {
    path: "/ciclos",
    element: <PaginaTodosCiclos />,
  },
  {
    path: "/relatorios",
    element: <PaginaRelatorios />,
  },
  {
    path: "/do/ciclo/:cicloId/plan",
    element: <PaginaCicloPlan />,
  },
  {
    path: "/do/ciclo/:cicloId/plan/coleta",
    element: <PaginaPlanColeta />,
  },
  {
    path: "/do/ciclo/:cicloId/plan/coleta/criar",
    element: <PaginaPlanCriarFormulario />,
  },
  {
    path: "/do/ciclo/:cicloId/plan/coleta/aviso",
    element: <PaginaPlanAvisoColeta />,
  },
  {
    path: "/do/ciclo/:cicloId/plan/identificacao-problema",
    element: <PaginaPlanIdentificacaoProblema />,
  },
  {
    path: "/do/ciclo/:cicloId",
    element: <PaginaCicloDo />,
  },
  {
    path: "/do/ciclo/:cicloId/visao-geral",
    element: <PaginaCicloDo />,
  },
  {
    path: "/do/ciclo/:cicloId/cronograma",
    element: <PaginaCicloDoCronograma />,
  },
  {
    path: "/do/ciclo/:cicloId/tarefas",
    element: <PaginaCicloDoTarefas />,
  },
  {
    path: "/do/ciclo/:cicloId/treinamentos",
    element: <PaginaCicloDoTreinamentos />,
  },
  {
    path: "/do/ciclo/:cicloId/treinamentos/criar/sucesso",
    element: <PaginaSucessoTreinamentoCriadoDo />,
  },
  {
    path: "/do/ciclo/:cicloId/treinamentos/criar",
    element: <PaginaCriarTreinamentoDo />,
  },
  {
    path: "/do/ciclo/:cicloId/treinamentos/:treinamentoId/lembrete/sucesso",
    element: <PaginaSucessoLembreteDo />,
  },
  {
    path: "/do/ciclo/:cicloId/treinamentos/:treinamentoId",
    element: <PaginaCicloDoTreinamentoEspecifico />,
  },
  {
    path: "/perfil/editar",
    element: <PaginaEditarPerfil />,
  },
  {
    path: "*",
    element: <PaginaNaoEncontrada />,
  },
]);

import { createBrowserRouter } from "react-router-dom";
import { PaginaLogin } from "../../features/auth";
import { PaginaEditarPerfil, PaginaPerfil } from "../../features/perfil";
import { HomePage } from "../../pages/HomePage";
import { PaginaDo } from "../../pages/PaginaDo";
import { PaginaCicloDo } from "../../pages/PaginaCicloDo";
import { PaginaCicloDoTarefas } from "../../pages/PaginaCicloDoTarefas";
import { PaginaCicloDoTreinamentos } from "../../pages/PaginaCicloDoTreinamentos";
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
    path: "/do/ciclo/:cicloId",
    element: <PaginaCicloDo />,
  },
  {
    path: "/do/ciclo/:cicloId/visao-geral",
    element: <PaginaCicloDo />,
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
    path: "/perfil/editar",
    element: <PaginaEditarPerfil />,
  },
  {
    path: "*",
    element: <PaginaNaoEncontrada />,
  },
]);

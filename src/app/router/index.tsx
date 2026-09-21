import { createBrowserRouter } from "react-router-dom";
import { PaginaLogin } from "../../features/auth";
import { PaginaEditarPerfil, PaginaPerfil } from "../../features/perfil";
import { HomePage } from "../../pages/HomePage";
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
    path: "/perfil/editar",
    element: <PaginaEditarPerfil />,
  },
  {
    path: "*",
    element: <PaginaNaoEncontrada />,
  },
]);

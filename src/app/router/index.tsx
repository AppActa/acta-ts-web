import { createBrowserRouter } from "react-router-dom";
import { PaginaLogin } from "../../features/auth";
import { HomePage } from "../../pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <PaginaLogin />,
  },
]);

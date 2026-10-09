import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
import { router } from "./router";
import { LayoutProporcional } from "../features/layout/components/LayoutProporcional";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
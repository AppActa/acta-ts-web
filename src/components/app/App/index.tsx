import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../../auth/AuthProvider";
import { router } from "../../../app/router";

export function App() {
  return (
    <AuthProvider>
      <>
        <RouterProvider router={router} />
        <footer className="app-footer">
          <small>ACTA · Apoio à melhoria contínua com PDCA</small>
        </footer>
      </>
    </AuthProvider>
  );
}

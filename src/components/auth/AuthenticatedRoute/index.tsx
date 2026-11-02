import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { CarregandoAutenticacao } from "../CarregandoAutenticacao";

export function AuthenticatedRoute() {
  const { firebaseUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <CarregandoAutenticacao />;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}

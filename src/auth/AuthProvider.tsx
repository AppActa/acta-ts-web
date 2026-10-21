import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren,} from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User,} from "firebase/auth";
import type { CurrentUser } from "../contracts/auth";
import { getCurrentActaUser } from "../services/api/auth/auth.api";
import { ApiError } from "../services/http/client";
import { auth } from "../lib/firebase";

type AuthContextValue = {
  firebaseUser: User | null; // perfil ainda pode não existir
  actaUser: CurrentUser | null;
  loading: boolean;
  error: string | null;
  errorStatus: number | null; // identifica conta sem acesso ou perfil não encontrado
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshActaUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mensagemErroPerfil(cause: unknown) {
  if (!(cause instanceof ApiError)) return "Não foi possível carregar seu acesso ao ACTA. Tente novamente.";
  if (cause.status === 401) return "Sua sessão não foi autorizada. Entre novamente e tente outra vez.";
  if (cause.status === 403) return "Sua conta não tem acesso ao ACTA.";
  if (cause.status === 0 || cause.status >= 500) return "O serviço de autenticação está indisponível. Tente novamente em alguns minutos.";
  return "Não foi possível carregar seu acesso ao ACTA. Tente novamente.";
}

export function AuthProvider({ children }: PropsWithChildren) {
  // autenticação separada do perfil
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [actaUser, setActaUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // atualização manual
  const refreshActaUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const usuario = await getCurrentActaUser();
      setActaUser(usuario);
    } catch (cause) {
      setActaUser(null);
      setErrorStatus(cause instanceof ApiError ? cause.status : null);
      setError(mensagemErroPerfil(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let requestId = 0; // evita resposta atrasada substiuir o perfil
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentRequestId = ++requestId;
      setFirebaseUser(user);
      setActaUser(null);
      setError(null);
      setErrorStatus(null);

      if (!user) {
        setLoading(false);
        return;
      }

      if (!user.emailVerified) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // busca de usuário na sessao atual
      void getCurrentActaUser()
        .then((currentUser) => {
          if (requestId === currentRequestId) setActaUser(currentUser);
        })
        .catch((cause: unknown) => {
          if (requestId !== currentRequestId) return;
          setActaUser(null);
          setErrorStatus(cause instanceof ApiError ? cause.status : null);
          setError(mensagemErroPerfil(cause));
        })
        .finally(() => {
          if (requestId === currentRequestId) setLoading(false);
        });
    });

    return () => {
      requestId += 1;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setErrorStatus(null);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  // autenticação com o google
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setErrorStatus(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  }, []);

  // limpa dados locais e encerra a sessão
  const logout = useCallback(async () => {
    setActaUser(null);
    setError(null);
    setErrorStatus(null);
    await signOut(auth);
  }, []);

  const value: AuthContextValue = {
    firebaseUser,
    actaUser,
    loading,
    error,
    errorStatus,
    login,
    loginWithGoogle,
    logout,
    refreshActaUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  return context;
}

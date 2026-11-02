import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import { listarProblemasPorCicloPg, PgReadError, type ProblemaPg } from "../../../services/api/pg/dashboard.read.api";

export type ResultadoProblemasDoCiclo =
  | { estado: "carregando" | "erro" | "indisponivel" }
  | { estado: "sucesso" | "vazio"; dados: readonly ProblemaPg[] };

// Montar somente no conteudo do painel, depois que useCicloDaConta validar o ciclo.
export function useProblemasDoCiclo(idCicloValidado: number): ResultadoProblemasDoCiclo {
  const { firebaseUser, actaUser, loading } = useAuth();
  const uid = firebaseUser?.uid ?? null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0
    && Number.isSafeInteger(idCicloValidado) && idCicloValidado > 0
    ? JSON.stringify([uid, idEmpresa, idCicloValidado]) : null;
  const [snapshot, setSnapshot] = useState<{ chave: string | null; resultado: ResultadoProblemasDoCiclo }>({ chave: null, resultado: { estado: "carregando" } });

  useEffect(() => {
    if (loading || !chave) {
      setSnapshot({ chave: null, resultado: { estado: loading ? "carregando" : "indisponivel" } });
      return;
    }
    const controller = new AbortController();
    setSnapshot({ chave, resultado: { estado: "carregando" } });
    void listarProblemasPorCicloPg(idCicloValidado, controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: dados.length === 0 ? "vazio" : "sucesso", dados } });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const indisponivel = error instanceof PgReadError && error.code !== "UNAVAILABLE";
        setSnapshot({ chave, resultado: { estado: indisponivel ? "indisponivel" : "erro" } });
      });
    return () => controller.abort();
  }, [loading, chave, idCicloValidado]);

  if (loading) return { estado: "carregando" };
  if (!chave) return { estado: "indisponivel" };
  if (snapshot.chave !== chave) return { estado: "carregando" };
  return snapshot.resultado;
}

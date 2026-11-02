import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import { useProblemasDoCiclo } from "./useProblemasDoCiclo";
import { useDadosCheckDoCiclo } from "../../check/hooks/useDadosCheckDoCiclo";
import { useTarefasDoCiclo } from "../../do/hooks/useTarefasDoCiclo";
import { listarCausasRaizPorCicloPg, PgReadError, type CausaRaizPg } from "../../../services/api/pg/dashboard.read.api";

type ResultadoCausas =
  | { estado: "carregando" | "erro" | "indisponivel" }
  | { estado: "sucesso" | "vazio"; dados: readonly CausaRaizPg[] };

type SnapshotCausas = { chave: string | null; resultado: ResultadoCausas };

export function useResumoCicloPlan(idCicloValidado: number) {
  const problemas = useProblemasDoCiclo(idCicloValidado);
  const check = useDadosCheckDoCiclo(idCicloValidado);
  const tarefas = useTarefasDoCiclo(idCicloValidado);
  const { firebaseUser, actaUser, loading } = useAuth();
  const uid = firebaseUser?.uid ?? null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0
    && Number.isSafeInteger(idCicloValidado) && idCicloValidado > 0
    ? JSON.stringify([uid, idEmpresa, idCicloValidado]) : null;
  const [snapshotCausas, setSnapshotCausas] = useState<SnapshotCausas>({ chave: null, resultado: { estado: "carregando" } });

  useEffect(() => {
    if (loading || !chave) {
      setSnapshotCausas({ chave: null, resultado: { estado: loading ? "carregando" : "indisponivel" } });
      return;
    }
    const controller = new AbortController();
    setSnapshotCausas({ chave, resultado: { estado: "carregando" } });
    void listarCausasRaizPorCicloPg(idCicloValidado, controller.signal)
      .then((causas) => {
        if (controller.signal.aborted) return;
        const ids = new Set(causas.map((causa) => causa.id));
        if (causas.some((causa) => causa.idCiclo !== idCicloValidado) || ids.size !== causas.length) {
          setSnapshotCausas({ chave, resultado: { estado: "indisponivel" } });
          return;
        }
        setSnapshotCausas({ chave, resultado: { estado: causas.length === 0 ? "vazio" : "sucesso", dados: causas } });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const indisponivel = error instanceof PgReadError && error.code !== "UNAVAILABLE";
        setSnapshotCausas({ chave, resultado: { estado: indisponivel ? "indisponivel" : "erro" } });
      });
    return () => controller.abort();
  }, [loading, chave, idCicloValidado]);

  const causas: ResultadoCausas = loading ? { estado: "carregando" }
    : !chave ? { estado: "indisponivel" }
      : snapshotCausas.chave !== chave ? { estado: "carregando" }
        : snapshotCausas.resultado;

  return { problemas, causas, check, tarefas };
}

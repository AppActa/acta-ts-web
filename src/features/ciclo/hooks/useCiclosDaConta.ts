import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import { listarCiclosPg } from "../../../services/api/pg/dashboard.read.api";
import type { CicloPg } from "../../../types/pdca";

type DadosResultadoCiclosDaConta =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "sucesso"; ciclos: CicloPg[] };
export type ResultadoCiclosDaConta = DadosResultadoCiclosDaConta & { recarregar: () => void };

type SnapshotCiclos = { chave: string | null; resultado: DadosResultadoCiclosDaConta };

export function useCiclosDaConta(): ResultadoCiclosDaConta {
  const { firebaseUser, actaUser, loading } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO"
    ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa
    ? `${firebaseUser.uid}:${idEmpresa}` : null;
  const [snapshot, setSnapshot] = useState<SnapshotCiclos>({ chave: null, resultado: { estado: "carregando" } });
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((atual) => atual + 1), []);

  useEffect(() => {
    if (loading) {
      setSnapshot({ chave: null, resultado: { estado: "carregando" } });
      return;
    }
    if (!chave || !idEmpresa) {
      setSnapshot({ chave: null, resultado: { estado: "erro" } });
      return;
    }
    const controller = new AbortController();
    setSnapshot({ chave, resultado: { estado: "carregando" } });
    void listarCiclosPg(idEmpresa, controller.signal)
      .then((ciclos) => {
        if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "sucesso", ciclos } });
      })
      .catch(() => {
        if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "erro" } });
      });
    return () => controller.abort();
  }, [loading, chave, idEmpresa, versao]);

  if (loading || (chave && snapshot.chave !== chave)) return { estado: "carregando", recarregar };
  if (!chave) return { estado: "erro", recarregar };
  return snapshot.resultado.estado === "sucesso"
    ? { ...snapshot.resultado, recarregar }
    : { ...snapshot.resultado, recarregar };
}

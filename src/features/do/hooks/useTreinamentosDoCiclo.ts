import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import { listarTreinamentosPorCicloPg, type TreinamentoPg } from "../../../services/api/pg/dashboard.read.api";

type Resultado = { estado: "carregando" | "indisponivel" | "erro"; dados: null } | { estado: "sucesso"; dados: TreinamentoPg[] };
type Snapshot = { chave: string | null; resultado: Resultado };

export function useTreinamentosDoCiclo(idCiclo: number | null): Resultado {
  const { firebaseUser, actaUser, loading } = useAuth();
  const empresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && firebaseUser.uid && empresa && idCiclo && Number.isSafeInteger(idCiclo) && idCiclo > 0
    ? JSON.stringify([firebaseUser.uid, empresa, idCiclo]) : null;
  const [snapshot, setSnapshot] = useState<Snapshot>({ chave: null, resultado: { estado: "carregando", dados: null } });
  useEffect(() => {
    if (!chave || !idCiclo) return;
    const controller = new AbortController();
    setSnapshot({ chave, resultado: { estado: "carregando", dados: null } });
    void listarTreinamentosPorCicloPg(idCiclo, controller.signal).then(dados => {
      if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "sucesso", dados } });
    }).catch(() => {
      if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "erro", dados: null } });
    });
    return () => controller.abort();
  }, [chave, idCiclo]);
  if (loading || (chave && snapshot.chave !== chave)) return { estado: "carregando", dados: null };
  if (!chave) return { estado: "indisponivel", dados: null };
  return snapshot.resultado;
}

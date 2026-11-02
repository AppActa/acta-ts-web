import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import { listarCiclosPg, type CicloPg } from "../../../services/api/pg/dashboard.read.api";

type EstadoInterno = {
  chave: string | null;
  estado: "carregando" | "sucesso" | "erro" | "nao-encontrado";
  ciclo: CicloPg | null;
};

export type ResultadoCicloDaConta =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "nao-encontrado" }
  | { estado: "sucesso"; ciclo: CicloPg };

export function rotuloStatusCiclo(status: CicloPg["status"]): string {
  switch (status) {
    case "PLANEJAMENTO": return "Planejamento";
    case "EXECUCAO": return "Execução";
    case "VERIFICACAO": return "Verificação";
    case "PADRONIZACAO": return "Padronização";
    case "CONCLUIDO": return "Concluído";
    case "CANCELADO": return "Cancelado";
    case "PAUSADO": return "Pausado";
  }
}

function lerIdPositivo(valor: string | undefined): number | null {
  if (!valor || !/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function useCicloDaConta(cicloId: string | undefined): ResultadoCicloDaConta {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const uid = firebaseUser?.uid ?? null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO"
    ? actaUser.idEmpresa
    : null;
  const idCiclo = lerIdPositivo(cicloId);
  const contaAtiva = Boolean(firebaseUser?.emailVerified && uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0);
  const chaveAtual = contaAtiva && idCiclo !== null ? `${uid}:${idEmpresa}:${idCiclo}` : null;
  const [snapshot, setSnapshot] = useState<EstadoInterno>({ chave: null, estado: "carregando", ciclo: null });

  useEffect(() => {
    if (authLoading) {
      setSnapshot({ chave: null, estado: "carregando", ciclo: null });
      return;
    }
    if (!contaAtiva || !idEmpresa) {
      setSnapshot({ chave: null, estado: "erro", ciclo: null });
      return;
    }
    if (idCiclo === null || !chaveAtual) {
      setSnapshot({ chave: null, estado: "nao-encontrado", ciclo: null });
      return;
    }

    const controller = new AbortController();
    setSnapshot({ chave: chaveAtual, estado: "carregando", ciclo: null });

    void listarCiclosPg(idEmpresa, controller.signal)
      .then((ciclos) => {
        if (controller.signal.aborted) return;
        const ciclo = ciclos.find((item) => item.id === idCiclo) ?? null;
        setSnapshot({ chave: chaveAtual, estado: ciclo ? "sucesso" : "nao-encontrado", ciclo });
      })
      .catch(() => {
        if (!controller.signal.aborted) setSnapshot({ chave: chaveAtual, estado: "erro", ciclo: null });
      });

    return () => controller.abort();
  }, [authLoading, contaAtiva, idEmpresa, idCiclo, chaveAtual]);

  if (authLoading) return { estado: "carregando" };
  if (!contaAtiva || !idEmpresa) return { estado: "erro" };
  if (idCiclo === null) return { estado: "nao-encontrado" };
  if (snapshot.chave !== chaveAtual || snapshot.estado === "carregando") return { estado: "carregando" };
  if (snapshot.estado === "erro") return { estado: "erro" };
  if (snapshot.estado === "nao-encontrado" || !snapshot.ciclo) return { estado: "nao-encontrado" };
  return { estado: "sucesso", ciclo: snapshot.ciclo };
}

import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import {
  listarPlanosPorCicloPg,
  listarTarefasPorPlanoPg,
  type PlanoAcaoPg,
  type TarefaDoPlanoPg,
} from "../../../services/api/pg/dashboard.read.api";

type ResultadoDados = {
  planos: readonly PlanoAcaoPg[];
  tarefas: readonly TarefaDoPlanoPg[];
};

type Snapshot = {
  chave: string | null;
  estado: "carregando" | "sucesso" | "vazio" | "erro";
  dados: ResultadoDados | null;
};

export type ResultadoTarefasDoCiclo =
  | { estado: "carregando" }
  | { estado: "indisponivel" }
  | { estado: "erro" }
  | { estado: "vazio"; dados: ResultadoDados }
  | { estado: "sucesso"; dados: ResultadoDados };

const LIMITE_CONCORRENCIA = 3;

export function useTarefasDoCiclo(idCiclo: number | null): ResultadoTarefasDoCiclo {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const uid = firebaseUser?.uid ?? null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO"
    ? actaUser.idEmpresa
    : null;
  const contaAtiva = Boolean(firebaseUser?.emailVerified && uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0);
  const cicloValido = idCiclo !== null && Number.isSafeInteger(idCiclo) && idCiclo > 0;
  const chaveAtual = contaAtiva && cicloValido ? `${uid}:${idEmpresa}:${idCiclo}` : null;
  const [snapshot, setSnapshot] = useState<Snapshot>({ chave: null, estado: "carregando", dados: null });

  useEffect(() => {
    if (authLoading) {
      setSnapshot({ chave: null, estado: "carregando", dados: null });
      return;
    }
    if (!contaAtiva || !idEmpresa || !cicloValido || idCiclo === null || !chaveAtual) {
      setSnapshot({ chave: null, estado: "erro", dados: null });
      return;
    }
    const idCicloValidado = idCiclo;

    const controller = new AbortController();
    setSnapshot({ chave: chaveAtual, estado: "carregando", dados: null });

    async function carregar() {
      try {
        const planos = await listarPlanosPorCicloPg(idCicloValidado, controller.signal);
        if (controller.signal.aborted) return;
        if (planos.some((plano) => plano.idCiclo !== idCicloValidado)) throw new Error("Associação de plano inválida.");

        const tarefasPorPlano: TarefaDoPlanoPg[][] = planos.map(() => []);
        let proximoIndice = 0;
        async function carregarPlano() {
          while (!controller.signal.aborted) {
            const indice = proximoIndice++;
            if (indice >= planos.length) return;
            tarefasPorPlano[indice] = await listarTarefasPorPlanoPg(planos[indice].id, controller.signal);
          }
        }

        await Promise.all(Array.from({ length: Math.min(LIMITE_CONCORRENCIA, planos.length) }, () => carregarPlano()));
        if (controller.signal.aborted) return;
        const tarefas = tarefasPorPlano.flat();
        if (new Set(tarefas.map((tarefa) => tarefa.id)).size !== tarefas.length
          || tarefas.some((tarefa) => !planos.some((plano) => plano.id === tarefa.idPlanoAcao && plano.idCiclo === idCicloValidado))) {
          throw new Error("Associação de tarefa inválida.");
        }
        const dados = { planos, tarefas };
        setSnapshot({ chave: chaveAtual, estado: tarefas.length === 0 ? "vazio" : "sucesso", dados });
      } catch {
        if (!controller.signal.aborted) {
          setSnapshot({ chave: chaveAtual, estado: "erro", dados: null });
          controller.abort();
        }
      }
    }

    void carregar();
    return () => controller.abort();
  }, [authLoading, contaAtiva, idEmpresa, cicloValido, idCiclo, chaveAtual]);

  if (authLoading || (contaAtiva && cicloValido && snapshot.chave !== chaveAtual)) return { estado: "carregando" };
  if (!contaAtiva || !cicloValido || !chaveAtual) return { estado: "indisponivel" };
  if (snapshot.chave !== chaveAtual || snapshot.estado === "carregando") return { estado: "carregando" };
  if (snapshot.estado === "erro" || !snapshot.dados) return { estado: "erro" };
  return snapshot.estado === "vazio"
    ? { estado: "vazio", dados: snapshot.dados }
    : { estado: "sucesso", dados: snapshot.dados };
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarLicoesAprendidasMongo } from "../../../services/api/mongo/dashboard.read.api";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { ConteudoCicloAct, type EstadoConteudoCicloAct } from "../components/ConteudoCicloAct";
import "../styles/pagina-ciclo-act.css";

export function PaginaCicloAct() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const id = ciclo.estado === "sucesso" ? ciclo.ciclo.id : null;
  const empresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.uid && id && empresa ? `${firebaseUser.uid}:${empresa}:${id}` : null;
  const [snapshot, setSnapshot] = useState<{ chave: string; resultado: EstadoConteudoCicloAct } | null>(null);
  useEffect(() => {
    if (!chave || !id || !empresa) return;
    const controller = new AbortController();
    void listarLicoesAprendidasMongo(id, controller.signal).then((licoes) => {
      if (controller.signal.aborted) return;
      if (licoes.some((licao) => licao.idCiclo !== id || licao.idEmpresa !== empresa) || new Set(licoes.map((licao) => licao.id)).size !== licoes.length) throw new Error("Associação inválida.");
      setSnapshot({ chave, resultado: { estado: "sucesso", dados: {
        metricas: { itensPadrao: null, proximaAuditoria: null, licoes: licoes.length },
        documentoPadrao: null, comunicacaoAuditoria: null,
        licoesAprendidas: licoes.length ? { destaque: licoes[0].titulo, descricao: licoes[0].licao } : null,
        progresso: null,
      } } });
    }).catch(() => { if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "erro" } }); });
    return () => controller.abort();
  }, [chave, id, empresa]);
  const resultado: EstadoConteudoCicloAct = !chave ? { estado: ciclo.estado === "carregando" ? "carregando" : "indisponivel" }
    : snapshot?.chave === chave ? snapshot.resultado : { estado: "carregando" };

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-act">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="act" exibirAvisoDemonstrativo={false}>
        <ConteudoCicloAct resultado={resultado} cicloId={id ?? undefined} />
      </PainelCicloPlanDo>
    </main>
  );
}

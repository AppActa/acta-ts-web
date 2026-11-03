import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import { listarFormulariosMongo, listarLicoesAprendidasMongo } from "../../../services/api/mongo/dashboard.read.api";
import type { FormularioMongo } from "../../../types/mongo";
import type { EstadoConteudoCicloAct } from "../../../types/act";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import { ConteudoCicloAct } from "../../../components/act/ConteudoCicloAct";
import { GestaoFormulariosAct } from "../../../components/act/GestaoFormulariosAct";
import "../../../../features/act/styles/pagina-ciclo-act.css";

function DadosAct({ cicloId, empresaId, idUsuario, podeGerenciar }: { cicloId: number; empresaId: number; idUsuario: number; podeGerenciar: boolean }) {
  const [resultado, setResultado] = useState<EstadoConteudoCicloAct>({ estado: "carregando" });
  const [formularios, setFormularios] = useState<FormularioMongo[]>([]);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setResultado({ estado: "carregando" });
    void Promise.all([listarFormulariosMongo(cicloId, controller.signal), listarLicoesAprendidasMongo(cicloId, controller.signal)]).then(([lista, licoes]) => {
      if (controller.signal.aborted) return;
      if ([...lista, ...licoes].some((item) => item.idCiclo !== cicloId || item.idEmpresa !== empresaId)) throw new Error("invalid cycle scope");
      const padroes = lista.filter((item) => item.tipo === "PADRONIZACAO");
      const checklists = lista.filter((item) => item.tipo === "CHECKLIST");
      setFormularios(lista);
      setResultado({ estado: "sucesso", dados: {
        metricas: { itensPadrao: padroes.length, licoes: licoes.length },
        documentoPadrao: padroes.length ? { destaque: `${padroes.length} padrão(ões) registrado(s)`, descricao: padroes.map((item) => item.titulo).join(", ") } : { destaque: "Nenhum padrão registrado.", descricao: null },
        comunicacaoAuditoria: checklists.length ? { destaque: `${checklists.length} checklist(s) de auditoria`, descricao: `${checklists.filter(({ status }) => status === "ATIVO").length} publicado(s)` } : { destaque: "Nenhum checklist de auditoria.", descricao: null },
        licoesAprendidas: licoes.length ? { destaque: `${licoes.length} lição(ões) registrada(s)`, descricao: null } : { destaque: "Nenhuma lição registrada.", descricao: null },
        progresso: null,
      } });
    }).catch(() => { if (!controller.signal.aborted) setResultado({ estado: "erro" }); });
    return () => controller.abort();
  }, [cicloId, empresaId, versao]);

  return <>
    <ConteudoCicloAct cicloId={cicloId} resultado={resultado} />
    <GestaoFormulariosAct cicloId={cicloId} empresaId={empresaId} idUsuario={idUsuario} podeGerenciar={podeGerenciar} aoSalvar={() => setVersao((atual) => atual + 1)} />
  </>;
}

export function PaginaCicloAct() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const autorizado = ciclo.estado === "sucesso" && firebaseUser?.emailVerified && firebaseUser.uid && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && actaUser.idEmpresa === ciclo.ciclo.idEmpresa;
  const podeGerenciar = Boolean(autorizado && actaUser?.estadoPerfil === "PERFIL_CRIADO" && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR") && ciclo.estado === "sucesso" && ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO");

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-act">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="act" exibirAvisoDemonstrativo={false}>
        {autorizado && ciclo.estado === "sucesso" && actaUser?.estadoPerfil === "PERFIL_CRIADO"
          ? <DadosAct key={`${firebaseUser.uid}:${ciclo.ciclo.idEmpresa}:${ciclo.ciclo.id}`} cicloId={ciclo.ciclo.id} empresaId={ciclo.ciclo.idEmpresa} idUsuario={actaUser.idUsuario} podeGerenciar={podeGerenciar} />
          : <ConteudoCicloAct resultado={{ estado: ciclo.estado === "carregando" ? "carregando" : "indisponivel" }} />}
      </PainelCicloPlanDo>
    </main>
  );
}

import { useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import { ConteudoCicloAct } from "../../../components/act/ConteudoCicloAct";
import "../../../../features/act/styles/pagina-ciclo-act.css";

export function PaginaCicloAct() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-act">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="act" exibirAvisoDemonstrativo={false}>
        <ConteudoCicloAct cicloId={ciclo.estado === "sucesso" ? ciclo.ciclo.id : undefined} />
      </PainelCicloPlanDo>
    </main>
  );
}

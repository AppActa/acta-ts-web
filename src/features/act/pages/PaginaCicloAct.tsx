import { useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { ConteudoCicloAct } from "../components/ConteudoCicloAct";
import "../styles/pagina-ciclo-act.css";

export function PaginaCicloAct() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-act">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="act" exibirAvisoDemonstrativo={false}>
        <ConteudoCicloAct />
      </PainelCicloPlanDo>
    </main>
  );
}

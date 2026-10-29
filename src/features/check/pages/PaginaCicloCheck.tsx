import { useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { ConteudoCicloCheck } from "../components/ConteudoCicloCheck";
import "../styles/pagina-ciclo-check.css";

export function PaginaCicloCheck() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-check">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="check" exibirAvisoDemonstrativo={false}>
        <ConteudoCicloCheck />
      </PainelCicloPlanDo>
    </main>
  );
}

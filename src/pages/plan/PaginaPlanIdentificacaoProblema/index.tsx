import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import voltarMoldura from "../../../../features/ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../../../features/ciclos/assets/voltar-seta.svg";
import "../../../../features/ciclo/styles/painel-ciclo-plan-do.css";
import "../../../../features/plan/styles/pagina-plan-identificacao-problema.css";
import { lerIdRotaPositivo } from "../../../utils/route-params";

export function PaginaPlanIdentificacaoProblema() {
  const { cicloId } = useParams();
  const idCiclo = lerIdRotaPositivo(cicloId);
  const criarHref = idCiclo !== null && Number.isSafeInteger(idCiclo) && idCiclo > 0
    ? `/do/ciclo/${idCiclo}/plan/identificacao-problema/criar` : null;

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-identificacao">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan">
        <section className="plan-identificacao_conteudo" aria-labelledby="plan-identificacao-titulo">
          <header className="plan-identificacao_titulo-linha">
            <Link className="plan-identificacao_voltar" to={`/do/ciclo/${cicloId}/plan`} aria-label="Voltar ao resumo Plan">
              <img src={voltarMoldura} alt="" aria-hidden="true" />
              <img src={voltarSeta} alt="" aria-hidden="true" />
            </Link>
            <h2 id="plan-identificacao-titulo">Identificação do problema</h2>
          </header>

          <div className="plan-identificacao_vazio">
            <div className="plan-identificacao_ilustracao" aria-hidden="true">
              {/* # colocar imagem */}
            </div>
            {criarHref ? <Link className="plan-identificacao_adicionar" to={criarHref}>
              Adicionar problema
            </Link> : <button className="plan-identificacao_adicionar" type="button" disabled>Adicionar problema</button>}
          </div>
        </section>
      </PainelCicloPlanDo>
    </main>
  );
}

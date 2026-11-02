import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import voltarMoldura from "../../ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../ciclos/assets/voltar-seta.svg";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-plan-identificacao-problema.css";

export function PaginaPlanIdentificacaoProblema() {
  const { cicloId } = useParams();
  const idCiclo = cicloId && /^\d+$/.test(cicloId) ? Number(cicloId) : null;
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

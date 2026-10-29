import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import voltarMoldura from "../../ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../ciclos/assets/voltar-seta.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-plan-identificacao-problema.css";

export function PaginaPlanIdentificacaoProblema() {
  const { cicloId } = useParams();

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
            <button className="plan-identificacao_adicionar" type="button">
              Adicionar problema
            </button>
          </div>
        </section>
      </PainelCicloPlanDo>
    </main>
  );
}

import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import "../styles/pagina-plan-coleta.css";

export function PaginaPlanColeta() {
  const { cicloId } = useParams();
  const base = `/do/ciclo/${cicloId}/plan`;
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-coleta">
    <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
      <section className="plan-coleta-conteudo" aria-labelledby="plan-coleta-titulo">
        <Link className="plan-coleta_link-voltar" to={base}>← Voltar ao Plan</Link>
        <h2 id="plan-coleta-titulo">Coleta de dados</h2>
        <p className="plan-coleta_subtitulo">Plan</p>
        <div className="plan-coleta_colunas">
          <section className="plan-coleta_painel" aria-labelledby="plan-coleta-serie">
            <h3 id="plan-coleta-serie">Série de acompanhamento</h3>
            <p role="status">Leituras de acompanhamento indisponíveis.</p>
            <button className="plan-coleta_acao" type="button" disabled>Adicionar leitura</button>
          </section>
          <aside className="plan-coleta_painel plan-coleta_acompanhamento" aria-labelledby="plan-coleta-acompanhamento">
            <h3 id="plan-coleta-acompanhamento">Acompanhamento</h3>
            <p className="plan-coleta_total">Registros indisponíveis</p>
            <p>Consulte os dados do ciclo e mantenha as informações atualizadas.</p>
            <button className="plan-coleta_acao" type="button" disabled>Editar coleta de dados</button>
            <Link className="plan-coleta_acao plan-coleta_acao-secundaria" to={`${base}/coleta/nova`}>Criar coleta de dados</Link>
          </aside>
        </div>
      </section>
    </PainelCicloPlanDo>
  </main>;
}

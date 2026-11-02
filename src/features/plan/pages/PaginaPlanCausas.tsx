import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listarCausasRaizPorCicloPg, type CausaRaizPg } from "../../../services/api/pg/dashboard.read.api";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import "../styles/pagina-plan-detalhe-problema.css";

type EstadoCausas = { estado: "carregando" | "erro" } | { estado: "sucesso"; causas: CausaRaizPg[] };

function CausasDoCiclo({ cicloId }: { cicloId: number }) {
  const [dados, setDados] = useState<EstadoCausas>({ estado: "carregando" });
  useEffect(() => {
    const controller = new AbortController();
    setDados({ estado: "carregando" });
    void listarCausasRaizPorCicloPg(cicloId, controller.signal).then((causas) => {
      if (controller.signal.aborted) return;
      if (causas.some((causa) => causa.idCiclo !== cicloId) || new Set(causas.map((causa) => causa.id)).size !== causas.length) {
        setDados({ estado: "erro" });
        return;
      }
      setDados({ estado: "sucesso", causas });
    }).catch(() => { if (!controller.signal.aborted) setDados({ estado: "erro" }); });
    return () => controller.abort();
  }, [cicloId]);
  const causas = dados.estado === "sucesso" ? dados.causas : null;
  return <section className="plan-detalhe-problema" aria-labelledby="plan-causas-titulo">
    <Link className="plan-detalhe-problema_voltar" to={`/do/ciclo/${cicloId}/plan`}>← Voltar ao Plan</Link>
    <h2 id="plan-causas-titulo">Análise de causas</h2><p className="plan-detalhe-problema_subtitulo">Plan</p>
    <div className="plan-detalhe-problema_colunas">
      <section className="plan-detalhe-problema_cartao" aria-labelledby="plan-causas-lista">
        <h3 id="plan-causas-lista">Causas levantadas</h3>
        {causas ? causas.length ? <dl>{causas.map((causa) => <div key={causa.id}><dt>{causa.aceita === null ? "Aguardando validação" : causa.aceita ? "Aceita" : "Não aceita"}</dt><dd>{causa.descricao}</dd><dd><Link to={`/do/ciclo/${cicloId}/plan/causas/${causa.id}/editar`}>Editar causa</Link></dd></div>)}</dl> : <p role="status">Nenhuma causa registrada neste ciclo.</p> : <p role={dados.estado === "erro" ? "alert" : "status"}>{dados.estado === "carregando" ? "Carregando causas..." : "Não foi possível carregar as causas."}</p>}
      </section>
      <aside className="plan-detalhe-problema_cartao plan-detalhe-problema_acoes" aria-labelledby="plan-causas-acompanhamento">
        <h3 id="plan-causas-acompanhamento">Acompanhamento</h3>
        <p className="plan-detalhe-problema_status">{causas ? `${causas.length} ${causas.length === 1 ? "causa" : "causas"}` : "Indisponível"}</p>
        <p>Organize as hipóteses no Ishikawa e aprofunde a investigação com os porquês.</p>
        <button type="button" disabled>Editar causa</button><Link to={`/do/ciclo/${cicloId}/plan/causas/criar`}>Criar causa</Link><Link to={`/do/ciclo/${cicloId}/plan/porques`}>Ver 5 Porquês</Link><Link to={`/do/ciclo/${cicloId}/plan/ishikawa`}>Ver Ishikawa</Link>
      </aside>
    </div>
  </section>;
}

export function PaginaPlanCausas() {
  const { cicloId } = useParams();
  const id = Number(cicloId);
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan"><PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
    {Number.isSafeInteger(id) && id > 0 ? <CausasDoCiclo key={id} cicloId={id} /> : <p role="alert">Ciclo inválido.</p>}
  </PainelCicloPlanDo></main>;
}

import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../features/ciclo/components/PainelCicloPlanDo";
import progressoPlan from "../features/ciclo/assets/progresso-plan.svg";
import "../features/perfil/styles/pagina-perfil.css";
import "../features/ciclo/styles/painel-ciclo-plan-do.css";
import "./pagina-ciclo-plan.css";

const indicadores = [
  { titulo: "Identificação do problema", estado: "Enviado", descricao: "Problema: divergências na separação" },
  { titulo: "Coleta de dados", estado: "Enviada", descricao: "Série semanal • 12 semanas • última coleta 05 out" },
  { titulo: "Análise de causas", estado: "Enviada", descricao: "6 causas mapeadas • 2 priorizadas • 5 Porquês respondidos" },
  { titulo: "Meta e indicador", estado: "Definida", descricao: "Meta ≤ 3,0% • atual 8,4% • frequência semanal" },
  { titulo: "Plano de ação 5W2H", estado: "Pendente revisão", descricao: "4 ações • 1 responsável atribuído • prazo até 30 nov" },
];

export function PaginaCicloPlan() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" tituloCiclo="Nome do ciclo">
        <div className="plan-resumo-conteudo">
          {indicadores.map((indicador) => (
            <article className="plan-indicador" key={indicador.titulo}>
              <h2>{indicador.titulo}</h2>
              <span className="plan-indicador_estado">{indicador.estado}</span>
              <p>{indicador.descricao}</p>
              {indicador.titulo === "Coleta de dados"
                ? <Link className="plan-indicador_detalhes" to={`/do/ciclo/${cicloId}/plan/coleta`}>Ver detalhes →</Link>
                : <span className="plan-indicador_detalhes">Ver detalhes →</span>}
            </article>
          ))}
          <article className="plan-progresso">
            <div className="plan-progresso_grafico"><img src={progressoPlan} alt="" /><strong>80%</strong></div>
            <div className="plan-progresso_texto"><h2>Etapas do planejamento</h2><strong>4 de 5 indicadores prontos</strong><p>Problema, coleta, causas e meta concluídos.</p><div className="plan-progresso_legenda"><span><i className="concluido" />Concluído</span><span><i className="pendente" />Pendente</span></div></div>
          </article>
        </div>
      </PainelCicloPlanDo>
    </main>
  );
}

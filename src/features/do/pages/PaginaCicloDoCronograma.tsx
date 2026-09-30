import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import "../../perfil/styles/pagina-perfil.css";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-ciclo-do-cronograma.css";

const tarefas = [
  { titulo: "Padronizar conferência dupla", responsavel: "Camila Souza", periodo: "12–16 out", progresso: 36 },
  { titulo: "Treinar equipe por turno", responsavel: "Rafael Lima", periodo: "16–20 out", progresso: 50 },
  { titulo: "Substituir leitores críticos", responsavel: "Mariana Costa", periodo: "20–30 out", progresso: 65 },
  { titulo: "Validar resultado", responsavel: "Catarina Cândido", periodo: "30 out", progresso: 36 },
];

export function PaginaCicloDoCronograma() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-do-cronograma">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="do" tituloCiclo="Redução do tempo de atendimento">
        <div className="cronograma-conteudo">
          <div className="cronograma-titulo"><Link to={`/do/ciclo/${cicloId}/tarefas`} aria-label="Voltar às tarefas">‹</Link><h2>Cronograma</h2></div>
          <section className="cronograma-gantt" aria-labelledby="cronograma-gantt_titulo">
            <h3 id="cronograma-gantt_titulo">Cronograma Gantt</h3>
            <div className="cronograma-datas" aria-hidden="true"><span>12 out</span><span>16 out</span><span>20 out</span><span>24 out</span><span>30 out</span></div>
            {tarefas.map((tarefa) => (
              <div className="cronograma-linha" key={tarefa.titulo}>
                <div className="cronograma-tarefa"><span>{tarefa.titulo}</span><small>{tarefa.responsavel} · {tarefa.periodo}</small></div>
                <div className="cronograma-trilho" role="img" aria-label={`${tarefa.titulo}: ${tarefa.progresso}% do prazo`}><span style={{ width: `${tarefa.progresso}%` }} /></div>
              </div>
            ))}
            <p className="cronograma-bloqueio">Tarefa de leitores bloqueada pela compra · reabrir com novo prazo ou reatribuir.</p>
          </section>
        </div>
      </PainelCicloPlanDo>
    </main>
  );
}

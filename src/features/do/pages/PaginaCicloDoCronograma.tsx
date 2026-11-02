import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { useTarefasDoCiclo } from "../hooks/useTarefasDoCiclo";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-ciclo-do-cronograma.css";

function instanteData(data: string): number {
  const partes = data.split("/");
  return Date.parse(partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}T00:00:00Z` : data);
}

export function PaginaCicloDoCronograma() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const resultado = useTarefasDoCiclo(ciclo.estado === "sucesso" ? ciclo.ciclo.id : null);
  const tarefas = resultado.estado === "sucesso" || resultado.estado === "vazio" ? resultado.dados.tarefas : [];
  const datas = tarefas.flatMap((tarefa) => [tarefa.dataInicioReal, tarefa.dataFimPrevista]
    .filter((data): data is string => Boolean(data))
    .map(instanteData).filter(Number.isFinite));
  const inicio = datas.length ? Math.min(...datas) : 0;
  const fim = datas.length ? Math.max(...datas) : 0;
  const formato = (data: string | null) => data ? new Date(instanteData(data)).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não informado";

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-do-cronograma">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="do" exibirAvisoDemonstrativo={false}>
        <div className="cronograma-conteudo">
          <div className="cronograma-titulo"><Link to={`/do/ciclo/${cicloId}/tarefas`} aria-label="Voltar às tarefas">‹</Link><h2>Cronograma</h2></div>
          <section className="cronograma-gantt" aria-labelledby="cronograma-gantt_titulo">
            <h3 id="cronograma-gantt_titulo">Cronograma Gantt</h3>
            {resultado.estado === "carregando" && <p role="status">Carregando tarefas do ciclo...</p>}
            {(resultado.estado === "erro" || resultado.estado === "indisponivel") && <p role="alert">Não foi possível carregar o cronograma deste ciclo.</p>}
            {resultado.estado === "vazio" && <p role="status">Nenhuma tarefa encontrada neste ciclo.</p>}
            {datas.length > 0 && <div className="cronograma-datas"><span>{formato(new Date(inicio).toISOString())}</span><span>{formato(new Date(fim).toISOString())}</span></div>}
            {tarefas.map((tarefa) => (
              <div className="cronograma-linha" key={tarefa.id}>
                <div className="cronograma-tarefa"><span>{tarefa.titulo}</span><small>{tarefa.nomeResponsavel || "Responsável não informado"} · Início: {formato(tarefa.dataInicioReal)} · Prazo: {formato(tarefa.dataFimPrevista)}</small></div>
                {tarefa.dataInicioReal && tarefa.dataFimPrevista && instanteData(tarefa.dataFimPrevista) >= instanteData(tarefa.dataInicioReal)
                  ? <div className="cronograma-trilho" role="img" aria-label={`Início: ${formato(tarefa.dataInicioReal)}; prazo: ${formato(tarefa.dataFimPrevista)}`}><span style={{ marginLeft: `${fim === inicio ? 0 : (instanteData(tarefa.dataInicioReal) - inicio) / (fim - inicio) * 100}%`, width: `${fim === inicio ? 100 : Math.max(1, (instanteData(tarefa.dataFimPrevista) - instanteData(tarefa.dataInicioReal)) / (fim - inicio) * 100)}%` }} /></div>
                  : <small>Período incompleto para exibir no gráfico.</small>}
              </div>
            ))}
          </section>
        </div>
      </PainelCicloPlanDo>
    </main>
  );
}

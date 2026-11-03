import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useTarefasDoCiclo } from "../../../features/do/hooks/useTarefasDoCiclo";
import type { StatusTarefaPg, TarefaDoPlanoPg } from "../../../types/pdca";
import "../../../../features/ciclo/styles/painel-ciclo-plan-do.css";
import "../../../../features/do/styles/pagina-ciclo-do-cronograma.css";

const DIA = 24 * 60 * 60 * 1000;
const rotulosStatus: Record<StatusTarefaPg, string> = {
  PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", BLOQUEADA: "Bloqueada",
  CONCLUIDA: "Concluída", ATRASADA: "Atrasada", CANCELADA: "Cancelada",
};

function instanteData(data: string | null): number | null {
  if (!data) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  const partes = iso ? [Number(iso[1]), Number(iso[2]), Number(iso[3])] : br ? [Number(br[3]), Number(br[2]), Number(br[1])] : null;
  if (!partes) return null;
  const [ano, mes, dia] = partes;
  const valor = Date.UTC(ano, mes - 1, dia);
  const dataValida = new Date(valor);
  return dataValida.getUTCFullYear() === ano && dataValida.getUTCMonth() === mes - 1 && dataValida.getUTCDate() === dia ? valor : null;
}

function dataCurta(valor: number): string {
  return new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(" de ", " ");
}

function tituloMes(valor: number): string {
  return new Date(valor).toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });
}

function dadosDaTarefa(tarefa: TarefaDoPlanoPg) {
  const inicio = instanteData(tarefa.dataInicioReal);
  const previsto = instanteData(tarefa.dataFimPrevista);
  const fimReal = instanteData(tarefa.dataFimReal);
  const fim = tarefa.status === "CONCLUIDA" ? fimReal ?? previsto : previsto;
  return { inicio, fim, marco: inicio === null ? fim : null };
}

function LinhaCronograma({ tarefa, cicloId, inicio, fim, meses }: { tarefa: TarefaDoPlanoPg; cicloId: string | undefined; inicio: number; fim: number; meses: readonly number[] }) {
  const periodo = Math.max(DIA, fim - inicio);
  const datas = dadosDaTarefa(tarefa);
  const inicioBarra = datas.inicio === null ? null : Math.max(inicio, Math.min(fim, datas.inicio));
  const fimBarra = datas.fim === null ? null : Math.max(inicio, Math.min(fim, datas.fim));
  const esquerda = inicioBarra === null ? 0 : ((inicioBarra - inicio) / periodo) * 100;
  const largura = inicioBarra === null || fimBarra === null ? 0 : Math.max(1, ((Math.max(inicioBarra, fimBarra) - inicioBarra) / periodo) * 100);
  const marco = datas.marco === null ? null : Math.max(inicio, Math.min(fim, datas.marco));
  const classeStatus = tarefa.status.toLowerCase().replaceAll("_", "-");
  const inicioRotulo = datas.inicio === null ? "Início não registrado" : `Início real: ${dataCurta(datas.inicio)}`;
  const fimRotulo = datas.fim === null ? "Prazo não informado" : `${tarefa.status === "CONCLUIDA" && tarefa.dataFimReal ? "Concluída em" : "Prazo"}: ${dataCurta(datas.fim)}`;

  return (
    <div className="cronograma-linha">
      <div className="cronograma-tarefa">
        <Link to={`/do/ciclo/${cicloId}/tarefas/${tarefa.id}`} aria-label={`Abrir tarefa: ${tarefa.titulo}`}>{tarefa.titulo}</Link>
        <small>{tarefa.nomeResponsavel || "Responsável não informado"} · {inicioRotulo} · {fimRotulo}</small>
        <span className={`cronograma-status cronograma-status-${classeStatus}`}>{rotulosStatus[tarefa.status]}</span>
      </div>
      <div className="cronograma-trilho" aria-label={`Linha do tempo: ${tarefa.titulo}`}>
        {meses.map((mes) => <i key={mes} className="cronograma-mes-linha" style={{ left: `${((mes - inicio) / periodo) * 100}%` }} aria-hidden="true" />)}
        {inicioBarra !== null && fimBarra !== null && <span className={`cronograma-barra cronograma-barra-${classeStatus}`} style={{ left: `${esquerda}%`, width: `${largura}%` }} title={`${inicioRotulo}; ${fimRotulo}`} />}
        {marco !== null && <span className={`cronograma-marco cronograma-marco-${classeStatus}`} style={{ left: `${((marco - inicio) / periodo) * 100}%` }} title={fimRotulo} aria-label={fimRotulo} />}
      </div>
    </div>
  );
}

export function PaginaCicloDoCronograma() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const resultado = useTarefasDoCiclo(ciclo.estado === "sucesso" ? ciclo.ciclo.id : null);
  const [filtro, setFiltro] = useState<StatusTarefaPg | "TODAS">("TODAS");
  const tarefas = resultado.estado === "sucesso" || resultado.estado === "vazio" ? resultado.dados.tarefas : [];
  const tarefasFiltradas = filtro === "TODAS" ? tarefas : tarefas.filter((tarefa) => tarefa.status === filtro);
  const agora = new Date();
  const dataHoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const cronograma = useMemo(() => {
    const valores = [
      ciclo.estado === "sucesso" ? instanteData(ciclo.ciclo.dataInicio) : null,
      ciclo.estado === "sucesso" ? instanteData(ciclo.ciclo.dataEstimadaFim) : null,
      dataHoje,
      ...tarefasFiltradas.flatMap((tarefa) => [instanteData(tarefa.dataInicioReal), instanteData(tarefa.dataFimPrevista), instanteData(tarefa.dataFimReal)]),
    ].filter((valor): valor is number => valor !== null);
    const menorData = Math.min(...valores);
    const maiorData = Math.max(...valores);
    let inicio = Date.UTC(new Date(menorData).getUTCFullYear(), new Date(menorData).getUTCMonth(), 1);
    let fim = Date.UTC(new Date(maiorData).getUTCFullYear(), new Date(maiorData).getUTCMonth() + 1, 0);
    if (fim - inicio < DIA) { inicio -= 7 * DIA; fim += 7 * DIA; }
    const meses: number[] = [];
    const cursor = new Date(Date.UTC(new Date(inicio).getUTCFullYear(), new Date(inicio).getUTCMonth(), 1));
    while (cursor.getTime() <= fim) {
      meses.push(cursor.getTime());
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return { inicio, fim, meses, hoje: dataHoje >= inicio && dataHoje <= fim ? ((dataHoje - inicio) / (fim - inicio)) * 100 : null };
  }, [ciclo, dataHoje, tarefasFiltradas]);

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-do-cronograma">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="do" exibirAvisoDemonstrativo={false}>
        <div className="cronograma-conteudo">
          <div className="cronograma-titulo"><Link to={`/do/ciclo/${cicloId}/tarefas`} aria-label="Voltar às tarefas">←</Link><div><h2>Cronograma</h2><p>Acompanhe prazos e andamento das tarefas do ciclo.</p></div></div>
          <section className="visualizacao-dados cronograma-gantt" aria-labelledby="cronograma-gantt_titulo">
            <div className="cronograma-cabecalho"><div><h3 id="cronograma-gantt_titulo">Cronograma Gantt</h3><p>{tarefasFiltradas.length} {tarefasFiltradas.length === 1 ? "tarefa" : "tarefas"} no período</p></div>
              <label>Exibir <select value={filtro} onChange={(evento) => setFiltro(evento.target.value as StatusTarefaPg | "TODAS")}><option value="TODAS">Todas as tarefas</option>{Object.entries(rotulosStatus).map(([status, rotulo]) => <option key={status} value={status}>{rotulo}</option>)}</select></label>
            </div>
            {resultado.estado === "carregando" && <CarregandoConteudo compacto mensagem="Carregando tarefas do ciclo" />}
            {(resultado.estado === "erro" || resultado.estado === "indisponivel") && <p role="alert">Não foi possível carregar o cronograma deste ciclo.</p>}
            {resultado.estado === "vazio" && <p role="status">Nenhuma tarefa encontrada neste ciclo.</p>}
            {resultado.estado !== "carregando" && resultado.estado !== "erro" && resultado.estado !== "indisponivel" && resultado.estado !== "vazio" && tarefasFiltradas.length === 0 && <p role="status">Nenhuma tarefa corresponde a este filtro.</p>}
            {tarefasFiltradas.length > 0 && <div className="cronograma-rolagem" tabIndex={0} aria-label="Cronograma horizontal; use as setas para navegar">
              <div className="cronograma-grade">
                <div className="cronograma-eixo"><span className="cronograma-eixo_rotulo">Tarefa</span><div className="cronograma-eixo_tempo">{cronograma.meses.map((mes) => <span key={mes} style={{ left: `${((mes - cronograma.inicio) / (cronograma.fim - cronograma.inicio)) * 100}%` }}>{tituloMes(mes)}</span>)}</div></div>
                {cronograma.hoje !== null && <div className="cronograma-hoje" style={{ left: `calc(298px + (100% - 298px) * ${cronograma.hoje / 100})` }}><span>Hoje · {dataCurta(dataHoje)}</span></div>}
                {tarefasFiltradas.map((tarefa) => <LinhaCronograma key={tarefa.id} tarefa={tarefa} cicloId={cicloId} inicio={cronograma.inicio} fim={cronograma.fim} meses={cronograma.meses} />)}
              </div>
            </div>}
            {tarefasFiltradas.length > 0 && <div className="cronograma-legenda" aria-label="Legenda do cronograma"><span><i className="cronograma-legenda_barra" /> Período com início real</span><span><i className="cronograma-legenda_marco" /> Prazo sem início registrado</span><span><i className="cronograma-legenda_hoje" /> Hoje</span></div>}
          </section>
        </div>
      </PainelCicloPlanDo>
    </main>
  );
}

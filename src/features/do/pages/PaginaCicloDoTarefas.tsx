import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import { useCicloDaConta, rotuloStatusCiclo } from "../../ciclo/hooks/useCicloDaConta";
import { useTarefasDoCiclo } from "../hooks/useTarefasDoCiclo";
import iconeVisaoGeral from "../assets/ciclo-visao-geral/063c5.svg";
import iconePlan from "../assets/ciclo-visao-geral/47893.svg";
import iconeDo from "../assets/ciclo-visao-geral/d01c2.svg";
import iconeCheck from "../assets/ciclo-visao-geral/fe2f6.svg";
import iconeAct from "../assets/ciclo-visao-geral/a51ff.svg";
import relogio from "../assets/ciclo-do/relogio.svg";
import iconeMais from "../assets/ciclo-do/mais.svg";
import "../styles/pagina-ciclo-do-tarefas.css";

const statusTarefa = [
  { valor: "PENDENTE", titulo: "Pendente", classe: "pendente" },
  { valor: "EM_ANDAMENTO", titulo: "Em andamento", classe: "andamento" },
  { valor: "CONCLUIDA", titulo: "Concluída", classe: "concluidas" },
  { valor: "BLOQUEADA", titulo: "Bloqueada", classe: "bloqueada" },
  { valor: "ATRASADA", titulo: "Atrasada", classe: "atrasada" },
  { valor: "CANCELADA", titulo: "Cancelada", classe: "cancelada" },
] as const;

type StatusTarefa = (typeof statusTarefa)[number]["valor"];

function rotuloStatusTarefa(status: StatusTarefa): string {
  return statusTarefa.find((item) => item.valor === status)?.titulo ?? "Status indisponível";
}

function AbasDoCiclo({ cicloId }: { cicloId: number }) {
  return (
    <nav className="ciclo-do_tarefas_abas" aria-label="Etapas do ciclo">
      <Link to={`/do/ciclo/${cicloId}/visao-geral`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-visao"><img src={iconeVisaoGeral} alt="" />Visão geral</Link>
      <Link to={`/do/ciclo/${cicloId}/plan`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-plan"><img src={iconePlan} alt="" />Plan</Link>
      <Link to={`/do/ciclo/${cicloId}/tarefas`} aria-current="page" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-do"><span className="ciclo-do_tarefas_icone-do"><img src={iconeDo} alt="" /></span>Do</Link>
      <Link to={`/do/ciclo/${cicloId}/check`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-check"><img src={iconeCheck} alt="" />Checar</Link>
      <Link to={`/do/ciclo/${cicloId}/act`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-act"><img src={iconeAct} alt="" />Agir</Link>
    </nav>
  );
}

export function PaginaCicloDoTarefas() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const resultadoTarefas = useTarefasDoCiclo(resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo.id : null);
  const [filtro, setFiltro] = useState<"todas" | "atrasadas">("todas");

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-ciclo-do-tarefas">
        <Sidebar />
        <div className="ciclo-do_tarefas_painel">
          <section className="ciclo-do_tarefas_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </main>
    );
  }
  const ciclo = resultadoCiclo.ciclo;
  const dadosDisponiveis = resultadoTarefas.estado === "sucesso" || resultadoTarefas.estado === "vazio";
  const tarefas = dadosDisponiveis ? resultadoTarefas.dados.tarefas : [];
  const tarefasVisiveis = filtro === "atrasadas" ? tarefas.filter((tarefa) => tarefa.status === "ATRASADA") : tarefas;
  const contagemPorStatus = (status: StatusTarefa) => tarefas.filter((tarefa) => tarefa.status === status).length;

  return (
    <main className="pagina-ciclo-do-tarefas">
      <Sidebar />
      <div className="ciclo-do_tarefas_painel">
        <header className="ciclo-do_tarefas_cabecalho">
          <div className="ciclo-do_tarefas_icone" aria-hidden="true"><img src={relogio} alt="" /></div>
          <div className="ciclo-do_tarefas_identificacao"><div className="ciclo-do_tarefas_linha"><h1>{ciclo.titulo}</h1><span className="ciclo-do_tarefas_status">Status: {rotuloStatusCiclo(ciclo.status)}</span></div><p><span>Responsável pelo ciclo:</span> Não informado</p><p><span>Iniciado em:</span> {ciclo.dataInicio ?? "Não informado"}</p><p><span>Prazo final:</span> {ciclo.dataEstimadaFim ?? "Não informado"}</p></div>
        </header>
        <AbasDoCiclo cicloId={ciclo.id} />
        <div className="ciclo-do_tarefas_conteudo">
          <section className="ciclo-do_quadro">
            <div className="ciclo-do_tarefas_titulo"><h2>Quadro de tarefas</h2><Link className="ciclo-do_tarefas_criar" to={`/do/ciclo/${ciclo.id}/tarefas/criar`}><img src={iconeMais} alt="" />Criar nova</Link></div>
            {dadosDisponiveis && <div className="ciclo-do_filtros" aria-label="Filtrar tarefas"><button type="button" aria-pressed={filtro === "todas"} onClick={() => setFiltro("todas")}>Todas ({tarefas.length})</button><button type="button" aria-pressed={filtro === "atrasadas"} onClick={() => setFiltro("atrasadas")}>Atrasadas ({contagemPorStatus("ATRASADA")})</button></div>}
            <div className="ciclo-do_kanban">
              <p className="ciclo-do_kanban_instrucao">Organize as ações por etapa de execução.</p>
              {dadosDisponiveis ? statusTarefa.map((coluna) => (
                <section className={`ciclo-do_coluna ciclo-do_coluna-${coluna.classe}`} key={coluna.valor} aria-labelledby={`tarefas-status-${coluna.valor}`}>
                  <h3 id={`tarefas-status-${coluna.valor}`}>{coluna.titulo} · {tarefasVisiveis.filter((tarefa) => tarefa.status === coluna.valor).length}</h3>
                  {tarefasVisiveis.filter((tarefa) => tarefa.status === coluna.valor).map((tarefa) => (
                    <Link className="ciclo-do_tarefa ciclo-do_tarefa_link" key={tarefa.id} to={`/do/ciclo/${ciclo.id}/tarefas/${tarefa.id}`} aria-label={`${tarefa.titulo}. Status: ${rotuloStatusTarefa(tarefa.status)}. Abrir detalhes`}>
                      <strong>{tarefa.titulo}</strong>
                      <span>{tarefa.nomeResponsavel?.trim() || "Não informado"}</span>
                      <time>{tarefa.dataFimPrevista ?? "Prazo não informado"}</time>
                      <span className="ciclo-do_tarefa_status" data-estado={tarefa.status}>{rotuloStatusTarefa(tarefa.status)}</span>
                    </Link>
                  ))}
                </section>
              )) : <p className="ciclo-do_tarefas_estado" role={resultadoTarefas.estado === "erro" || resultadoTarefas.estado === "indisponivel" ? "alert" : "status"} aria-live="polite">
                {resultadoTarefas.estado === "carregando" ? "Carregando tarefas do ciclo."
                  : resultadoTarefas.estado === "erro" ? "Não foi possível carregar todas as tarefas deste ciclo. O quadro está indisponível."
                    : "As tarefas deste ciclo estão indisponíveis para esta conta."}
              </p>}
              {resultadoTarefas.estado === "vazio" && <p className="ciclo-do_tarefas_estado" role="status">Nenhuma tarefa encontrada para este ciclo.</p>}
            </div>
          </section>

          <section className="ciclo-do_resumo_lateral">
            <h2>Resumo das tarefas</h2>
            {dadosDisponiveis ? <div className="ciclo-do_contadores">
              <article><span>Total de tarefas</span><strong>{tarefas.length}</strong></article>
              {statusTarefa.map((item) => <article key={item.valor} data-estado={item.valor}><span>{item.titulo}</span><strong>{contagemPorStatus(item.valor)}</strong></article>)}
            </div> : <p className="ciclo-do_tarefas_estado" role="status">{resultadoTarefas.estado === "carregando" ? "Resumo carregando." : "Resumo indisponível sem a lista completa de tarefas."}</p>}
            <Link className="ciclo-do_abrir_cronograma" to={`/do/ciclo/${cicloId}/cronograma`}>Abrir cronograma</Link>
            <Link className="ciclo-do_abrir_cronograma" to={`/do/ciclo/${cicloId}/treinamentos`}>Abrir treinamentos</Link>
          </section>
        </div>
      </div>
    </main>
  );
}

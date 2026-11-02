import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { StatusTarefaPg, TarefaDoPlanoPg } from "../../../types/pdca";
import { useAuth } from "../../../components/auth/AuthProvider";
import { atualizarStatusTarefaPg } from "../../../services/api/pg/pdca.write.api";
import { listarTarefasPorPlanoPg } from "../../../services/api/pg/dashboard.read.api";
import { ApiError } from "../../../services/http/client";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CabecalhoNavegacaoCiclo } from "../../../components/ciclo/CabecalhoNavegacaoCiclo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useTarefasDoCiclo } from "../../../features/do/hooks/useTarefasDoCiclo";
import iconeMais from "../../../../features/do/assets/ciclo-do/mais.svg";
import "../../../../features/do/styles/pagina-ciclo-do-tarefas.css";

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

export function PaginaCicloDoTarefas() {
  const { cicloId } = useParams();
  const { firebaseUser, actaUser } = useAuth();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const resultadoTarefas = useTarefasDoCiclo(resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo.id : null);
  const [filtro, setFiltro] = useState<"todas" | "atrasadas">("todas");
  const [tarefasConfirmadas, setTarefasConfirmadas] = useState<ReadonlyMap<number, TarefaDoPlanoPg>>(() => new Map());
  const [tarefaEmMovimento, setTarefaEmMovimento] = useState<number | null>(null);
  const [tarefaArrastada, setTarefaArrastada] = useState<number | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<StatusTarefa | null>(null);
  const [mensagemMovimento, setMensagemMovimento] = useState("");
  const kanbanColunasRef = useRef<HTMLDivElement>(null);
  const controllerMovimento = useRef<AbortController | null>(null);
  const transicoes: Partial<Record<StatusTarefa, readonly StatusTarefa[]>> = {
    PENDENTE: ["EM_ANDAMENTO", "CANCELADA"],
    BLOQUEADA: ["EM_ANDAMENTO", "CANCELADA"],
    EM_ANDAMENTO: ["BLOQUEADA", "CONCLUIDA", "CANCELADA"],
    ATRASADA: ["EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"],
  };
  const cicloAtual = resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo : null;
  const dadosDisponiveis = resultadoTarefas.estado === "sucesso" || resultadoTarefas.estado === "vazio";
  const podeAlterarStatus = Boolean(firebaseUser?.emailVerified && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO"
    && cicloAtual && actaUser.idEmpresa === cicloAtual.idEmpresa && ["ADMIN", "GESTOR", "COLABORADOR"].includes(actaUser.tipo)
    && cicloAtual.status !== "CONCLUIDO" && cicloAtual.status !== "CANCELADO");

  useEffect(() => () => controllerMovimento.current?.abort(), []);
  useEffect(() => {
    if (dadosDisponiveis) kanbanColunasRef.current?.scrollTo({ left: 0 });
  }, [cicloId, dadosDisponiveis]);

  async function moverTarefa(tarefa: TarefaDoPlanoPg, statusDestino: StatusTarefa) {
    if (!podeAlterarStatus || tarefaEmMovimento !== null || statusDestino === tarefa.status
      || !transicoes[tarefa.status]?.includes(statusDestino)) return;
    const controller = new AbortController();
    controllerMovimento.current?.abort();
    controllerMovimento.current = controller;
    setTarefaEmMovimento(tarefa.id);
    setMensagemMovimento("");
    const agora = new Date();
    const data = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    try {
      await atualizarStatusTarefaPg(tarefa.id, tarefa.idPlanoAcao, statusDestino, data, controller.signal);
      const listaConfirmada = await listarTarefasPorPlanoPg(tarefa.idPlanoAcao, controller.signal);
      const tarefaConfirmada = listaConfirmada.find((item) => item.id === tarefa.id && item.idPlanoAcao === tarefa.idPlanoAcao && item.status === statusDestino);
      if (!tarefaConfirmada) throw new Error("A API não confirmou a alteração do status.");
      if (!controller.signal.aborted) {
        setTarefasConfirmadas((atuais) => new Map(atuais).set(tarefa.id, tarefaConfirmada));
        setMensagemMovimento(`Tarefa movida para ${rotuloStatusTarefa(statusDestino)}.`);
      }
    } catch (erro) {
      if (controller.signal.aborted) return;
      if (erro instanceof ApiError && [400, 401, 403, 409, 422].includes(erro.status)) {
        setMensagemMovimento("A API não permitiu a mudança de status. A tarefa permaneceu na coluna atual.");
      } else {
        setMensagemMovimento("Não foi possível confirmar a mudança. Recarregue o quadro para conferir o status da tarefa.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setTarefaEmMovimento(null);
        controllerMovimento.current = null;
      }
    }
  }

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-ciclo-do-tarefas">
        <Sidebar />
        <div className="ciclo-do_tarefas_painel">
          <section className="ciclo-do_tarefas_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </main>
    );
  }
  const ciclo = resultadoCiclo.ciclo;
  const tarefasBase = dadosDisponiveis ? resultadoTarefas.dados.tarefas : [];
  const tarefas = tarefasBase.map((tarefa) => tarefasConfirmadas.get(tarefa.id) ?? tarefa);
  const tarefasVisiveis = filtro === "atrasadas" ? tarefas.filter((tarefa) => tarefa.status === "ATRASADA") : tarefas;
  const contagemPorStatus = (status: StatusTarefa) => tarefas.filter((tarefa) => tarefa.status === status).length;

  return (
    <main className="pagina-ciclo-do-tarefas">
      <Sidebar />
      <div className="ciclo-do_tarefas_painel">
        <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva="do" />
        <div className="ciclo-do_tarefas_conteudo">
          <section className="ciclo-do_quadro">
            <div className="ciclo-do_tarefas_titulo"><h2>Quadro de tarefas</h2><Link className="ciclo-do_tarefas_criar" to={`/do/ciclo/${ciclo.id}/tarefas/criar`}><img src={iconeMais} alt="" />Criar nova</Link></div>
            {dadosDisponiveis && <div className="ciclo-do_filtros" aria-label="Filtrar tarefas"><button type="button" aria-pressed={filtro === "todas"} onClick={() => setFiltro("todas")}>Todas ({tarefas.length})</button><button type="button" aria-pressed={filtro === "atrasadas"} onClick={() => setFiltro("atrasadas")}>Atrasadas ({contagemPorStatus("ATRASADA")})</button></div>}
            <div className="ciclo-do_kanban">
              <p className="ciclo-do_kanban_instrucao" id="ciclo-do_kanban-instrucao">{podeAlterarStatus ? "Arraste uma tarefa para outra coluna ou use o seletor em cada cartão para mudar a etapa." : "As tarefas estão organizadas por etapa de execução."}</p>
              {mensagemMovimento && <p className="ciclo-do_kanban_feedback" role="status" aria-live="polite">{mensagemMovimento}</p>}
              {dadosDisponiveis ? <div ref={kanbanColunasRef} className="ciclo-do_kanban_colunas" role="region" aria-label="Colunas do quadro de tarefas" tabIndex={0}>{statusTarefa.map((coluna) => (
                <section
                  className={`ciclo-do_coluna ciclo-do_coluna-${coluna.classe}${colunaAlvo === coluna.valor ? " ciclo-do_coluna--alvo" : ""}`}
                  key={coluna.valor}
                  aria-labelledby={`tarefas-status-${coluna.valor}`}
                  onDragOver={(event) => {
                    if (!podeAlterarStatus || tarefaArrastada === null) return;
                    const origem = tarefas.find((item) => item.id === tarefaArrastada);
                    if (origem && transicoes[origem.status]?.includes(coluna.valor)) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setColunaAlvo((atual) => atual === coluna.valor ? atual : coluna.valor);
                    }
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setColunaAlvo(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = Number(event.dataTransfer.getData("application/x-acta-tarefa-id") || event.dataTransfer.getData("text/plain"));
                    const tarefa = tarefas.find((item) => item.id === id);
                    setTarefaArrastada(null);
                    setColunaAlvo(null);
                    if (tarefa) void moverTarefa(tarefa, coluna.valor);
                  }}
                >
                  <h3 id={`tarefas-status-${coluna.valor}`}>{coluna.titulo} · {tarefasVisiveis.filter((tarefa) => tarefa.status === coluna.valor).length}</h3>
                  {tarefasVisiveis.filter((tarefa) => tarefa.status === coluna.valor).map((tarefa) => (
                    <article
                      className={`ciclo-do_tarefa${tarefaArrastada === tarefa.id ? " ciclo-do_tarefa--arrastando" : ""}${tarefaEmMovimento === tarefa.id ? " ciclo-do_tarefa--salvando" : ""}`}
                      key={tarefa.id}
                      draggable={podeAlterarStatus && Boolean(transicoes[tarefa.status]?.length) && tarefaEmMovimento === null}
                      onDragStart={(event) => {
                        if (!podeAlterarStatus || !transicoes[tarefa.status]?.length) { event.preventDefault(); return; }
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("application/x-acta-tarefa-id", String(tarefa.id));
                        event.dataTransfer.setData("text/plain", String(tarefa.id));
                        setTarefaArrastada(tarefa.id);
                      }}
                      onDragEnd={() => { setTarefaArrastada(null); setColunaAlvo(null); }}
                    >
                      <Link className="ciclo-do_tarefa_link" to={`/do/ciclo/${ciclo.id}/tarefas/${tarefa.id}`} aria-label={`${tarefa.titulo}. Status: ${rotuloStatusTarefa(tarefa.status)}. Abrir detalhes`}>
                        <strong>{tarefa.titulo}</strong>
                        <span>{tarefa.nomeResponsavel?.trim() || "Não informado"}</span>
                        <time>{tarefa.dataFimPrevista ?? "Prazo não informado"}</time>
                        <span className="ciclo-do_tarefa_status" data-estado={tarefa.status}>{rotuloStatusTarefa(tarefa.status)}</span>
                      </Link>
                      {podeAlterarStatus && transicoes[tarefa.status]?.length ? <>
                        <label className="sr-only" htmlFor={`mover-tarefa-${tarefa.id}`}>Mover {tarefa.titulo} para outra etapa</label>
                        <select
                          className="ciclo-do_tarefa_mover"
                          id={`mover-tarefa-${tarefa.id}`}
                          value=""
                          disabled={tarefaEmMovimento !== null}
                          onChange={(event) => {
                            const destino = event.target.value as StatusTarefa;
                            if (transicoes[tarefa.status]?.includes(destino)) void moverTarefa(tarefa, destino);
                          }}
                        >
                          <option value="" disabled>Mover para…</option>
                          {transicoes[tarefa.status]?.map((destino) => <option key={destino} value={destino}>{rotuloStatusTarefa(destino)}</option>)}
                        </select>
                      </> : null}
                      {tarefaEmMovimento === tarefa.id && <span className="sr-only" role="status">Salvando mudança de etapa para {tarefa.titulo}.</span>}
                    </article>
                  ))}
                </section>
              ))}</div> : <p className="ciclo-do_tarefas_estado" role={resultadoTarefas.estado === "erro" || resultadoTarefas.estado === "indisponivel" ? "alert" : "status"} aria-live="polite">
                {resultadoTarefas.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando tarefas do ciclo." />
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

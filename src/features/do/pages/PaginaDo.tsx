import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarCiclosPg, listarPlanosPorCicloPg, listarTarefasPorPlanoPg, type CicloPg, type TarefaDoPlanoPg } from "../../../services/api/pg/dashboard.read.api";
import { Sidebar } from "../../layout/components/Sidebar";
import "../styles/pagina-do.css";

export type VarianteMetricaDo = "abertas" | "andamento" | "atrasadas" | "treinamentos";

export type MetricaDo = {
  id: string;
  titulo: string;
  valor: number | string;
  contexto: string;
  variante: VarianteMetricaDo;
};

export type ExecucaoPorCicloDo = {
  id: string;
  ciclo: string;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  outrosEstados: number;
};

export type SituacaoTarefasDo = {
  total: number;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  outrosEstados: number;
};

export type CicloAcompanhamentoDo = {
  id: string;
  cicloId: number;
  tarefa: string;
  ciclo: string;
  responsavel: string;
  prazo: string;
  status: string;
  varianteStatus: "andamento" | "atrasada" | "pendente";
};

export type DadosDoTodosCiclos = {
  metricas: readonly [MetricaDo, MetricaDo, MetricaDo, MetricaDo];
  execucaoPorCiclo: readonly ExecucaoPorCicloDo[];
  situacaoTarefas: SituacaoTarefasDo;
  ciclosAcompanhamento: readonly CicloAcompanhamentoDo[];
};

const formatadorPercentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
type TarefaCicloDo = { ciclo: CicloPg; tarefa: TarefaDoPlanoPg };
type EstadoDadosDo = "carregando" | "sucesso" | "erro" | "indisponivel";
type SnapshotDo = { chave: string | null; estado: EstadoDadosDo; tarefas: readonly TarefaCicloDo[] };

type EstiloSegmento = CSSProperties & { "--largura-segmento": string };
type EstiloPosicaoTotal = CSSProperties & { "--posicao-total-percentual": string };
type EstiloRosca = CSSProperties & {
  "--percentual-concluidas": string;
  "--percentual-andamento": string;
  "--percentual-pendentes": string;
  "--percentual-outros-estados": string;
};

function larguraSegmento(valor: number, escalaMaxima: number): EstiloSegmento {
  const percentual = Math.min(100, Math.max(0, (valor / escalaMaxima) * 100));
  return { "--largura-segmento": `${percentual}%` };
}

function posicaoTotal(total: number, escalaMaxima: number): EstiloPosicaoTotal {
  const percentual = Math.min(100, Math.max(0, (total / escalaMaxima) * 100));
  return { "--posicao-total-percentual": `${percentual}%` };
}

function estiloRosca(situacao: SituacaoTarefasDo): EstiloRosca {
  const percentual = (valor: number) => {
    const calculado = situacao.total > 0 ? (valor / situacao.total) * 100 : 0;
    return `${Math.min(100, Math.max(0, calculado))}%`;
  };

  return {
    "--percentual-concluidas": percentual(situacao.concluidas),
    "--percentual-andamento": percentual(situacao.emAndamento),
    "--percentual-pendentes": percentual(situacao.pendentes),
    "--percentual-outros-estados": percentual(situacao.outrosEstados),
  };
}

function resumoSituacao(situacao: SituacaoTarefasDo): string {
  return `Concluídas: ${situacao.concluidas} (${formatarPercentualSituacao(situacao.concluidas, situacao.total)}). Em andamento: ${situacao.emAndamento} (${formatarPercentualSituacao(situacao.emAndamento, situacao.total)}). Pendentes: ${situacao.pendentes} (${formatarPercentualSituacao(situacao.pendentes, situacao.total)}). Outros estados: ${situacao.outrosEstados} (${formatarPercentualSituacao(situacao.outrosEstados, situacao.total)}). Total: ${situacao.total} tarefas.`;
}

function formatarPercentualSituacao(valor: number, total: number): string {
  const percentual = total > 0 ? (valor / total) * 100 : 0;
  return `${formatadorPercentual.format(percentual)}%`;
}

function formatarPrazoDo(valor: string | null): string {
  if (!valor) return "A definir";
  const partes = valor.includes("/") ? valor.split("/").reverse() : valor.split("-");
  const [ano, mes, dia] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);
  return Number.isFinite(data.getTime()) ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(data).replace(".", "") : "A definir";
}

function rotuloStatusTarefa(status: TarefaDoPlanoPg["status"]): { texto: string; variante: CicloAcompanhamentoDo["varianteStatus"] } {
  if (status === "EM_ANDAMENTO") return { texto: "Em andamento", variante: "andamento" };
  if (status === "ATRASADA" || status === "BLOQUEADA") return { texto: status === "ATRASADA" ? "Atrasada" : "Bloqueada", variante: "atrasada" };
  return { texto: "Pendente", variante: "pendente" };
}

export function PaginaDo() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa ? `${firebaseUser.uid}:${idEmpresa}` : null;
  const [snapshot, setSnapshot] = useState<SnapshotDo>({ chave: null, estado: "carregando", tarefas: [] });

  useEffect(() => {
    if (authLoading) {
      setSnapshot({ chave: null, estado: "carregando", tarefas: [] });
      return;
    }
    if (!chave || !idEmpresa) {
      setSnapshot({ chave: null, estado: "indisponivel", tarefas: [] });
      return;
    }

    const idEmpresaValidada = idEmpresa;
    const controller = new AbortController();
    setSnapshot({ chave, estado: "carregando", tarefas: [] });
    async function carregarTarefas() {
      try {
        const ciclos = await listarCiclosPg(idEmpresaValidada, controller.signal);
        const tarefasPorCiclo: TarefaCicloDo[][] = ciclos.map(() => []);
        let proximoIndice = 0;
        async function carregarCiclo() {
          while (!controller.signal.aborted) {
            const indice = proximoIndice++;
            if (indice >= ciclos.length) return;
            const ciclo = ciclos[indice];
            const planos = await listarPlanosPorCicloPg(ciclo.id, controller.signal);
            if (planos.some((plano) => plano.idCiclo !== ciclo.id)) throw new Error("Associação de planos inválida.");
            const tarefasDosPlanos = await Promise.all(planos.map(async (plano) => {
              const tarefasDoPlano = await listarTarefasPorPlanoPg(plano.id, controller.signal);
              if (tarefasDoPlano.some((tarefa) => tarefa.idPlanoAcao !== plano.id)) throw new Error("Associação de tarefas inválida.");
              return tarefasDoPlano.map((tarefa) => ({ ciclo, tarefa }));
            }));
            tarefasPorCiclo[indice].push(...tarefasDosPlanos.flat());
          }
        }
        await Promise.all(Array.from({ length: Math.min(3, ciclos.length) }, () => carregarCiclo()));
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "sucesso", tarefas: tarefasPorCiclo.flat() });
      } catch {
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "erro", tarefas: [] });
      }
    }
    void carregarTarefas();
    return () => controller.abort();
  }, [authLoading, chave, idEmpresa]);

  const estado: EstadoDadosDo = authLoading ? "carregando" : !chave ? "indisponivel" : snapshot.chave === chave ? snapshot.estado : "carregando";
  const tarefas = estado === "sucesso" && snapshot.chave === chave ? snapshot.tarefas : [];
  const situacaoTarefas: SituacaoTarefasDo = {
    total: tarefas.length,
    concluidas: tarefas.filter(({ tarefa }) => tarefa.status === "CONCLUIDA").length,
    emAndamento: tarefas.filter(({ tarefa }) => tarefa.status === "EM_ANDAMENTO").length,
    pendentes: tarefas.filter(({ tarefa }) => tarefa.status === "PENDENTE").length,
    outrosEstados: tarefas.filter(({ tarefa }) => tarefa.status === "BLOQUEADA" || tarefa.status === "ATRASADA" || tarefa.status === "CANCELADA").length,
  };
  const execucaoPorCiclo = [...new Map(tarefas.map(({ ciclo }) => [ciclo.id, ciclo])).values()].map((ciclo) => {
    const doCiclo = tarefas.filter((item) => item.ciclo.id === ciclo.id);
    return {
      id: String(ciclo.id), ciclo: ciclo.titulo,
      concluidas: doCiclo.filter(({ tarefa }) => tarefa.status === "CONCLUIDA").length,
      emAndamento: doCiclo.filter(({ tarefa }) => tarefa.status === "EM_ANDAMENTO").length,
      pendentes: doCiclo.filter(({ tarefa }) => tarefa.status === "PENDENTE").length,
      outrosEstados: doCiclo.filter(({ tarefa }) => tarefa.status === "BLOQUEADA" || tarefa.status === "ATRASADA" || tarefa.status === "CANCELADA").length,
    };
  }).sort((a, b) => (b.concluidas + b.emAndamento + b.pendentes + b.outrosEstados) - (a.concluidas + a.emAndamento + a.pendentes + a.outrosEstados)).slice(0, 4);
  const ciclosAcompanhamento = tarefas.filter(({ tarefa }) => !["CONCLUIDA", "CANCELADA"].includes(tarefa.status))
    .map(({ ciclo, tarefa }) => {
      const status = rotuloStatusTarefa(tarefa.status);
      return { id: String(tarefa.id), cicloId: ciclo.id, tarefa: tarefa.titulo, ciclo: ciclo.titulo, responsavel: tarefa.nomeResponsavel ?? "A definir", prazo: formatarPrazoDo(tarefa.dataFimPrevista), status: status.texto, varianteStatus: status.variante, statusOrdenacao: tarefa.status === "EM_ANDAMENTO" ? 0 : tarefa.status === "ATRASADA" ? 1 : tarefa.status === "BLOQUEADA" ? 2 : 3, prazoOrdenacao: tarefa.dataFimPrevista ?? "9999-12-31" };
    }).sort((a, b) => a.statusOrdenacao - b.statusOrdenacao || a.prazoOrdenacao.localeCompare(b.prazoOrdenacao)).slice(0, 3)
    .map(({ statusOrdenacao: _statusOrdenacao, prazoOrdenacao: _prazoOrdenacao, ...item }) => item);
  const metricas: DadosDoTodosCiclos["metricas"] = [
    { id: "tarefas-abertas", titulo: "Tarefas abertas", valor: tarefas.filter(({ tarefa }) => !["CONCLUIDA", "CANCELADA"].includes(tarefa.status)).length, contexto: "em todos os ciclos", variante: "abertas" },
    { id: "em-andamento", titulo: "Em andamento", valor: tarefas.filter(({ tarefa }) => tarefa.status === "EM_ANDAMENTO" && tarefa.idResponsavel !== null).length, contexto: "com responsável", variante: "andamento" },
    { id: "atrasadas", titulo: "Atrasadas", valor: tarefas.filter(({ tarefa }) => tarefa.status === "ATRASADA").length, contexto: "requerem atenção", variante: "atrasadas" },
    { id: "treinamentos", titulo: "Treinamentos pendentes", valor: "—", contexto: "dados indisponíveis", variante: "treinamentos" },
  ];
  const dados: DadosDoTodosCiclos = { metricas, execucaoPorCiclo, situacaoTarefas, ciclosAcompanhamento };
  const escalaMaximaExecucao = Math.max(12, Math.ceil(Math.max(0, ...execucaoPorCiclo.map((item) => item.concluidas + item.emAndamento + item.pendentes + item.outrosEstados)) / 4) * 4);
  const escalaExecucao = Array.from({ length: 5 }, (_, indice) => (escalaMaximaExecucao / 4) * indice);

  return (
    <main className="pagina-do pagina-do-todos-ciclos">
      <Sidebar />
      <div className="do-painel do-todos-ciclos_painel">
        <div className="do-todos-ciclos_conteudo">
          <header className="do-todos-ciclos_cabecalho">
            <div>
              <h1>Do · Todos os ciclos</h1>
              <p>Veja tarefas, prazos e responsáveis sem sair da visão de gestão.</p>
            </div>
          </header>

          {estado === "carregando" ? (
            <section className="do-todos-ciclos_vazio" role="status" aria-live="polite" aria-busy="true">
              <h2>Carregando dados do Do</h2>
            </section>
          ) : estado === "erro" ? (
            <section className="do-todos-ciclos_vazio" role="alert">
              <h2>Não foi possível carregar os dados do Do</h2>
              <p>Tente novamente mais tarde.</p>
            </section>
          ) : estado === "indisponivel" ? (
            <section className="do-todos-ciclos_vazio" role="status" aria-live="polite">
              <h2>Visão geral do Do indisponível</h2>
              <p>Não foi possível validar a empresa da conta atual.</p>
            </section>
          ) : (
            <>
              <section className="do-todos-ciclos_metricas" aria-label="Resumo das tarefas">
                {dados.metricas.map((metrica) => (
                  <article className={`do-todos-ciclos_metrica do-todos-ciclos_metrica-${metrica.variante}`} key={metrica.id}>
                    <h2>{metrica.titulo}</h2>
                    <p><strong>{String(metrica.valor).padStart(2, "0")}</strong><span>{metrica.contexto}</span></p>
                  </article>
                ))}
              </section>

              <div className="do-todos-ciclos_graficos">
                <figure className="do-todos-ciclos_grafico do-todos-ciclos_grafico-execucao" aria-labelledby="do-todos-ciclos-execucao-titulo">
                  <figcaption>
                    <h2 id="do-todos-ciclos-execucao-titulo">Execução por ciclo</h2>
                    <p>Situação atual das tarefas · {dados.execucaoPorCiclo.length} ciclos</p>
                  </figcaption>
                  {dados.execucaoPorCiclo.length === 0 ? (
                    <p className="do-todos-ciclos_grafico-vazio" role="status">Sem dados de execução por ciclo.</p>
                  ) : (
                    <>
                      <ul className="do-todos-ciclos_barras" aria-label="Execução das tarefas por ciclo">
                        {dados.execucaoPorCiclo.map((item) => {
                          const valores = [item.concluidas, item.emAndamento, item.pendentes, item.outrosEstados];
                          const total = valores.reduce((soma, valor) => soma + valor, 0);
                          return (
                            <li className="do-todos-ciclos_barra-linha" key={item.id}>
                              <span className="do-todos-ciclos_barra-ciclo">{item.ciclo}</span>
                              <div className="do-todos-ciclos_barra-trilho" aria-hidden="true">
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-concluidas" style={larguraSegmento(item.concluidas, escalaMaximaExecucao)}>{item.concluidas}</span>
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-andamento" style={larguraSegmento(item.emAndamento, escalaMaximaExecucao)}>{item.emAndamento}</span>
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-pendentes" style={larguraSegmento(item.pendentes, escalaMaximaExecucao)}>{item.pendentes}</span>
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-outros" style={larguraSegmento(item.outrosEstados, escalaMaximaExecucao)}>{item.outrosEstados}</span>
                                <strong className="do-todos-ciclos_barra-total" style={posicaoTotal(total, escalaMaximaExecucao)}>{total}</strong>
                              </div>
                              <span className="sr-only">{item.concluidas} concluídas; {item.emAndamento} em andamento; {item.pendentes} pendentes; {item.outrosEstados} em outros estados; total {total}.</span>
                            </li>
                          );
                        })}
                      </ul>
                      <ol className="do-todos-ciclos_eixo" aria-hidden="true">
                        {escalaExecucao.map((valor) => <li key={valor}>{valor}</li>)}
                      </ol>
                    </>
                  )}
                  <ul className="do-todos-ciclos_legenda" aria-label="Legenda da execução">
                    <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-concluidas" aria-hidden="true" />Concluídas</li>
                    <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-andamento" aria-hidden="true" />Em andamento</li>
                    <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-pendentes" aria-hidden="true" />Pendentes</li>
                    <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-outros" aria-hidden="true" />Outros estados¹</li>
                  </ul>
                  <p className="do-todos-ciclos_nota-grafico">Quantidade de registros · escala iniciada em zero</p>
                </figure>

                <figure className="do-todos-ciclos_grafico do-todos-ciclos_grafico-situacao" aria-labelledby="do-todos-ciclos-situacao-titulo">
                  <figcaption>
                    <h2 id="do-todos-ciclos-situacao-titulo">Situação das tarefas</h2>
                    <p>¹ Bloqueadas, atrasadas ou canceladas</p>
                  </figcaption>
                  {dados.situacaoTarefas.total === 0 ? (
                    <p className="do-todos-ciclos_grafico-vazio" role="status">Sem tarefas para exibir.</p>
                  ) : (
                    <>
                      <div className="do-todos-ciclos_rosca" aria-hidden="true">
                        <div className="do-todos-ciclos_rosca-asset" style={estiloRosca(dados.situacaoTarefas)}>
                          {/* # colocar imagem */}
                        </div>
                        <div className="do-todos-ciclos_rosca-total">
                          <strong>{dados.situacaoTarefas.total}</strong>
                          <span>tarefas no total</span>
                        </div>
                      </div>
                      <p className="sr-only">{resumoSituacao(dados.situacaoTarefas)}</p>
                      <ul className="do-todos-ciclos_legenda-situacao" aria-label="Distribuição da situação das tarefas">
                        <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-concluidas" aria-hidden="true" />Concluídas <strong>{dados.situacaoTarefas.concluidas}</strong><span>{formatarPercentualSituacao(dados.situacaoTarefas.concluidas, dados.situacaoTarefas.total)}</span></li>
                        <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-andamento" aria-hidden="true" />Em andamento <strong>{dados.situacaoTarefas.emAndamento}</strong><span>{formatarPercentualSituacao(dados.situacaoTarefas.emAndamento, dados.situacaoTarefas.total)}</span></li>
                        <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-pendentes" aria-hidden="true" />Pendentes <strong>{dados.situacaoTarefas.pendentes}</strong><span>{formatarPercentualSituacao(dados.situacaoTarefas.pendentes, dados.situacaoTarefas.total)}</span></li>
                        <li><span className="do-todos-ciclos_amostra do-todos-ciclos_amostra-outros" aria-hidden="true" />Outros estados¹ <strong>{dados.situacaoTarefas.outrosEstados}</strong><span>{formatarPercentualSituacao(dados.situacaoTarefas.outrosEstados, dados.situacaoTarefas.total)}</span></li>
                      </ul>
                    </>
                  )}
                  <p className="do-todos-ciclos_base-grafico">Base: {dados.situacaoTarefas.total} registros · valores absolutos na legenda</p>
                </figure>
              </div>

              <section className="do-todos-ciclos_tabela-secao" aria-labelledby="do-todos-ciclos-tabela-titulo">
                <h2 id="do-todos-ciclos-tabela-titulo">Ciclos que precisam de acompanhamento</h2>
                <div className="do-todos-ciclos_tabela-rolagem" role="region" tabIndex={0} aria-label="Tabela de acompanhamento com rolagem horizontal">
                  <table className="do-todos-ciclos_tabela">
                    <caption className="sr-only">Tarefas que precisam de acompanhamento, com ciclo, responsável, prazo e status</caption>
                    <thead><tr><th scope="col">Tarefa</th><th scope="col">Ciclo</th><th scope="col">Responsável</th><th scope="col">Prazo</th><th scope="col">Status</th></tr></thead>
                    <tbody>
                      {dados.ciclosAcompanhamento.map((item) => (
                        <tr key={item.id}>
                          <th scope="row"><Link to={`/do/ciclo/${item.cicloId}/tarefas/${item.id}`}>{item.tarefa}</Link></th>
                          <td>{item.ciclo}</td>
                          <td>{item.responsavel}</td>
                          <td>{item.prazo}</td>
                          <td><span className={`do-todos-ciclos_status do-todos-ciclos_status-${item.varianteStatus}`}>{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dados.ciclosAcompanhamento.length === 0 && <p className="do-todos-ciclos_tabela-vazia" role="status">Nenhum ciclo precisa de acompanhamento.</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

import type { CSSProperties } from "react";
import { Sidebar } from "../../layout/components/Sidebar";
import "../../perfil/styles/pagina-perfil.css";
import "../styles/pagina-do.css";

export type VarianteMetricaDo = "abertas" | "andamento" | "atrasadas" | "treinamentos";

export type MetricaDo = {
  id: string;
  titulo: string;
  valor: number;
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

type PaginaDoProps = {
  dados?: DadosDoTodosCiclos | null;
};

const escalaExecucao = [0, 3, 6, 9, 12] as const;
const escalaMaximaExecucao = 12;
const formatadorPercentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

type EstiloSegmento = CSSProperties & { "--largura-segmento": string };
type EstiloPosicaoTotal = CSSProperties & { "--posicao-total-percentual": string };
type EstiloRosca = CSSProperties & {
  "--percentual-concluidas": string;
  "--percentual-andamento": string;
  "--percentual-pendentes": string;
  "--percentual-outros-estados": string;
};

function larguraSegmento(valor: number): EstiloSegmento {
  const percentual = Math.min(100, Math.max(0, (valor / escalaMaximaExecucao) * 100));
  return { "--largura-segmento": `${percentual}%` };
}

function posicaoTotal(total: number): EstiloPosicaoTotal {
  const percentual = Math.min(100, Math.max(0, (total / escalaMaximaExecucao) * 100));
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

export function PaginaDo({ dados }: PaginaDoProps) {
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
            <div className="do-todos-ciclos_acoes-topo">
              <div className="do-todos-ciclos_acoes-icones" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <span className="do-todos-ciclos_acao-icone" key={item}>{/* # colocar imagem */}</span>
                ))}
              </div>
              <span className="do-todos-ciclos_periodo">Últimos 30 dias</span>
            </div>
          </header>

          {!dados ? (
            <section className="do-todos-ciclos_vazio" role="status" aria-live="polite">
              <h2>Dados de Do indisponíveis</h2>
              <p>Métricas, execução e acompanhamento serão exibidos quando houver dados disponíveis.</p>
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
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-concluidas" style={larguraSegmento(item.concluidas)}>{item.concluidas}</span>
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-andamento" style={larguraSegmento(item.emAndamento)}>{item.emAndamento}</span>
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-pendentes" style={larguraSegmento(item.pendentes)}>{item.pendentes}</span>
                                <span className="do-todos-ciclos_barra-segmento do-todos-ciclos_barra-segmento-outros" style={larguraSegmento(item.outrosEstados)}>{item.outrosEstados}</span>
                                <strong className="do-todos-ciclos_barra-total" style={posicaoTotal(total)}>{total}</strong>
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
                          <th scope="row">{item.tarefa}</th>
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

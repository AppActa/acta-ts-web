import type { CSSProperties } from "react";
import { Sidebar } from "../../layout/components/Sidebar";
import "../../perfil/styles/pagina-perfil.css";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-plan-todos-ciclos.css";

export type VarianteMetricaPlanCiclos = "azul" | "ciano" | "laranja" | "verde";

export type MetricaPlanCiclos = {
  id: string;
  titulo: string;
  valor: number;
  contexto: string;
  variante: VarianteMetricaPlanCiclos;
};

export type CausasPorCicloPlan = {
  id: string;
  ciclo: string;
  aceitas: number;
  aguardandoValidacao: number;
};

export type CicloEmAcompanhamentoPlan = {
  id: string;
  ciclo: string;
  responsavel: string;
  prazo: string;
  pendencia: string;
  status: string;
  varianteStatus: "andamento" | "atencao" | "revisao";
};

export type DadosPlanTodosCiclos = {
  metricas: readonly [MetricaPlanCiclos, MetricaPlanCiclos, MetricaPlanCiclos, MetricaPlanCiclos];
  causasPorCiclo: readonly CausasPorCicloPlan[];
  planosAcao: {
    total: number;
    rascunho: number;
    aprovado: number;
  };
  ciclosAcompanhamento: readonly CicloEmAcompanhamentoPlan[];
};

type PaginaPlanTodosCiclosProps = {
  dados?: DadosPlanTodosCiclos | null;
};

const escalaCausas = [0, 2, 4, 6, 8] as const;
const escalaMaximaCausas = 8;
type EstiloPosicaoTotal = CSSProperties & { "--posicao-total-percentual": string };

function larguraSegmento(valor: number): CSSProperties {
  return { width: `${Math.max(0, (valor / escalaMaximaCausas) * 100)}%` };
}

function posicaoTotal(total: number): EstiloPosicaoTotal {
  const percentual = Math.min(100, Math.max(0, (total / escalaMaximaCausas) * 100));
  return { "--posicao-total-percentual": `${percentual}%` };
}

export function PaginaPlanTodosCiclos({ dados }: PaginaPlanTodosCiclosProps) {
  const totalPlanos = dados?.planosAcao.total ?? 0;
  const percentualRascunho = dados && totalPlanos > 0 ? (dados.planosAcao.rascunho / totalPlanos) * 100 : 0;
  const resumoDonut = dados
    ? `Rascunho: ${dados.planosAcao.rascunho} de ${totalPlanos} (${Math.round(percentualRascunho)}%). Aprovado: ${dados.planosAcao.aprovado} de ${totalPlanos} (${Math.round(totalPlanos > 0 ? (dados.planosAcao.aprovado / totalPlanos) * 100 : 0)}%).`
    : "Sem dados de planos de ação.";

  return (
    <main className="pagina-web-listas pagina-plan-ciclos">
      <Sidebar />
      <div className="web-listas_painel plan-ciclos_painel">
        <div className="plan-ciclos_conteudo">
          <header className="plan-ciclos_cabecalho">
            <h1>Plan · Todos os ciclos</h1>
            <p>Acompanhe problemas, coleta, causas, metas e planos de ação em planejamento.</p>
          </header>

          {!dados ? (
            <section className="plan-ciclos_vazio" role="status" aria-live="polite">
              <h2>Dados globais do Plan indisponíveis</h2>
              <p>Os indicadores e ciclos aparecerão quando houver dados de apresentação disponíveis.</p>
            </section>
          ) : (
            <>
              <section className="plan-ciclos_metricas" aria-label="Resumo global do Plan">
                {dados.metricas.map((metrica) => (
                  <article className={`plan-ciclos_metrica plan-ciclos_metrica-${metrica.variante}`} key={metrica.id}>
                    <h2>{metrica.titulo}</h2>
                    <p><strong>{String(metrica.valor).padStart(2, "0")}</strong><span>{metrica.contexto}</span></p>
                  </article>
                ))}
              </section>

              <div className="plan-ciclos_graficos">
                <figure className="plan-ciclos_grafico plan-ciclos_grafico-causas" aria-labelledby="plan-ciclos-causas-titulo">
                  <figcaption>
                    <h2 id="plan-ciclos-causas-titulo">Causas por ciclo</h2>
                    <p>Causas aceitas e aguardando validação · {dados.causasPorCiclo.length} ciclos</p>
                  </figcaption>
                  {dados.causasPorCiclo.length === 0 ? (
                    <p className="plan-ciclos_grafico-vazio" role="status">Sem causas por ciclo para exibir.</p>
                  ) : (
                    <>
                      <ul className="plan-ciclos_barras" aria-label="Quantidade de causas por ciclo">
                        {dados.causasPorCiclo.map((item) => {
                          const total = item.aceitas + item.aguardandoValidacao;
                          return (
                            <li className="plan-ciclos_barra-linha" key={item.id}>
                              <span className="plan-ciclos_barra-ciclo">{item.ciclo}</span>
                              <div className="plan-ciclos_barra" aria-hidden="true">
                                <span className="plan-ciclos_barra-segmento plan-ciclos_barra-segmento-aceitas" style={larguraSegmento(item.aceitas)}>{item.aceitas}</span>
                                <span className="plan-ciclos_barra-segmento plan-ciclos_barra-segmento-validacao" style={larguraSegmento(item.aguardandoValidacao)}>{item.aguardandoValidacao}</span>
                              </div>
                              <strong className="plan-ciclos_barra-total" style={posicaoTotal(total)}>{total}</strong>
                              <span className="sr-only">{item.aceitas} aceitas; {item.aguardandoValidacao} aguardando validação; total {total}.</span>
                            </li>
                          );
                        })}
                      </ul>
                      <ol className="plan-ciclos_eixo" aria-hidden="true">
                        {escalaCausas.map((valor) => <li key={valor}>{valor}</li>)}
                      </ol>
                    </>
                  )}
                  <ul className="plan-ciclos_legenda" aria-label="Legenda do gráfico de causas">
                    <li><span className="plan-ciclos_legenda-amostra plan-ciclos_legenda-amostra-aceitas" aria-hidden="true" />Aceitas</li>
                    <li><span className="plan-ciclos_legenda-amostra plan-ciclos_legenda-amostra-validacao" aria-hidden="true" />Aguardando validação</li>
                  </ul>
                  <p className="plan-ciclos_nota-grafico">Quantidade de registros · escala iniciada em zero</p>
                </figure>

                <figure className="plan-ciclos_grafico plan-ciclos_grafico-planos" aria-labelledby="plan-ciclos-planos-titulo">
                  <figcaption>
                    <h2 id="plan-ciclos-planos-titulo">Planos de ação</h2>
                    <p>Distribuição dos planos em planejamento</p>
                  </figcaption>
                  {totalPlanos === 0 ? (
                    <p className="plan-ciclos_grafico-vazio" role="status">Sem planos de ação para exibir.</p>
                  ) : (
                    <>
                      <div className="plan-ciclos_donut-resumo" aria-hidden="true">
                        <div
                          className="plan-ciclos_donut-asset-slot"
                          style={{ "--percentual-rascunho": `${percentualRascunho}%` } as CSSProperties}
                        >
                          {/* # colocar imagem */}
                        </div>
                        <div className="plan-ciclos_donut-total">
                          <strong>{totalPlanos}</strong>
                          <span>planos de ação</span>
                        </div>
                      </div>
                      <p className="sr-only">{resumoDonut}</p>
                      <ul className="plan-ciclos_legenda-planos" aria-label="Distribuição dos planos de ação">
                        <li><span className="plan-ciclos_legenda-amostra plan-ciclos_legenda-amostra-rascunho" aria-hidden="true" />Rascunho <strong>{dados.planosAcao.rascunho}</strong><span>{Math.round(percentualRascunho)}%</span></li>
                        <li><span className="plan-ciclos_legenda-amostra plan-ciclos_legenda-amostra-aprovado" aria-hidden="true" />Aprovado <strong>{dados.planosAcao.aprovado}</strong><span>{Math.round(totalPlanos > 0 ? (dados.planosAcao.aprovado / totalPlanos) * 100 : 0)}%</span></li>
                      </ul>
                    </>
                  )}
                  <p className="plan-ciclos_base-grafico">Base: {totalPlanos} registros · valores absolutos na legenda</p>
                </figure>
              </div>

              <section className="plan-ciclos_tabela-secao" aria-labelledby="plan-ciclos-tabela-titulo">
                <h2 id="plan-ciclos-tabela-titulo">Ciclos que precisam de acompanhamento</h2>
                <div className="plan-ciclos_tabela-rolagem" tabIndex={0} aria-label="Tabela de ciclos com rolagem horizontal">
                  <table className="plan-ciclos_tabela">
                    <caption className="sr-only">Ciclos que precisam de acompanhamento, com responsável, prazo, pendência e status</caption>
                    <thead><tr><th scope="col">Ciclo</th><th scope="col">Responsável</th><th scope="col">Prazo</th><th scope="col">Pendência</th><th scope="col">Status</th></tr></thead>
                    <tbody>
                      {dados.ciclosAcompanhamento.map((ciclo) => (
                        <tr key={ciclo.id}>
                          <th scope="row">{ciclo.ciclo}</th>
                          <td>{ciclo.responsavel}</td>
                          <td>{ciclo.prazo}</td>
                          <td>{ciclo.pendencia}</td>
                          <td><span className={`plan-ciclos_status plan-ciclos_status-${ciclo.varianteStatus}`}>{ciclo.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dados.ciclosAcompanhamento.length === 0 && <p className="plan-ciclos_tabela-vazia" role="status">Nenhum ciclo precisa de acompanhamento.</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

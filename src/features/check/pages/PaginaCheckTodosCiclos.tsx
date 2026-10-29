import type { CSSProperties } from "react";
import { Sidebar } from "../../layout/components/Sidebar";
import "../../perfil/styles/pagina-perfil.css";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-check-todos-ciclos.css";

export type VarianteMetricaCheck = "indicadores" | "metas" | "verificacoes" | "efeitos";

export type MetricaCheck = {
  id: string;
  titulo: string;
  valor: number;
  contexto: string;
  variante: VarianteMetricaCheck;
};

export type ResultadoVerificacaoPorCiclo = {
  id: string;
  ciclo: string;
  aprovadas: number;
  parciais: number;
  reprovadas: number;
};

export type SituacaoMetasCheck = {
  total: number;
  atingidas: number;
  emAndamento: number;
  naoAtingidas: number;
};

export type CicloAcompanhamentoCheck = {
  id: string;
  ciclo: string;
  indicador: string;
  antesAtual: string;
  meta: string;
  situacao: string;
  varianteSituacao: "acompanhar" | "atingida";
};

export type DadosCheckTodosCiclos = {
  metricas: readonly [MetricaCheck, MetricaCheck, MetricaCheck, MetricaCheck];
  resultadosPorCiclo: readonly ResultadoVerificacaoPorCiclo[];
  situacaoMetas: SituacaoMetasCheck;
  ciclosAcompanhamento: readonly CicloAcompanhamentoCheck[];
};

type PaginaCheckTodosCiclosProps = {
  dados?: DadosCheckTodosCiclos | null;
  estado?: "carregando" | "erro" | "cancelado";
};

const escalaResultados = [0, 2, 4, 6, 8] as const;
const escalaMaximaResultados = 8;
const formatadorPercentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

type EstiloSegmento = CSSProperties & { "--check-largura-segmento": string };
type EstiloPosicaoTotal = CSSProperties & { "--check-posicao-total-percentual": string };
type EstiloRosca = CSSProperties & {
  "--check-percentual-atingidas": string;
  "--check-percentual-andamento": string;
  "--check-percentual-nao-atingidas": string;
};

function larguraSegmento(valor: number): EstiloSegmento {
  const percentual = Math.min(100, Math.max(0, (valor / escalaMaximaResultados) * 100));
  return { "--check-largura-segmento": `${percentual}%` };
}

function posicaoTotal(total: number): EstiloPosicaoTotal {
  const percentual = Math.min(100, Math.max(0, (total / escalaMaximaResultados) * 100));
  return { "--check-posicao-total-percentual": `${percentual}%` };
}

function percentualMeta(valor: number, total: number): number {
  return total > 0 ? (valor / total) * 100 : 0;
}

function formatarPercentualMeta(valor: number, total: number): string {
  return `${formatadorPercentual.format(percentualMeta(valor, total))}%`;
}

function estiloRosca(situacao: SituacaoMetasCheck): EstiloRosca {
  const percentual = (valor: number) => `${Math.min(100, Math.max(0, percentualMeta(valor, situacao.total)))}%`;
  return {
    "--check-percentual-atingidas": percentual(situacao.atingidas),
    "--check-percentual-andamento": percentual(situacao.emAndamento),
    "--check-percentual-nao-atingidas": percentual(situacao.naoAtingidas),
  };
}

function resumoSituacaoMetas(situacao: SituacaoMetasCheck): string {
  return `Atingidas: ${situacao.atingidas} de ${situacao.total} (${formatarPercentualMeta(situacao.atingidas, situacao.total)}). Em andamento: ${situacao.emAndamento} de ${situacao.total} (${formatarPercentualMeta(situacao.emAndamento, situacao.total)}). Não atingidas: ${situacao.naoAtingidas} de ${situacao.total} (${formatarPercentualMeta(situacao.naoAtingidas, situacao.total)}). Total: ${situacao.total} metas.`;
}

export function PaginaCheckTodosCiclos({ dados, estado }: PaginaCheckTodosCiclosProps) {
  return (
    <main className="pagina-web-listas check-todos-ciclos">
      <Sidebar />
      <div className="web-listas_painel check-todos-ciclos_painel">
        <div className="check-todos-ciclos_conteudo">
          <header className="check-todos-ciclos_cabecalho">
            <div>
              <h1>Check · Todos os ciclos</h1>
              <p>Compare indicadores, metas e registros para entender os resultados da execução.</p>
            </div>
            <div className="check-todos-ciclos_acoes-topo">
              <div className="check-todos-ciclos_acoes-icones" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <span className="check-todos-ciclos_acao-icone" key={item}>{/* # colocar imagem */}</span>
                ))}
              </div>
              <span className="check-todos-ciclos_periodo">Últimos 30 dias</span>
            </div>
          </header>

          {estado === "carregando" ? (
            <section className="check-todos-ciclos_vazio" role="status" aria-live="polite" aria-busy="true">
              <h2>Carregando dados de Check</h2>
            </section>
          ) : estado === "erro" ? (
            <section className="check-todos-ciclos_vazio" role="alert">
              <h2>Não foi possível carregar os dados de Check</h2>
              <p>Tente novamente mais tarde.</p>
            </section>
          ) : estado === "cancelado" ? (
            <section className="check-todos-ciclos_vazio" role="status" aria-live="polite">
              <h2>Carregamento de Check interrompido</h2>
            </section>
          ) : !dados ? (
            <section className="check-todos-ciclos_vazio" role="status" aria-live="polite">
              <h2>Dados de Check indisponíveis</h2>
              <p>Métricas, metas e ciclos serão exibidos quando houver dados disponíveis.</p>
            </section>
          ) : (
            <>
              <section className="check-todos-ciclos_metricas" aria-label="Resumo de Check">
                {dados.metricas.map((metrica) => (
                  <article className={`check-todos-ciclos_metrica check-todos-ciclos_metrica-${metrica.variante}`} key={metrica.id}>
                    <h2>{metrica.titulo}</h2>
                    <p><strong>{String(metrica.valor).padStart(2, "0")}</strong><span>{metrica.contexto}</span></p>
                  </article>
                ))}
              </section>

              <div className="check-todos-ciclos_graficos">
                <figure className="check-todos-ciclos_grafico check-todos-ciclos_grafico-resultados" aria-labelledby="check-todos-ciclos-resultados-titulo">
                  <figcaption>
                    <h2 id="check-todos-ciclos-resultados-titulo">Resultado das verificações</h2>
                    <p>Resultados registrados · comparação por ciclo</p>
                  </figcaption>
                  {dados.resultadosPorCiclo.length === 0 ? (
                    <p className="check-todos-ciclos_grafico-vazio" role="status">Sem resultados de verificações para exibir.</p>
                  ) : (
                    <>
                      <ul className="check-todos-ciclos_barras" aria-label="Resultados das verificações por ciclo">
                        {dados.resultadosPorCiclo.map((item) => {
                          const total = item.aprovadas + item.parciais + item.reprovadas;
                          return (
                            <li className="check-todos-ciclos_barra-linha" key={item.id}>
                              <span className="check-todos-ciclos_barra-ciclo">{item.ciclo}</span>
                              <div className="check-todos-ciclos_barra-trilho" aria-hidden="true">
                                <span className="check-todos-ciclos_barra-segmento check-todos-ciclos_barra-segmento-aprovadas" style={larguraSegmento(item.aprovadas)}>{item.aprovadas}</span>
                                <span className="check-todos-ciclos_barra-segmento check-todos-ciclos_barra-segmento-parciais" style={larguraSegmento(item.parciais)}>{item.parciais}</span>
                                <span className="check-todos-ciclos_barra-segmento check-todos-ciclos_barra-segmento-reprovadas" style={larguraSegmento(item.reprovadas)}>{item.reprovadas}</span>
                                <strong className="check-todos-ciclos_barra-total" style={posicaoTotal(total)}>{total}</strong>
                              </div>
                              <span className="sr-only">{item.aprovadas} aprovadas; {item.parciais} parciais; {item.reprovadas} reprovadas; total {total}.</span>
                            </li>
                          );
                        })}
                      </ul>
                      <ol className="check-todos-ciclos_eixo" aria-hidden="true">
                        {escalaResultados.map((valor) => <li key={valor}>{valor}</li>)}
                      </ol>
                    </>
                  )}
                  <ul className="check-todos-ciclos_legenda" aria-label="Legenda dos resultados">
                    <li><span className="check-todos-ciclos_amostra check-todos-ciclos_amostra-aprovadas" aria-hidden="true" />Aprovado</li>
                    <li><span className="check-todos-ciclos_amostra check-todos-ciclos_amostra-parciais" aria-hidden="true" />Parcial</li>
                    <li><span className="check-todos-ciclos_amostra check-todos-ciclos_amostra-reprovadas" aria-hidden="true" />Reprovado</li>
                  </ul>
                  <p className="check-todos-ciclos_nota-grafico">Quantidade de registros · escala iniciada em zero</p>
                </figure>

                <figure className="check-todos-ciclos_grafico check-todos-ciclos_grafico-metas" aria-labelledby="check-todos-ciclos-metas-titulo">
                  <figcaption>
                    <h2 id="check-todos-ciclos-metas-titulo">Situação das metas</h2>
                    <p>Metas dos ciclos em verificação</p>
                  </figcaption>
                  {dados.situacaoMetas.total === 0 ? (
                    <p className="check-todos-ciclos_grafico-vazio" role="status">Sem metas para exibir.</p>
                  ) : (
                    <>
                      <div className="check-todos-ciclos_rosca" aria-hidden="true">
                        <div className="check-todos-ciclos_rosca-grafico" style={estiloRosca(dados.situacaoMetas)} />
                        <div className="check-todos-ciclos_rosca-total">
                          <strong>{Math.round(percentualMeta(dados.situacaoMetas.atingidas, dados.situacaoMetas.total))}%</strong>
                          <span>{dados.situacaoMetas.atingidas} de {dados.situacaoMetas.total} atingidas</span>
                        </div>
                      </div>
                      <p className="sr-only">{resumoSituacaoMetas(dados.situacaoMetas)}</p>
                      <ul className="check-todos-ciclos_legenda-metas" aria-label="Distribuição da situação das metas">
                        <li><span className="check-todos-ciclos_amostra check-todos-ciclos_amostra-atingidas" aria-hidden="true" />Atingidas <strong>{dados.situacaoMetas.atingidas}</strong><span>{formatarPercentualMeta(dados.situacaoMetas.atingidas, dados.situacaoMetas.total)}</span></li>
                        <li><span className="check-todos-ciclos_amostra check-todos-ciclos_amostra-andamento" aria-hidden="true" />Em andamento <strong>{dados.situacaoMetas.emAndamento}</strong><span>{formatarPercentualMeta(dados.situacaoMetas.emAndamento, dados.situacaoMetas.total)}</span></li>
                        <li><span className="check-todos-ciclos_amostra check-todos-ciclos_amostra-nao-atingidas" aria-hidden="true" />Não atingidas <strong>{dados.situacaoMetas.naoAtingidas}</strong><span>{formatarPercentualMeta(dados.situacaoMetas.naoAtingidas, dados.situacaoMetas.total)}</span></li>
                      </ul>
                    </>
                  )}
                  <p className="check-todos-ciclos_base-grafico">Base: {dados.situacaoMetas.total} registros · valores absolutos na legenda</p>
                </figure>
              </div>

              <section className="check-todos-ciclos_tabela-secao" aria-labelledby="check-todos-ciclos-tabela-titulo">
                <h2 id="check-todos-ciclos-tabela-titulo">Ciclos que precisam de acompanhamento</h2>
                <div className="check-todos-ciclos_tabela-rolagem" role="region" tabIndex={0} aria-label="Tabela de ciclos e indicadores com rolagem horizontal">
                  <table className="check-todos-ciclos_tabela">
                    <caption className="sr-only">Ciclos e indicadores em acompanhamento, com valores antes e atuais, meta e situação</caption>
                    <thead><tr><th scope="col">Ciclo</th><th scope="col">Indicador</th><th scope="col">Antes → atual</th><th scope="col">Meta</th><th scope="col">Situação</th></tr></thead>
                    <tbody>
                      {dados.ciclosAcompanhamento.map((item) => (
                        <tr key={item.id}>
                          <th scope="row">{item.ciclo}</th>
                          <td>{item.indicador}</td>
                          <td>{item.antesAtual}</td>
                          <td>{item.meta}</td>
                          <td><span className={`check-todos-ciclos_status check-todos-ciclos_status-${item.varianteSituacao}`}>{item.situacao}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dados.ciclosAcompanhamento.length === 0 && <p className="check-todos-ciclos_tabela-vazia" role="status">Nenhum ciclo precisa de acompanhamento.</p>}
                <p className="check-todos-ciclos_tabela-nota">Dados demonstrativos · contagens e percentuais usados para apresentar o protótipo.</p>
              </section>
              <p className="check-todos-ciclos_nota-rodape">Dados demonstrativos · contagens e percentuais usados para apresentar o protótipo.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

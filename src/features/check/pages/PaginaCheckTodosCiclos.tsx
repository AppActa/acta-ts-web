import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarCiclosPg, listarMetasPorCicloPg, listarVerificacoesPorCicloPg, type CicloPg, type MetaPg, type VerificacaoPg } from "../../../services/api/pg/dashboard.read.api";
import { Sidebar } from "../../layout/components/Sidebar";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-check-todos-ciclos.css";

export type VarianteMetricaCheck = "indicadores" | "metas" | "verificacoes" | "efeitos";

export type MetricaCheck = {
  id: string;
  titulo: string;
  valor: number | string;
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
  cicloId: number;
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

type DadosCicloCheck = { ciclo: CicloPg; metas: readonly MetaPg[] | null; verificacoes: readonly VerificacaoPg[] | null };
type EstadoCheck = "carregando" | "sucesso" | "erro" | "indisponivel";
type SnapshotCheck = { chave: string | null; estado: EstadoCheck; ciclos: readonly DadosCicloCheck[] };
const formatadorPercentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

type EstiloSegmento = CSSProperties & { "--check-largura-segmento": string };
type EstiloPosicaoTotal = CSSProperties & { "--check-posicao-total-percentual": string };
type EstiloRosca = CSSProperties & {
  "--check-percentual-atingidas": string;
  "--check-percentual-andamento": string;
  "--check-percentual-nao-atingidas": string;
};

function larguraSegmento(valor: number, escalaMaxima: number): EstiloSegmento {
  const percentual = Math.min(100, Math.max(0, (valor / escalaMaxima) * 100));
  return { "--check-largura-segmento": `${percentual}%` };
}

function posicaoTotal(total: number, escalaMaxima: number): EstiloPosicaoTotal {
  const percentual = Math.min(100, Math.max(0, (total / escalaMaxima) * 100));
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

function formatarValorMeta(valor: number | null, unidade: string | null): string {
  if (valor === null) return "—";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(valor)}${unidade ? ` ${unidade}` : ""}`;
}

function estadoMeta(status: MetaPg["status"]): { texto: string; variante: CicloAcompanhamentoCheck["varianteSituacao"] } {
  if (status === "ATINGIDA") return { texto: "Atingida", variante: "atingida" };
  if (status === "NAO_INICIADA") return { texto: "Aguardando registro", variante: "acompanhar" };
  if (status === "PARCIALMENTE_ATINGIDA") return { texto: "Parcial", variante: "acompanhar" };
  if (status === "NAO_ATINGIDA") return { texto: "Não atingida", variante: "acompanhar" };
  if (status === "CANCELADA") return { texto: "Cancelada", variante: "acompanhar" };
  return { texto: "Em acompanhamento", variante: "acompanhar" };
}

export function PaginaCheckTodosCiclos() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const navegar = useNavigate();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa ? `${firebaseUser.uid}:${idEmpresa}` : null;
  const [snapshot, setSnapshot] = useState<SnapshotCheck>({ chave: null, estado: "carregando", ciclos: [] });

  useEffect(() => {
    if (authLoading) {
      setSnapshot({ chave: null, estado: "carregando", ciclos: [] });
      return;
    }
    if (!chave || !idEmpresa) {
      setSnapshot({ chave: null, estado: "indisponivel", ciclos: [] });
      return;
    }

    const idEmpresaValidada = idEmpresa;
    const controller = new AbortController();
    setSnapshot({ chave, estado: "carregando", ciclos: [] });
    async function carregarDadosCheck() {
      try {
        const ciclos = await listarCiclosPg(idEmpresaValidada, controller.signal);
        const dadosPorCiclo: DadosCicloCheck[] = new Array(ciclos.length);
        let proximoIndice = 0;
        async function carregarCiclo() {
          while (!controller.signal.aborted) {
            const indice = proximoIndice++;
            if (indice >= ciclos.length) return;
            const ciclo = ciclos[indice];
            const [metasResultado, verificacoesResultado] = await Promise.allSettled([
              listarMetasPorCicloPg(ciclo.id, controller.signal),
              listarVerificacoesPorCicloPg(ciclo.id, controller.signal),
            ]);
            dadosPorCiclo[indice] = {
              ciclo,
              metas: metasResultado.status === "fulfilled" ? metasResultado.value : null,
              verificacoes: verificacoesResultado.status === "fulfilled" ? verificacoesResultado.value : null,
            };
          }
        }
        await Promise.all(Array.from({ length: Math.min(3, ciclos.length) }, () => carregarCiclo()));
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "sucesso", ciclos: dadosPorCiclo });
      } catch {
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "erro", ciclos: [] });
      }
    }
    void carregarDadosCheck();
    return () => controller.abort();
  }, [authLoading, chave, idEmpresa]);

  const estado: EstadoCheck = authLoading ? "carregando" : !chave ? "indisponivel" : snapshot.chave === chave ? snapshot.estado : "carregando";
  const ciclosApi = estado === "sucesso" && snapshot.chave === chave ? snapshot.ciclos : [];
  const metasDisponiveis = ciclosApi.every((item) => item.metas !== null);
  const verificacoesDisponiveis = ciclosApi.every((item) => item.verificacoes !== null);
  const metas = ciclosApi.flatMap((item) => (item.metas ?? []).filter((meta) => meta.status !== "CANCELADA").map((meta) => ({ ciclo: item.ciclo, meta })));
  const verificacoes = ciclosApi.flatMap((item) => item.verificacoes ?? []);
  const ciclosComMetas = ciclosApi.filter((item) => (item.metas ?? []).some((meta) => meta.status !== "CANCELADA")).length;
  const marcoPeriodo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const verificacoesNoPeriodo = verificacoes.filter((verificacao) => verificacao.status !== "NAO_VERIFICADO" && verificacao.criadoEm !== null && Date.parse(verificacao.criadoEm) >= marcoPeriodo).length;
  const aguardamRegistro = verificacoes.filter((verificacao) => verificacao.status === "NAO_VERIFICADO").length;
  const emAcompanhamento = metas.filter(({ meta }) => meta.status === "EM_ANDAMENTO" || meta.status === "PARCIALMENTE_ATINGIDA").length;
  const resultadosPorCiclo = ciclosApi.map(({ ciclo, verificacoes: registros }) => ({
    id: String(ciclo.id), ciclo: ciclo.titulo,
    aprovadas: (registros ?? []).filter(({ status }) => status === "APROVADO").length,
    parciais: (registros ?? []).filter(({ status }) => status === "PARCIAL").length,
    reprovadas: (registros ?? []).filter(({ status }) => status === "REPROVADO").length,
  })).filter((item) => item.aprovadas + item.parciais + item.reprovadas > 0)
    .sort((a, b) => b.aprovadas + b.parciais + b.reprovadas - a.aprovadas - a.parciais - a.reprovadas).slice(0, 4);
  const metasElegiveis = metas.filter(({ meta }) => meta.status !== "CANCELADA");
  const situacaoMetas: SituacaoMetasCheck = {
    total: metasElegiveis.length,
    atingidas: metasElegiveis.filter(({ meta }) => meta.status === "ATINGIDA").length,
    emAndamento: metasElegiveis.filter(({ meta }) => meta.status === "NAO_INICIADA" || meta.status === "EM_ANDAMENTO" || meta.status === "PARCIALMENTE_ATINGIDA").length,
    naoAtingidas: metasElegiveis.filter(({ meta }) => meta.status === "NAO_ATINGIDA").length,
  };
  const ciclosAcompanhamento = metas.filter(({ meta }) => meta.status !== "ATINGIDA" && meta.status !== "CANCELADA")
    .map(({ ciclo, meta }) => {
      const situacao = estadoMeta(meta.status);
      const antes = formatarValorMeta(meta.valorBase, meta.unidadeMedida);
      const atual = "—";
      return {
        id: `${ciclo.id}:${meta.id}`, cicloId: ciclo.id, ciclo: ciclo.titulo, indicador: meta.objetivo,
        antesAtual: `${antes} → ${atual}`, meta: formatarValorMeta(meta.valorAlvo, meta.unidadeMedida),
        situacao: situacao.texto, varianteSituacao: situacao.variante,
        ordenacao: meta.status === "NAO_ATINGIDA" ? 0 : meta.status === "NAO_INICIADA" ? 1 : 2,
      };
    }).sort((a, b) => a.ordenacao - b.ordenacao).slice(0, 3)
    .map(({ ordenacao: _ordenacao, ...item }) => item);
  const dados: DadosCheckTodosCiclos = {
    metricas: [
      { id: "indicadores", titulo: "Indicadores", valor: metasDisponiveis ? metasElegiveis.length : "—", contexto: metasDisponiveis ? `em ${ciclosComMetas} ciclos` : "dados indisponíveis", variante: "indicadores" },
      { id: "avaliadas", titulo: "Verificações registradas", valor: verificacoesDisponiveis ? verificacoesNoPeriodo : "—", contexto: verificacoesDisponiveis ? "no período avaliado" : "dados indisponíveis", variante: "metas" },
      { id: "aguardam-registro", titulo: "Aguardam registro", valor: verificacoesDisponiveis ? aguardamRegistro : "—", contexto: verificacoesDisponiveis ? "aguardam verificação" : "dados indisponíveis", variante: "verificacoes" },
      { id: "em-acompanhamento", titulo: "Em acompanhamento", valor: metasDisponiveis ? emAcompanhamento : "—", contexto: metasDisponiveis ? "metas em andamento" : "dados indisponíveis", variante: "efeitos" },
    ],
    resultadosPorCiclo,
    situacaoMetas,
    ciclosAcompanhamento,
  };
  const escalaMaximaResultados = Math.max(8, Math.ceil(Math.max(0, ...resultadosPorCiclo.map((item) => item.aprovadas + item.parciais + item.reprovadas)) / 4) * 4);
  const escalaResultados = Array.from({ length: 5 }, (_, indice) => (escalaMaximaResultados / 4) * indice);
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
          ) : estado === "indisponivel" ? (
            <section className="check-todos-ciclos_vazio" role="status" aria-live="polite">
              <h2>Visão geral de Check indisponível</h2>
              <p>Não foi possível validar a empresa da conta atual.</p>
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
                  {!verificacoesDisponiveis ? (
                    <p className="check-todos-ciclos_grafico-vazio" role="status">Dados das verificações indisponíveis.</p>
                  ) : dados.resultadosPorCiclo.length === 0 ? (
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
                                <span className="check-todos-ciclos_barra-segmento check-todos-ciclos_barra-segmento-aprovadas" style={larguraSegmento(item.aprovadas, escalaMaximaResultados)}>{item.aprovadas}</span>
                                <span className="check-todos-ciclos_barra-segmento check-todos-ciclos_barra-segmento-parciais" style={larguraSegmento(item.parciais, escalaMaximaResultados)}>{item.parciais}</span>
                                <span className="check-todos-ciclos_barra-segmento check-todos-ciclos_barra-segmento-reprovadas" style={larguraSegmento(item.reprovadas, escalaMaximaResultados)}>{item.reprovadas}</span>
                                <strong className="check-todos-ciclos_barra-total" style={posicaoTotal(total, escalaMaximaResultados)}>{total}</strong>
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
                  {!metasDisponiveis ? (
                    <p className="check-todos-ciclos_grafico-vazio" role="status">Dados das metas indisponíveis.</p>
                  ) : dados.situacaoMetas.total === 0 ? (
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
                        <tr key={item.id} onClick={(evento) => {
                          if (evento.target instanceof Element && evento.target.closest("a, button")) return;
                          navegar(`/do/ciclo/${item.cicloId}/check`);
                        }}>
                          <th scope="row"><Link className="check-todos-ciclos_link-ciclo" to={`/do/ciclo/${item.cicloId}/check`} aria-label={`Abrir Check do ciclo ${item.ciclo}`}>{item.ciclo}</Link></th>
                          <td>{item.indicador}</td>
                          <td>{item.antesAtual}</td>
                          <td>{item.meta}</td>
                          <td><span className={`check-todos-ciclos_status check-todos-ciclos_status-${item.varianteSituacao}`}>{item.situacao}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dados.ciclosAcompanhamento.length === 0 && <p className="check-todos-ciclos_tabela-vazia" role="status">Nenhum indicador precisa de acompanhamento.</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

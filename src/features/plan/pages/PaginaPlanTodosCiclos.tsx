import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import {
  listarCiclosPg,
  listarPlanosPorCicloPg,
  listarCausasRaizPorCicloPg,
  listarProblemasPorCicloPg,
  listarMetasPorCicloPg,
  listarVerificacoesPorCicloPg,
  listarTarefasPorPlanoPg,
  type CicloPg,
  type PlanoAcaoPg,
  type TarefaDoPlanoPg,
  type CausaRaizPg,
  type ProblemaPg,
  type MetaPg,
  type VerificacaoPg,
} from "../../../services/api/pg/dashboard.read.api";
import { listarFormulariosMongo, type FormularioMongo } from "../../../services/api/mongo/dashboard.read.api";
import { Sidebar } from "../../layout/components/Sidebar";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-plan-todos-ciclos.css";

export type VarianteMetricaPlanCiclos = "azul" | "ciano" | "laranja" | "verde";

export type MetricaPlanCiclos = {
  id: string;
  titulo: string;
  valor: number | string;
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

type PlanoAcaoGlobal = {
  ciclo: CicloPg;
  plano: PlanoAcaoPg;
  tarefas: readonly TarefaDoPlanoPg[];
};

type DadosCicloPlanApi = {
  ciclo: CicloPg;
  causas: readonly CausaRaizPg[] | null;
  problemas: readonly ProblemaPg[] | null;
  metas: readonly MetaPg[] | null;
  verificacoes: readonly VerificacaoPg[] | null;
  formularios: readonly FormularioMongo[] | null;
  planos: readonly PlanoAcaoGlobal[] | null;
};
type EstadoVisaoPlan = "carregando" | "sucesso" | "erro" | "indisponivel";
type SnapshotVisaoPlan = { chave: string | null; estado: EstadoVisaoPlan; ciclos: readonly DadosCicloPlanApi[] };

function formatarPrazoPlano(prazo: string | null): string {
  if (!prazo) return "Prazo não informado";
  const partes = prazo.includes("/") ? prazo.split("/").reverse() : prazo.split("-");
  const [ano, mes, dia] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);
  if (!Number.isFinite(data.getTime())) return "Prazo não informado";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(data).replace(".", "");
}

type EstiloPosicaoTotal = CSSProperties & { "--posicao-total-percentual": string };

function larguraSegmento(valor: number, escalaMaxima: number): CSSProperties {
  return { width: `${Math.max(0, (valor / escalaMaxima) * 100)}%` };
}

function posicaoTotal(total: number, escalaMaxima: number): EstiloPosicaoTotal {
  const percentual = Math.min(100, Math.max(0, (total / escalaMaxima) * 100));
  return { "--posicao-total-percentual": `${percentual}%` };
}

function formatarPrazoCiclo(prazo: string | null): string {
  return prazo ? formatarPrazoPlano(prazo) : "A definir";
}

function rotuloStatusCiclo(status: CicloPg["status"]): string {
  return ({ PLANEJAMENTO: "Em planejamento", EXECUCAO: "Em execução", VERIFICACAO: "Em verificação", PADRONIZACAO: "Em padronização", CONCLUIDO: "Concluído", CANCELADO: "Cancelado", PAUSADO: "Pausado" })[status];
}

function pendenciaCiclo(ciclo: DadosCicloPlanApi): string {
  if (ciclo.problemas === null) return "Problemas indisponíveis";
  if (ciclo.problemas.length === 0) return "Identificar problema";
  if (ciclo.formularios?.some(({ status }) => status === "RASCUNHO")) return "Coleta de dados";
  if (ciclo.causas === null) return "Causas indisponíveis";
  if (ciclo.causas.some(({ aceita }) => aceita === null)) return "Validar causas";
  if (ciclo.metas === null) return "Metas indisponíveis";
  if (ciclo.metas.length === 0) return "Definir meta";
  if (ciclo.planos === null) return "Planos indisponíveis";
  if (ciclo.planos.some(({ plano }) => plano.status === "RASCUNHO")) return "Revisar plano";
  if (ciclo.verificacoes === null) return "Verificação indisponível";
  if (ciclo.verificacoes.length === 0) return "Registrar verificação";
  return "Acompanhar ciclo";
}

export function PaginaPlanTodosCiclos() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const navegar = useNavigate();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa
    ? `${firebaseUser.uid}:${idEmpresa}` : null;
  const [snapshot, setSnapshot] = useState<SnapshotVisaoPlan>({ chave: null, estado: "carregando", ciclos: [] });

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

    async function carregarVisaoPlan() {
      try {
        const ciclos = await listarCiclosPg(idEmpresaValidada, controller.signal);
        const dadosPorCiclo: DadosCicloPlanApi[] = new Array(ciclos.length);
        let proximoIndice = 0;

        async function carregarCiclo() {
          while (!controller.signal.aborted) {
            const indice = proximoIndice++;
            if (indice >= ciclos.length) return;
            const ciclo = ciclos[indice];
            const [causasResultado, problemasResultado, metasResultado, verificacoesResultado, formulariosResultado, planosResultado] = await Promise.allSettled([
              listarCausasRaizPorCicloPg(ciclo.id, controller.signal),
              listarProblemasPorCicloPg(ciclo.id, controller.signal),
              listarMetasPorCicloPg(ciclo.id, controller.signal),
              listarVerificacoesPorCicloPg(ciclo.id, controller.signal),
              listarFormulariosMongo(ciclo.id, controller.signal).catch(() => null),
              listarPlanosPorCicloPg(ciclo.id, controller.signal),
            ]);
            const causas = causasResultado.status === "fulfilled" ? causasResultado.value : null;
            const problemas = problemasResultado.status === "fulfilled" ? problemasResultado.value : null;
            const metas = metasResultado.status === "fulfilled" ? metasResultado.value : null;
            const verificacoes = verificacoesResultado.status === "fulfilled" ? verificacoesResultado.value : null;
            const formularios = formulariosResultado.status === "fulfilled" ? formulariosResultado.value : null;
            const planosApi = planosResultado.status === "fulfilled" ? planosResultado.value : null;
            let planosGlobais: PlanoAcaoGlobal[] | null = null;
            if (planosApi !== null) {
              try {
                planosGlobais = await Promise.all(planosApi.map(async (plano) => {
                  const tarefas = await listarTarefasPorPlanoPg(plano.id, controller.signal);
                  if (plano.idCiclo !== ciclo.id || tarefas.some((tarefa) => tarefa.idPlanoAcao !== plano.id)) throw new Error("Associação de dados do Plan inválida.");
                  return { ciclo, plano, tarefas };
                }));
              } catch {
                planosGlobais = null;
              }
            }
            dadosPorCiclo[indice] = { ciclo, causas, problemas, metas, verificacoes, formularios, planos: planosGlobais };
          }
        }

        await Promise.all(Array.from({ length: Math.min(3, ciclos.length) }, () => carregarCiclo()));
        if (!controller.signal.aborted) {
          setSnapshot({ chave, estado: "sucesso", ciclos: dadosPorCiclo });
        }
      } catch {
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "erro", ciclos: [] });
      }
    }

    void carregarVisaoPlan();
    return () => controller.abort();
  }, [authLoading, chave, idEmpresa]);

  const estado: EstadoVisaoPlan = authLoading ? "carregando"
    : !chave ? "indisponivel"
      : snapshot.chave === chave ? snapshot.estado : "carregando";
  const ciclosApi = estado === "sucesso" && snapshot.chave === chave ? snapshot.ciclos : [];
  const planosDisponiveis = ciclosApi.every((item) => item.planos !== null);
  const causasDisponiveis = ciclosApi.every((item) => item.causas !== null);
  const planos = ciclosApi.flatMap(({ planos: porCiclo }) => porCiclo ?? []);
  const causasPorCiclo = ciclosApi.filter(({ causas }) => causas !== null).map(({ ciclo, causas }) => {
    const registros = causas ?? [];
    return {
      id: String(ciclo.id), ciclo: ciclo.titulo,
      aceitas: registros.filter(({ aceita }) => aceita === true).length,
      aguardandoValidacao: registros.filter(({ aceita }) => aceita === null).length,
    };
  }).filter(({ aceitas, aguardandoValidacao }) => aceitas + aguardandoValidacao > 0)
    .sort((a, b) => b.aceitas + b.aguardandoValidacao - a.aceitas - a.aguardandoValidacao).slice(0, 4);
  const totalCausasAguardando = ciclosApi.reduce((soma, item) => soma + (item.causas ?? []).filter(({ aceita }) => aceita === null).length, 0);
  const coletasDisponiveis = ciclosApi.every((item) => item.formularios !== null);
  const totalColetasPendentes = ciclosApi.reduce((soma, item) => soma + (item.formularios ?? []).filter(({ status }) => status === "RASCUNHO").length, 0);
  const totalCiclosPlan = ciclosApi.length;
  const planosEmRevisao = planos.filter(({ plano }) => plano.status === "RASCUNHO").length;
  const ciclosAcompanhamento = ciclosApi.filter(({ ciclo }) => ciclo.status === "PLANEJAMENTO")
    .map((item) => {
      const nomesResponsaveis = [...new Set((item.planos ?? []).flatMap(({ tarefas }) => tarefas.flatMap((tarefa) => tarefa.nomeResponsavel ? [tarefa.nomeResponsavel] : [])))];
      const varianteStatus = item.ciclo.status === "PLANEJAMENTO" ? "revisao" as const : item.ciclo.status === "EXECUCAO" ? "andamento" as const : "atencao" as const;
      return {
        id: String(item.ciclo.id), ciclo: item.ciclo.titulo,
        responsavel: nomesResponsaveis.length ? nomesResponsaveis.join(", ") : "A definir",
        prazo: formatarPrazoCiclo(item.ciclo.dataEstimadaFim), pendencia: pendenciaCiclo(item),
        status: rotuloStatusCiclo(item.ciclo.status), varianteStatus,
        ordenacao: item.ciclo.dataEstimadaFim ?? "9999-12-31",
      };
    }).sort((a, b) => a.ordenacao.localeCompare(b.ordenacao)).slice(0, 3)
    .map(({ ordenacao: _ordenacao, ...item }) => item);
  const dados: DadosPlanTodosCiclos = {
    metricas: [
      { id: "ciclos-planejamento", titulo: "Ciclos em Plan", valor: totalCiclosPlan, contexto: "ciclos cadastrados", variante: "azul" },
      { id: "coletas-pendentes", titulo: "Coletas pendentes", valor: coletasDisponiveis ? totalColetasPendentes : "—", contexto: coletasDisponiveis ? "formulários em rascunho" : "dados indisponíveis", variante: "ciano" },
      { id: "causas-analise", titulo: "Causas em análise", valor: causasDisponiveis ? totalCausasAguardando : "—", contexto: causasDisponiveis ? "aguardam validação" : "dados indisponíveis", variante: "laranja" },
      { id: "planos-revisao", titulo: "Planos em aprovação", valor: planosDisponiveis ? planosEmRevisao : "—", contexto: planosDisponiveis ? "aguardam aprovação" : "dados indisponíveis", variante: "verde" },
    ],
    causasPorCiclo,
    planosAcao: {
      total: planosDisponiveis ? planos.filter(({ plano }) => plano.status === "RASCUNHO" || plano.status === "APROVADO").length : 0,
      rascunho: planos.filter(({ plano }) => plano.status === "RASCUNHO").length,
      aprovado: planos.filter(({ plano }) => plano.status === "APROVADO").length,
    },
    ciclosAcompanhamento,
  };
  const escalaMaximaCausas = Math.max(8, Math.ceil(Math.max(0, ...causasPorCiclo.map((item) => item.aceitas + item.aguardandoValidacao)) / 2) * 2);
  const escalaCausas = Array.from({ length: 5 }, (_, indice) => Math.round((escalaMaximaCausas / 4) * indice));
  const totalPlanos = dados.planosAcao.total;
  const percentualRascunho = totalPlanos > 0 ? (dados.planosAcao.rascunho / totalPlanos) * 100 : 0;
  const resumoDonut = `Rascunho: ${dados.planosAcao.rascunho} de ${totalPlanos} (${Math.round(percentualRascunho)}%). Aprovado: ${dados.planosAcao.aprovado} de ${totalPlanos} (${Math.round(totalPlanos > 0 ? (dados.planosAcao.aprovado / totalPlanos) * 100 : 0)}%).`;

  return (
    <main className="pagina-web-listas pagina-plan-ciclos">
      <Sidebar />
      <div className="web-listas_painel plan-ciclos_painel">
        <div className="plan-ciclos_conteudo">
          <header className="plan-ciclos_cabecalho">
            <h1>Plan · Todos os ciclos</h1>
            <p>Acompanhe problemas, coleta, causas, metas e planos de ação em planejamento.</p>
          </header>

          {estado === "carregando" ? (
            <section className="plan-ciclos_vazio" role="status" aria-live="polite" aria-busy="true">
              <h2>Carregando dados do Plan</h2>
            </section>
          ) : estado === "erro" ? (
            <section className="plan-ciclos_vazio" role="alert">
              <h2>Não foi possível carregar os dados do Plan</h2>
              <p>Tente novamente mais tarde.</p>
            </section>
          ) : estado === "indisponivel" ? (
            <section className="plan-ciclos_vazio" role="status">
              <h2>Visão geral do Plan indisponível</h2>
              <p>Não foi possível validar a empresa da conta atual.</p>
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
                  {!causasDisponiveis ? (
                    <p className="plan-ciclos_grafico-vazio" role="status">Dados de causas indisponíveis.</p>
                  ) : dados.causasPorCiclo.length === 0 ? (
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
                                <span className="plan-ciclos_barra-segmento plan-ciclos_barra-segmento-aceitas" style={larguraSegmento(item.aceitas, escalaMaximaCausas)}>{item.aceitas}</span>
                                <span className="plan-ciclos_barra-segmento plan-ciclos_barra-segmento-validacao" style={larguraSegmento(item.aguardandoValidacao, escalaMaximaCausas)}>{item.aguardandoValidacao}</span>
                              </div>
                              <strong className="plan-ciclos_barra-total" style={posicaoTotal(total, escalaMaximaCausas)}>{total}</strong>
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
                  {!planosDisponiveis ? (
                    <p className="plan-ciclos_grafico-vazio" role="status">Dados dos planos indisponíveis.</p>
                  ) : totalPlanos === 0 ? (
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
                        {[
                          { rotulo: "Rascunho", total: dados.planosAcao.rascunho, classe: "rascunho" },
                          { rotulo: "Aprovado", total: dados.planosAcao.aprovado, classe: "aprovado" },
                        ].filter((item) => item.total > 0).map((item) => (
                          <li key={item.classe}>
                            <span className={`plan-ciclos_legenda-amostra plan-ciclos_legenda-amostra-${item.classe}`} aria-hidden="true" />
                            {item.rotulo}<strong>{item.total}</strong><span>{Math.round((item.total / totalPlanos) * 100)}%</span>
                          </li>
                        ))}
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
                        <tr key={ciclo.id} onClick={(evento) => {
                          if (evento.target instanceof Element && evento.target.closest("a, button")) return;
                          navegar(`/do/ciclo/${ciclo.id}/plan`);
                        }}>
                          <th scope="row"><Link className="plan-ciclos_link-ciclo" to={`/do/ciclo/${ciclo.id}/plan`} aria-label={`Abrir Plan do ciclo ${ciclo.ciclo}`}>{ciclo.ciclo}</Link></th>
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

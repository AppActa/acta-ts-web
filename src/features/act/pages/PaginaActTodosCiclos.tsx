import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import {
  listarCiclosPg,
  listarPlanosPorCicloPg,
  listarTarefasPorPlanoPg,
  type CicloPg,
  type PlanoAcaoPg,
  type TarefaDoPlanoPg,
} from "../../../services/api/pg/dashboard.read.api";
import { listarFormulariosMongo, listarLicoesAprendidasMongo, type FormularioMongo, type LicaoAprendidaMongo } from "../../../services/api/mongo/dashboard.read.api";
import { Sidebar } from "../../layout/components/Sidebar";
import "../styles/pagina-act-todos-ciclos.css";

type DadosCicloActGlobal = {
  ciclo: CicloPg;
  planos: readonly { plano: PlanoAcaoPg; tarefas: readonly TarefaDoPlanoPg[] | null }[] | null;
  formularios: readonly FormularioMongo[] | null;
  licoes: readonly LicaoAprendidaMongo[] | null;
};
type EstadoAct = "carregando" | "sucesso" | "erro" | "indisponivel";
type SnapshotAct = { chave: string | null; estado: EstadoAct; ciclos: readonly DadosCicloActGlobal[] };

function formatarPrazo(valor: string | null): string {
  if (!valor) return "A definir";
  const partes = valor.includes("/") ? valor.split("/").reverse() : valor.split("-");
  const [ano, mes, dia] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);
  return Number.isFinite(data.getTime()) ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(data).replace(".", "") : "A definir";
}

function mensagemProximaAcao(ciclo: DadosCicloActGlobal): string {
  if (ciclo.planos === null || ciclo.formularios === null) return "Dados de acompanhamento indisponíveis";
  const tarefasPendentes = ciclo.planos.flatMap(({ tarefas }) => tarefas ?? []).filter(({ status }) => status !== "CONCLUIDA" && status !== "CANCELADA").length;
  if (tarefasPendentes > 0) return `${tarefasPendentes} ação${tarefasPendentes === 1 ? " pendente" : "ões pendentes"}`;
  const padroesAtivos = ciclo.formularios.filter(({ tipo, status }) => tipo === "PADRONIZACAO" && status === "ATIVO").length;
  return padroesAtivos > 0 ? "Concluir padronização" : "Registrar padrão";
}

export function PaginaActTodosCiclos() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa ? `${firebaseUser.uid}:${idEmpresa}` : null;
  const [snapshot, setSnapshot] = useState<SnapshotAct>({ chave: null, estado: "carregando", ciclos: [] });

  useEffect(() => {
    if (authLoading) {
      setSnapshot({ chave: null, estado: "carregando", ciclos: [] });
      return;
    }
    if (!chave || !idEmpresa) {
      setSnapshot({ chave: null, estado: "indisponivel", ciclos: [] });
      return;
    }

    const controller = new AbortController();
    setSnapshot({ chave, estado: "carregando", ciclos: [] });
    async function carregar() {
      try {
        const ciclos = await listarCiclosPg(idEmpresa!, controller.signal);
        const dados: DadosCicloActGlobal[] = new Array(ciclos.length);
        let proximoIndice = 0;
        async function carregarCiclo() {
          while (!controller.signal.aborted) {
            const indice = proximoIndice++;
            if (indice >= ciclos.length) return;
            const ciclo = ciclos[indice];
            const [planosResultado, formulariosResultado, licoesResultado] = await Promise.allSettled([
              listarPlanosPorCicloPg(ciclo.id, controller.signal),
              listarFormulariosMongo(ciclo.id, controller.signal),
              listarLicoesAprendidasMongo(ciclo.id, controller.signal),
            ]);
            const planosApi = planosResultado.status === "fulfilled" ? planosResultado.value : null;
            const planos = planosApi === null ? null : await Promise.all(planosApi.map(async (plano) => {
              try {
                return { plano, tarefas: await listarTarefasPorPlanoPg(plano.id, controller.signal) };
              } catch {
                return { plano, tarefas: null };
              }
            }));
            dados[indice] = {
              ciclo,
              planos,
              formularios: formulariosResultado.status === "fulfilled" ? formulariosResultado.value : null,
              licoes: licoesResultado.status === "fulfilled" ? licoesResultado.value : null,
            };
          }
        }
        await Promise.all(Array.from({ length: Math.min(3, ciclos.length) }, () => carregarCiclo()));
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "sucesso", ciclos: dados });
      } catch {
        if (!controller.signal.aborted) setSnapshot({ chave, estado: "erro", ciclos: [] });
      }
    }
    void carregar();
    return () => controller.abort();
  }, [authLoading, chave, idEmpresa]);

  const estado: EstadoAct = authLoading ? "carregando" : !chave ? "indisponivel" : snapshot.chave === chave ? snapshot.estado : "carregando";
  const ciclos = estado === "sucesso" && snapshot.chave === chave ? snapshot.ciclos : [];
  const licoesDisponiveis = ciclos.every(({ licoes }) => licoes !== null);
  const formulariosDisponiveis = ciclos.every(({ formularios }) => formularios !== null);
  const planosDisponiveis = ciclos.every(({ planos }) => planos !== null);
  const licoes = ciclos.flatMap(({ licoes }) => licoes ?? []);
  const padroesAtivos = ciclos.flatMap(({ formularios }) => (formularios ?? []).filter(({ tipo, status }) => tipo === "PADRONIZACAO" && status === "ATIVO"));
  const tarefasAtivas = ciclos.flatMap(({ planos }) => (planos ?? []).flatMap(({ plano, tarefas }) => plano.status === "CANCELADO" ? [] : (tarefas ?? []).filter(({ status }) => status !== "CONCLUIDA" && status !== "CANCELADA")));
  const ciclosParaFechar = ciclos.filter(({ ciclo }) => ciclo.status === "PADRONIZACAO");

  const aprendizadosPorArea = new Map<string, number>();
  for (const licao of licoes) {
    const areas = licao.tags?.length ? [...new Set(licao.tags.map((tag) => tag.trim()).filter(Boolean))] : ["Sem área informada"];
    for (const area of areas) aprendizadosPorArea.set(area, (aprendizadosPorArea.get(area) ?? 0) + 1);
  }
  const barrasAprendizados = [...aprendizadosPorArea].map(([area, total]) => ({ area, total }))
    .sort((a, b) => b.total - a.total || a.area.localeCompare(b.area)).slice(0, 5);
  const escalaAprendizados = Math.max(1, ...barrasAprendizados.map(({ total }) => total));
  const ciclosAcompanhamento = [...ciclosParaFechar].sort((a, b) => (a.ciclo.dataEstimadaFim ?? "9999-12-31").localeCompare(b.ciclo.dataEstimadaFim ?? "9999-12-31"));

  return (
    <main className="act-todos-ciclos">
      <Sidebar />
      <div className="act-todos-ciclos_painel">
        <div className="act-todos-ciclos_conteudo">
          <header className="act-todos-ciclos_cabecalho">
            <h1>Act · Todos os ciclos</h1>
            <p>Compare indicadores, metas e registros para entender os resultados da execução.</p>
          </header>

          {estado === "carregando" ? (
            <section className="act-todos-ciclos_estado" role="status" aria-live="polite" aria-busy="true"><h2>Carregando dados de Act</h2></section>
          ) : estado === "erro" ? (
            <section className="act-todos-ciclos_estado" role="alert"><h2>Não foi possível carregar os dados de Act</h2><p>Tente novamente mais tarde.</p></section>
          ) : estado === "indisponivel" ? (
            <section className="act-todos-ciclos_estado" role="status"><h2>Visão geral de Act indisponível</h2><p>Não foi possível validar a empresa da conta atual.</p></section>
          ) : (
            <>
              <section className="act-todos-ciclos_metricas" aria-label="Resumo global de Act">
                <article className="act-todos-ciclos_metrica act-todos-ciclos_metrica-aprendizados"><h2>Aprendizados</h2><p><strong>{licoesDisponiveis ? String(licoes.length).padStart(2, "0") : "—"}</strong><span>{licoesDisponiveis ? "registrados nos ciclos" : "dados indisponíveis"}</span></p></article>
                <article className="act-todos-ciclos_metrica act-todos-ciclos_metrica-padroes"><h2>Padrões atualizados</h2><p><strong>{formulariosDisponiveis ? String(padroesAtivos.length).padStart(2, "0") : "—"}</strong><span>{formulariosDisponiveis ? "formulários ativos" : "dados indisponíveis"}</span></p></article>
                <article className="act-todos-ciclos_metrica act-todos-ciclos_metrica-acoes"><h2>Ações de melhoria</h2><p><strong>{planosDisponiveis ? String(tarefasAtivas.length).padStart(2, "0") : "—"}</strong><span>{planosDisponiveis ? "em acompanhamento" : "dados indisponíveis"}</span></p></article>
                <article className="act-todos-ciclos_metrica act-todos-ciclos_metrica-ciclos"><h2>Ciclos para fechar</h2><p><strong>{String(ciclosParaFechar.length).padStart(2, "0")}</strong><span>em padronização</span></p></article>
              </section>

              <div className="act-todos-ciclos_graficos">
                <section className="act-todos-ciclos_grafico" aria-labelledby="act-aprendizados-titulo">
                  <header><h2 id="act-aprendizados-titulo">Aprendizados por área</h2><p>Distribuição pelas tags registradas nas lições</p></header>
                  {!licoesDisponiveis ? <p className="act-todos-ciclos_mensagem">Dados de aprendizados indisponíveis.</p> : barrasAprendizados.length === 0 ? <p className="act-todos-ciclos_mensagem">Nenhum aprendizado registrado.</p> : <>
                    <ul className="act-todos-ciclos_barras" aria-label="Aprendizados agrupados por tag">
                      {barrasAprendizados.map(({ area, total }) => <li key={area}><span title={area}>{area}</span><div aria-hidden="true"><i style={{ width: `${(total / escalaAprendizados) * 100}%` }}>{total}</i></div><strong>{total}</strong></li>)}
                    </ul>
                    <p className="act-todos-ciclos_legenda"><i aria-hidden="true" />Aprendizados registrados</p>
                  </>}
                  <p className="act-todos-ciclos_nota">Quantidade de lições · dados agrupados pelas tags informadas</p>
                </section>

                <section className="act-todos-ciclos_grafico act-todos-ciclos_treinamentos" aria-labelledby="act-treinamentos-titulo">
                  <header><h2 id="act-treinamentos-titulo">Participação nos treinamentos</h2><p>Registros de participação nos ciclos</p></header>
                  <p className="act-todos-ciclos_mensagem">A API atual não disponibiliza registros de participação em treinamentos.</p>
                </section>
              </div>

              <section className="act-todos-ciclos_tabela-secao" aria-labelledby="act-acompanhamento-titulo">
                <h2 id="act-acompanhamento-titulo">Ciclos que precisam de acompanhamento</h2>
                {ciclosAcompanhamento.length === 0 ? <p className="act-todos-ciclos_mensagem">Nenhum ciclo está em padronização neste momento.</p> : <div className="act-todos-ciclos_tabela-rolagem" role="region" aria-label="Ciclos em padronização" tabIndex={0}>
                  <table>
                    <thead><tr><th scope="col">Ciclo</th><th scope="col">Aprendizados</th><th scope="col">Padrões ativos</th><th scope="col">Prazo final</th><th scope="col">Próxima ação</th></tr></thead>
                    <tbody>{ciclosAcompanhamento.map((item) => {
                      const licoesDoCiclo = item.licoes?.length;
                      const padroesDoCiclo = item.formularios?.filter(({ tipo, status }) => tipo === "PADRONIZACAO" && status === "ATIVO").length;
                      return <tr key={item.ciclo.id}>
                        <th scope="row"><Link to={`/do/ciclo/${item.ciclo.id}/act`}>{item.ciclo.titulo}</Link></th>
                        <td>{licoesDoCiclo === undefined || item.licoes === null ? "—" : licoesDoCiclo}</td>
                        <td>{padroesDoCiclo === undefined || item.formularios === null ? "—" : padroesDoCiclo}</td>
                        <td>{formatarPrazo(item.ciclo.dataEstimadaFim)}</td>
                        <td>{mensagemProximaAcao(item)}</td>
                      </tr>;
                    })}</tbody>
                  </table>
                </div>}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

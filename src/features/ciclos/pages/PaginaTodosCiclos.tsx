import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarCiclosPg, type CicloPg, type StatusCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { Sidebar } from "../../layout/components/Sidebar";
import voltarMoldura from "../assets/voltar-moldura.svg";
import voltarSeta from "../assets/voltar-seta.svg";
import iconeCriar from "../assets/icone-criar.svg";
import gatoPrimeiroCiclo from "../assets/primeiro-ciclo-gato.png";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-todos-ciclos.css";

type FiltroCiclo = "Todos" | "Em execução" | "Concluídos";
type StatusCarregamento = "loading" | "success" | "error";
type EstadoCiclos = { accountKey: string | null; status: StatusCarregamento; ciclos: CicloPg[] };

const STATUS_EM_EXECUCAO: readonly StatusCicloPg[] = ["EXECUCAO"];

function rotuloStatus(status: StatusCicloPg): string {
  switch (status) {
    case "PLANEJAMENTO": return "Planejamento";
    case "EXECUCAO": return "Em execução";
    case "VERIFICACAO": return "Verificação";
    case "PADRONIZACAO": return "Padronização";
    case "CONCLUIDO": return "Concluído";
    case "CANCELADO": return "Cancelado";
    case "PAUSADO": return "Pausado";
  }
}

function estaEmExecucao(status: StatusCicloPg): boolean {
  return STATUS_EM_EXECUCAO.includes(status);
}

export function PaginaTodosCiclos() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroCiclo>("Todos");
  const [estadoCiclos, setEstadoCiclos] = useState<EstadoCiclos>({ accountKey: null, status: "loading", ciclos: [] });

  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const accountKey = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa ? `${firebaseUser.uid}:${idEmpresa}` : null;

  useEffect(() => {
    if (authLoading) {
      setEstadoCiclos({ accountKey: null, status: "loading", ciclos: [] });
      return;
    }

    if (!accountKey || !idEmpresa) {
      setEstadoCiclos({ accountKey: null, status: "error", ciclos: [] });
      return;
    }

    const controller = new AbortController();
    setEstadoCiclos({ accountKey, status: "loading", ciclos: [] });

    void listarCiclosPg(idEmpresa, controller.signal)
      .then((ciclos) => {
        if (!controller.signal.aborted) setEstadoCiclos({ accountKey, status: "success", ciclos });
      })
      .catch(() => {
        if (!controller.signal.aborted) setEstadoCiclos({ accountKey, status: "error", ciclos: [] });
      });

    return () => controller.abort();
  }, [authLoading, accountKey, idEmpresa]);

  const estadoAtual: StatusCarregamento = authLoading
    ? "loading"
    : !accountKey
      ? "error"
      : estadoCiclos.accountKey === accountKey
        ? estadoCiclos.status
        : "loading";
  const ciclosDaConta = estadoAtual === "success" && estadoCiclos.accountKey === accountKey ? estadoCiclos.ciclos : [];
  const totalEmExecucao = ciclosDaConta.filter((ciclo) => estaEmExecucao(ciclo.status)).length;
  const totalConcluidos = ciclosDaConta.filter((ciclo) => ciclo.status === "CONCLUIDO").length;

  const filtrados = useMemo(() => ciclosDaConta.filter((ciclo) => {
    const combinaBusca = ciclo.titulo.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
    const combinaStatus = filtro === "Todos"
      || (filtro === "Em execução" && estaEmExecucao(ciclo.status))
      || (filtro === "Concluídos" && ciclo.status === "CONCLUIDO");
    return combinaBusca && combinaStatus;
  }), [ciclosDaConta, busca, filtro]);

  return (
    <main className="pagina-web-listas pagina-todos-ciclos">
      <Sidebar />
      <div className="web-listas_painel">
        <header className="web-listas_cabecalho">
          <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA"><img src={voltarMoldura} alt="" /><img src={voltarSeta} alt="" /></Link><h1>Todos os ciclos</h1><button type="button" disabled title="Disponível em breve"><img src={iconeCriar} alt="" />Criar novo</button></div>
        </header>
        {estadoAtual === "success" && ciclosDaConta.length === 0 ? (
          <section className="lista-ciclos_conteudo lista-ciclos_conteudo--vazio" aria-label="Ciclos do ACTA">
            <div className="lista-ciclos_primeiro-ciclo" role="status">
              <img src={gatoPrimeiroCiclo} alt="" />
              <h2>Seu primeiro ciclo começa aqui</h2>
              <p>Crie um ciclo para organizar problemas, acompanhar ações e compartilhar<br className="lista-ciclos_quebra-descricao" /> aprendizados com a equipe.</p>
              <button type="button" disabled title="Criação de ciclos ainda não está disponível">Criar ciclo</button>
            </div>
          </section>
        ) : (
        <section className="lista-ciclos_conteudo" aria-label="Ciclos do ACTA">
          <div className="lista-ciclos_filtros">
            <label className="lista-ciclos_busca"><span className="sr-only">Buscar ciclo</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar ciclo" /></label>
            <div className="lista-ciclos_tabs" role="group" aria-label="Filtrar ciclos">
              {[
                { nome: "Todos" as const, total: ciclosDaConta.length },
                { nome: "Em execução" as const, total: totalEmExecucao },
                { nome: "Concluídos" as const, total: totalConcluidos },
              ].map((item) => <button type="button" className={filtro === item.nome ? "ativo" : ""} aria-pressed={filtro === item.nome} key={item.nome} onClick={() => setFiltro(item.nome)}>{item.nome} ({item.total})</button>)}
            </div>
          </div>
          <div className="lista-ciclos_itens" aria-live="polite">
            {estadoAtual === "loading" && <p className="lista-ciclos_vazio" role="status">Carregando ciclos…</p>}
            {estadoAtual === "error" && <p className="lista-ciclos_vazio" role="alert">Não foi possível carregar os ciclos. Tente novamente mais tarde.</p>}
            {estadoAtual === "success" && filtrados.map((ciclo) => {
              const concluido = ciclo.status === "CONCLUIDO";
              const statusAtivo = estaEmExecucao(ciclo.status);
              const percentualConcluido = 0;
              return (
                <article className="lista-ciclos_item" key={ciclo.id}>
                  <span className="lista-ciclos_icone ciano" aria-hidden="true" />
                  <div className="lista-ciclos_identificacao"><h2>{ciclo.titulo}</h2><p>Responsável: Não informado <span>•</span> Prazo: {ciclo.dataEstimadaFim ?? "Não informado"}</p></div>
                  <span className={`lista-ciclos_estado ${concluido ? "concluido" : statusAtivo ? "andamento" : ""}`}>{rotuloStatus(ciclo.status)}</span>
                  <div className="lista-ciclos_progresso">
                    <strong>{percentualConcluido}% concluído</strong>
                    <span role="progressbar" aria-label={`Progresso de ${ciclo.titulo}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentualConcluido}>
                      <i style={{ width: `${percentualConcluido}%` }} />
                    </span>
                  </div>
                  <Link className="lista-ciclos_abrir ciano" to={`/do/ciclo/${ciclo.id}`}>Abrir ciclo</Link>
                  <button className="lista-ciclos_mais" type="button" aria-label={`Mais ações para ${ciclo.titulo}`} disabled title="Mais ações ainda não estão disponíveis">⋮</button>
                </article>
              );
            })}
            {estadoAtual === "success" && filtrados.length === 0 && <p className="lista-ciclos_vazio" role="status">{ciclosDaConta.length === 0 ? "Nenhum ciclo cadastrado." : "Nenhum ciclo corresponde à busca ou ao filtro."}</p>}
          </div>
        </section>
        )}
      </div>
    </main>
  );
}

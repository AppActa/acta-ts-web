import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import type { StatusCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { useCiclosDaConta } from "../../../features/ciclo/hooks/useCiclosDaConta";
import { useCriarCiclo } from "../../../features/ciclo/hooks/useCriarCiclo";
import { useUsuariosDaEmpresa } from "../../../features/ciclo/hooks/useUsuariosDaEmpresa";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import voltarMoldura from "../../../../features/ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../../../features/ciclos/assets/voltar-seta.svg";
import iconeCriar from "../../../../features/ciclos/assets/icone-criar.svg";
import gatoPrimeiroCiclo from "../../../../features/ciclos/assets/primeiro-ciclo-gato.png";
import "../../../../features/layout/styles/web-listas.css";
import "../../../../features/ciclos/styles/pagina-todos-ciclos.css";

type FiltroCiclo = "Todos" | "Em execução" | "Concluídos";
type StatusCarregamento = "loading" | "success" | "error";
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

function hojeIsoLocal(): string {
  const hoje = new Date();
  return [hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate()]
    .map((parte, indice) => String(parte).padStart(indice === 0 ? 4 : 2, "0"))
    .join("-");
}

export function PaginaTodosCiclos() {
  const { firebaseUser, actaUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const criandoCiclo = location.pathname === "/ciclos/criar";
  const [tituloCiclo, setTituloCiclo] = useState("");
  const [descricaoCiclo, setDescricaoCiclo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataEstimadaFim, setDataEstimadaFim] = useState("");
  const [mensagemCriacao, setMensagemCriacao] = useState("");
  const [seletorColaboradoresAberto, setSeletorColaboradoresAberto] = useState(false);
  const [buscaColaborador, setBuscaColaborador] = useState("");
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroCiclo>("Todos");
  const resultadoCiclos = useCiclosDaConta();
  const criacao = useCriarCiclo();

  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const accountKey = firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa ? `${firebaseUser.uid}:${idEmpresa}` : null;

  const resultadoUsuarios = useUsuariosDaEmpresa(criandoCiclo && Boolean(actaUser?.permissaoGestor), idEmpresa, accountKey);

  const estadoAtual: StatusCarregamento = resultadoCiclos.estado === "sucesso" ? "success" : resultadoCiclos.estado === "erro" ? "error" : "loading";
  const ciclosDaConta = resultadoCiclos.estado === "sucesso" ? resultadoCiclos.ciclos : [];
  const usuariosDaEmpresa = resultadoUsuarios.estado === "sucesso" ? resultadoUsuarios.usuarios : [];
  const usuariosEncontrados = usuariosDaEmpresa
    .filter((usuario) => usuario.id !== actaUser?.idUsuario)
    .filter((usuario) => usuario.nome.toLocaleLowerCase("pt-BR").includes(buscaColaborador.trim().toLocaleLowerCase("pt-BR")));
  const colaboradoresSelecionados = usuariosDaEmpresa.filter((usuario) => usuariosSelecionados.includes(usuario.id));
  const totalEmExecucao = ciclosDaConta.filter((ciclo) => estaEmExecucao(ciclo.status)).length;
  const totalConcluidos = ciclosDaConta.filter((ciclo) => ciclo.status === "CONCLUIDO").length;

  const filtrados = useMemo(() => ciclosDaConta.filter((ciclo) => {
    const combinaBusca = ciclo.titulo.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
    const combinaStatus = filtro === "Todos"
      || (filtro === "Em execução" && estaEmExecucao(ciclo.status))
      || (filtro === "Concluídos" && ciclo.status === "CONCLUIDO");
    return combinaBusca && combinaStatus;
  }), [ciclosDaConta, busca, filtro]);

  function alternarColaborador(idUsuario: number) {
    setUsuariosSelecionados((selecionados) => selecionados.includes(idUsuario)
      ? selecionados.filter((id) => id !== idUsuario)
      : [...selecionados, idUsuario]);
  }

  async function enviarCriacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const status = await criacao.executar({
        titulo: tituloCiclo.trim(),
        descricao: descricaoCiclo.trim(),
        dataInicio,
        dataEstimadaFim,
      }, colaboradoresSelecionados);
    if (!status) return;
      resultadoCiclos.recarregar();
      setMensagemCriacao(status === "criado-com-falha-na-equipe"
        ? "Ciclo criado, mas não foi possível vincular todos os colaboradores. Confira a equipe do ciclo."
        : "Ciclo criado e equipe adicionada.");
      setUsuariosSelecionados([]);
      setBuscaColaborador("");
      setSeletorColaboradoresAberto(false);
      navigate("/ciclos");
  }

  return (
    <main className="pagina-web-listas pagina-todos-ciclos">
      <Sidebar />
      <div className="web-listas_painel">
          <header className="web-listas_cabecalho">
            <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA"><img src={voltarMoldura} alt="" /><img src={voltarSeta} alt="" /></Link><h1>Todos os ciclos</h1><Link className="lista-ciclos_criar-link" to="/ciclos/criar"><img src={iconeCriar} alt="" />Criar novo</Link></div>
        </header>
        {estadoAtual === "success" && ciclosDaConta.length === 0 ? (
          <section className="lista-ciclos_conteudo lista-ciclos_conteudo--vazio" aria-label="Ciclos do ACTA">
            <div className="lista-ciclos_primeiro-ciclo" role="status">
              <img src={gatoPrimeiroCiclo} alt="" />
              <h2>Seu primeiro ciclo começa aqui</h2>
              <p>Crie um ciclo para organizar problemas, acompanhar ações e compartilhar<br className="lista-ciclos_quebra-descricao" /> aprendizados com a equipe.</p>
              <Link className="lista-ciclos_criar-link lista-ciclos_criar-vazio" to="/ciclos/criar">Criar ciclo</Link>
            </div>
          </section>
        ) : (
        <section className="lista-ciclos_conteudo" aria-label="Ciclos do ACTA">
          {mensagemCriacao && <p className="ciclo-criar_resultado" role="status">{mensagemCriacao}</p>}
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
            {estadoAtual === "loading" && <CarregandoConteudo compacto mensagem="Carregando ciclos" />}
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
      {criandoCiclo && <div className="ciclo-criar_overlay">
        <section className="ciclo-criar_modal" role="dialog" aria-modal="true" aria-labelledby="ciclo-criar-titulo">
          <header className="ciclo-criar_cabecalho">
            <div><p>Novo ciclo PDCA</p><h2 id="ciclo-criar-titulo">Criar ciclo</h2></div>
            <Link to="/ciclos" className="ciclo-criar_fechar" aria-label="Fechar">×</Link>
          </header>
          {criacao.erro && <p className="ciclo-criar_erro" role="alert">{criacao.erro}</p>}
          {!actaUser?.permissaoGestor && <p className="ciclo-criar_aviso">A criação de ciclos está disponível somente para gestores.</p>}
          <form onSubmit={(event) => void enviarCriacao(event)}>
            <label>Título<input required maxLength={160} value={tituloCiclo} onChange={(event) => setTituloCiclo(event.target.value)} placeholder="Ex.: Reduzir perdas no processo" /></label>
            <label>Descrição<textarea required maxLength={1000} rows={4} value={descricaoCiclo} onChange={(event) => setDescricaoCiclo(event.target.value)} placeholder="Descreva o objetivo do ciclo." /></label>
            <div className="ciclo-criar_datas">
              <label>Data de início<input required type="date" min={hojeIsoLocal()} value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} /></label>
              <label>Previsão de término<input required type="date" min={dataInicio || hojeIsoLocal()} value={dataEstimadaFim} onChange={(event) => setDataEstimadaFim(event.target.value)} /></label>
            </div>
            <section
              className="ciclo-criar_colaboradores"
              aria-labelledby="ciclo-criar-colaboradores-titulo"
              onBlur={(event) => {
                const proximoFoco = event.relatedTarget;
                if (!(proximoFoco instanceof Node) || !event.currentTarget.contains(proximoFoco)) {
                  setSeletorColaboradoresAberto(false);
                }
              }}
            >
              <div className="ciclo-criar_colaboradores-cabecalho">
                <div><h3 id="ciclo-criar-colaboradores-titulo">Colaboradores</h3><p>Adicione pessoas da sua empresa ao ciclo.</p></div>
                <span>{colaboradoresSelecionados.length} selecionado(s)</span>
              </div>
              <label htmlFor="ciclo-buscar-colaborador">Pesquisar e adicionar colaboradores</label>
              <input
                id="ciclo-buscar-colaborador"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={seletorColaboradoresAberto}
                aria-controls={seletorColaboradoresAberto ? "ciclo-criar_opcoes-colaboradores" : undefined}
                value={buscaColaborador}
                onFocus={() => setSeletorColaboradoresAberto(true)}
                onChange={(event) => {
                  setBuscaColaborador(event.target.value);
                  setSeletorColaboradoresAberto(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSeletorColaboradoresAberto(false);
                }}
                placeholder="Digite o nome do colaborador"
              />
              {seletorColaboradoresAberto && <div className="ciclo-criar_painel-seletor">
                {resultadoUsuarios.estado === "carregando" ? (
                  <CarregandoConteudo compacto mensagem="Carregando colaboradores" />
                ) : resultadoUsuarios.estado === "erro" ? (
                  <p className="ciclo-criar_usuarios-estado" role="alert">Não foi possível carregar os colaboradores da empresa.</p>
                ) : usuariosEncontrados.length === 0 ? (
                  <p className="ciclo-criar_usuarios-estado" role="status">{buscaColaborador.trim() ? "Nenhum colaborador encontrado com esse nome." : "Não há outros colaboradores ativos para selecionar."}</p>
                ) : (
                  <ul className="ciclo-criar_lista-colaboradores" id="ciclo-criar_opcoes-colaboradores" role="listbox" aria-label="Resultados da busca de colaboradores">
                    {usuariosEncontrados.map((usuario) => {
                      const selecionado = usuariosSelecionados.includes(usuario.id);
                      return <li key={usuario.id}>
                        <button
                          className="ciclo-criar_opcao-colaborador"
                          type="button"
                          role="option"
                          aria-selected={selecionado}
                          onClick={() => {
                            alternarColaborador(usuario.id);
                            setBuscaColaborador("");
                          }}
                        >
                          <span className="ciclo-criar_avatar" aria-hidden="true">{usuario.nome.charAt(0).toLocaleUpperCase("pt-BR")}</span>
                          <span className="ciclo-criar_nome-colaborador">{usuario.nome}</span>
                          <span className="ciclo-criar_estado-selecao">{selecionado ? "Selecionado ✓" : "Adicionar"}</span>
                        </button>
                      </li>;
                    })}
                  </ul>
                )}
              </div>}
              {colaboradoresSelecionados.length > 0 && <div className="ciclo-criar_selecionados" aria-label="Colaboradores selecionados">
                {colaboradoresSelecionados.map((usuario) => <button type="button" key={usuario.id} onClick={() => alternarColaborador(usuario.id)} aria-label={"Remover " + usuario.nome}>
                  {usuario.nome}<span aria-hidden="true"> ×</span>
                </button>)}
              </div>}
            </section>
            <footer className="ciclo-criar_acoes">
              <Link to="/ciclos" className="ciclo-criar_cancelar">Cancelar</Link>
              <button type="submit" disabled={criacao.criando || !actaUser?.permissaoGestor}>{criacao.criando ? "Criando…" : "Criar ciclo"}</button>
            </footer>
          </form>
        </section>
      </div>}
    </main>
  );
}

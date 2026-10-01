import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import voltarMoldura from "../assets/voltar-moldura.svg";
import voltarSeta from "../assets/voltar-seta.svg";
import iconeCriar from "../assets/icone-criar.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-todos-ciclos.css";

const ciclos = [
  { id: 1, nome: "Redução do tempo de atendimento", responsavel: "A definir", prazo: "A definir", progresso: 68, cor: "ciano", estado: "Em andamento" },
  { id: 2, nome: "Organização do estoque", responsavel: "Catarina Cândido", prazo: "30/10/2026", progresso: 82, cor: "verde", estado: "Em andamento" },
  { id: 3, nome: "Onboarding de novos colaboradores", responsavel: "Mariana Costa", prazo: "20/10/2026", progresso: 15, cor: "azul", estado: "Em andamento" },
  { id: 4, nome: "Proteção de dados e acessos", responsavel: "A definir", prazo: "A definir", progresso: 75, cor: "verde", estado: "Em andamento" },
  { id: 5, nome: "Padronização das aprovações internas", responsavel: "A definir", prazo: "A definir", progresso: 100, cor: "turquesa", estado: "Concluído" },
];

export function PaginaTodosCiclos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const filtrados = useMemo(() => ciclos.filter((ciclo) => {
    const combinaBusca = `${ciclo.nome} ${ciclo.responsavel}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
    return combinaBusca && (filtro === "Todos" || ciclo.estado === filtro);
  }), [busca, filtro]);

  return (
    <main className="pagina-web-listas pagina-todos-ciclos">
      <Sidebar />
      <div className="web-listas_painel">
        <header className="web-listas_cabecalho">
          <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA"><img src={voltarMoldura} alt="" /><img src={voltarSeta} alt="" /></Link><h1>Todos os ciclos</h1><button type="button" disabled title="A criação de ciclos ainda aguarda integração com a API"><img src={iconeCriar} alt="" />Criar novo</button></div>
        </header>
        <section className="lista-ciclos_conteudo" aria-label="Ciclos do ACTA">
          <div className="lista-ciclos_filtros">
            <label className="lista-ciclos_busca"><span className="sr-only">Buscar ciclo ou responsável</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar ciclo ou responsável" /></label>
            <div className="lista-ciclos_tabs" role="group" aria-label="Filtrar ciclos">
              {[{ nome: "Todos", total: 5 }, { nome: "Em andamento", total: 4 }, { nome: "Concluído", total: 1 }].map((item) => <button type="button" className={filtro === item.nome ? "ativo" : ""} aria-pressed={filtro === item.nome} key={item.nome} onClick={() => setFiltro(item.nome)}>{item.nome === "Concluído" ? "Concluídos" : item.nome} ({item.total})</button>)}
            </div>
          </div>
          <div className="lista-ciclos_itens">
            {filtrados.map((ciclo) => (
              <article className="lista-ciclos_item" key={ciclo.id}>
                <span className={`lista-ciclos_icone ${ciclo.cor}`} aria-hidden="true" />
                <div className="lista-ciclos_identificacao"><div className="lista-ciclos_titulo_linha"><h2>{ciclo.nome}</h2><span className={`lista-ciclos_estado ${ciclo.estado === "Concluído" ? "concluido" : "andamento"}`}>{ciclo.estado}</span></div><p>Responsável: {ciclo.responsavel} <span>•</span> Prazo: {ciclo.prazo}</p></div>
                <div className="lista-ciclos_progresso"><strong>{ciclo.progresso}% concluído</strong><span role="progressbar" aria-label={`Progresso de ${ciclo.nome}`} aria-valuenow={ciclo.progresso} aria-valuemin={0} aria-valuemax={100}><i className={ciclo.cor} style={{ width: `${ciclo.progresso}%` }} /></span></div>
                <Link className={`lista-ciclos_abrir ${ciclo.cor}`} to={`/do/ciclo/${ciclo.id}`}>Abrir ciclo</Link>
                <button className="lista-ciclos_mais" type="button" aria-label={`Mais ações para ${ciclo.nome}`} disabled title="Mais ações ainda não estão disponíveis">⋮</button>
              </article>
            ))}
            {filtrados.length === 0 && <p className="lista-ciclos_vazio">Nenhum ciclo corresponde à busca.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-todos-ciclos.css";

const ciclos = [
  { id: 1, nome: "Redução do tempo de atendimento", responsavel: "A definir", prazo: "A definir", progresso: 68, cor: "ciano", estado: "Em andamento" },
  { id: 2, nome: "Organização do estoque", responsavel: "Catarina Cândido", prazo: "30/10/2026", progresso: 82, cor: "verde", estado: "Em andamento" },
  { id: 3, nome: "Onboarding de novos colaboradores", responsavel: "Mariana Costa", prazo: "20/10/2026", progresso: 15, cor: "azul", estado: "Em andamento" },
  { id: 4, nome: "Proteção de dados e acessos", responsavel: "A definir", prazo: "A definir", progresso: 75, cor: "verde", estado: "Em andamento" },
  { id: 5, nome: "Padronização das aprovações internas", responsavel: "A definir", prazo: "A definir", progresso: 100, cor: "turquesa", estado: "Concluído" },
];

function IconeTopo({ tipo }: { tipo: "notificacoes" | "relatorios" | "ciclos" | "cato" }) {
  if (tipo === "notificacoes") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M18 5a8 8 0 0 0-8 8v6c0 2-1 4-3 6h22c-2-2-3-4-3-6v-6a8 8 0 0 0-8-8Zm-3 24a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
  if (tipo === "relatorios") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M8 3h15l6 6v24H8V3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><path d="M23 3v7h6M13 26v-7m5 7V14m5 12v-9" stroke="currentColor" strokeWidth="2.5" /></svg>;
  if (tipo === "ciclos") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M29 13a12 12 0 0 0-21-4L5 12m2-7v7h7M7 23a12 12 0 0 0 21 4l3-3m-2 7v-7h-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <span className="lista-ciclos_topo-placeholder" />;
}

export function PaginaTodosCiclos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const filtrados = useMemo(() => ciclos.filter((ciclo) => {
    const combinaBusca = `${ciclo.nome} ${ciclo.responsavel}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
    return combinaBusca && (filtro === "Todos" || ciclo.estado === filtro);
  }), [busca, filtro]);

  return (
    <main className="pagina-web-listas pagina-todos-ciclos">
      <BarraLateral />
      <div className="web-listas_painel">
        <header className="web-listas_cabecalho">
          <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA">◀</Link><h1>Todos os ciclos</h1><button type="button" disabled title="A criação de ciclos ainda aguarda integração com a API">＋ Criar novo</button></div>
          <nav className="web-listas_topo" aria-label="Atalhos"><span><IconeTopo tipo="notificacoes" />Notificações</span><Link to="/relatorios"><IconeTopo tipo="relatorios" />Relatórios</Link><span><IconeTopo tipo="ciclos" />Ciclos</span><span><IconeTopo tipo="cato" />Cato</span></nav>
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
                <div className="lista-ciclos_identificacao"><h2>{ciclo.nome}</h2><p>Responsável: {ciclo.responsavel} <span>•</span> Prazo: {ciclo.prazo}</p></div>
                <span className={`lista-ciclos_estado ${ciclo.estado === "Concluído" ? "concluido" : "andamento"}`}>{ciclo.estado}</span>
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

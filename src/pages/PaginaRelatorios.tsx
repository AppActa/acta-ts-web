import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-todos-ciclos.css";
import "./pagina-relatorios.css";

const relatorios = [
  { tipo: "PDF", ciclo: "Organização do estoque", responsavel: "Catarina Cândido", atualizado: "29/09/2026" },
  { tipo: "PPTX", ciclo: "Onboarding de novos colaboradores", responsavel: "Mariana Costa", atualizado: "28/09/2026" },
  { tipo: "PDF", ciclo: "Proteção de dados e acessos", responsavel: "A definir", atualizado: "25/09/2026" },
  { tipo: "PDF", ciclo: "Redução do tempo de atendimento", responsavel: "A definir", atualizado: "22/09/2026" },
];

function IconeTopo({ tipo }: { tipo: "notificacoes" | "relatorios" | "ciclos" | "cato" }) {
  if (tipo === "notificacoes") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M18 5a8 8 0 0 0-8 8v6c0 2-1 4-3 6h22c-2-2-3-4-3-6v-6a8 8 0 0 0-8-8Zm-3 24a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
  if (tipo === "relatorios") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M8 3h15l6 6v24H8V3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><path d="M23 3v7h6M13 26v-7m5 7V14m5 12v-9" stroke="currentColor" strokeWidth="2.5" /></svg>;
  if (tipo === "ciclos") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M29 13a12 12 0 0 0-21-4L5 12m2-7v7h7M7 23a12 12 0 0 0 21 4l3-3m-2 7v-7h-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <span className="lista-ciclos_topo-placeholder" />;
}

export function PaginaRelatorios() {
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("Todos os períodos");
  const [tipo, setTipo] = useState("PDF e PPTX");
  const [avisoDownload, setAvisoDownload] = useState("");
  const filtrados = useMemo(() => relatorios.filter((relatorio) => {
    const correspondeBusca = `${relatorio.ciclo} ${relatorio.responsavel}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
    const correspondeTipo = tipo === "PDF e PPTX" || relatorio.tipo === tipo;
    return correspondeBusca && correspondeTipo;
  }), [busca, tipo]);

  return (
    <main className="pagina-web-listas pagina-relatorios">
      <BarraLateral />
      <div className="web-listas_painel">
        <header className="web-listas_cabecalho">
          <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA">◀</Link><h1>Relatórios</h1></div>
          <nav className="web-listas_topo" aria-label="Atalhos"><span><IconeTopo tipo="notificacoes" />Notificações</span><span className="selecionado"><IconeTopo tipo="relatorios" />Relatórios</span><Link to="/ciclos"><IconeTopo tipo="ciclos" />Ciclos</Link><span><IconeTopo tipo="cato" />Cato</span></nav>
        </header>
        <section className="relatorios_conteudo" aria-label="Relatórios dos ciclos">
          <div className="relatorios_metricas">
            <article><span>Relatórios disponíveis</span><strong className="azul">12</strong><p>PDF e PowerPoint</p></article>
            <article><span>Ciclos concluídos</span><strong className="verde">04</strong><p>No período selecionado</p></article>
            <article><span>Atualizados nesta semana</span><strong className="ciano">03</strong><p>Novos resultados</p></article>
          </div>

          <form className="relatorios_filtros" onSubmit={(event) => event.preventDefault()}>
            <label><span className="sr-only">Buscar ciclo ou responsável</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar ciclo ou responsável" /></label>
            <label className="sr-only" htmlFor="relatorios-periodo">Período</label>
            <select id="relatorios-periodo" value={periodo} onChange={(event) => setPeriodo(event.target.value)}><option>Todos os períodos</option><option>Esta semana</option><option>Este mês</option></select>
            <label className="sr-only" htmlFor="relatorios-tipo">Formato</label>
            <select id="relatorios-tipo" value={tipo} onChange={(event) => setTipo(event.target.value)}><option>PDF e PPTX</option><option>PDF</option><option>PPTX</option></select>
            <button type="submit">Filtrar</button>
          </form>

          <section className="relatorios_lista" aria-labelledby="relatorios-lista-titulo">
            <h2 id="relatorios-lista-titulo">Relatórios gerados</h2>
            <p className="relatorios_lista_descricao">Arquivos consolidados dos ciclos.</p>
            <div className="relatorios_lista_itens">
              {filtrados.map((relatorio) => <article className="relatorios_item" key={relatorio.ciclo}>
                <span className={`relatorios_tipo ${relatorio.tipo.toLowerCase()}`}>{relatorio.tipo}</span>
                <div className="relatorios_item_info"><h3>{relatorio.ciclo}</h3><p>Responsável: {relatorio.responsavel} <span>•</span> Atualizado em {relatorio.atualizado}</p></div>
                <span className="relatorios_disponivel">Disponível</span>
                <button type="button" onClick={() => setAvisoDownload(`O arquivo de ${relatorio.ciclo} poderá ser baixado quando a API de relatórios estiver conectada.`)}>Baixar</button>
              </article>)}
              {filtrados.length === 0 && <p className="relatorios_vazio">Nenhum relatório corresponde aos filtros.</p>}
            </div>
            {avisoDownload && <p className="relatorios_aviso" role="status">{avisoDownload}</p>}
          </section>
        </section>
      </div>
    </main>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../features/layout/components/Sidebar";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-todos-ciclos.css";
import "./pagina-relatorios.css";

const relatorios = [
  { tipo: "PDF", ciclo: "Organização do estoque", responsavel: "Catarina Cândido", atualizado: "29/09/2026" },
  { tipo: "PPTX", ciclo: "Onboarding de novos colaboradores", responsavel: "Mariana Costa", atualizado: "28/09/2026" },
  { tipo: "PDF", ciclo: "Proteção de dados e acessos", responsavel: "A definir", atualizado: "25/09/2026" },
  { tipo: "PDF", ciclo: "Redução do tempo de atendimento", responsavel: "A definir", atualizado: "22/09/2026" },
];

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
      <Sidebar />
      <div className="web-listas_painel">
        <header className="web-listas_cabecalho">
          <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA">◀</Link><h1>Relatórios</h1></div>
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

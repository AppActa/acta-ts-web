import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import voltarMoldura from "../assets/voltar-moldura.svg";
import voltarSeta from "../assets/voltar-seta.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-relatorios.css";

const relatorios = [
  { tipo: "PDF", ciclo: "Organização do estoque", responsavel: "Catarina Cândido", atualizado: "29/09/2026" },
  { tipo: "PPTX", ciclo: "Onboarding de novos colaboradores", responsavel: "Mariana Costa", atualizado: "28/09/2026" },
  { tipo: "PDF", ciclo: "Proteção de dados e acessos", responsavel: "A definir", atualizado: "25/09/2026" },
  { tipo: "PDF", ciclo: "Redução do tempo de atendimento", responsavel: "A definir", atualizado: "22/09/2026" },
];

export function PaginaRelatorios() {
  const [busca, setBusca] = useState("");
  const [avisoDownload, setAvisoDownload] = useState("");
  const filtrados = useMemo(() => relatorios.filter((relatorio) => {
    return `${relatorio.ciclo} ${relatorio.responsavel}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
  }), [busca]);

  return (
    <main className="pagina-web-listas pagina-relatorios">
      <Sidebar />
      <div className="web-listas_painel">
        <header className="web-listas_cabecalho">
          <div className="web-listas_titulo"><Link to="/do" aria-label="Voltar ao ACTA"><img src={voltarMoldura} alt="" /><img src={voltarSeta} alt="" /></Link><h1>Relatórios</h1></div>
        </header>
        <section className="relatorios_conteudo" aria-label="Relatórios dos ciclos">
          <div className="relatorios_metricas">
            <article><span>Relatórios disponíveis</span><strong className="azul">12</strong><p>PDF e PowerPoint</p></article>
            <article><span>Ciclos concluídos</span><strong className="verde">04</strong><p>No período selecionado</p></article>
            <article><span>Atualizados nesta semana</span><strong className="ciano">03</strong><p>Novos resultados</p></article>
          </div>

          <form className="relatorios_filtros" onSubmit={(event) => event.preventDefault()}>
            <label><span className="sr-only">Buscar ciclo ou responsável</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar ciclo ou responsável" /></label>
            <span className="relatorios_filtro_etiqueta relatorios_filtro_periodo">Todos os períodos</span>
            <span className="relatorios_filtro_etiqueta relatorios_filtro_formato">PDF e PPTX</span>
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

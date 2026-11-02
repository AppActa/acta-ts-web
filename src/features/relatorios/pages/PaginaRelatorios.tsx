import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import "../../layout/styles/web-listas.css";
import "../styles/pagina-relatorios.css";

export function PaginaRelatorios() {
  const { pathname } = useLocation();
  const criando = pathname === "/relatorios/criar";
  const detalhe = pathname !== "/relatorios" && !criando;
  const [busca, setBusca] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [validado, setValidado] = useState(false);
  const [aviso, setAviso] = useState(false);
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setValidado(true);
    if (titulo.trim() && tipo) setAviso(true);
  }
  return <main className="pagina-web-listas pagina-relatorios">
    <Sidebar />
    <div className="web-listas_painel relatorios_painel">
      <section className="relatorios_conteudo">
        {detalhe ? <>
          <h1>Relatório indisponível</h1>
          <p>A consulta de relatórios ainda não está disponível.</p>
          <Link className="relatorios_botao relatorios_secundario" to="/relatorios">Voltar à lista</Link>
        </> : <>
          <h1>Todos os relatórios</h1>
          <p className="relatorios_subtitulo">Consulte os relatórios dos ciclos e acompanhe os resultados da equipe.</p>
          <div className="relatorios_barra">
            <label className="relatorios_busca"><span className="sr-only">Buscar por título, ciclo ou responsável</span><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título, ciclo ou responsável" /></label>
            <Link className="relatorios_botao" to="/relatorios/criar">Criar relatório</Link>
          </div>
          <div className="relatorios_estado" role="status"><h2>Relatórios indisponíveis</h2><p>A consulta de relatórios ainda não está disponível.</p></div>
        </>}
      </section>
    </div>
    {criando && <div className="relatorios_overlay">
      <section className="relatorios_formulario" role="dialog" aria-modal="true" aria-labelledby="relatorio-criar-titulo">
        <aside className="relatorios_banner"><div><p>Acta, seu app de PDCA</p><strong>O ciclo da melhoria<br />começa aqui!</strong></div></aside>
        <div className="relatorios_formulario_conteudo">
          <header><h2 id="relatorio-criar-titulo">Criar relatório</h2><Link className="relatorios_fechar" to="/relatorios" aria-label="Fechar">×</Link></header>
          {validado && (!titulo.trim() || !tipo) && <p className="relatorios_erro" role="alert">Revise os campos obrigatórios para continuar.</p>}
          <form noValidate onSubmit={enviar}>
            <label>Título do relatório<input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Desempenho dos ciclos" aria-invalid={validado && !titulo.trim()} />{validado && !titulo.trim() && <span className="relatorios_erro">Informe o título do relatório.</span>}</label>
            <label>Tipo<select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-invalid={validado && !tipo}><option value="">Selecione o tipo de relatório</option><option value="desempenho">Desempenho dos ciclos</option><option value="execucao">Execução das tarefas</option><option value="verificacoes">Resultados das verificações</option><option value="aprendizados">Aprendizados e padronização</option><option value="treinamentos">Participação em treinamentos</option></select>{validado && !tipo && <span className="relatorios_erro">Informe o tipo de relatório.</span>}</label>
            <label>Período<input placeholder="Selecione o período" disabled /></label>
            <label>Ciclos incluídos<select disabled><option>Seleção de ciclos indisponível</option></select></label>
            <label>Resumo<textarea placeholder="Descreva o objetivo do relatório" rows={2} /></label>
            <p className="relatorios_aviso">A criação de relatórios ainda não está disponível.</p>
            <div className="relatorios_acoes"><Link className="relatorios_botao relatorios_secundario" to="/relatorios">Cancelar</Link><button className="relatorios_botao" type="submit">Criar relatório</button></div>
          </form>
        </div>
      </section>
      {aviso && <div className="relatorios_overlay relatorios_overlay_aviso"><section className="relatorios_aviso_modal" role="alertdialog" aria-modal="true" aria-labelledby="relatorio-aviso-titulo"><h2 id="relatorio-aviso-titulo">Não foi possível criar o relatório</h2><p>A criação de relatórios ainda não está disponível.</p><button className="relatorios_botao" type="button" onClick={() => setAviso(false)}>Voltar ao formulário</button></section></div>}
    </div>}
  </main>;
}

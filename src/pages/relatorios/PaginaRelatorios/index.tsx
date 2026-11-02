import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "../../../components/layout/Sidebar";
import { useDialogFocus } from "../../../utils/useDialogFocus";
import "../../../../features/layout/styles/web-listas.css";
import "../../../../features/relatorios/styles/pagina-relatorios.css";

export function PaginaRelatorios() {
  const { pathname } = useLocation();
  const criando = pathname === "/relatorios/criar";
  const detalhe = pathname !== "/relatorios" && !criando;
  const [busca, setBusca] = useState("");
  const [formulario, setFormulario] = useState({ titulo: "", tipo: "" });
  const [validado, setValidado] = useState(false);
  const [aviso, setAviso] = useState(false);
  const dialogoCriacao = useDialogFocus<HTMLElement>();
  const dialogoAviso = useDialogFocus<HTMLElement>({ onEscape: () => setAviso(false) });
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setValidado(true);
    if (formulario.titulo.trim() && formulario.tipo) setAviso(true);
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
            <label htmlFor="dad-pages-relatorios-paginarelatorios-index-33-13" className="relatorios_busca"><span className="sr-only">Buscar por título, ciclo ou responsável</span><input id="dad-pages-relatorios-paginarelatorios-index-33-13" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título, ciclo ou responsável" /></label>
            <Link className="relatorios_botao" to="/relatorios/criar">Criar relatório</Link>
          </div>
          <div className="relatorios_estado" role="status"><h2>Relatórios indisponíveis</h2><p>A consulta de relatórios ainda não está disponível.</p></div>
        </>}
      </section>
    </div>
    {criando && <div className="relatorios_overlay">
      <section ref={dialogoCriacao.dialogRef} onKeyDown={dialogoCriacao.onKeyDown} className="relatorios_formulario" role="dialog" aria-modal="true" aria-labelledby="relatorio-criar-titulo">
        <aside className="relatorios_banner"><div><p>Acta, seu app de PDCA</p><strong>O ciclo da melhoria<br />começa aqui!</strong></div></aside>
        <div className="relatorios_formulario_conteudo">
          <header><h2 id="relatorio-criar-titulo">Criar relatório</h2><Link className="relatorios_fechar" to="/relatorios" aria-label="Fechar">×</Link></header>
          {validado && (!formulario.titulo.trim() || !formulario.tipo) && <p className="relatorios_erro" role="alert">Revise os campos obrigatórios para continuar.</p>}
          <form noValidate onSubmit={enviar}>
            <label htmlFor="dad-pages-relatorios-paginarelatorios-index-47-13">Título do relatório<input id="dad-pages-relatorios-paginarelatorios-index-47-13" value={formulario.titulo} onChange={(e) => setFormulario((atual) => ({ ...atual, titulo: e.target.value }))} placeholder="Ex.: Desempenho dos ciclos" aria-invalid={validado && !formulario.titulo.trim()} />{validado && !formulario.titulo.trim() && <span className="relatorios_erro">Informe o título do relatório.</span>}</label>
            <label htmlFor="dad-pages-relatorios-paginarelatorios-index-48-13">Tipo<select id="dad-pages-relatorios-paginarelatorios-index-48-13" value={formulario.tipo} onChange={(e) => setFormulario((atual) => ({ ...atual, tipo: e.target.value }))} aria-invalid={validado && !formulario.tipo}><option value="">Selecione o tipo de relatório</option><option value="desempenho">Desempenho dos ciclos</option><option value="execucao">Execução das tarefas</option><option value="verificacoes">Resultados das verificações</option><option value="aprendizados">Aprendizados e padronização</option><option value="treinamentos">Participação em treinamentos</option></select>{validado && !formulario.tipo && <span className="relatorios_erro">Informe o tipo de relatório.</span>}</label>
            <label htmlFor="dad-pages-relatorios-paginarelatorios-index-49-13">Período<input id="dad-pages-relatorios-paginarelatorios-index-49-13" placeholder="Selecione o período" disabled /></label>
            <label htmlFor="dad-pages-relatorios-paginarelatorios-index-50-13">Ciclos incluídos<select id="dad-pages-relatorios-paginarelatorios-index-50-13" disabled><option>Seleção de ciclos indisponível</option></select></label>
            <label htmlFor="dad-pages-relatorios-paginarelatorios-index-51-13">Resumo<textarea id="dad-pages-relatorios-paginarelatorios-index-51-13" placeholder="Descreva o objetivo do relatório" rows={2} /></label>
            <p className="relatorios_aviso">A criação de relatórios ainda não está disponível.</p>
            <div className="relatorios_acoes"><Link className="relatorios_botao relatorios_secundario" to="/relatorios">Cancelar</Link><button className="relatorios_botao" type="submit">Criar relatório</button></div>
          </form>
        </div>
      </section>
      {aviso && <div className="relatorios_overlay relatorios_overlay_aviso"><section ref={dialogoAviso.dialogRef} onKeyDown={dialogoAviso.onKeyDown} className="relatorios_aviso_modal" role="alertdialog" aria-modal="true" aria-labelledby="relatorio-aviso-titulo"><h2 id="relatorio-aviso-titulo">Não foi possível criar o relatório</h2><p>A criação de relatórios ainda não está disponível.</p><button className="relatorios_botao" type="button" onClick={() => setAviso(false)}>Voltar ao formulário</button></section></div>}
    </div>}
  </main>;
}

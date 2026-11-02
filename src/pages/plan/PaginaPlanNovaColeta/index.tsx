import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import "../../../../features/plan/styles/pagina-plan-criar-problema.css";
import "../../../../features/plan/styles/pagina-plan-editar-problema.css";

export function PaginaPlanNovaColeta() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando ciclo..." /> : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  const voltar = `/do/ciclo/${ciclo.ciclo.id}/plan/coleta`;
  return <main className="plan-criar-problema"><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="nova-coleta-titulo">
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="nova-coleta-titulo">Criar coleta de dados</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={(evento) => evento.preventDefault()}>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-15-9">Nome da coleta *<input id="dad-pages-plan-paginaplannovacoleta-index-15-9" name="nome" required placeholder="Preencha este campo" /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-16-9">Fonte *<input id="dad-pages-plan-paginaplannovacoleta-index-16-9" name="fonte" required placeholder="Preencha este campo" /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-17-9">Período inicial *<input id="dad-pages-plan-paginaplannovacoleta-index-17-9" name="inicio" type="date" required /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-18-9">Período final *<input id="dad-pages-plan-paginaplannovacoleta-index-18-9" name="fim" type="date" required /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-19-9">Valor de referência *<input id="dad-pages-plan-paginaplannovacoleta-index-19-9" name="referencia" type="number" step="any" required placeholder="Preencha este campo" /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-20-9">Unidade<input id="dad-pages-plan-paginaplannovacoleta-index-20-9" name="unidade" placeholder="Preencha este campo" /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-21-9">Registros analisados<input id="dad-pages-plan-paginaplannovacoleta-index-21-9" name="registros" type="number" min="0" placeholder="Preencha este campo" /></label>
        <label htmlFor="dad-pages-plan-paginaplannovacoleta-index-22-9">Anexo<input id="dad-pages-plan-paginaplannovacoleta-index-22-9" name="anexo" type="file" /></label>
        <p className="plan-editar-problema_aviso" role="status">O cadastro de coletas ainda está indisponível.</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar}>Cancelar</Link><button type="submit" disabled>Criar coleta de dados</button></div>
      </form>
    </div>
  </section></main>;
}

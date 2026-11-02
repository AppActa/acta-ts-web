import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

export function PaginaPlanNovaColeta() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  const voltar = `/do/ciclo/${ciclo.ciclo.id}/plan/coleta`;
  return <main className="plan-criar-problema"><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="nova-coleta-titulo">
    <aside className="plan-criar-problema_banner" aria-label="ACTA"><div className="plan-criar-problema_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div></aside>
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="nova-coleta-titulo">Criar coleta de dados</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={(evento) => evento.preventDefault()}>
        <label>Nome da coleta *<input name="nome" required placeholder="Preencha este campo" /></label>
        <label>Fonte *<input name="fonte" required placeholder="Preencha este campo" /></label>
        <label>Período inicial *<input name="inicio" type="date" required /></label>
        <label>Período final *<input name="fim" type="date" required /></label>
        <label>Valor de referência *<input name="referencia" type="number" step="any" required placeholder="Preencha este campo" /></label>
        <label>Unidade<input name="unidade" placeholder="Preencha este campo" /></label>
        <label>Registros analisados<input name="registros" type="number" min="0" placeholder="Preencha este campo" /></label>
        <label>Anexo<input name="anexo" type="file" /></label>
        <p className="plan-editar-problema_aviso" role="status">O cadastro de coletas ainda está indisponível.</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar}>Cancelar</Link><button type="submit" disabled>Criar coleta de dados</button></div>
      </form>
    </div>
  </section></main>;
}

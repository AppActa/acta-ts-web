import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

export function PaginaPlanCriarPlano() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  const voltar = `/do/ciclo/${ciclo.ciclo.id}/plan/planos`;
  return <main className="plan-criar-problema"><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="criar-plano-titulo">
    <aside className="plan-criar-problema_banner" aria-label="ACTA"><div className="plan-criar-problema_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div></aside>
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="criar-plano-titulo">Criar plano de ação</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={(evento) => evento.preventDefault()}>
        <label>O quê? *<input name="oQue" required placeholder="Preencha este campo" /></label>
        <label>Por quê? *<input name="porQue" required placeholder="Preencha este campo" /></label>
        <label>Onde? *<input name="onde" required placeholder="Preencha este campo" /></label>
        <label>Como? *<input name="como" required placeholder="Preencha este campo" /></label>
        <label>Quando? · início<input name="inicio" type="date" /></label>
        <label>Quando? · término *<input name="termino" type="date" required /></label>
        <label>Quem? *<input name="responsavel" required placeholder="Preencha este campo" /></label>
        <label>Quanto custa? *<input name="custo" type="number" min="0" step="0.01" required placeholder="Preencha este campo" /></label>
        <p className="plan-editar-problema_aviso" role="status">O cadastro de planos de ação ainda está indisponível.</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar}>Cancelar</Link><button type="submit" disabled>Criar plano de ação</button></div>
      </form>
    </div>
  </section></main>;
}

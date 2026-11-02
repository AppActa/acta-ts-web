import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

export function PaginaPlanCriarCausa() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  const voltar = `/do/ciclo/${ciclo.ciclo.id}/plan/causas`;
  return <main className="plan-criar-problema"><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="criar-causa-titulo">
    <aside className="plan-criar-problema_banner" aria-label="ACTA"><div className="plan-criar-problema_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div></aside>
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="criar-causa-titulo">Criar causa</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={(evento) => evento.preventDefault()}>
        <label>Categoria 6M *<select name="categoria" required defaultValue=""><option value="" disabled>Selecione uma categoria</option><option value="METODO">Método</option><option value="MAO_DE_OBRA">Mão de obra</option><option value="MAQUINA">Máquina</option><option value="MATERIAL">Material</option><option value="MEDICAO">Medição</option><option value="MEIO_AMBIENTE">Meio ambiente</option></select></label>
        <label>Descrição *<input name="descricao" required placeholder="Preencha este campo" /></label>
        <p className="plan-editar-problema_aviso" role="status">O cadastro de causas ainda está indisponível.</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar}>Cancelar</Link><button type="submit" disabled>Criar causa</button></div>
      </form>
    </div>
  </section></main>;
}

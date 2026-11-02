import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import "../../../../features/plan/styles/pagina-plan-criar-problema.css";
import "../../../../features/plan/styles/pagina-plan-editar-problema.css";

export function PaginaPlanCriarCausa() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando ciclo..." /> : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  const voltar = `/do/ciclo/${ciclo.ciclo.id}/plan/causas`;
  return <main className="plan-criar-problema"><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="criar-causa-titulo">
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="criar-causa-titulo">Criar causa</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={(evento) => evento.preventDefault()}>
        <label htmlFor="dad-pages-plan-paginaplancriarcausa-index-15-9">Categoria 6M *<select id="dad-pages-plan-paginaplancriarcausa-index-15-9" name="categoria" required defaultValue=""><option value="" disabled>Selecione uma categoria</option><option value="METODO">Método</option><option value="MAO_DE_OBRA">Mão de obra</option><option value="MAQUINA">Máquina</option><option value="MATERIAL">Material</option><option value="MEDICAO">Medição</option><option value="MEIO_AMBIENTE">Meio ambiente</option></select></label>
        <label htmlFor="dad-pages-plan-paginaplancriarcausa-index-16-9">Descrição *<input id="dad-pages-plan-paginaplancriarcausa-index-16-9" name="descricao" required placeholder="Preencha este campo" /></label>
        <p className="plan-editar-problema_aviso" role="status">O cadastro de causas ainda está indisponível.</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar}>Cancelar</Link><button type="submit" disabled>Criar causa</button></div>
      </form>
    </div>
  </section></main>;
}

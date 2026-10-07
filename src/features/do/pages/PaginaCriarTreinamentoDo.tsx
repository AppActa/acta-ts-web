import { Link, useParams } from "react-router-dom";
import "../styles/pagina-criar-treinamento-do.css";

export function PaginaCriarTreinamentoDo() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-criar-treinamento-do">
      <section className="criar-treinamento_modal" aria-labelledby="criar-treinamento_titulo">
        <div className="criar-treinamento_mensagem">
          <div><span>ACTA, seu app de PDCA</span><strong>O ciclo da melhoria<br />começa aqui!</strong></div>
        </div>
        <form className="criar-treinamento_formulario" onSubmit={(event) => event.preventDefault()}>
          <Link className="criar-treinamento_fechar" to={`/do/ciclo/${cicloId}/treinamentos`} aria-label="Fechar">×</Link>
          <h1 id="criar-treinamento_titulo">Criar treinamento</h1>
          <label className="criar-treinamento_campo criar-treinamento_campo-titulo">Título<input type="text" name="titulo" /></label>
          <label className="criar-treinamento_campo criar-treinamento_campo-descricao">Descrição<textarea name="descricao" /></label>
          <div className="criar-treinamento_dupla">
            <label className="criar-treinamento_campo">Responsável<input type="text" name="responsavel" /></label>
            <label className="criar-treinamento_campo">Data de início<input type="date" name="dataInicio" /></label>
          </div>
          <div className="criar-treinamento_obrigatorio"><span>Obrigatório</span><small>Tarefas relacionadas liberadas após conclusão.</small></div>
          <div className="criar-treinamento_colaboradores">
            <label className="criar-treinamento_campo">Colaboradores<input type="number" value={0} readOnly /></label>
            <button type="button" disabled>☷ Ver todos</button><button type="button" disabled>＋ Adicionar novo</button>
          </div>
          <div className="criar-treinamento_material">
            <label>Material PDF</label><div><button type="button" disabled>↥ Anexar</button><input aria-label="Arquivo PDF anexado" type="text" readOnly /></div>
          </div>
          <button className="criar-treinamento_concluido" type="submit" disabled>Concluído</button>
        </form>
      </section>
    </main>
  );
}
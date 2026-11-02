import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";
import "../styles/pagina-criar-treinamento-do.css";

export function PaginaCriarTreinamentoDo() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [validado, setValidado] = useState(false);
  const [aviso, setAviso] = useState(false);
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setValidado(true);
    if (titulo.trim() && descricao.trim()) setAviso(true);
  }

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-criar-treinamento-do">
        <section className="criar-treinamento_modal" role={carregando ? "status" : "alert"} aria-live="polite">
          <h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
          {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="pagina-criar-treinamento-do">
      <section className="criar-treinamento_modal" aria-labelledby="criar-treinamento_titulo">
        <div className="criar-treinamento_mensagem">
          <div><span>ACTA, seu app de PDCA</span><strong>O ciclo da melhoria contínua<br />começa aqui!</strong></div>
        </div>
        <form className="criar-treinamento_formulario" noValidate onSubmit={enviar}>
          <AvisoDadosDemonstrativos mensagem="Este formulário é demonstrativo; nenhuma informação será enviada ou salva." />
          <Link className="criar-treinamento_fechar" to={`/do/ciclo/${cicloId}/treinamentos`} aria-label="Fechar">×</Link>
          <h1 id="criar-treinamento_titulo">Criar treinamento</h1>
          <label className="criar-treinamento_campo criar-treinamento_campo-titulo">Título<input type="text" name="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} aria-invalid={validado && !titulo.trim()} />{validado && !titulo.trim() && <span className="treinamento_validacao">Informe o título.</span>}</label>
          <label className="criar-treinamento_campo criar-treinamento_campo-descricao">Descrição<textarea name="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} aria-invalid={validado && !descricao.trim()} />{validado && !descricao.trim() && <span className="treinamento_validacao">Informe a descrição.</span>}</label>
          <div className="criar-treinamento_dupla">
            <label className="criar-treinamento_campo">Responsável<input type="text" name="responsavel" /></label>
            <label className="criar-treinamento_campo">Data de início<input type="date" name="dataInicio" /></label>
          </div>
          <div className="criar-treinamento_obrigatorio"><span>Obrigatório</span><small>Tarefas relacionadas liberadas após conclusão.</small></div>
          <div className="criar-treinamento_colaboradores">
            <label className="criar-treinamento_campo">Colaboradores<input type="number" value={0} readOnly /></label>
            <button type="button" disabled>{/* # colocar imagem */} Ver todos</button><button type="button" disabled>{/* # colocar imagem */} Adicionar novo</button>
          </div>
          <div className="criar-treinamento_material">
            <label>Material PDF</label><div><button type="button" disabled>{/* # colocar imagem */} Anexar</button><input aria-label="Arquivo PDF anexado" type="text" readOnly /></div>
          </div>
          <button className="criar-treinamento_concluido" type="submit">Concluído</button>
        </form>
      </section>
      {aviso && <div className="treinamento_aviso_fundo"><section className="treinamento_aviso_modal" role="alertdialog" aria-modal="true" aria-labelledby="treinamento-aviso-titulo"><h2 id="treinamento-aviso-titulo">Não foi possível criar o treinamento</h2><p>A criação de treinamentos ainda não está disponível.</p><button type="button" onClick={() => setAviso(false)}>Voltar ao formulário</button></section></div>}
    </main>
  );
}

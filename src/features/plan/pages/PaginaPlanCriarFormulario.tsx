import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";
import "../styles/pagina-plan-criar-formulario.css";

export function PaginaPlanCriarFormulario() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const [individuo, setIndividuo] = useState("");
  const [campos, setCampos] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState("");

  function concluir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("Prévia demonstrativa concluída; nenhuma informação foi enviada ou salva.");
  }

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return <main className="plan-criar-formulario" role={carregando ? "status" : "alert"} aria-live="polite"><h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>{!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}</main>;
  }

  return (
    <main className="plan-criar-formulario">
      <section className="plan-criar-formulario_modal" aria-labelledby="plan-criar-formulario-titulo">
        <aside className="plan-criar-formulario_banner">
          <div className="plan-criar-formulario_mensagem"><p>ACTA, seu app de PDCA</p><h1>O ciclo da melhoria contínua<br />começa aqui!</h1></div>
        </aside>

        <Link className="plan-criar-formulario_fechar" to={`/do/ciclo/${cicloId}/plan/coleta`} aria-label="Fechar criação de formulário">{/* # colocar imagem */}</Link>
        <form className="plan-criar-formulario_conteudo" onSubmit={concluir}>
          <AvisoDadosDemonstrativos mensagem="Esta prévia de formulário é demonstrativa; as informações não são enviadas nem salvas." />
          <h2 id="plan-criar-formulario-titulo">Criar formulário</h2>
          <div className="plan-criar-formulario_campos">
            <label>
              <span>Sintoma - obrigatório</span>
              <input name="sintoma" required />
            </label>
            <label>
              <span>Indivíduo - opcional</span>
              <input name="individuo" value={individuo} onChange={(event) => setIndividuo(event.target.value)} />
            </label>
          </div>
          {campos.map((campo, index) => (
            <label className="plan-criar-formulario_campo-extra" key={index}>
              <span>Campo adicional</span>
              <input value={campo} onChange={(event) => setCampos((atuais) => atuais.map((valor, i) => i === index ? event.target.value : valor))} />
            </label>
          ))}
          <div className="plan-criar-formulario_automacoes"><span>Data e hora · preenchimento automático</span><span>Localização (GPS) · automática</span><span>Condições do tempo · automáticas</span></div>
          <button className="plan-criar-formulario_adicionar" type="button" onClick={() => setCampos((atuais) => [...atuais, ""])}><span aria-hidden="true">{/* # colocar imagem */}</span>Adicionar campo</button>
          <button className="plan-criar-formulario_concluir" type="submit">Concluído</button>
          {mensagem && <p className="plan-criar-formulario_status" role="status">{mensagem}</p>}
        </form>
      </section>
    </main>
  );
}

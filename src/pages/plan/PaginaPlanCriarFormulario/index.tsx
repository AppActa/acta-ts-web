import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../../components/layout/AvisoDadosDemonstrativos";
import "../../../../features/plan/styles/pagina-plan-criar-formulario.css";

export function PaginaPlanCriarFormulario() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const [formulario, setFormulario] = useState<{ individuo: string; campos: Array<{ id: string; valor: string }> }>({ individuo: "", campos: [] });
  const [mensagem, setMensagem] = useState("");
  const camposRef = useRef(new Map<string, HTMLInputElement>());
  const adicionarRef = useRef<HTMLButtonElement>(null);
  const focoPendenteRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (focoPendenteRef.current === null) return;
    const id = focoPendenteRef.current;
    focoPendenteRef.current = null;
    if (id) camposRef.current.get(id)?.focus();
    else adicionarRef.current?.focus();
  }, [formulario.campos]);

  function removerCampo(id: string) {
    const indice = formulario.campos.findIndex((campo) => campo.id === id);
    const restantes = formulario.campos.filter((campo) => campo.id !== id);
    focoPendenteRef.current = restantes[indice]?.id ?? restantes[indice - 1]?.id ?? "";
    setFormulario((atual) => ({ ...atual, campos: atual.campos.filter((campo) => campo.id !== id) }));
  }

  function moverCampo(id: string, deslocamento: -1 | 1) {
    const indice = formulario.campos.findIndex((campo) => campo.id === id);
    const destino = indice + deslocamento;
    if (indice < 0 || destino < 0 || destino >= formulario.campos.length) return;
    const campos = [...formulario.campos];
    [campos[indice], campos[destino]] = [campos[destino], campos[indice]];
    focoPendenteRef.current = id;
    setFormulario((atual) => ({ ...atual, campos }));
  }

  function concluir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("Prévia demonstrativa concluída; nenhuma informação foi enviada ou salva.");
  }

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return <main className="plan-criar-formulario" role={carregando ? "status" : "alert"} aria-live="polite"><h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>{!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}</main>;
  }

  return (
    <main className="plan-criar-formulario">
      <section className="plan-criar-formulario_modal" aria-labelledby="plan-criar-formulario-titulo">

        <Link className="plan-criar-formulario_fechar" to={`/do/ciclo/${cicloId}/plan/coleta`} aria-label="Fechar criação de formulário">{/* # colocar imagem */}</Link>
        <form className="plan-criar-formulario_conteudo" onSubmit={concluir}>
          <AvisoDadosDemonstrativos mensagem="Esta prévia de formulário é demonstrativa; as informações não são enviadas nem salvas." />
          <h2 id="plan-criar-formulario-titulo">Criar formulário</h2>
          <div className="plan-criar-formulario_campos">
            <label htmlFor="dad-pages-plan-paginaplancriarformulario-index-37-13">
              <span>Sintoma - obrigatório</span>
              <input id="dad-pages-plan-paginaplancriarformulario-index-37-13" name="sintoma" required />
            </label>
            <label htmlFor="dad-pages-plan-paginaplancriarformulario-index-41-13">
              <span>Indivíduo - opcional</span>
              <input id="dad-pages-plan-paginaplancriarformulario-index-41-13" name="individuo" value={formulario.individuo} onChange={(event) => setFormulario((atual) => ({ ...atual, individuo: event.target.value }))} />
            </label>
          </div>
          {formulario.campos.map((campo, indice) => (
            <div className="plan-criar-formulario_campo-extra" key={campo.id}>
              <label htmlFor={`dad-pages-plan-paginaplancriarformulario-index-${String(campo.id)}`}>
                <span>Campo adicional {indice + 1}</span>
                <input ref={(elemento) => { if (elemento) camposRef.current.set(campo.id, elemento); else camposRef.current.delete(campo.id); }} id={`dad-pages-plan-paginaplancriarformulario-index-${String(campo.id)}`} value={campo.valor} onChange={(event) => setFormulario((atual) => ({ ...atual, campos: atual.campos.map((item) => item.id === campo.id ? { ...item, valor: event.target.value } : item) }))} />
              </label>
              <div className="plan-criar-formulario_campo-acoes">
                <button type="button" aria-label={`Mover campo ${indice + 1} para cima`} disabled={indice === 0} onClick={() => moverCampo(campo.id, -1)}>↑</button>
                <button type="button" aria-label={`Mover campo ${indice + 1} para baixo`} disabled={indice === formulario.campos.length - 1} onClick={() => moverCampo(campo.id, 1)}>↓</button>
                <button type="button" aria-label={`Remover campo ${indice + 1}`} onClick={() => removerCampo(campo.id)}>Remover</button>
              </div>
            </div>
          ))}
          <div className="plan-criar-formulario_automacoes"><span>Data e hora · preenchimento automático</span><span>Localização (GPS) · automática</span><span>Condições do tempo · automáticas</span></div>
          <button ref={adicionarRef} className="plan-criar-formulario_adicionar" type="button" onClick={() => setFormulario((atual) => ({ ...atual, campos: [...atual.campos, { id: crypto.randomUUID(), valor: "" }] }))}><span aria-hidden="true">{/* # colocar imagem */}</span>Adicionar campo</button>
          <button className="plan-criar-formulario_concluir" type="submit">Concluído</button>
          {mensagem && <p className="plan-criar-formulario_status" role="status">{mensagem}</p>}
        </form>
      </section>
    </main>
  );
}

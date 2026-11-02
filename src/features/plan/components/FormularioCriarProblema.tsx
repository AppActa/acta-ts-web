import { useId, useState, type FormEvent, type ReactNode } from "react";

export type CamposCriarProblema = {
  titulo: string;
  descricao: string;
  peso: string;
  persistente: "" | "sim" | "nao";
};
export type DadosEnvioCriarProblema = { titulo: string; descricao: string; pesoPercentual: number; persistente: boolean };
export type FeedbackEnvioFormulario = { tipo: "erro" | "aviso"; mensagem: string } | null;
export type FormularioCriarProblemaProps = {
  acaoFechar: ReactNode;
  podeEnviar: boolean;
  enviando: boolean;
  mensagemElegibilidade?: string;
  onSubmit: (dados: DadosEnvioCriarProblema) => void;
};
type CampoValidado = "titulo" | "descricao" | "peso" | "persistente";

function validarCampo(campo: CampoValidado, valor: string): string {
  if (campo === "persistente") return valor === "sim" || valor === "nao" ? "" : "Selecione Sim ou Não.";
  const texto = valor.trim();
  if (!texto) return campo === "peso" ? "Informe um peso entre 0 e 100%." : `Informe ${campo === "titulo" ? "o título" : "a descrição"}.`;
  if (campo === "titulo" || campo === "descricao") {
    const limite = campo === "titulo" ? 160 : 1000;
    return texto.length > limite ? `Use no máximo ${limite} caracteres.` : "";
  }
  const peso = Number(texto);
  return Number.isSafeInteger(peso) && peso >= 0 && peso <= 100 ? "" : "Informe um número inteiro entre 0 e 100%.";
}

export function FormularioCriarProblema({ acaoFechar, podeEnviar, enviando, mensagemElegibilidade, onSubmit }: FormularioCriarProblemaProps) {
  const id = useId();
  const [campos, setCampos] = useState<CamposCriarProblema>({ titulo: "", descricao: "", peso: "", persistente: "" });
  const [visitados, setVisitados] = useState<Partial<Record<CampoValidado, boolean>>>({});
  const erro = (campo: CampoValidado) => visitados[campo] ? validarCampo(campo, campos[campo]) : "";
  const atualizar = (campo: "titulo" | "descricao" | "peso", valor: string) => setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  const sairDoCampo = (campo: CampoValidado) => {
    if (campo !== "persistente") setCampos((atuais) => ({ ...atuais, [campo]: atuais[campo].trim() }));
    setVisitados((atuais) => ({ ...atuais, [campo]: true }));
  };
  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const todosVisitados: Record<CampoValidado, boolean> = { titulo: true, descricao: true, peso: true, persistente: true };
    setVisitados(todosVisitados);
    if ((Object.keys(todosVisitados) as CampoValidado[]).some((campo) => validarCampo(campo, campos[campo]))) return;
    if (!podeEnviar || enviando) return;
    if (campos.persistente !== "sim" && campos.persistente !== "nao") return;
    const pesoPercentual = Number(campos.peso);
    if (!Number.isSafeInteger(pesoPercentual) || pesoPercentual < 0 || pesoPercentual > 100) return;
    onSubmit({ titulo: campos.titulo.trim(), descricao: campos.descricao.trim(), pesoPercentual, persistente: campos.persistente === "sim" });
  };

  return (
    <section className="plan-criar-problema_modal" aria-labelledby={`${id}-titulo`}>
      <aside className="plan-criar-problema_banner" aria-label="ACTA">
        <div className="plan-criar-problema_mensagem">
          <p>Acta, seu app de PDCA</p>
          <p>O ciclo da melhoria começa aqui!</p>
        </div>
      </aside>
      <div className="plan-criar-problema_conteudo">
        <div className="plan-criar-problema_fechar">{acaoFechar}</div>
        <h1 className="plan-criar-problema_titulo" id={`${id}-titulo`}>Criar problema</h1>
        <p className="plan-criar-problema_aviso" id={`${id}-aviso`}>O servidor aplica as regras do ciclo ao registrar este problema.</p>
        {mensagemElegibilidade && <p className="plan-criar-problema_ajuda" role="status">{mensagemElegibilidade}</p>}
        <form className="plan-criar-problema_campos" noValidate aria-label="Dados do problema" aria-describedby={`${id}-aviso`} onSubmit={enviar}>
          <div className="plan-criar-problema_campo">
            <label htmlFor={`${id}-nome`}>Título</label>
            <input id={`${id}-nome`} type="text" required value={campos.titulo}
              placeholder="Ex.: Divergências na separação de pedidos"
              onChange={(event) => atualizar("titulo", event.target.value)} onBlur={() => sairDoCampo("titulo")}
              aria-invalid={Boolean(erro("titulo"))} aria-describedby={`${id}-nome-ajuda${erro("titulo") ? ` ${id}-nome-erro` : ""}`} />
            <p className="plan-criar-problema_ajuda" id={`${id}-nome-ajuda`}>Obrigatório. Até 160 caracteres.</p>
            {erro("titulo") && <p className="plan-criar-problema_erro" id={`${id}-nome-erro`} aria-live="polite">{erro("titulo")}</p>}
          </div>
          <div className="plan-criar-problema_campo">
            <label htmlFor={`${id}-descricao`}>Descrição</label>
            <textarea id={`${id}-descricao`} required value={campos.descricao}
              placeholder="Descreva o que acontece, onde e com quem."
              onChange={(event) => atualizar("descricao", event.target.value)} onBlur={() => sairDoCampo("descricao")}
              aria-invalid={Boolean(erro("descricao"))} aria-describedby={`${id}-descricao-ajuda${erro("descricao") ? ` ${id}-descricao-erro` : ""}`} />
            <p className="plan-criar-problema_ajuda" id={`${id}-descricao-ajuda`}>Obrigatória. Até 1.000 caracteres.</p>
            {erro("descricao") && <p className="plan-criar-problema_erro" id={`${id}-descricao-erro`} aria-live="polite">{erro("descricao")}</p>}
          </div>
          <div className="plan-criar-problema_campo">
            <label htmlFor={`${id}-peso`}>Peso na priorização (%)</label>
            <input id={`${id}-peso`} type="number" min={0} max={100} step={1} required value={campos.peso}
              placeholder="Defina um valor entre 0 e 100%"
              onChange={(event) => atualizar("peso", event.target.value)} onBlur={() => sairDoCampo("peso")}
              aria-invalid={Boolean(erro("peso"))} aria-describedby={`${id}-peso-ajuda${erro("peso") ? ` ${id}-peso-erro` : ""}`} />
            <p className="plan-criar-problema_ajuda" id={`${id}-peso-ajuda`}>Obrigatório. Número inteiro entre 0 e 100%, inclusive.</p>
            {erro("peso") && <p className="plan-criar-problema_erro" id={`${id}-peso-erro`} aria-live="polite">{erro("peso")}</p>}
          </div>
          <div className="plan-criar-problema_campo">
            <label htmlFor={`${id}-vinculo`}>Vincular a outro ciclo</label>
            <input id={`${id}-vinculo`} type="text" disabled value="" placeholder="Indisponível nesta etapa" aria-describedby={`${id}-vinculo-ajuda`} />
            <p className="plan-criar-problema_ajuda" id={`${id}-vinculo-ajuda`}>Vínculo com outro ciclo indisponível.</p>
          </div>
          <div className="plan-criar-problema_campo">
            <label htmlFor={`${id}-persistente`}>O problema é persistente?</label>
            <select id={`${id}-persistente`} required value={campos.persistente}
              onBlur={() => sairDoCampo("persistente")}
              aria-invalid={Boolean(erro("persistente"))}
              aria-describedby={`${id}-persistente-ajuda${erro("persistente") ? ` ${id}-persistente-erro` : ""}`}
              onChange={(event) => {
                const valor = event.target.value;
                if (valor === "" || valor === "sim" || valor === "nao") setCampos((atuais) => ({ ...atuais, persistente: valor }));
              }}>
              <option value="" disabled>Selecione Sim ou Não</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            <p className="plan-criar-problema_ajuda" id={`${id}-persistente-ajuda`}>Obrigatório. Selecione Sim ou Não.</p>
            {erro("persistente") && <p className="plan-criar-problema_erro" id={`${id}-persistente-erro`} aria-live="polite">{erro("persistente")}</p>}
          </div>
          <button className="plan-criar-problema_concluir" type="submit" disabled={!podeEnviar || enviando} aria-describedby={`${id}-aviso`}>{enviando ? "Enviando…" : "Concluído"}</button>
        </form>
      </div>
    </section>
  );
}

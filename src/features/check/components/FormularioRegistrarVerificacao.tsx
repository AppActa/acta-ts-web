import { useId, useState, type FormEvent, type ReactNode } from "react";
import type { StatusVerificacaoPg } from "../../../services/api/pg/dashboard.read.api";

export type CamposRegistrarVerificacao = {
  status: StatusVerificacaoPg | "";
  resumo: string;
  observacao: string;
};
export type DadosEnvioRegistrarVerificacao = { status: StatusVerificacaoPg; resumo: string; observacao: string };
export type FeedbackEnvioFormulario = { tipo: "erro" | "aviso"; mensagem: string } | null;
export type FormularioRegistrarVerificacaoProps = {
  acaoFechar: ReactNode;
  podeEnviar: boolean;
  enviando: boolean;
  feedback: FeedbackEnvioFormulario;
  mensagemElegibilidade?: string;
  onSubmit: (campos: DadosEnvioRegistrarVerificacao) => void;
};
type Campo = keyof CamposRegistrarVerificacao;
const statusVerificacao: { valor: StatusVerificacaoPg; rotulo: string }[] = [
  { valor: "NAO_VERIFICADO", rotulo: "Não verificado" }, { valor: "APROVADO", rotulo: "Aprovado" },
  { valor: "PARCIAL", rotulo: "Parcial" }, { valor: "REPROVADO", rotulo: "Reprovado" },
];

function validar(campo: Campo, campos: CamposRegistrarVerificacao): string {
  if (campo === "status") return statusVerificacao.some((item) => item.valor === campos.status) ? "" : "Selecione o status da verificação.";
  if (campo === "resumo") return !campos.resumo.trim() ? "Informe o resumo." : campos.resumo.trim().length > 1000 ? "Use no máximo 1.000 caracteres." : "";
  const observacao = campos.observacao.trim();
  if (observacao.length > 1000) return "Use no máximo 1.000 caracteres.";
  return campos.status !== "APROVADO" && !observacao ? "Informe a observação para este status." : "";
}

export function FormularioRegistrarVerificacao({ acaoFechar, podeEnviar, enviando, feedback, mensagemElegibilidade, onSubmit }: FormularioRegistrarVerificacaoProps) {
  const id = useId();
  const [campos, setCampos] = useState<CamposRegistrarVerificacao>({ status: "", resumo: "", observacao: "" });
  const [visitados, setVisitados] = useState<Partial<Record<Campo, boolean>>>({});
  const erro = (campo: Campo) => visitados[campo] ? validar(campo, campos) : "";
  const atualizarTexto = (campo: "resumo" | "observacao", valor: string) => setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  const atualizarStatus = (valor: string) => setCampos((atuais) => ({ ...atuais, status: statusVerificacao.find((item) => item.valor === valor)?.valor ?? "" }));
  const aoSair = (campo: Campo) => {
    if (campo !== "status") setCampos((atuais) => ({ ...atuais, [campo]: atuais[campo].trim() }));
    setVisitados((atuais) => ({ ...atuais, [campo]: true }));
  };
  const descricao = (campo: Campo) => `${id}-${campo}-ajuda${erro(campo) ? ` ${id}-${campo}-erro` : ""}`;
  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const todosVisitados: Record<Campo, boolean> = { status: true, resumo: true, observacao: true };
    setVisitados(todosVisitados);
    if ((Object.keys(todosVisitados) as Campo[]).some((campo) => validar(campo, campos))) return;
    if (!podeEnviar || enviando) return;
    const status = statusVerificacao.find((item) => item.valor === campos.status)?.valor;
    if (!status) return;
    onSubmit({ status, resumo: campos.resumo.trim(), observacao: campos.observacao.trim() });
  };

  return (
    <section className="registrar-verificacao_modal" aria-labelledby={`${id}-titulo`}>
      <aside className="registrar-verificacao_banner" aria-label="ACTA">
        <div className="registrar-verificacao_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div>
      </aside>
      <div className="registrar-verificacao_conteudo">
        <div className="registrar-verificacao_fechar">{acaoFechar}</div>
        <h1 className="registrar-verificacao_titulo" id={`${id}-titulo`}>Registrar verificação</h1>
        <p className="registrar-verificacao_aviso" id={`${id}-aviso`}>O servidor confirma o ciclo e sua participação ao registrar.</p>
        {mensagemElegibilidade && <p className="registrar-verificacao_ajuda" role="status">{mensagemElegibilidade}</p>}
        {feedback && <p className={feedback.tipo === "erro" ? "registrar-verificacao_erro" : "registrar-verificacao_ajuda"} role={feedback.tipo === "erro" ? "alert" : "status"}>{feedback.mensagem}</p>}
        <form className="registrar-verificacao_campos" noValidate aria-label="Dados da verificação" aria-describedby={`${id}-aviso`} onSubmit={enviar}>
          <div className="registrar-verificacao_campo">
            <label htmlFor={`${id}-status`}>Status</label>
            <select id={`${id}-status`} required value={campos.status} onChange={(event) => atualizarStatus(event.target.value)} onBlur={() => aoSair("status")}
              aria-invalid={Boolean(erro("status"))} aria-describedby={descricao("status")}>
              <option value="">Selecione o status</option>
              {statusVerificacao.map((item) => <option key={item.valor} value={item.valor}>{item.rotulo}</option>)}
            </select>
            <p className="registrar-verificacao_ajuda" id={`${id}-status-ajuda`}>Selecione o resultado registrado.</p>
            {erro("status") && <p className="registrar-verificacao_erro" id={`${id}-status-erro`} aria-live="polite">{erro("status")}</p>}
          </div>
          <div className="registrar-verificacao_campo">
            <label htmlFor={`${id}-resumo`}>Resumo</label>
            <textarea id={`${id}-resumo`} required value={campos.resumo} placeholder="Resuma o resultado da verificação."
              onChange={(event) => atualizarTexto("resumo", event.target.value)} onBlur={() => aoSair("resumo")}
              aria-invalid={Boolean(erro("resumo"))} aria-describedby={descricao("resumo")} />
            <p className="registrar-verificacao_ajuda" id={`${id}-resumo-ajuda`}>Obrigatório. Até 1.000 caracteres.</p>
            {erro("resumo") && <p className="registrar-verificacao_erro" id={`${id}-resumo-erro`} aria-live="polite">{erro("resumo")}</p>}
          </div>
          <div className="registrar-verificacao_campo">
            <label htmlFor={`${id}-observacao`}>Observação</label>
            <textarea id={`${id}-observacao`} required={campos.status !== "APROVADO"} value={campos.observacao} placeholder="Adicione uma observação quando necessário."
              onChange={(event) => atualizarTexto("observacao", event.target.value)} onBlur={() => aoSair("observacao")}
              aria-invalid={Boolean(erro("observacao"))} aria-describedby={descricao("observacao")} />
            <p className="registrar-verificacao_ajuda" id={`${id}-observacao-ajuda`}>Obrigatória quando o status não for Aprovado. Até 1.000 caracteres.</p>
            {erro("observacao") && <p className="registrar-verificacao_erro" id={`${id}-observacao-erro`} aria-live="polite">{erro("observacao")}</p>}
          </div>
          <button className="registrar-verificacao_concluir" type="submit" disabled={!podeEnviar || enviando} aria-describedby={`${id}-aviso`}>{enviando ? "Enviando…" : "Concluído"}</button>
        </form>
      </div>
    </section>
  );
}

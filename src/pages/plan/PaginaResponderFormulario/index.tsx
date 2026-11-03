import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { obterFormularioMongo, type FormularioMongo } from "../../../services/api/mongo/dashboard.read.api";
import { enviarRespostaFormularioMongo } from "../../../services/api/mongo/forms.write.api";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { lerIdRotaPositivo } from "../../../utils/route-params";

export function PaginaResponderFormulario() {
  const { cicloId, formularioId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const idCiclo = lerIdRotaPositivo(cicloId);
  const [form, setForm] = useState<FormularioMongo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!formularioId || ciclo.estado !== "sucesso") return;
    const controller = new AbortController();
    void obterFormularioMongo(formularioId, controller.signal).then((item) => {
      if (item.status !== "ATIVO") throw new Error("Este formulário não está ativo para respostas.");
      if (item.idCiclo !== idCiclo || item.idEmpresa !== ciclo.ciclo.idEmpresa) throw new Error("Formulário não pertence a este ciclo.");
      if (item.perguntas.some((q) => q.tipo === "ARQUIVO")) throw new Error("Este formulário inclui anexos, que ainda não podem ser enviados por este fluxo.");
      setForm(item);
    }).catch((e) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Não foi possível carregar o formulário."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [formularioId, ciclo.estado === "sucesso" ? ciclo.ciclo.idEmpresa : null, idCiclo]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!form) return;
    setBusy(true); setError("");
    try {
      const respostas = form.perguntas.flatMap((q) => {
        const value = values[q.id];
        const vazio = value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
        return vazio && !q.obrigatoria ? [] : [{ idPergunta: q.id, resposta: value ?? (q.tipo === "CHECKBOX" ? [] : "") }];
      });
      await enviarRespostaFormularioMongo(form.id, respostas, new AbortController().signal);
      setSuccess(true);
    } catch (e) {
      const status = e && typeof e === "object" && "status" in e ? (e as { status?: number }).status : undefined;
      setError(status === 409 ? "Você já respondeu a este formulário." : e instanceof Error ? e.message : "Não foi possível enviar sua resposta.");
    } finally { setBusy(false); }
  }
  if (ciclo.estado !== "sucesso") return <main><p role="alert">{ciclo.estado === "carregando" ? "Carregando ciclo…" : "Ciclo indisponível."}</p></main>;
  if (loading) return <main><CarregandoConteudo compacto mensagem="Carregando formulário" /></main>;
  return <main className="plan-criar-formulario"><section className="plan-criar-formulario_modal"><div className="plan-criar-formulario_conteudo">
    <Link to={`/do/ciclo/${cicloId}/plan/coleta`}>Voltar às coletas</Link>
    {error && !form && <p role="alert">{error}</p>}
    {form && <><h1>{form.titulo}</h1>{form.descricao && <p>{form.descricao}</p>}
      {success ? <p role="status">Resposta enviada com sucesso.</p> : <form onSubmit={(e) => void submit(e)}>
        {form.perguntas.map((q) => <fieldset key={q.id}><legend>{q.titulo}{q.obrigatoria ? " *" : ""}</legend>
          {q.tipo === "RADIO" || q.tipo === "SIM_NAO" ? (q.tipo === "SIM_NAO" ? ["Sim", "Não"] : q.opcoes).map((option) => <label key={option}><input required={q.obrigatoria} type="radio" name={q.id} value={option} onChange={() => setValues({ ...values, [q.id]: option })} />{option}</label>)
            : q.tipo === "CHECKBOX" ? q.opcoes.map((option) => <label key={option}><input type="checkbox" value={option} onChange={(e) => { const current = (values[q.id] as string[] | undefined) ?? []; setValues({ ...values, [q.id]: e.target.checked ? [...current, option] : current.filter((x) => x !== option) }); }} />{option}</label>)
            : <label>{q.titulo}<input required={q.obrigatoria} type={q.tipo === "DATA" ? "date" : q.tipo === "EMAIL" ? "email" : ["NUMERO_INTEIRO", "NUMERO_DECIMAL", "RANGE"].includes(q.tipo) ? "number" : "text"} step={q.tipo === "NUMERO_DECIMAL" ? "any" : undefined} onChange={(e) => setValues({ ...values, [q.id]: e.target.value })} /></label>}
        </fieldset>)}
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar resposta"}</button>
      </form>}</>}
  </div></section></main>;
}

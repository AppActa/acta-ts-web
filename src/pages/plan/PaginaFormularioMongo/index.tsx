import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { obterFormularioMongo, type FormularioMongo, type TipoFormularioMongo, type TipoRespostaMongo } from "../../../services/api/mongo/dashboard.read.api";
import { atualizarFormularioMongo, criarFormularioMongo, publicarFormularioMongo, type DadosFormularioMongo } from "../../../services/api/mongo/forms.write.api";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";

const TIPOS: TipoRespostaMongo[] = ["TEXTO", "RADIO", "CHECKBOX", "DATA", "EMAIL", "NUMERO_INTEIRO", "NUMERO_DECIMAL", "RANGE", "TELEFONE", "SIM_NAO", "CPF", "ARQUIVO", "CEP"];
const FORM_TYPES: TipoFormularioMongo[] = ["ANALISE_FENOMENO", "PARETO", "ISHIKAWA", "PLANO_ACAO", "TREINAMENTO", "PADRONIZACAO", "CHECKLIST"];
type Pergunta = { id?: string; titulo: string; tipo: TipoRespostaMongo; obrigatoria: boolean; opcoes: string[] };

export function PaginaFormularioMongo() {
  const { cicloId, formularioId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const idCiclo = ciclo.estado === "sucesso" ? ciclo.ciclo.id : null;
  const editId = formularioId;
  const [loading, setLoading] = useState(Boolean(editId));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ titulo: string; descricao: string; tipo: TipoFormularioMongo; perguntas: Pergunta[]; destinatarios: string; idIshikawa: string }>({ titulo: "", descricao: "", tipo: "ANALISE_FENOMENO", perguntas: [], destinatarios: "", idIshikawa: "" });
  const [saved, setSaved] = useState<FormularioMongo | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!editId) { setLoading(false); return; }
    if (idCiclo === null) return;
    const controller = new AbortController();
    void obterFormularioMongo(editId, controller.signal).then((item) => {
      if (controller.signal.aborted) return;
      if (item.idCiclo !== idCiclo) throw new Error("Formulário não pertence a este ciclo.");
      setForm({ titulo: item.titulo, descricao: item.descricao ?? "", tipo: item.tipo, perguntas: item.perguntas.map((q) => ({ ...q })), destinatarios: item.idsUsuariosDestinatarios.join(", "), idIshikawa: item.idIshikawa ?? "" });
      setSaved(item);
      setError("");
    }).catch(() => { if (!controller.signal.aborted) setError("Não foi possível carregar o formulário."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [editId, idCiclo]);
  function dados(): DadosFormularioMongo {
    const destinatarios = form.destinatarios.trim() ? form.destinatarios.split(/[\s,;]+/).filter(Boolean).map(Number) : [];
    return { titulo: form.titulo.trim(), descricao: form.descricao.trim() || null, tipo: form.tipo, perguntas: form.perguntas.map((q) => ({ ...q, titulo: q.titulo.trim(), opcoes: q.opcoes.map((o) => o.trim()).filter(Boolean) })), idsUsuariosDestinatarios: destinatarios, idIshikawa: form.idIshikawa.trim() || null };
  }
  async function submit(event: { preventDefault: () => void }, publicar = false) {
    event.preventDefault(); if (idCiclo === null) return;
    setBusy(true); setError("");
    try {
      const controller = new AbortController();
      const item = saved ? await atualizarFormularioMongo(saved.id, idCiclo, dados(), controller.signal) : await criarFormularioMongo(idCiclo, dados(), controller.signal);
      setSaved(item);
      const result = publicar ? await publicarFormularioMongo(item.id, idCiclo, controller.signal) : item;
      setSaved(result);
      navigate(`/do/ciclo/${idCiclo}/plan/coleta`);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar o formulário. Confira os campos e tente novamente."); }
    finally { setBusy(false); }
  }
  if (ciclo.estado !== "sucesso") return <main><p role="alert">{ciclo.estado === "carregando" ? "Carregando ciclo…" : "Ciclo indisponível."}</p></main>;
  if (loading) return <main><CarregandoConteudo compacto mensagem="Carregando formulário" /></main>;
  if (editId && error && !saved) return <main><p role="alert">{error}</p><Link to={`/do/ciclo/${idCiclo}/plan/coleta`}>Voltar às coletas</Link></main>;
  return <main className="plan-criar-formulario"><section className="plan-criar-formulario_modal"><form className="plan-criar-formulario_conteudo" onSubmit={(e) => void submit(e)}>
    <Link to={`/do/ciclo/${idCiclo}/plan/coleta`}>Voltar às coletas</Link>
    <h1>{editId ? "Editar formulário" : "Criar formulário"}</h1>
    <label>Título *<input required maxLength={160} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></label>
    <label>Descrição<textarea maxLength={2000} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
    <label>Tipo<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoFormularioMongo })}>{FORM_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}</select></label>
    {form.tipo === "ISHIKAWA" && <label>ID do Ishikawa vinculado *<input required pattern="[0-9a-fA-F-]{36}" value={form.idIshikawa} onChange={(e) => setForm({ ...form, idIshikawa: e.target.value })} /></label>}
    <label>Destinatários (IDs de usuário, separados por vírgula)<input inputMode="numeric" value={form.destinatarios} onChange={(e) => setForm({ ...form, destinatarios: e.target.value })} /></label>
    <h2>Perguntas</h2>
    {form.perguntas.map((q, i) => <fieldset key={q.id ?? i}><legend>Pergunta {i + 1}</legend>
      <label>Texto *<input required value={q.titulo} onChange={(e) => setForm({ ...form, perguntas: form.perguntas.map((p, ix) => ix === i ? { ...p, titulo: e.target.value } : p) })} /></label>
      <label>Tipo de resposta<select value={q.tipo} onChange={(e) => setForm({ ...form, perguntas: form.perguntas.map((p, ix) => ix === i ? { ...p, tipo: e.target.value as TipoRespostaMongo, opcoes: ["RADIO", "CHECKBOX"].includes(e.target.value) ? (p.opcoes.length ? p.opcoes : ["", ""]) : [] } : p) })}>{TIPOS.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}</select></label>
      <label><input type="checkbox" checked={q.obrigatoria} onChange={(e) => setForm({ ...form, perguntas: form.perguntas.map((p, ix) => ix === i ? { ...p, obrigatoria: e.target.checked } : p) })} /> Obrigatória</label>
      {["RADIO", "CHECKBOX"].includes(q.tipo) && <label>Opções (uma por linha)<textarea required value={q.opcoes.join("\n")} onChange={(e) => setForm({ ...form, perguntas: form.perguntas.map((p, ix) => ix === i ? { ...p, opcoes: e.target.value.split("\n") } : p) })} /></label>}
      <button type="button" onClick={() => setForm({ ...form, perguntas: form.perguntas.filter((_, ix) => ix !== i) })}>Remover pergunta</button>
    </fieldset>)}
    <button type="button" onClick={() => setForm({ ...form, perguntas: [...form.perguntas, { titulo: "", tipo: "TEXTO", obrigatoria: false, opcoes: [] }] })}>Adicionar pergunta</button>
    {saved?.status === "ATIVO" && <p role="status">Este formulário está publicado.</p>}
    {error && <p role="alert">{error}</p>}
    <button disabled={busy} type="submit">{busy ? "Salvando…" : "Salvar rascunho"}</button>
    <button disabled={busy || saved?.status === "ATIVO"} type="button" onClick={(e) => void submit(e, true)}>{busy ? "Salvando…" : "Salvar e publicar"}</button>
  </form></section></main>;
}

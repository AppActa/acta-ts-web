import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { obterLicaoAprendidaMongo } from "../../../services/api/mongo/dashboard.read.api";
import { atualizarLicaoAprendidaMongo, criarLicaoAprendidaMongo, type DadosLicaoAprendidaMongo } from "../../../services/api/mongo/forms.write.api";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";

export function PaginaEditarLicaoAprendida() {
  const { cicloId, licaoId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const [loading, setLoading] = useState(Boolean(licaoId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<DadosLicaoAprendidaMongo>({ titulo: "", licao: "", tags: [], faseOrigem: "", resultado: "", severidade: "", area: "" });
  const [tags, setTags] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (!licaoId) { setLoading(false); return; }
    const controller = new AbortController();
    void obterLicaoAprendidaMongo(licaoId, controller.signal).then((item) => {
      if (ciclo.estado !== "sucesso" || item.idCiclo !== ciclo.ciclo.id) throw new Error("Lição não pertence a este ciclo.");
      setForm({ titulo: item.titulo, licao: item.licao, tags: item.tags ?? [], faseOrigem: item.faseOrigem, resultado: item.resultado, severidade: item.severidade, area: item.area });
      setTags(item.tags?.join(", ") ?? "");
    }).catch(() => { if (!controller.signal.aborted) setError("Não foi possível carregar esta lição aprendida."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [licaoId, ciclo.estado === "sucesso" ? ciclo.ciclo.id : null]);
  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (ciclo.estado !== "sucesso") return;
    setBusy(true); setError("");
    const data = { ...form, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    try {
      const signal = new AbortController().signal;
      if (licaoId) await atualizarLicaoAprendidaMongo(licaoId, ciclo.ciclo.id, data, signal);
      else await criarLicaoAprendidaMongo(ciclo.ciclo.id, data, signal);
      navigate(`/do/ciclo/${ciclo.ciclo.id}/act/aprendizados`);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar a lição."); }
    finally { setBusy(false); }
  }
  if (ciclo.estado !== "sucesso") return <main><p role="alert">{ciclo.estado === "carregando" ? "Carregando ciclo…" : "Ciclo indisponível."}</p></main>;
  if (loading) return <main><CarregandoConteudo compacto mensagem="Carregando lição aprendida" /></main>;
  function campo(label: string, key: keyof DadosLicaoAprendidaMongo, required = true) {
    return <label>{label}{key === "licao" ? <textarea required={required} maxLength={2000} value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /> : <input required={required} maxLength={2000} value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}</label>;
  }
  return <main className="plan-criar-formulario"><section className="plan-criar-formulario_modal"><form className="plan-criar-formulario_conteudo" onSubmit={(e) => void salvar(e)}>
    <Link to={`/do/ciclo/${ciclo.ciclo.id}/act/aprendizados`}>Voltar aos aprendizados</Link>
    <h1>{licaoId ? "Editar lição aprendida" : "Criar lição aprendida"}</h1>
    {campo("Título *", "titulo")}{campo("O que foi aprendido *", "licao")}
    <label>Tags (separadas por vírgula)<input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
    {campo("Fase de origem *", "faseOrigem")}{campo("Resultado *", "resultado")}{campo("Severidade *", "severidade")}{campo("Área *", "area")}
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar lição"}</button>
  </form></section></main>;
}

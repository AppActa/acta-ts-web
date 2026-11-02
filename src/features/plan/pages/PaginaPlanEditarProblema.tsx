import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarProblemasPorCicloPg, type ProblemaPg } from "../../../services/api/pg/dashboard.read.api";
import { atualizarProblemaPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { useProblemasDoCiclo } from "../hooks/useProblemasDoCiclo";
import { ModalErroPlan } from "../components/ModalErroPlan";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

function FormularioEdicao({ cicloId, problemaId, cicloAberto }: { cicloId: number; problemaId: number; cicloAberto: boolean }) {
  const resultado = useProblemasDoCiclo(cicloId);
  const voltar = `/do/ciclo/${cicloId}/plan/identificacao-problema/${problemaId}`;
  if (resultado.estado !== "sucesso" && resultado.estado !== "vazio") return <section className="plan-criar-problema_estado" role="status"><p>{resultado.estado === "carregando" ? "Carregando problema..." : "Não foi possível carregar o problema."}</p><Link to={voltar}>Voltar</Link></section>;
  const problema = resultado.dados.find((item) => item.id === problemaId);
  if (!problema) return <section className="plan-criar-problema_estado" role="alert"><p>Problema não encontrado neste ciclo.</p><Link to={`/do/ciclo/${cicloId}/plan/identificacao-problema`}>Voltar aos problemas</Link></section>;
  return <EditorDados key={problema.id} problema={problema} cicloId={cicloId} voltar={voltar} cicloAberto={cicloAberto} />;
}

function EditorDados({ problema, cicloId, voltar, cicloAberto }: { problema: ProblemaPg; cicloId: number; voltar: string; cicloAberto: boolean }) {
  const { actaUser } = useAuth();
  const navegar = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const enviandoRef = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const autorizado = (actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR") && actaUser.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && cicloAberto && problema.status === "ABERTO";
  useEffect(() => { const atual = new AbortController(); controller.current = atual; return () => { atual.abort(); controller.current = null; }; }, []);
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!autorizado || incerto || enviandoRef.current || !controller.current) return;
    const campos = new FormData(evento.currentTarget);
    const titulo = String(campos.get("titulo") ?? "").trim();
    const descricao = String(campos.get("descricao") ?? "").trim();
    const pesoTexto = String(campos.get("peso") ?? "").trim();
    const pesoPercentual = Number(pesoTexto);
    if (!titulo || titulo.length > 160 || !descricao || descricao.length > 1000 || !pesoTexto || !Number.isSafeInteger(pesoPercentual) || pesoPercentual < 0 || pesoPercentual > 100) { setErro("Preencha título e descrição e informe um peso inteiro entre 0 e 100%."); return; }
    const sinal = controller.current.signal;
    enviandoRef.current = true; setEnviando(true); setErro(null);
    void (async () => {
      try {
        await atualizarProblemaPg(problema.id, cicloId, { titulo, descricao, pesoPercentual }, sinal);
        const lista = await listarProblemasPorCicloPg(cicloId, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
        if (sinal.aborted) return;
        const atualizado = lista.find((item) => item.id === problema.id && item.idCiclo === cicloId);
        if (!atualizado || atualizado.titulo !== titulo || atualizado.descricao !== descricao || atualizado.peso !== pesoPercentual / 100) throw new PdcaWriteError("INVALID_RESPONSE");
        navegar(voltar, { replace: true });
      } catch (falha) {
        if (sinal.aborted) return;
        if (!(falha instanceof ApiError) || falha.status === 0 || falha.status === 408 || falha.status >= 500 || (falha.status >= 200 && falha.status < 300)) {
          setIncerto(true); setErro("Não foi possível confirmar o resultado. Volte aos detalhes e confira o problema antes de tentar novamente.");
        } else if (falha instanceof ApiError && falha.status === 403) setErro("O servidor não autorizou esta alteração.");
        else if (falha instanceof ApiError && falha.status === 401) setErro("A sessão não foi aceita. Entre novamente e tente outra vez.");
        else setErro("Não foi possível salvar as alterações. Confira os dados e o estado do problema.");
      } finally { if (!sinal.aborted) { enviandoRef.current = false; setEnviando(false); } }
    })();
  }
  return <><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="editar-problema-titulo">
    <aside className="plan-criar-problema_banner" aria-label="ACTA"><div className="plan-criar-problema_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div></aside>
    <div className="plan-criar-problema_conteudo">
      <h1 className="plan-criar-problema_titulo" id="editar-problema-titulo">Editar problema</h1>
      <p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={salvar}>
        <label>Título *<input name="titulo" defaultValue={problema.titulo} maxLength={160} required disabled={enviando || incerto} /></label>
        <label>Peso na priorização (%) *<input name="peso" type="number" min="0" max="100" step="1" defaultValue={problema.peso === null ? "" : Number((problema.peso * 100).toFixed(2))} required disabled={enviando || incerto} /></label>
        <label>Descrição *<textarea name="descricao" defaultValue={problema.descricao ?? ""} maxLength={1000} required disabled={enviando || incerto} /></label>
        <label>Problema persistente<input value={problema.persistente === null ? "Não informado" : problema.persistente ? "Sim" : "Não"} readOnly /></label>
        <label>Problema relacionado<input value={problema.idProblemaPai === null ? "Nenhum" : `Problema ${problema.idProblemaPai}`} readOnly /></label>
        {!autorizado && <p className="plan-editar-problema_aviso" role="status">A edição está disponível para gestores e administradores em problemas abertos de ciclos ativos.</p>}
        <div className="plan-editar-problema_acoes"><Link to={voltar} onClick={(evento) => { if (enviando) evento.preventDefault(); }}>Cancelar</Link><button type="submit" disabled={!autorizado || enviando || incerto}>{enviando ? "Salvando..." : "Salvar alterações"}</button></div>
      </form>
    </div>
  </section>{erro && <ModalErroPlan titulo={incerto ? "Não foi possível confirmar a alteração" : "Não foi possível salvar o problema"} mensagem={erro} aoFechar={() => setErro(null)} />}</>;
}

export function PaginaPlanEditarProblema() {
  const { cicloId, problemaId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const idProblema = Number(problemaId);
  return <main className="plan-criar-problema">{ciclo.estado === "sucesso" && Number.isSafeInteger(idProblema) && idProblema > 0
    ? <FormularioEdicao key={`${ciclo.ciclo.id}:${idProblema}`} cicloId={ciclo.ciclo.id} problemaId={idProblema} cicloAberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} />
    : <section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo ou problema indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section>}</main>;
}

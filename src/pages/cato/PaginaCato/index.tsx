import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { ApiError } from "../../../services/http/client";
import { useAuth } from "../../../components/auth/AuthProvider";
import { lerIdRotaPositivo } from "../../../utils/route-params";
import { Sidebar } from "../../../components/layout/Sidebar";
import mascoteCato from "../../../../features/cato/assets/cato-mascote.png";
import iconeCiclo from "../../../../features/cato/assets/context-0.svg";
import iconeMicrofone from "../../../../features/cato/assets/microfone.svg";
import iconeEnviar from "../../../../features/cato/assets/enviar.svg";
import { criarNovaConversa, enviarAudio, enviarMensagem, listarCiclos, listarConversas, listarMensagens } from "../../../services/api/cato/cato.api";
import type { CatoChat, CatoCycle, CatoMessage } from "../../../types/cato";
import "../../../../features/cato/styles/pagina-cato.css";

function novoId() {
  return crypto.randomUUID();
}

function erroLegivel(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error ? error.message : "Não foi possível concluir a solicitação. Tente novamente.";
}

const sugestoes = [
  { titulo: "Como está meu ciclo?", detalhe: "Veja o andamento atual." },
  { titulo: "Quais tarefas estão atrasadas?", detalhe: "Confira prazos e responsáveis." },
  { titulo: "O que falta concluir no Plan?", detalhe: "Veja as etapas pendentes." },
  { titulo: "Quais treinamentos estão previstos?", detalhe: "Consulte datas e orientações." },
];

export function PaginaCato() {
  const { actaUser, firebaseUser } = useAuth();
  const [sessionId, setSessionId] = useState<string>(novoId);
  const [conversas, setConversas] = useState<CatoChat[]>([]);
  const [ciclos, setCiclos] = useState<CatoCycle[]>([]);
  const [cicloAtivo, setCicloAtivo] = useState("");
  const [cicloMenuAberto, setCicloMenuAberto] = useState(false);
  const [mensagens, setMensagens] = useState<CatoMessage[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroCiclos, setErroCiclos] = useState("");
  const [historicoAberto, setHistoricoAberto] = useState(true);
  const [busca, setBusca] = useState("");
  const [carregandoCiclos, setCarregandoCiclos] = useState(true);
  const [gravandoAudio, setGravandoAudio] = useState(false);
  const [erroAudio, setErroAudio] = useState("");
  const [fotoPerfilFalhou, setFotoPerfilFalhou] = useState(false);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const cicloTriggerRef = useRef<HTMLButtonElement>(null);
  const cicloOpcaoRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mensagensRef = useRef<HTMLDivElement>(null);
  const reabrirHistoricoRef = useRef<HTMLButtonElement>(null);
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const streamAudioRef = useRef<MediaStream | null>(null);
  const nome = actaUser?.nome?.split(" ")[0] || "";
  const nomeCompleto = actaUser?.nome || firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Usuário ACTA";
  const iniciais = nomeCompleto.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR");
  const saudacao = nome ? `Olá, ${nome}.` : "Olá.";
  const fotoPerfilUrl = actaUser?.fotoPerfilUrl || firebaseUser?.photoURL || "";
  const fotoPerfil = fotoPerfilUrl && !fotoPerfilFalhou ? fotoPerfilUrl : "";
  const cargo = actaUser?.permissaoGestor ? "Gestor(a)" : "Colaborador(a)";

  const cicloSelecionadoIndex = cicloAtivo ? ciclos.findIndex((ciclo) => String(ciclo.id) === cicloAtivo) + 1 : 0;

  function focarOpcaoCiclo(index: number) {
    cicloOpcaoRefs.current[index]?.focus();
  }

  function abrirSeletorCiclo() {
    if (carregandoCiclos || ciclos.length === 0) return;
    if (cicloMenuAberto) {
      setCicloMenuAberto(false);
      return;
    }
    setCicloMenuAberto(true);
    window.requestAnimationFrame(() => focarOpcaoCiclo(cicloSelecionadoIndex));
  }

  function selecionarCiclo(valor: string) {
    setCicloAtivo(valor);
    setCicloMenuAberto(false);
    cicloTriggerRef.current?.focus();
  }

  function navegarOpcoesCiclo(event: KeyboardEvent<HTMLDivElement>) {
    const indiceAtual = cicloOpcaoRefs.current.findIndex((opcao) => opcao === document.activeElement);
    if (event.key === "Escape" && cicloMenuAberto) {
      event.preventDefault();
      setCicloMenuAberto(false);
      cicloTriggerRef.current?.focus();
      return;
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && (cicloMenuAberto || document.activeElement === cicloTriggerRef.current)) {
      event.preventDefault();
      const sentido = event.key === "ArrowDown" ? 1 : -1;
      const proximo = cicloMenuAberto
        ? (indiceAtual + sentido + ciclos.length + 1) % (ciclos.length + 1)
        : cicloSelecionadoIndex;
      if (!cicloMenuAberto) setCicloMenuAberto(true);
      window.requestAnimationFrame(() => focarOpcaoCiclo(proximo));
    }
  }

  const atualizarHistorico = useCallback(async () => {
    try { setConversas(await listarConversas()); } catch { /* O chat pode ser usado mesmo se o histórico estiver indisponível. */ }
  }, []);

  const atualizarCiclos = useCallback(async () => {
    setCarregandoCiclos(true);
    setErroCiclos("");
    try { setCiclos(await listarCiclos()); }
    catch { setErroCiclos("Não foi possível carregar os ciclos."); }
    finally { setCarregandoCiclos(false); }
  }, []);

  useEffect(() => { void atualizarHistorico(); }, [atualizarHistorico]);
  useEffect(() => { void atualizarCiclos(); }, [atualizarCiclos]);
  useEffect(() => {
    const painel = mensagensRef.current;
    if (painel && mensagens.length > 0) painel.scrollTo({ top: painel.scrollHeight, behavior: "smooth" });
  }, [mensagens, carregando]);
  useEffect(() => {
    if (!historicoAberto) reabrirHistoricoRef.current?.focus();
  }, [historicoAberto]);
  useEffect(() => () => {
    if (gravadorRef.current?.state === "recording") {
      gravadorRef.current.onstop = null;
      gravadorRef.current.stop();
    }
    streamAudioRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function enviar(event?: FormEvent, mensagemDireta?: string) {
    event?.preventDefault();
    const conteudo = (mensagemDireta ?? texto).trim();
    if (!conteudo || carregando) return;
    const pergunta: CatoMessage = {
      id: novoId(),
      role: "user",
      content: conteudo,
    };
    setMensagens((atual) => [...atual, pergunta]);
    setTexto("");
    setErro("");
    setErroAudio("");
    setCarregando(true);
    try {
      const idCiclo = lerIdRotaPositivo(cicloAtivo);
      const resposta = await enviarMensagem({ message: conteudo, sessionId, cycleIds: idCiclo ? [idCiclo] : [], activeCycleId: idCiclo });
      setMensagens((atual) => [...atual, { id: novoId(), role: "assistant", content: resposta }]);
      void atualizarHistorico();
    } catch (cause) {
      setErro(erroLegivel(cause));
    } finally {
      setCarregando(false);
      campoRef.current?.focus();
    }
  }

  async function enviarGravacao(audio: Blob) {
    setCarregando(true);
    setErro("");
    setErroAudio("");
    try {
      const idCiclo = lerIdRotaPositivo(cicloAtivo);
      const resultado = await enviarAudio({ audio, sessionId, cycleIds: idCiclo ? [idCiclo] : [], activeCycleId: idCiclo });
      setMensagens((atual) => [
        ...atual,
        { id: novoId(), role: "user", content: resultado.transcription, audioTranscription: true },
        { id: novoId(), role: "assistant", content: resultado.response },
      ]);
      void atualizarHistorico();
    } catch (cause) {
      setErroAudio(erroLegivel(cause));
    } finally {
      setCarregando(false);
      campoRef.current?.focus();
    }
  }

  async function alternarGravacaoAudio() {
    setErroAudio("");
    if (gravadorRef.current?.state === "recording") {
      gravadorRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErroAudio("A gravação de áudio não está disponível neste navegador.");
      return;
    }
    let stream: MediaStream | null = null;
    try {
      const fluxo = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream = fluxo;
      const preferencia = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((tipo) => MediaRecorder.isTypeSupported(tipo));
      const gravador = preferencia ? new MediaRecorder(fluxo, { mimeType: preferencia }) : new MediaRecorder(fluxo);
      const partes: BlobPart[] = [];
      streamAudioRef.current = fluxo;
      gravadorRef.current = gravador;
      gravador.ondataavailable = (evento) => { if (evento.data.size > 0) partes.push(evento.data); };
      gravador.onerror = () => {
        fluxo.getTracks().forEach((track) => track.stop());
        streamAudioRef.current = null;
        gravadorRef.current = null;
        setGravandoAudio(false);
        setErroAudio("Não foi possível gravar o áudio. Tente novamente.");
      };
      gravador.onstop = () => {
        const audio = new Blob(partes, { type: gravador.mimeType || "audio/webm" });
        fluxo.getTracks().forEach((track) => track.stop());
        streamAudioRef.current = null;
        gravadorRef.current = null;
        setGravandoAudio(false);
        if (audio.size > 0) void enviarGravacao(audio);
        else setErroAudio("Nenhum áudio foi gravado.");
      };
      gravador.start();
      setGravandoAudio(true);
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      streamAudioRef.current = null;
      gravadorRef.current = null;
      setGravandoAudio(false);
      setErroAudio("Permita o acesso ao microfone para gravar uma pergunta.");
    }
  }

  async function abrirConversa(conversa: CatoChat) {
    setErro("");
    setCarregando(true);
    try {
      setMensagens(await listarMensagens(conversa.sessionId));
      setSessionId(conversa.sessionId);
    } catch (cause) {
      setErro(erroLegivel(cause));
    } finally { setCarregando(false); }
  }

  async function novaConversa() {
    setErro("");
    let id = "";
    try { id = await criarNovaConversa(sessionId); } catch { /* Uma nova sessão local ainda permite iniciar outra conversa. */ }
    setSessionId(id || novoId());
    setMensagens([]);
    setTexto("");
    campoRef.current?.focus();
  }

  return (
    <main className="pagina-cato">
      <Sidebar />
      <div className="cato_painel">
        <header className="cato_cabecalho">
          <span className="cato_cabecalho_avatar" aria-hidden="true"><img src={mascoteCato} alt="" /></span>
          <div><h1>Cato AI</h1><p>Seu parceiro em cada etapa do PDCA</p></div>
          <span className="cato_cabecalho_selo"><i aria-hidden="true" /> Assistente ACTA</span>
        </header>
        <div className={`cato_corpo${historicoAberto ? "" : " cato_corpo--historico-recolhido"}`}>
          {!historicoAberto && <button ref={reabrirHistoricoRef} className="cato_historico_reabrir" type="button" onClick={() => setHistoricoAberto(true)} aria-expanded="false" aria-controls="cato-historico"><span aria-hidden="true">☰</span><span>Conversas</span></button>}
          <aside className={`cato_historico${historicoAberto ? "" : " cato_historico--recolhido"}`} id="cato-historico" aria-label="Histórico de conversas" aria-hidden={!historicoAberto} inert={!historicoAberto}>
            <div className="cato_historico_titulo"><h2>Conversas</h2><button type="button" onClick={() => setHistoricoAberto(false)} aria-label="Fechar histórico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button></div>
            <button className="cato_nova" type="button" onClick={() => void novaConversa()}>＋ Nova conversa</button>
            <label htmlFor="dad-pages-cato-paginacato-index-260-13" className="cato_busca"><span className="sr-only">Buscar conversas</span><span aria-hidden="true">⌕</span><input id="dad-pages-cato-paginacato-index-260-13" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar conversas" /></label>
            <p className="cato_rotulo">SUAS CONVERSAS</p>
            <ul>{conversas.filter((conversa) => conversa.title.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))).map((conversa) => <li key={conversa.sessionId}><button type="button" className={sessionId === conversa.sessionId ? "ativo" : ""} onClick={() => void abrirConversa(conversa)}>{conversa.title}<small>{conversa.updatedAt || "Conversa anterior"}</small></button></li>)}</ul>
            {conversas.length === 0 && <p className="cato_historico_vazio">Suas conversas aparecerão aqui.</p>}
            <Link className="cato_perfil" to="/perfil" aria-label={`Abrir perfil de ${nomeCompleto}`}>
              <span className="cato_perfil_avatar" aria-hidden="true">{fotoPerfil ? <img src={fotoPerfil} alt="" onError={() => setFotoPerfilFalhou(true)} /> : <span>{iniciais}</span>}</span>
              <span className="cato_perfil_dados"><strong>{nomeCompleto}</strong><small>{cargo} · ACTA</small></span>
              <span className="cato_perfil_seta" aria-hidden="true">›</span>
            </Link>
          </aside>

          <section className="cato_conversa" aria-label="Conversa com o Cato">
            <div className="cato_contexto" onKeyDown={navegarOpcoesCiclo} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCicloMenuAberto(false); }}>
              <img src={iconeCiclo} alt="" />
              <div className="cato_contexto_selecao">
                <span className="cato_contexto_rotulo" id="cato-ciclo-label">CICLO DA CONVERSA</span>
                <button ref={cicloTriggerRef} className="cato_contexto_valor" type="button" aria-labelledby="cato-ciclo-label cato-ciclo-valor" aria-haspopup="listbox" aria-expanded={cicloMenuAberto} aria-controls="cato-ciclo-opcoes" aria-describedby={erroCiclos ? "cato-ciclos-erro" : undefined} onClick={abrirSeletorCiclo} disabled={carregandoCiclos || ciclos.length === 0}>
                  <span id="cato-ciclo-valor">{cicloAtivo ? ciclos.find((ciclo) => String(ciclo.id) === cicloAtivo)?.title || "Ciclo selecionado" : "Todos os ciclos"}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9 12 15 18 9" /></svg>
                </button>
                {carregandoCiclos && <CarregandoConteudo compacto mensagem="Carregando ciclos" />}
                {cicloMenuAberto && <div className="cato_contexto_opcoes" id="cato-ciclo-opcoes" role="listbox" aria-labelledby="cato-ciclo-label">
                  <button ref={(node) => { cicloOpcaoRefs.current[0] = node; }} className="cato_contexto_opcao" type="button" role="option" aria-selected={!cicloAtivo} tabIndex={cicloSelecionadoIndex === 0 ? 0 : -1} onClick={() => selecionarCiclo("")}>Todos os ciclos</button>
                  {ciclos.map((ciclo, index) => <button ref={(node) => { cicloOpcaoRefs.current[index + 1] = node; }} className="cato_contexto_opcao" type="button" role="option" aria-selected={String(ciclo.id) === cicloAtivo} tabIndex={cicloSelecionadoIndex === index + 1 ? 0 : -1} key={ciclo.id} onClick={() => selecionarCiclo(String(ciclo.id))}><span>{ciclo.title}</span>{ciclo.status && <small>{ciclo.status}</small>}</button>)}
                </div>}
              </div>
            </div>
            {erroCiclos && <p className="cato_ciclos_erro" id="cato-ciclos-erro" role="status">{erroCiclos}</p>}
            <div className="cato_mensagens" ref={mensagensRef} aria-live="polite" aria-relevant="additions text">
              {mensagens.length === 0 ? <div className="cato_inicio">
                <img className="cato_mascote" src={mascoteCato} alt="" />
                <p className="cato_ola">{saudacao}</p><h2>Como posso ajudar?</h2>
                <p className="cato_descricao">Do planejamento à próxima melhoria, conte comigo para cuidar do seu ciclo.</p>
                <div className="cato_sugestoes">{sugestoes.map((sugestao) => <button type="button" key={sugestao.titulo} onClick={() => void enviar(undefined, sugestao.titulo)}><span className="cato_sugestao_mais" aria-hidden="true">＋</span><strong>{sugestao.titulo}</strong><small>{sugestao.detalhe}</small></button>)}</div>
                <p className="cato_comecar">Escreva ou toque no microfone para começar</p>
              </div> : <ol className="cato_lista_mensagens">{mensagens.map((mensagem) => <li className={`cato_mensagem cato_mensagem--${mensagem.role}${mensagem.audioTranscription ? " cato_mensagem--audio" : ""}`} key={mensagem.id}>
                <div className="cato_mensagem_conteudo">
                  <span className="cato_autor">{mensagem.role === "user" ? mensagem.audioTranscription ? "Transcrição do áudio" : "Você" : "Cato"}</span>
                  <p>{mensagem.audioTranscription ? `“${mensagem.content}”` : mensagem.content}</p>
                </div>
                <span className={`cato_mensagem_avatar${mensagem.role === "assistant" ? " cato_mensagem_avatar--cato" : ""}`} aria-hidden="true">
                  {mensagem.role === "assistant" ? <img src={mascoteCato} alt="" /> : fotoPerfil ? <img src={fotoPerfil} alt="" onError={() => setFotoPerfilFalhou(true)} /> : <span>{iniciais}</span>}
                </span>
              </li>)}</ol>}
              {carregando && <CarregandoConteudo compacto mensagem="O Cato está pensando" />}
              {erro && <div className="cato_erro" role="alert"><p>{erro}</p><button type="button" onClick={() => void enviar(undefined, [...mensagens].reverse().find((m) => m.role === "user")?.content)}>Tentar novamente</button></div>}
              {erroAudio && <p className="cato_audio_erro" role="alert">{erroAudio}</p>}
              {gravandoAudio && <p className="cato_gravando" role="status">Gravando… toque no microfone novamente para encerrar.</p>}
            </div>
            <form className="cato_compositor" onSubmit={(event) => void enviar(event)}>
              <div className="cato_compositor_linha">
                <label className="sr-only" htmlFor="cato-mensagem">Pergunte algo ao Cato</label>
                <textarea ref={campoRef} id="cato-mensagem" value={texto} onChange={(event) => setTexto(event.target.value)} placeholder="Pergunte algo ao Cato…" rows={1} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void enviar(); } }} />
                <button className={`cato_microfone${gravandoAudio ? " cato_microfone--gravando" : ""}`} type="button" disabled={carregando && !gravandoAudio} onClick={() => void alternarGravacaoAudio()} aria-label={gravandoAudio ? "Encerrar gravação de áudio" : "Gravar pergunta por áudio"} title={gravandoAudio ? "Encerrar gravação" : "Gravar áudio"}><img src={iconeMicrofone} alt="" /></button>
                <button className="cato_enviar" type="submit" disabled={!texto.trim() || carregando || gravandoAudio} aria-label="Enviar mensagem"><img src={iconeEnviar} alt="" /></button>
              </div>
            </form>
            <p className="cato_aviso">O Cato pode cometer erros. Verifique as informações.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

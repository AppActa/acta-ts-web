import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError } from "../../../services/http/client";
import { atualizarFormularioActMongo, criarFormularioActMongo, listarFormulariosMongo, listarRespostasFormularioMongo, enviarRespostaFormularioMongo } from "../../../services/api/mongo/dashboard.read.api";
import { listarUsuariosDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import type { FormularioMongo, PerguntaFormularioMongo, RespostaFormularioMongo, RespostaPerguntaMongo } from "../../../types/mongo";
import type { UsuarioDoCicloPg } from "../../../types/pdca";

type PerguntaNova = Omit<PerguntaFormularioMongo, "id">;
type DadosFormulario = { titulo: string; descricao: string; perguntas: PerguntaNova[]; idsUsuariosDestinatarios: number[] };

function mensagemApi(erro: unknown, recurso: string): string {
  if (erro instanceof ApiError) {
    if (erro.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
    if (erro.status === 403) return "Sua conta não tem permissão para esta operação.";
    if (erro.status === 409) return "Este usuário já enviou uma resposta para este checklist.";
    if (erro.status === 400 || erro.status === 422) return erro.mensagens.join(" ") || `Confira os dados de ${recurso}.`;
  }
  return `Não foi possível concluir ${recurso}. Recarregue a tela para conferir o estado salvo.`;
}

function FormularioEditor({ tipo, usuarios, inicial, ocupado, aoSalvar, aoCancelar }: {
  tipo: "PADRONIZACAO" | "CHECKLIST";
  usuarios: UsuarioDoCicloPg[];
  inicial?: FormularioMongo;
  ocupado: boolean;
  aoSalvar: (dados: DadosFormulario) => void;
  aoCancelar?: () => void;
}) {
  const [perguntas, setPerguntas] = useState<PerguntaNova[]>(() => inicial?.perguntas.map(({ id: _id, ...pergunta }) => pergunta) ?? (tipo === "CHECKLIST" ? [{ titulo: "O padrão está sendo seguido?", tipo: "SIM_NAO", obrigatoria: true, opcoes: [] }] : []));
  const [destinatarios, setDestinatarios] = useState<number[]>(() => inicial?.idsUsuariosDestinatarios ?? []);
  const [erro, setErro] = useState("");

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const titulo = String(dados.get("titulo") ?? "").trim();
    const descricao = String(dados.get("descricao") ?? "").trim();
    if (!titulo || !descricao) { setErro("Informe o título e a descrição."); return; }
    if (tipo === "CHECKLIST" && (perguntas.length === 0 || perguntas.some(({ titulo: pergunta }) => !pergunta.trim()))) { setErro("Inclua pelo menos uma pergunta de auditoria."); return; }
    aoSalvar({ titulo, descricao, perguntas, idsUsuariosDestinatarios: tipo === "CHECKLIST" ? destinatarios : [] });
  }

  return <form className="act-workflow_form" onSubmit={enviar}>
    <label>Título<input name="titulo" required maxLength={160} defaultValue={inicial?.titulo ?? ""} disabled={ocupado} /></label>
    <label>{tipo === "PADRONIZACAO" ? "Conteúdo do padrão" : "Orientações para o auditor"}<textarea name="descricao" required maxLength={1000} rows={4} defaultValue={inicial?.descricao ?? ""} disabled={ocupado} /></label>
    {tipo === "CHECKLIST" && <>
      <fieldset className="act-workflow_grupo"><legend>Itens do checklist</legend>
        {perguntas.map((pergunta, indice) => <div className="act-workflow_pergunta" key={inicial?.perguntas[indice]?.id ?? indice}>
          <label>Pergunta {indice + 1}<input value={pergunta.titulo} maxLength={240} required disabled={ocupado} onChange={(evento) => setPerguntas((atuais) => atuais.map((item, i) => i === indice ? { ...item, titulo: evento.target.value } : item))} /></label>
          <label>Tipo<select value={pergunta.tipo} disabled={ocupado} onChange={(evento) => setPerguntas((atuais) => atuais.map((item, i) => i === indice ? { ...item, tipo: evento.target.value as PerguntaNova["tipo"] } : item))}><option value="SIM_NAO">Sim / não</option><option value="TEXTO">Texto</option></select></label>
          <label className="act-workflow_obrigatoria"><input type="checkbox" checked={pergunta.obrigatoria} disabled={ocupado} onChange={(evento) => setPerguntas((atuais) => atuais.map((item, i) => i === indice ? { ...item, obrigatoria: evento.target.checked } : item))} />Resposta obrigatória</label>
          <button type="button" className="act-workflow_secundario" disabled={ocupado || perguntas.length <= 1} onClick={() => setPerguntas((atuais) => atuais.filter((_, i) => i !== indice))}>Remover pergunta</button>
        </div>)}
        <button type="button" className="act-workflow_secundario" disabled={ocupado} onClick={() => setPerguntas((atuais) => [...atuais, { titulo: "", tipo: "SIM_NAO", obrigatoria: true, opcoes: [] }])}>Adicionar pergunta</button>
      </fieldset>
      <fieldset className="act-workflow_grupo"><legend>Auditores autorizados</legend>
        <p>Sem seleção, qualquer usuário da empresa poderá responder, conforme a regra da API.</p>
        {usuarios.length === 0 ? <p>Nenhum participante listado para este ciclo.</p> : usuarios.map((usuario) => <label className="act-workflow_opcao" key={usuario.idUsuario}><input type="checkbox" checked={destinatarios.includes(usuario.idUsuario)} disabled={ocupado} onChange={(evento) => setDestinatarios((atuais) => evento.target.checked ? [...atuais, usuario.idUsuario] : atuais.filter((id) => id !== usuario.idUsuario))} />{usuario.nomeUsuario}</label>)}
      </fieldset>
    </>}
    {erro && <p className="act-workflow_erro" role="alert">{erro}</p>}
    <div className="act-workflow_botoes"><button type="submit" disabled={ocupado}>{ocupado ? "Salvando…" : inicial ? "Salvar alterações" : "Salvar rascunho"}</button>{aoCancelar && <button type="button" className="act-workflow_secundario" disabled={ocupado} onClick={aoCancelar}>Cancelar</button>}</div>
  </form>;
}

function AuditoriaAtiva({ formulario, idUsuario, empresaId, cicloId, usuarios, signal, aoAtualizar }: {
  formulario: FormularioMongo; idUsuario: number; empresaId: number; cicloId: number; usuarios: UsuarioDoCicloPg[]; signal: AbortSignal; aoAtualizar: () => void;
}) {
  const [respostas, setRespostas] = useState<RespostaFormularioMongo[] | null>(null);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const trava = useRef(false);
  const minhaResposta = respostas?.find((resposta) => resposta.idUsuario === idUsuario);
  const podeResponder = formulario.status === "ATIVO" && (!formulario.idsUsuariosDestinatarios.length || formulario.idsUsuariosDestinatarios.includes(idUsuario));

  const carregarRespostas = useCallback(async () => {
    try {
      const lista = await listarRespostasFormularioMongo(formulario.id, signal);
      if (lista.some((item) => item.idFormulario !== formulario.id || item.idEmpresa !== empresaId || item.idCiclo !== cicloId)) throw new Error("invalid response scope");
      if (!signal.aborted) { setRespostas(lista); setErro(""); }
    } catch {
      if (!signal.aborted) setErro("Não foi possível carregar as respostas desta auditoria.");
    }
  }, [cicloId, empresaId, formulario.id, signal]);
  useEffect(() => { void carregarRespostas(); }, [carregarRespostas]);

  async function responder(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeResponder || respostas === null || minhaResposta || ocupado || incerto || trava.current) return;
    const form = evento.currentTarget;
    const dados = new FormData(form);
    const envio = formulario.perguntas.map((pergunta) => {
      const valor = String(dados.get(pergunta.id) ?? "");
      return { idPergunta: pergunta.id, resposta: valor === "" ? "" : pergunta.tipo === "SIM_NAO" ? valor === "SIM" : valor } as RespostaPerguntaMongo;
    }).filter(({ idPergunta, resposta }) => formulario.perguntas.find((item) => item.id === idPergunta)?.obrigatoria || resposta !== "");
    if (envio.some(({ resposta }) => resposta === "")) { setErro("Responda todos os itens obrigatórios."); return; }
    trava.current = true; setOcupado(true); setErro("");
    try {
      const criada = await enviarRespostaFormularioMongo(formulario.id, envio, signal);
      if (criada.idEmpresa !== empresaId || criada.idCiclo !== cicloId || criada.idFormulario !== formulario.id || criada.idUsuario !== idUsuario) throw new Error("invalid response scope");
      await carregarRespostas();
      aoAtualizar();
    } catch (cause) {
      if (signal.aborted) return;
      if (cause instanceof ApiError && cause.status === 409) { setErro("Esta conta já enviou uma resposta. Atualize as respostas para conferir o registro."); void carregarRespostas(); }
      else { setIncerto(true); setErro(mensagemApi(cause, "o envio da auditoria")); }
    } finally { if (!signal.aborted) { trava.current = false; setOcupado(false); } }
  }

  return <details className="act-workflow_auditoria">
    <summary>{formulario.titulo} · {respostas === null ? "carregando respostas" : `${respostas.length} resposta(s)`}</summary>
    <p>{formulario.descricao}</p>
    {erro && <p className="act-workflow_erro" role="alert">{erro}</p>}
    {podeResponder && respostas !== null && !minhaResposta && <form className="act-workflow_form" onSubmit={(evento) => void responder(evento)}>
      <h4>Registrar verificação</h4>
      {formulario.perguntas.map((pergunta) => <label key={pergunta.id}>{pergunta.titulo}{pergunta.obrigatoria ? " *" : " (opcional)"}
        {pergunta.tipo === "SIM_NAO" ? <select name={pergunta.id} required={pergunta.obrigatoria} defaultValue=""><option value="">Selecione</option><option value="SIM">Sim</option><option value="NAO">Não</option></select> : <textarea name={pergunta.id} required={pergunta.obrigatoria} maxLength={1000} />}
      </label>)}
      <button type="submit" disabled={ocupado || incerto || respostas === null}>{ocupado ? "Enviando…" : "Enviar verificação"}</button>
    </form>}
    {minhaResposta && <p className="act-workflow_sucesso" role="status">Sua verificação foi registrada em {new Date(minhaResposta.respondidoEm).toLocaleString("pt-BR")}.</p>}
    {formulario.status !== "ATIVO" && <p>Esta auditoria foi encerrada e não aceita novas respostas.</p>}
    {formulario.status === "ATIVO" && !podeResponder && <p>Esta conta não está entre os auditores autorizados.</p>}
    {respostas?.map((resposta) => <details className="act-workflow_resposta" key={resposta.id}><summary>{usuarios.find((usuario) => usuario.idUsuario === resposta.idUsuario)?.nomeUsuario ?? "Auditor"} · {new Date(resposta.respondidoEm).toLocaleString("pt-BR")}</summary><ul>{formulario.perguntas.map((pergunta) => {
      const valor = resposta.respostas.find((item) => item.idPergunta === pergunta.id)?.resposta;
      const texto = typeof valor === "boolean" ? (valor ? "Sim" : "Não") : Array.isArray(valor) ? valor.join(", ") : String(valor ?? "Sem resposta");
      return <li key={pergunta.id}><strong>{pergunta.titulo}:</strong> {texto}</li>;
    })}</ul></details>)}
  </details>;
}

export function GestaoFormulariosAct({ cicloId, empresaId, idUsuario, podeGerenciar, aoSalvar }: { cicloId: number; empresaId: number; idUsuario: number; podeGerenciar: boolean; aoSalvar: () => void }) {
  const [formularios, setFormularios] = useState<FormularioMongo[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDoCicloPg[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [versao, setVersao] = useState(0);
  const trava = useRef(false);
  const controlador = useRef<AbortController | null>(null);
  const sinalReserva = useRef<AbortSignal | null>(null);
  if (!sinalReserva.current) sinalReserva.current = new AbortController().signal;
  const sinalAtual = sinalReserva.current as AbortSignal;

  useEffect(() => {
    const controller = new AbortController(); controlador.current = controller; sinalReserva.current = controller.signal;
    setCarregando(true); setErro("");
    void Promise.all([listarFormulariosMongo(cicloId, controller.signal), listarUsuariosDoCicloPg(cicloId, controller.signal)]).then(([lista, membros]) => {
      if (lista.some((item) => item.idEmpresa !== empresaId || item.idCiclo !== cicloId)) throw new Error("invalid cycle scope");
      if (!controller.signal.aborted) { setFormularios(lista); setUsuarios(membros); }
    }).catch(() => { if (!controller.signal.aborted) setErro("Não foi possível carregar padrões, checklists ou participantes do ciclo."); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => { controller.abort(); controlador.current = null; };
  }, [cicloId, empresaId, versao]);

  async function salvar(tipo: "PADRONIZACAO" | "CHECKLIST", dados: DadosFormulario, existente?: FormularioMongo) {
    if (ocupado || carregando || erro || incerto || trava.current || !controlador.current || !podeGerenciar) return;
    const signal = controlador.current.signal; trava.current = true; setOcupado(true); setMensagem(""); setErro("");
    let confirmado = false;
    try {
      const salvo = existente
        ? await atualizarFormularioActMongo(existente.id, dados, signal)
        : await criarFormularioActMongo({ idCiclo: cicloId, idEmpresa: empresaId, tipo, ...dados }, signal);
      confirmado = true;
      const lista = await listarFormulariosMongo(cicloId, signal);
      if (!lista.some((item) => item.id === salvo.id && item.idEmpresa === empresaId && item.idCiclo === cicloId && item.tipo === tipo && item.titulo === dados.titulo)) throw new Error("readback mismatch");
      if (!signal.aborted) { setFormularios(lista); setEditando(null); setMensagem(existente ? "Rascunho atualizado." : tipo === "PADRONIZACAO" ? "Rascunho de padrão criado." : "Checklist de auditoria criado."); setVersao((atual) => atual + 1); aoSalvar(); }
    } catch (cause) {
      if (signal.aborted) return;
      if (confirmado || !(cause instanceof ApiError) || cause.status === 0 || cause.status >= 500) { setIncerto(true); setErro("Não foi possível confirmar o resultado. Recarregue a tela e confira a lista antes de repetir."); }
      else setErro(mensagemApi(cause, "o formulário"));
    } finally { if (!signal.aborted) { trava.current = false; setOcupado(false); } }
  }

  async function mudarStatus(formulario: FormularioMongo, status: "ATIVO" | "INATIVO") {
    if (!podeGerenciar || carregando || erro || ocupado || incerto || trava.current || !controlador.current) return;
    if (status === "ATIVO" && formulario.tipo === "CHECKLIST" && formulario.perguntas.length === 0) { setErro("Inclua pelo menos uma pergunta antes de publicar o checklist."); return; }
    const signal = controlador.current.signal; trava.current = true; setOcupado(true); setErro(""); setMensagem("");
    let confirmado = false;
    try {
      const salvo = await atualizarFormularioActMongo(formulario.id, { status }, signal); confirmado = true;
      const lista = await listarFormulariosMongo(cicloId, signal);
      if (!lista.some((item) => item.id === salvo.id && item.status === status && item.idCiclo === cicloId && item.idEmpresa === empresaId)) throw new Error("readback mismatch");
      if (!signal.aborted) { setFormularios(lista); setMensagem(status === "ATIVO" ? "Formulário publicado." : "Formulário inativado; novas respostas foram encerradas."); setVersao((atual) => atual + 1); aoSalvar(); }
    } catch (cause) {
      if (signal.aborted) return;
      if (confirmado || !(cause instanceof ApiError) || cause.status === 0 || cause.status >= 500) { setIncerto(true); setErro("Não foi possível confirmar a mudança. Recarregue a tela antes de tentar novamente."); }
      else setErro(mensagemApi(cause, "a mudança de status"));
    } finally { if (!signal.aborted) { trava.current = false; setOcupado(false); } }
  }

  const padroes = formularios.filter((item) => item.tipo === "PADRONIZACAO");
  const checklists = formularios.filter((item) => item.tipo === "CHECKLIST");
  const aoAtualizar = () => setVersao((atual) => atual + 1);
  return <section className="act-workflow" aria-labelledby="act-workflow-titulo" aria-busy={carregando || ocupado}>
    <header><h2 id="act-workflow-titulo">Padrões e auditorias</h2><p>Crie padrões, publique checklists e registre verificações reais no ciclo.</p></header>
    {carregando && <p role="status">Carregando registros do ciclo…</p>}
    {erro && <p className="act-workflow_erro" role="alert">{erro}</p>}
    {mensagem && <p className="act-workflow_sucesso" role="status">{mensagem}</p>}
    {!carregando && !erro && formularios.length === 0 && <p>Nenhum padrão ou checklist registrado neste ciclo.</p>}
    <div className="act-workflow_secao"><h3>Padrões de trabalho</h3>
      {padroes.length === 0 ? <p>Nenhum padrão registrado.</p> : <ul className="act-workflow_lista">{padroes.map((formulario) => <li key={formulario.id}>
        {editando === formulario.id ? <FormularioEditor key={formulario.id} tipo="PADRONIZACAO" usuarios={usuarios} inicial={formulario} ocupado={ocupado || carregando || Boolean(erro)} aoSalvar={(dados) => void salvar("PADRONIZACAO", dados, formulario)} aoCancelar={() => setEditando(null)} /> : <>
          <div className="act-workflow_cabecalho"><div><h4>{formulario.titulo}</h4><span className={`act-workflow_status act-workflow_status-${formulario.status.toLowerCase()}`}>{formulario.status === "RASCUNHO" ? "Rascunho" : formulario.status === "ATIVO" ? "Publicado" : "Inativo"}</span></div>
          {podeGerenciar && formulario.status === "RASCUNHO" && <button type="button" className="act-workflow_secundario" disabled={ocupado || carregando || Boolean(erro) || incerto} onClick={() => setEditando(formulario.id)}>Editar</button>}
          {podeGerenciar && formulario.status === "RASCUNHO" && <button type="button" disabled={ocupado || carregando || Boolean(erro) || incerto} onClick={() => void mudarStatus(formulario, "ATIVO")}>Publicar padrão</button>}
          {podeGerenciar && formulario.status === "ATIVO" && <button type="button" className="act-workflow_secundario" disabled={ocupado || carregando || Boolean(erro) || incerto} onClick={() => void mudarStatus(formulario, "INATIVO")}>Inativar</button>}
          </div><p>{formulario.descricao || "Sem descrição."}</p>
        </>}
      </li>)}</ul>}
      {podeGerenciar && <details className="act-workflow_criar"><summary>Criar padrão</summary><FormularioEditor tipo="PADRONIZACAO" usuarios={usuarios} ocupado={ocupado || carregando || Boolean(erro) || incerto} aoSalvar={(dados) => void salvar("PADRONIZACAO", dados)} />
      </details>}
    </div>
    <div className="act-workflow_secao"><h3>Auditorias do padrão</h3>
      {checklists.length === 0 ? <p>Nenhum checklist de auditoria registrado.</p> : <ul className="act-workflow_lista">{checklists.map((formulario) => <li key={formulario.id}>
        {editando === formulario.id ? <FormularioEditor key={formulario.id} tipo="CHECKLIST" usuarios={usuarios} inicial={formulario} ocupado={ocupado || carregando || Boolean(erro)} aoSalvar={(dados) => void salvar("CHECKLIST", dados, formulario)} aoCancelar={() => setEditando(null)} /> : <>
          <div className="act-workflow_cabecalho"><div><h4>{formulario.titulo}</h4><span className={`act-workflow_status act-workflow_status-${formulario.status.toLowerCase()}`}>{formulario.status === "RASCUNHO" ? "Rascunho" : formulario.status === "ATIVO" ? "Publicado" : "Inativo"}</span></div>
          {podeGerenciar && formulario.status === "RASCUNHO" && <button type="button" className="act-workflow_secundario" disabled={ocupado || carregando || Boolean(erro) || incerto} onClick={() => setEditando(formulario.id)}>Editar checklist</button>}
          {podeGerenciar && formulario.status === "RASCUNHO" && <button type="button" disabled={ocupado || carregando || Boolean(erro) || incerto || formulario.perguntas.length === 0} onClick={() => void mudarStatus(formulario, "ATIVO")}>Publicar checklist</button>}
          {podeGerenciar && formulario.status === "ATIVO" && <button type="button" className="act-workflow_secundario" disabled={ocupado || carregando || Boolean(erro) || incerto} onClick={() => void mudarStatus(formulario, "INATIVO")}>Encerrar respostas</button>}
          </div><p>{formulario.descricao || "Sem orientações."}</p><p>{formulario.perguntas.length} item(ns) · {formulario.idsUsuariosDestinatarios.length ? `${formulario.idsUsuariosDestinatarios.length} auditor(es) autorizado(s)` : "aberto aos usuários da empresa"}</p>
          {formulario.status !== "RASCUNHO" && <AuditoriaAtiva formulario={formulario} idUsuario={idUsuario} empresaId={empresaId} cicloId={cicloId} usuarios={usuarios} signal={sinalAtual} aoAtualizar={aoAtualizar} />}
        </>}
      </li>)}</ul>}
      {podeGerenciar && <details className="act-workflow_criar"><summary>Criar checklist de auditoria</summary><FormularioEditor tipo="CHECKLIST" usuarios={usuarios} ocupado={ocupado || carregando || Boolean(erro) || incerto} aoSalvar={(dados) => void salvar("CHECKLIST", dados)} />
      </details>}
      <p className="act-workflow_nota">O sistema registra as verificações enviadas. Agendamento, resultado consolidado de conformidade e gestão de não conformidades ainda não são fornecidos pela API.</p>
    </div>
  </section>;
}

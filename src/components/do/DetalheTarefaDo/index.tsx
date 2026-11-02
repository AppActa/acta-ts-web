import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { listarTarefasPorPlanoPg, type PrioridadeTarefaPg, type StatusTarefaPg, type TarefaDoPlanoPg } from "../../../services/api/pg/dashboard.read.api";
import { atualizarStatusTarefaPg, atualizarTarefaPg, PdcaWriteError, reatribuirTarefaPg } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import { CarregandoConteudo } from "../../layout/CarregandoConteudo";

export type DetalheTarefaDoProps = {
  tarefa: TarefaDoPlanoPg;
  nomePlano: string;
  tituloCiclo: string;
  acaoFechar: ReactNode;
  podeEditar: boolean;
  podeAlterarStatus: boolean;
  podeReatribuir: boolean;
  opcoesResponsaveis: readonly { id: number; nome: string }[];
  estadoResponsaveis: "carregando" | "indisponivel" | "erro" | "sucesso";
};

function rotuloStatus(status: TarefaDoPlanoPg["status"]): string {
  switch (status) {
    case "PENDENTE": return "Pendente";
    case "EM_ANDAMENTO": return "Em andamento";
    case "CONCLUIDA": return "Concluída";
    case "BLOQUEADA": return "Bloqueada";
    case "ATRASADA": return "Atrasada";
    case "CANCELADA": return "Cancelada";
    default: return "Status desconhecido";
  }
}

export function DetalheTarefaDo({ tarefa: inicial, nomePlano, tituloCiclo, acaoFechar, podeEditar, podeAlterarStatus, podeReatribuir, opcoesResponsaveis, estadoResponsaveis }: DetalheTarefaDoProps) {
  const id = useId();
  const [tarefa, setTarefa] = useState(inicial);
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(inicial.titulo);
  const [descricao, setDescricao] = useState(inicial.descricao ?? "");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefaPg | "">(inicial.prioridade ?? "");
  const dataIso = (v: string | null) => v && /^\d{2}\/\d{2}\/\d{4}$/.test(v) ? `${v.slice(6)}-${v.slice(3, 5)}-${v.slice(0, 2)}` : v ?? "";
  const [prazo, setPrazo] = useState(dataIso(inicial.dataFimPrevista));
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusTarefaPg | "">("");
  const [novoResponsavel, setNovoResponsavel] = useState("");
  const controller = useRef<AbortController | null>(null);
  const trava = useRef(false);
  useEffect(() => { const c = new AbortController(); controller.current = c; return () => c.abort(); }, [inicial.id]);
  const transicoes: Partial<Record<StatusTarefaPg, StatusTarefaPg[]>> = {
    PENDENTE: ["EM_ANDAMENTO", "CANCELADA"], BLOQUEADA: ["EM_ANDAMENTO", "CANCELADA"],
    EM_ANDAMENTO: ["BLOQUEADA", "CONCLUIDA", "CANCELADA"], ATRASADA: ["EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"],
  };
  const opcoesStatus = transicoes[tarefa.status] ?? [];
  async function salvarResponsavel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const novoId = Number(novoResponsavel);
    if (!podeReatribuir || ["CONCLUIDA", "CANCELADA"].includes(tarefa.status) || trava.current || incerto || !controller.current
      || !opcoesResponsaveis.some(item => item.id === novoId) || novoId === tarefa.idResponsavel) return;
    trava.current = true; setEnviando(true); setMensagem("");
    const signal = controller.current.signal;
    try {
      await reatribuirTarefaPg(tarefa.id, tarefa.idPlanoAcao, novoId, signal);
      const lista = await listarTarefasPorPlanoPg(tarefa.idPlanoAcao, signal);
      const salva = lista.find(item => item.id === tarefa.id && item.idPlanoAcao === tarefa.idPlanoAcao && item.idResponsavel === novoId);
      if (!salva) throw new Error("readback");
      if (!signal.aborted) { setTarefa(salva); setNovoResponsavel(""); setMensagem("Responsável alterado e confirmado."); }
    } catch (erro) {
      if (signal.aborted) return;
      if (erro instanceof ApiError && [400, 401, 403, 409, 422].includes(erro.status)) setMensagem("O servidor não permitiu a reatribuição. Confira a tarefa, o responsável e suas permissões.");
      else { setIncerto(true); setMensagem("Não foi possível confirmar o responsável. Volte ao quadro e confira a tarefa antes de tentar novamente."); }
    } finally { if (!signal.aborted) { trava.current = false; setEnviando(false); } }
  }
  async function salvarStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!podeAlterarStatus || trava.current || incerto || !controller.current || !novoStatus || !opcoesStatus.includes(novoStatus)) return;
    trava.current = true; setEnviando(true); setMensagem("");
    const signal = controller.current.signal;
    const agora = new Date();
    const data = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    try {
      await atualizarStatusTarefaPg(tarefa.id, tarefa.idPlanoAcao, novoStatus, data, signal);
      const lista = await listarTarefasPorPlanoPg(tarefa.idPlanoAcao, signal);
      const salva = lista.find(item => item.id === tarefa.id && item.idPlanoAcao === tarefa.idPlanoAcao && item.status === novoStatus);
      if (!salva) throw new Error("readback");
      if (!signal.aborted) { setTarefa(salva); setNovoStatus(""); setMensagem("Status alterado e confirmado."); }
    } catch (erro) {
      if (signal.aborted) return;
      if (erro instanceof ApiError && [400, 401, 403, 409, 422].includes(erro.status)) setMensagem("O servidor não permitiu a alteração. Verifique suas permissões e os requisitos da tarefa.");
      else { setIncerto(true); setMensagem("Não foi possível confirmar o status. Volte ao quadro e confira a tarefa antes de tentar novamente."); }
    } finally { if (!signal.aborted) { trava.current = false; setEnviando(false); } }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!podeEditar || trava.current || incerto || !controller.current || !prioridade) return;
    const dados = { titulo: titulo.trim(), descricao: descricao.trim(), prioridade, dataFimPrevista: prazo };
    if (!dados.titulo || !dados.descricao || !prazo) { setMensagem("Preencha todos os campos."); return; }
    trava.current = true; setEnviando(true); setMensagem("");
    const signal = controller.current.signal;
    try {
      await atualizarTarefaPg(tarefa.id, tarefa.idPlanoAcao, dados, signal);
      const lista = await listarTarefasPorPlanoPg(tarefa.idPlanoAcao, signal);
      const salva = lista.find(item => item.id === tarefa.id && item.idPlanoAcao === tarefa.idPlanoAcao);
      if (!salva || salva.titulo !== dados.titulo || salva.descricao !== dados.descricao || salva.prioridade !== dados.prioridade || dataIso(salva.dataFimPrevista) !== prazo) throw new Error("readback");
      if (!signal.aborted) { setTarefa(salva); setEditando(false); setMensagem("Alterações salvas e confirmadas."); }
    } catch (erro) {
      if (signal.aborted) return;
      if (erro instanceof PdcaWriteError && erro.code === "INVALID_INPUT") setMensagem("Verifique os campos e informe um prazo futuro.");
      else if (erro instanceof ApiError && [400, 401, 403, 409, 422].includes(erro.status)) setMensagem("Não foi possível salvar. Verifique os dados, o prazo e suas permissões.");
      else { setIncerto(true); setMensagem("Não foi possível confirmar o salvamento. Volte ao quadro e confira a tarefa antes de tentar novamente."); }
    } finally { if (!signal.aborted) { trava.current = false; setEnviando(false); } }
  }
  return (
    <section className="detalhe-tarefa-do_modal" aria-labelledby={`${id}-titulo`}>
      <div className="detalhe-tarefa-do_fechar">{acaoFechar}</div>
      <h1 className="detalhe-tarefa-do_titulo" id={`${id}-titulo`}>Detalhes da tarefa</h1>
      <h2 className="detalhe-tarefa-do_nome">{tarefa.titulo}</h2>
      <p className="detalhe-tarefa-do_vinculo">Ação vinculada ao plano de ação do ciclo.</p>
      {editando && <form className="detalhe-tarefa-do_edicao" onSubmit={salvar}>
        <label>Título<input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={160} required disabled={enviando || incerto} /></label>
        <label>Descrição<textarea value={descricao} onChange={e => setDescricao(e.target.value)} maxLength={1000} required disabled={enviando || incerto} /></label>
        <label>Prioridade<select value={prioridade} onChange={e => setPrioridade(e.target.value as PrioridadeTarefaPg)} required disabled={enviando || incerto}><option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></label>
        <label>Prazo<input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} required disabled={enviando || incerto} /></label>
        <button type="submit" disabled={enviando || incerto}>{enviando ? "Salvando..." : "Salvar alterações"}</button>
        <button type="button" disabled={enviando || incerto} onClick={() => { setTitulo(tarefa.titulo); setDescricao(tarefa.descricao ?? ""); setPrioridade(tarefa.prioridade ?? ""); setPrazo(dataIso(tarefa.dataFimPrevista)); setEditando(false); setMensagem(""); }}>Cancelar</button>
        {mensagem && <p role="alert">{mensagem}</p>}
      </form>}
      <dl className="detalhe-tarefa-do_campos">
        <div className="detalhe-tarefa-do_campo"><dt>Status</dt><dd data-estado={tarefa.status}>{rotuloStatus(tarefa.status)}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Responsável</dt><dd>{tarefa.nomeResponsavel?.trim() || "Não informado"}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Prazo</dt><dd>{tarefa.dataFimPrevista ?? "Não informado"}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Plano de ação</dt><dd>{nomePlano || "Indisponível"}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Ciclo</dt><dd>{tituloCiclo}</dd></div>
        <div className="detalhe-tarefa-do_campo detalhe-tarefa-do_descricao"><dt>Descrição</dt><dd>{tarefa.descricao?.trim() || "Não informado"}</dd></div>
      </dl>
      <aside className="detalhe-tarefa-do_vinculos" aria-label="Vínculos da tarefa">
        <h2>Vínculos da tarefa</h2>
        <p>Plano de ação: {nomePlano || "Indisponível"}</p>
        <p>Ciclo: {tituloCiclo}</p>
        {podeEditar && !["CONCLUIDA", "CANCELADA"].includes(tarefa.status) && !editando && !incerto && <button type="button" onClick={() => { setMensagem(""); setEditando(true); }}>Editar tarefa</button>}
        {podeAlterarStatus && !editando && opcoesStatus.length > 0 && <form className="detalhe-tarefa-do_status-form" onSubmit={salvarStatus}>
          <label htmlFor={`${id}-status`}>Alterar status</label>
          <select id={`${id}-status`} value={novoStatus} onChange={e => setNovoStatus(e.target.value as StatusTarefaPg)} disabled={enviando || incerto} required>
            <option value="">Selecione</option>{opcoesStatus.map(status => <option key={status} value={status}>{rotuloStatus(status)}</option>)}
          </select>
          {(novoStatus === "EM_ANDAMENTO" || novoStatus === "CONCLUIDA") && <p>A data de {novoStatus === "EM_ANDAMENTO" ? "início" : "conclusão"} será a de hoje.</p>}
          <button type="submit" disabled={enviando || incerto || !novoStatus}>{enviando ? "Salvando..." : "Salvar status"}</button>
        </form>}
        {podeReatribuir && !editando && !["CONCLUIDA", "CANCELADA"].includes(tarefa.status) && <form className="detalhe-tarefa-do_status-form" onSubmit={salvarResponsavel}>
          <label htmlFor={`${id}-responsavel`}>Alterar responsável</label>
          {estadoResponsaveis === "carregando" && <CarregandoConteudo compacto mensagem="Carregando responsáveis" />}
          {(estadoResponsaveis === "erro" || estadoResponsaveis === "indisponivel") && <p role="alert">Não foi possível carregar os responsáveis.</p>}
          {estadoResponsaveis === "sucesso" && <><select id={`${id}-responsavel`} value={novoResponsavel} onChange={e => setNovoResponsavel(e.target.value)} disabled={enviando || incerto} required>
            <option value="">Selecione</option>{opcoesResponsaveis.filter(item => item.id !== tarefa.idResponsavel).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
          <button type="submit" disabled={enviando || incerto || !novoResponsavel}>{enviando ? "Salvando..." : "Salvar responsável"}</button></>}
        </form>}
        {!editando && mensagem && <p role="status">{mensagem}</p>}
      </aside>
    </section>
  );
}

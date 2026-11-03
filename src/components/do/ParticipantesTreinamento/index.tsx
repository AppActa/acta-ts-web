import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { listarTreinamentosPorCicloPg, listarUsuariosDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { adicionarParticipanteTreinamentoPg, alterarParticipanteTreinamentoPg, removerParticipanteTreinamentoPg } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import type { TreinamentoPg, UsuarioDoCicloPg } from "../../../types/pdca";

type Status = "CONFIRMADO" | "CONCLUIDO" | "DISPENSADO" | "CANCELADO";
export function ParticipantesTreinamento({ treinamento, idEmpresa, cicloAberto }: { treinamento: TreinamentoPg; idEmpresa: number; cicloAberto: boolean }) {
  const { firebaseUser, actaUser } = useAuth();
  const permitido = Boolean(firebaseUser?.emailVerified && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && actaUser.idEmpresa === idEmpresa && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR") && cicloAberto);
  const [participantes, setParticipantes] = useState(treinamento.participantes);
  const [usuarios, setUsuarios] = useState<UsuarioDoCicloPg[] | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [erroUsuarios, setErroUsuarios] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const trava = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const c = new AbortController(); controller.current = c;
    void listarUsuariosDoCicloPg(treinamento.idCiclo, c.signal).then((lista) => { if (!c.signal.aborted) setUsuarios(lista); }).catch(() => { if (!c.signal.aborted) setErroUsuarios(true); });
    return () => { c.abort(); controller.current = null; };
  }, [treinamento.id, treinamento.idCiclo]);
  const disponiveis = usuarios?.filter((u) => !participantes.some((p) => p.idUsuario === u.idUsuario)) ?? [];
  async function executar(operacao: (signal: AbortSignal) => Promise<void>, verificar: (t: TreinamentoPg) => boolean) {
    if (!permitido || trava.current || incerto || !controller.current) return;
    const sinal = controller.current.signal; trava.current = true; setEnviando(true); setMensagem("");
    let enviado = false;
    try {
      await operacao(sinal); enviado = true;
      const lista = await listarTreinamentosPorCicloPg(treinamento.idCiclo, sinal);
      const atualizado = lista.find((t) => t.id === treinamento.id && t.idCiclo === treinamento.idCiclo);
      if (!atualizado || !verificar(atualizado)) throw new Error();
      if (!sinal.aborted) { setParticipantes(atualizado.participantes); setUsuarioSelecionado(""); }
    } catch (erro) {
      if (sinal.aborted) return;
      if (enviado || !(erro instanceof ApiError) || erro.status === 0 || erro.status >= 500 || (erro.status >= 200 && erro.status < 300)) {
        setIncerto(true); setMensagem("Não foi possível confirmar a operação. Recarregue a página antes de tentar novamente.");
      } else setMensagem(erro.status === 403 ? "Sua conta não tem permissão para esta ação." : "O servidor não aceitou a operação. Confira os dados e o estado do treinamento.");
    } finally { if (!sinal.aborted) { trava.current = false; setEnviando(false); } }
  }
  function adicionar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const dados = new FormData(e.currentTarget); const id = Number(dados.get("usuario")); const obrigatorio = dados.has("obrigatorio");
    if (!disponiveis.some((u) => u.idUsuario === id)) return;
    void executar((signal) => adicionarParticipanteTreinamentoPg(treinamento.id, id, obrigatorio, signal), (t) => t.participantes.some((p) => p.idUsuario === id && p.obrigatorio === obrigatorio && p.status === "PENDENTE"));
  }
  function alterar(id: number, status: Status) { void executar((signal) => alterarParticipanteTreinamentoPg(treinamento.id, id, status, signal), (t) => t.participantes.some((p) => p.idUsuario === id && p.status === status)); }
  const desabilitado = !permitido || enviando || incerto;
  return <section className="treinamento-equipe"><h3>Participantes</h3>
    {participantes.length ? <ul>{participantes.map((p) => <li key={p.idUsuario}>{p.nomeUsuario} · {p.status.toLocaleLowerCase("pt-BR")} · {p.obrigatorio ? "obrigatório" : "opcional"}
      {p.status === "PENDENTE" && <button disabled={desabilitado} onClick={() => alterar(p.idUsuario, "CONFIRMADO")}>Confirmar</button>}
      {(p.status === "PENDENTE" || p.status === "CONFIRMADO") && <><button disabled={desabilitado} onClick={() => alterar(p.idUsuario, "CONCLUIDO")}>Concluir</button><button disabled={desabilitado} onClick={() => alterar(p.idUsuario, "CANCELADO")}>Cancelar participação</button></>}
      {p.status === "PENDENTE" && <button disabled={desabilitado} onClick={() => alterar(p.idUsuario, "DISPENSADO")}>Dispensar</button>}
      {p.status !== "CONCLUIDO" && <button disabled={desabilitado} onClick={() => { if (window.confirm(`Remover ${p.nomeUsuario} deste treinamento?`)) void executar((signal) => removerParticipanteTreinamentoPg(treinamento.id, p.idUsuario, signal), (t) => !t.participantes.some((item) => item.idUsuario === p.idUsuario)); }}>Remover</button>}</li>)}</ul> : <p>Nenhum participante cadastrado.</p>}
    {erroUsuarios ? <p role="alert">Não foi possível carregar as pessoas do ciclo.</p> : usuarios === null ? <p role="status">Carregando pessoas do ciclo...</p> : <form onSubmit={adicionar}><label>Pessoa do ciclo <select name="usuario" required value={usuarioSelecionado} onChange={(event) => setUsuarioSelecionado(event.target.value)} disabled={desabilitado || !disponiveis.length}><option value="" disabled>Selecione</option>{disponiveis.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nomeUsuario}</option>)}</select></label><label><input name="obrigatorio" type="checkbox" disabled={desabilitado} /> Participação obrigatória</label><button disabled={desabilitado || !disponiveis.length || !usuarioSelecionado}>Adicionar participante</button></form>}
    {mensagem && <p role="alert">{mensagem}</p>}
  </section>;
}

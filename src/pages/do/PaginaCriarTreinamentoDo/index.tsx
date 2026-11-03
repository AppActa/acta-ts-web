import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useAuth } from "../../../components/auth/AuthProvider";
import { useOpcoesCriarTarefaDo } from "../../../features/do/hooks/useOpcoesCriarTarefaDo";
import { criarTreinamentoPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { listarTreinamentosPorCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { ApiError } from "../../../services/http/client";
import "../../../../features/do/styles/pagina-criar-treinamento-do.css";

export function PaginaCriarTreinamentoDo() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const navigate = useNavigate();
  const ciclo = resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo : null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const elegivel = Boolean(firebaseUser?.emailVerified && ciclo && idEmpresa === ciclo.idEmpresa
    && (actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR") && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO");
  const opcoes = useOpcoesCriarTarefaDo({ uid: elegivel ? firebaseUser?.uid ?? null : null, idEmpresa: elegivel ? idEmpresa : null, idCiclo: elegivel ? ciclo?.id ?? null : null, habilitado: elegivel });
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [validado, setValidado] = useState(false);
  const [data, setData] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [obrigatorio, setObrigatorio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const trava = useRef(false);
  const controlador = useRef<AbortController | null>(null);
  useEffect(() => { const c = new AbortController(); controlador.current = c; return () => c.abort(); }, [ciclo?.id, firebaseUser?.uid]);
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setValidado(true);
    const idResponsavel = Number(responsavel);
    if (!ciclo || !elegivel || opcoes.estado !== "sucesso" || trava.current || incerto || !controlador.current) return;
    if (!opcoes.responsaveis.some(p => p.id === idResponsavel) || !titulo.trim() || !descricao.trim() || !data) { setMensagem("Preencha título, descrição, responsável e data."); return; }
    trava.current = true; setEnviando(true); setMensagem("");
    const signal = controlador.current.signal;
    const dados = { titulo: titulo.trim(), descricao: descricao.trim(), dataTreinamento: data, obrigatorio, idResponsavel };
    void (async () => {
      try {
        const id = await criarTreinamentoPg(ciclo.id, dados, signal);
        const treinamentos = await listarTreinamentosPorCicloPg(ciclo.id, signal);
        const dataResposta = (v: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(v) ? `${v.slice(6)}-${v.slice(3,5)}-${v.slice(0,2)}` : v;
        if (!treinamentos.some(t => t.id === id && t.titulo === dados.titulo && t.descricao === dados.descricao && t.idResponsavel === idResponsavel && t.obrigatorio === obrigatorio && dataResposta(t.dataTreinamento) === data)) throw new Error("readback");
        if (!signal.aborted) navigate(`/do/ciclo/${ciclo.id}/treinamentos/${id}`);
      } catch (error) {
        if (signal.aborted) return;
        if (error instanceof PdcaWriteError && error.code === "INVALID_INPUT") setMensagem("Revise os campos e informe uma data de hoje ou posterior.");
        else if (error instanceof ApiError && [400, 401, 403, 409, 422].includes(error.status)) setMensagem("O servidor recusou o cadastro. Confira os dados e suas permissões.");
        else { setIncerto(true); setMensagem("Não foi possível confirmar o cadastro. Confira a lista antes de tentar novamente."); }
      } finally { if (!signal.aborted) { trava.current = false; setEnviando(false); } }
    })();
  }

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-criar-treinamento-do">
        <section className="criar-treinamento_modal" role={carregando ? "status" : "alert"} aria-live="polite">
          <h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
          {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="pagina-criar-treinamento-do">
      <section className="criar-treinamento_modal" aria-labelledby="criar-treinamento_titulo">
        <form className="criar-treinamento_formulario" noValidate onSubmit={enviar}>
          <Link className="criar-treinamento_fechar" to={`/do/ciclo/${cicloId}/treinamentos`} aria-label={incerto ? "Conferir treinamentos" : "Fechar"} aria-disabled={enviando}
            onClick={e => { if (enviando) e.preventDefault(); }}>×</Link>
          <h1 id="criar-treinamento_titulo">Criar treinamento</h1>
          <label className="criar-treinamento_campo criar-treinamento_campo-titulo">Título<input type="text" name="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} aria-invalid={validado && !titulo.trim()} disabled={enviando || incerto} maxLength={160} />{validado && !titulo.trim() && <span className="treinamento_validacao">Informe o título.</span>}</label>
          <label className="criar-treinamento_campo criar-treinamento_campo-descricao">Descrição<textarea name="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} aria-invalid={validado && !descricao.trim()} disabled={enviando || incerto} maxLength={1000} />{validado && !descricao.trim() && <span className="treinamento_validacao">Informe a descrição.</span>}</label>
          <div className="criar-treinamento_dupla">
            <label className="criar-treinamento_campo">Responsável<select value={responsavel} onChange={e => setResponsavel(e.target.value)} disabled={opcoes.estado !== "sucesso" || enviando || incerto}><option value="">Selecione</option>{opcoes.estado === "sucesso" && opcoes.responsaveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
            <label className="criar-treinamento_campo">Data do treinamento<input type="date" name="dataInicio" value={data} onChange={e => setData(e.target.value)} disabled={enviando || incerto} /></label>
          </div>
          <label><input type="checkbox" checked={obrigatorio} onChange={e => setObrigatorio(e.target.checked)} disabled={enviando || incerto} /> Treinamento obrigatório</label>
          <p>Após criar o treinamento, adicione os participantes na página de detalhes.</p>
          <p>O envio de material ainda não está disponível.</p>
          {opcoes.estado === "erro" && <p role="alert">Não foi possível carregar os responsáveis.</p>}
          {!elegivel && <p role="status">Cadastro disponível para administradores e gestores em ciclos abertos.</p>}
          {mensagem && <p role="alert">{mensagem}</p>}
          <button className="criar-treinamento_concluido" type="submit" disabled={!elegivel || enviando || incerto || opcoes.estado !== "sucesso"}>{enviando ? "Salvando..." : "Concluído"}</button>
        </form>
      </section>
    </main>
  );
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { listarCausasRaizPorCicloPg, listarMetasPorCicloPg, listarPlanosPorCicloPg, listarUsuariosDoCicloPg, obterPlano5W2HPg, type CausaRaizPg, type MetaPg, type PlanoAcaoPg, type Plano5W2HPg, type UsuarioDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { atualizarDescricaoCausaPg, atualizarMetaPg, atualizarNomePlanoPg, atualizarPlano5W2HPg, PdcaWriteError, type NovoPlano5W2HPg } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import { ModalErroPlan } from "../components/ModalErroPlan";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

type Tipo = "causa" | "meta" | "plano";
type Registro = CausaRaizPg | MetaPg | PlanoAcaoPg;
type Dados5W = { estado: "carregando" | "erro" | "vazio" } | { estado: "pronto"; plano: Plano5W2HPg; usuarios: UsuarioDoCicloPg[] };
const dataInput = (valor: string | null) => !valor ? "" : valor.includes("/") ? valor.split("/").reverse().join("-") : valor;
function Editor({ cicloId, registroId, tipo, cicloAberto }: { cicloId: number; registroId: number; tipo: Tipo; cicloAberto: boolean }) {
  const [resultado, setResultado] = useState<{ estado: "carregando" | "erro"; registro?: never } | { estado: "pronto"; registro: Registro }>({ estado: "carregando" });
  const { actaUser } = useAuth();
  const navegar = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dados5w, setDados5w] = useState<Dados5W>({ estado: "carregando" });
  const enviandoRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const autorizado = cicloAberto && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR");
  useEffect(() => { const controller = new AbortController(); controllerRef.current = controller; return () => { controller.abort(); controllerRef.current = null; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setResultado({ estado: "carregando" });
    const requisicao: Promise<Registro[]> = tipo === "causa" ? listarCausasRaizPorCicloPg(cicloId, controller.signal) : tipo === "meta" ? listarMetasPorCicloPg(cicloId, controller.signal) : listarPlanosPorCicloPg(cicloId, controller.signal);
    void requisicao.then((registros) => {
      if (registros.some((item) => item.idCiclo !== cicloId)) throw new Error("Associação inválida");
      const registro = registros.find((item) => item.id === registroId);
      if (!registro) throw new Error("Registro não encontrado");
      if (!controller.signal.aborted) setResultado({ estado: "pronto", registro });
    }).catch(() => { if (!controller.signal.aborted) setResultado({ estado: "erro" }); });
    return () => controller.abort();
  }, [cicloId, registroId, tipo]);
  useEffect(() => {
    if (tipo !== "plano" || resultado.estado !== "pronto") return;
    const controller = new AbortController();
    setDados5w({ estado: "carregando" });
    void obterPlano5W2HPg(registroId, controller.signal).then(async (plano) => {
      if (controller.signal.aborted) return;
      if (!plano) { setDados5w({ estado: "vazio" }); return; }
      const usuarios = await listarUsuariosDoCicloPg(cicloId, controller.signal);
      if (!controller.signal.aborted) setDados5w({ estado: "pronto", plano, usuarios });
    }).catch(() => { if (!controller.signal.aborted) setDados5w({ estado: "erro" }); });
    return () => controller.abort();
  }, [cicloId, registroId, tipo, resultado]);
  const voltar = `/do/ciclo/${cicloId}/plan/${tipo === "causa" ? "causas" : tipo === "meta" ? "metas" : "planos"}`;
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!autorizado || incerto || enviandoRef.current || !controllerRef.current) return;
    const campos = new FormData(evento.currentTarget);
    const descricao = String(campos.get("descricao") ?? "").trim();
    const objetivo = String(campos.get("objetivo") ?? "").trim();
    const nome = String(campos.get("nome") ?? "").trim();
    const alvoTexto = String(campos.get("valorAlvo") ?? "").trim();
    const valorAlvo = alvoTexto ? Number(alvoTexto) : null;
    let dadosPlano: NovoPlano5W2HPg | null = null;
    if (tipo === "causa" && (!descricao || descricao.length > 1000)) { setErro("Informe uma descrição de até 1.000 caracteres."); return; }
    if (tipo === "plano" && (!nome || nome.length > 160)) { setErro("Informe o nome do plano com até 160 caracteres."); return; }
    if (tipo === "meta" && (!objetivo || objetivo.length > 1000 || (valorAlvo !== null && (!Number.isFinite(valorAlvo) || valorAlvo <= 0 || valorAlvo >= 1e13 || Math.abs(valorAlvo * 100 - Math.round(valorAlvo * 100)) > 1e-7)))) { setErro("Informe um objetivo e, se preenchido, um valor alvo positivo com até duas casas decimais."); return; }
    if (tipo === "meta" && resultado.estado === "pronto" && (resultado.registro as MetaPg).valorAlvo !== null && valorAlvo === null) { setErro("O valor alvo não pode ser removido nesta edição."); return; }
    if (tipo === "plano" && dados5w.estado === "pronto") {
      const texto = (campo: string) => String(campos.get(campo) ?? "").trim();
      const inicio = texto("inicio"), fim = texto("fim"), custoTexto = texto("custo"), custo = Number(custoTexto), responsavel = Number(texto("responsavel"));
      const textos = [texto("oQue"), texto("porQue"), texto("onde"), texto("como")];
      if (dados5w.plano.whenInicio && !inicio) { setErro("A data de início não pode ser removida nesta edição."); return; }
      if (textos.some((v) => !v || v.length > 1000) || !fim || (inicio && inicio > fim) || !custoTexto || !Number.isFinite(custo) || custo < 0 || custo >= 1e10 || Math.abs(custo * 100 - Math.round(custo * 100)) > 1e-7 || !dados5w.usuarios.some((p) => p.idUsuario === responsavel)) { setErro("Confira os campos, as datas, o custo e o responsável do ciclo."); return; }
      dadosPlano = { whatAcao: textos[0], whyJustificativa: textos[1], whereLocal: textos[2], howModoExecucao: textos[3], whenInicio: inicio || null, whenFim: fim, howMuchCusto: custo, idWhoResponsavel: responsavel };
    }
    const sinal = controllerRef.current.signal;
    enviandoRef.current = true; setEnviando(true); setErro(null);
    void (async () => {
      let nomeAtualizado = false;
      try {
        if (tipo === "causa") {
          await atualizarDescricaoCausaPg(registroId, cicloId, descricao, sinal);
          const causas = await listarCausasRaizPorCicloPg(cicloId, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
          if (sinal.aborted) return;
          if (!causas.some((item) => item.id === registroId && item.idCiclo === cicloId && item.descricao === descricao)) throw new PdcaWriteError("INVALID_RESPONSE");
        } else if (tipo === "meta") {
          await atualizarMetaPg(registroId, cicloId, objetivo, valorAlvo, sinal);
          const metas = await listarMetasPorCicloPg(cicloId, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
          if (sinal.aborted) return;
          if (!metas.some((item) => item.id === registroId && item.idCiclo === cicloId && item.objetivo === objetivo && (valorAlvo === null || item.valorAlvo === valorAlvo))) throw new PdcaWriteError("INVALID_RESPONSE");
        } else {
          if (resultado.estado === "pronto" && nome !== (resultado.registro as PlanoAcaoPg).nome) { await atualizarNomePlanoPg(registroId, cicloId, nome, sinal); nomeAtualizado = true; }
          if (dadosPlano && dados5w.estado === "pronto") {
            await atualizarPlano5W2HPg(dados5w.plano.id, registroId, dadosPlano, sinal);
            const confirmado = await obterPlano5W2HPg(registroId, sinal);
            if (!confirmado || confirmado.id !== dados5w.plano.id || confirmado.whatAcao !== dadosPlano.whatAcao || confirmado.whyJustificativa !== dadosPlano.whyJustificativa || confirmado.whereLocal !== dadosPlano.whereLocal || confirmado.howModoExecucao !== dadosPlano.howModoExecucao || dataInput(confirmado.whenInicio) !== (dadosPlano.whenInicio ?? "") || dataInput(confirmado.whenFim) !== dadosPlano.whenFim || confirmado.idWhoResponsavel !== dadosPlano.idWhoResponsavel || confirmado.howMuchCusto !== dadosPlano.howMuchCusto) throw new PdcaWriteError("INVALID_RESPONSE");
          }
          const planos = await listarPlanosPorCicloPg(cicloId, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
          if (sinal.aborted) return;
          if (!planos.some((item) => item.id === registroId && item.idCiclo === cicloId && item.nome === nome)) throw new PdcaWriteError("INVALID_RESPONSE");
        }
        navegar(voltar, { replace: true });
      } catch (falha) {
        if (sinal.aborted) return;
        if (nomeAtualizado) { setIncerto(true); setErro("O nome foi alterado, mas não foi possível confirmar o 5W2H. Volte à lista e confira os dados antes de tentar novamente."); }
        else if (!(falha instanceof ApiError) || falha.status === 0 || falha.status === 408 || falha.status >= 500 || (falha.status >= 200 && falha.status < 300)) { setIncerto(true); setErro("Não foi possível confirmar a alteração. Volte à lista e confira o registro antes de tentar novamente."); }
        else if (falha.status === 403) setErro("O servidor não autorizou esta alteração.");
        else if (falha.status === 401) setErro("A sessão não foi aceita. Entre novamente e tente outra vez.");
        else setErro("Não foi possível salvar as alterações. Confira os dados e o estado do ciclo.");
      } finally { if (!sinal.aborted) { enviandoRef.current = false; setEnviando(false); } }
    })();
  }
  if (resultado.estado !== "pronto") return <section className="plan-criar-problema_estado" role={resultado.estado === "erro" ? "alert" : "status"}><p>{resultado.estado === "carregando" ? "Carregando dados..." : "Registro não encontrado ou indisponível."}</p><Link to={voltar}>Voltar</Link></section>;
  const registro = resultado.registro;
  const meta = tipo === "meta" ? registro as MetaPg : null;
  const causa = tipo === "causa" ? registro as CausaRaizPg : null;
  const plano = tipo === "plano" ? registro as PlanoAcaoPg : null;
  return <><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="plan-editar-registro-titulo">
    <aside className="plan-criar-problema_banner" aria-label="ACTA"><div className="plan-criar-problema_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div></aside>
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="plan-editar-registro-titulo">Editar {tipo === "plano" ? "plano de ação" : tipo}</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={salvar}>
        {causa && <><label>Categoria 6M<input value="Não informada nesta causa raiz" readOnly /></label><label>Descrição *<input name="descricao" defaultValue={causa.descricao} maxLength={1000} required disabled={enviando || incerto} /></label></>}
        {meta && <><label>Objetivo *<input name="objetivo" defaultValue={meta.objetivo} maxLength={1000} required disabled={enviando || incerto} /></label><label>Valor base<input type="number" step="any" value={meta.valorBase ?? ""} readOnly /></label><label>Valor alvo<input name="valorAlvo" type="number" min="0.01" step="0.01" defaultValue={meta.valorAlvo ?? ""} disabled={enviando || incerto} /></label><label>Unidade<input value={meta.unidadeMedida ?? ""} readOnly /></label><label>Prazo<input value={meta.prazo ?? ""} placeholder="Não informado" readOnly /></label><label>Prioridade<input placeholder="Não informada" readOnly /></label><label>Responsáveis<input placeholder="Não informados" readOnly /></label><label>Área / categoria<input placeholder="Não informada" readOnly /></label></>}
        {plano && <><label>Nome do plano *<input name="nome" defaultValue={plano.nome} maxLength={160} required disabled={enviando || incerto} /></label>
          {dados5w.estado === "pronto" ? <>
            <label>O quê? *<input name="oQue" defaultValue={dados5w.plano.whatAcao} maxLength={1000} required disabled={enviando || incerto} /></label>
            <label>Por quê? *<input name="porQue" defaultValue={dados5w.plano.whyJustificativa} maxLength={1000} required disabled={enviando || incerto} /></label>
            <label>Onde? *<input name="onde" defaultValue={dados5w.plano.whereLocal} maxLength={1000} required disabled={enviando || incerto} /></label>
            <label>Como? *<input name="como" defaultValue={dados5w.plano.howModoExecucao} maxLength={1000} required disabled={enviando || incerto} /></label>
            <label>Quando? · início<input type="date" name="inicio" defaultValue={dataInput(dados5w.plano.whenInicio)} disabled={enviando || incerto} /></label>
            <label>Quando? · término *<input type="date" name="fim" defaultValue={dataInput(dados5w.plano.whenFim)} required disabled={enviando || incerto} /></label>
            <label>Quem? *<select name="responsavel" defaultValue={String(dados5w.plano.idWhoResponsavel)} required disabled={enviando || incerto}><option value="">Selecione um responsável</option>{dados5w.usuarios.map((p) => <option key={p.idUsuario} value={p.idUsuario}>{p.nomeUsuario}</option>)}</select></label>
            <label>Quanto custa? *<input type="number" min="0" step="0.01" name="custo" defaultValue={dados5w.plano.howMuchCusto} required disabled={enviando || incerto} /></label>
          </> : <p className="plan-editar-problema_aviso" role={dados5w.estado === "erro" ? "alert" : "status"}>{dados5w.estado === "carregando" ? "Carregando 5W2H..." : dados5w.estado === "vazio" ? "Este plano não possui 5W2H para editar." : "Não foi possível carregar o 5W2H."}</p>}
        </>}
        {tipo === "meta" && <p className="plan-editar-problema_aviso">Nesta tela, é possível alterar o objetivo e o valor alvo. Os demais campos estão em consulta.</p>}
        {tipo === "plano" && <p className="plan-editar-problema_aviso">As alterações do nome e do 5W2H são enviadas separadamente.</p>}
        {!autorizado && <p className="plan-editar-problema_aviso" role="status">A edição está disponível para gestores e administradores em ciclos ativos.</p>}
        <div className="plan-editar-problema_acoes"><Link to={voltar} onClick={(evento) => { if (enviando) evento.preventDefault(); }}>Cancelar</Link><button type="submit" disabled={!autorizado || enviando || incerto || (tipo === "plano" && (dados5w.estado === "carregando" || dados5w.estado === "erro"))}>{enviando ? "Salvando..." : "Salvar alterações"}</button></div>
      </form>
    </div>
  </section>{erro && <ModalErroPlan titulo={incerto ? "Não foi possível confirmar a alteração" : "Não foi possível salvar as alterações"} mensagem={erro} aoFechar={() => setErro(null)} />}</>;
}

export function PaginaPlanEditarRegistro({ tipo }: { tipo: Tipo }) {
  const { cicloId, registroId } = useParams(); const ciclo = useCicloDaConta(cicloId); const id = Number(registroId);
  return <main className="plan-criar-problema">{ciclo.estado === "sucesso" && Number.isSafeInteger(id) && id > 0 ? <Editor key={`${ciclo.ciclo.id}:${id}:${tipo}`} cicloId={ciclo.ciclo.id} registroId={id} tipo={tipo} cicloAberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} /> : <section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo ou registro indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section>}</main>;
}

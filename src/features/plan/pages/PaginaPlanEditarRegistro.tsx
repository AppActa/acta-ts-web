import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { listarCausasRaizPorCicloPg, listarMetasPorCicloPg, listarPlanosPorCicloPg, type CausaRaizPg, type MetaPg, type PlanoAcaoPg } from "../../../services/api/pg/dashboard.read.api";
import { atualizarDescricaoCausaPg, atualizarMetaPg, atualizarNomePlanoPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import { ModalErroPlan } from "../components/ModalErroPlan";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

type Tipo = "causa" | "meta" | "plano";
type Registro = CausaRaizPg | MetaPg | PlanoAcaoPg;
function Editor({ cicloId, registroId, tipo, cicloAberto }: { cicloId: number; registroId: number; tipo: Tipo; cicloAberto: boolean }) {
  const [resultado, setResultado] = useState<{ estado: "carregando" | "erro"; registro?: never } | { estado: "pronto"; registro: Registro }>({ estado: "carregando" });
  const { actaUser } = useAuth();
  const navegar = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
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
    if (tipo === "causa" && (!descricao || descricao.length > 1000)) { setErro("Informe uma descrição de até 1.000 caracteres."); return; }
    if (tipo === "plano" && (!nome || nome.length > 160)) { setErro("Informe o nome do plano com até 160 caracteres."); return; }
    if (tipo === "meta" && (!objetivo || objetivo.length > 1000 || (valorAlvo !== null && (!Number.isFinite(valorAlvo) || valorAlvo <= 0 || valorAlvo >= 1e13 || Math.abs(valorAlvo * 100 - Math.round(valorAlvo * 100)) > 1e-7)))) { setErro("Informe um objetivo e, se preenchido, um valor alvo positivo com até duas casas decimais."); return; }
    if (tipo === "meta" && resultado.estado === "pronto" && (resultado.registro as MetaPg).valorAlvo !== null && valorAlvo === null) { setErro("O valor alvo não pode ser removido nesta edição."); return; }
    const sinal = controllerRef.current.signal;
    enviandoRef.current = true; setEnviando(true); setErro(null);
    void (async () => {
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
          await atualizarNomePlanoPg(registroId, cicloId, nome, sinal);
          const planos = await listarPlanosPorCicloPg(cicloId, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
          if (sinal.aborted) return;
          if (!planos.some((item) => item.id === registroId && item.idCiclo === cicloId && item.nome === nome)) throw new PdcaWriteError("INVALID_RESPONSE");
        }
        navegar(voltar, { replace: true });
      } catch (falha) {
        if (sinal.aborted) return;
        if (!(falha instanceof ApiError) || falha.status === 0 || falha.status === 408 || falha.status >= 500 || (falha.status >= 200 && falha.status < 300)) { setIncerto(true); setErro("Não foi possível confirmar a alteração. Volte à lista e confira o registro antes de tentar novamente."); }
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
        {plano && <><label>Nome do plano *<input name="nome" defaultValue={plano.nome} maxLength={160} required disabled={enviando || incerto} /></label><label>O quê?<input placeholder="Indisponível" readOnly /></label><label>Por quê?<input placeholder="Indisponível" readOnly /></label><label>Onde?<input placeholder="Indisponível" readOnly /></label><label>Como?<input placeholder="Indisponível" readOnly /></label><label>Quando? · início<input placeholder="Indisponível" readOnly /></label><label>Quando? · término<input placeholder="Indisponível" readOnly /></label><label>Quem?<input placeholder="Indisponível" readOnly /></label><label>Quanto custa?<input placeholder="Indisponível" readOnly /></label></>}
        {tipo === "meta" && <p className="plan-editar-problema_aviso">Nesta tela, é possível alterar o objetivo e o valor alvo. Os demais campos estão em consulta.</p>}
        {tipo === "plano" && <p className="plan-editar-problema_aviso">Nesta tela, é possível alterar o nome do plano. Os dados 5W2H ainda não estão disponíveis para edição.</p>}
        {!autorizado && <p className="plan-editar-problema_aviso" role="status">A edição está disponível para gestores e administradores em ciclos ativos.</p>}
        <div className="plan-editar-problema_acoes"><Link to={voltar} onClick={(evento) => { if (enviando) evento.preventDefault(); }}>Cancelar</Link><button type="submit" disabled={!autorizado || enviando || incerto}>{enviando ? "Salvando..." : "Salvar alterações"}</button></div>
      </form>
    </div>
  </section>{erro && <ModalErroPlan titulo={incerto ? "Não foi possível confirmar a alteração" : "Não foi possível salvar as alterações"} mensagem={erro} aoFechar={() => setErro(null)} />}</>;
}

export function PaginaPlanEditarRegistro({ tipo }: { tipo: Tipo }) {
  const { cicloId, registroId } = useParams(); const ciclo = useCicloDaConta(cicloId); const id = Number(registroId);
  return <main className="plan-criar-problema">{ciclo.estado === "sucesso" && Number.isSafeInteger(id) && id > 0 ? <Editor key={`${ciclo.ciclo.id}:${id}:${tipo}`} cicloId={ciclo.ciclo.id} registroId={id} tipo={tipo} cicloAberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} /> : <section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo ou registro indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section>}</main>;
}

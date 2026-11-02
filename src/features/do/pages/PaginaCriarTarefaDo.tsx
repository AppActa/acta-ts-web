import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { ApiError } from "../../../services/http/client";
import { confirmarTarefaPorPlanoPg } from "../../../services/api/pg/dashboard.read.api";
import { criarTarefaPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { FormularioCriarTarefaDo, type DadosEnvioCriarTarefaDo, type FeedbackCriarTarefaDo } from "../components/FormularioCriarTarefaDo";
import { useOpcoesCriarTarefaDo } from "../hooks/useOpcoesCriarTarefaDo";
import { ModalErroPlan } from "../../plan/components/ModalErroPlan";
import estrelaSucesso from "../assets/treinamento-sucesso-estrela.svg";
import checkSucesso from "../assets/treinamento-sucesso-check.svg";
import "../styles/pagina-criar-tarefa-do.css";

export function PaginaCriarTarefaDo() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const ciclo = resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo : null;
  const identidadeValida = Boolean(firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0 && ciclo && ciclo.idEmpresa === idEmpresa);
  const roleValida = actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR";
  const cicloAberto = ciclo !== null && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO";
  const elegivel = Boolean(!authLoading && identidadeValida && roleValida && cicloAberto);
  const opcoes = useOpcoesCriarTarefaDo({
    uid: elegivel ? firebaseUser?.uid ?? null : null,
    idEmpresa: elegivel ? idEmpresa : null,
    idCiclo: elegivel ? ciclo?.id ?? null : null,
    habilitado: elegivel,
  });
  const chave = JSON.stringify([firebaseUser?.uid ?? null, idEmpresa ?? null, ciclo?.id ?? null]);
  const controllerRef = useRef<AbortController | null>(null);
  const enviandoRef = useRef(false);
  const resultadoIncertoRef = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [resultadoIncerto, setResultadoIncerto] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackCriarTarefaDo>(null);
  const [tarefaCriada, setTarefaCriada] = useState<number | null>(null);
  const planos = opcoes.estado === "sucesso" ? opcoes.planos : [];
  const responsaveis = opcoes.estado === "sucesso" ? opcoes.responsaveis : [];
  const podeEnviar = Boolean(elegivel && !resultadoIncerto && opcoes.estado === "sucesso" && planos.length > 0 && responsaveis.length > 0);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    enviandoRef.current = false;
    resultadoIncertoRef.current = false;
    setEnviando(false);
    setResultadoIncerto(false);
    setFeedback(null);
    setTarefaCriada(null);
    return () => {
      controller.abort();
      if (controllerRef.current === controller) controllerRef.current = null;
      enviandoRef.current = false;
    };
  }, [chave]);

  const avisarResultadoIncerto = (mensagem: string) => {
    resultadoIncertoRef.current = true;
    setResultadoIncerto(true);
    setFeedback({ tipo: "aviso", mensagem });
  };

  const enviar = (dados: DadosEnvioCriarTarefaDo) => {
    if (!ciclo || !podeEnviar || enviandoRef.current || resultadoIncertoRef.current) return;
    const plano = planos.find((item) => item.id === dados.idPlanoAcao && item.idCiclo === ciclo.id
      && (item.status === "APROVADO" || item.status === "EM_EXECUCAO"));
    const responsavel = responsaveis.find((item) => item.id === dados.idResponsavel);
    const controller = controllerRef.current;
    if (!plano || !responsavel || !controller || controller.signal.aborted) return;
    enviandoRef.current = true;
    setEnviando(true);
    setFeedback(null);
    void (async () => {
      try {
        const dadosTarefa = {
          titulo: dados.titulo,
          descricao: dados.descricao,
          prioridade: dados.prioridade,
          dataFimPrevista: dados.dataFimPrevista,
          idResponsavel: dados.idResponsavel,
        };
        const criada = await criarTarefaPg(plano.id, dadosTarefa, controller.signal);
        if (controller.signal.aborted) return;
        try {
          await confirmarTarefaPorPlanoPg(plano.id, {
            id: criada.id,
            titulo: criada.titulo,
            descricao: criada.descricao,
            prioridade: criada.prioridade,
            dataFimPrevista: criada.dataFimPrevista,
            idResponsavel: criada.idResponsavel,
          }, controller.signal);
        } catch {
          if (!controller.signal.aborted) avisarResultadoIncerto("A tarefa pode ter sido criada, mas não foi possível confirmar. Confira a lista antes de tentar novamente.");
          return;
        }
        if (controller.signal.aborted) return;
        setTarefaCriada(criada.id);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) setFeedback({ tipo: "erro", mensagem: "A sessão não foi aceita. Entre novamente e tente reenviar a tarefa." });
        else if (error instanceof ApiError && error.status === 403) setFeedback({ tipo: "erro", mensagem: "O servidor não autorizou esta ação. Confira o ciclo, o plano e as permissões da conta." });
        else if ((error instanceof ApiError && (error.status === 0 || error.status >= 500 || (error.status >= 200 && error.status < 300)))
          || (error instanceof PdcaWriteError && error.code === "INVALID_RESPONSE")) avisarResultadoIncerto("Não foi possível confirmar o resultado. A tarefa pode ter sido criada; confira a lista antes de tentar novamente.");
        else if (error instanceof ApiError && [400, 409, 422].includes(error.status)) setFeedback({ tipo: "erro", mensagem: "O servidor rejeitou os dados. Revise os campos, o plano e o prazo." });
        else if (error instanceof ApiError && error.status >= 400 && error.status < 500) avisarResultadoIncerto("Não foi possível confirmar o resultado. A tarefa pode ter sido criada; confira a lista antes de tentar novamente.");
        else setFeedback({ tipo: "erro", mensagem: "Não foi possível enviar a tarefa. Revise os dados e tente novamente." });
      } finally {
        if (!controller.signal.aborted) {
          enviandoRef.current = false;
          setEnviando(false);
        }
      }
    })();
  };

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    return <main className="do-criar-tarefa"><section className="criar-tarefa-do_estado" role={carregando ? "status" : "alert"} aria-live="polite">
      <h1>{carregando ? "Carregando ciclo" : resultadoCiclo.estado === "nao-encontrado" ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
      {!carregando && <p>{resultadoCiclo.estado === "nao-encontrado" ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
      <Link to="/ciclos">Voltar para ciclos</Link>
    </section></main>;
  }

  if (authLoading) return <main className="do-criar-tarefa"><section className="criar-tarefa-do_estado" role="status" aria-live="polite"><h1>Validando sessão e conta</h1><Link to="/ciclos">Voltar para ciclos</Link></section></main>;
  if (!identidadeValida || !ciclo) return <main className="do-criar-tarefa"><section className="criar-tarefa-do_estado" role="alert"><h1>Ciclo indisponível para esta conta</h1><Link to="/ciclos">Voltar para ciclos</Link></section></main>;
  const mensagemElegibilidade = !roleValida ? "A criação está disponível somente para contas ADMIN ou GESTOR."
    : !cicloAberto ? "Este ciclo não aceita novas tarefas neste estado."
      : undefined;
  const estadoOpcoes = opcoes.estado;

  return <main className="do-criar-tarefa">
    <FormularioCriarTarefaDo key={chave} planos={planos} responsaveis={responsaveis} estadoOpcoes={estadoOpcoes}
      podeEnviar={podeEnviar && tarefaCriada === null} enviando={enviando} feedback={feedback} mensagemElegibilidade={mensagemElegibilidade} onSubmit={enviar}
      acaoFechar={<Link to={`/do/ciclo/${ciclo.id}/tarefas`} aria-label={resultadoIncerto ? "Conferir tarefas" : "Fechar criação de tarefa"} aria-disabled={enviando}
        onClick={(event) => { if (enviando) event.preventDefault(); }}>{resultadoIncerto ? "Conferir tarefas" : "Fechar"}</Link>} />
    {feedback?.tipo === "erro" && <ModalErroPlan titulo="Não foi possível criar a tarefa" mensagem={feedback.mensagem} aoFechar={() => setFeedback(null)} />}
    {tarefaCriada !== null && <div className="do-tarefa-sucesso-fundo"><section className="do-tarefa-sucesso" role="dialog" aria-modal="true" aria-labelledby="do-tarefa-sucesso-titulo"><div className="do-tarefa-sucesso-icone" aria-hidden="true"><img src={estrelaSucesso} alt="" /><img src={checkSucesso} alt="" /></div><h2 id="do-tarefa-sucesso-titulo">Tarefa criada com sucesso!</h2><p>As informações foram salvas com sucesso.</p><button type="button" autoFocus onClick={() => navigate(`/do/ciclo/${ciclo.id}/tarefas/${tarefaCriada}`)}>Concluído</button></section></div>}
  </main>;
}

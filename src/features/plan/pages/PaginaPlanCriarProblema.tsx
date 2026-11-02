import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { ApiError } from "../../../services/http/client";
import { listarProblemasPorCicloPg, type ProblemaPg } from "../../../services/api/pg/dashboard.read.api";
import { criarProblemaPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { FormularioCriarProblema, type DadosEnvioCriarProblema, type FeedbackEnvioFormulario } from "../components/FormularioCriarProblema";
import { ModalErroPlan } from "../components/ModalErroPlan";
import "../styles/pagina-plan-criar-problema.css";

export function PaginaPlanCriarProblema() {
  const { cicloId } = useParams();
  const resultado = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const navigate = useNavigate();
  const ciclo = resultado.estado === "sucesso" ? resultado.ciclo : null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const identidadeValida = Boolean(firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0 && ciclo && ciclo.idEmpresa === idEmpresa);
  const chave = identidadeValida && firebaseUser?.uid && idEmpresa && ciclo ? JSON.stringify([firebaseUser.uid, idEmpresa, ciclo.id]) : null;
  const roleValida = actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR";
  const cicloAberto = ciclo !== null && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO";
  const controllerRef = useRef<AbortController | null>(null);
  const enviandoRef = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [envioIncerto, setEnvioIncerto] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackEnvioFormulario>(null);
  const podeEnviar = Boolean(identidadeValida && roleValida && cicloAberto && !envioIncerto);
  const avisarResultadoIncerto = (mensagem: string) => {
    setEnvioIncerto(true);
    setFeedback({ tipo: "aviso", mensagem });
  };

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    enviandoRef.current = false;
    setEnviando(false);
    setEnvioIncerto(false);
    setFeedback(null);
    return () => {
      controller.abort();
      if (controllerRef.current === controller) controllerRef.current = null;
      enviandoRef.current = false;
    };
  }, [chave]);

  const enviar = (dados: DadosEnvioCriarProblema) => {
    if (!ciclo || !podeEnviar || enviandoRef.current) return;
    const controller = controllerRef.current;
    if (!controller || controller.signal.aborted) return;
    enviandoRef.current = true;
    setEnviando(true);
    setFeedback(null);
    void (async () => {
      try {
        const criado = await criarProblemaPg(ciclo.id, dados, controller.signal);
        if (controller.signal.aborted) return;
        let problemas: ProblemaPg[];
        try {
          problemas = await listarProblemasPorCicloPg(ciclo.id, controller.signal);
        } catch {
          if (!controller.signal.aborted) avisarResultadoIncerto("O envio pode ter sido aceito, mas não foi possível confirmar o registro. Confira a lista antes de tentar novamente.");
          return;
        }
        if (controller.signal.aborted) return;
        const confirmado = problemas.find((item) => item.id === criado.id && item.idCiclo === ciclo.id
          && item.status === "ABERTO" && item.titulo === criado.titulo && item.descricao === criado.descricao
          && item.peso === criado.peso && item.origem === "MANUAL" && item.persistente === criado.persistente && item.idProblemaPai === null);
        if (!confirmado) {
          avisarResultadoIncerto("O envio pode ter sido aceito, mas não foi possível confirmar o registro. Confira a lista antes de tentar novamente.");
          return;
        }
        navigate(`/do/ciclo/${ciclo.id}/plan/identificacao-problema/lista`);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 403) setFeedback({ tipo: "erro", mensagem: "O servidor não autorizou esta ação. Confira o ciclo e as permissões da conta." });
        else if (error instanceof ApiError && error.status === 401) setFeedback({ tipo: "erro", mensagem: "A sessão não foi aceita. Entre novamente e tente reenviar o problema." });
        else if ((error instanceof ApiError && (error.status === 0 || error.status >= 500 || (error.status >= 200 && error.status < 300)))
          || (error instanceof PdcaWriteError && error.code === "INVALID_RESPONSE")) avisarResultadoIncerto("Não foi possível confirmar o resultado do envio. Confira a lista antes de tentar novamente.");
        else if (error instanceof ApiError && [400, 409, 422].includes(error.status)) setFeedback({ tipo: "erro", mensagem: "O servidor rejeitou os dados. Revise os campos e o estado do ciclo." });
        else setFeedback({ tipo: "erro", mensagem: "Não foi possível concluir o envio. Revise os dados e tente novamente." });
      } finally {
        if (!controller.signal.aborted) {
          enviandoRef.current = false;
          setEnviando(false);
        }
      }
    })();
  };

  if (resultado.estado !== "sucesso") {
    const carregando = resultado.estado === "carregando";
    const naoEncontrado = resultado.estado === "nao-encontrado";
    return <main className="plan-criar-problema">
      <section className="plan-criar-problema_estado" role={carregando ? "status" : "alert"}>
        <h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
        {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
      </section>
    </main>;
  }
  if (!identidadeValida || !ciclo) return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="alert"><h1>Ciclo indisponível para esta conta.</h1><Link to="/ciclos">Voltar para ciclos</Link></section></main>;
  const mensagemElegibilidade = !roleValida ? "O envio está indisponível para este tipo de conta."
    : !cicloAberto ? "O ciclo não aceita novos problemas neste estado."
      : undefined;
  return (
    <main className="plan-criar-problema">
      <FormularioCriarProblema key={chave ?? ciclo.id} podeEnviar={podeEnviar} enviando={enviando} mensagemElegibilidade={mensagemElegibilidade} onSubmit={enviar} acaoFechar={
        <Link to={envioIncerto ? `/do/ciclo/${ciclo.id}/plan/identificacao-problema/lista` : `/do/ciclo/${ciclo.id}/plan/identificacao-problema`} aria-label={envioIncerto ? "Ir para a lista de problemas" : "Fechar criação de problema"} aria-disabled={enviando}
          onClick={(event) => { if (enviando) event.preventDefault(); }}>{envioIncerto ? "Conferir lista" : "Fechar"}</Link>
      } />
      {feedback && <ModalErroPlan titulo={feedback.tipo === "aviso" ? "Não foi possível confirmar o envio" : "Não foi possível criar o problema"} mensagem={feedback.mensagem} aoFechar={() => setFeedback(null)} />}
    </main>
  );
}

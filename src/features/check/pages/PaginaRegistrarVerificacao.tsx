import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { ApiError } from "../../../services/http/client";
import { listarVerificacoesPorCicloPg, type VerificacaoPg } from "../../../services/api/pg/dashboard.read.api";
import { criarVerificacaoPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { FormularioRegistrarVerificacao, type DadosEnvioRegistrarVerificacao, type FeedbackEnvioFormulario } from "../components/FormularioRegistrarVerificacao";
import "../styles/pagina-registrar-verificacao.css";

export function PaginaRegistrarVerificacao() {
  const { cicloId } = useParams();
  const resultado = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const navigate = useNavigate();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const ciclo = resultado.estado === "sucesso" ? resultado.ciclo : null;
  const identidadeValida = Boolean(firebaseUser?.emailVerified && firebaseUser.uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0 && ciclo && ciclo.idEmpresa === idEmpresa);
  const chave = identidadeValida && firebaseUser?.uid && idEmpresa && ciclo ? JSON.stringify([firebaseUser.uid, idEmpresa, ciclo.id]) : null;
  const roleValida = actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR";
  const cicloEmVerificacao = ciclo?.status === "VERIFICACAO";
  const controllerRef = useRef<AbortController | null>(null);
  const enviandoRef = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [envioIncerto, setEnvioIncerto] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackEnvioFormulario>(null);
  const podeEnviar = Boolean(identidadeValida && roleValida && cicloEmVerificacao && !envioIncerto);
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

  const enviar = (campos: DadosEnvioRegistrarVerificacao) => {
    if (!ciclo || !podeEnviar || enviandoRef.current) return;
    const controller = controllerRef.current;
    if (!controller || controller.signal.aborted) return;
    enviandoRef.current = true;
    setEnviando(true);
    setFeedback(null);
    void (async () => {
      try {
        const criada = await criarVerificacaoPg(ciclo.id, campos, controller.signal);
        if (controller.signal.aborted) return;
        let verificacoes: VerificacaoPg[];
        try {
          verificacoes = await listarVerificacoesPorCicloPg(ciclo.id, controller.signal);
        } catch {
          if (!controller.signal.aborted) avisarResultadoIncerto("O envio pode ter sido aceito, mas não foi possível confirmar o registro. Confira a lista antes de tentar novamente.");
          return;
        }
        if (controller.signal.aborted) return;
        const confirmada = verificacoes.find((item) => item.id === criada.id && item.idCiclo === ciclo.id
          && item.status === criada.status && item.resumo === criada.resumo && item.observacao === criada.observacao);
        if (!confirmada) {
          avisarResultadoIncerto("O envio pode ter sido aceito, mas não foi possível confirmar o registro. Confira a lista antes de tentar novamente.");
          return;
        }
        navigate(`/do/ciclo/${ciclo.id}/check/verificacoes/${criada.id}`);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 403) setFeedback({ tipo: "erro", mensagem: "O servidor não autorizou o registro. Confirme sua participação no ciclo e tente novamente." });
        else if (error instanceof ApiError && error.status === 401) setFeedback({ tipo: "erro", mensagem: "A sessão não foi aceita. Entre novamente e tente reenviar a verificação." });
        else if ((error instanceof ApiError && (error.status === 0 || error.status >= 500 || (error.status >= 200 && error.status < 300)))
          || (error instanceof PdcaWriteError && error.code === "INVALID_RESPONSE")) avisarResultadoIncerto("Não foi possível confirmar o resultado do envio. Confira a lista antes de tentar novamente.");
        else if (error instanceof ApiError && [400, 409, 422].includes(error.status)) setFeedback({ tipo: "erro", mensagem: "O servidor rejeitou os dados. Revise os campos e confirme que o ciclo está em Verificação." });
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
    return <main className="check-registrar-verificacao">
      <div className="registrar-verificacao_fechar"><Link to="/ciclos">Voltar para ciclos</Link></div>
      <section className="registrar-verificacao_estado" role={carregando ? "status" : "alert"}>
        <h1>Registrar verificação</h1>
        <p>{carregando ? "Carregando ciclo." : resultado.estado === "nao-encontrado" ? "Ciclo não encontrado para esta conta." : "Não foi possível carregar o ciclo. Tente novamente mais tarde."}</p>
      </section>
    </main>;
  }
  if (!identidadeValida || !ciclo) return <main className="check-registrar-verificacao"><div className="registrar-verificacao_fechar"><Link to="/ciclos">Voltar para ciclos</Link></div><p className="registrar-verificacao_estado" role="alert">Ciclo indisponível para esta conta.</p></main>;
  const mensagemElegibilidade = !roleValida ? "O envio está indisponível para este tipo de conta."
    : !cicloEmVerificacao ? "O ciclo precisa estar em Verificação para registrar o resultado."
      : undefined;

  return (
    <main className="check-registrar-verificacao">
      <FormularioRegistrarVerificacao key={chave ?? ciclo.id} podeEnviar={podeEnviar} enviando={enviando} feedback={feedback} mensagemElegibilidade={mensagemElegibilidade} onSubmit={enviar} acaoFechar={
        <Link to={`/do/ciclo/${ciclo.id}/check`} aria-label={envioIncerto ? "Ir para Check para conferir verificações" : "Fechar registro de verificação"} aria-disabled={enviando}
          onClick={(event) => { if (enviando) event.preventDefault(); }}>{envioIncerto ? "Conferir lista" : "Fechar"}</Link>
      } />
    </main>
  );
}

import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useTarefasDoCiclo } from "../../../features/do/hooks/useTarefasDoCiclo";
import { useOpcoesCriarTarefaDo } from "../../../features/do/hooks/useOpcoesCriarTarefaDo";
import { DetalheTarefaDo } from "../../../components/do/DetalheTarefaDo";
import "../../../../features/do/styles/pagina-detalhe-tarefa-do.css";

function lerIdTarefa(valor: string | undefined): number | null {
  if (!valor || !/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function PaginaDetalheTarefaDo() {
  const { cicloId, tarefaId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const { actaUser, firebaseUser } = useAuth();
  const idTarefa = lerIdTarefa(tarefaId);
  const resultadoDados = useTarefasDoCiclo(resultadoCiclo.estado === "sucesso" && idTarefa !== null ? resultadoCiclo.ciclo.id : null);
  const cicloParaOpcoes = resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo : null;
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const podeConsultarResponsaveis = Boolean(firebaseUser?.emailVerified && cicloParaOpcoes && idEmpresa === cicloParaOpcoes.idEmpresa
    && (actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR") && cicloParaOpcoes.status !== "CONCLUIDO" && cicloParaOpcoes.status !== "CANCELADO");
  const opcoes = useOpcoesCriarTarefaDo({
    uid: podeConsultarResponsaveis ? firebaseUser?.uid ?? null : null, idEmpresa: podeConsultarResponsaveis ? idEmpresa : null,
    idCiclo: podeConsultarResponsaveis ? cicloParaOpcoes?.id ?? null : null, habilitado: podeConsultarResponsaveis,
  });

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    return <main className="do-detalhe-tarefa"><section className="detalhe-tarefa-do_estado" role={carregando ? "status" : "alert"} aria-live="polite">
      <h1>{carregando ? "Carregando ciclo" : resultadoCiclo.estado === "nao-encontrado" ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
      {!carregando && <p>{resultadoCiclo.estado === "nao-encontrado" ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
      <Link to="/ciclos">Voltar para ciclos</Link>
    </section></main>;
  }

  const ciclo = resultadoCiclo.ciclo;
  const linkCiclo = <Link to={`/do/ciclo/${ciclo.id}/tarefas`}>Voltar ao quadro de tarefas</Link>;
  if (idTarefa === null) return <main className="do-detalhe-tarefa"><section className="detalhe-tarefa-do_estado" role="alert"><h1>Tarefa não encontrada</h1>{linkCiclo}</section></main>;
  if (resultadoDados.estado === "carregando") return <main className="do-detalhe-tarefa"><section className="detalhe-tarefa-do_estado" role="status" aria-live="polite"><h1>Carregando tarefa</h1></section></main>;
  if (resultadoDados.estado === "indisponivel" || resultadoDados.estado === "erro") return <main className="do-detalhe-tarefa"><section className="detalhe-tarefa-do_estado" role="alert"><h1>Detalhe indisponível</h1><p>Não foi possível validar esta tarefa dentro dos planos do ciclo.</p>{linkCiclo}</section></main>;

  const tarefa = resultadoDados.dados.tarefas.find((item) => item.id === idTarefa && resultadoDados.dados.planos.some((plano) => plano.id === item.idPlanoAcao && plano.idCiclo === ciclo.id));
  if (!tarefa) return <main className="do-detalhe-tarefa"><section className="detalhe-tarefa-do_estado" role="alert"><h1>Tarefa não encontrada neste ciclo</h1>{linkCiclo}</section></main>;
  const plano = resultadoDados.dados.planos.find((item) => item.id === tarefa.idPlanoAcao && item.idCiclo === ciclo.id);
  if (!plano) return <main className="do-detalhe-tarefa"><section className="detalhe-tarefa-do_estado" role="alert"><h1>Vínculo da tarefa indisponível</h1>{linkCiclo}</section></main>;

  const podeEditar = Boolean(firebaseUser?.emailVerified && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO"
    && actaUser.idEmpresa === ciclo.idEmpresa && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR")
    && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO" && tarefa.status !== "CONCLUIDA" && tarefa.status !== "CANCELADA" && tarefa.prioridade);
  const podeAlterarStatus = Boolean(firebaseUser?.emailVerified && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO"
    && actaUser.idEmpresa === ciclo.idEmpresa && ["ADMIN", "GESTOR", "COLABORADOR"].includes(actaUser.tipo)
    && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO");
  return <main className="do-detalhe-tarefa"><DetalheTarefaDo key={tarefa.id} tarefa={tarefa} nomePlano={plano.nome} tituloCiclo={ciclo.titulo} acaoFechar={linkCiclo} podeEditar={podeEditar} podeAlterarStatus={podeAlterarStatus}
    podeReatribuir={podeConsultarResponsaveis} opcoesResponsaveis={opcoes.estado === "sucesso" ? opcoes.responsaveis : []} estadoResponsaveis={opcoes.estado} /></main>;
}

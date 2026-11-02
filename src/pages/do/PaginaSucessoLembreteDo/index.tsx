import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../../components/layout/AvisoDadosDemonstrativos";
import { ModalSucessoDo } from "../../../components/do/ModalSucessoDo";
import { lerIdRotaTexto } from "../../../utils/route-params";

export function PaginaSucessoLembreteDo() {
  const { cicloId, treinamentoId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const idTreinamento = lerIdRotaTexto(treinamentoId);
  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return <main className="pagina-sucesso-do" role={carregando ? "status" : "alert"} aria-live="polite"><h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>{!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}</main>;
  }
  if (!idTreinamento) return <main className="pagina-sucesso-do" role="alert"><h1>Treinamento inválido</h1><p>Volte aos treinamentos e selecione um item válido.</p><Link to={`/do/ciclo/${resultadoCiclo.ciclo.id}/treinamentos`}>Voltar aos treinamentos</Link></main>;
  return <><AvisoDadosDemonstrativos mensagem="Esta confirmação é apenas demonstrativa. Nenhum lembrete foi enviado." /><ModalSucessoDo titulo="Simulação concluída" descricao="Nenhum lembrete foi enviado." larguraDescricao={252} topoDescricao={229} hrefConcluido={`/do/ciclo/${resultadoCiclo.ciclo.id}/treinamentos`} /></>;
}

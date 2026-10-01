import { useParams } from "react-router-dom";
import { ModalSucessoDo } from "../components/ModalSucessoDo";

export function PaginaSucessoLembreteDo() {
  const { cicloId } = useParams();
  return <ModalSucessoDo titulo="Lembrete enviado com sucesso!" descricao="Lembrete enviado aos colaboradores com tarefa pendente" larguraDescricao={252} topoDescricao={229} hrefConcluido={`/do/ciclo/${cicloId}/treinamentos`} />;
}

import { useParams } from "react-router-dom";
import { ModalSucessoDo } from "../components/ModalSucessoDo";

export function PaginaSucessoTreinamentoCriadoDo() {
  const { cicloId } = useParams();
  return <ModalSucessoDo titulo="Treinamento criado com sucesso!" descricao="Material já enviado aos colaboradores" hrefConcluido={`/do/ciclo/${cicloId}/treinamentos`} />;
}

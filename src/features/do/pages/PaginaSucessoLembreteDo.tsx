import { useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";
import { ModalSucessoDo } from "../components/ModalSucessoDo";

export function PaginaSucessoLembreteDo() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return <main className="pagina-sucesso-do" role={carregando ? "status" : "alert"} aria-live="polite"><h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>{!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}</main>;
  }
  return <><AvisoDadosDemonstrativos mensagem="Esta confirmação é apenas demonstrativa. Nenhum lembrete foi enviado." /><ModalSucessoDo titulo="Simulação concluída" descricao="Nenhum lembrete foi enviado." larguraDescricao={252} topoDescricao={229} hrefConcluido={`/do/ciclo/${cicloId}/treinamentos`} /></>;
}

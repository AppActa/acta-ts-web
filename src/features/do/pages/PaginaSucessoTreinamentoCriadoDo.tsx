import { useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";
import { ModalSucessoDo } from "../components/ModalSucessoDo";

export function PaginaSucessoTreinamentoCriadoDo() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return <main className="pagina-sucesso-do" role={carregando ? "status" : "alert"} aria-live="polite"><h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>{!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}</main>;
  }
  return <><AvisoDadosDemonstrativos mensagem="Esta confirmação é apenas demonstrativa. Nenhum treinamento foi criado ou material enviado." /><ModalSucessoDo titulo="Simulação concluída" descricao="Nenhum treinamento foi criado ou material enviado." hrefConcluido={`/do/ciclo/${cicloId}/treinamentos`} /></>;
}

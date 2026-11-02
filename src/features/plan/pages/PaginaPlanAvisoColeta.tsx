import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";
import "../styles/pagina-plan-aviso-coleta.css";

export function PaginaPlanAvisoColeta() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return <main className="plan-aviso-coleta" role={carregando ? "status" : "alert"} aria-live="polite"><h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>{!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}</main>;
  }

  return (
    <main className="plan-aviso-coleta" aria-labelledby="plan-aviso-coleta-titulo">
      <AvisoDadosDemonstrativos mensagem="Esta tela apenas demonstra a navegação para a coleta; nenhum formulário é consultado ou criado." />
      <section className="plan-aviso-coleta_dialogo" role="alertdialog" aria-modal="true" aria-labelledby="plan-aviso-coleta-titulo" aria-describedby="plan-aviso-coleta-pergunta">
        <div className="plan-aviso-coleta_icone" aria-hidden="true">{/* # colocar imagem */}</div>
        <h1 id="plan-aviso-coleta-titulo">Demonstração: formulário de coleta de dados</h1>
        <p id="plan-aviso-coleta-pergunta">Deseja cria-lo?</p>
        <div className="plan-aviso-coleta_acoes">
          <Link className="plan-aviso-coleta_sim" to={`/do/ciclo/${cicloId}/plan/coleta/criar`}>Sim</Link>
          <Link className="plan-aviso-coleta_nao" to={`/do/ciclo/${cicloId}/plan`}>Não</Link>
        </div>
      </section>
    </main>
  );
}

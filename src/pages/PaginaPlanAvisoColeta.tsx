import { Link, useParams } from "react-router-dom";
import "./pagina-plan-aviso-coleta.css";

export function PaginaPlanAvisoColeta() {
  const { cicloId } = useParams();

  return (
    <main className="plan-aviso-coleta" aria-labelledby="plan-aviso-coleta-titulo">
      <section className="plan-aviso-coleta_dialogo" role="alertdialog" aria-modal="true" aria-labelledby="plan-aviso-coleta-titulo" aria-describedby="plan-aviso-coleta-pergunta">
        <div className="plan-aviso-coleta_icone" aria-hidden="true">!</div>
        <h1 id="plan-aviso-coleta-titulo">Você ainda não criou seu formulário de coleta de dados</h1>
        <p id="plan-aviso-coleta-pergunta">Deseja cria-lo?</p>
        <div className="plan-aviso-coleta_acoes">
          <Link className="plan-aviso-coleta_sim" to={`/do/ciclo/${cicloId}/plan/coleta/criar`}>Sim</Link>
          <Link className="plan-aviso-coleta_nao" to={`/do/ciclo/${cicloId}/plan`}>Não</Link>
        </div>
      </section>
    </main>
  );
}

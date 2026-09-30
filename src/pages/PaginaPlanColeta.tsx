import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../features/ciclo/components/PainelCicloPlanDo";
import "../features/perfil/styles/pagina-perfil.css";
import "../features/ciclo/styles/painel-ciclo-plan-do.css";
import "./pagina-plan-coleta.css";

export function PaginaPlanColeta() {
  const { cicloId } = useParams();
  const [avisoEnvio, setAvisoEnvio] = useState(false);

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-coleta">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" tituloCiclo="Nome do ciclo">
        <section className="plan-coleta-conteudo" aria-labelledby="plan-coleta-titulo">
          <div className="plan-coleta_titulo-linha">
            <Link className="plan-coleta_voltar" to={`/do/ciclo/${cicloId}/plan`} aria-label="Voltar ao resumo Plan">‹</Link>
            <h2 id="plan-coleta-titulo">Coleta de dados</h2>
          </div>

          <div className="plan-coleta_cartoes">
            <article className="plan-coleta_cartao plan-coleta_participantes">
              <div className="plan-coleta_cartao-cabecalho">
                <h3>Participantes e respostas</h3>
                <span>Enviada · 8/8</span>
              </div>
              <p>8 colaboradores selecionados · 8 notificações enviadas</p>
            </article>

            <article className="plan-coleta_cartao plan-coleta_respostas">
              <h3>Respostas recebidas</h3>
              <ul>
                <li>5 concluídas</li>
                <li>2 pendentes · reenvio automático</li>
                <li>1 convite não entregue · reenviar</li>
              </ul>
              <button type="button" className="plan-coleta_reenviar" aria-describedby="plan-coleta-aviso" onClick={() => setAvisoEnvio(true)}>
                Reenviar aos pendentes
              </button>
              {avisoEnvio && <p className="plan-coleta_privacidade" role="status">O reenvio ficará disponível quando a integração com a API estiver conectada.</p>}
              <p className="plan-coleta_privacidade" id="plan-coleta-aviso">Respostas ficam vinculadas ao ciclo e à empresa.</p>
            </article>
          </div>
        </section>
      </PainelCicloPlanDo>
    </main>
  );
}

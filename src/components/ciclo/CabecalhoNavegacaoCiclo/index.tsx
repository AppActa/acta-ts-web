import { Link } from "react-router-dom";
import type { CicloPg } from "../../../types/pdca";
import { rotuloStatusCiclo } from "../../../features/ciclo/hooks/useCicloDaConta";
import relogio from "../../../../features/do/assets/ciclo-do/relogio.svg";
import iconeVisao from "../../../../features/do/assets/ciclo-visao-geral/063c5.svg";
import iconePlan from "../../../../features/do/assets/ciclo-visao-geral/47893.svg";
import iconeDo from "../../../../features/do/assets/ciclo-visao-geral/d01c2.svg";
import iconeCheck from "../../../../features/do/assets/ciclo-visao-geral/fe2f6.svg";
import iconeAct from "../../../../features/do/assets/ciclo-visao-geral/a51ff.svg";
import "../../../../features/ciclo/styles/cabecalho-navegacao-ciclo.css";

type EtapaCiclo = "visao-geral" | "plan" | "do" | "check" | "act";

type CabecalhoNavegacaoCicloProps = {
  ciclo: CicloPg;
  etapaAtiva: EtapaCiclo;
};

const etapas: ReadonlyArray<{ id: EtapaCiclo; rotulo: string; icone: string; rota: string }> = [
  { id: "visao-geral", rotulo: "Visão geral", icone: iconeVisao, rota: "visao-geral" },
  { id: "plan", rotulo: "Plan", icone: iconePlan, rota: "plan" },
  { id: "do", rotulo: "Do", icone: iconeDo, rota: "tarefas" },
  { id: "check", rotulo: "Check", icone: iconeCheck, rota: "check" },
  { id: "act", rotulo: "Act", icone: iconeAct, rota: "act" },
];

function dataOuTexto(data: string | null): string {
  return data ?? "Não informado";
}

export function CabecalhoNavegacaoCiclo({ ciclo, etapaAtiva }: CabecalhoNavegacaoCicloProps) {
  const base = `/do/ciclo/${ciclo.id}`;

  return (
    <div className="cabecalho-navegacao-ciclo">
      <header className="cabecalho-navegacao-ciclo_resumo">
        <span className="cabecalho-navegacao-ciclo_icone" aria-hidden="true"><img src={relogio} alt="" /></span>
        <div className="cabecalho-navegacao-ciclo_dados">
          <div className="cabecalho-navegacao-ciclo_titulo-linha">
            <h1>{ciclo.titulo}</h1>
            <span className="cabecalho-navegacao-ciclo_status">Status: {rotuloStatusCiclo(ciclo.status)}</span>
          </div>
          <div className="cabecalho-navegacao-ciclo_metadados">
            <p><span>Responsável pelo ciclo:</span> <strong>Não informado</strong></p>
            <p><span>Iniciado em:</span> <strong>{dataOuTexto(ciclo.dataInicio)}</strong></p>
            <p><span>Prazo final:</span> <strong>{dataOuTexto(ciclo.dataEstimadaFim)}</strong></p>
          </div>
        </div>
      </header>
      <nav className="cabecalho-navegacao-ciclo_etapas" aria-label="Etapas do ciclo">
        {etapas.map((etapa) => (
          <Link
            key={etapa.id}
            to={`${base}/${etapa.rota}`}
            className="cabecalho-navegacao-ciclo_etapa"
            aria-current={etapaAtiva === etapa.id ? "page" : undefined}
          >
            <img src={etapa.icone} alt="" />
            <span>{etapa.rotulo}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

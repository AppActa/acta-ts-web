import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import { obterCiclo } from "../data/ciclos";
import relogioCiclo from "../assets/relogio-ciclo.svg";
import "../styles/painel-ciclo-plan-do.css";

type PainelCicloPlanDoProps = {
  cicloId: string | undefined;
  etapaAtiva: "plan" | "do";
  children: ReactNode;
};

export function PainelCicloPlanDo({ cicloId, etapaAtiva, children }: PainelCicloPlanDoProps) {
  const isDo = etapaAtiva === "do";
  const ciclo = obterCiclo(cicloId);
  const etapaHref = (etapa: "plan" | "do") => etapa === "plan"
    ? `/do/ciclo/${cicloId}/plan`
    : `/do/ciclo/${cicloId}/tarefas`;

  return (
    <>
      <Sidebar />
      <div className={`painel-ciclo-plan-do painel-ciclo-plan-do-${etapaAtiva}`}>
        <header className="painel-ciclo-plan-do_cabecalho">
          <div className="painel-ciclo-plan-do_icone" aria-hidden="true">
            {isDo && <img src={relogioCiclo} alt="" />}
          </div>
          <div className="painel-ciclo-plan-do_identificacao">
            <div className="painel-ciclo-plan-do_titulo-linha"><h1>{ciclo.nome}</h1><span>Status: {isDo ? "Do" : "Plan"}</span></div>
            <p>Responsável pelo ciclo: <strong>Catarina Cândido</strong></p>
            <p>Iniciado em: <strong>{ciclo.inicio}</strong></p>
            <p>Prazo final: <strong>{ciclo.prazo}</strong></p>
          </div>
        </header>

        <nav className="painel-ciclo-plan-do_abas" aria-label="Etapas do ciclo">
          <Link to={`/do/ciclo/${cicloId}/visao-geral`} className="painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-visao"><span aria-hidden="true">⟳</span>Visão geral</Link>
          <Link to={etapaHref("plan")} aria-current={!isDo ? "page" : undefined} className={`painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-plan${!isDo ? " ativa" : ""}`}><span aria-hidden="true">▣</span>Plan</Link>
          <Link to={etapaHref("do")} aria-current={isDo ? "page" : undefined} className={`painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-do${isDo ? " ativa" : ""}`}><span aria-hidden="true">▷</span>Do</Link>
          <button type="button" className="painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-check" disabled><span aria-hidden="true">✓</span>Checar</button>
          <button type="button" className="painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-act" disabled><span aria-hidden="true">✧</span>Agir</button>
        </nav>
        {children}
      </div>
    </>
  );
}

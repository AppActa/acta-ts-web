import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import { useCicloDaConta, rotuloStatusCiclo } from "../hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";
import relogioCiclo from "../assets/relogio-ciclo.svg";
import "../styles/painel-ciclo-plan-do.css";

type PainelCicloPlanDoProps = {
  cicloId: string | undefined;
  etapaAtiva: "plan" | "do" | "check" | "act";
  exibirAvisoDemonstrativo?: boolean;
  children: ReactNode;
};

export function PainelCicloPlanDo({ cicloId, etapaAtiva, exibirAvisoDemonstrativo = true, children }: PainelCicloPlanDoProps) {
  const isPlan = etapaAtiva === "plan";
  const isDo = etapaAtiva === "do";
  const resultadoCiclo = useCicloDaConta(cicloId);

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <>
        <Sidebar />
        <div className={`painel-ciclo-plan-do painel-ciclo-plan-do-${etapaAtiva}`}>
          <section className="painel-ciclo-plan-do_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? "Carregando ciclo" : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </>
    );
  }
  const ciclo = resultadoCiclo.ciclo;
  const cicloHref = `/do/ciclo/${ciclo.id}`;
  const etapaHref = (etapa: "plan" | "do") => `${cicloHref}/${etapa === "plan" ? "plan" : "tarefas"}`;

  return (
    <>
      <Sidebar />
      <div className={`painel-ciclo-plan-do painel-ciclo-plan-do-${etapaAtiva}`}>
        <header className="painel-ciclo-plan-do_cabecalho">
          <div className="painel-ciclo-plan-do_icone" aria-hidden="true">
            {(isPlan || isDo) && <img src={relogioCiclo} alt="" />}
          </div>
          <div className="painel-ciclo-plan-do_identificacao">
            <div className="painel-ciclo-plan-do_titulo-linha"><h1>{ciclo.titulo}</h1><span>Status: {rotuloStatusCiclo(ciclo.status)}</span></div>
            <p>Responsável pelo ciclo: <strong>Não informado</strong></p>
            <p>Iniciado em: <strong>{ciclo.dataInicio ?? "Não informado"}</strong></p>
            <p>Prazo final: <strong>{ciclo.dataEstimadaFim ?? "Não informado"}</strong></p>
          </div>
        </header>

        <nav className="painel-ciclo-plan-do_abas" aria-label="Etapas do ciclo">
          <Link to={`${cicloHref}/visao-geral`} className="painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-visao"><span aria-hidden="true">{/* # colocar imagem */}</span>Visão geral</Link>
          <Link to={etapaHref("plan")} aria-current={isPlan ? "page" : undefined} className={`painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-plan${isPlan ? " ativa" : ""}`}><span aria-hidden="true">{/* # colocar imagem */}</span>Plan</Link>
          <Link to={etapaHref("do")} aria-current={isDo ? "page" : undefined} className={`painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-do${isDo ? " ativa" : ""}`}><span aria-hidden="true">{/* # colocar imagem */}</span>Do</Link>
          <Link to={`${cicloHref}/check`} aria-current={etapaAtiva === "check" ? "page" : undefined} className={`painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-check${etapaAtiva === "check" ? " ativa" : ""}`}><span aria-hidden="true">{/* # colocar imagem */}</span>Checar</Link>
          <Link to={`${cicloHref}/act`} aria-current={etapaAtiva === "act" ? "page" : undefined} className={`painel-ciclo-plan-do_aba painel-ciclo-plan-do_aba-act${etapaAtiva === "act" ? " ativa" : ""}`}><span aria-hidden="true">{/* # colocar imagem */}</span>Agir</Link>
        </nav>
        {exibirAvisoDemonstrativo && <AvisoDadosDemonstrativos />}
        {children}
      </div>
    </>
  );
}

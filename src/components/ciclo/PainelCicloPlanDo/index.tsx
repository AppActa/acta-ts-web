import { Sidebar } from "../../layout/Sidebar";
import { CarregandoConteudo } from "../../layout/CarregandoConteudo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { AvisoDadosDemonstrativos } from "../../layout/AvisoDadosDemonstrativos";
import { CabecalhoNavegacaoCiclo } from "../CabecalhoNavegacaoCiclo";
import "../../../../features/ciclo/styles/painel-ciclo-plan-do.css";
import type { PainelCicloPlanDoProps } from "../../../types/ciclo";

export function PainelCicloPlanDo({ cicloId, etapaAtiva, exibirAvisoDemonstrativo = true, children }: PainelCicloPlanDoProps) {
  const resultadoCiclo = useCicloDaConta(cicloId);

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <>
        <Sidebar />
        <div className={`painel-ciclo-plan-do painel-ciclo-plan-do-${etapaAtiva}`}>
          {carregando ? <CarregandoConteudo mensagem="Carregando ciclo" /> : <section className="painel-ciclo-plan-do_estado" role="alert" aria-live="polite">
            <h1>{naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>
          </section>}
        </div>
      </>
    );
  }
  const ciclo = resultadoCiclo.ciclo;

  return (
    <>
      <Sidebar />
      <div className={`painel-ciclo-plan-do painel-ciclo-plan-do-${etapaAtiva}`}>
        <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva={etapaAtiva} />
        {exibirAvisoDemonstrativo && <AvisoDadosDemonstrativos />}
        {children}
      </div>
    </>
  );
}

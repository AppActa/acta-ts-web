import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { useResumoCicloPlan } from "../hooks/useResumoCicloPlan";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-ciclo-plan.css";

const statusProblema = [
  { valor: "ABERTO", rotulo: "Abertos" }, { valor: "EM_ANALISE", rotulo: "Em análise" },
  { valor: "PRIORIZADO", rotulo: "Priorizados" }, { valor: "RESOLVIDO", rotulo: "Resolvidos" }, { valor: "DESCARTADO", rotulo: "Descartados" },
] as const;
const statusMeta = [
  { valor: "NAO_INICIADA", rotulo: "Não iniciadas" }, { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "ATINGIDA", rotulo: "Atingidas" }, { valor: "PARCIALMENTE_ATINGIDA", rotulo: "Parcialmente atingidas" },
  { valor: "NAO_ATINGIDA", rotulo: "Não atingidas" }, { valor: "CANCELADA", rotulo: "Canceladas" },
] as const;
const statusPlano = [
  { valor: "RASCUNHO", rotulo: "Rascunhos" }, { valor: "APROVADO", rotulo: "Aprovados" },
  { valor: "EM_EXECUCAO", rotulo: "Em execução" }, { valor: "CONCLUIDO", rotulo: "Concluídos" }, { valor: "CANCELADO", rotulo: "Cancelados" },
] as const;

function lerIdCiclo(valor: string | undefined): number | null {
  if (!valor || !/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function contarStatus<T extends string>(itens: readonly { status: T | null }[], status: readonly { valor: T; rotulo: string }[]): string {
  const contagens = status.map((item) => `${item.rotulo}: ${itens.filter((registro) => registro.status === item.valor).length}`);
  const semStatus = itens.filter((item) => item.status === null).length;
  if (semStatus > 0) contagens.push(`Sem status: ${semStatus}`);
  return contagens.join(" · ");
}

function ConteudoPlanValidado({ idCiclo }: { idCiclo: number }) {
  const { problemas, causas, check, tarefas } = useResumoCicloPlan(idCiclo);
  const resumoProblemas = (() => {
    if (problemas.estado === "carregando") return { estado: "Carregando", descricao: "Carregando problemas do ciclo." };
    if (problemas.estado === "erro") return { estado: "Erro ao carregar", descricao: "Problemas indisponíveis para este ciclo." };
    if (problemas.estado === "indisponivel") return { estado: "Indisponível", descricao: "Problemas indisponíveis para este ciclo." };
    if (problemas.estado !== "sucesso" && problemas.estado !== "vazio") return { estado: "Indisponível", descricao: "Problemas indisponíveis para este ciclo." };
    const ids = new Set(problemas.dados.map((item) => item.id));
    if (problemas.dados.some((item) => item.idCiclo !== idCiclo) || ids.size !== problemas.dados.length) return { estado: "Indisponível", descricao: "A associação dos problemas ao ciclo não pôde ser validada." };
    if (problemas.dados.length === 0) return { estado: "Sem registros", descricao: "Nenhum problema registrado neste ciclo." };
    return { estado: "Dados disponíveis", descricao: contarStatus(problemas.dados, statusProblema) };
  })();
  const resumoCausas = (() => {
    if (causas.estado === "carregando") return { estado: "Carregando", descricao: "Carregando causas do ciclo." };
    if (causas.estado === "erro") return { estado: "Erro ao carregar", descricao: "Causas indisponíveis para este ciclo." };
    if (causas.estado === "indisponivel") return { estado: "Indisponível", descricao: "Causas indisponíveis para este ciclo." };
    if (causas.estado !== "sucesso" && causas.estado !== "vazio") return { estado: "Indisponível", descricao: "Causas indisponíveis para este ciclo." };
    const ids = new Set(causas.dados.map((item) => item.id));
    if (causas.dados.some((item) => item.idCiclo !== idCiclo) || ids.size !== causas.dados.length) return { estado: "Indisponível", descricao: "A associação das causas ao ciclo não pôde ser validada." };
    if (causas.dados.length === 0) return { estado: "Sem registros", descricao: "Nenhuma causa registrada neste ciclo." };
    return { estado: "Dados disponíveis", descricao: `Aceitas: ${causas.dados.filter((item) => item.aceita === true).length} · Não aceitas: ${causas.dados.filter((item) => item.aceita === false).length} · Não validadas: ${causas.dados.filter((item) => item.aceita === null).length}` };
  })();
  const resumoMetas = (() => {
    if (check.estado === "carregando") return { estado: "Carregando", descricao: "Carregando metas do ciclo. Valor atual do indicador indisponível." };
    if (check.estado === "erro") return { estado: "Erro ao carregar", descricao: "Metas indisponíveis para este ciclo. Valor atual do indicador indisponível." };
    if (check.estado === "indisponivel") return { estado: "Indisponível", descricao: "Metas indisponíveis para este ciclo. Valor atual do indicador indisponível." };
    if (check.estado !== "sucesso" && check.estado !== "vazio") return { estado: "Indisponível", descricao: "Metas indisponíveis para este ciclo. Valor atual do indicador indisponível." };
    const ids = new Set(check.dados.metas.map((item) => item.id));
    if (check.dados.metas.some((item) => item.idCiclo !== idCiclo) || ids.size !== check.dados.metas.length) return { estado: "Indisponível", descricao: "A associação das metas ao ciclo não pôde ser validada. Valor atual do indicador indisponível." };
    if (check.dados.metas.length === 0) return { estado: "Sem registros", descricao: "Nenhuma meta registrada neste ciclo. Valor atual do indicador indisponível." };
    return { estado: "Dados disponíveis", descricao: `${contarStatus(check.dados.metas, statusMeta)} · Valor atual do indicador indisponível.` };
  })();
  const resumoPlanos = (() => {
    if (tarefas.estado === "carregando") return { estado: "Carregando", descricao: "Carregando planos do ciclo." };
    if (tarefas.estado === "erro") return { estado: "Erro ao carregar", descricao: "Planos indisponíveis para este ciclo; dados 5W2H não carregados." };
    if (tarefas.estado === "indisponivel") return { estado: "Indisponível", descricao: "Planos indisponíveis para este ciclo; dados 5W2H não carregados." };
    const ids = new Set(tarefas.dados.planos.map((item) => item.id));
    if (tarefas.dados.planos.some((item) => item.idCiclo !== idCiclo) || ids.size !== tarefas.dados.planos.length) return { estado: "Indisponível", descricao: "A associação dos planos ao ciclo não pôde ser validada; dados 5W2H não carregados." };
    if (tarefas.dados.planos.length === 0) return { estado: "Sem registros", descricao: "Nenhum plano de ação registrado neste ciclo; dados 5W2H não carregados." };
    return { estado: "Dados disponíveis", descricao: `${contarStatus(tarefas.dados.planos, statusPlano)} · Dados 5W2H não carregados.` };
  })();
  const { cicloId } = useParams();
  const idRota = lerIdCiclo(cicloId);
  const cicloHrefId = idRota === idCiclo ? idCiclo : null;

  return (
    <section className="plan-resumo-conteudo" aria-label="Etapas do planejamento">
      <article className="plan-indicador">
        <h2>Identificação do problema</h2><span className="plan-indicador_estado">{resumoProblemas.estado}</span><p>{resumoProblemas.descricao}</p>
        {cicloHrefId !== null ? <Link className="plan-indicador_detalhes" to={`/do/ciclo/${cicloHrefId}/plan/identificacao-problema`}>Ver detalhes →</Link> : <span className="plan-indicador_detalhes">Detalhes indisponíveis</span>}
      </article>
      <article className="plan-indicador">
        <h2>Coleta de dados</h2><span className="plan-indicador_estado">Indisponível</span><p>Dados da coleta não estão disponíveis nesta visão.</p>
        {cicloHrefId !== null ? <Link className="plan-indicador_detalhes" to={`/do/ciclo/${cicloHrefId}/plan/coleta`}>Ver detalhes →</Link> : <span className="plan-indicador_detalhes">Detalhes indisponíveis</span>}
      </article>
      <article className="plan-indicador">
        <h2>Análise de causas</h2><span className="plan-indicador_estado">{resumoCausas.estado}</span><p>{resumoCausas.descricao}</p>{cicloHrefId !== null && <Link className="plan-indicador_detalhes" to={`/do/ciclo/${cicloHrefId}/plan/causas`}>Ver detalhes →</Link>}
      </article>
      <article className="plan-indicador">
        <h2>Meta e indicador</h2><span className="plan-indicador_estado">{resumoMetas.estado}</span><p>{resumoMetas.descricao}</p>{cicloHrefId !== null && <Link className="plan-indicador_detalhes" to={`/do/ciclo/${cicloHrefId}/plan/metas`}>Ver detalhes →</Link>}
      </article>
      <article className="plan-indicador">
        <h2>Plano de ação 5W2H</h2><span className="plan-indicador_estado">{resumoPlanos.estado}</span><p>{resumoPlanos.descricao}</p>{cicloHrefId !== null && <Link className="plan-indicador_detalhes" to={`/do/ciclo/${cicloHrefId}/plan/planos`}>Ver detalhes →</Link>}
      </article>
      <article className="plan-progresso" aria-labelledby="plan-progresso-titulo">
        <div className="plan-progresso_grafico" role="status" aria-label="Progresso indisponível">Indisponível</div>
        <div className="plan-progresso_texto"><h2 id="plan-progresso-titulo">Etapas do planejamento</h2><p>Progresso indisponível</p></div>
      </article>
    </section>
  );
}

function ConteudoCicloPlan() {
  const { cicloId } = useParams();
  const idCiclo = lerIdCiclo(cicloId);
  if (idCiclo === null) return <section className="plan-resumo-conteudo" role="alert"><p>Resumo indisponível para este ciclo.</p></section>;
  return <ConteudoPlanValidado idCiclo={idCiclo} />;
}

export function PaginaCicloPlan() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
        <ConteudoCicloPlan />
      </PainelCicloPlanDo>
    </main>
  );
}

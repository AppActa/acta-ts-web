import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { useProblemasDoCiclo } from "../hooks/useProblemasDoCiclo";
import "../styles/pagina-plan-detalhe-problema.css";

function DetalheProblema({ cicloId, problemaId }: { cicloId: number; problemaId: number }) {
  const resultado = useProblemasDoCiclo(cicloId);
  const listaHref = `/do/ciclo/${cicloId}/plan/identificacao-problema`;
  if (resultado.estado !== "sucesso" && resultado.estado !== "vazio") {
    return <section className="plan-detalhe-problema" role={resultado.estado === "erro" ? "alert" : "status"}>
      <p>{resultado.estado === "carregando" ? "Carregando problema..." : "Não foi possível carregar o problema."}</p>
      <Link to={listaHref}>Voltar aos problemas</Link>
    </section>;
  }
  const problema = resultado.dados.find((item) => item.id === problemaId);
  if (!problema) return <section className="plan-detalhe-problema" role="status"><p>Problema não encontrado neste ciclo.</p><Link to={listaHref}>Voltar aos problemas</Link></section>;
  const campos = [
    ["Título", problema.titulo],
    ["Peso na priorização", problema.peso === null ? "Não informado" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(problema.peso * 100)}%`],
    ["Descrição", problema.descricao?.trim() || "Não informada"],
    ["Problema persistente", problema.persistente === null ? "Não informado" : problema.persistente ? "Sim" : "Não"],
    ["Problema relacionado", problema.idProblemaPai === null ? "Nenhum" : `Problema ${problema.idProblemaPai}`],
  ];
  const status = { ABERTO: "Aberto", EM_ANALISE: "Em análise", PRIORIZADO: "Priorizado", RESOLVIDO: "Resolvido", DESCARTADO: "Descartado" } as const;
  return <section className="plan-detalhe-problema" aria-labelledby="plan-detalhe-problema-titulo">
    <Link className="plan-detalhe-problema_voltar" to={listaHref}>← Voltar aos problemas</Link>
    <h2 id="plan-detalhe-problema-titulo">Identificação do problema</h2>
    <p className="plan-detalhe-problema_subtitulo">Plan</p>
    <div className="plan-detalhe-problema_colunas">
      <section className="plan-detalhe-problema_cartao" aria-labelledby="plan-detalhe-informacoes">
        <h3 id="plan-detalhe-informacoes">Informações registradas</h3>
        <dl>{campos.map(([rotulo, valor]) => <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>)}</dl>
      </section>
      <aside className="plan-detalhe-problema_cartao plan-detalhe-problema_acoes" aria-labelledby="plan-detalhe-acompanhamento">
        <h3 id="plan-detalhe-acompanhamento">Acompanhamento</h3>
        <p className="plan-detalhe-problema_status">{problema.status ? status[problema.status] : "Status não informado"}</p>
        <p>Consulte os dados do ciclo e mantenha as informações atualizadas.</p>
        <Link className="plan-detalhe-problema_editar" to={`${listaHref}/${problemaId}/editar`}>Editar problema</Link>
        <Link to={`${listaHref}/criar`}>Criar problema</Link>
      </aside>
    </div>
  </section>;
}

export function PaginaPlanDetalheProblema() {
  const { cicloId, problemaId } = useParams();
  const idCiclo = Number(cicloId);
  const idProblema = Number(problemaId);
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan">
    <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
      {Number.isSafeInteger(idCiclo) && idCiclo > 0 && Number.isSafeInteger(idProblema) && idProblema > 0
        ? <DetalheProblema key={`${idCiclo}:${idProblema}`} cicloId={idCiclo} problemaId={idProblema} />
        : <p role="alert">Problema inválido.</p>}
    </PainelCicloPlanDo>
  </main>;
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listarMetasPorCicloPg, listarPlanosPorCicloPg, type MetaPg, type PlanoAcaoPg } from "../../../services/api/pg/dashboard.read.api";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import "../styles/pagina-plan-detalhe-problema.css";

type Tipo = "metas" | "planos";
type Dados = { estado: "carregando" | "erro" } | { estado: "sucesso"; metas: MetaPg[]; planos: PlanoAcaoPg[] };
const statusMeta: Record<MetaPg["status"], string> = { NAO_INICIADA: "Não iniciada", EM_ANDAMENTO: "Em andamento", ATINGIDA: "Atingida", PARCIALMENTE_ATINGIDA: "Parcialmente atingida", NAO_ATINGIDA: "Não atingida", CANCELADA: "Cancelada" };
const statusPlano: Record<PlanoAcaoPg["status"], string> = { RASCUNHO: "Rascunho", APROVADO: "Aprovado", EM_EXECUCAO: "Em execução", CONCLUIDO: "Concluído", CANCELADO: "Cancelado" };
const valor = (numero: number | null, unidade: string | null) => numero === null ? "Não informado" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(numero)}${unidade ? ` ${unidade}` : ""}`;

function Conteudo({ cicloId, tipo }: { cicloId: number; tipo: Tipo }) {
  const [dados, setDados] = useState<Dados>({ estado: "carregando" });
  useEffect(() => {
    const controller = new AbortController();
    setDados({ estado: "carregando" });
    const requisicao = tipo === "metas"
      ? listarMetasPorCicloPg(cicloId, controller.signal).then((metas) => ({ metas, planos: [] as PlanoAcaoPg[] }))
      : listarPlanosPorCicloPg(cicloId, controller.signal).then((planos) => ({ planos, metas: [] as MetaPg[] }));
    void requisicao.then((resultado) => {
      if (controller.signal.aborted) return;
      const registros = tipo === "metas" ? resultado.metas : resultado.planos;
      if (registros.some((item) => item.idCiclo !== cicloId) || new Set(registros.map((item) => item.id)).size !== registros.length) throw new Error("Associação inválida");
      setDados({ estado: "sucesso", ...resultado });
    }).catch(() => { if (!controller.signal.aborted) setDados({ estado: "erro" }); });
    return () => controller.abort();
  }, [cicloId, tipo]);
  const titulo = tipo === "metas" ? "Meta e indicador" : "Plano de ação 5W2H";
  return <section className="plan-detalhe-problema" aria-labelledby="plan-dados-titulo">
    <Link className="plan-detalhe-problema_voltar" to={`/do/ciclo/${cicloId}/plan`}>← Voltar ao Plan</Link>
    <h2 id="plan-dados-titulo">{titulo}</h2><p className="plan-detalhe-problema_subtitulo">Plan</p>
    <div className="plan-detalhe-problema_colunas"><section className="plan-detalhe-problema_cartao">
      <h3>{tipo === "metas" ? "Informações registradas" : "Planos de ação"}</h3>
      {dados.estado !== "sucesso" ? <p role={dados.estado === "erro" ? "alert" : "status"}>{dados.estado === "erro" ? "Não foi possível carregar os dados." : "Carregando dados..."}</p>
        : tipo === "metas" ? dados.metas.length ? <dl>{dados.metas.map((meta) => <div key={meta.id}><dt>Objetivo</dt><dd>{meta.objetivo}</dd><dt>Valor base → valor alvo</dt><dd>{valor(meta.valorBase, meta.unidadeMedida)} → {valor(meta.valorAlvo, meta.unidadeMedida)}</dd><dt>Prazo</dt><dd>{meta.prazo ?? "Não informado"}</dd><dt>Situação</dt><dd>{statusMeta[meta.status]}</dd><dd><Link to={`/do/ciclo/${cicloId}/plan/metas/${meta.id}/editar`}>Editar meta</Link></dd></div>)}</dl> : <p>Nenhuma meta registrada neste ciclo.</p>
          : dados.planos.length ? <dl>{dados.planos.map((plano) => <div key={plano.id}><dt>Plano de ação</dt><dd>{plano.nome}</dd><dt>Situação</dt><dd>{statusPlano[plano.status]}</dd><dd><Link to={`/do/ciclo/${cicloId}/plan/planos/${plano.id}/editar`}>Editar plano de ação</Link></dd></div>)}</dl> : <p>Nenhum plano de ação registrado neste ciclo.</p>}
      {tipo === "planos" && <p>Os detalhes 5W2H não estão disponíveis nesta consulta.</p>}
    </section><aside className="plan-detalhe-problema_cartao plan-detalhe-problema_acoes"><h3>{tipo === "metas" ? "Resultado esperado" : "Acompanhamento"}</h3>
      <p>Consulte os dados do ciclo e mantenha as informações atualizadas.</p>
      <button type="button" disabled>Editar {tipo === "metas" ? "meta" : "plano de ação"}</button>{tipo === "metas" ? <Link to={`/do/ciclo/${cicloId}/plan/metas/criar`}>Criar meta</Link> : <Link to={`/do/ciclo/${cicloId}/plan/planos/criar`}>Criar plano de ação</Link>}
      {tipo === "planos" && <button type="button" disabled>Enviar para aprovação</button>}
    </aside></div>
  </section>;
}

export function PaginaPlanMetasEPlanos({ tipo }: { tipo: Tipo }) {
  const { cicloId } = useParams();
  const id = Number(cicloId);
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan"><PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
    {Number.isSafeInteger(id) && id > 0 ? <Conteudo key={`${id}:${tipo}`} cicloId={id} tipo={tipo} /> : <p role="alert">Ciclo inválido.</p>}
  </PainelCicloPlanDo></main>;
}

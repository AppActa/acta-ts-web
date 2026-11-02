import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listarMetasPorCicloPg, listarPlanosPorCicloPg, listarUsuariosDoCicloPg, obterPlano5W2HPg, type MetaPg, type PlanoAcaoPg, type Plano5W2HPg } from "../../../services/api/pg/dashboard.read.api";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import "../../../../features/plan/styles/pagina-plan-detalhe-problema.css";

type Tipo = "metas" | "planos";
type Dados = { estado: "carregando" | "erro" } | { estado: "sucesso"; metas: MetaPg[]; planos: PlanoAcaoPg[] };
const statusMeta: Record<MetaPg["status"], string> = { NAO_INICIADA: "Não iniciada", EM_ANDAMENTO: "Em andamento", ATINGIDA: "Atingida", PARCIALMENTE_ATINGIDA: "Parcialmente atingida", NAO_ATINGIDA: "Não atingida", CANCELADA: "Cancelada" };
const statusPlano: Record<PlanoAcaoPg["status"], string> = { RASCUNHO: "Rascunho", APROVADO: "Aprovado", EM_EXECUCAO: "Em execução", CONCLUIDO: "Concluído", CANCELADO: "Cancelado" };
const valor = (numero: number | null, unidade: string | null) => numero === null ? "Não informado" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(numero)}${unidade ? ` ${unidade}` : ""}`;

function Detalhes5W2H({ planoId, cicloId }: { planoId: number; cicloId: number }) {
  const [dados, setDados] = useState<{ estado: "carregando" | "erro" | "vazio" } | { estado: "sucesso"; plano: Plano5W2HPg; responsavel: string | null }>({ estado: "carregando" });
  useEffect(() => {
    const controller = new AbortController();
    setDados({ estado: "carregando" });
    void obterPlano5W2HPg(planoId, controller.signal).then(async (plano) => {
      if (controller.signal.aborted) return;
      if (!plano) { setDados({ estado: "vazio" }); return; }
      const usuarios = await listarUsuariosDoCicloPg(cicloId, controller.signal).catch(() => null);
      if (!controller.signal.aborted) setDados({ estado: "sucesso", plano, responsavel: usuarios?.find((p) => p.idUsuario === plano.idWhoResponsavel)?.nomeUsuario ?? null });
    }).catch(() => { if (!controller.signal.aborted) setDados({ estado: "erro" }); });
    return () => controller.abort();
  }, [planoId, cicloId]);
  if (dados.estado !== "sucesso") return <p role={dados.estado === "erro" ? "alert" : "status"}>{dados.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando 5W2H..." /> : dados.estado === "vazio" ? "Este plano ainda não possui 5W2H." : "Não foi possível carregar o 5W2H deste plano."}</p>;
  const p = dados.plano;
  return <dl aria-label="Detalhes do 5W2H"><div><dt>O quê?</dt><dd>{p.whatAcao}</dd><dt>Por quê?</dt><dd>{p.whyJustificativa}</dd><dt>Onde?</dt><dd>{p.whereLocal}</dd><dt>Como?</dt><dd>{p.howModoExecucao}</dd><dt>Início</dt><dd>{p.whenInicio ?? "Não informado"}</dd><dt>Término</dt><dd>{p.whenFim}</dd><dt>Responsável</dt><dd>{dados.responsavel ?? `ID ${p.idWhoResponsavel}`}</dd><dt>Quanto custa?</dt><dd>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.howMuchCusto)}</dd></div></dl>;
}

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
      {dados.estado !== "sucesso" ? <p role={dados.estado === "erro" ? "alert" : "status"}>{dados.estado === "erro" ? "Não foi possível carregar os dados." : <CarregandoConteudo compacto mensagem="Carregando dados..." />}</p>
        : tipo === "metas" ? dados.metas.length ? <dl>{dados.metas.map((meta) => <div key={meta.id}><dt>Objetivo</dt><dd>{meta.objetivo}</dd><dt>Valor base → valor alvo</dt><dd>{valor(meta.valorBase, meta.unidadeMedida)} → {valor(meta.valorAlvo, meta.unidadeMedida)}</dd><dt>Prazo</dt><dd>{meta.prazo ?? "Não informado"}</dd><dt>Situação</dt><dd>{statusMeta[meta.status]}</dd><dd><Link to={`/do/ciclo/${cicloId}/plan/metas/${meta.id}/editar`}>Editar meta</Link></dd></div>)}</dl> : <p>Nenhuma meta registrada neste ciclo.</p>
          : dados.planos.length ? <div>{dados.planos.map((plano) => <article key={plano.id}><h4>{plano.nome}</h4><p>Situação: {statusPlano[plano.status]}</p><Detalhes5W2H planoId={plano.id} cicloId={cicloId} /><Link to={`/do/ciclo/${cicloId}/plan/planos/${plano.id}/editar`}>Editar plano de ação</Link></article>)}</div> : <p>Nenhum plano de ação registrado neste ciclo.</p>}
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

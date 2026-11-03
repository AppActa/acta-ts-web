import { useId } from "react";
import { Link } from "react-router-dom";
import { CarregandoConteudo } from "../../layout/CarregandoConteudo";
import type { DadosCicloAct, DetalheCicloActProps, EstadoConteudoCicloAct, ProgressoCicloAct, ConteudoCicloActProps } from "../../../types/act";
export type { DadosCicloAct, DetalheCicloAct, EstadoConteudoCicloAct, ProgressoCicloAct, ConteudoCicloActProps } from "../../../types/act";

const formatadorNumero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
function formatarContagem(valor: number | null | undefined): string {
  return typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0
    ? formatadorNumero.format(valor) : "Indisponível";
}

function Detalhe({ dados, mensagem }: DetalheCicloActProps) {
  return dados?.destaque.trim() ? <>
    <p className="ciclo-act_destaque">{dados.destaque}</p>
    {dados.descricao?.trim() && <p className="ciclo-act_descricao">{dados.descricao}</p>}
  </> : <p className="ciclo-act_estado">{mensagem}</p>;
}

export function ConteudoCicloAct({ resultado = { estado: "indisponivel" }, cicloId, aoTentarNovamente }: ConteudoCicloActProps) {
  const id = useId();
  const dados = resultado.estado === "sucesso" ? resultado.dados : null;
  const mensagem = resultado.estado === "carregando" ? "Carregando dados de Act."
    : resultado.estado === "erro" ? "Não foi possível carregar os dados de Act. Tente novamente mais tarde."
    : resultado.estado === "vazio" ? "Nenhum dado de Act registrado para este ciclo."
    : "Dados de Act indisponíveis para este ciclo.";
  const mensagemCard = dados ? "Dados indisponíveis." : mensagem;
  const progresso = dados?.progresso;
  const progressoValido = progresso != null
    && Number.isSafeInteger(progresso.concluidos) && Number.isSafeInteger(progresso.total)
    && progresso.total > 0 && progresso.concluidos >= 0 && progresso.concluidos <= progresso.total;

  return (
    <div className="ciclo-act_conteudo" data-estado={resultado.estado} aria-busy={resultado.estado === "carregando"}>
      {!dados && (resultado.estado === "carregando" ? <CarregandoConteudo compacto mensagem={mensagem} /> : <p className="ciclo-act_estado ciclo-act_estado-geral" role={resultado.estado === "erro" ? "alert" : "status"}>{mensagem}</p>)}
      {resultado.estado === "erro" && aoTentarNovamente && <button className="ciclo-act_acao" type="button" onClick={aoTentarNovamente}>Tentar carregar o resumo novamente</button>}
      <section className="ciclo-act_metricas" aria-label="Resumo de Act">
        <dl className="ciclo-act_metricas-lista">
          <div className="ciclo-act_metrica" data-metrica="itens-padrao">
            <dt className="ciclo-act_metrica-titulo">Padrões registrados</dt>
            <dd className="ciclo-act_metrica-valor">{formatarContagem(dados?.metricas.itensPadrao)}</dd>
          </div>
          <div className="ciclo-act_metrica" data-metrica="licoes">
            <dt className="ciclo-act_metrica-titulo">Lições registradas</dt>
            <dd className="ciclo-act_metrica-valor">{formatarContagem(dados?.metricas.licoes)}</dd>
          </div>
        </dl>
      </section>

      <div className="ciclo-act_cards">
        <section className="ciclo-act_card ciclo-act_documento" aria-labelledby={`${id}-documento`}>
          <h2 className="ciclo-act_titulo" id={`${id}-documento`}>Documento padrão</h2>
          <Detalhe dados={dados?.documentoPadrao} mensagem={mensagemCard} />
          {cicloId ? <a className="ciclo-act_acao" href="#act-workflow-titulo">Ver padrões</a> : <span className="ciclo-act_estado">Ciclo indisponível.</span>}
        </section>
        <section className="ciclo-act_card ciclo-act_auditoria" aria-labelledby={`${id}-auditoria`}>
          <h2 className="ciclo-act_titulo" id={`${id}-auditoria`}>Checklists de auditoria</h2>
          <Detalhe dados={dados?.comunicacaoAuditoria} mensagem={mensagemCard} />
          {cicloId ? <a className="ciclo-act_acao" href="#act-workflow-titulo">Abrir checklists</a> : <span className="ciclo-act_estado">Ciclo indisponível.</span>}
        </section>
        <section className="ciclo-act_card ciclo-act_licoes" aria-labelledby={`${id}-licoes`}>
          <h2 className="ciclo-act_titulo" id={`${id}-licoes`}>Lições aprendidas</h2>
          <Detalhe dados={dados?.licoesAprendidas} mensagem={mensagemCard} />
          {cicloId ? <Link className="ciclo-act_acao" to={`/do/ciclo/${cicloId}/act/aprendizados`}>Abrir aprendizados</Link> : <button className="ciclo-act_acao" type="button" disabled aria-describedby={`${id}-acoes`}>Abrir aprendizados</button>}
        </section>
        <section className="ciclo-act_card ciclo-act_progresso" aria-labelledby={`${id}-progresso`}>
          <h2 className="ciclo-act_titulo" id={`${id}-progresso`}>Conformidade das auditorias</h2>
          {progressoValido ? <>
            <p className="ciclo-act_destaque">{formatarContagem(progresso.concluidos)} de {formatarContagem(progresso.total)} itens concluídos</p>
            <progress className="ciclo-act_progresso-barra" value={progresso.concluidos} max={progresso.total} aria-labelledby={`${id}-progresso`} />
            <p className="ciclo-act_progresso-percentual">{formatadorNumero.format((progresso.concluidos / progresso.total) * 100)}% concluído</p>
            <p className="ciclo-act_descricao">{formatarContagem(progresso.total - progresso.concluidos)} itens pendentes.</p>
          </> : <p className="ciclo-act_estado">{dados ? "A API ainda não calcula um resultado consolidado." : mensagemCard}</p>}
        </section>
      </div>
      <p className="ciclo-act_aviso" id={`${id}-acoes`}>A API registra respostas dos checklists; agendamento, conformidade consolidada e tratamento de não conformidades ainda não estão disponíveis.</p>
    </div>
  );
}

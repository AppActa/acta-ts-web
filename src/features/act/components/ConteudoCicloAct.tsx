import { useId } from "react";

export type DetalheCicloAct = { destaque: string; descricao: string | null };
export type ProgressoCicloAct = { concluidos: number; total: number };
export type DadosCicloAct = {
  metricas: {
    itensPadrao: number | null;
    proximaAuditoria: string | null;
    licoes: number | null;
  };
  documentoPadrao: DetalheCicloAct | null;
  comunicacaoAuditoria: DetalheCicloAct | null;
  licoesAprendidas: DetalheCicloAct | null;
  progresso: ProgressoCicloAct | null;
};
export type EstadoConteudoCicloAct =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "vazio" }
  | { estado: "indisponivel" }
  | { estado: "sucesso"; dados: DadosCicloAct };
export type ConteudoCicloActProps = { resultado?: EstadoConteudoCicloAct };

const formatadorNumero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const formatadorData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function formatarContagem(valor: number | null | undefined): string {
  return typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0
    ? formatadorNumero.format(valor) : "Indisponível";
}

function formatarData(valor: string | null | undefined): string {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return "Indisponível";
  const data = new Date(`${valor}T00:00:00Z`);
  return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor
    ? formatadorData.format(data) : "Indisponível";
}

function Detalhe({ dados, mensagem }: { dados: DetalheCicloAct | null | undefined; mensagem: string }) {
  return dados?.destaque.trim() ? <>
    <p className="ciclo-act_destaque">{dados.destaque}</p>
    {dados.descricao?.trim() && <p className="ciclo-act_descricao">{dados.descricao}</p>}
  </> : <p className="ciclo-act_estado">{mensagem}</p>;
}

export function ConteudoCicloAct({ resultado = { estado: "indisponivel" } }: ConteudoCicloActProps) {
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
      {!dados && <p className="ciclo-act_estado ciclo-act_estado-geral" role={resultado.estado === "erro" ? "alert" : "status"}>{mensagem}</p>}
      <section className="ciclo-act_metricas" aria-label="Resumo de Act">
        <dl className="ciclo-act_metricas-lista">
          <div className="ciclo-act_metrica" data-metrica="itens-padrao">
            <dt className="ciclo-act_metrica-titulo">Itens de padrão</dt>
            <dd className="ciclo-act_metrica-valor">{formatarContagem(dados?.metricas.itensPadrao)}</dd>
          </div>
          <div className="ciclo-act_metrica" data-metrica="auditoria">
            <dt className="ciclo-act_metrica-titulo">Próxima auditoria</dt>
            <dd className="ciclo-act_metrica-valor">{formatarData(dados?.metricas.proximaAuditoria)}</dd>
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
          <button className="ciclo-act_acao" type="button" disabled aria-describedby={`${id}-acoes`}>Abrir padronização</button>
        </section>
        <section className="ciclo-act_card ciclo-act_auditoria" aria-labelledby={`${id}-auditoria`}>
          <h2 className="ciclo-act_titulo" id={`${id}-auditoria`}>Comunicação e auditoria</h2>
          <Detalhe dados={dados?.comunicacaoAuditoria} mensagem={mensagemCard} />
          <button className="ciclo-act_acao" type="button" disabled aria-describedby={`${id}-acoes`}>Ver plano de auditoria</button>
        </section>
        <section className="ciclo-act_card ciclo-act_licoes" aria-labelledby={`${id}-licoes`}>
          <h2 className="ciclo-act_titulo" id={`${id}-licoes`}>Lições aprendidas</h2>
          <Detalhe dados={dados?.licoesAprendidas} mensagem={mensagemCard} />
          <button className="ciclo-act_acao" type="button" disabled aria-describedby={`${id}-acoes`}>Abrir aprendizados</button>
        </section>
        <section className="ciclo-act_card ciclo-act_progresso" aria-labelledby={`${id}-progresso`}>
          <h2 className="ciclo-act_titulo" id={`${id}-progresso`}>Padronização do ciclo</h2>
          {progressoValido ? <>
            <p className="ciclo-act_destaque">{formatarContagem(progresso.concluidos)} de {formatarContagem(progresso.total)} itens concluídos</p>
            <progress className="ciclo-act_progresso-barra" value={progresso.concluidos} max={progresso.total} aria-labelledby={`${id}-progresso`} />
            <p className="ciclo-act_progresso-percentual">{formatadorNumero.format((progresso.concluidos / progresso.total) * 100)}% concluído</p>
            <p className="ciclo-act_descricao">{formatarContagem(progresso.total - progresso.concluidos)} itens pendentes.</p>
          </> : <p className="ciclo-act_estado">{mensagemCard}</p>}
        </section>
      </div>
      <p className="ciclo-act_aviso" id={`${id}-acoes`}>Ações de padronização, auditoria e aprendizados indisponíveis nesta etapa.</p>
    </div>
  );
}

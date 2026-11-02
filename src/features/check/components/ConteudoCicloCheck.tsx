import { useId, type CSSProperties, type ReactNode } from "react";

export type MetricaCicloCheck = { valor: number | null; contexto?: string };
export type SituacaoIndicadorCheck = "atingida" | "acompanhar" | "indisponivel";
export type ResultadoIndicadorCheck = {
  id: string;
  titulo: string;
  antes: number | null;
  atual: number | null;
  meta: number | null;
  unidade: string;
  periodo: string;
  situacao: SituacaoIndicadorCheck;
};
export type VerificacaoCicloCheck = {
  id: string;
  titulo: string;
  detalhe?: string;
  situacao: "registrada" | "acompanhar" | "indisponivel" | "nao-verificado" | "aprovado" | "parcial" | "reprovado";
  data?: string | null;
  acaoDetalhe?: ReactNode;
};
export type MetaCicloCheck = {
  id: string;
  objetivo: string;
  base: number | null;
  alvo: number | null;
  unidade: string | null;
  prazo: string | null;
  status: "NAO_INICIADA" | "EM_ANDAMENTO" | "ATINGIDA" | "PARCIALMENTE_ATINGIDA" | "NAO_ATINGIDA" | "CANCELADA";
};
export type ComparacaoCicloCheck = {
  id: string;
  titulo: string;
  antes: number;
  atual: number;
  unidade: string;
  periodo: string;
  escalaMaxima: number;
};
export type DadosCicloCheck = {
  metricas: {
    indicadores: MetricaCicloCheck;
    metasAtingidas: MetricaCicloCheck;
    verificacoes: MetricaCicloCheck;
    efeitosSecundarios: MetricaCicloCheck;
  };
  resultados: readonly ResultadoIndicadorCheck[] | null;
  metas?: readonly MetaCicloCheck[] | null;
  verificacoes: readonly VerificacaoCicloCheck[];
  comparacoes: readonly ComparacaoCicloCheck[] | null;
};
export type EstadoConteudoCicloCheck =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "vazio"; dados?: DadosCicloCheck }
  | { estado: "indisponivel" }
  | { estado: "sucesso"; dados: DadosCicloCheck };
export type ConteudoCicloCheckProps = { resultado?: EstadoConteudoCicloCheck; acaoRegistrar?: ReactNode };

const rotulosSituacao = {
  atingida: "Atingida",
  acompanhar: "Em acompanhamento",
  indisponivel: "Indisponível",
  registrada: "Registrada",
  "nao-verificado": "Não verificado",
  aprovado: "Aprovado",
  parcial: "Parcial",
  reprovado: "Reprovado",
} as const;
const rotulosMeta = {
  NAO_INICIADA: "Não iniciada", EM_ANDAMENTO: "Em andamento", ATINGIDA: "Atingida",
  PARCIALMENTE_ATINGIDA: "Parcialmente atingida", NAO_ATINGIDA: "Não atingida", CANCELADA: "Cancelada",
} as const;
const metricas = [
  ["indicadores", "Indicadores"],
  ["metasAtingidas", "Metas atingidas"],
  ["verificacoes", "Verificações"],
  ["efeitosSecundarios", "Efeitos secundários"],
] as const;
const formatador = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function formatarValor(valor: number | null | undefined, unidade = "") {
  return typeof valor === "number" && Number.isFinite(valor)
    ? `${formatador.format(valor)}${unidade ? ` ${unidade}` : ""}`
    : "Indisponível";
}

function estiloBarra(valor: number, escala: number): CSSProperties {
  const percentual = (Math.min(escala, Math.max(0, valor)) / escala) * 100;
  return { width: `${Math.min(100, Math.max(0, percentual))}%` };
}

function Comparacao({ item }: { item: ComparacaoCicloCheck }) {
  const valida = Number.isFinite(item.antes) && Number.isFinite(item.atual)
    && Number.isFinite(item.escalaMaxima) && item.escalaMaxima > 0
    && item.antes >= 0 && item.atual >= 0
    && Boolean(item.unidade.trim() && item.periodo.trim());
  return (
    <li className="ciclo-check_comparacao-item">
      <h3 className="ciclo-check_item-titulo">{item.titulo}</h3>
      {valida ? <>
        <div className="ciclo-check_barras" aria-hidden="true">
          <div className="ciclo-check_barra ciclo-check_barra-antes" style={estiloBarra(item.antes, item.escalaMaxima)} />
          <div className="ciclo-check_barra ciclo-check_barra-atual" style={estiloBarra(item.atual, item.escalaMaxima)} />
        </div>
        <p className="ciclo-check_legenda">Antes {formatarValor(item.antes, item.unidade)} · Atual {formatarValor(item.atual, item.unidade)}</p>
        <p className="ciclo-check_detalhe">Período: {item.periodo}</p>
      </> : <p className="ciclo-check_estado">Comparação indisponível: faltam valores, unidade, período ou escala válidos.</p>}
    </li>
  );
}

export function ConteudoCicloCheck({ resultado = { estado: "indisponivel" }, acaoRegistrar }: ConteudoCicloCheckProps) {
  const id = useId();
  const dados = resultado.estado === "sucesso" || resultado.estado === "vazio" ? resultado.dados : null;
  const mensagem = resultado.estado === "carregando" ? "Carregando dados de Check."
    : resultado.estado === "erro" ? "Não foi possível carregar os dados de Check. Tente novamente mais tarde."
    : resultado.estado === "vazio" ? "Nenhum dado de Check registrado para este ciclo."
    : "Dados de Check indisponíveis para este ciclo.";
  const mensagemLista = dados || resultado.estado === "vazio" ? "Nenhum registro disponível." : mensagem;

  return (
    <div className="ciclo-check_conteudo" data-estado={resultado.estado} aria-busy={resultado.estado === "carregando"}>
      {(!dados || resultado.estado === "vazio") && <p className="ciclo-check_estado ciclo-check_estado-geral" role={resultado.estado === "erro" ? "alert" : "status"}>{mensagem}</p>}
      <section className="ciclo-check_metricas" aria-label="Resumo de Check">
        <dl className="ciclo-check_metricas-lista">
          {metricas.map(([chave, titulo]) => {
            const metrica = dados?.metricas[chave];
            const valor = metrica?.valor;
            const valida = typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0;
            return <div className="ciclo-check_metrica" data-metrica={chave} key={chave}>
              <dt className="ciclo-check_metrica-titulo">{titulo}</dt>
              <dd className="ciclo-check_metrica-valor">{valida ? formatarValor(valor) : "Indisponível"}</dd>
              {valida && metrica?.contexto && <dd className="ciclo-check_metrica-contexto">{metrica.contexto}</dd>}
            </div>;
          })}
        </dl>
      </section>

      <section className="ciclo-check_resultados" aria-labelledby={`${id}-resultados`}>
        <h2 className="ciclo-check_titulo" id={`${id}-resultados`}>Resultados dos indicadores</h2>
        <p className="ciclo-check_descricao">Leituras atuais de indicadores permanecem indisponíveis sem uma fonte correspondente.</p>
        {dados?.resultados && dados.resultados.length > 0 ? <ul className="ciclo-check_lista">
          {dados.resultados.map((item) => <li className="ciclo-check_item" key={item.id}>
            <div className="ciclo-check_item-conteudo">
              <h3 className="ciclo-check_item-titulo">{item.titulo}</h3>
              <p className="ciclo-check_detalhe">Antes {formatarValor(item.antes, item.unidade)} · Atual {formatarValor(item.atual, item.unidade)} · Meta {formatarValor(item.meta, item.unidade)}</p>
              {item.periodo && <p className="ciclo-check_detalhe">Período: {item.periodo}</p>}
            </div>
            <span className="ciclo-check_badge" data-estado={item.situacao}>{rotulosSituacao[item.situacao]}</span>
          </li>)}
        </ul> : <p className="ciclo-check_estado">{dados?.resultados === null ? "Resultados atuais dos indicadores indisponíveis." : mensagemLista}</p>}
        {dados?.metas != null && <section aria-labelledby={`${id}-metas`}>
          <h3 className="ciclo-check_titulo" id={`${id}-metas`}>Metas do ciclo</h3>
          <p className="ciclo-check_descricao">Base e alvo são valores de planejamento; não representam uma leitura atual.</p>
          {dados.metas.length > 0 ? <ul className="ciclo-check_lista">
            {dados.metas.map((meta) => <li className="ciclo-check_item" key={meta.id}>
              <div className="ciclo-check_item-conteudo">
                <h4 className="ciclo-check_item-titulo">{meta.objetivo}</h4>
                <p className="ciclo-check_detalhe">Base {formatarValor(meta.base, meta.unidade ?? "")} · Alvo {formatarValor(meta.alvo, meta.unidade ?? "")}</p>
                <p className="ciclo-check_detalhe">Unidade: {meta.unidade?.trim() || "Não informada"} · Prazo: {meta.prazo ?? "Não informado"}</p>
              </div>
              <span className="ciclo-check_badge" data-estado={meta.status === "ATINGIDA" ? "atingida" : meta.status === "CANCELADA" ? "indisponivel" : "acompanhar"}>{rotulosMeta[meta.status]}</span>
            </li>)}
          </ul> : <p className="ciclo-check_estado">Nenhuma meta registrada para este ciclo.</p>}
        </section>}
      </section>

      <section className="ciclo-check_verificacoes" aria-labelledby={`${id}-verificacoes`}>
        <h2 className="ciclo-check_titulo" id={`${id}-verificacoes`}>Verificações recentes</h2>
        {dados && dados.verificacoes.length > 0 ? <ul className="ciclo-check_lista">
          {dados.verificacoes.map((item) => <li className="ciclo-check_item" key={item.id}>
            <div className="ciclo-check_item-conteudo">
              <h3 className="ciclo-check_item-titulo">{item.acaoDetalhe ?? item.titulo}</h3>
              {item.detalhe && <p className="ciclo-check_detalhe">{item.detalhe}</p>}
              <p className="ciclo-check_detalhe">Data: {item.data ? item.data : "Não informada"}</p>
            </div>
            <span className="ciclo-check_badge" data-estado={item.situacao}>{rotulosSituacao[item.situacao]}</span>
          </li>)}
        </ul> : <p className="ciclo-check_estado">{mensagemLista}</p>}
        {acaoRegistrar ?? <button className="ciclo-check_acao" type="button" disabled aria-describedby={`${id}-registro`}>Registrar verificações</button>}
        {!acaoRegistrar && <p className="ciclo-check_detalhe" id={`${id}-registro`}>Registro de verificações indisponível no momento.</p>}
      </section>

      <section className="ciclo-check_comparacao" aria-labelledby={`${id}-comparacao`}>
        <div className="ciclo-check_comparacao-cabecalho">
          <h2 className="ciclo-check_titulo" id={`${id}-comparacao`}>Indicadores · antes e atual</h2>
          <p className="ciclo-check_descricao">Comparar a mesma unidade e período.</p>
        </div>
        {dados?.comparacoes && dados.comparacoes.length > 0 ? <ul className="ciclo-check_comparacao-lista">
          {dados.comparacoes.map((item) => <Comparacao key={item.id} item={item} />)}
        </ul> : <p className="ciclo-check_estado">{dados?.comparacoes === null ? "Comparação antes e atual indisponível: não há leituras correspondentes." : mensagemLista}</p>}
      </section>
    </div>
  );
}

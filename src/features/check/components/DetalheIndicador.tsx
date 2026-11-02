import { useId, type ReactNode } from "react";

export type DetalheIndicadorProps = {
  acaoFechar?: ReactNode;
  estado?: "carregando" | "erro" | "nao-encontrado" | "indisponivel";
};

export function DetalheIndicador({ acaoFechar, estado = "indisponivel" }: DetalheIndicadorProps) {
  const id = useId();
  const mensagem = estado === "carregando" ? "Carregando ciclo."
    : estado === "erro" ? "Não foi possível carregar o ciclo. Tente novamente mais tarde."
    : estado === "nao-encontrado" ? "Indicador ou ciclo não encontrado para esta conta."
    : "Dados do indicador indisponíveis: não há uma fonte de indicadores e leituras confirmada.";
  return (
    <section className="detalhe-indicador_modal" aria-labelledby={`${id}-titulo`} data-estado={estado} aria-busy={estado === "carregando"}>
      <div className="detalhe-indicador_fechar">{acaoFechar}</div>
      <h1 className="detalhe-indicador_titulo" id={`${id}-titulo`}>Detalhes do indicador</h1>
      <p className="detalhe-indicador_estado" role={estado === "erro" || estado === "nao-encontrado" ? "alert" : "status"}>{mensagem}</p>
      <div className="detalhe-indicador_cards">
        <section className="detalhe-indicador_serie" aria-labelledby={`${id}-serie`}>
          <h2 className="detalhe-indicador_subtitulo" id={`${id}-serie`}>Acompanhamento do indicador</h2>
          <p className="detalhe-indicador_descricao">Série histórica indisponível.</p>
        </section>
        <section className="detalhe-indicador_leitura" aria-labelledby={`${id}-leitura`}>
          <h2 className="detalhe-indicador_subtitulo" id={`${id}-leitura`}>Meta e leitura</h2>
          <p className="detalhe-indicador_descricao">Linha de base, valor atual e meta do indicador indisponíveis.</p>
          <p className="detalhe-indicador_descricao">As metas do ciclo não identificam um indicador ou uma série de leituras.</p>
        </section>
      </div>
    </section>
  );
}

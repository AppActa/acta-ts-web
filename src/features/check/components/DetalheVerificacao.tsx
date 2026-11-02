import { useId, type ReactNode } from "react";

export type DadosDetalheVerificacao = {
  resumo: string | null;
  observacao: string | null;
  status: "NAO_VERIFICADO" | "APROVADO" | "PARCIAL" | "REPROVADO";
  criadoEm: string | null;
  efeitosSecundarios: readonly {
    id: number;
    descricao: string | null;
    impactoEstimado: string | null;
    tipo: "POSITIVO" | "NEGATIVO" | null;
  }[];
};
export type ResultadoDetalheVerificacao =
  | { estado: "carregando" | "erro" | "nao-encontrado" | "indisponivel" }
  | { estado: "sucesso"; dados: DadosDetalheVerificacao };
export type DetalheVerificacaoProps = { acaoFechar?: ReactNode; resultado?: ResultadoDetalheVerificacao };

const rotulos = { NAO_VERIFICADO: "Não verificado", APROVADO: "Aprovado", PARCIAL: "Parcial", REPROVADO: "Reprovado" } as const;

function formatarData(valor: string | null): string {
  if (!valor || !Number.isFinite(Date.parse(valor))) return "Data não informada";
  return new Date(valor).toLocaleString("pt-BR");
}

export function DetalheVerificacao({ acaoFechar, resultado = { estado: "indisponivel" } }: DetalheVerificacaoProps) {
  const id = useId();
  const dados = resultado.estado === "sucesso" ? resultado.dados : null;
  const mensagem = resultado.estado === "carregando" ? "Carregando verificação."
    : resultado.estado === "erro" ? "Não foi possível carregar a verificação. Tente novamente mais tarde."
    : resultado.estado === "nao-encontrado" ? "Verificação não encontrada neste ciclo."
    : "Dados da verificação indisponíveis.";
  return (
    <section className="detalhe-verificacao_modal" aria-labelledby={`${id}-titulo`} data-estado={resultado.estado} aria-busy={resultado.estado === "carregando"}>
      <div className="detalhe-verificacao_fechar">{acaoFechar}</div>
      <h1 className="detalhe-verificacao_titulo" id={`${id}-titulo`}>Detalhes da verificação</h1>
      {!dados ? <p className="detalhe-verificacao_estado" role={resultado.estado === "erro" || resultado.estado === "nao-encontrado" ? "alert" : "status"}>{mensagem}</p> :
        <div className="detalhe-verificacao_cards">
          <section className="detalhe-verificacao_resultado" aria-labelledby={`${id}-resumo`}>
            <p className="detalhe-verificacao_status" data-estado={dados.status}>Resultado · {rotulos[dados.status]}</p>
            <h2 className="detalhe-verificacao_subtitulo" id={`${id}-resumo`}>Resumo da verificação</h2>
            <p className="detalhe-verificacao_texto">{dados.resumo?.trim() || "Resumo não informado."}</p>
            <h2 className="detalhe-verificacao_subtitulo">Observação</h2>
            <p className="detalhe-verificacao_texto">{dados.observacao?.trim() || "Observação indisponível."}</p>
            <p className="detalhe-verificacao_data">{formatarData(dados.criadoEm)}</p>
          </section>
          <section className="detalhe-verificacao_consultas" aria-labelledby={`${id}-contexto`}>
            <h2 className="detalhe-verificacao_subtitulo" id={`${id}-contexto`}>Consultar o contexto</h2>
            <p className="detalhe-verificacao_texto">{dados.efeitosSecundarios.length} efeitos secundários registrados para esta verificação.</p>
            {dados.efeitosSecundarios.length === 0 ? <p className="detalhe-verificacao_texto">Nenhum efeito secundário registrado.</p> :
              <ul className="detalhe-verificacao_efeitos">
                {dados.efeitosSecundarios.map((efeito) => <li className="detalhe-verificacao_efeito" key={efeito.id}>
                  <p className="detalhe-verificacao_texto">{efeito.descricao?.trim() || "Descrição não informada."}</p>
                  <p className="detalhe-verificacao_texto">Tipo: {efeito.tipo === "POSITIVO" ? "Positivo" : efeito.tipo === "NEGATIVO" ? "Negativo" : "Não informado"}</p>
                  <p className="detalhe-verificacao_texto">Impacto estimado: {efeito.impactoEstimado?.trim() || "Não informado"}</p>
                </li>)}
              </ul>}
            <p className="detalhe-verificacao_aviso">Arquivos de apoio indisponíveis nesta tela.</p>
          </section>
        </div>}
    </section>
  );
}

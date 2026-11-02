import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { useProblemasDoCiclo, type ResultadoProblemasDoCiclo } from "../hooks/useProblemasDoCiclo";
import iconeCriar from "../../ciclos/assets/icone-criar.svg";
import voltarMoldura from "../../ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../ciclos/assets/voltar-seta.svg";
import gatoSemProblemas from "../../ciclos/assets/primeiro-ciclo-gato.png";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-plan-identificacao-problema.css";
import "../styles/pagina-plan-problemas-registrados.css";

export type Problema = {
  id: string;
  titulo: string;
  descricao: string | null;
  peso: number | null;
  origem: string;
  persistencia: string;
  subproblemas: readonly string[];
};

function ConteudoProblemasRegistrados({ resultado, cicloId }: { resultado: ResultadoProblemasDoCiclo; cicloId: number }) {
  const criarHref = `/do/ciclo/${cicloId}/plan/identificacao-problema/criar`;
  const origens = { MANUAL: "Manual", IA: "IA", FORMULARIO: "Formulário", IMPORTACAO: "Importação", SISTEMA: "Sistema" } as const;
  const dados: readonly Problema[] | null = resultado.estado === "sucesso" || resultado.estado === "vazio"
    ? resultado.dados.map((item) => ({
      id: String(item.id), titulo: item.titulo, descricao: item.descricao,
      peso: item.peso,
      origem: item.origem === null ? "Origem não informada" : origens[item.origem],
      persistencia: item.persistente === null ? "Persistência não informada" : item.persistente ? "Persistente" : "Não persistente",
      subproblemas: item.subProblemas.map((filho) => filho.titulo),
    })) : null;
  const [busca, setBusca] = useState("");
  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const problemasFiltrados = dados?.filter((problema) => {
    if (!buscaNormalizada) return true;
    const textoPesquisavel = [
      problema.titulo,
      problema.descricao,
      problema.origem,
      problema.persistencia,
      ...problema.subproblemas,
    ].join(" ").toLocaleLowerCase("pt-BR");
    return textoPesquisavel.includes(buscaNormalizada);
  });

  if (resultado.estado === "vazio") return (
    <section className="plan-identificacao_conteudo" aria-labelledby="plan-identificacao-titulo">
      <header className="plan-identificacao_titulo-linha">
        <Link className="plan-identificacao_voltar" to={`/do/ciclo/${cicloId}/plan`} aria-label="Voltar ao resumo Plan">
          <img src={voltarMoldura} alt="" aria-hidden="true" /><img src={voltarSeta} alt="" aria-hidden="true" />
        </Link>
        <h2 id="plan-identificacao-titulo">Identificação do problema</h2>
      </header>
      <div className="plan-identificacao_vazio" role="status">
        <img className="plan-identificacao_ilustracao" src={gatoSemProblemas} alt="" />
        <h3>Nenhum problema registrado</h3>
        <p>Descreva o que está acontecendo para orientar a coleta de dados e a análise de causas.</p>
        <Link className="plan-identificacao_adicionar" to={criarHref}>Adicionar problema</Link>
      </div>
    </section>
  );

  return (
        <section className="plan-problemas-registrados_conteudo" aria-labelledby="plan-problemas-registrados-titulo" aria-busy={resultado.estado === "carregando"}>
          <header className="plan-problemas-registrados_cabecalho">
            <div className="plan-problemas-registrados_titulo-linha">
              <Link
                className="plan-problemas-registrados_voltar"
                to={`/do/ciclo/${cicloId}/plan`}
                aria-label="Voltar ao resumo Plan"
              >
                <img src={voltarMoldura} alt="" aria-hidden="true" />
                <img src={voltarSeta} alt="" aria-hidden="true" />
              </Link>
              <h2 id="plan-problemas-registrados-titulo">Identificação do problema</h2>
            </div>

            {criarHref ? <Link className="plan-problemas-registrados_criar" to={criarHref}>
              <img src={iconeCriar} alt="" aria-hidden="true" />
              <span>Criar novo</span>
            </Link> : <button className="plan-problemas-registrados_criar" type="button" disabled>
              <img src={iconeCriar} alt="" aria-hidden="true" />
              <span>Criar novo</span>
            </button>}
          </header>

          {dados !== null && <div className="plan-problemas-registrados_busca" role="search" aria-label="Buscar problemas registrados">
            <input
              id="plan-problemas-registrados-busca"
              type="search"
              aria-label="Buscar problemas registrados"
              placeholder="Buscar problemas registrados"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>}

          {dados === null ? (
            <p className="plan-problemas-registrados_estado" data-estado={resultado.estado} role={resultado.estado === "erro" ? "alert" : "status"} aria-live="polite">
              {resultado.estado === "carregando" ? "Carregando problemas do ciclo." : resultado.estado === "erro" ? "Não foi possível carregar os problemas. Tente novamente mais tarde." : "Dados de problemas indisponíveis para este ciclo."}
            </p>
          ) : !problemasFiltrados?.length ? (
            <p className="plan-problemas-registrados_vazio" role="status" aria-live="polite">
              Nenhum resultado para esta busca.
            </p>
          ) : (
            <ul className="plan-problemas-registrados_lista" aria-label="Problemas registrados">
              {problemasFiltrados.map((problema) => (
                <li className="plan-problemas-registrados_item" key={problema.id}>
                  <article className="plan-problemas-registrados_cartao" aria-labelledby={`problema-${problema.id}-titulo`}>
                    <div className="plan-problemas-registrados_detalhes">
                      <h3 id={`problema-${problema.id}-titulo`}><Link className="plan-problemas-registrados_link" to={`${criarHref.replace(/\/criar$/, "")}/${problema.id}`}>{problema.titulo}</Link></h3>
                      <p className="plan-problemas-registrados_descricao">{problema.descricao?.trim() || "Descrição não informada"}</p>
                      <p className="plan-problemas-registrados_metadados">
                        Peso {problema.peso === null ? "não informado" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(problema.peso * 100)}%`} · {problema.origem} · {problema.persistencia}
                      </p>
                      {problema.subproblemas.length > 0 ? (
                        <ul className="plan-problemas-registrados_subproblemas" aria-label={`Subproblemas de ${problema.titulo}`}>
                          {problema.subproblemas.map((subproblema, index) => (
                            <li key={`${problema.id}-subproblema-${index}`}>{subproblema}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="plan-problemas-registrados_sem-subproblemas">Sem subproblemas</p>
                      )}
                    </div>
                    <button
                      className="plan-problemas-registrados_menu"
                      type="button"
                      aria-label={`Mais opções para ${problema.titulo}`}
                      disabled
                    >
                      {/* # colocar imagem */}
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
  );
}

function ProblemasDoCicloValidado({ idCiclo }: { idCiclo: number }) {
  const resultado = useProblemasDoCiclo(idCiclo);
  return <ConteudoProblemasRegistrados key={idCiclo} resultado={resultado} cicloId={idCiclo} />;
}

export function PaginaPlanProblemasRegistrados() {
  const { cicloId } = useParams();
  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-problemas-registrados pagina-plan-identificacao">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
        <ProblemasDoCicloValidado key={cicloId} idCiclo={Number(cicloId)} />
      </PainelCicloPlanDo>
    </main>
  );
}

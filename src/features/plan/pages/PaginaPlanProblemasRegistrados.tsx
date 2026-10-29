import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import iconeCriar from "../../ciclos/assets/icone-criar.svg";
import voltarMoldura from "../../ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../ciclos/assets/voltar-seta.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../../ciclo/styles/painel-ciclo-plan-do.css";

export type Problema = {
  id: string;
  titulo: string;
  descricao: string;
  peso: number;
  origem: string;
  persistencia: string;
  subproblemas: readonly string[];
};

type PaginaPlanProblemasRegistradosProps = {
  dados?: readonly Problema[] | null;
};

export function PaginaPlanProblemasRegistrados({ dados }: PaginaPlanProblemasRegistradosProps) {
  const { cicloId } = useParams();
  const [busca, setBusca] = useState("");
  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const problemasFiltrados = (dados ?? []).filter((problema) => {
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

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-problemas-registrados">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan">
        <section className="plan-problemas-registrados_conteudo" aria-labelledby="plan-problemas-registrados-titulo">
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

            <button className="plan-problemas-registrados_criar" type="button" aria-disabled="true">
              <img src={iconeCriar} alt="" aria-hidden="true" />
              <span>Criar novo</span>
            </button>
          </header>

          <div className="plan-problemas-registrados_busca" role="search" aria-label="Buscar problemas registrados">
            <input
              id="plan-problemas-registrados-busca"
              type="search"
              aria-label="Buscar plano de auditoria"
              placeholder="Buscar plano de auditoria"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          {!dados?.length ? (
            <p className="plan-problemas-registrados_vazio" role="status" aria-live="polite">
              Nenhum problema registrado.
            </p>
          ) : problemasFiltrados.length === 0 ? (
            <p className="plan-problemas-registrados_vazio" role="status" aria-live="polite">
              Nenhum resultado para esta busca.
            </p>
          ) : (
            <ul className="plan-problemas-registrados_lista" aria-label="Problemas registrados">
              {problemasFiltrados.map((problema) => (
                <li className="plan-problemas-registrados_item" key={problema.id}>
                  <article className="plan-problemas-registrados_cartao" aria-labelledby={`problema-${problema.id}-titulo`}>
                    <div className="plan-problemas-registrados_detalhes">
                      <h3 id={`problema-${problema.id}-titulo`}>{problema.titulo}</h3>
                      <p className="plan-problemas-registrados_descricao">{problema.descricao}</p>
                      <p className="plan-problemas-registrados_metadados">
                        Peso {problema.peso}% · {problema.origem} · {problema.persistencia}
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
                      aria-disabled="true"
                    >
                      {/* # colocar imagem */}
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PainelCicloPlanDo>
    </main>
  );
}

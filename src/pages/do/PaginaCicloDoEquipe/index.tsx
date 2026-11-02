import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { Link, useParams } from "react-router-dom";
import type { PaginaCicloDoEquipeProps } from "../../../types/do";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CabecalhoNavegacaoCiclo } from "../../../components/ciclo/CabecalhoNavegacaoCiclo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import voltarMoldura from "../../../../features/ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../../../features/ciclos/assets/voltar-seta.svg";
import "../../../../features/do/styles/pagina-ciclo-do.css";
import "../../../../features/do/styles/pagina-ciclo-do-equipe.css";

export function PaginaCicloDoEquipe({ pessoas }: PaginaCicloDoEquipeProps) {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const listaPessoas = pessoas ?? [];

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-ciclo-do pagina-ciclo-do-equipe">
        <Sidebar />
        <div className="ciclo-do_painel">
          <section className="ciclo-do-equipe_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </main>
    );
  }
  const ciclo = resultadoCiclo.ciclo;

  return (
    <main className="pagina-ciclo-do pagina-ciclo-do-equipe">
      <Sidebar />
      <div className="ciclo-do_painel">
        <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva="do" />

        <div className="ciclo-do-equipe_conteudo">
          <header className="ciclo-do-equipe_titulo-linha">
            <Link className="ciclo-do-equipe_voltar" to={`/do/ciclo/${cicloId}/visao-geral`} aria-label="Voltar à visão geral do ciclo">
              <img src={voltarMoldura} alt="" aria-hidden="true" />
              <img src={voltarSeta} alt="" aria-hidden="true" />
            </Link>
            <h2>Equipe</h2>
          </header>

          <div className="ciclo-do-equipe_paineis">
            <section className="ciclo-do-equipe_pessoas" aria-labelledby="ciclo-do-equipe-pessoas-titulo">
              <header className="ciclo-do-equipe_pessoas-cabecalho">
                <h3 id="ciclo-do-equipe-pessoas-titulo">Pessoas do ciclo</h3>
                <span>{pessoas == null ? "Contagem indisponível" : `${listaPessoas.length} ${listaPessoas.length === 1 ? "pessoa" : "pessoas"}`}</span>
                <p>Participantes e permissões do ciclo.</p>
              </header>

              <table className="ciclo-do-equipe_tabela">
                <caption className="sr-only">Pessoas do ciclo, papel, participação e acesso</caption>
                <thead>
                  <tr>
                    <th scope="col">Pessoa</th>
                    <th scope="col">Papel</th>
                    <th scope="col">Participação</th>
                    <th scope="col">Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPessoas.map((pessoa) => (
                    <tr key={pessoa.id}>
                      <th scope="row">{pessoa.nome}</th>
                      <td>{pessoa.papel}</td>
                      <td>
                        <span
                          data-estado={
                            pessoa.estadoParticipacao === "ativa" || pessoa.estadoParticipacao === "pendente"
                              ? pessoa.estadoParticipacao
                              : "neutra"
                          }
                        >
                          {pessoa.participacao}
                        </span>
                      </td>
                      <td>{pessoa.acesso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pessoas == null ? (
                <p className="ciclo-do-equipe_vazio" role="status" aria-live="polite">Equipe ainda não consultada.</p>
              ) : listaPessoas.length === 0 ? (
                <p className="ciclo-do-equipe_vazio" role="status" aria-live="polite">Nenhuma pessoa no ciclo.</p>
              ) : null}
            </section>

            <section className="ciclo-do-equipe_convidar" aria-labelledby="ciclo-do-equipe-convidar-titulo">
              <h3 id="ciclo-do-equipe-convidar-titulo">Convidar pessoa</h3>
              <label htmlFor="ciclo-do-equipe-email">E-mail</label>
              <input id="ciclo-do-equipe-email" type="email" disabled />
              <label htmlFor="ciclo-do-equipe-papel">Papel no ciclo</label>
              <select id="ciclo-do-equipe-papel" disabled defaultValue="">
                <option value="">Selecionar papel</option>
              </select>
              <button type="button" disabled>Enviar convite</button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}


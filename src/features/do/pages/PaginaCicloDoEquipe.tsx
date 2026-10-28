import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import { obterCiclo } from "../../ciclo/data/ciclos";
import iconeVisaoGeral from "../assets/ciclo-visao-geral/063c5.svg";
import iconePlanAba from "../assets/ciclo-visao-geral/47893.svg";
import iconeDo from "../assets/ciclo-visao-geral/d01c2.svg";
import iconeCheckAba from "../assets/ciclo-visao-geral/fe2f6.svg";
import iconeActAba from "../assets/ciclo-visao-geral/a51ff.svg";
import voltarMoldura from "../../ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../ciclos/assets/voltar-seta.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../styles/pagina-ciclo-do.css";
import "../styles/pagina-ciclo-do-equipe.css";

export type PessoaEquipeDo = {
  id: string;
  nome: string;
  papel: string;
  participacao: string;
  estadoParticipacao?: "ativa" | "pendente" | "neutra" | (string & {});
  acesso: string;
};

type PaginaCicloDoEquipeProps = {
  pessoas?: readonly PessoaEquipeDo[] | null;
};

const etapas = [
  { nome: "Plan", classe: "plan", icone: iconePlanAba, destino: "plan" },
  { nome: "Do", classe: "do", icone: iconeDo, destino: "tarefas" },
  { nome: "Check", classe: "check", icone: iconeCheckAba, destino: null },
  { nome: "Act", classe: "act", icone: iconeActAba, destino: null },
] as const;

export function PaginaCicloDoEquipe({ pessoas }: PaginaCicloDoEquipeProps) {
  const { cicloId } = useParams();
  const ciclo = obterCiclo(cicloId);
  const listaPessoas = pessoas ?? [];
  const responsavel = listaPessoas.find((pessoa) => pessoa.papel.toLocaleLowerCase("pt-BR") === "responsável");

  return (
    <main className="pagina-ciclo-do pagina-ciclo-do-equipe">
      <Sidebar />
      <div className="ciclo-do_painel">
        <header className="ciclo-do_cabecalho">
          <span className="ciclo-do_cabecalho_icone" aria-hidden="true" />
          <div className="ciclo-do_identificacao">
            <div className="ciclo-do_titulo_linha">
              <h1>{ciclo.nome}</h1>
              <span className="ciclo-do_status">Status: Do</span>
            </div>
            <p><span>Responsável pelo ciclo:</span> {responsavel && <strong>{responsavel.nome}</strong>}</p>
            <p><span>Iniciado em:</span> <strong>{ciclo.inicio}</strong></p>
            <p><span>Prazo final:</span> <strong>{ciclo.prazo}</strong></p>
          </div>
        </header>

        <nav className="ciclo-do_abas" aria-label="Etapas do ciclo">
          <Link className="ciclo-do_aba ciclo-do_aba-visao ciclo-do_aba-visao-ativa" to={`/do/ciclo/${cicloId}/visao-geral`}>
            <img src={iconeVisaoGeral} alt="" />Visão geral
          </Link>
          {etapas.map((etapa) => etapa.destino ? (
            <Link className={`ciclo-do_aba ciclo-do_aba-${etapa.classe}`} to={`/do/ciclo/${cicloId}/${etapa.destino}`} key={etapa.nome}>
              <img src={etapa.icone} alt="" />{etapa.nome}
            </Link>
          ) : (
            <span className={`ciclo-do_aba ciclo-do_aba-${etapa.classe}`} aria-disabled="true" key={etapa.nome}>
              <img src={etapa.icone} alt="" />{etapa.nome}
            </span>
          ))}
        </nav>

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
                <span>{listaPessoas.length} {listaPessoas.length === 1 ? "pessoa" : "pessoas"}</span>
                <p>Acesso concedido apenas às pessoas envolvidas na execução.</p>
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
              {listaPessoas.length === 0 && (
                <p className="ciclo-do-equipe_vazio" role="status" aria-live="polite">Nenhuma pessoa no ciclo.</p>
              )}
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

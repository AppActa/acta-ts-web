import { useParams } from "react-router-dom";
import type { ResumoTarefasDoCicloProps } from "../../../types/do";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { CabecalhoNavegacaoCiclo } from "../../../components/ciclo/CabecalhoNavegacaoCiclo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useTarefasDoCiclo } from "../../../features/do/hooks/useTarefasDoCiclo";
import circuloPlan from "../../../../features/do/assets/ciclo-visao-geral/9576b.svg";
import iconePlan from "../../../../features/do/assets/ciclo-visao-geral/79e34.svg";
import circuloDo from "../../../../features/do/assets/ciclo-visao-geral/a380d.svg";
import iconeDo from "../../../../features/do/assets/ciclo-visao-geral/fe2f6.svg";
import circuloCheck from "../../../../features/do/assets/ciclo-visao-geral/61e69.svg";
import iconeCheck from "../../../../features/do/assets/ciclo-visao-geral/6c5ca.svg";
import circuloAct from "../../../../features/do/assets/ciclo-visao-geral/0afc5.svg";
import iconeAct from "../../../../features/do/assets/ciclo-visao-geral/3f4de.svg";
import "../../../../features/do/styles/pagina-ciclo-do.css";

const etapas = [
  { nome: "Plan", classe: "plan", circulo: circuloPlan, icone: iconePlan },
  { nome: "Do", classe: "do", circulo: circuloDo, icone: iconeDo },
  { nome: "Check", classe: "check", circulo: circuloCheck, icone: iconeCheck },
  { nome: "Act", classe: "act", circulo: circuloAct, icone: iconeAct },
];

const statusTarefas = [
  { valor: "PENDENTE", rotulo: "Pendente" }, { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "CONCLUIDA", rotulo: "Concluída" }, { valor: "BLOQUEADA", rotulo: "Bloqueada" },
  { valor: "ATRASADA", rotulo: "Atrasada" }, { valor: "CANCELADA", rotulo: "Cancelada" },
] as const;

function ResumoTarefasDoCiclo({ idCiclo }: ResumoTarefasDoCicloProps) {
  const resultado = useTarefasDoCiclo(idCiclo);
  if (resultado.estado === "carregando") return <div className="ciclo-do_card_tarefas"><CarregandoConteudo compacto mensagem="Carregando tarefas do ciclo" /></div>;
  if (resultado.estado === "erro") return <div className="ciclo-do_card_tarefas"><p role="alert">Contagens de tarefas indisponíveis.</p></div>;
  if (resultado.estado === "indisponivel") return <div className="ciclo-do_card_tarefas"><p role="status">Tarefas indisponíveis para este ciclo.</p></div>;

  return (
    <div className="ciclo-do_card_tarefas">
      <p>{resultado.dados.tarefas.length === 0 ? "Nenhuma tarefa encontrada neste ciclo." : "Contagem por status"}</p>
      <dl className="ciclo-do_tarefas_contagens">
        {statusTarefas.map((status) => <div key={status.valor} data-estado={status.valor}>
          <dt>{status.rotulo}</dt><dd>{resultado.dados.tarefas.filter((tarefa) => tarefa.status === status.valor).length}</dd>
        </div>)}
      </dl>
    </div>
  );
}

export function PaginaCicloDo() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-ciclo-do">
        <Sidebar />
        <div className="ciclo-do_painel">
          <section className="ciclo-do_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </main>
    );
  }
  const ciclo = resultadoCiclo.ciclo;
  return (
    <main className="pagina-ciclo-do">
      <Sidebar />
      <div className="ciclo-do_painel">
        <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva="visao-geral" />

        <div className="ciclo-do_conteudo">
          <section className="ciclo-do_status_ciclo" aria-labelledby="titulo-status-ciclo">
            <h2 id="titulo-status-ciclo">Status de ciclo</h2>
            <div className="ciclo-do_etapas">
              {etapas.map((etapa) => (
                <article className={`ciclo-do_etapa ciclo-do_etapa-${etapa.classe}`} key={etapa.nome}>
                  <span className="ciclo-do_etapa_icone" aria-hidden="true">
                    <img className="ciclo-do_etapa_circulo" src={etapa.circulo} alt="" />
                    <img className="ciclo-do_etapa_simbolo" src={etapa.icone} alt="" />
                  </span>
                  <div className="ciclo-do_etapa_texto"><strong>{etapa.nome}</strong><span>Status indisponível</span></div>
                  <span className="ciclo-do_etapa_percentual">Indisponível</span>
                </article>
              ))}
            </div>
          </section>

          <section className="ciclo-do_equipe" aria-labelledby="titulo-equipe">
            <h2 id="titulo-equipe">Equipe</h2>
            <div className="ciclo-do_membros"><p>Dados da equipe indisponíveis para este ciclo.</p></div>
          </section>

          <section className="ciclo-do_resumo ciclo-do_resumo-tarefas" aria-labelledby="titulo-tarefas">
            <h2 id="titulo-tarefas">Tarefas</h2>
            <ResumoTarefasDoCiclo idCiclo={ciclo.id} />
          </section>

          <section className="ciclo-do_resumo ciclo-do_resumo-indicador" aria-labelledby="titulo-indicador">
            <h2 id="titulo-indicador">Indicador</h2>
            <div className="ciclo-do_card_indicador"><span>Valor atual</span><strong>Indisponível</strong></div>
          </section>

          <section className="ciclo-do_decisoes" aria-labelledby="titulo-decisoes">
            <h2 id="titulo-decisoes">Próximas decisões</h2>
            <div className="ciclo-do_card_decisoes"><p><span><strong>Próximas decisões indisponíveis</strong><small>Nenhuma decisão foi inferida.</small></span></p></div>
          </section>
        </div>
      </div>

    </main>
  );
}

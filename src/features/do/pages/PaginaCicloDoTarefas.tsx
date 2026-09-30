import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../../layout/components/Sidebar";
import { obterCiclo } from "../../ciclo/data/ciclos";
import iconeVisaoGeral from "../assets/ciclo-visao-geral/063c5.svg";
import iconePlan from "../assets/ciclo-visao-geral/47893.svg";
import iconeDo from "../assets/ciclo-visao-geral/d01c2.svg";
import iconeCheck from "../assets/ciclo-visao-geral/fe2f6.svg";
import iconeAct from "../assets/ciclo-visao-geral/a51ff.svg";
import relogio from "../assets/ciclo-do/relogio.svg";
import iconeMais from "../assets/ciclo-do/mais.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../styles/pagina-ciclo-do-tarefas.css";

type Tarefa = { titulo: string; responsavel: string; prazo: string };
const colunas: { titulo: string; classe: string; tarefas: Tarefa[] }[] = [
  { titulo: "A fazer · 2", classe: "a-fazer", tarefas: [
    { titulo: "Preparar roteiro", responsavel: "Mariana Costa", prazo: "10/10" },
    { titulo: "Separar materiais", responsavel: "Ana Souza", prazo: "12/10" },
  ] },
  { titulo: "Em andamento · 2", classe: "andamento", tarefas: [
    { titulo: "Treinar equipe", responsavel: "Carlos Mendes", prazo: "14/10" },
    { titulo: "Ajustar checklist", responsavel: "Lucas Prado", prazo: "16/10" },
  ] },
  { titulo: "Concluídas · 1", classe: "concluidas", tarefas: [
    { titulo: "Mapear processo", responsavel: "Ana Souza", prazo: "05/10" },
  ] },
];

function AbasDoCiclo({ cicloId }: { cicloId: string | undefined }) {
  return (
    <nav className="ciclo-do_tarefas_abas" aria-label="Etapas do ciclo">
      <Link to={`/do/ciclo/${cicloId}/visao-geral`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-visao"><img src={iconeVisaoGeral} alt="" />Visão geral</Link>
      <Link to={`/do/ciclo/${cicloId}/plan`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-plan"><img src={iconePlan} alt="" />Plan</Link>
      <Link to={`/do/ciclo/${cicloId}/tarefas`} aria-current="page" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-do"><span className="ciclo-do_tarefas_icone-do"><img src={iconeDo} alt="" /></span>Do</Link>
      <button type="button" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-check" disabled><img src={iconeCheck} alt="" />Checar</button>
      <button type="button" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-act" disabled><img src={iconeAct} alt="" />Agir</button>
    </nav>
  );
}

export function PaginaCicloDoTarefas() {
  const { cicloId } = useParams();
  const ciclo = obterCiclo(cicloId);

  return (
    <main className="pagina-ciclo-do-tarefas">
      <Sidebar />
      <div className="ciclo-do_tarefas_painel">
        <header className="ciclo-do_tarefas_cabecalho">
          <div className="ciclo-do_tarefas_icone" aria-hidden="true"><img src={relogio} alt="" /></div>
          <div className="ciclo-do_tarefas_identificacao"><div className="ciclo-do_tarefas_linha"><h1>{ciclo.nome}</h1><span className="ciclo-do_tarefas_status">Status: Do</span></div><p><span>Responsável pelo ciclo:</span> Catarina Cândido</p><p><span>Iniciado em:</span> {ciclo.inicio}</p><p><span>Prazo final:</span> {ciclo.prazo}</p></div>
        </header>
        <AbasDoCiclo cicloId={cicloId} />
        <div className="ciclo-do_tarefas_conteudo">
          <section className="ciclo-do_quadro">
            <div className="ciclo-do_tarefas_titulo"><h2>Quadro de tarefas</h2><button type="button" disabled><img src={iconeMais} alt="" />Criar nova</button></div>
            <div className="ciclo-do_kanban">
              <p className="ciclo-do_kanban_instrucao">Organize as ações por etapa de execução.</p>
              {colunas.map((coluna) => (
                <section className={`ciclo-do_coluna ciclo-do_coluna-${coluna.classe}`} key={coluna.titulo}>
                  <h3>{coluna.titulo}</h3>
                  {coluna.tarefas.map((tarefa) => (
                    <article className="ciclo-do_tarefa" key={tarefa.titulo}>
                      <strong>{tarefa.titulo}</strong><span>{tarefa.responsavel}</span><time>{tarefa.prazo}</time>
                    </article>
                  ))}
                </section>
              ))}
            </div>
          </section>

          <section className="ciclo-do_resumo_lateral">
            <h2>Resumo do Do</h2><span className="ciclo-do_badge_andamento">Em andamento</span>
            <p className="ciclo-do_rotulo_progresso">Andamento geral</p><div className="ciclo-do_progresso_geral"><span /></div>
            <div className="ciclo-do_contadores">
              <article><span>Tarefas</span><strong>05</strong></article><article><span>Concluídas</span><strong>01</strong></article>
              <article><span>Em andamento</span><strong>02</strong></article><article><span>Atrasadas</span><strong>01</strong></article>
            </div>
            <p className="ciclo-do_alerta">1 treinamento ainda está pendente.</p>
            <Link className="ciclo-do_abrir_cronograma" to={`/do/ciclo/${cicloId}/cronograma`}>Abrir cronograma</Link>
            <p className="ciclo-do_dica">Reatribua ou reabra tarefas para atualizar o responsável e o prazo.</p>
          </section>

            <section className="ciclo-do_treinamentos">
            <h2>Treinamentos obrigatórios</h2><Link to={`/do/ciclo/${cicloId}/treinamentos`}><article><p>Integração ao processo · 3 de 4 pessoas concluíram.</p><span>75% concluído</span><div className="ciclo-do_barra_treinamento"><span /></div><span className="ciclo-do_link_botao">Abrir treinamentos</span></article></Link>
          </section>

          <section className="ciclo-do_prazos">
            <h2>Prazos e intervenções</h2><article><p>Resolva ou reatribua a ação para manter o cronograma.</p><span>1 tarefa aguardando compra<br />de leitores</span><button type="button" disabled>Ver bloqueios</button></article>
          </section>
        </div>
      </div>
    </main>
  );
}

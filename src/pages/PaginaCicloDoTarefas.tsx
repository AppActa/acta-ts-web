import { Link, useParams } from "react-router-dom";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-ciclo-do-tarefas.css";

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
      <Link to={`/do/ciclo/${cicloId}/visao-geral`} className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-visao"><span>⟳</span>Visão geral</Link>
      <button type="button" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-plan" disabled><span>▣</span>Plan</button>
      <Link to={`/do/ciclo/${cicloId}/tarefas`} aria-current="page" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-do"><span>▷</span>Do</Link>
      <button type="button" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-check" disabled><span>✓</span>Checar</button>
      <button type="button" className="ciclo-do_tarefas_aba ciclo-do_tarefas_aba-act" disabled><span>✧</span>Agir</button>
    </nav>
  );
}

export function PaginaCicloDoTarefas() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-do-tarefas">
      <BarraLateral />
      <div className="ciclo-do_tarefas_painel">
        <header className="ciclo-do_tarefas_cabecalho">
          <div className="ciclo-do_tarefas_icone" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="31" stroke="white" strokeWidth="5"/><path d="M40 22v20L28 52" stroke="white" strokeWidth="5" strokeLinecap="round"/></svg></div>
          <div><h1>Redução do tempo de atendimento</h1><span className="ciclo-do_tarefas_status">Status: Do</span><p><span>Responsável pelo ciclo:</span> Catarina Cândido</p><p><span>Iniciado em:</span> 26/05/2026</p><p><span>Prazo final:</span> 30/10/2026</p></div>
        </header>
        <AbasDoCiclo cicloId={cicloId} />
        <div className="ciclo-do_tarefas_conteudo">
          <section className="ciclo-do_quadro">
            <div className="ciclo-do_tarefas_titulo"><h2>Quadro de tarefas</h2><button type="button" disabled><span>＋</span>Criar novo</button></div>
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
            <button className="ciclo-do_abrir_cronograma" type="button" disabled>Abrir cronograma</button>
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

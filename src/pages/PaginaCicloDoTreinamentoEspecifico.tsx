import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../features/layout/components/Sidebar";
import { treinamentosDoCiclo } from "./PaginaCicloDoTreinamentos";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-ciclo-do-treinamento-especifico.css";

function AbasTreinamento({ cicloId }: { cicloId: string | undefined }) {
  return (
    <nav className="treinamento-especifico_abas" aria-label="Etapas do ciclo">
      <Link to={`/do/ciclo/${cicloId}/visao-geral`} className="treinamento-especifico_aba treinamento-especifico_aba-visao"><span>⟳</span>Visão geral</Link>
      <Link to={`/do/ciclo/${cicloId}/plan`} className="treinamento-especifico_aba treinamento-especifico_aba-plan"><span>▣</span>Plan</Link>
      <Link to={`/do/ciclo/${cicloId}/tarefas`} aria-current="page" className="treinamento-especifico_aba treinamento-especifico_aba-do"><span>▷</span>Do</Link>
      <button type="button" className="treinamento-especifico_aba treinamento-especifico_aba-check" disabled><span>✓</span>Checar</button>
      <button type="button" className="treinamento-especifico_aba treinamento-especifico_aba-act" disabled><span>✧</span>Agir</button>
    </nav>
  );
}

export function PaginaCicloDoTreinamentoEspecifico() {
  const { cicloId, treinamentoId } = useParams();
  const treinamento = treinamentosDoCiclo.find((item) => item.id === treinamentoId) ?? treinamentosDoCiclo[0];

  return (
    <main className="pagina-treinamento-especifico">
      <Sidebar />
      <div className="treinamento-especifico_painel">
        <header className="treinamento-especifico_cabecalho">
          <div className="treinamento-especifico_icone" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="31" stroke="white" strokeWidth="5"/><path d="M40 22v20L28 52" stroke="white" strokeWidth="5" strokeLinecap="round"/></svg></div>
          <div><h1>Redução do tempo de atendimento</h1><span className="treinamento-especifico_status">Status: Do</span><p><span>Responsável pelo ciclo:</span> Catarina Cândido</p><p><span>Iniciado em:</span> 26/05/2026</p><p><span>Prazo final:</span> 30/10/2026</p></div>
        </header>
        <AbasTreinamento cicloId={cicloId} />
        <div className="treinamento-especifico_conteudo">
          <div className="treinamento-especifico_titulo_linha"><Link to={`/do/ciclo/${cicloId}/treinamentos`} aria-label="Voltar aos treinamentos">‹</Link><h2>Treinamentos / {treinamento.titulo}</h2></div>

          <section className="treinamento-equipe">
            <h3>Acompanhamento da equipe</h3>
            <div className="treinamento-equipe_metrica"><span>Atribuídos</span><strong>12</strong><small>pessoas × módulos</small></div>
            <div className="treinamento-equipe_metrica"><span>Concluídos</span><strong>8</strong><small>67% do total</small></div>
            <div className="treinamento-equipe_metrica"><span>Pendentes</span><strong>4</strong><small>2 vencem nesta semana</small></div>
          </section>

          <section className="treinamento-selecionado">
            <h3>Treinamento selecionado</h3>
            <h4>{treinamento.titulo}</h4>
            <p><strong>Responsável:</strong> {treinamento.responsavel} · {treinamento.data}</p>
            <p><strong>Material:</strong> {treinamento.material}</p>
            <p><strong>Ciclo:</strong> Reduzir retrabalho na separação</p>
            <span className="treinamento-obrigatorio">Obrigatório · liberar tarefas</span>
            <ul><li>Lucas Nunes · pendente</li><li>Paulo Mendes · pendente</li></ul>
          </section>

          <section className="treinamento-atencao">
            <h3>Atenção necessária</h3>
            <div><span /><p><strong>Lucas Nunes</strong><small>Não iniciou o módulo de conferência.</small></p></div>
            <div><span /><p><strong>Paulo Mendes</strong><small>Prazo termina em 20 out.</small></p></div>
            <div><span /><p><strong>Paulo Mendes</strong><small>Prazo termina em 20 out.</small></p></div>
            <Link to={`/do/ciclo/${cicloId}/treinamentos/${treinamentoId}/lembrete/sucesso`} className="treinamento-atencao_lembrete">Enviar lembrete</Link>
          </section>

          <section className="treinamento-modulos">
            <h3>Módulos de treinamento</h3>
            <article><div><strong>Conferência dupla de pedidos</strong><span className="treinamento-modulo_badge treinamento-modulo_pendente">2 pendentes</span></div><p>6 de 8 concluíram</p><small>Prazo 20 out</small><div className="treinamento-modulo_barra"><span style={{ width: "75%" }} /></div></article>
            <article><div><strong>Leitura e validação de etiquetas</strong><span className="treinamento-modulo_badge treinamento-modulo_pendente">2 pendentes</span></div><p>2 de 4 concluíram</p><small>Prazo 23 out</small><div className="treinamento-modulo_barra"><span style={{ width: "50%" }} /></div></article>
            <article><div><strong>Registro de divergências</strong><span className="treinamento-modulo_badge treinamento-modulo_concluido">Concluído</span></div><p>5 de 5 concluíram</p><small>Prazo 16 out</small><div className="treinamento-modulo_barra"><span style={{ width: "100%" }} /></div></article>
          </section>
        </div>
      </div>
    </main>
  );
}

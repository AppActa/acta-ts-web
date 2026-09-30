import { Link, useParams } from "react-router-dom";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-ciclo-do.css";

const ciclos = [
  { nome: "Redução do tempo de atendimento", inicio: "26/05/2026", prazo: "30/10/2026" },
  { nome: "Organização do estoque", inicio: "18/05/2026", prazo: "30/10/2026" },
  { nome: "Onboarding de novos colaboradores", inicio: "02/06/2026", prazo: "30/10/2026" },
  { nome: "Proteção de dados e acessos", inicio: "12/05/2026", prazo: "30/10/2026" },
  { nome: "Padronização de aprovações", inicio: "01/06/2026", prazo: "30/10/2026" },
];

const etapas = [
  { nome: "Plan", estado: "Concluído", porcentagem: 100, cor: "plan" },
  { nome: "Do", estado: "Iniciado", porcentagem: 50, cor: "do" },
  { nome: "Check", estado: "Não foi iniciado", porcentagem: 0, cor: "check" },
  { nome: "Act", estado: "Não foi iniciado", porcentagem: 0, cor: "act" },
];

function IconeEtapa({ nome }: { nome: string }) {
  if (nome === "Do") return <span aria-hidden="true" className="ciclo-do_icone-play">▷</span>;
  if (nome === "Check") return <span aria-hidden="true" className="ciclo-do_icone-check">✓</span>;
  if (nome === "Act") return <span aria-hidden="true" className="ciclo-do_icone-act">✧</span>;
  return <span aria-hidden="true" className="ciclo-do_icone-plan">▣</span>;
}

export function PaginaCicloDo() {
  const { cicloId } = useParams();
  const ciclo = ciclos[Math.max(0, Number(cicloId ?? 1) - 1)] ?? ciclos[0];

  return (
    <main className="pagina-ciclo-do">
      <BarraLateral />
      <div className="ciclo-do_painel">
        <header className="ciclo-do_cabecalho">
          <div className="ciclo-do_cabecalho_icone" aria-hidden="true"><span /></div>
          <div className="ciclo-do_identificacao">
            <div className="ciclo-do_titulo_linha"><h1>{ciclo.nome}</h1><span className="ciclo-do_status">Status: Do</span></div>
            <p>Responsável pelo ciclo: <strong>Catarina Cândido</strong></p>
            <p>Iniciado em: <strong>{ciclo.inicio}</strong></p>
            <p>Prazo final: <strong>{ciclo.prazo}</strong></p>
          </div>
        </header>

        <nav className="ciclo-do_abas" aria-label="Etapas do ciclo">
          <Link to={`/do/ciclo/${cicloId}/visao-geral`} aria-current="page" className="ciclo-do_aba ciclo-do_aba-visao"><span>⟳</span>Visão geral</Link>
          <button type="button" className="ciclo-do_aba ciclo-do_aba-plan" disabled><IconeEtapa nome="Plan" />Plan</button>
          <Link to={`/do/ciclo/${cicloId}/tarefas`} aria-current="page" className="ciclo-do_aba ciclo-do_aba-do ciclo-do_aba-ativa"><IconeEtapa nome="Do" />Do</Link>
          <button type="button" className="ciclo-do_aba ciclo-do_aba-check" disabled><IconeEtapa nome="Check" />Checar</button>
          <button type="button" className="ciclo-do_aba ciclo-do_aba-act" disabled><IconeEtapa nome="Act" />Agir</button>
        </nav>

        <div className="ciclo-do_conteudo">
          <section className="ciclo-do_status_ciclo">
            <h2>Status de ciclo</h2>
            <div className="ciclo-do_etapas">
              {etapas.map((etapa) => (
                <article className={`ciclo-do_etapa ciclo-do_etapa-${etapa.cor}`} key={etapa.nome}>
                  <span className="ciclo-do_etapa_icone"><IconeEtapa nome={etapa.nome} /></span>
                  <div className="ciclo-do_etapa_info"><strong>{etapa.nome}</strong><span>{etapa.estado}</span><div className="ciclo-do_etapa_barra"><span style={{ width: `${etapa.porcentagem}%` }} /></div></div>
                  <span className="ciclo-do_etapa_percentual">{etapa.porcentagem}% <b>→</b></span>
                </article>
              ))}
            </div>
          </section>

          <section className="ciclo-do_equipe">
            <h2>Equipe</h2>
            <div className="ciclo-do_membros">
              <p>Catarina Cândido · Responsável</p>
              <p>Rafael Lima · Participante</p>
              <p>Camila Souza · Executor</p>
              <p>Ana Ribeiro · Validadora</p>
              <button type="button" disabled>Ver toda equipe</button>
            </div>
          </section>

          <section className="ciclo-do_resumo ciclo-do_resumo-tarefas">
            <h2>Tarefas</h2>
            <article className="ciclo-do_card_tarefas"><span>5/8 concluídas</span><div className="ciclo-do_rosca"><strong>63%</strong></div></article>
          </section>

          <section className="ciclo-do_resumo ciclo-do_resumo-indicador">
            <h2>Indicador</h2>
            <article className="ciclo-do_card_indicador"><span>Meta ≤ 3,0%</span><strong>8,4%</strong></article>
          </section>

          <section className="ciclo-do_decisoes">
            <h2>Próximas decisões</h2>
            <article className="ciclo-do_card_decisoes">
              <p><span className="ciclo-do_ponto ciclo-do_ponto-turquesa" /><span><strong>Validar ação de treinamento</strong><small>Prazo sugerido: 23 out</small></span></p>
              <p><span className="ciclo-do_ponto ciclo-do_ponto-laranja" /><span><strong>Confirmar custo de leitores</strong><small>Ação ainda em rascunho</small></span></p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

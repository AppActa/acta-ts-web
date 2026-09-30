import { Link, useParams } from "react-router-dom";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import iconeVisaoGeral from "./assets/ciclo-visao-geral/063c5.svg";
import iconePlanAba from "./assets/ciclo-visao-geral/47893.svg";
import iconeDo from "./assets/ciclo-visao-geral/d01c2.svg";
import iconeCheckAba from "./assets/ciclo-visao-geral/fe2f6.svg";
import iconeActAba from "./assets/ciclo-visao-geral/a51ff.svg";
import circuloPlan from "./assets/ciclo-visao-geral/9576b.svg";
import iconePlan from "./assets/ciclo-visao-geral/79e34.svg";
import circuloDo from "./assets/ciclo-visao-geral/a380d.svg";
import circuloCheck from "./assets/ciclo-visao-geral/61e69.svg";
import iconeCheck from "./assets/ciclo-visao-geral/6c5ca.svg";
import circuloAct from "./assets/ciclo-visao-geral/0afc5.svg";
import iconeAct from "./assets/ciclo-visao-geral/3f4de.svg";
import roscaFundo from "./assets/ciclo-visao-geral/7787a.svg";
import roscaProgresso from "./assets/ciclo-visao-geral/ebea0.svg";
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
  { nome: "Plan", estado: "Concluído", percentual: 100, classe: "plan", circulo: circuloPlan, icone: iconePlan },
  { nome: "Do", estado: "Iniciado", percentual: 50, classe: "do", circulo: circuloDo, icone: iconeDo },
  { nome: "Check", estado: "Não foi iniciado", percentual: 0, classe: "check", circulo: circuloCheck, icone: iconeCheck },
  { nome: "Act", estado: "Não foi iniciado", percentual: 0, classe: "act", circulo: circuloAct, icone: iconeAct },
];

export function PaginaCicloDo() {
  const { cicloId = "1" } = useParams();
  const indice = Number(cicloId);
  const ciclo = ciclos[Number.isInteger(indice) && indice > 0 ? indice - 1 : 0] ?? ciclos[0];

  return (
    <main className="pagina-ciclo-do">
      <BarraLateral />
      <div className="ciclo-do_painel">
        <header className="ciclo-do_cabecalho">
          <span className="ciclo-do_cabecalho_icone" aria-hidden="true" />
          <div className="ciclo-do_identificacao">
            <div className="ciclo-do_titulo_linha">
              <h1>{ciclo.nome}</h1>
              <span className="ciclo-do_status">Status: Do</span>
            </div>
            <p><span>Responsável pelo ciclo:</span> <strong>Catarina Cândido</strong></p>
            <p><span>Iniciado em:</span> <strong>{ciclo.inicio}</strong></p>
            <p><span>Prazo final:</span> <strong>{ciclo.prazo}</strong></p>
          </div>
        </header>

        <nav className="ciclo-do_abas" aria-label="Etapas do ciclo">
          <Link className="ciclo-do_aba ciclo-do_aba-visao" to={`/do/ciclo/${cicloId}/visao-geral`} aria-current="page"><img src={iconeVisaoGeral} alt="" />Visão geral</Link>
          <Link className="ciclo-do_aba ciclo-do_aba-plan" to={`/do/ciclo/${cicloId}/plan`}><img src={iconePlanAba} alt="" />Plan</Link>
          <Link className="ciclo-do_aba ciclo-do_aba-do" to={`/do/ciclo/${cicloId}/tarefas`}><img src={iconeDo} alt="" />Do</Link>
          <span className="ciclo-do_aba ciclo-do_aba-check" aria-disabled="true"><img src={iconeCheckAba} alt="" />Checar</span>
          <span className="ciclo-do_aba ciclo-do_aba-act" aria-disabled="true"><img src={iconeActAba} alt="" />Agir</span>
        </nav>

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
                  <div className="ciclo-do_etapa_texto"><strong>{etapa.nome}</strong><span>{etapa.estado}</span></div>
                  <span className="ciclo-do_etapa_percentual">{etapa.percentual}% <span aria-hidden="true">→</span></span>
                  <div className="ciclo-do_etapa_barra" role="progressbar" aria-label={`Progresso de ${etapa.nome}`} aria-valuenow={etapa.percentual} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${etapa.percentual}%` }} /></div>
                </article>
              ))}
            </div>
          </section>

          <section className="ciclo-do_equipe" aria-labelledby="titulo-equipe">
            <h2 id="titulo-equipe">Equipe</h2>
            <div className="ciclo-do_membros">
              <p><strong>Catarina Cândido</strong> · Responsável</p>
              <p>Rafael Lima · Participante</p>
              <p>Camila Souza · Executor</p>
              <p>Ana Ribeiro · Validadora</p>
              <button type="button" disabled title="Tela de equipe em desenvolvimento">Ver toda equipe</button>
            </div>
          </section>

          <section className="ciclo-do_resumo ciclo-do_resumo-tarefas" aria-labelledby="titulo-tarefas">
            <h2 id="titulo-tarefas">Tarefas</h2>
            <div className="ciclo-do_card_tarefas">
              <span>5/8 concluídas</span>
              <div className="ciclo-do_rosca" role="img" aria-label="63% das tarefas concluídas">
                <img src={roscaFundo} alt="" />
                <img src={roscaProgresso} alt="" />
                <strong>63%</strong>
              </div>
            </div>
          </section>

          <section className="ciclo-do_resumo ciclo-do_resumo-indicador" aria-labelledby="titulo-indicador">
            <h2 id="titulo-indicador">Indicador</h2>
            <div className="ciclo-do_card_indicador"><span>Meta ≤ 3,0%</span><strong>8,4%</strong></div>
          </section>

          <section className="ciclo-do_decisoes" aria-labelledby="titulo-decisoes">
            <h2 id="titulo-decisoes">Próximas decisões</h2>
            <div className="ciclo-do_card_decisoes">
              <p><span className="ciclo-do_ponto ciclo-do_ponto-turquesa" /><span><strong>Validar ação de treinamento</strong><small>Prazo sugerido: 23 out</small></span></p>
              <p><span className="ciclo-do_ponto ciclo-do_ponto-laranja" /><span><strong>Confirmar custo de leitores</strong><small>Ação ainda em rascunho</small></span></p>
            </div>
          </section>
        </div>
      </div>

      <div className="ciclo-do_moldura_superior" aria-hidden="true"><span /><span /><span /><span /></div>
    </main>
  );
}

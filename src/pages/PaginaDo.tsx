import { Link } from "react-router-dom";
import logoActa from "../features/auth/assets/logo-acta.svg";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-do.css";

type TipoIcone = "relogio" | "caixa" | "equipe" | "escudo" | "aprovacao";

const pendencias = [
  { titulo: "Aprovar planejamento", detalhe: "Onboarding de novos colaboradores", estado: "Aguardando", classe: "aguardando" },
  { titulo: "Acompanhar tarefa atrasada", detalhe: "Organização do estoque • prazo 12/10", estado: "Atrasada", classe: "atrasada" },
  { titulo: "Registrar verificação", detalhe: "Redução do tempo de atendimento", estado: "Pendente", classe: "pendente" },
] as const;

// Dados da imagem de referência; a integração precisa dos contratos e da sessão Firebase.
const ciclos: { titulo: string; progresso: number; icone: TipoIcone; cor: string }[] = [
  { titulo: "Redução do tempo de atendimento", progresso: 68, icone: "relogio", cor: "ciano" },
  { titulo: "Organização do estoque", progresso: 82, icone: "caixa", cor: "verde" },
  { titulo: "Onboarding de novos colaboradores", progresso: 15, icone: "equipe", cor: "azul" },
  { titulo: "Proteção de dados e acessos", progresso: 75, icone: "escudo", cor: "verde" },
  { titulo: "Padronização de aprovações", progresso: 43, icone: "aprovacao", cor: "turquesa" },
];

function IconeLista() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M7 5h10M7 10h10M7 15h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="3.5" cy="5" r="1.5" fill="currentColor"/><circle cx="3.5" cy="10" r="1.5" fill="currentColor"/><circle cx="3.5" cy="15" r="1.5" fill="currentColor"/></svg>;
}

function IconeTopo({ tipo }: { tipo: "notificacoes" | "relatorios" | "ciclos" | "cato" }) {
  if (tipo === "notificacoes") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M18 5a8 8 0 0 0-8 8v6c0 2-1 4-3 6h22c-2-2-3-4-3-6v-6a8 8 0 0 0-8-8Zm-3 24a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M16 3a2 2 0 0 1 4 0" stroke="currentColor" strokeWidth="2"/></svg>;
  if (tipo === "relatorios") return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M8 3h15l6 6v24H8V3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M23 3v7h6M13 26v-7m5 7V14m5 12v-9" stroke="currentColor" strokeWidth="2.5"/></svg>;
  return <span aria-hidden="true" className="do-topo_placeholder" />;
}

function IconeCiclo({ tipo }: { tipo: TipoIcone }) {
  switch (tipo) {
    case "relogio": return <svg aria-hidden="true" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="51" stroke="currentColor" strokeWidth="9"/><path d="M64 35v31L43 86" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "caixa": return <svg aria-hidden="true" viewBox="0 0 128 128" fill="none"><path d="m64 12 48 27v53l-48 27-48-27V39l48-27Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"/><path d="m16 39 48 28 48-28M64 67v52M40 26l49 28M31 72l14 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "equipe": return <svg aria-hidden="true" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="31" r="13" stroke="currentColor" strokeWidth="6"/><circle cx="26" cy="53" r="9" stroke="currentColor" strokeWidth="6"/><circle cx="102" cy="53" r="9" stroke="currentColor" strokeWidth="6"/><path d="M40 103V84c0-14 10-24 24-24s24 10 24 24v19c0 5-4 8-8 8H48c-4 0-8-3-8-8ZM16 75c-4 5-6 11-6 17v10c0 5 4 8 8 8h18m76-35c4 5 6 11 6 17v10c0 5-4 8-8 8H92" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/></svg>;
    case "escudo": return <svg aria-hidden="true" viewBox="0 0 128 128" fill="none"><path d="m64 12 42 16v32c0 30-19 48-42 57-23-9-42-27-42-57V28l42-16Z" stroke="currentColor" strokeWidth="7" strokeLinejoin="round"/></svg>;
    case "aprovacao": return <svg aria-hidden="true" viewBox="0 0 128 128" fill="none"><path d="M28 20h54l18 18v67H28V20Z" stroke="currentColor" strokeWidth="7" strokeLinejoin="round"/><path d="M82 20v19h18M42 71l15 15 29-32" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
}

export function PaginaDo() {
  return (
    <main className="pagina-do">
      <BarraLateral />
      <div className="do-painel">
        <header className="do-cabecalho">
          <Link className="do-marca" to="/" aria-label="ACTA, voltar para Home">
            <img src={logoActa} alt="" />
            <span>ACTA<span className="do-marca_ponto">.</span></span>
          </Link>
          <nav className="do-topo" aria-label="Acesso rápido">
            <span className="do-topo_item"><IconeTopo tipo="notificacoes" /><span>Notificações</span></span>
            <Link className="do-topo_item" to="/relatorios"><IconeTopo tipo="relatorios" /><span>Relatórios</span></Link>
            <Link className="do-topo_item" to="/ciclos"><IconeTopo tipo="ciclos" /><span>Ciclos</span></Link>
            <span className="do-topo_item"><IconeTopo tipo="cato" /><span>Cato</span></span>
          </nav>
        </header>

        <div className="do-conteudo">
          <div className="do-linha-superior">
            <div className="do-resumo">
              <section className="do-boas-vindas">
                <h1>Bom dia, Catarina!</h1>
                <p>Acompanhe o andamento dos<br />seus ciclos PDCA.</p>
              </section>
              <section className="do-metricas" aria-label="Resumo dos ciclos">
                <article className="do-metrica"><h2>Ciclos ativos</h2><strong className="do-numero_azul">04</strong><p>Em diferentes etapas</p></article>
                <article className="do-metrica"><h2>Tarefas atrasadas</h2><strong className="do-numero_ciano">03</strong><p>Em 2 ciclos</p></article>
                <article className="do-metrica"><h2>Prazos próximos</h2><strong className="do-numero_verde">05</strong><p>Nos próximos 7 dias</p></article>
              </section>
            </div>

            <section className="do-pendencias" id="pendencias">
              <div className="do-secao_cabecalho"><h2>Minhas pendências</h2><button className="do-botao" type="button" disabled title="Lista completa ainda não integrada à API"><IconeLista />Ver todos</button></div>
              <p className="do-secao_descricao">Pontos que podem pedir acompanhamento.</p>
              <ul className="do-pendencias_lista">
                {pendencias.map((pendencia) => (
                  <li className="do-pendencia" key={pendencia.titulo}>
                    <span className={`do-pendencia_ponto do-pendencia_ponto-${pendencia.classe}`} />
                    <span className="do-pendencia_texto"><strong>{pendencia.titulo}</strong><small>{pendencia.detalhe}</small></span>
                    <span className={`do-estado do-estado_${pendencia.classe}`}>{pendencia.estado}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="do-linha-inferior">
            <section className="do-ciclos" id="meus-ciclos">
              <div className="do-ciclos_cabecalho">
                <h2>Meus ciclos</h2>
                <div className="do-ciclos_acoes">
                  <button className="do-botao" type="button" disabled title="Cadastro de ciclos ainda não integrado à API"><span className="do-mais" aria-hidden="true">+</span>Criar novo</button>
                  <Link className="do-botao" to="/ciclos"><IconeLista />Ver todos</Link>
                </div>
              </div>
              <div className="do-ciclos_lista">
                {ciclos.map((ciclo, indice) => (
                  <Link className="do-ciclo" key={ciclo.titulo} to={`/do/ciclo/${indice + 1}`} aria-label={`Abrir ciclo ${ciclo.titulo}`}>
                    <div className={`do-ciclo_icone do-ciclo_icone-${ciclo.cor}`}><IconeCiclo tipo={ciclo.icone} /></div>
                    <h3>{ciclo.titulo}</h3>
                    <div className="do-ciclo_rodape"><div className="do-progresso" role="progressbar" aria-label={`Progresso de ${ciclo.titulo}`} aria-valuenow={ciclo.progresso} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${ciclo.progresso}%` }} /></div><span>{ciclo.progresso}%</span></div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="do-etapas">
              <h2>Etapas dos<br />ciclos</h2>
              <ul>
                {[1, 2, 3, 4].map((numero) => (
                  <li key={numero}><span className="do-etapa_icone" aria-hidden="true">▣</span><span>Plan · Planejamento</span><span className="do-etapa_numero">02</span></li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

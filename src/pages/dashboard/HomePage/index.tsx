import type { CSSProperties } from "react";
import type { CicloHome, DadosHomePage, EtapaHome, HomePageProps, IconeCicloHome, MetricaHome, PendenciaHome, VarianteMetricaHome, VariantePendenciaHome } from "../../../types/dashboard";
import { Link } from "react-router-dom";
import { LayoutSimples } from "../../../components/layout/LayoutSimples";
import "../../../../features/dashboard/styles/home-page.css";
import logoActaSimbolo from "../../../../features/dashboard/assets/home/logo-acta-simbolo.png";
import logoActaPalavra from "../../../../features/dashboard/assets/home/logo-acta-palavra.png";
import iconeTempo from "../../../../features/dashboard/assets/home/icone-tempo.svg";
import iconeEstoque from "../../../../features/dashboard/assets/home/icone-estoque.svg";
import iconeEquipe from "../../../../features/dashboard/assets/home/icone-equipe.svg";
import iconeProtecao from "../../../../features/dashboard/assets/home/icone-protecao.svg";
import iconeAprovacao from "../../../../features/dashboard/assets/home/icone-aprovacao.svg";
import iconeLista from "../../../../features/dashboard/assets/home/icone-lista.svg";
import iconeMais from "../../../../features/dashboard/assets/home/icone-mais.svg";
import iconePendenciaPlanejamento from "../../../../features/dashboard/assets/home/icone-pendencia-planejamento.svg";
import iconePendenciaAtrasada from "../../../../features/dashboard/assets/home/icone-pendencia-atrasada.svg";
import iconePendenciaVerificacao from "../../../../features/dashboard/assets/home/icone-pendencia-verificacao.svg";
import iconeEtapaPlan from "../../../../features/dashboard/assets/home/icone-etapa-plan.svg";

const iconesCiclos: Record<IconeCicloHome, string> = {
  tempo: iconeTempo,
  estoque: iconeEstoque,
  equipe: iconeEquipe,
  protecao: iconeProtecao,
  aprovacao: iconeAprovacao,
};

const iconesPendencias: Record<VariantePendenciaHome, string> = {
  aguardando: iconePendenciaPlanejamento,
  atrasada: iconePendenciaAtrasada,
  pendente: iconePendenciaVerificacao,
};

function estiloProgresso(progresso: number): CSSProperties {
  return { width: `${Math.min(100, Math.max(0, progresso))}%` };
}

export function HomePage({ dados, estado }: HomePageProps) {
  return (
    <LayoutSimples>
      <div className="home-page">
        <header className="home-page_cabecalho">
          <div className="home-page_logo" role="img" aria-label="ACTA">
            <img className="home-page_logo-simbolo" src={logoActaSimbolo} alt="" />
            <img className="home-page_logo-palavra" src={logoActaPalavra} alt="" />
          </div>
        </header>

        {estado === "carregando" ? (
          <section className="home-page_vazio" role="status" aria-live="polite" aria-busy="true">
            <h1>Carregando dados da Home</h1>
          </section>
        ) : estado === "erro" ? (
          <section className="home-page_vazio" role="alert">
            <h1>Não foi possível carregar os dados da Home</h1>
            <p>Tente novamente mais tarde.</p>
          </section>
        ) : estado === "cancelado" ? (
          <section className="home-page_vazio" role="status" aria-live="polite">
            <h1>Carregamento da Home interrompido</h1>
          </section>
        ) : !dados ? (
          <section className="home-page_vazio" role="status" aria-live="polite">
            <h1>Dados da Home indisponíveis</h1>
            <p>O resumo e os ciclos aparecerão quando houver dados disponíveis.</p>
          </section>
        ) : (
          <>
            <div className="home-page_linha-superior">
              <div className="home-page_resumo">
                <section className="home-page_saudacao" aria-labelledby="home-page-saudacao-titulo">
                  <h1 id="home-page-saudacao-titulo">Bom dia, {dados.nomeUsuario}!</h1>
                  <p>Acompanhe o andamento dos seus ciclos PDCA.</p>
                </section>
                <section className="home-page_metricas" aria-label="Resumo dos ciclos">
                  {dados.metricas.map((metrica) => (
                    <article className={`home-page_metrica home-page_metrica-${metrica.variante}`} key={metrica.id}>
                      <h2>{metrica.titulo}</h2>
                      <strong aria-label={metrica.valor === null ? `${metrica.titulo}: ${metrica.contexto}` : undefined}>
                        {metrica.valor === null ? "—" : String(metrica.valor).padStart(2, "0")}
                      </strong>
                      <p>{metrica.contexto}</p>
                    </article>
                  ))}
                </section>
              </div>

              <section className="home-page_pendencias" aria-labelledby="home-page-pendencias-titulo">
                <div className="home-page_pendencias-cabecalho">
                  <h2 id="home-page-pendencias-titulo">Minhas pendências</h2>
                  <button className="home-page_botao home-page_botao-ver-todos" type="button" disabled>
                    <img src={iconeLista} alt="" />
                    <span>Ver todos</span>
                  </button>
                </div>
                <p className="home-page_pendencias-descricao">Pontos que podem pedir acompanhamento.</p>
                {dados.pendencias === null ? (
                  <p className="home-page_pendencias-indisponiveis" role="status">Resumo de pendências ainda indisponível.</p>
                ) : dados.pendencias.length === 0 ? (
                  <p className="home-page_pendencias-vazio" role="status">Nenhuma pendência disponível.</p>
                ) : (
                  <ul className="home-page_pendencias-lista">
                    {dados.pendencias.map((pendencia) => (
                      <li className="home-page_pendencia" key={pendencia.id}>
                        <img className="home-page_pendencia-icone" src={iconesPendencias[pendencia.variante]} alt="" />
                        <span className="home-page_pendencia-texto">
                          <strong>{pendencia.titulo}</strong>
                          <small>{pendencia.detalhe}</small>
                        </span>
                        <span className={`home-page_pendencia-estado home-page_pendencia-estado-${pendencia.variante}`}>
                          {pendencia.estado}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="home-page_linha-inferior">
              <section className="home-page_ciclos" aria-labelledby="home-page-ciclos-titulo">
                <div className="home-page_ciclos-cabecalho">
                  <h2 id="home-page-ciclos-titulo">{dados.tituloCiclos ?? "Meus ciclos"}</h2>
                  <div className="home-page_ciclos-acoes">
                    <button className="home-page_botao" type="button" disabled>
                      <img src={iconeMais} alt="" />
                      <span>Criar novo</span>
                    </button>
                    <Link className="home-page_botao" to="/ciclos">
                      <img src={iconeLista} alt="" />
                      <span>Ver todos</span>
                    </Link>
                  </div>
                </div>
                <ul className="home-page_ciclos-lista" tabIndex={0} aria-labelledby="home-page-ciclos-titulo">
                  {dados.ciclos.map((ciclo) => (
                    <li className="home-page_ciclo" key={ciclo.id}>
                      {ciclo.icone === null ? (
                        <div className="home-page_ciclo-icone home-page_ciclo-icone-indisponivel" aria-hidden="true">
                          {/* # colocar imagem */}
                        </div>
                      ) : (
                        <div className={`home-page_ciclo-icone home-page_ciclo-icone-${ciclo.icone}`}>
                          <img src={iconesCiclos[ciclo.icone]} alt="" />
                        </div>
                      )}
                      <h3>{ciclo.titulo}</h3>
                      {ciclo.progresso === null ? (
                        <p className="home-page_ciclo-progresso-indisponivel" role="status">Progresso indisponível</p>
                      ) : (
                        <div className="home-page_ciclo-progresso">
                          <div
                            className="home-page_ciclo-trilho"
                            role="progressbar"
                            aria-label={`Progresso de ${ciclo.titulo}`}
                            aria-valuenow={Math.min(100, Math.max(0, ciclo.progresso))}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <span style={estiloProgresso(ciclo.progresso)} />
                          </div>
                          <span>{ciclo.progresso}%</span>
                        </div>
                      )}
                    </li>
                  ))}
                  {dados.ciclos.length === 0 && <li className="home-page_ciclos-vazio" role="status">Nenhum ciclo cadastrado para esta empresa.</li>}
                </ul>
              </section>

              <section className="home-page_etapas" aria-labelledby="home-page-etapas-titulo">
                <h2 id="home-page-etapas-titulo">Etapas dos ciclos</h2>
                <ul className="home-page_etapas-lista">
                  {dados.etapas.map((etapa) => (
                    <li className="home-page_etapa" key={etapa.id}>
                      <img src={iconeEtapaPlan} alt="" />
                      <span>{etapa.etapa} · {etapa.titulo}</span>
                      <strong>{String(etapa.quantidade).padStart(2, "0")}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </div>
    </LayoutSimples>
  );
}

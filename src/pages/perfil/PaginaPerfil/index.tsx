import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import iconeContraste from "../../../../features/perfil/assets/icone-contraste.svg";
import iconeAcessibilidade from "../../../../features/perfil/assets/icone-acessibilidade.svg";
import iconeEditarPerfil from "../../../../features/perfil/assets/icone-editar-perfil.png";
import iconeCiclos from "../../../../features/layout/assets/icone-ciclos.svg";
import iconeLua from "../../../../features/perfil/assets/icone-lua.svg";
import iconeSol from "../../../../features/perfil/assets/icone-sol.svg";
import iconeVolume from "../../../../features/perfil/assets/icone-volume.svg";
import { useAuth } from "../../../components/auth/AuthProvider";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Alternador } from "../../../components/perfil/Alternador";
import { CabecalhoPerfil } from "../../../components/perfil/CabecalhoPerfil";
import { Icone } from "../../../components/perfil/Icone";
import { ItemConfiguracao } from "../../../components/perfil/ItemConfiguracao";
import { ModalEdicaoPerfil } from "../../../components/perfil/ModalEdicaoPerfil";
import type { PreferenciasPerfil, PreferenciasPersistidas } from "../../../types/perfil";
import { aplicarEscalaFonteGlobal } from "../../../utils/escala-fonte-global";
import "../../../../features/perfil/styles/pagina-perfil.css";

const CHAVE_PREFERENCIAS = "acta:preferencias-perfil";
const PREFERENCIAS_PADRAO: PreferenciasPerfil = {
  tema: "claro",
  altoContraste: false,
  fonteGrande: false,
};

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function preferenciaValida(valor: Record<string, unknown>): valor is Record<keyof PreferenciasPerfil, unknown> {
  return (valor.tema === "claro" || valor.tema === "escuro")
    && typeof valor.altoContraste === "boolean"
    && typeof valor.fonteGrande === "boolean";
}

function preferenciasParaSalvar(preferencias: PreferenciasPerfil): PreferenciasPersistidas {
  return { ...preferencias, _versao: 3 };
}

function lerPreferencias(): PreferenciasPerfil {
  try {
    const valor = localStorage.getItem(CHAVE_PREFERENCIAS);
    if (!valor) return PREFERENCIAS_PADRAO;
    let salvas: unknown;
    try {
      salvas = JSON.parse(valor);
    } catch {
      try { localStorage.removeItem(CHAVE_PREFERENCIAS); } catch { /* armazenamento indisponível */ }
      return PREFERENCIAS_PADRAO;
    }
    if (!ehObjeto(salvas)) {
      localStorage.removeItem(CHAVE_PREFERENCIAS);
      return PREFERENCIAS_PADRAO;
    }

    if ((salvas._versao === 1 || salvas._versao === 2 || salvas._versao === 3) && preferenciaValida(salvas)) {
      return {
        tema: salvas.tema as PreferenciasPerfil["tema"],
        altoContraste: salvas.altoContraste as boolean,
        fonteGrande: salvas.fonteGrande as boolean,
      };
    }

    if (salvas._versao === undefined) {
      const legadas = {
        tema: salvas.tema === "claro" || salvas.tema === "escuro" ? salvas.tema : PREFERENCIAS_PADRAO.tema,
        altoContraste: typeof salvas.altoContraste === "boolean" ? salvas.altoContraste : PREFERENCIAS_PADRAO.altoContraste,
        fonteGrande: typeof salvas.fonteGrande === "boolean" ? salvas.fonteGrande : PREFERENCIAS_PADRAO.fonteGrande,
      } satisfies PreferenciasPerfil;
      const temPreferenciaLegadaValida = Object.keys(PREFERENCIAS_PADRAO).some((chave) => {
        const valorLegado = salvas[chave];
        return chave === "tema" ? valorLegado === "claro" || valorLegado === "escuro" : typeof valorLegado === "boolean";
      });
      if (temPreferenciaLegadaValida) {
        try {
          localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferenciasParaSalvar(legadas)));
        } catch {
          return legadas;
        }
        return legadas;
      }
    }

    localStorage.removeItem(CHAVE_PREFERENCIAS);
    return PREFERENCIAS_PADRAO;
  } catch {
    return PREFERENCIAS_PADRAO;
  }
}

export function PaginaPerfil() {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [preferencias, setPreferencias] = useState<PreferenciasPerfil>(lerPreferencias);
  const [mensagemSalvamento, setMensagemSalvamento] = useState("");
  const [aguardandoSaida, setAguardandoSaida] = useState(false);
  const [erroSaida, setErroSaida] = useState<string | null>(null);
  const [leituraAtiva, setLeituraAtiva] = useState(false);
  const [mensagemAcessibilidade, setMensagemAcessibilidade] = useState("");
  const carregamentoLibras = useRef<Promise<void> | null>(null);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const navegar = useNavigate();
  const { logout } = useAuth();

  function atualizarPreferencias(parcial: Partial<PreferenciasPerfil>) {
    setPreferencias((atuais) => ({ ...atuais, ...parcial }));
    if (parcial.fonteGrande !== undefined) aplicarEscalaFonteGlobal(parcial.fonteGrande);
    setMensagemSalvamento("");
  }

  function salvarPreferencias(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    try {
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferenciasParaSalvar(preferencias)));
      setMensagemSalvamento("Alterações salvas neste navegador.");
    } catch {
      setMensagemSalvamento("Não foi possível salvar as alterações neste navegador.");
    }
  }

  function alternarLeituraEmVozAlta() {
    if (!("speechSynthesis" in window)) {
      setMensagemAcessibilidade("A leitura em voz alta não é compatível com este navegador.");
      return;
    }
    if (leituraAtiva) {
      window.speechSynthesis.cancel();
      setLeituraAtiva(false);
      setMensagemAcessibilidade("Leitura interrompida.");
      return;
    }
    const texto = document.querySelector(".conteudo-perfil")?.textContent?.trim();
    if (!texto) return;
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.onend = () => setLeituraAtiva(false);
    fala.onerror = () => {
      setLeituraAtiva(false);
      setMensagemAcessibilidade("Não foi possível iniciar a leitura.");
    };
    window.speechSynthesis.speak(fala);
    setLeituraAtiva(true);
    setMensagemAcessibilidade("Leitura em voz alta iniciada.");
  }

  async function abrirAssistenteLibras() {
    setMensagemAcessibilidade("Carregando o assistente de Libras…");
    try {
      if (!carregamentoLibras.current) {
        carregamentoLibras.current = new Promise<void>((resolver, rejeitar) => {
          const urlScript = "https://vlibras.gov.br/app/vlibras-plugin.js";
          const existente = document.querySelector<HTMLScriptElement>(`script[src="${urlScript}"]`);
          if (existente) {
            if ((window as Window & { VLibrasWidget?: { initBtn?: HTMLButtonElement } }).VLibrasWidget?.initBtn) {
              resolver();
              return;
            }
            existente.addEventListener("load", () => resolver(), { once: true });
            existente.addEventListener("error", () => rejeitar(new Error("Falha ao carregar VLibras")), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = urlScript;
          script.async = true;
          script.onload = () => resolver();
          script.onerror = () => rejeitar(new Error("Falha ao carregar VLibras"));
          document.body.appendChild(script);
        });
      }
      await carregamentoLibras.current;
      const widget = window as Window & { VLibrasWidget?: { initBtn?: HTMLButtonElement } };
      const prazo = Date.now() + 5000;
      while (!widget.VLibrasWidget?.initBtn && Date.now() < prazo) {
        await new Promise((resolver) => window.setTimeout(resolver, 100));
      }
      if (widget.VLibrasWidget?.initBtn) {
        widget.VLibrasWidget.initBtn.click();
        setMensagemAcessibilidade("Assistente de Libras aberto.");
      } else {
        setMensagemAcessibilidade("O assistente carregou, mas não foi possível abrir o painel. Use o botão flutuante do VLibras.");
      }
    } catch {
      carregamentoLibras.current = null;
      setMensagemAcessibilidade("Não foi possível carregar o assistente de Libras. Verifique sua conexão.");
    }
  }

  async function sairDoPerfil() {
    setAguardandoSaida(true);
    setErroSaida(null);
    try {
      await logout();
      navegar("/login", { replace: true });
    } catch {
      setAguardandoSaida(false);
      setErroSaida("Não foi possível encerrar sua sessão. Tente novamente.");
    }
  }

  return (
    <main
      className="pagina-perfil"
      data-contraste={preferencias.altoContraste ? "alto" : "normal"}
      data-tema={preferencias.tema}
    >
      <Sidebar />
      <div className="conteudo-perfil">
        <CabecalhoPerfil />

        <form className="configuracoes-perfil" onSubmit={salvarPreferencias}>
          <section className="coluna-configuracao" aria-labelledby="titulo-configuracoes-perfil">
            <h2 id="titulo-configuracoes-perfil">Configurações de perfil</h2>
            <div className="cartao-configuracao cartao-configuracao_perfil">
              <ItemConfiguracao destino="/perfil/editar" imagemIcone={iconeEditarPerfil} texto="Editar perfil" />
              <ItemConfiguracao destino="/ciclos" imagemIcone={iconeCiclos} texto="Meus ciclos" />
              <ItemConfiguracao
                imagemIcone={iconeSol}
                texto="Tema"
                acao={
                  <span className="controle-tema" role="group" aria-label="Tema de cores">
                    <button type="button" aria-label="Usar modo claro" aria-pressed={preferencias.tema === "claro"} onClick={() => atualizarPreferencias({ tema: "claro" })}>
                      <img className="controle-tema_icone" src={iconeSol} alt="" />
                    </button>
                    <button type="button" aria-label="Usar modo escuro" aria-pressed={preferencias.tema === "escuro"} onClick={() => atualizarPreferencias({ tema: "escuro" })}>
                      <img className="controle-tema_icone" src={iconeLua} alt="" />
                    </button>
                  </span>
                }
              />
            </div>

            <button className="botao-sair" type="button" onClick={() => { setErroSaida(null); setConfirmandoSaida(true); }}>
              <Icone nome="sair" tamanho={38} />
              <span>Sair do perfil</span>
            </button>
          </section>

          <section className="coluna-configuracao" aria-labelledby="titulo-recursos-acessibilidade">
            <h2 id="titulo-recursos-acessibilidade">Recursos de acessibilidade</h2>
            <div className="cartao-configuracao cartao-configuracao_acessibilidade">
              <ItemConfiguracao
                aoClicar={() => atualizarPreferencias({ fonteGrande: !preferencias.fonteGrande })}
                selecionado={preferencias.fonteGrande}
                icone="tamanho-fonte"
                texto="Tamanho da fonte"
                acao={<span aria-hidden="true">›</span>}
              />
              <ItemConfiguracao imagemIcone={iconeContraste} texto="Alto contraste" acao={<Alternador rotulo="Alto contraste" ativo={preferencias.altoContraste} aoMudar={(altoContraste) => atualizarPreferencias({ altoContraste })} />} />
              <ItemConfiguracao aoClicar={abrirAssistenteLibras} imagemIcone={iconeAcessibilidade} texto="Assistente de Libras" acao={<span aria-hidden="true">›</span>} />
              <ItemConfiguracao aoClicar={alternarLeituraEmVozAlta} selecionado={leituraAtiva} imagemIcone={iconeVolume} texto="Leitura em voz alta" acao={<span aria-hidden="true">{leituraAtiva ? "■" : "▶"}</span>} />
              <button className="botao-salvar" type="submit">Salvar alterações</button>
              <p className="perfil_preferencias-salvas" role="status" aria-live="polite">{mensagemSalvamento}</p>
              <p className="perfil_preferencias-salvas" role="status" aria-live="polite">{mensagemAcessibilidade}</p>
            </div>
          </section>
        </form>
      </div>

      {confirmandoSaida && (
        <ModalEdicaoPerfil
          tipo="saida"
          aoConfirmar={sairDoPerfil}
          aoCancelar={() => { setErroSaida(null); setConfirmandoSaida(false); }}
          aguardando={aguardandoSaida}
          mensagemErro={erroSaida}
        />
      )}
    </main>
  );
}

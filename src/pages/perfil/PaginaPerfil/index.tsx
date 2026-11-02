import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import iconeAcessibilidade from "../../../../features/perfil/assets/icone-acessibilidade.svg";
import iconeContraste from "../../../../features/perfil/assets/icone-contraste.svg";
import iconeEditarPerfil from "../../../../features/perfil/assets/icone-editar-perfil.png";
import iconeEquipes from "../../../../features/perfil/assets/icone-equipes.png";
import iconeLua from "../../../../features/perfil/assets/icone-lua.svg";
import iconeNotificacoes from "../../../../features/perfil/assets/icone-notificacoes.png";
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
import "../../../../features/perfil/styles/pagina-perfil.css";

const CHAVE_PREFERENCIAS = "acta:preferencias-perfil";
const PREFERENCIAS_PADRAO: PreferenciasPerfil = {
  notificacoes: true,
  tema: "claro",
  altoContraste: true,
  assistenteLibras: true,
  leitorTela: true,
  fonteGrande: false,
};

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function preferenciaValida(valor: Record<string, unknown>): valor is Record<keyof PreferenciasPerfil, unknown> {
  return typeof valor.notificacoes === "boolean"
    && (valor.tema === "claro" || valor.tema === "escuro")
    && typeof valor.altoContraste === "boolean"
    && typeof valor.assistenteLibras === "boolean"
    && typeof valor.leitorTela === "boolean"
    && typeof valor.fonteGrande === "boolean";
}

function preferenciasParaSalvar(preferencias: PreferenciasPerfil): PreferenciasPersistidas {
  return { ...preferencias, _versao: 1 };
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

    if (salvas._versao === 1 && preferenciaValida(salvas)) {
      return {
        notificacoes: salvas.notificacoes as boolean,
        tema: salvas.tema as PreferenciasPerfil["tema"],
        altoContraste: salvas.altoContraste as boolean,
        assistenteLibras: salvas.assistenteLibras as boolean,
        leitorTela: salvas.leitorTela as boolean,
        fonteGrande: salvas.fonteGrande as boolean,
      };
    }

    if (salvas._versao === undefined) {
      const legadas = {
        notificacoes: typeof salvas.notificacoes === "boolean" ? salvas.notificacoes : PREFERENCIAS_PADRAO.notificacoes,
        tema: salvas.tema === "claro" || salvas.tema === "escuro" ? salvas.tema : PREFERENCIAS_PADRAO.tema,
        altoContraste: typeof salvas.altoContraste === "boolean" ? salvas.altoContraste : PREFERENCIAS_PADRAO.altoContraste,
        assistenteLibras: typeof salvas.assistenteLibras === "boolean" ? salvas.assistenteLibras : PREFERENCIAS_PADRAO.assistenteLibras,
        leitorTela: typeof salvas.leitorTela === "boolean" ? salvas.leitorTela : PREFERENCIAS_PADRAO.leitorTela,
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
  const navegar = useNavigate();
  const { logout } = useAuth();

  function atualizarPreferencias(parcial: Partial<PreferenciasPerfil>) {
    setPreferencias((atuais) => ({ ...atuais, ...parcial }));
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
      data-fonte={preferencias.fonteGrande ? "grande" : "normal"}
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
              <ItemConfiguracao desabilitado imagemIcone={iconeEquipes} texto="Minhas equipes" />
              <ItemConfiguracao
                imagemIcone={iconeSol}
                texto="Modo claro"
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
              <ItemConfiguracao imagemIcone={iconeNotificacoes} texto="Notificações" acao={<Alternador rotulo="Notificações" ativo={preferencias.notificacoes} aoMudar={(notificacoes) => atualizarPreferencias({ notificacoes })} />} />
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
                icone="tamanho-fonte"
                texto="Tamanho da fonte"
                acao={<span aria-hidden="true">›</span>}
              />
              <ItemConfiguracao imagemIcone={iconeContraste} texto="Alto contraste" acao={<Alternador rotulo="Alto contraste" ativo={preferencias.altoContraste} aoMudar={(altoContraste) => atualizarPreferencias({ altoContraste })} />} />
              <ItemConfiguracao imagemIcone={iconeAcessibilidade} texto="Assistente de libras" acao={<Alternador rotulo="Assistente de libras" ativo={preferencias.assistenteLibras} aoMudar={(assistenteLibras) => atualizarPreferencias({ assistenteLibras })} />} />
              <ItemConfiguracao imagemIcone={iconeVolume} texto="Leitor de tela" acao={<Alternador rotulo="Leitor de tela" ativo={preferencias.leitorTela} aoMudar={(leitorTela) => atualizarPreferencias({ leitorTela })} />} />
              <button className="botao-salvar" type="submit">Salvar alterações</button>
              <p className="perfil_preferencias-salvas" role="status" aria-live="polite">{mensagemSalvamento}</p>
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

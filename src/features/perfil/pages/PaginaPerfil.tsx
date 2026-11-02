import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import iconeAcessibilidade from "../assets/icone-acessibilidade.svg";
import iconeContraste from "../assets/icone-contraste.svg";
import iconeEditarPerfil from "../assets/icone-editar-perfil.png";
import iconeEquipes from "../assets/icone-equipes.png";
import iconeLua from "../assets/icone-lua.svg";
import iconeNotificacoes from "../assets/icone-notificacoes.png";
import iconeSol from "../assets/icone-sol.svg";
import iconeVolume from "../assets/icone-volume.svg";
import { useAuth } from "../../../auth/AuthProvider";
import { Sidebar } from "../../layout/components/Sidebar";
import { Alternador } from "../components/Alternador";
import { CabecalhoPerfil } from "../components/CabecalhoPerfil";
import { Icone } from "../components/Icone";
import { ItemConfiguracao } from "../components/ItemConfiguracao";
import { ModalEdicaoPerfil } from "../components/ModalEdicaoPerfil";
import "../styles/pagina-perfil.css";

type PreferenciasPerfil = {
  notificacoes: boolean;
  tema: "claro" | "escuro";
  altoContraste: boolean;
  assistenteLibras: boolean;
  leitorTela: boolean;
  fonteGrande: boolean;
};

const CHAVE_PREFERENCIAS = "acta:preferencias-perfil";
const PREFERENCIAS_PADRAO: PreferenciasPerfil = {
  notificacoes: true,
  tema: "claro",
  altoContraste: true,
  assistenteLibras: true,
  leitorTela: true,
  fonteGrande: false,
};

function lerPreferencias(): PreferenciasPerfil {
  try {
    const valor = localStorage.getItem(CHAVE_PREFERENCIAS);
    if (!valor) return PREFERENCIAS_PADRAO;
    const salvas: unknown = JSON.parse(valor);
    if (typeof salvas !== "object" || salvas === null) return PREFERENCIAS_PADRAO;
    const preferencias = salvas as Partial<PreferenciasPerfil>;
    return {
      notificacoes: typeof preferencias.notificacoes === "boolean" ? preferencias.notificacoes : PREFERENCIAS_PADRAO.notificacoes,
      tema: preferencias.tema === "escuro" ? "escuro" : "claro",
      altoContraste: typeof preferencias.altoContraste === "boolean" ? preferencias.altoContraste : PREFERENCIAS_PADRAO.altoContraste,
      assistenteLibras: typeof preferencias.assistenteLibras === "boolean" ? preferencias.assistenteLibras : PREFERENCIAS_PADRAO.assistenteLibras,
      leitorTela: typeof preferencias.leitorTela === "boolean" ? preferencias.leitorTela : PREFERENCIAS_PADRAO.leitorTela,
      fonteGrande: typeof preferencias.fonteGrande === "boolean" ? preferencias.fonteGrande : PREFERENCIAS_PADRAO.fonteGrande,
    };
  } catch {
    return PREFERENCIAS_PADRAO;
  }
}

export function PaginaPerfil() {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [preferencias, setPreferencias] = useState<PreferenciasPerfil>(lerPreferencias);
  const [mensagemSalvamento, setMensagemSalvamento] = useState("");
  const navegar = useNavigate();
  const { logout } = useAuth();

  function atualizarPreferencias(parcial: Partial<PreferenciasPerfil>) {
    setPreferencias((atuais) => ({ ...atuais, ...parcial }));
    setMensagemSalvamento("");
  }

  function salvarPreferencias(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    try {
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
      setMensagemSalvamento("Alterações salvas neste navegador.");
    } catch {
      setMensagemSalvamento("Não foi possível salvar as alterações neste navegador.");
    }
  }

  async function sairDoPerfil() {
    await logout();
    navegar("/login", { replace: true });
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

            <button className="botao-sair" type="button" onClick={() => setConfirmandoSaida(true)}>
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
          aoCancelar={() => setConfirmandoSaida(false)}
        />
      )}
    </main>
  );
}

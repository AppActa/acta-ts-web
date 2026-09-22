import iconeAcessibilidade from "../assets/icone-acessibilidade.svg";
import iconeContraste from "../assets/icone-contraste.svg";
import iconeEditarPerfil from "../assets/icone-editar-perfil.png";
import iconeEquipes from "../assets/icone-equipes.png";
import iconeLua from "../assets/icone-lua.svg";
import iconeNotificacoes from "../assets/icone-notificacoes.png";
import iconeSol from "../assets/icone-sol.svg";
import iconeVolume from "../assets/icone-volume.svg";
import referenciaPerfil from "../assets/referencia-perfil.png";
import { Alternador } from "../components/Alternador";
import { BarraLateral } from "../components/BarraLateral";
import { CabecalhoPerfil } from "../components/CabecalhoPerfil";
import { Icone } from "../components/Icone";
import { ItemConfiguracao } from "../components/ItemConfiguracao";
import { ModalEdicaoPerfil } from "../components/ModalEdicaoPerfil";
import "../styles/pagina-perfil.css";

export function PaginaPerfil() {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const navegar = useNavigate();

  function sairDoPerfil() {
    navegar("/login", { replace: true });
  }

  return (
    <main className="pagina-perfil">
      <BarraLateral />

      <section className="conteudo-perfil">
        <CabecalhoPerfil />

        <div className="configuracoes-perfil">
          <section className="coluna-configuracao">
            <h2>Configurações de perfil</h2>
            <div className="cartao-configuracao cartao-configuracao_perfil">
              <ItemConfiguracao destino="/perfil/editar" imagemIcone={iconeEditarPerfil} texto="Editar perfil" />
              <ItemConfiguracao imagemIcone={iconeEquipes} texto="Minhas equipes" />
              <ItemConfiguracao
                imagemIcone={iconeSol}
                texto="Modo claro"
                acao={
                  <span className="controle-tema">
                    <span className="controle-tema_ativo">
                      <img className="controle-tema_icone" src={iconeSol} alt="" />
                    </span>
                    <span>
                      <img className="controle-tema_icone" src={iconeLua} alt="" />
                    </span>
                  </span>
                }
              />
              <ItemConfiguracao imagemIcone={iconeNotificacoes} texto="Notificações" acao={<Alternador />} />
            </div>

            <button className="botao-sair" type="button" onClick={() => setConfirmandoSaida(true)}>
              <Icone nome="sair" tamanho={38} />
              <span>Sair do perfil</span>
            </button>
          </section>

          <section className="coluna-configuracao">
            <h2>Recursos de acessibilidade</h2>
            <div className="cartao-configuracao cartao-configuracao_acessibilidade">
              <ItemConfiguracao icone="tamanho-fonte" texto="Tamanho da fonte" />
              <ItemConfiguracao imagemIcone={iconeContraste} texto="Alto contraste" acao={<Alternador />} />
              <ItemConfiguracao imagemIcone={iconeAcessibilidade} texto="Assistente de libras" acao={<Alternador />} />
              <ItemConfiguracao imagemIcone={iconeVolume} texto="Leitor de tela" acao={<Alternador />} />
              <button className="botao-salvar" type="button">Salvar alterações</button>
            </div>
          </section>
        </div>

        <span className="recorte-foto recorte-foto_assistente">
          <img src={referenciaPerfil} alt="Assistente de acessibilidade" />
        </span>
      </section>

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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import referenciaEditarPerfil from "../assets/referencia-editar-perfil.png";
import { FormularioEditarPerfil } from "../components/FormularioEditarPerfil";
import { ModalEdicaoPerfil } from "../components/ModalEdicaoPerfil";
import "../styles/pagina-editar-perfil.css";

type EstadoModal = "confirmacao" | "sucesso" | null;

export function PaginaEditarPerfil() {
  const [estadoModal, setEstadoModal] = useState<EstadoModal>(null);
  const navegar = useNavigate();
  const bloqueador = useBlocker(
    ({ currentLocation, nextLocation }) =>
      estadoModal !== "sucesso" && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (bloqueador.state === "blocked") {
      setEstadoModal("confirmacao");
    }
  }, [bloqueador.state]);

  function concluirEdicao() {
    setEstadoModal("sucesso");
  }

  function concluirSucesso() {
    navegar("/perfil", { replace: true });
  }

  function confirmarSaida() {
    if (bloqueador.state === "blocked") {
      bloqueador.proceed();
      return;
    }

    navegar("/perfil");
  }

  function cancelarSaida() {
    if (bloqueador.state === "blocked") {
      bloqueador.reset();
    }
    setEstadoModal(null);
  }

  return (
    <main className="pagina-editar-perfil">
      <section className="cartao-editar-perfil" aria-labelledby="titulo-editar-perfil">
        <div className="foto-editar-perfil">
          <div className="foto-editar-perfil_recorte">
            <img src={referenciaEditarPerfil} alt="Catarina Cândido" />
          </div>

          <label className="botao-editar-foto" htmlFor="foto-perfil" title="Alterar foto do perfil">
            <span className="texto-acessivel">Alterar foto do perfil</span>
          </label>
          <input className="entrada-foto-perfil" id="foto-perfil" name="foto-perfil" type="file" accept="image/*" />
        </div>

        <div>
          <FormularioEditarPerfil aoConcluir={concluirEdicao} aoVoltar={() => navegar("/perfil")} />
        </div>
      </section>

      {estadoModal === "sucesso" && (
        <ModalEdicaoPerfil tipo="sucesso" aoConfirmar={concluirSucesso} />
      )}

      {estadoModal === "confirmacao" && (
        <ModalEdicaoPerfil
          tipo="confirmacao"
          aoConfirmar={confirmarSaida}
          aoCancelar={cancelarSaida}
        />
      )}
    </main>
  );
}

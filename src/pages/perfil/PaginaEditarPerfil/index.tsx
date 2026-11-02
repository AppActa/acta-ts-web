import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import { FotoPerfilUploadError, enviarFotoPerfilCloudinary } from "../../../services/api/cloudinary/fotoPerfil.api";
import { atualizarFotoUsuarioPg } from "../../../services/api/pg/usuario.api";
import { LayoutSimples } from "../../../components/layout/LayoutSimples";
import { FormularioEditarPerfil } from "../../../components/perfil/FormularioEditarPerfil";
import { ModalEdicaoPerfil } from "../../../components/perfil/ModalEdicaoPerfil";
import "../../../../features/perfil/styles/pagina-editar-perfil.css";

type EstadoModal = "confirmacao" | null;

export function PaginaEditarPerfil() {
  const [estadoModal, setEstadoModal] = useState<EstadoModal>(null);
  const [fotoSelecionada, setFotoSelecionada] = useState("");
  const [erroFoto, setErroFoto] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [fotoFalhou, setFotoFalhou] = useState(false);
  const { actaUser, firebaseUser, refreshActaUser } = useAuth();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const pularBloqueio = useRef(false);
  const bloqueador = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !pularBloqueio.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (bloqueador.state === "blocked") {
      setEstadoModal("confirmacao");
    }
  }, [bloqueador.state]);

  useEffect(() => { pularBloqueio.current = false; }, [localizacao.pathname]);

  useEffect(() => () => {
    if (fotoSelecionada.startsWith("blob:")) URL.revokeObjectURL(fotoSelecionada);
  }, [fotoSelecionada]);

  async function selecionarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const entrada = evento.currentTarget;
    const arquivo = entrada.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      setErroFoto("Selecione um arquivo de imagem.");
      entrada.value = "";
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      setErroFoto("A imagem deve ter no máximo 10 MB.");
      entrada.value = "";
      return;
    }
    setErroFoto("");
    setFotoFalhou(false);
    setFotoSelecionada(URL.createObjectURL(arquivo));
    setEnviandoFoto(true);
    try {
      if (actaUser?.estadoPerfil !== "PERFIL_CRIADO") throw new Error("Não foi possível identificar seu usuário ACTA.");
      const fotoUrl = await enviarFotoPerfilCloudinary(arquivo);
      await atualizarFotoUsuarioPg(actaUser.idUsuario, fotoUrl);
      await refreshActaUser();
      setFotoSelecionada("");
      setErroFoto("Foto atualizada com sucesso.");
    } catch (erro) {
      setErroFoto(erro instanceof Error ? erro.message : "Não foi possível atualizar sua foto. Tente novamente.");
    } finally {
      setEnviandoFoto(false);
      entrada.value = "";
    }
  }

  function concluirEdicao() {
    pularBloqueio.current = true;
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
    <LayoutSimples>
      <div className="pagina-editar-perfil">
        <section className="cartao-editar-perfil" aria-labelledby="titulo-editar-perfil">
          <div className="foto-editar-perfil">
            <div className="foto-editar-perfil_recorte">
              {fotoSelecionada || ((actaUser?.fotoPerfilUrl || firebaseUser?.photoURL) && !fotoFalhou)
                ? <img className="foto-editar-perfil_dinamica" src={fotoSelecionada || actaUser?.fotoPerfilUrl || firebaseUser?.photoURL || ""} alt={fotoSelecionada ? "Prévia da nova foto de perfil" : "Foto de perfil"} onError={() => setFotoFalhou(true)} />
                : <span className="foto-editar-perfil_fallback" aria-label="Foto de perfil indisponível">{(actaUser?.nome || firebaseUser?.displayName || firebaseUser?.email || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR")}</span>}
            </div>

            <label className="botao-editar-foto" htmlFor="foto-perfil" title={enviandoFoto ? "Enviando foto" : "Alterar foto do perfil"} aria-disabled={enviandoFoto}>
              <span className="texto-acessivel">Alterar foto do perfil</span>
            </label>
            <input className="entrada-foto-perfil" id="foto-perfil" name="foto-perfil" type="file" accept="image/*" onChange={selecionarFoto} disabled={enviandoFoto} />
            {enviandoFoto && <p className="erro-foto-perfil" role="status">Enviando foto…</p>}
            {erroFoto && <p className={`erro-foto-perfil${erroFoto.includes("sucesso") ? " erro-foto-perfil--sucesso" : ""}`} role={erroFoto.includes("sucesso") ? "status" : "alert"}>{erroFoto}</p>}
          </div>

          <FormularioEditarPerfil aoConcluir={concluirEdicao} />
        </section>

        {estadoModal === "confirmacao" && (
          <ModalEdicaoPerfil
            tipo="confirmacao"
            aoConfirmar={confirmarSaida}
            aoCancelar={cancelarSaida}
          />
        )}
      </div>
    </LayoutSimples>
  );
}

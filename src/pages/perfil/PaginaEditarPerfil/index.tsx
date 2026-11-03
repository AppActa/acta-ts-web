import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useAuth } from "../../../components/auth/AuthProvider";
import { enviarFotoPerfilCloudinary } from "../../../services/api/cloudinary/fotoPerfil.api";
import { validarUrlFotoPerfil } from "../../../utils/foto-perfil";
import { atualizarFotoUsuarioPg, atualizarNomeUsuarioPg } from "../../../services/api/pg/usuario.api";
import { LayoutSimples } from "../../../components/layout/LayoutSimples";
import { FormularioEditarPerfil } from "../../../components/perfil/FormularioEditarPerfil";
import { ModalEdicaoPerfil } from "../../../components/perfil/ModalEdicaoPerfil";
import "../../../../features/perfil/styles/pagina-editar-perfil.css";

type EstadoModal = "confirmacao" | null;

export function PaginaEditarPerfil() {
  const [estadoModal, setEstadoModal] = useState<EstadoModal>(null);
  const [nome, setNome] = useState("");
  const [erroNome, setErroNome] = useState("");
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState("");
  const [erroFoto, setErroFoto] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [fotoFalhou, setFotoFalhou] = useState(false);
  const { actaUser, firebaseUser, refreshActaUser } = useAuth();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const pularBloqueio = useRef(false);
  const nomeOriginal = actaUser?.nome ?? "";
  const nomeAlterado = nome.trim() !== nomeOriginal;
  const bloqueador = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !pularBloqueio.current && (nomeAlterado || enviandoFoto) && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    setNome(nomeOriginal);
  }, [nomeOriginal]);

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

  async function salvarNome(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nomeValidado = nome.trim();
    if (!nomeValidado || nomeValidado.length > 160) {
      setErroNome("Informe um nome com até 160 caracteres.");
      return;
    }
    if (actaUser?.estadoPerfil !== "PERFIL_CRIADO") {
      setErroNome("Não foi possível identificar seu perfil ACTA.");
      return;
    }

    setErroNome("");
    setSalvandoNome(true);
    try {
      await atualizarNomeUsuarioPg(actaUser.idUsuario, nomeValidado);
      await refreshActaUser();
      pularBloqueio.current = true;
      navegar("/perfil", { replace: true });
    } catch (cause) {
      setErroNome(cause instanceof Error ? cause.message : "Não foi possível salvar seu nome. Tente novamente.");
    } finally {
      setSalvandoNome(false);
    }
  }

  function voltarAoPerfil() {
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
              {fotoSelecionada || (validarUrlFotoPerfil(actaUser?.fotoPerfilUrl || firebaseUser?.photoURL) && !fotoFalhou)
                ? <img className="foto-editar-perfil_dinamica" src={fotoSelecionada || validarUrlFotoPerfil(actaUser?.fotoPerfilUrl || firebaseUser?.photoURL) || ""} alt={fotoSelecionada ? "Prévia da nova foto de perfil" : "Foto de perfil"} onError={() => setFotoFalhou(true)} />
                : <span className="foto-editar-perfil_fallback" aria-label="Foto de perfil indisponível">{(actaUser?.nome || firebaseUser?.displayName || firebaseUser?.email || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR")}</span>}
            </div>

            <label className="botao-editar-foto" htmlFor="foto-perfil" title={enviandoFoto ? "Enviando foto" : "Alterar foto do perfil"} aria-disabled={enviandoFoto}>
              <span className="texto-acessivel">Alterar foto do perfil</span>
            </label>
            <input className="entrada-foto-perfil" id="foto-perfil" name="foto-perfil" type="file" accept="image/*" onChange={selecionarFoto} disabled={enviandoFoto} aria-describedby={erroFoto ? "estado-foto-perfil" : undefined} aria-invalid={Boolean(erroFoto && !erroFoto.includes("sucesso"))} />
            {enviandoFoto && <CarregandoConteudo compacto mensagem="Enviando foto" />}
            {erroFoto && <p id="estado-foto-perfil" className={`erro-foto-perfil${erroFoto.includes("sucesso") ? " erro-foto-perfil--sucesso" : ""}`} role={erroFoto.includes("sucesso") ? "status" : "alert"}>{erroFoto}</p>}
          </div>

          <div className="dados-perfil-edicao">
            <button className="botao-voltar-edicao" type="button" onClick={voltarAoPerfil}>Voltar ao perfil</button>
            <FormularioEditarPerfil nome={nome} email={actaUser?.email ?? firebaseUser?.email ?? ""} erro={erroNome} enviando={salvandoNome} aoAlterarNome={setNome} aoSalvar={salvarNome} />
          </div>
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

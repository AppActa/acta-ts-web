import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { validarUrlFotoPerfil } from "../../../utils/foto-perfil";

export function CabecalhoPerfil() {
  const { actaUser, firebaseUser } = useAuth();
  const [fotoFalhou, setFotoFalhou] = useState(false);
  const foto = validarUrlFotoPerfil(actaUser?.fotoPerfilUrl || firebaseUser?.photoURL);
  const nome = actaUser?.nome || firebaseUser?.displayName || "Nome indisponível";
  const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR");
  const mostrarFoto = Boolean(foto) && !fotoFalhou;
  useEffect(() => setFotoFalhou(false), [foto]);

  return (
    <header className="cabecalho-perfil">
      <div className="recorte-foto recorte-foto_grande" aria-hidden="true">
        {mostrarFoto ? <img className="recorte-foto_dinamica" src={foto ?? undefined} alt="" onError={() => setFotoFalhou(true)} /> : <span className="recorte-foto_iniciais">{iniciais}</span>}
      </div>

      <div className="cabecalho-perfil_identidade">
        <h1>{nome}</h1>
        {actaUser?.email ? <a href={`mailto:${actaUser.email}`}>{actaUser.email}</a> : <span>E-mail indisponível</span>}
      </div>
    </header>
  );
}

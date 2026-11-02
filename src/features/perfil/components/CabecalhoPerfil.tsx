import { useAuth } from "../../../auth/AuthProvider";
import imagemPerfil from "../assets/referencia-perfil.png";

export function CabecalhoPerfil() {
  const { actaUser } = useAuth();

  return (
    <header className="cabecalho-perfil">
      <div className="recorte-foto recorte-foto_grande" aria-hidden="true">
        <img src={imagemPerfil} alt="" />
      </div>

      <div className="cabecalho-perfil_identidade">
        <h1>{actaUser?.nome ?? "Nome indisponível"}</h1>
        {actaUser?.email ? <a href={`mailto:${actaUser.email}`}>{actaUser.email}</a> : <span>E-mail indisponível</span>}
      </div>
    </header>
  );
}

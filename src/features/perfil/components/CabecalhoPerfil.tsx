import referenciaPerfil from "../assets/referencia-perfil.png";

export function CabecalhoPerfil() {
  return (
    <header className="cabecalho-perfil">
      <div className="recorte-foto recorte-foto_grande">
        <img src={referenciaPerfil} alt="Catarina Cândido" />
      </div>

      <div className="cabecalho-perfil_identidade">
        <h1>Catarina Cândido</h1>
        <a href="mailto:catarina.candido@saveit.com">catarina.candido@saveit.com</a>
      </div>
    </header>
  );
}

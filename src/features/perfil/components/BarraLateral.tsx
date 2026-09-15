import iconeAct from "../assets/icone-act.png";
import iconeCheck from "../assets/icone-check.png";
import iconeDo from "../assets/icone-do.png";
import iconeHome from "../assets/icone-home.png";
import iconePlan from "../assets/icone-plan.png";
import referenciaPerfil from "../assets/referencia-perfil.png";

const itens = [
  { icone: iconePlan, rotulo: "Plan" },
  { icone: iconeDo, rotulo: "Do" },
  { icone: iconeCheck, rotulo: "Check" },
  { icone: iconeAct, rotulo: "Act" },
];

export function BarraLateral() {
  return (
    <aside className="barra-lateral" aria-label="Navegação principal">
      <nav className="barra-lateral_navegacao">
        <button className="barra-lateral_item" type="button">
          <img className="barra-lateral_icone barra-lateral_logo" src={iconeHome} alt="" />
          <span>Home</span>
        </button>

        {itens.map((item) => (
          <button className="barra-lateral_item" type="button" key={item.rotulo}>
            <img className="barra-lateral_icone" src={item.icone} alt="" />
            <span>{item.rotulo}</span>
          </button>
        ))}
      </nav>

      <button className="barra-lateral_item barra-lateral_perfil" type="button" aria-current="page">
        <span className="recorte-foto recorte-foto_pequeno">
          <img src={referenciaPerfil} alt="Catarina Cândido" />
        </span>
        <span>Profile</span>
      </button>
    </aside>
  );
}

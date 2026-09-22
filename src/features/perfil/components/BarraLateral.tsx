import { NavLink } from "react-router-dom";
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
        <NavLink className="barra-lateral_item" to="/" end>
          <img className="barra-lateral_icone barra-lateral_logo" src={iconeHome} alt="" />
          <span>Home</span>
        </NavLink>

        {itens.map((item) => (
          <button className="barra-lateral_item" type="button" key={item.rotulo}>
            <img className="barra-lateral_icone" src={item.icone} alt="" />
            <span>{item.rotulo}</span>
          </button>
        ))}
      </nav>

      <NavLink className="barra-lateral_item barra-lateral_perfil" to="/perfil">
        <span className="recorte-foto recorte-foto_pequeno">
          <img src={referenciaPerfil} alt="Catarina Cândido" />
        </span>
        <span>Profile</span>
      </NavLink>
    </aside>
  );
}

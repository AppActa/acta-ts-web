import { Link, useLocation } from "react-router-dom";
import iconeAct from "../../perfil/assets/icone-act.png";
import iconeCheck from "../../perfil/assets/icone-check.png";
import iconeDo from "../../perfil/assets/icone-do.png";
import iconeHome from "../../perfil/assets/icone-home.png";
import iconePlan from "../../perfil/assets/icone-plan.png";
import iconeNotificacoes from "../../perfil/assets/icone-notificacoes.png";
import referenciaPerfil from "../../perfil/assets/referencia-perfil.png";
import iconeRelatorios from "../assets/icone-relatorios.svg";
import iconeCiclos from "../assets/icone-ciclos.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../styles/sidebar.css";

export function Sidebar() {
  const { pathname } = useLocation();
  const estaEmPlan = pathname.includes("/plan");
  const estaEmDo = pathname === "/do" || pathname.includes("/tarefas") || pathname.includes("/treinamentos") || pathname.includes("/cronograma");
  const estaEmCheck = pathname === "/check";
  const estaEmHome = pathname === "/";
  const estaEmPerfil = pathname.startsWith("/perfil");

  return (
    <aside className="barra-lateral sidebar" aria-label="Navegação principal">
      <nav className="barra-lateral_navegacao" aria-label="Etapas do ACTA">
        <Link className="barra-lateral_item" to="/" aria-current={estaEmHome ? "page" : undefined}>
          <img className="barra-lateral_icone barra-lateral_logo" src={iconeHome} alt="" />
          <span>Home</span>
        </Link>
        <Link className="barra-lateral_item" to="/plan/ciclos" aria-current={estaEmPlan ? "page" : undefined}>
          <img className="barra-lateral_icone" src={iconePlan} alt="" />
          <span>Plan</span>
        </Link>
        <Link className="barra-lateral_item" to="/do" aria-current={estaEmDo ? "page" : undefined}>
          <img className="barra-lateral_icone" src={iconeDo} alt="" />
          <span>Do</span>
        </Link>
        <Link className="barra-lateral_item" to="/check" aria-current={estaEmCheck ? "page" : undefined}>
          <img className="barra-lateral_icone" src={iconeCheck} alt="" />
          <span>Check</span>
        </Link>
        <button className="barra-lateral_item" type="button" disabled title="Act ainda não possui página">
          <img className="barra-lateral_icone" src={iconeAct} alt="" />
          <span>Act</span>
        </button>
      </nav>

      <Link className="barra-lateral_item barra-lateral_perfil" to="/perfil" aria-current={estaEmPerfil ? "page" : undefined}>
        <span className="recorte-foto recorte-foto_pequeno"><img src={referenciaPerfil} alt="" /></span>
        <span>Profile</span>
      </Link>

      <nav className="sidebar_atalhos" aria-label="Acesso rápido">
        <button type="button" disabled title="Notificações ainda não possui página"><img src={iconeNotificacoes} alt="" /><span>Notificações</span></button>
        <Link to="/relatorios" aria-current={pathname === "/relatorios" ? "page" : undefined}><img src={iconeRelatorios} alt="" /><span>Relatórios</span></Link>
        <Link to="/ciclos" aria-current={pathname === "/ciclos" ? "page" : undefined}><img src={iconeCiclos} alt="" /><span>Ciclos</span></Link>
        <button type="button" disabled title="Cato ainda não possui página"><span className="sidebar_atalhos_cato-placeholder" aria-hidden="true" style={{ display: "block", width: 48, height: 48, backgroundColor: "#d9d9d9" }}>{/* # colocar imagem */}</span><span>Cato</span></button>
      </nav>
    </aside>
  );
}

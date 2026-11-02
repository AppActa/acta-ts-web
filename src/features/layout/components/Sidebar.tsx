import { Link, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import iconeAct from "../../perfil/assets/icone-act.png";
import iconeCheck from "../../perfil/assets/icone-check.png";
import iconeDo from "../../perfil/assets/icone-do.png";
import iconeHome from "../../perfil/assets/icone-home.png";
import iconePlan from "../../perfil/assets/icone-plan.png";
import iconeNotificacoes from "../../perfil/assets/icone-notificacoes.png";
import iconeRelatorios from "../assets/icone-relatorios.svg";
import iconeCiclos from "../assets/icone-ciclos.svg";
import iconeCato from "../assets/icone-cato.svg";
import "../../perfil/styles/pagina-perfil.css";
import "../styles/sidebar.css";

export function Sidebar() {
  const { actaUser, firebaseUser } = useAuth();
  const [fotoPerfilFalhou, setFotoPerfilFalhou] = useState(false);
  const { pathname } = useLocation();
  const { cicloId = "1" } = useParams();
  const estaEmPlan = pathname.includes("/plan");
  const estaEmDo = pathname.includes("/tarefas") || pathname.includes("/treinamentos") || pathname.includes("/cronograma");
  const estaEmHome = pathname === "/" || pathname === "/do";
  const estaEmPerfil = pathname.startsWith("/perfil");
  const nomeUsuario = actaUser?.nome || firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Usuário ACTA";
  const iniciais = nomeUsuario.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR");
  const fotoPerfil = firebaseUser?.photoURL && !fotoPerfilFalhou ? firebaseUser.photoURL : "";

  return (
    <aside className="barra-lateral sidebar" aria-label="Navegação principal">
      <nav className="barra-lateral_navegacao" aria-label="Etapas do ACTA">
        <Link className="barra-lateral_item" to="/do" aria-current={estaEmHome ? "page" : undefined}>
          <img className="barra-lateral_icone barra-lateral_logo" src={iconeHome} alt="" />
          <span>Home</span>
        </Link>
        <Link className="barra-lateral_item" to={`/do/ciclo/${cicloId}/plan`} aria-current={estaEmPlan ? "page" : undefined}>
          <img className="barra-lateral_icone" src={iconePlan} alt="" />
          <span>Plan</span>
        </Link>
        <Link className="barra-lateral_item" to={`/do/ciclo/${cicloId}/tarefas`} aria-current={estaEmDo ? "page" : undefined}>
          <img className="barra-lateral_icone" src={iconeDo} alt="" />
          <span>Do</span>
        </Link>
        <button className="barra-lateral_item" type="button" disabled title="Check ainda não possui página">
          <img className="barra-lateral_icone" src={iconeCheck} alt="" />
          <span>Check</span>
        </button>
        <button className="barra-lateral_item" type="button" disabled title="Act ainda não possui página">
          <img className="barra-lateral_icone" src={iconeAct} alt="" />
          <span>Act</span>
        </button>
      </nav>

      <Link className="barra-lateral_item barra-lateral_perfil" to="/perfil" aria-current={estaEmPerfil ? "page" : undefined} aria-label={`Abrir perfil de ${nomeUsuario}`}>
        <span className="barra-lateral_avatar" aria-hidden="true">{fotoPerfil ? <img src={fotoPerfil} alt="" onError={() => setFotoPerfilFalhou(true)} /> : <span>{iniciais}</span>}</span>
        <span>Profile</span>
      </Link>

      <nav className="sidebar_atalhos" aria-label="Acesso rápido">
        <button type="button" disabled title="Notificações ainda não possui página"><img src={iconeNotificacoes} alt="" /><span>Notificações</span></button>
        <Link to="/relatorios" aria-current={pathname === "/relatorios" ? "page" : undefined}><img src={iconeRelatorios} alt="" /><span>Relatórios</span></Link>
        <Link to="/ciclos" aria-current={pathname === "/ciclos" ? "page" : undefined}><img src={iconeCiclos} alt="" /><span>Ciclos</span></Link>
        <Link to="/cato" aria-current={pathname.startsWith("/cato") ? "page" : undefined}><img src={iconeCato} alt="" /><span>Cato</span></Link>
      </nav>
    </aside>
  );
}

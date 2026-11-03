import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { validarUrlFotoPerfil } from "../../../utils/foto-perfil";
import "../../../../features/layout/styles/sidebar.css";

type NomeIconeSidebar = "inicio" | "plano" | "fazer" | "checar" | "agir" | "ciclos" | "cato" | "perfil";

function IconeSidebar({ nome }: { nome: NomeIconeSidebar }) {
  const conteudo: Record<NomeIconeSidebar, ReactNode> = {
    inicio: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    plano: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8 10h8M8 14h8M8 18h4" /></>,
    fazer: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4z" /></>,
    checar: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="m7.5 12 3 3 6-6" /></>,
    agir: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    ciclos: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" /></>,
    cato: <><path d="M4 10 3 4l6 3a10 10 0 0 1 6 0l6-3-1 6a8 8 0 1 1-16 0Z" /><path d="M8.5 11h.01M15.5 11h.01M9 15c2 1.5 4 1.5 6 0M3 12l3 1M21 12l-3 1" /></>,
    perfil: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };

  return <svg className="sidebar__icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{conteudo[nome]}</svg>;
}

type ItemSidebarProps = {
  ativo: boolean;
  icone: NomeIconeSidebar;
  nome: string;
  destino: string | null;
};

function ItemSidebar({ ativo, icone, nome, destino }: ItemSidebarProps) {
  const conteudo = <><IconeSidebar nome={icone} /><span className="barra-lateral_rotulo">{nome}</span></>;

  if (!destino) {
    return (
      <button className="barra-lateral_item" type="button" disabled aria-label={nome} title="Abra um ciclo para acessar esta etapa">
        {conteudo}
      </button>
    );
  }

  return (
    <Link className="barra-lateral_item" to={destino} aria-label={nome} aria-current={ativo ? "page" : undefined}>
      {conteudo}
    </Link>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const { cicloId } = useParams<{ cicloId: string }>();
  const { actaUser, firebaseUser } = useAuth();
  const [fotoPerfilFalhou, setFotoPerfilFalhou] = useState(false);
  const nomePerfil = actaUser?.nome || firebaseUser?.displayName || "";
  const iniciaisPerfil = nomePerfil.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR") || "?";
  const fotoPerfil = validarUrlFotoPerfil(actaUser?.fotoPerfilUrl || firebaseUser?.photoURL);
  useEffect(() => setFotoPerfilFalhou(false), [fotoPerfil]);
  const estaEmPlano = pathname.includes("/plan");
  const estaEmChecar = pathname === "/check" || /^\/do\/ciclo\/\d+\/check(?:\/|$)/.test(pathname);
  const estaEmAgir = pathname === "/act" || /^\/do\/ciclo\/\d+\/act(?:\/|$)/.test(pathname);
  const estaEmFazer = pathname === "/do" || (
    /^\/do\/ciclo\/\d+(?:\/|$)/.test(pathname) && !/\/(?:plan|check|act)(?:\/|$)/.test(pathname)
  );
  const estaEmInicio = pathname === "/";
  const estaEmPerfil = pathname.startsWith("/perfil");
  const estaEmCato = pathname.startsWith("/cato");
  const rotaAgir = cicloId ? `/do/ciclo/${cicloId}/act` : "/act";

  return (
    <aside className="barra-lateral sidebar" aria-label="Navegação principal">
      <nav className="barra-lateral_navegacao" aria-label="Etapas do ACTA">
        <ItemSidebar nome="Início" icone="inicio" destino="/" ativo={estaEmInicio} />
        <ItemSidebar nome="Plan" icone="plano" destino="/plan/ciclos" ativo={estaEmPlano} />
        <ItemSidebar nome="Do" icone="fazer" destino="/do" ativo={estaEmFazer} />
        <ItemSidebar nome="Check" icone="checar" destino="/check" ativo={estaEmChecar} />
        <ItemSidebar nome="Act" icone="agir" destino={rotaAgir} ativo={estaEmAgir} />
      </nav>

      <nav className="sidebar_atalhos" aria-label="Acesso rápido">
        <Link to="/ciclos" aria-current={pathname === "/ciclos" || pathname.startsWith("/ciclos/") ? "page" : undefined}><IconeSidebar nome="ciclos" /><span>Ciclos</span></Link>
        <Link to="/cato" aria-current={estaEmCato ? "page" : undefined}><IconeSidebar nome="cato" /><span>Cato</span></Link>
      </nav>

      <Link className="barra-lateral_item barra-lateral_perfil" to="/perfil" aria-label={`Perfil${nomePerfil ? ` de ${nomePerfil}` : ""}`} aria-current={estaEmPerfil ? "page" : undefined}>
        {fotoPerfil && !fotoPerfilFalhou
          ? <img className="sidebar__arte--perfil-foto" src={fotoPerfil} alt="" onError={() => setFotoPerfilFalhou(true)} />
          : <span className="barra-lateral_perfil-fallback" aria-hidden="true">{iniciaisPerfil}</span>}
      </Link>

    </aside>
  );
}

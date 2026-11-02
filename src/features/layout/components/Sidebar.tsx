import { Link, useLocation, useParams } from "react-router-dom";
import inicioInativo from "../assets/sidebar/inicio-inativo.png";
import inicioSelecionado from "../assets/sidebar/inicio-selecionado.png";
import planoInativo from "../assets/sidebar/plano-inativo.png";
import planoSelecionado from "../assets/sidebar/plano-selecionado.png";
import fazerInativo from "../assets/sidebar/fazer-inativo.png";
import fazerSelecionado from "../assets/sidebar/fazer-selecionado.png";
import checarInativo from "../assets/sidebar/checar-inativo.png";
import checarSelecionado from "../assets/sidebar/checar-selecionado.png";
import agirInativo from "../assets/sidebar/agir-inativo.png";
import agirSelecionado from "../assets/sidebar/agir-selecionado.png";
import perfilInativo from "../assets/sidebar/perfil-inativo.png";
import perfilSelecionado from "../assets/sidebar/perfil-selecionado.png";
import iconeNotificacoes from "../../perfil/assets/icone-notificacoes.png";
import iconeRelatorios from "../assets/icone-relatorios.svg";
import iconeCiclos from "../assets/icone-ciclos.svg";
import "../styles/sidebar.css";

type ItemSidebarProps = {
  ativo: boolean;
  imagemAtiva: string;
  imagemInativa: string;
  nome: string;
  destino: string | null;
};

function ItemSidebar({ ativo, imagemAtiva, imagemInativa, nome, destino }: ItemSidebarProps) {
  const conteudo = <img className="sidebar__arte" src={ativo ? imagemAtiva : imagemInativa} alt="" />;

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
  const estaEmPlano = pathname.includes("/plan");
  const estaEmChecar = pathname === "/check" || /^\/do\/ciclo\/\d+\/check(?:\/|$)/.test(pathname);
  const estaEmAgir = pathname === "/act" || /^\/do\/ciclo\/\d+\/act(?:\/|$)/.test(pathname);
  const estaEmFazer = pathname === "/do" || (
    /^\/do\/ciclo\/\d+(?:\/|$)/.test(pathname) && !/\/(?:plan|check|act)(?:\/|$)/.test(pathname)
  );
  const estaEmInicio = pathname === "/";
  const estaEmPerfil = pathname.startsWith("/perfil");
  const rotaAgir = cicloId ? `/do/ciclo/${cicloId}/act` : "/act";

  return (
    <aside className="barra-lateral sidebar" aria-label="Navegação principal">
      <nav className="barra-lateral_navegacao" aria-label="Etapas do ACTA">
        <ItemSidebar nome="Início" destino="/" ativo={estaEmInicio} imagemAtiva={inicioSelecionado} imagemInativa={inicioInativo} />
        <ItemSidebar nome="Plano" destino="/plan/ciclos" ativo={estaEmPlano} imagemAtiva={planoSelecionado} imagemInativa={planoInativo} />
        <ItemSidebar nome="Fazer" destino="/do" ativo={estaEmFazer} imagemAtiva={fazerSelecionado} imagemInativa={fazerInativo} />
        <ItemSidebar nome="Checar" destino="/check" ativo={estaEmChecar} imagemAtiva={checarSelecionado} imagemInativa={checarInativo} />
        <ItemSidebar nome="Agir" destino={rotaAgir} ativo={estaEmAgir} imagemAtiva={agirSelecionado} imagemInativa={agirInativo} />
      </nav>

      <Link className="barra-lateral_item barra-lateral_perfil" to="/perfil" aria-label="Perfil" aria-current={estaEmPerfil ? "page" : undefined}>
        <img className="sidebar__arte sidebar__arte--perfil" src={estaEmPerfil ? perfilSelecionado : perfilInativo} alt="" />
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

import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="page-shell">
      <p className="eyebrow">ACTA</p>
      <h1>Base do ACTA Web preparada</h1>
      <p>
        A estrutura inicial está pronta. As áreas de autenticação, PDCA,
        documentos, relatórios e dashboard serão implementadas nas próximas
        etapas.
      </p>
      <nav className="page-shell_navegacao" aria-label="Acesso às páginas disponíveis">
        <Link to="/login">Ir para login</Link>
        <Link to="/perfil">Ver perfil</Link>
      </nav>
    </main>
  );
}

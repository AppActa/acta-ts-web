import { PainelMarca } from "../components/PainelMarca";
import { FormularioLogin } from "../components/FormularioLogin";
import "../styles/pagina-login.css";

export function PaginaLogin() {
  return (
    <main className="pagina-login">
      <section className="layout-login" aria-labelledby="titulo-login">
        <PainelMarca />
        <FormularioLogin />
      </section>
    </main>
  );
}

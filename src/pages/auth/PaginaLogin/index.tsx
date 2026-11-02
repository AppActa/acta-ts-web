import { PainelMarca } from "../../../components/auth/PainelMarca";
import { FormularioLogin } from "../../../components/auth/FormularioLogin";
import { solicitarRedefinicaoDeSenha } from "../../../services/api/auth/firebase-auth.api";
import "../../../../features/auth/styles/pagina-login.css";

export function PaginaLogin() {
  return (
    <main className="pagina-login">
      <section className="layout-login" aria-labelledby="titulo-login">
        <PainelMarca />
        <FormularioLogin solicitarRedefinicao={solicitarRedefinicaoDeSenha} />
      </section>
    </main>
  );
}

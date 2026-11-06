import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../../auth/AuthProvider";
import { router } from "../../../app/router";
import "../../../../features/theme/styles/dark-mode.css";
import "../../../../features/theme/styles/high-contrast.css";

const CHAVE_PREFERENCIAS = "acta:preferencias-perfil";

function lerTemaSalvo(): "claro" | "escuro" {
  try {
    const preferencias: unknown = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? "null");
    if (typeof preferencias === "object" && preferencias !== null && "tema" in preferencias) {
      const tema = (preferencias as { tema?: unknown }).tema;
      if (tema === "claro" || tema === "escuro") return tema;
    }
  } catch {
    // Preferências ausentes ou inválidas usam o tema claro padrão.
  }
  return "claro";
}

function sincronizarTemaGlobal() {
  const raiz = document.getElementById("root");
  const paginaPerfil = raiz?.querySelector<HTMLElement>(".pagina-perfil, .pagina-editar-perfil");
  const temaPerfil = paginaPerfil?.dataset.tema;
  const tema = temaPerfil === "claro" || temaPerfil === "escuro" ? temaPerfil : lerTemaSalvo();
  let altoContraste = false;
  try {
    const preferencias: unknown = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? "null");
    if (typeof preferencias === "object" && preferencias !== null && "altoContraste" in preferencias
      && typeof preferencias.altoContraste === "boolean") altoContraste = preferencias.altoContraste;
  } catch {
    // Usa a preferência padrão da tela de perfil.
  }
  if (paginaPerfil?.dataset.contraste === "alto") altoContraste = true;
  if (paginaPerfil?.dataset.contraste === "normal") altoContraste = false;

  document.body.dataset.tema = tema;
  if (tema === "escuro" && !paginaPerfil) document.body.dataset.temaAplicativo = "escuro";
  else delete document.body.dataset.temaAplicativo;
  if (altoContraste && !paginaPerfil) document.body.dataset.contrasteAplicativo = "alto";
  else delete document.body.dataset.contrasteAplicativo;
}

export function App() {
  useEffect(() => {
    const raiz = document.getElementById("root");
    if (!raiz) return;

    const observarMudancasDeTela = (registros: MutationRecord[]) => {
      const mudouPaginaPerfil = registros.some((registro) => {
        if (registro.type === "attributes") {
          return registro.target instanceof HTMLElement
            && (registro.target.classList.contains("pagina-perfil") || registro.target.classList.contains("pagina-editar-perfil"));
        }
        return [...registro.addedNodes, ...registro.removedNodes].some((no) => no instanceof Element
          && (no.matches(".pagina-perfil, .pagina-editar-perfil") || Boolean(no.querySelector(".pagina-perfil, .pagina-editar-perfil"))));
      });
      if (mudouPaginaPerfil) sincronizarTemaGlobal();
    };

    sincronizarTemaGlobal();
    const observador = new MutationObserver(observarMudancasDeTela);
    observador.observe(raiz, { attributes: true, attributeFilter: ["data-tema", "data-contraste"], childList: true, subtree: true });
    window.addEventListener("storage", sincronizarTemaGlobal);
    return () => {
      observador.disconnect();
      window.removeEventListener("storage", sincronizarTemaGlobal);
    };
  }, []);

  return (
    <AuthProvider>
      <>
        <RouterProvider router={router} />
        <footer className="app-footer">
          <small>ACTA · Apoio à melhoria contínua com PDCA</small>
        </footer>
      </>
    </AuthProvider>
  );
}

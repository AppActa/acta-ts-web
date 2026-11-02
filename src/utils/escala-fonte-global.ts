const CHAVE_PREFERENCIAS = "acta:preferencias-perfil";
const PROPRIEDADE_TAMANHO_BASE = "--acta-tamanho-fonte-base";

function tamanhoFonteGrandeSalvo(): boolean {
  try {
    const preferencias: unknown = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? "null");
    return typeof preferencias === "object" && preferencias !== null
      && "fonteGrande" in preferencias && preferencias.fonteGrande === true;
  } catch {
    return false;
  }
}

function capturarTamanhoFonte(elementos: Iterable<Element>) {
  for (const elemento of elementos) {
    const tamanho = window.getComputedStyle(elemento).fontSize;
    (elemento as HTMLElement).style.setProperty(PROPRIEDADE_TAMANHO_BASE, tamanho);
  }
}

function todosElementos(raiz: ParentNode): Element[] {
  return Array.from(raiz.querySelectorAll("*"));
}

export function aplicarEscalaFonteGlobal(fonteGrande: boolean) {
  document.documentElement.dataset.actaFonte = fonteGrande ? "grande" : "normal";
}

export function iniciarEscalaFonteGlobal() {
  const documento = document.documentElement;
  documento.dataset.actaFonte = "normal";
  capturarTamanhoFonte(todosElementos(document.body));
  aplicarEscalaFonteGlobal(tamanhoFonteGrandeSalvo());

  const observador = new MutationObserver((mudancas) => {
    const adicionados = mudancas.flatMap((mudanca) => Array.from(mudanca.addedNodes))
      .filter((no): no is Element => no.nodeType === Node.ELEMENT_NODE);
    if (adicionados.length === 0) return;

    const fonteGrande = documento.dataset.actaFonte === "grande";
    if (fonteGrande) documento.dataset.actaFonte = "normal";
    const elementos = adicionados.flatMap((elemento) => [elemento, ...todosElementos(elemento)]);
    capturarTamanhoFonte(elementos);
    if (fonteGrande) documento.dataset.actaFonte = "grande";
  });

  observador.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", () => {
    const fonteGrande = documento.dataset.actaFonte === "grande";
    if (fonteGrande) documento.dataset.actaFonte = "normal";
    capturarTamanhoFonte(todosElementos(document.body));
    if (fonteGrande) documento.dataset.actaFonte = "grande";
  }, { passive: true });
}

import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import "../styles/layout-proporcional.css";

const REFERENCIA = { largura: 1440, altura: 1024 };

function medirViewport() {
  const escala = Math.min(
    1,
    window.innerWidth / REFERENCIA.largura,
    window.innerHeight / REFERENCIA.altura,
  );

  return {
    escala,
    largura: window.innerWidth / escala,
    altura: window.innerHeight / escala,
  };
}

export function LayoutProporcional({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState(medirViewport);

  useLayoutEffect(() => {
    const atualizar = () => setViewport(medirViewport());
    window.addEventListener("resize", atualizar);
    return () => window.removeEventListener("resize", atualizar);
  }, []);

  const estilo = {
    "--escala-layout": viewport.escala,
    "--largura-layout": `${viewport.largura}px`,
    "--altura-layout": `${viewport.altura}px`,
  } as CSSProperties;

  return (
    <div className="layout-proporcional" style={estilo}>
      <div className="layout-proporcional_cena">{children}</div>
    </div>
  );
}

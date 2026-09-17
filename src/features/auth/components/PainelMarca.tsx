import logoActa from "../assets/logo-acta.svg";

export function PainelMarca() {
  return (
    <aside className="painel-marca" aria-label="ACTA">
      <img className="painel-marca_logo" src={logoActa} alt="ACTA" />

      <p className="painel-marca_mensagem">
        <span>Acta, seu app de PDCA</span>
        <strong>
          O ciclo da melhoria
          <br /> começa aqui!
        </strong>
      </p>
    </aside>
  );
}

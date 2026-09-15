type PropriedadesAlternador = {
  ativo?: boolean;
};

export function Alternador({ ativo = true }: PropriedadesAlternador) {
  return (
    <span className="alternador" aria-hidden="true">
      <span className={ativo ? "alternador_opcao alternador_opcao-ativa" : "alternador_opcao"}>ON</span>
      <span className={!ativo ? "alternador_opcao alternador_opcao-ativa" : "alternador_opcao"}>OFF</span>
    </span>
  );
}

type PropriedadesAlternador = {
  ativo: boolean;
  aoMudar: (ativo: boolean) => void;
  rotulo: string;
};

export function Alternador({ ativo, aoMudar, rotulo }: PropriedadesAlternador) {
  return (
    <button
      className="alternador"
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={rotulo}
      onClick={() => aoMudar(!ativo)}
    >
      <span className={ativo ? "alternador_opcao alternador_opcao-ativa" : "alternador_opcao"}>ON</span>
      <span className={!ativo ? "alternador_opcao alternador_opcao-ativa" : "alternador_opcao"}>OFF</span>
    </button>
  );
}

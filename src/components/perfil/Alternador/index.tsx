import type { AlternadorProps } from "../../../types/perfil";

export function Alternador({ ativo, aoMudar, rotulo }: AlternadorProps) {
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

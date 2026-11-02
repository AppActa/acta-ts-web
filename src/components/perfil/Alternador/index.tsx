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
      <span className="alternador_status">{ativo ? "ON" : "OFF"}</span>
      <span className="alternador_indicador" aria-hidden="true" />
    </button>
  );
}

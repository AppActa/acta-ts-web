import logoGoogle from "../../../../features/auth/assets/logo-google.png";
import type { BotaoLoginGoogleProps } from "../../../types/auth";

export function BotaoLoginGoogle({ aoClicar, desabilitado = false }: BotaoLoginGoogleProps) {
  return (
    <button className="botao-login-google" type="button" onClick={aoClicar} disabled={desabilitado}>
      <img src={logoGoogle} alt="" />
      <span>{desabilitado ? "Conectando ao Google…" : "Continuar com Google"}</span>
    </button>
  );
}

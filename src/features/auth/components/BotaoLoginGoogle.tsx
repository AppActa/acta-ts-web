import logoGoogle from "../assets/logo-google.png";

type PropriedadesBotaoLoginGoogle = {
  aoClicar: () => void;
  desabilitado?: boolean;
};

export function BotaoLoginGoogle({ aoClicar, desabilitado = false }: PropriedadesBotaoLoginGoogle) {
  return (
    <button className="botao-login-google" type="button" onClick={aoClicar} disabled={desabilitado}>
      <img src={logoGoogle} alt="" />
      <span>{desabilitado ? "Conectando ao Google…" : "Continuar com Google"}</span>
    </button>
  );
}
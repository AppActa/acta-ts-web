import logoGoogle from "../assets/logo-google.png";

export function BotaoLoginGoogle() {
  return (
    <button className="botao-login-google" type="button">
      <img src={logoGoogle} alt="" />
      <span>Continuar com Google</span>
    </button>
  );
}

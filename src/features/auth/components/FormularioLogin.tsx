import { useState, type FormEvent } from "react";
import { BotaoLoginGoogle } from "./BotaoLoginGoogle";
import { ModalRecuperarSenha } from "./ModalRecuperarSenha";
import { CampoLogin } from "./CampoLogin";
import { MensagemErroLogin } from "./MensagemErroLogin";

export function FormularioLogin() {
  const [temErroLogin, definirErroLogin] = useState(false);
  const [mostrarRecuperacao, definirMostrarRecuperacao] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Apenas para testar a mensagem:
    definirErroLogin(true);
  }

  return (
    <div className="conteudo-login">
      <div className="cabecalho-login">
        <h1 id="titulo-login">Login</h1>
        <p>
          Junte-se ao ACTA e dê início a um novo ciclo em
          <br className="cabecalho-login_quebra-desktop" /> sua carreira por meio
          da metodologia PDCA.
        </p>
        <MensagemErroLogin visivel={temErroLogin} />
      </div>

      <form className="formulario-login" onSubmit={handleSubmit}>
        <CampoLogin
          id="email-login"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
        />

        <CampoLogin
          id="senha-login"
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
        />

        <button className="formulario-login_botao" type="submit">
          Concluído
        </button>
      </form>

      <div className="divisor-login" aria-hidden="true">
        <span>ou</span>
      </div>

      <BotaoLoginGoogle />

      <button
        type="button"
        className="esqueci-senha"
        onClick={() => definirMostrarRecuperacao(true)}
      >
        Esqueceu sua senha?
      </button>

      <ModalRecuperarSenha
        visivel={mostrarRecuperacao}
        aoFechar={() => definirMostrarRecuperacao(false)}
      />
    </div>
  );
}

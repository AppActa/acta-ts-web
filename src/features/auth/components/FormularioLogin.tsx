import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../../../auth/AuthProvider";
import { ModalRecuperarSenha } from "./ModalRecuperarSenha";
import { CampoLogin } from "./CampoLogin";
import { MensagemErroLogin } from "./MensagemErroLogin";
import { BotaoLoginGoogle } from "./BotaoLoginGoogle";

export function FormularioLogin() {
  const { firebaseUser, actaUser, loading, error, login, loginWithGoogle, logout } = useAuth();
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [enviando, definirEnviando] = useState(false);
  const [entrandoComGoogle, definirEntrandoComGoogle] = useState(false);
  const [mostrarRecuperacao, definirMostrarRecuperacao] = useState(false);
  const navegar = useNavigate();
  const localizacao = useLocation();

  if (firebaseUser && !loading) return <Navigate to={actaUser?.status === "ATIVO" ? "/" : "/onboarding"} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirMensagemErro(null);
    definirEnviando(true);

    const dados = new FormData(event.currentTarget);
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("password") ?? "");

    try {
      await login(email, senha);
      const origem = (localizacao.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navegar(origem || "/", { replace: true });
    } catch (erro) {
      definirMensagemErro(
        erro instanceof FirebaseError &&
          ["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(erro.code)
          ? "E-mail ou senha inválidos."
          : erro instanceof FirebaseError && erro.code === "auth/invalid-email"
            ? "Informe um e-mail válido."
          : erro instanceof FirebaseError && erro.code === "auth/network-request-failed"
            ? "Falha de conexão. Verifique sua internet e tente novamente."
            : "Não foi possível entrar. Confira os dados e tente novamente.",
      );
    } finally {
      definirEnviando(false);
    }
  }

  async function handleGoogleLogin() {
    definirMensagemErro(null);
    definirEntrandoComGoogle(true);
    try {
      await loginWithGoogle();
      const origem = (localizacao.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navegar(origem || "/", { replace: true });
    } catch (erro) {
      definirMensagemErro(
        erro instanceof FirebaseError && erro.code === "auth/popup-closed-by-user"
          ? "A janela do Google foi fechada antes da conclusão."
          : erro instanceof FirebaseError && erro.code === "auth/popup-blocked"
            ? "Seu navegador bloqueou a janela do Google. Permita pop-ups e tente novamente."
            : erro instanceof FirebaseError && erro.code === "auth/unauthorized-domain"
              ? "Não foi possível entrar com o Google neste endereço. Tente novamente mais tarde."
              : "Não foi possível entrar com o Google. Tente novamente.",
      );
    } finally {
      definirEntrandoComGoogle(false);
    }
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
        <MensagemErroLogin mensagem={mensagemErro ?? error} />
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

        <button
          className={`formulario-login_botao${loading || enviando ? " formulario-login_botao--carregando" : ""}`}
          type="submit"
          disabled={loading || enviando}
          aria-busy={loading || enviando}
        >
          {(loading || enviando) && <span className="formulario-login_spinner" aria-hidden="true" />}
          {loading ? "Carregando sua conta…" : enviando ? "Entrando…" : "Concluído"}
        </button>
      </form>

      <div className="divisor-login" aria-hidden="true">ou</div>
      <BotaoLoginGoogle aoClicar={() => void handleGoogleLogin()} desabilitado={loading || enviando || entrandoComGoogle} />

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

      <Link className="cadastro-login" to="/criar-conta">Criar conta para cadastrar empresa ou gestor</Link>

      {firebaseUser && !actaUser && (
        <button type="button" className="esqueci-senha" onClick={() => void logout()}>
          Sair e usar outra conta
        </button>
      )}
    </div>
  );
}

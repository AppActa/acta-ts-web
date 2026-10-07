import { useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";

type PropriedadesModalRecuperarSenha = {
  visivel: boolean;
  aoFechar: () => void;
};

export function ModalRecuperarSenha({
  visivel,
  aoFechar,
}: PropriedadesModalRecuperarSenha) {
  const [mensagem, definirMensagem] = useState<string | null>(null);
  const [enviando, definirEnviando] = useState(false);

  if (!visivel) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirMensagem(null);
    definirEnviando(true);
    const dados = new FormData(event.currentTarget);
    const email = String(dados.get("email-recuperacao") ?? "").trim();

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (!(error instanceof FirebaseError) || error.code !== "auth/user-not-found") {
        definirMensagem("Não foi possível enviar o e-mail. Tente novamente.");
        definirEnviando(false);
        return;
      }
    }

    definirMensagem("Se houver uma conta para esse e-mail, enviaremos as instruções de recuperação.");
    definirEnviando(false);
  }

  return (
    <div className="modal-recuperar_overlay" role="presentation" onClick={aoFechar}>
      <section
        className="modal-recuperar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-recuperar"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-recuperar_fechar"
          type="button"
          aria-label="Fechar"
          onClick={aoFechar}
        >
          ×
        </button>

        <h2 id="titulo-modal-recuperar">Esqueceu sua senha?</h2>
        <p className="modal-recuperar_descricao">Recupere por endereço de email</p>

        <form className="modal-recuperar_formulario" onSubmit={handleSubmit}>
          {mensagem && <p className="modal-recuperar_erro" role="status">{mensagem}</p>}
          <label htmlFor="email-recuperacao">Email</label>
          <input id="email-recuperacao" name="email-recuperacao" type="email" autoComplete="email" required />
          <button className="formulario-login_botao" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Concluído"}
          </button>
        </form>
      </section>
    </div>
  );
}
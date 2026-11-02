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
  const [emailAusente, definirEmailAusente] = useState(false);

  if (!visivel) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirMensagem(null);
    definirEnviando(true);
    const dados = new FormData(event.currentTarget);
    const email = String(dados.get("email-recuperacao") ?? "").trim();
    if (!email) {
      definirEmailAusente(true);
      definirEnviando(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (!(error instanceof FirebaseError) || error.code !== "auth/user-not-found") {
        definirMensagem("Não foi possível enviar o e-mail. Tente novamente.");
        definirEnviando(false);
        return;
      }
    }

    definirMensagem(null);
    definirEnviando(false);
  }

  return (
    <section className="modal-recuperar" aria-labelledby="titulo-modal-recuperar">
      <h2 id="titulo-modal-recuperar">Recuperar senha</h2>
      <p className={`modal-recuperar_descricao${mensagem ? " modal-recuperar_descricao--com-mensagem" : ""}`}>
        Informe o e-mail usado no ACTA.
      </p>
      {mensagem && <p className="modal-recuperar_erro modal-recuperar_mensagem" role="status">{mensagem}</p>}

      <form className="modal-recuperar_formulario" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email-recuperacao">E-mail *</label>
        <input
          id="email-recuperacao"
          name="email-recuperacao"
          type="email"
          autoComplete="email"
          placeholder="Preencha este campo"
          required
          aria-invalid={emailAusente}
          aria-describedby={emailAusente ? "email-recuperacao-erro" : undefined}
          onChange={() => definirEmailAusente(false)}
        />
        {emailAusente && <p className="modal-recuperar_erro" id="email-recuperacao-erro" role="alert">E-mail é obrigatório.</p>}
        <button className="formulario-login_botao" type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Continuar"}
        </button>
        <button className="modal-recuperar_voltar" type="button" onClick={aoFechar}>
          Voltar ao login
        </button>
      </form>
    </section>
  );
}

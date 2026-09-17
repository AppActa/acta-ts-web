type PropriedadesModalRecuperarSenha = {
  visivel: boolean;
  aoFechar: () => void;
};

export function ModalRecuperarSenha({
  visivel,
  aoFechar,
}: PropriedadesModalRecuperarSenha) {
  if (!visivel) return null;

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
          aria-label="Fechar recuperação de senha"
          onClick={aoFechar}
        >
          ×
        </button>

        <h2 id="titulo-modal-recuperar">Esqueceu sua senha?</h2>
        <p className="modal-recuperar_descricao">Recupere por endereço de email</p>

        <form className="modal-recuperar_formulario" onSubmit={(event) => event.preventDefault()}>
          <p className="modal-recuperar_erro">email inválido/incorreto*</p>
          <label htmlFor="email-recuperacao">Email</label>
          <input id="email-recuperacao" name="email-recuperacao" type="email" required />
          <button className="formulario-login_botao" type="submit">
            Concluído
          </button>
        </form>
      </section>
    </div>
  );
}

import type { FormularioEditarPerfilProps } from "../../../types/perfil";

export function FormularioEditarPerfil({ nome, email, erro, enviando, aoAlterarNome, aoSalvar }: FormularioEditarPerfilProps) {
  return (
    <form className="formulario-editar-perfil" onSubmit={aoSalvar} noValidate>
      <h1 id="titulo-editar-perfil">Dados do perfil</h1>

      <div className="campo-editar-perfil">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" type="text" value={nome} onChange={(evento) => aoAlterarNome(evento.target.value)} autoComplete="name" maxLength={160} required aria-invalid={Boolean(erro)} aria-describedby={erro ? "erro-nome-perfil" : "ajuda-email-perfil"} />
      </div>

      <div className="campo-editar-perfil">
        <label htmlFor="email">E-mail da conta</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          autoComplete="email"
          readOnly
          aria-describedby="ajuda-email-perfil"
        />
      </div>
      <p className="ajuda-editar-perfil" id="ajuda-email-perfil">O e-mail é gerenciado pela conta ACTA e não pode ser alterado nesta tela.</p>
      {erro && <p className="erro-editar-perfil" id="erro-nome-perfil" role="alert">{erro}</p>}

      <button className="botao-concluir-edicao" type="submit" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar nome"}
      </button>
    </form>
  );
}

import type { FormEvent } from "react";

type PropriedadesFormularioEditarPerfil = {
  aoConcluir: () => void;
  aoVoltar: () => void;
};

export function FormularioEditarPerfil({ aoConcluir, aoVoltar }: PropriedadesFormularioEditarPerfil) {
  function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aoConcluir();
  }

  return (
    <form className="formulario-editar-perfil" onSubmit={enviarFormulario}>
      <button className="botao-voltar-edicao" type="button" onClick={aoVoltar}>
        <span aria-hidden="true">←</span>
        Voltar
      </button>
      <h1 id="titulo-editar-perfil">Editar perfil</h1>

      <div className="campo-editar-perfil">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" type="text" defaultValue="Catarina Cândido" autoComplete="name" />
      </div>

      <div className="campo-editar-perfil">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue="catarina.candido@saveit.com"
          autoComplete="email"
        />
      </div>

      <button className="botao-concluir-edicao" type="submit">
        Concluído
      </button>
    </form>
  );
}

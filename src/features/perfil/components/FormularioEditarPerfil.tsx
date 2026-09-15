import type { FormEvent } from "react";

type PropriedadesFormularioEditarPerfil = {
  aoConcluir: () => void;
};

export function FormularioEditarPerfil({ aoConcluir }: PropriedadesFormularioEditarPerfil) {
  function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aoConcluir();
  }

  return (
    <form className="formulario-editar-perfil" onSubmit={enviarFormulario}>
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

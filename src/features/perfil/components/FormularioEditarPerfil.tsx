import { useAuth } from "../../../auth/AuthProvider";

type PropriedadesFormularioEditarPerfil = {
  aoConcluir: () => void;
};

export function FormularioEditarPerfil({}: PropriedadesFormularioEditarPerfil) {
  const { actaUser } = useAuth();

  return (
    <form className="formulario-editar-perfil" onSubmit={(evento) => evento.preventDefault()}>
      <h1 id="titulo-editar-perfil">Editar perfil</h1>

      <div className="campo-editar-perfil">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" type="text" defaultValue={actaUser?.nome ?? ""} autoComplete="name" />
      </div>

      <div className="campo-editar-perfil">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={actaUser?.email ?? ""}
          autoComplete="email"
        />
      </div>

      <button className="botao-concluir-edicao" type="submit" disabled>
        Concluído
      </button>
    </form>
  );
}

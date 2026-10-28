import { useAuth } from "../../../auth/AuthProvider";
import { AvisoDadosDemonstrativos } from "../../layout/components/AvisoDadosDemonstrativos";

type PropriedadesFormularioEditarPerfil = {
  aoConcluir: () => void;
  aoVoltar: () => void;
};

export function FormularioEditarPerfil({ aoVoltar }: PropriedadesFormularioEditarPerfil) {
  const { actaUser } = useAuth();

  return (
    <form className="formulario-editar-perfil" onSubmit={(evento) => evento.preventDefault()}>
      <AvisoDadosDemonstrativos mensagem="O perfil exibido pertence à sua conta; esta edição é demonstrativa e não salva alterações." />
      <button className="botao-voltar-edicao" type="button" onClick={aoVoltar}>
        <span aria-hidden="true">{/* # colocar imagem */}</span>
        Voltar
      </button>
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

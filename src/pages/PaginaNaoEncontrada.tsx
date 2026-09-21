import { useNavigate } from "react-router-dom";

export function PaginaNaoEncontrada() {
  const navegar = useNavigate();

  return (
    <main className="page-shell" aria-labelledby="titulo-nao-encontrada">
      <p className="eyebrow">Erro 404</p>
      <h1 id="titulo-nao-encontrada">Página não encontrada</h1>
      <p>O endereço informado não corresponde a uma página do ACTA.</p>
      <button className="page-shell_botao" type="button" onClick={() => navegar("/")}>
        Voltar ao início
      </button>
    </main>
  );
}

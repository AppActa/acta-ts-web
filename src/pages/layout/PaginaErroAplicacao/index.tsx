import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import "../../../../features/layout/styles/pagina-erro-aplicacao.css";

export function PaginaErroAplicacao() {
  const erro = useRouteError();
  const naoEncontrado = isRouteErrorResponse(erro) && erro.status === 404;

  return (
    <main className="pagina-erro-aplicacao">
      <section className="pagina-erro-aplicacao_cartao" aria-labelledby="pagina-erro-aplicacao_titulo" role="alert">
        <span className="pagina-erro-aplicacao_codigo" aria-hidden="true">{naoEncontrado ? "404" : "Ops"}</span>
        <h1 id="pagina-erro-aplicacao_titulo">{naoEncontrado ? "Não encontramos esta página" : "Não foi possível abrir esta tela"}</h1>
        <p>{naoEncontrado ? "Confira o endereço ou volte para o início do ACTA." : "Ocorreu um problema inesperado. Tente carregar a tela novamente."}</p>
        <div className="pagina-erro-aplicacao_acoes">
          <button type="button" onClick={() => window.location.reload()}>Tentar novamente</button>
          <Link to="/">Ir para o início</Link>
        </div>
      </section>
    </main>
  );
}

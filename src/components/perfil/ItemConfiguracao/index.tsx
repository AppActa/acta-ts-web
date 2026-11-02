import { Link } from "react-router-dom";
import { Icone } from "../Icone";
import type { ItemConfiguracaoProps } from "../../../types/perfil";

export function ItemConfiguracao({ aoClicar, acao, desabilitado = false, destino, icone, imagemIcone, texto }: ItemConfiguracaoProps) {
  const conteudo = (
    <>
      <span className="item-configuracao_icone">
        {imagemIcone ? (
          <img className="item-configuracao_imagem" src={imagemIcone} alt="" />
        ) : icone ? (
          <Icone nome={icone} />
        ) : null}
      </span>
      <span className="item-configuracao_texto">{texto}</span>
      <span className="item-configuracao_acao" aria-hidden={acao ? undefined : "true"}>{acao ?? ">"}</span>
    </>
  );

  if (destino) {
    return (
      <Link className="item-configuracao item-configuracao_link" to={destino}>
        {conteudo}
      </Link>
    );
  }

  if (aoClicar || desabilitado) {
    return (
      <button className="item-configuracao item-configuracao_interativo" type="button" onClick={aoClicar} disabled={desabilitado}>
        {conteudo}
      </button>
    );
  }

  return (
    <div className="item-configuracao">
      {conteudo}
    </div>
  );
}

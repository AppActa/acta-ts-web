import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icone, type NomeIcone } from "./Icone";

type PropriedadesItemConfiguracao = {
  acao?: ReactNode;
  destino?: string;
  icone?: NomeIcone;
  imagemIcone?: string;
  texto: string;
};

export function ItemConfiguracao({ acao, destino, icone, imagemIcone, texto }: PropriedadesItemConfiguracao) {
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
      <span className="item-configuracao_acao">{acao ?? ">"}</span>
    </>
  );

  if (destino) {
    return (
      <Link className="item-configuracao item-configuracao_link" to={destino}>
        {conteudo}
      </Link>
    );
  }

  return (
    <div className="item-configuracao">
      {conteudo}
    </div>
  );
}

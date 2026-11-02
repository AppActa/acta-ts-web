type CarregandoConteudoProps = {
  mensagem: string;
  compacto?: boolean;
};

export function CarregandoConteudo({ mensagem, compacto = false }: CarregandoConteudoProps) {
  if (compacto) {
    return (
      <span className="acta-loading-conteudo acta-loading-conteudo--compacto" role="status" aria-live="polite" aria-busy="true" aria-label={mensagem}>
        <span className="acta-loading-conteudo__indicador" aria-hidden="true" />
      </span>
    );
  }

  return (
    <div className="acta-loading-conteudo" role="status" aria-live="polite" aria-busy="true" aria-label={mensagem}>
      <span className="acta-loading-conteudo__indicador" aria-hidden="true" />
    </div>
  );
}

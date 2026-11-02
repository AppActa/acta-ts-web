type CarregandoPaginaProps = {
  mensagem?: string;
};

export function CarregandoPagina({ mensagem = "Preparando seu espaço de trabalho" }: CarregandoPaginaProps) {
  return (
    <main className="acta-loading" role="status" aria-live="polite" aria-busy="true" aria-label={mensagem}>
      <span className="acta-loading__spinner" aria-hidden="true" />
    </main>
  );
}

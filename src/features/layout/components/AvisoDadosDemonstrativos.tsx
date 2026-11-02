import "../styles/aviso-dados-demonstrativos.css";

type AvisoDadosDemonstrativosProps = {
  mensagem?: string;
};

export function AvisoDadosDemonstrativos({ mensagem = "Os exemplos desta seção são demonstrativos e não representam registros da sua conta." }: AvisoDadosDemonstrativosProps) {
  return (
    <aside className="aviso-dados-demonstrativos" role="note">
      <strong>Dados de demonstração</strong>
      <p>{mensagem}</p>
    </aside>
  );
}

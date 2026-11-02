import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { DetalheIndicador } from "../components/DetalheIndicador";
import "../styles/pagina-detalhe-indicador.css";

export function PaginaDetalheIndicador() {
  const { cicloId, indicadorId } = useParams();
  const resultado = useCicloDaConta(cicloId);
  const idIndicador = indicadorId && /^\d+$/.test(indicadorId) ? Number(indicadorId) : null;
  const idValido = idIndicador !== null && Number.isSafeInteger(idIndicador) && idIndicador > 0;

  if (resultado.estado !== "sucesso") return <main className="check-detalhe-indicador">
    <DetalheIndicador estado={resultado.estado} acaoFechar={<Link to="/ciclos">Voltar para ciclos</Link>} />
  </main>;

  return (
    <main className="check-detalhe-indicador">
      <DetalheIndicador estado={idValido ? "indisponivel" : "nao-encontrado"} acaoFechar={
        <Link to={`/do/ciclo/${resultado.ciclo.id}/check`} aria-label="Fechar detalhes do indicador">Fechar</Link>
      } />
    </main>
  );
}

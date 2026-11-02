import { Link, useParams } from "react-router-dom";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { DetalheIndicador } from "../../../components/check/DetalheIndicador";
import { lerIdRotaPositivo } from "../../../utils/route-params";
import "../../../../features/check/styles/pagina-detalhe-indicador.css";

export function PaginaDetalheIndicador() {
  const { cicloId, indicadorId } = useParams();
  const resultado = useCicloDaConta(cicloId);
  const idIndicador = lerIdRotaPositivo(indicadorId);
  const idValido = idIndicador !== null;

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

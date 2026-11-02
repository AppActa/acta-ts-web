import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { ConteudoCicloCheck, type DadosCicloCheck, type VerificacaoCicloCheck } from "../components/ConteudoCicloCheck";
import { useDadosCheckDoCiclo } from "../hooks/useDadosCheckDoCiclo";
import "../styles/pagina-ciclo-check.css";

function CheckDoCicloValidado({ idCiclo }: { idCiclo: number }) {
  const resultado = useDadosCheckDoCiclo(idCiclo);
  const acaoRegistrar = <Link className="ciclo-check_acao" to={`/do/ciclo/${idCiclo}/check/verificacoes/criar`}>Registrar verificações</Link>;
  if (resultado.estado !== "sucesso" && resultado.estado !== "vazio") return <ConteudoCicloCheck resultado={{ estado: resultado.estado }} acaoRegistrar={acaoRegistrar} />;
  const { metas, verificacoes } = resultado.dados;
  const verificacoesRecentes = [...verificacoes].sort((a, b) => {
    if (a.criadoEm === null) return b.criadoEm === null ? 0 : 1;
    if (b.criadoEm === null) return -1;
    return Date.parse(b.criadoEm) - Date.parse(a.criadoEm);
  });
  const situacoes: Record<(typeof verificacoes)[number]["status"], VerificacaoCicloCheck["situacao"]> = {
    NAO_VERIFICADO: "nao-verificado", APROVADO: "aprovado", PARCIAL: "parcial", REPROVADO: "reprovado",
  };
  const dados: DadosCicloCheck = {
    metricas: {
      indicadores: { valor: null, contexto: "Fonte de indicadores indisponível" },
      metasAtingidas: { valor: metas.filter((meta) => meta.status === "ATINGIDA").length, contexto: "Metas com status Atingida" },
      verificacoes: { valor: verificacoes.length, contexto: "Registros válidos deste ciclo" },
      efeitosSecundarios: { valor: verificacoes.reduce((total, item) => total + item.efeitosSecundarios.length, 0), contexto: "Efeitos vinculados às verificações" },
    },
    resultados: null,
    comparacoes: null,
    metas: metas.map((meta) => ({ id: String(meta.id), objetivo: meta.objetivo, base: meta.valorBase, alvo: meta.valorAlvo, unidade: meta.unidadeMedida, prazo: meta.prazo, status: meta.status })),
    verificacoes: verificacoesRecentes.map((item) => ({
      id: String(item.id), titulo: item.resumo?.trim() || "Resumo não informado",
      situacao: situacoes[item.status], data: item.criadoEm === null ? null : new Date(item.criadoEm).toLocaleString("pt-BR"),
      acaoDetalhe: <Link className="ciclo-check_item-link" to={`/do/ciclo/${idCiclo}/check/verificacoes/${item.id}`}>{item.resumo?.trim() || "Resumo não informado"}</Link>,
    })),
  };
  return <ConteudoCicloCheck resultado={{ estado: resultado.estado, dados }} acaoRegistrar={acaoRegistrar} />;
}

export function PaginaCicloCheck() {
  const { cicloId } = useParams();

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-check">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="check" exibirAvisoDemonstrativo={false}>
        <CheckDoCicloValidado key={cicloId} idCiclo={Number(cicloId)} />
      </PainelCicloPlanDo>
    </main>
  );
}

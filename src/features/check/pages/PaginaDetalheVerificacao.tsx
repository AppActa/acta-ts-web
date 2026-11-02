import { type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { useDadosCheckDoCiclo } from "../hooks/useDadosCheckDoCiclo";
import { DetalheVerificacao } from "../components/DetalheVerificacao";
import "../styles/pagina-detalhe-verificacao.css";

function VerificacaoDoCicloValidado({ cicloId, verificacaoId, acaoFechar }: { cicloId: number; verificacaoId: number; acaoFechar: ReactNode }) {
  const resultado = useDadosCheckDoCiclo(cicloId);
  if (resultado.estado !== "sucesso" && resultado.estado !== "vazio") return <DetalheVerificacao acaoFechar={acaoFechar} resultado={{ estado: resultado.estado }} />;
  const verificacao = resultado.dados.verificacoes.find((item) => item.id === verificacaoId && item.idCiclo === cicloId);
  if (!verificacao) return <DetalheVerificacao acaoFechar={acaoFechar} resultado={{ estado: "nao-encontrado" }} />;
  if (verificacao.efeitosSecundarios.some((efeito) => efeito.idVerificacaoResultado !== verificacao.id)) return <DetalheVerificacao acaoFechar={acaoFechar} resultado={{ estado: "indisponivel" }} />;

  return <DetalheVerificacao acaoFechar={acaoFechar} resultado={{ estado: "sucesso", dados: {
    resumo: verificacao.resumo, observacao: verificacao.observacao, status: verificacao.status, criadoEm: verificacao.criadoEm,
    efeitosSecundarios: verificacao.efeitosSecundarios.map((efeito) => ({ id: efeito.id, descricao: efeito.descricao, impactoEstimado: efeito.impactoEstimado, tipo: efeito.tipo })),
  } }} />;
}

export function PaginaDetalheVerificacao() {
  const { cicloId, verificacaoId } = useParams();
  const resultado = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const idVerificacao = verificacaoId && /^\d+$/.test(verificacaoId) ? Number(verificacaoId) : null;

  if (resultado.estado !== "sucesso") return <main className="check-detalhe-verificacao"><DetalheVerificacao acaoFechar={<Link to="/ciclos">Voltar para ciclos</Link>} resultado={{ estado: resultado.estado }} /></main>;
  const ciclo = resultado.ciclo;
  const acaoFechar = <Link to={`/do/ciclo/${ciclo.id}/check`} aria-label="Fechar detalhes da verificação">Fechar</Link>;
  if (idVerificacao === null || !Number.isSafeInteger(idVerificacao) || idVerificacao <= 0) return <main className="check-detalhe-verificacao"><DetalheVerificacao acaoFechar={acaoFechar} resultado={{ estado: "nao-encontrado" }} /></main>;
  if (!firebaseUser?.emailVerified || !firebaseUser.uid || !idEmpresa || ciclo.idEmpresa !== idEmpresa) return <main className="check-detalhe-verificacao"><DetalheVerificacao acaoFechar={<Link to="/ciclos">Voltar para ciclos</Link>} resultado={{ estado: "indisponivel" }} /></main>;
  const chave = JSON.stringify([firebaseUser.uid, idEmpresa, ciclo.id, idVerificacao]);

  return <main className="check-detalhe-verificacao">
    <VerificacaoDoCicloValidado key={chave} cicloId={ciclo.id} verificacaoId={idVerificacao} acaoFechar={acaoFechar} />
  </main>;
}

import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useState } from "react";
import type { ConteudoInvestigacaoPlanProps, PaginaPlanInvestigacaoProps } from "../../../types/plan";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import { listarIshikawasMongo, listarCincoPorquesMongo } from "../../../services/api/mongo/dashboard.read.api";
import type { IshikawaMongo, CincoPorquesMongo, CategoriaIshikawaMongo } from "../../../types/mongo";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import "../../../../features/plan/styles/pagina-plan-investigacao.css";
import { lerIdRotaPositivo } from "../../../utils/route-params";

const categorias: { id: CategoriaIshikawaMongo; nome: string }[] = [{ id: "METODO", nome: "Método" }, { id: "MAO_DE_OBRA", nome: "Mão de obra" }, { id: "MAQUINA", nome: "Máquina" }, { id: "MATERIAL", nome: "Material" }, { id: "MEDICAO", nome: "Medição" }, { id: "MEIO_AMBIENTE", nome: "Meio ambiente" }];
type Estado = { estado: "carregando" | "erro" } | { estado: "sucesso"; diagramas: IshikawaMongo[]; investigacoes: CincoPorquesMongo[] };

function Conteudo({ cicloId, tipo }: ConteudoInvestigacaoPlanProps) {
  const { actaUser } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const [dados, setDados] = useState<Estado>({ estado: "carregando" });
  useEffect(() => {
    const controller = new AbortController();
    setDados({ estado: "carregando" });
    if (!idEmpresa) { setDados({ estado: "erro" }); return () => controller.abort(); }
    void listarIshikawasMongo(cicloId, controller.signal).then(async (diagramas) => {
      if (diagramas.some((item) => item.idCiclo !== cicloId || item.idEmpresa !== idEmpresa) || new Set(diagramas.map((item) => item.id)).size !== diagramas.length) throw new Error("Associação inválida");
      const investigacoes = tipo === "porques" ? (await Promise.all(diagramas.map(async (diagrama) => {
        const itens = await listarCincoPorquesMongo(diagrama.id, controller.signal);
        if (itens.some((item) => item.idIshikawa !== diagrama.id)) throw new Error("Associação inválida");
        return itens;
      }))).flat() : [];
      if (!controller.signal.aborted) setDados({ estado: "sucesso", diagramas, investigacoes });
    }).catch(() => { if (!controller.signal.aborted) setDados({ estado: "erro" }); });
    return () => controller.abort();
  }, [cicloId, idEmpresa, tipo]);
  const base = `/do/ciclo/${cicloId}/plan`;
  return <section className="plan-investigacao" aria-labelledby="investigacao-titulo"><Link to={`${base}/causas`} className="plan-investigacao_voltar">← Voltar à análise de causas</Link>
    <h2 id="investigacao-titulo">{tipo === "ishikawa" ? "Diagrama de Ishikawa" : "5 Porquês"}</h2><p className="plan-investigacao_subtitulo">Análise de causas</p>
    {tipo === "porques" && <p><Link className="plan-investigacao_acao" to={`${base}/porques/criar`}>Criar investigação</Link></p>}
    {dados.estado !== "sucesso" ? <p role={dados.estado === "erro" ? "alert" : "status"}>{dados.estado === "erro" ? "Não foi possível carregar os dados." : <CarregandoConteudo compacto mensagem="Carregando dados..." />}</p> : tipo === "ishikawa" ? dados.diagramas.length ? dados.diagramas.map((diagrama) => <article className="plan-investigacao_cartao" key={diagrama.id}>
      <h3>Possíveis causas: {diagrama.problema}</h3>
      <div className="plan-investigacao_diagrama">
        <div className="plan-investigacao_categorias">{categorias.map((categoria) => <section key={categoria.id}>
          <h4>{categoria.nome}</h4><ul>{diagrama.causas.filter((causa) => causa.categoria === categoria.id).map((causa) => <li key={causa.id}>{causa.descricao}</li>)}</ul>
        </section>)}</div>
        <div className="plan-investigacao_problema"><span>Problema</span><p>{diagrama.problema}</p></div>
      </div>
      <p>{diagrama.causas.length} causas registradas</p>
    </article>) : <p role="status">Nenhum diagrama registrado neste ciclo.</p> : dados.investigacoes.length ? dados.investigacoes.map((item) => <article className="plan-investigacao_cartao" key={item.id}><h3>{item.hipotese}</h3><ol className="plan-investigacao_porques">{item.porques.map((porque) => <li key={porque.ordem}><strong>{String(porque.ordem).padStart(2, "0")}</strong><div><span>{porque.pergunta}</span><p>{porque.resposta}</p></div></li>)}</ol><Link className="plan-investigacao_acao" to={`${base}/porques/${item.id}/editar`}>Editar investigação</Link></article>) : <p role="status">Nenhuma investigação registrada neste ciclo.</p>}
  </section>;
}

export function PaginaPlanInvestigacao({ tipo }: PaginaPlanInvestigacaoProps) {
  const { cicloId } = useParams(); const id = lerIdRotaPositivo(cicloId);
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan"><PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>{id !== null ? <Conteudo key={`${id}:${tipo}`} cicloId={id} tipo={tipo} /> : <p role="alert">Ciclo inválido.</p>}</PainelCicloPlanDo></main>;
}

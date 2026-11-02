import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarLicoesAprendidasMongo, type LicaoAprendidaMongo } from "../../../services/api/mongo/dashboard.read.api";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import "../styles/pagina-aprendizados-act.css";

type Resultado = { chave: string; estado: "sucesso"; dados: LicaoAprendidaMongo[] } | { chave: string; estado: "erro" };

export function PaginaAprendizadosAct() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const id = ciclo.estado === "sucesso" ? ciclo.ciclo.id : null;
  const empresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const chave = firebaseUser?.uid && id && empresa ? `${firebaseUser.uid}:${empresa}:${id}` : null;
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [busca, setBusca] = useState("");
  useEffect(() => {
    if (!id || !empresa || !chave) return;
    const controller = new AbortController();
    void listarLicoesAprendidasMongo(id, controller.signal).then((dados) => {
      if (controller.signal.aborted) return;
      if (dados.some((item) => item.idCiclo !== id || item.idEmpresa !== empresa) || new Set(dados.map((item) => item.id)).size !== dados.length) throw new Error("Associação inválida.");
      setResultado({ chave, estado: "sucesso", dados });
    }).catch(() => { if (!controller.signal.aborted) setResultado({ chave, estado: "erro" }); });
    return () => controller.abort();
  }, [id, empresa, chave]);
  const atual = resultado?.chave === chave ? resultado : null;
  const dados = atual?.estado === "sucesso" ? atual.dados : [];
  const filtrados = dados.filter((item) => `${item.titulo} ${item.licao} ${item.tags?.join(" ") ?? ""}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR")));
  return <main className="pagina-ciclo-plan-do pagina-ciclo-act">
    <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="act" exibirAvisoDemonstrativo={false}>
      <section className="act-aprendizados" aria-labelledby="aprendizados-titulo">
        <header><Link to={`/do/ciclo/${cicloId}/act`} aria-label="Voltar ao Act">‹</Link><h2 id="aprendizados-titulo">Todos os aprendizados</h2></header>
        <label><span className="sr-only">Buscar aprendizado</span><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aprendizado" /></label>
        {!atual && <p role="status">Carregando aprendizados...</p>}
        {atual?.estado === "erro" && <p role="alert">Não foi possível carregar os aprendizados deste ciclo.</p>}
        {atual?.estado === "sucesso" && !filtrados.length && <p role="status">{dados.length ? "Nenhum aprendizado corresponde à busca." : "Nenhum aprendizado registrado neste ciclo."}</p>}
        {filtrados.map((item) => <article key={item.id}><h3>{item.titulo}</h3><p>O que aprendemos: {item.licao}</p>{item.resultado && <p>Resultado: {item.resultado}</p>}{(item.area || item.tags?.length) ? <p className="act-aprendizados_tags">{item.area ? `Área: ${item.area}` : ""}{item.area && item.tags?.length ? " · " : ""}{item.tags?.length ? `Tags: ${item.tags.join(" · ")}` : ""}</p> : null}</article>)}
      </section>
    </PainelCicloPlanDo>
  </main>;
}

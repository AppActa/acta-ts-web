import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import { lerIdRotaPositivo } from "../../../utils/route-params";
import { listarFormulariosMongo, type FormularioMongo } from "../../../services/api/mongo/dashboard.read.api";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useAuth } from "../../../components/auth/AuthProvider";
import "../../../../features/plan/styles/pagina-plan-coleta.css";

export function PaginaPlanColeta() {
  const { cicloId } = useParams();
  const idCiclo = lerIdRotaPositivo(cicloId);
  const ciclo = useCicloDaConta(cicloId);
  const { actaUser } = useAuth();
  const usuarioId = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idUsuario : null;
  const [formularios, setFormularios] = useState<FormularioMongo[] | null>(null);
  const [erroFormularios, setErroFormularios] = useState(false);
  useEffect(() => {
    if (idCiclo === null) return;
    const controller = new AbortController();
    void listarFormulariosMongo(idCiclo, controller.signal).then((items) => {
      if (items.some((item) => item.idCiclo !== idCiclo || (ciclo.estado === "sucesso" && item.idEmpresa !== ciclo.ciclo.idEmpresa))) throw new Error("Associação inválida");
      setFormularios(items);
    }).catch(() => { if (!controller.signal.aborted) setErroFormularios(true); });
    return () => controller.abort();
  }, [idCiclo, ciclo.estado === "sucesso" ? ciclo.ciclo.idEmpresa : null]);
  if (idCiclo === null) return <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-coleta"><p role="alert">Ciclo inválido.</p></main>;
  const cicloIdValidado = String(idCiclo);
  const base = `/do/ciclo/${idCiclo}/plan`;
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-coleta">
    <PainelCicloPlanDo cicloId={cicloIdValidado} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>
      <section className="plan-coleta-conteudo" aria-labelledby="plan-coleta-titulo">
        <Link className="plan-coleta_link-voltar" to={base}>← Voltar ao Plan</Link>
        <h2 id="plan-coleta-titulo">Coleta de dados</h2>
        <p className="plan-coleta_subtitulo">Plan</p>
        <div className="plan-coleta_colunas">
          <section className="plan-coleta_painel" aria-labelledby="plan-coleta-serie">
            <h3 id="plan-coleta-serie">Série de acompanhamento</h3>
            <p role="status">Leituras de acompanhamento indisponíveis.</p>
            <button className="plan-coleta_acao" type="button" disabled>Adicionar leitura</button>
            <h3>Formulários</h3>
            {erroFormularios ? <p role="alert">Não foi possível carregar os formulários deste ciclo.</p> : formularios === null ? <p role="status">Carregando formulários…</p> : formularios.length === 0 ? <p role="status">Nenhum formulário cadastrado.</p> : <ul>{formularios.map((f) => <li key={f.id}>
              <strong>{f.titulo}</strong> · {f.status === "ATIVO" ? "Ativo" : f.status === "RASCUNHO" ? "Rascunho" : "Inativo"}
              <Link to={`${base}/coleta/formularios/${f.id}/editar`}>Editar</Link>
              {f.status === "ATIVO" && (f.idsUsuariosDestinatarios.length === 0 || (usuarioId !== null && f.idsUsuariosDestinatarios.includes(usuarioId)) ? <Link to={`${base}/coleta/formularios/${f.id}/responder`}>Responder</Link> : <span>Restrito aos destinatários selecionados.</span>)}
            </li>)}</ul>}
            <Link className="plan-coleta_acao plan-coleta_acao-secundaria" to={`${base}/coleta/criar`}>Criar formulário</Link>
          </section>
          <aside className="plan-coleta_painel plan-coleta_acompanhamento" aria-labelledby="plan-coleta-acompanhamento">
            <h3 id="plan-coleta-acompanhamento">Acompanhamento</h3>
            <p className="plan-coleta_total">Registros indisponíveis</p>
            <p>Consulte os dados do ciclo e mantenha as informações atualizadas.</p>
            <button className="plan-coleta_acao" type="button" disabled>Editar coleta de dados</button>
            <Link className="plan-coleta_acao plan-coleta_acao-secundaria" to={`${base}/coleta/nova`}>Criar coleta de dados</Link>
          </aside>
        </div>
      </section>
    </PainelCicloPlanDo>
  </main>;
}

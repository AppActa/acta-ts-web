import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CabecalhoNavegacaoCiclo } from "../../../components/ciclo/CabecalhoNavegacaoCiclo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useTreinamentosDoCiclo } from "../../../features/do/hooks/useTreinamentosDoCiclo";
import { lerIdRotaPositivo } from "../../../utils/route-params";
import "../../../../features/do/styles/pagina-ciclo-do-treinamento-especifico.css";

export function PaginaCicloDoTreinamentoEspecifico() {
  const { cicloId, treinamentoId } = useParams();
  const idTreinamento = lerIdRotaPositivo(treinamentoId);
  const resultadoCiclo = useCicloDaConta(cicloId);
  const resultado = useTreinamentosDoCiclo(resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo.id : null);
  const ciclo = resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo : null;
  const treinamento = resultado.estado === "sucesso" && idTreinamento !== null ? resultado.dados.find(item => item.id === idTreinamento) : undefined;
  return <main className="pagina-treinamento-especifico">
    <Sidebar />
    <div className="treinamento-especifico_painel">
      {ciclo && <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva="do" />}
      <div className="treinamento-especifico_conteudo">
        <Link to={ciclo ? `/do/ciclo/${ciclo.id}/treinamentos` : "/ciclos"}>Voltar aos treinamentos</Link>
        {!ciclo ? <p role="status">{resultadoCiclo.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando ciclo..." /> : "Ciclo indisponível."}</p>
          : resultado.estado === "carregando" ? <p role="status">{<CarregandoConteudo compacto mensagem="Carregando treinamento..." />}</p>
          : resultado.estado !== "sucesso" ? <p role="alert">Não foi possível consultar os treinamentos deste ciclo.</p>
          : !treinamento ? <p role="status">Treinamento não encontrado neste ciclo.</p>
          : <>
            <div className="treinamento-especifico_titulo_linha"><h2>Treinamentos / {treinamento.titulo}</h2></div>
            <section className="treinamento-selecionado">
              <h3>Treinamento selecionado</h3><p>{treinamento.descricao}</p>
              <p><strong>Responsável:</strong> {treinamento.nomeResponsavel}</p>
              <p><strong>Data:</strong> {treinamento.dataTreinamento}</p>
              <p><strong>Ciclo:</strong> {ciclo.titulo}</p>
              <p>{treinamento.obrigatorio ? "Obrigatório" : "Opcional"}</p>
            </section>
            <section className="treinamento-equipe">
              <h3>Participantes</h3>
              {treinamento.participantes.length ? <ul>{treinamento.participantes.map(p => <li key={p.idUsuario}>{p.nomeUsuario} · {p.status.toLocaleLowerCase("pt-BR")}</li>)}</ul> : <p>Nenhum participante cadastrado.</p>}
            </section>
          </>}
      </div>
    </div>
  </main>;
}

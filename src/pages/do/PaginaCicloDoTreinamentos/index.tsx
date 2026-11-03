import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CabecalhoNavegacaoCiclo } from "../../../components/ciclo/CabecalhoNavegacaoCiclo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useTreinamentosDoCiclo } from "../../../features/do/hooks/useTreinamentosDoCiclo";
import "../../../../features/do/styles/pagina-ciclo-do-treinamentos.css";

export function PaginaCicloDoTreinamentos() {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const resultadoTreinamentos = useTreinamentosDoCiclo(resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo.id : null);
  const [busca, setBusca] = useState("");
  const [statusParticipante, setStatusParticipante] = useState("");
  const listaVisivel = useMemo(() => (resultadoTreinamentos.dados ?? []).filter((item) =>
    `${item.titulo} ${item.nomeResponsavel} ${item.descricao}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))
    && (!statusParticipante || item.participantes.some((participante) => participante.status === statusParticipante))), [busca, statusParticipante, resultadoTreinamentos.dados]);

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-treinamentos">
        <Sidebar />
        <div className="treinamentos_painel">
          <section className="treinamentos_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </main>
    );
  }
  const ciclo = resultadoCiclo.ciclo;

  return (
    <main className="pagina-treinamentos">
      <Sidebar />
      <div className="treinamentos_painel">
        <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva="do" />
        <div className="treinamentos_conteudo">
          <div className="treinamentos_titulo_linha">
            <Link to={`/do/ciclo/${cicloId}/tarefas`} className="treinamentos_voltar" aria-label="Voltar às tarefas">‹</Link>
            <h2>Treinamentos</h2>
            <Link to={`/do/ciclo/${cicloId}/treinamentos/criar`} className="treinamentos_criar"><span aria-hidden="true">+</span>Criar novo</Link>
          </div>
          <div className="treinamentos_filtros">
            <label className="treinamentos_busca"><span className="visually-hidden">Buscar treinamento</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar treinamento" /></label>
            <label>Filtrar por status de participante <select value={statusParticipante} onChange={(event) => setStatusParticipante(event.target.value)}>
              <option value="">Todos os treinamentos</option><option value="PENDENTE">Com participante pendente</option><option value="CONFIRMADO">Com participante confirmado</option><option value="CONCLUIDO">Com participante concluído</option><option value="DISPENSADO">Com participante dispensado</option><option value="CANCELADO">Com participante cancelado</option>
            </select></label>
          </div>
          {listaVisivel.length > 0 ? (
            <div className="treinamentos_lista">
              {listaVisivel.map((treinamento) => (
                <Link className="treinamento_card" key={treinamento.id} to={`/do/ciclo/${cicloId}/treinamentos/${treinamento.id}`} aria-label={`Ver treinamento ${treinamento.titulo}`}>
                  <div className="treinamento_cartao_topo"><span className="treinamento_cartao_icone" aria-hidden="true" /></div>
                  <div className="treinamento_detalhes"><h3>{treinamento.titulo}</h3><p><strong>Responsável:</strong> {treinamento.nomeResponsavel} · {treinamento.dataTreinamento}</p><p><strong>Participantes:</strong> {treinamento.participantes.length}</p><p><strong>Ciclo:</strong> {ciclo.titulo}</p></div>
                </Link>
              ))}
            </div>
          ) : <p className="treinamentos_vazio" role={resultadoTreinamentos.estado === "erro" || resultadoTreinamentos.estado === "indisponivel" ? "alert" : "status"}>
            {resultadoTreinamentos.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando treinamentos..." /> : resultadoTreinamentos.estado !== "sucesso" ? "Não foi possível consultar os treinamentos deste ciclo." : busca || statusParticipante ? "Nenhum treinamento encontrado para estes filtros." : "Nenhum treinamento cadastrado neste ciclo."}
          </p>}
        </div>
      </div>
    </main>
  );
}

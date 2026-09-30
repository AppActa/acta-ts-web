import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BarraLateral } from "../features/perfil/components/BarraLateral";
import "../features/perfil/styles/pagina-perfil.css";
import "./pagina-ciclo-do-treinamentos.css";

type StatusFiltro = "todos" | "andamento" | "concluidos";
type Treinamento = { titulo: string; responsavel: string; data: string; material: string; status: Exclude<StatusFiltro, "todos"> };

const treinamentos: Treinamento[] = [
  { titulo: "Conferência dupla de pedidos", responsavel: "Camila Souza", data: "15 out", material: "procedimento.pdf", status: "andamento" },
  { titulo: "Separação por código e SKU", responsavel: "Diego Martins", data: "18 out", material: "guia-codigos-sku.pdf", status: "andamento" },
  { titulo: "Identificação de pedidos frágeis", responsavel: "Camila Souza", data: "20 out", material: "embalagem-segura.pdf", status: "andamento" },
  { titulo: "Registro imediato de divergências", responsavel: "Rafael Costa", data: "22 out", material: "registro-divergencias.pdf", status: "andamento" },
  { titulo: "Conferência final por pedido", responsavel: "Ana Martins", data: "24 out", material: "procedimento-conferencia-final.pdf", status: "concluidos" },
];

function AbasTreinamentos({ cicloId }: { cicloId: string | undefined }) {
  return (
    <nav className="treinamentos_abas" aria-label="Etapas do ciclo">
      <Link to={`/do/ciclo/${cicloId}/visao-geral`} className="treinamentos_aba treinamentos_aba-visao"><span>⟳</span>Visão geral</Link>
      <button type="button" className="treinamentos_aba treinamentos_aba-plan" disabled><span>▣</span>Plan</button>
      <Link to={`/do/ciclo/${cicloId}/tarefas`} aria-current="page" className="treinamentos_aba treinamentos_aba-do"><span>▷</span>Do</Link>
      <button type="button" className="treinamentos_aba treinamentos_aba-check" disabled><span>✓</span>Checar</button>
      <button type="button" className="treinamentos_aba treinamentos_aba-act" disabled><span>✧</span>Agir</button>
    </nav>
  );
}

export function PaginaCicloDoTreinamentos() {
  const { cicloId } = useParams();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<StatusFiltro>("todos");
  const listaVisivel = useMemo(() => treinamentos.filter((item) => {
    const correspondeTexto = `${item.titulo} ${item.responsavel} ${item.material}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"));
    return correspondeTexto && (filtro === "todos" || item.status === filtro);
  }), [busca, filtro]);

  return (
    <main className="pagina-treinamentos">
      <BarraLateral />
      <div className="treinamentos_painel">
        <header className="treinamentos_cabecalho">
          <div className="treinamentos_icone" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="31" stroke="white" strokeWidth="5"/><path d="M40 22v20L28 52" stroke="white" strokeWidth="5" strokeLinecap="round"/></svg></div>
          <div><h1>Redução do tempo de atendimento</h1><span className="treinamentos_status">Status: Do</span><p><span>Responsável pelo ciclo:</span> Catarina Cândido</p><p><span>Iniciado em:</span> 26/05/2026</p><p><span>Prazo final:</span> 30/10/2026</p></div>
        </header>
        <AbasTreinamentos cicloId={cicloId} />
        <div className="treinamentos_conteudo">
          <div className="treinamentos_titulo_linha">
            <Link to={`/do/ciclo/${cicloId}/tarefas`} className="treinamentos_voltar" aria-label="Voltar às tarefas">‹</Link>
            <h2>Treinamentos</h2>
            <button type="button" className="treinamentos_criar" disabled><span>＋</span>Criar novo</button>
          </div>
          <div className="treinamentos_filtros">
            <label className="treinamentos_busca"><span className="visually-hidden">Buscar treinamento</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar treinamento" /></label>
            <div className="treinamentos_tabs" aria-label="Filtrar treinamentos">
              <button type="button" aria-pressed={filtro === "todos"} onClick={() => setFiltro("todos")}>Todos (5)</button>
              <button type="button" aria-pressed={filtro === "andamento"} onClick={() => setFiltro("andamento")}>Em andamento (4)</button>
              <button type="button" aria-pressed={filtro === "concluidos"} onClick={() => setFiltro("concluidos")}>Concluídos (1)</button>
            </div>
          </div>
          {listaVisivel.length > 0 ? (
            <div className="treinamentos_lista">
              {listaVisivel.map((treinamento) => (
                <article className="treinamento_card" key={treinamento.titulo}>
                  <div className="treinamento_cartao_topo"><span className="treinamento_cartao_icone" aria-hidden="true" /><button type="button" disabled aria-label={`Baixar material ${treinamento.material}`}>↓&nbsp; Baixar material</button></div>
                  <div className="treinamento_detalhes"><h3>{treinamento.titulo}</h3><p><strong>Responsável:</strong> {treinamento.responsavel} · {treinamento.data}</p><p><strong>Material:</strong> {treinamento.material}</p><p><strong>Ciclo:</strong> Reduzir retrabalho na separação</p></div>
                </article>
              ))}
            </div>
          ) : <p className="treinamentos_vazio">Nenhum treinamento encontrado.</p>}
        </div>
      </div>
    </main>
  );
}

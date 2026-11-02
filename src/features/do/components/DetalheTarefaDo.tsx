import { useId, type ReactNode } from "react";
import type { TarefaDoPlanoPg } from "../../../services/api/pg/dashboard.read.api";

export type DetalheTarefaDoProps = {
  tarefa: TarefaDoPlanoPg;
  nomePlano: string;
  tituloCiclo: string;
  acaoFechar: ReactNode;
};

function rotuloStatus(status: TarefaDoPlanoPg["status"]): string {
  switch (status) {
    case "PENDENTE": return "Pendente";
    case "EM_ANDAMENTO": return "Em andamento";
    case "CONCLUIDA": return "Concluída";
    case "BLOQUEADA": return "Bloqueada";
    case "ATRASADA": return "Atrasada";
    case "CANCELADA": return "Cancelada";
  }
}

export function DetalheTarefaDo({ tarefa, nomePlano, tituloCiclo, acaoFechar }: DetalheTarefaDoProps) {
  const id = useId();
  return (
    <section className="detalhe-tarefa-do_modal" aria-labelledby={`${id}-titulo`}>
      <div className="detalhe-tarefa-do_fechar">{acaoFechar}</div>
      <h1 className="detalhe-tarefa-do_titulo" id={`${id}-titulo`}>Detalhes da tarefa</h1>
      <h2 className="detalhe-tarefa-do_nome">{tarefa.titulo}</h2>
      <p className="detalhe-tarefa-do_vinculo">Ação vinculada ao plano de ação do ciclo.</p>
      <dl className="detalhe-tarefa-do_campos">
        <div className="detalhe-tarefa-do_campo"><dt>Status</dt><dd data-estado={tarefa.status}>{rotuloStatus(tarefa.status)}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Responsável</dt><dd>{tarefa.nomeResponsavel?.trim() || "Não informado"}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Prazo</dt><dd>{tarefa.dataFimPrevista ?? "Não informado"}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Plano de ação</dt><dd>{nomePlano || "Indisponível"}</dd></div>
        <div className="detalhe-tarefa-do_campo"><dt>Ciclo</dt><dd>{tituloCiclo}</dd></div>
        <div className="detalhe-tarefa-do_campo detalhe-tarefa-do_descricao"><dt>Descrição</dt><dd>{tarefa.descricao?.trim() || "Não informado"}</dd></div>
      </dl>
      <aside className="detalhe-tarefa-do_vinculos" aria-label="Vínculos da tarefa">
        <h2>Vínculos da tarefa</h2>
        <p>Plano de ação: {nomePlano || "Indisponível"}</p>
        <p>Ciclo: {tituloCiclo}</p>
      </aside>
    </section>
  );
}

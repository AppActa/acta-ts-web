import { useId, useState, type FormEvent, type ReactNode } from "react";
import type { PrioridadeTarefaPg, StatusPlanoAcaoPg } from "../../../services/api/pg/dashboard.read.api";

export type PlanoOpcaoCriarTarefaDo = { id: number; nome: string; idCiclo: number; status: StatusPlanoAcaoPg };
export type ResponsavelOpcaoCriarTarefaDo = { id: number; nome: string };
export type DadosEnvioCriarTarefaDo = {
  idPlanoAcao: number;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeTarefaPg;
  dataFimPrevista: string;
  idResponsavel: number;
};
export type FeedbackCriarTarefaDo = { tipo: "erro" | "aviso"; mensagem: string } | null;
export type FormularioCriarTarefaDoProps = {
  planos: readonly PlanoOpcaoCriarTarefaDo[];
  responsaveis: readonly ResponsavelOpcaoCriarTarefaDo[];
  estadoOpcoes: "carregando" | "erro" | "indisponivel" | "sucesso";
  podeEnviar: boolean;
  enviando: boolean;
  feedback: FeedbackCriarTarefaDo;
  mensagemElegibilidade?: string;
  acaoFechar: ReactNode;
  onSubmit: (dados: DadosEnvioCriarTarefaDo) => void;
};

type Campos = { titulo: string; descricao: string; idPlano: string; prioridade: string; prazo: string; idResponsavel: string };
type Campo = keyof Campos;
const PRIORIDADES: { valor: PrioridadeTarefaPg; rotulo: string }[] = [
  { valor: "BAIXA", rotulo: "Baixa" }, { valor: "MEDIA", rotulo: "Média" },
  { valor: "ALTA", rotulo: "Alta" }, { valor: "CRITICA", rotulo: "Crítica" },
];

function dataIsoFuturaValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [ano, mes, dia] = valor.split("-").map(Number);
  const data = new Date(0);
  data.setUTCFullYear(ano, mes - 1, dia);
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return false;
  const hoje = new Date();
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  return valor > hojeIso;
}

export function FormularioCriarTarefaDo({ planos, responsaveis, estadoOpcoes, podeEnviar, enviando, feedback, mensagemElegibilidade, acaoFechar, onSubmit }: FormularioCriarTarefaDoProps) {
  const id = useId();
  const [campos, setCampos] = useState<Campos>({ titulo: "", descricao: "", idPlano: "", prioridade: "", prazo: "", idResponsavel: "" });
  const [visitados, setVisitados] = useState<Partial<Record<Campo, boolean>>>({});
  const erro = (campo: Campo): string => {
    if (campo === "titulo" || campo === "descricao") {
      const texto = campos[campo].trim();
      const limite = campo === "titulo" ? 160 : 1000;
      if (!texto) return campo === "titulo" ? "Informe o título." : "Informe a descrição.";
      return texto.length > limite ? `Use no máximo ${limite} caracteres.` : "";
    }
    if (campo === "idPlano") return planos.some((plano) => String(plano.id) === campos.idPlano) ? "" : "Selecione um plano disponível deste ciclo.";
    if (campo === "prioridade") return PRIORIDADES.some((item) => item.valor === campos.prioridade) ? "" : "Selecione a prioridade.";
    if (campo === "idResponsavel") return responsaveis.some((pessoa) => String(pessoa.id) === campos.idResponsavel) ? "" : "Selecione um responsável ativo deste ciclo.";
    if (!campos.prazo) return "Informe o prazo.";
    return dataIsoFuturaValida(campos.prazo) ? "" : "Informe uma data válida futura.";
  };
  const atualizar = (campo: Campo, valor: string) => setCampos((atual) => ({ ...atual, [campo]: valor }));
  const propsCampo = (campo: Campo, ajudaId: string) => {
    const erroCampo = visitados[campo] ? erro(campo) : "";
    return {
      "aria-invalid": Boolean(erroCampo),
      "aria-describedby": `${ajudaId}${erroCampo ? ` ${id}-${campo}-erro` : ""}`,
      onBlur: () => setVisitados((atual) => ({ ...atual, [campo]: true })),
    };
  };
  const erroVisivel = (campo: Campo) => visitados[campo] && erro(campo)
    ? <span className="criar-tarefa-do_erro" id={`${id}-${campo}-erro`} role="alert">{erro(campo)}</span>
    : null;
  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const todos: Record<Campo, boolean> = { titulo: true, descricao: true, idPlano: true, prioridade: true, prazo: true, idResponsavel: true };
    setVisitados(todos);
    if ((Object.keys(todos) as Campo[]).some((campo) => erro(campo))) return;
    if (!podeEnviar || enviando) return;
    const plano = planos.find((item) => String(item.id) === campos.idPlano);
    const pessoa = responsaveis.find((item) => String(item.id) === campos.idResponsavel);
    const prioridade = PRIORIDADES.find((item) => item.valor === campos.prioridade)?.valor;
    if (!plano || !pessoa || !prioridade || !dataIsoFuturaValida(campos.prazo)) return;
    onSubmit({ idPlanoAcao: plano.id, titulo: campos.titulo.trim(), descricao: campos.descricao.trim(), prioridade, dataFimPrevista: campos.prazo, idResponsavel: pessoa.id });
  };
  const mensagemOpcoes = estadoOpcoes === "carregando" ? "Carregando planos e responsáveis do ciclo."
    : estadoOpcoes === "erro" ? "Não foi possível validar planos e responsáveis. A criação está indisponível."
      : estadoOpcoes === "indisponivel" ? "Planos e responsáveis indisponíveis para esta conta."
        : planos.length === 0 ? "Nenhum plano elegível disponível neste ciclo."
          : responsaveis.length === 0 ? "Nenhum responsável ativo do ciclo está disponível." : "";

  return (
    <section className="criar-tarefa-do_modal" aria-labelledby={`${id}-titulo`}>
      <div className="criar-tarefa-do_banner"><span>Acta, seu app de PDCA</span><strong>O ciclo da melhoria começa aqui!</strong></div>
      <div className="criar-tarefa-do_conteudo">
        <div className="criar-tarefa-do_fechar">{acaoFechar}</div>
        <h1 className="criar-tarefa-do_titulo" id={`${id}-titulo`}>Criar tarefa</h1>
        <p className="criar-tarefa-do_aviso" id={`${id}-aviso`}>A pessoa atribuída pode receber uma notificação sobre esta tarefa.</p>
        {mensagemElegibilidade && <p className="criar-tarefa-do_ajuda" role="status">{mensagemElegibilidade}</p>}
        {mensagemOpcoes && <p className="criar-tarefa-do_estado" role={estadoOpcoes === "erro" ? "alert" : "status"} aria-live="polite">{mensagemOpcoes}</p>}
        {feedback && <p className={feedback.tipo === "erro" ? "criar-tarefa-do_erro" : "criar-tarefa-do_ajuda"} role={feedback.tipo === "erro" ? "alert" : "status"} aria-live="polite">{feedback.mensagem}</p>}
        <form className="criar-tarefa-do_campos" noValidate aria-label="Dados da tarefa" aria-describedby={`${id}-aviso`} onSubmit={enviar}>
          <label className="criar-tarefa-do_campo" htmlFor={`${id}-titulo-input`}>Título
            <input id={`${id}-titulo-input`} name="titulo" type="text" required value={campos.titulo} {...propsCampo("titulo", `${id}-titulo-ajuda`)} onChange={(event) => atualizar("titulo", event.target.value)} />
            <span className="criar-tarefa-do_ajuda" id={`${id}-titulo-ajuda`}>Obrigatório. Até 160 caracteres.</span>{erroVisivel("titulo")}
          </label>
          <label className="criar-tarefa-do_campo" htmlFor={`${id}-descricao`}>Descrição
            <textarea id={`${id}-descricao`} name="descricao" required value={campos.descricao} {...propsCampo("descricao", `${id}-descricao-ajuda`)} onChange={(event) => atualizar("descricao", event.target.value)} />
            <span className="criar-tarefa-do_ajuda" id={`${id}-descricao-ajuda`}>Obrigatória. Até 1.000 caracteres.</span>{erroVisivel("descricao")}
          </label>
          <label className="criar-tarefa-do_campo" htmlFor={`${id}-plano`}>Plano de ação
            <select id={`${id}-plano`} name="plano" required disabled={estadoOpcoes !== "sucesso" || planos.length === 0} value={campos.idPlano} {...propsCampo("idPlano", `${id}-plano-ajuda`)} onChange={(event) => atualizar("idPlano", event.target.value)}>
              <option value="">Selecione um plano elegível</option>
              {planos.map((plano) => <option key={plano.id} value={plano.id}>{plano.nome}</option>)}
            </select>
            <span className="criar-tarefa-do_ajuda" id={`${id}-plano-ajuda`}>Plano aprovado ou em execução neste ciclo.</span>{erroVisivel("idPlano")}
          </label>
          <label className="criar-tarefa-do_campo" htmlFor={`${id}-prioridade`}>Prioridade
            <select id={`${id}-prioridade`} name="prioridade" required value={campos.prioridade} {...propsCampo("prioridade", `${id}-prioridade-ajuda`)} onChange={(event) => atualizar("prioridade", event.target.value)}>
              <option value="">Selecione a prioridade</option>{PRIORIDADES.map((item) => <option key={item.valor} value={item.valor}>{item.rotulo}</option>)}
            </select>
            <span className="criar-tarefa-do_ajuda" id={`${id}-prioridade-ajuda`}>Baixa, média, alta ou crítica.</span>{erroVisivel("prioridade")}
          </label>
          <label className="criar-tarefa-do_campo" htmlFor={`${id}-responsavel`}>Responsável
            <select id={`${id}-responsavel`} name="responsavel" required disabled={estadoOpcoes !== "sucesso" || responsaveis.length === 0} value={campos.idResponsavel} {...propsCampo("idResponsavel", `${id}-responsavel-ajuda`)} onChange={(event) => atualizar("idResponsavel", event.target.value)}>
              <option value="">Selecione um responsável ativo</option>{responsaveis.map((pessoa) => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
            </select>
            <span className="criar-tarefa-do_ajuda" id={`${id}-responsavel-ajuda`}>Somente pessoas ativas vinculadas a este ciclo.</span>{erroVisivel("idResponsavel")}
          </label>
          <label className="criar-tarefa-do_campo" htmlFor={`${id}-prazo`}>Prazo
            <input id={`${id}-prazo`} name="prazo" type="date" required value={campos.prazo} {...propsCampo("prazo", `${id}-prazo-ajuda`)} onChange={(event) => atualizar("prazo", event.target.value)} />
            <span className="criar-tarefa-do_ajuda" id={`${id}-prazo-ajuda`}>Informe uma data futura.</span>{erroVisivel("prazo")}
          </label>
          <button className="criar-tarefa-do_concluido" type="submit" disabled={!podeEnviar || enviando}>{enviando ? "Enviando…" : "Concluído"}</button>
        </form>
      </div>
    </section>
  );
}

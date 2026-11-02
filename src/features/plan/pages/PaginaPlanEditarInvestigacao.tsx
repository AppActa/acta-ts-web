import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { listarIshikawasMongo, listarCincoPorquesMongo, salvarCincoPorquesMongo, MongoReadError, type IshikawaMongo, type PorqueMongo } from "../../../services/api/mongo/dashboard.read.api";
import { ApiError } from "../../../services/http/client";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import { ModalErroPlan } from "../components/ModalErroPlan";
import "../styles/pagina-plan-investigacao.css";

function Formulario({ cicloId, investigacaoId, cicloAberto }: { cicloId: number; investigacaoId?: string; cicloAberto: boolean }) {
  const { actaUser } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const autorizado = Boolean(idEmpresa && cicloAberto && (actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR"));
  const navegar = useNavigate();
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");
  const [diagramas, setDiagramas] = useState<IshikawaMongo[]>([]);
  const [selecao, setSelecao] = useState("");
  const [hipotese, setHipotese] = useState("");
  const [porques, setPorques] = useState<PorqueMongo[]>([{ ordem: 1, pergunta: "Por quê?", resposta: "" }, { ordem: 2, pergunta: "Por quê?", resposta: "" }, { ordem: 3, pergunta: "Por quê?", resposta: "" }]);
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const enviandoRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController(); controllerRef.current = controller; setEstado("carregando");
    if (!idEmpresa) { setEstado("erro"); return () => { controller.abort(); controllerRef.current = null; }; }
    void listarIshikawasMongo(cicloId, controller.signal).then(async (itens) => {
      if (itens.some((item) => item.idCiclo !== cicloId || item.idEmpresa !== idEmpresa) || new Set(itens.map((item) => item.id)).size !== itens.length) throw new Error("Associação inválida");
      if (investigacaoId) {
        const listas = await Promise.all(itens.map(async (diagrama) => {
          const valores = await listarCincoPorquesMongo(diagrama.id, controller.signal);
          if (valores.some((valor) => valor.idIshikawa !== diagrama.id)) throw new Error("Associação inválida");
          return valores;
        }));
        const encontrados = listas.flat().filter((item) => item.id === investigacaoId);
        const item = encontrados[0];
        const diagrama = itens.find((valor) => valor.id === item?.idIshikawa);
        if (encontrados.length !== 1 || !item?.idCausaIshikawa || !diagrama?.causas.some((causa) => causa.id === item.idCausaIshikawa)) throw new Error("Investigação não encontrada");
        const ordenados = [...item.porques].sort((a, b) => a.ordem - b.ordem);
        if (!ordenados.length || ordenados.some((porque, indice) => porque.ordem !== indice + 1)) throw new Error("Sequência inválida");
        if (!controller.signal.aborted) { setSelecao(`${item.idIshikawa}:${item.idCausaIshikawa}`); setHipotese(item.hipotese); setPorques(ordenados); }
      }
      if (!controller.signal.aborted) { setDiagramas(itens); setEstado("pronto"); }
    }).catch(() => { if (!controller.signal.aborted) setEstado("erro"); });
    return () => { controller.abort(); controllerRef.current = null; };
  }, [cicloId, idEmpresa, investigacaoId]);
  const voltar = `/do/ciclo/${cicloId}/plan/porques`;
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!autorizado || enviandoRef.current || incerto || !controllerRef.current) return;
    const [idIshikawa, idCausaIshikawa] = selecao.split(":");
    const diagrama = diagramas.find((item) => item.id === idIshikawa);
    const dados = { idIshikawa, idCausaIshikawa, idInvestigacao: investigacaoId, hipotese: hipotese.trim(), porques: porques.map((item, indice) => ({ ordem: indice + 1, pergunta: item.pergunta.trim(), resposta: item.resposta.trim() })) };
    if (!diagrama?.causas.some((item) => item.id === idCausaIshikawa) || !dados.hipotese || dados.porques.some((item) => !item.pergunta || !item.resposta)) { setErro("Selecione a causa e preencha a hipótese e todas as respostas."); return; }
    const sinal = controllerRef.current.signal; enviandoRef.current = true; setEnviando(true); setErro(null);
    void (async () => {
      try {
        const salvo = await salvarCincoPorquesMongo(dados, sinal);
        const lista = await listarCincoPorquesMongo(idIshikawa, sinal).catch(() => { throw new MongoReadError("INVALID_RESPONSE"); });
        if (sinal.aborted) return;
        const confirmado = lista.find((item) => item.id === salvo.id && item.idIshikawa === idIshikawa && item.idCausaIshikawa === idCausaIshikawa && item.hipotese === dados.hipotese);
        if (!confirmado || confirmado.porques.length !== dados.porques.length || confirmado.porques.some((item, indice) => item.ordem !== dados.porques[indice].ordem || item.pergunta !== dados.porques[indice].pergunta || item.resposta !== dados.porques[indice].resposta)) throw new MongoReadError("INVALID_RESPONSE");
        navegar(voltar, { replace: true });
      } catch (falha) {
        if (sinal.aborted) return;
        if (!(falha instanceof ApiError) || falha.status === 0 || falha.status === 408 || falha.status >= 500 || (falha.status >= 200 && falha.status < 300)) { setIncerto(true); setErro("Não foi possível confirmar o envio. Volte aos 5 Porquês e confira a investigação antes de tentar novamente."); }
        else if (falha.status === 401 || falha.status === 403) setErro("A sessão ou as permissões não permitem esta alteração.");
        else setErro("Não foi possível salvar a investigação. Confira os dados e tente novamente.");
      } finally { if (!sinal.aborted) { enviandoRef.current = false; setEnviando(false); } }
    })();
  }
  return <section className="plan-investigacao" aria-labelledby="editor-investigacao-titulo">
    <Link className="plan-investigacao_voltar" to={voltar} onClick={(evento) => { if (enviando) evento.preventDefault(); }}>← Voltar aos 5 Porquês</Link>
    <h2 id="editor-investigacao-titulo">{investigacaoId ? "Editar investigação" : "Criar investigação"}</h2>
    <p className="plan-investigacao_subtitulo">Aprofunde uma causa do Ishikawa. Adicione quantos porquês forem necessários.</p>
    {estado !== "pronto" ? <p role={estado === "erro" ? "alert" : "status"}>{estado === "erro" ? "Não foi possível carregar os dados desta investigação." : "Carregando dados..."}</p> :
      <form className="plan-investigacao_cartao plan-investigacao_editor" onSubmit={salvar}>
        <label>Causa do Ishikawa *<select value={selecao} onChange={(evento) => setSelecao(evento.target.value)} required disabled={Boolean(investigacaoId) || enviando || incerto}><option value="">Selecione uma causa</option>{diagramas.flatMap((diagrama) => diagrama.causas.map((causa) => <option key={`${diagrama.id}:${causa.id}`} value={`${diagrama.id}:${causa.id}`}>{diagrama.problema} · {causa.descricao}</option>))}</select></label>
        {!diagramas.some((item) => item.causas.length) && <p role="status">Este ciclo ainda não tem causas no Ishikawa para investigar.</p>}
        <label>Causa investigada *<input value={hipotese} onChange={(evento) => setHipotese(evento.target.value)} required placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        {porques.map((porque, indice) => <label key={indice}>Resposta {indice + 1} *<input value={porque.resposta} onChange={(evento) => setPorques((atuais) => atuais.map((atual, posicao) => posicao === indice ? { ...atual, resposta: evento.target.value } : atual))} required placeholder="Preencha este campo" disabled={enviando || incerto} /></label>)}
        {!autorizado && <p role="status">O salvamento está disponível para gestores e administradores em ciclos ativos.</p>}
        <div className="plan-investigacao_editor-acoes"><button type="button" disabled={enviando || incerto} onClick={() => setPorques((atuais) => [...atuais, { ordem: atuais.length + 1, pergunta: "Por quê?", resposta: "" }])}>Adicionar porquê</button><button type="submit" disabled={!autorizado || enviando || incerto || !selecao}>{enviando ? "Salvando..." : "Salvar investigação"}</button></div>
      </form>}
    {erro && <ModalErroPlan titulo={incerto ? "Não foi possível confirmar a alteração" : "Não foi possível salvar a investigação"} mensagem={erro} aoFechar={() => setErro(null)} />}
  </section>;
}

export function PaginaPlanEditarInvestigacao() {
  const { cicloId, investigacaoId } = useParams(); const id = Number(cicloId);
  const ciclo = useCicloDaConta(cicloId);
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan"><PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>{Number.isSafeInteger(id) && id > 0 && ciclo.estado === "sucesso" ? <Formulario key={`${id}:${investigacaoId ?? "nova"}`} cicloId={id} investigacaoId={investigacaoId} cicloAberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} /> : <p role="status">{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo indisponível."}</p>}</PainelCicloPlanDo></main>;
}

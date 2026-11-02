import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { FormularioInvestigacaoProps } from "../../../types/plan";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import { listarIshikawasMongo, listarCincoPorquesMongo, salvarCincoPorquesMongo, MongoReadError } from "../../../services/api/mongo/dashboard.read.api";
import type { IshikawaMongo, PorqueMongo } from "../../../types/mongo";
import { ApiError } from "../../../services/http/client";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { PainelCicloPlanDo } from "../../../components/ciclo/PainelCicloPlanDo";
import { ModalErroPlan } from "../../../components/plan/ModalErroPlan";
import "../../../../features/plan/styles/pagina-plan-investigacao.css";
import { lerIdRotaPositivo } from "../../../utils/route-params";

type PorqueFormulario = PorqueMongo & { chaveLocal: string };
type EstadoFormulario = { selecao: string; hipotese: string; porques: PorqueFormulario[] };

function Formulario({ cicloId, investigacaoId, cicloAberto }: FormularioInvestigacaoProps) {
  const { actaUser } = useAuth();
  const idEmpresa = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" ? actaUser.idEmpresa : null;
  const autorizado = Boolean(idEmpresa && cicloAberto && (actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR"));
  const navegar = useNavigate();
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");
  const [diagramas, setDiagramas] = useState<IshikawaMongo[]>([]);
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    selecao: "",
    hipotese: "",
    porques: [
      { chaveLocal: crypto.randomUUID(), ordem: 1, pergunta: "Por quê?", resposta: "" },
      { chaveLocal: crypto.randomUUID(), ordem: 2, pergunta: "Por quê?", resposta: "" },
      { chaveLocal: crypto.randomUUID(), ordem: 3, pergunta: "Por quê?", resposta: "" },
    ],
  });
  const { selecao, hipotese, porques } = formulario;
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const enviandoRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const camposRef = useRef(new Map<string, HTMLInputElement>());
  const adicionarRef = useRef<HTMLButtonElement>(null);
  const focoPendenteRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (focoPendenteRef.current === null) return;
    const chave = focoPendenteRef.current;
    focoPendenteRef.current = null;
    if (chave) camposRef.current.get(chave)?.focus();
    else adicionarRef.current?.focus();
  }, [formulario.porques]);

  function removerPorque(chaveLocal: string) {
    const indice = porques.findIndex((item) => item.chaveLocal === chaveLocal);
    const restantes = porques.filter((item) => item.chaveLocal !== chaveLocal);
    focoPendenteRef.current = restantes[indice]?.chaveLocal ?? restantes[indice - 1]?.chaveLocal ?? "";
    setFormulario((atual) => ({ ...atual, porques: atual.porques.filter((item) => item.chaveLocal !== chaveLocal).map((item, ordem) => ({ ...item, ordem: ordem + 1 })) }));
  }

  function moverPorque(chaveLocal: string, deslocamento: -1 | 1) {
    const indice = porques.findIndex((item) => item.chaveLocal === chaveLocal);
    const destino = indice + deslocamento;
    if (indice < 0 || destino < 0 || destino >= porques.length) return;
    const atualizados = [...porques];
    [atualizados[indice], atualizados[destino]] = [atualizados[destino], atualizados[indice]];
    focoPendenteRef.current = chaveLocal;
    setFormulario((atual) => ({ ...atual, porques: atualizados.map((item, ordem) => ({ ...item, ordem: ordem + 1 })) }));
  }
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
        if (!controller.signal.aborted) {
          setFormulario((atual) => ({
            ...atual,
            selecao: `${item.idIshikawa}:${item.idCausaIshikawa}`,
            hipotese: item.hipotese,
            porques: ordenados.map((porque) => ({ ...porque, chaveLocal: crypto.randomUUID() })),
          }));
        }
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
    const dados = { idIshikawa, idCausaIshikawa, idInvestigacao: investigacaoId, hipotese: hipotese.trim(), porques: porques.map(({ chaveLocal: _chaveLocal, ...item }, indice) => ({ ...item, ordem: indice + 1, pergunta: item.pergunta.trim(), resposta: item.resposta.trim() })) };
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
    {estado !== "pronto" ? <p role={estado === "erro" ? "alert" : "status"}>{estado === "erro" ? "Não foi possível carregar os dados desta investigação." : <CarregandoConteudo compacto mensagem="Carregando dados..." />}</p> :
      <form className="plan-investigacao_cartao plan-investigacao_editor" onSubmit={salvar}>
        <label htmlFor="dad-pages-plan-paginaplaneditarinvestigacao-index-92-9">Causa do Ishikawa *<select id="dad-pages-plan-paginaplaneditarinvestigacao-index-92-9" value={selecao} onChange={(evento) => setFormulario((atual) => ({ ...atual, selecao: evento.target.value }))} required disabled={Boolean(investigacaoId) || enviando || incerto}><option value="">Selecione uma causa</option>{diagramas.flatMap((diagrama) => diagrama.causas.map((causa) => <option key={`${diagrama.id}:${causa.id}`} value={`${diagrama.id}:${causa.id}`}>{diagrama.problema} · {causa.descricao}</option>))}</select></label>
        {!diagramas.some((item) => item.causas.length) && <p role="status">Este ciclo ainda não tem causas no Ishikawa para investigar.</p>}
        <label htmlFor="dad-pages-plan-paginaplaneditarinvestigacao-index-94-9">Causa investigada *<input id="dad-pages-plan-paginaplaneditarinvestigacao-index-94-9" value={hipotese} onChange={(evento) => setFormulario((atual) => ({ ...atual, hipotese: evento.target.value }))} required placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        {porques.map((porque, indice) => <div className="plan-investigacao_editor-campo" key={porque.chaveLocal}><label htmlFor={`dad-pages-plan-paginaplaneditarinvestigacao-index-${String(porque.chaveLocal)}`}>Resposta {indice + 1} *<input ref={(elemento) => { if (elemento) camposRef.current.set(porque.chaveLocal, elemento); else camposRef.current.delete(porque.chaveLocal); }} id={`dad-pages-plan-paginaplaneditarinvestigacao-index-${String(porque.chaveLocal)}`} value={porque.resposta} onChange={(evento) => setFormulario((atual) => ({ ...atual, porques: atual.porques.map((item) => item.chaveLocal === porque.chaveLocal ? { ...item, resposta: evento.target.value } : item) }))} required placeholder="Preencha este campo" disabled={enviando || incerto} /></label><div className="plan-investigacao_editor-campo-acoes"><button type="button" aria-label={`Mover resposta ${indice + 1} para cima`} disabled={indice === 0 || enviando || incerto} onClick={() => moverPorque(porque.chaveLocal, -1)}>↑</button><button type="button" aria-label={`Mover resposta ${indice + 1} para baixo`} disabled={indice === porques.length - 1 || enviando || incerto} onClick={() => moverPorque(porque.chaveLocal, 1)}>↓</button><button type="button" aria-label={`Remover resposta ${indice + 1}`} disabled={porques.length <= 1 || enviando || incerto} onClick={() => removerPorque(porque.chaveLocal)}>Remover</button></div></div>)}
        {!autorizado && <p role="status">O salvamento está disponível para gestores e administradores em ciclos ativos.</p>}
        <div className="plan-investigacao_editor-acoes"><button ref={adicionarRef} type="button" disabled={enviando || incerto} onClick={() => setFormulario((atual) => ({ ...atual, porques: [...atual.porques, { chaveLocal: crypto.randomUUID(), ordem: atual.porques.length + 1, pergunta: "Por quê?", resposta: "" }] }))}>Adicionar porquê</button><button type="submit" disabled={!autorizado || enviando || incerto || !selecao}>{enviando ? "Salvando..." : "Salvar investigação"}</button></div>
      </form>}
    {erro && <ModalErroPlan titulo={incerto ? "Não foi possível confirmar a alteração" : "Não foi possível salvar a investigação"} mensagem={erro} aoFechar={() => setErro(null)} />}
  </section>;
}

export function PaginaPlanEditarInvestigacao() {
  const { cicloId, investigacaoId } = useParams(); const id = lerIdRotaPositivo(cicloId);
  const investigacaoValida = investigacaoId === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(investigacaoId);
  const ciclo = useCicloDaConta(cicloId);
  return <main className="pagina-ciclo-plan-do pagina-ciclo-plan"><PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" exibirAvisoDemonstrativo={false}>{id !== null && investigacaoValida && ciclo.estado === "sucesso" ? <Formulario key={`${id}:${investigacaoId ?? "nova"}`} cicloId={id} investigacaoId={investigacaoId} cicloAberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} /> : <p role={ciclo.estado === "carregando" ? "status" : "alert"}>{ciclo.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando ciclo..." /> : !investigacaoValida ? "Investigação inválida." : "Ciclo indisponível."}</p>}</PainelCicloPlanDo></main>;
}

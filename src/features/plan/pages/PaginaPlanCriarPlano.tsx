import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { ApiError } from "../../../services/http/client";
import { listarPlanosPorCicloPg, listarUsuariosDoCicloPg, type PrioridadeTarefaPg, type UsuarioDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { criarPlanoPg, criarPlano5W2HPg } from "../../../services/api/pg/pdca.write.api";
import { useCicloDaConta } from "../../ciclo/hooks/useCicloDaConta";
import { ModalErroPlan } from "../components/ModalErroPlan";
import "../styles/pagina-plan-criar-problema.css";
import "../styles/pagina-plan-editar-problema.css";

function FormularioPlano({ idCiclo, aberto }: { idCiclo: number; aberto: boolean }) {
  const { actaUser } = useAuth();
  const navegar = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioDoCicloPg[] | null>(null);
  const [erroUsuarios, setErroUsuarios] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const bloqueado = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const autorizado = aberto && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR");
  const voltar = `/do/ciclo/${idCiclo}/plan/planos`;
  useEffect(() => {
    const atual = new AbortController(); controller.current = atual;
    void listarUsuariosDoCicloPg(idCiclo, atual.signal).then((dados) => { if (!atual.signal.aborted) setUsuarios(dados); }).catch(() => { if (!atual.signal.aborted) setErroUsuarios(true); });
    return () => { atual.abort(); controller.current = null; };
  }, [idCiclo]);
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!autorizado || !usuarios || bloqueado.current || incerto || !controller.current) return;
    const campos = new FormData(evento.currentTarget);
    const texto = (nome: string) => String(campos.get(nome) ?? "").trim();
    const oQue = texto("oQue"), porQue = texto("porQue"), onde = texto("onde"), como = texto("como"), inicio = texto("inicio"), termino = texto("termino"), custoTexto = texto("custo");
    const responsavel = Number(texto("responsavel")), prioridade = texto("prioridade") as PrioridadeTarefaPg, custo = Number(custoTexto);
    const hoje = new Date(); const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    if (!oQue || oQue.length > 160 || [porQue, onde, como].some((v) => !v || v.length > 1000)
      || !["BAIXA", "MEDIA", "ALTA", "CRITICA"].includes(prioridade) || !usuarios.some((p) => p.idUsuario === responsavel)
      || !termino || termino <= hojeIso || (inicio && (inicio <= hojeIso || inicio > termino))
      || !custoTexto || !Number.isFinite(custo) || custo < 0 || custo >= 1e10 || Math.abs(custo * 100 - Math.round(custo * 100)) > 1e-7) {
      setErro("Confira os campos, escolha um responsável do ciclo e informe datas futuras válidas."); return;
    }
    const sinal = controller.current.signal; bloqueado.current = true; setOcupado(true);
    void (async () => {
      let idPlano: number | null = null;
      try {
        idPlano = await criarPlanoPg(idCiclo, oQue, prioridade, sinal);
        await criarPlano5W2HPg(idPlano, { whatAcao: oQue, whyJustificativa: porQue, whereLocal: onde, howModoExecucao: como, whenInicio: inicio || null, whenFim: termino, howMuchCusto: custo, idWhoResponsavel: responsavel }, sinal);
        const planos = await listarPlanosPorCicloPg(idCiclo, sinal);
        if (!planos.some((p) => p.id === idPlano && p.idCiclo === idCiclo && p.nome === oQue)) throw new Error("Leitura não confirmou o plano.");
        if (!sinal.aborted) navegar(voltar, { replace: true });
      } catch (falha) {
        if (sinal.aborted) return;
        const rejeitado = falha instanceof ApiError && falha.status >= 400 && falha.status < 500 && ![408, 429].includes(falha.status);
        if (idPlano !== null) { setIncerto(true); setErro(`O plano ${idPlano} foi criado, mas não foi possível confirmar o 5W2H. Confira a lista antes de tentar novamente.`); }
        else if (rejeitado) setErro("O servidor recusou o cadastro. Confira os dados e as permissões do ciclo.");
        else { setIncerto(true); setErro("Não foi possível confirmar se o plano foi criado. Confira a lista antes de tentar novamente."); }
      } finally { if (!sinal.aborted) { setOcupado(false); if (!incerto) bloqueado.current = false; } }
    })();
  }
  return <><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="criar-plano-titulo">
    <aside className="plan-criar-problema_banner" aria-label="ACTA"><div className="plan-criar-problema_mensagem"><p>Acta, seu app de PDCA</p><p>O ciclo da melhoria começa aqui!</p></div></aside>
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="criar-plano-titulo">Criar plano de ação</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={enviar}>
        <label>O quê? *<input name="oQue" maxLength={160} required disabled={ocupado || incerto} placeholder="Preencha este campo" /></label>
        <label>Por quê? *<input name="porQue" maxLength={1000} required disabled={ocupado || incerto} placeholder="Preencha este campo" /></label>
        <label>Onde? *<input name="onde" maxLength={1000} required disabled={ocupado || incerto} placeholder="Preencha este campo" /></label>
        <label>Como? *<input name="como" maxLength={1000} required disabled={ocupado || incerto} placeholder="Preencha este campo" /></label>
        <label>Quando? · início<input name="inicio" type="date" disabled={ocupado || incerto} /></label>
        <label>Quando? · término *<input name="termino" type="date" required disabled={ocupado || incerto} /></label>
        <label>Quem? *<select name="responsavel" required defaultValue="" disabled={!usuarios || ocupado || incerto}><option value="" disabled>Selecione um responsável</option>{usuarios?.map((p) => <option key={p.idUsuario} value={p.idUsuario}>{p.nomeUsuario}</option>)}</select></label>
        <label>Prioridade *<select name="prioridade" required defaultValue="" disabled={ocupado || incerto}><option value="" disabled>Selecione a prioridade</option><option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></label>
        <label>Quanto custa? *<input name="custo" type="number" min="0" step="0.01" required disabled={ocupado || incerto} placeholder="Preencha este campo" /></label>
        <p className="plan-editar-problema_aviso" role="status">{erroUsuarios ? "Não foi possível carregar os responsáveis." : !usuarios ? "Carregando responsáveis..." : !usuarios.length ? "Nenhum responsável disponível neste ciclo." : !autorizado ? "Cadastro disponível para gestores e administradores em ciclos ativos." : incerto ? "Confira a lista antes de tentar novamente." : "O plano e o 5W2H serão registrados em sequência."}</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar} onClick={(e) => { if (ocupado) e.preventDefault(); }}>Cancelar</Link><button type="submit" disabled={!autorizado || !usuarios?.length || ocupado || incerto}>{ocupado ? "Salvando..." : "Criar plano de ação"}</button></div>
      </form>
    </div>
  </section>{erro && <ModalErroPlan titulo="Não foi possível concluir o cadastro" mensagem={erro} aoFechar={() => setErro(null)} />}</>;
}

export function PaginaPlanCriarPlano() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? "Carregando ciclo..." : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  return <main className="plan-criar-problema"><FormularioPlano key={ciclo.ciclo.id} idCiclo={ciclo.ciclo.id} aberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} /></main>;
}

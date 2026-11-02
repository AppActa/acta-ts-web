import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { FormularioMetaProps } from "../../../types/plan";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { listarMetasPorCicloPg, listarPlanosPorCicloPg, listarUsuariosDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import type { PlanoAcaoPg, UsuarioDoCicloPg, PrioridadeTarefaPg } from "../../../types/pdca";
import { criarMetaPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import { ModalErroPlan } from "../../../components/plan/ModalErroPlan";
import "../../../../features/plan/styles/pagina-plan-criar-problema.css";
import "../../../../features/plan/styles/pagina-plan-editar-problema.css";

function FormularioMeta({ cicloId, cicloAberto }: FormularioMetaProps) {
  const { actaUser } = useAuth(); const navegar = useNavigate();
  const [dados, setDados] = useState<{ estado: "carregando" | "pronto" | "erro"; planos: PlanoAcaoPg[]; usuarios: UsuarioDoCicloPg[] }>({ estado: "carregando", planos: [], usuarios: [] });
  const [enviando, setEnviando] = useState(false); const [incerto, setIncerto] = useState(false); const [erro, setErro] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null); const enviandoRef = useRef(false);
  const autorizado = cicloAberto && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR");
  const voltar = `/do/ciclo/${cicloId}/plan/metas`;
  useEffect(() => {
    const controller = new AbortController(); controllerRef.current = controller; setDados({ estado: "carregando", planos: [], usuarios: [] });
    void Promise.all([listarPlanosPorCicloPg(cicloId, controller.signal), listarUsuariosDoCicloPg(cicloId, controller.signal)]).then(([planos, usuarios]) => {
      if (!controller.signal.aborted) setDados({ estado: "pronto", planos, usuarios });
    }).catch(() => { if (!controller.signal.aborted) setDados({ estado: "erro", planos: [], usuarios: [] }); });
    return () => { controller.abort(); controllerRef.current = null; };
  }, [cicloId]);
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!autorizado || enviandoRef.current || incerto || !controllerRef.current || dados.estado === "carregando" || dados.estado === "erro") return;
    const campos = new FormData(evento.currentTarget); const texto = (nome: string) => String(campos.get(nome) ?? "").trim();
    const idPlano = Number(texto("plano")); const responsaveis = campos.getAll("responsaveis").map(Number);
    const valorBaseTexto = texto("valorBase"); const valorAlvoTexto = texto("valorAlvo");
    const prioridade = texto("prioridade");
    if (!dados.planos.some((item) => item.id === idPlano) || !responsaveis.length || responsaveis.some((id) => !dados.usuarios.some((item) => item.idUsuario === id)) || !["BAIXA", "MEDIA", "ALTA", "CRITICA"].includes(prioridade)) { setErro("Selecione um plano, a prioridade e ao menos um responsável do ciclo."); return; }
    const meta = { objetivo: texto("objetivo"), valorBase: valorBaseTexto ? Number(valorBaseTexto) : null, valorAlvo: valorAlvoTexto ? Number(valorAlvoTexto) : null, unidadeMedida: texto("unidade") || null, prazo: texto("prazo"), prioridade: prioridade as PrioridadeTarefaPg, area: texto("area") || null, categoria: texto("categoria") || null, responsaveis };
    const sinal = controllerRef.current.signal; enviandoRef.current = true; setEnviando(true); setErro(null);
    void (async () => {
      try {
        const id = await criarMetaPg(idPlano, cicloId, meta, sinal);
        const metas = await listarMetasPorCicloPg(cicloId, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
        if (sinal.aborted) return;
        if (!metas.some((item) => item.id === id && item.idCiclo === cicloId && item.objetivo === meta.objetivo && item.valorBase === meta.valorBase && item.valorAlvo === meta.valorAlvo)) throw new PdcaWriteError("INVALID_RESPONSE");
        navegar(voltar, { replace: true });
      } catch (falha) {
        if (sinal.aborted) return;
        if (falha instanceof PdcaWriteError && falha.code === "INVALID_INPUT") setErro("Confira o objetivo, os valores, o prazo futuro e os demais campos.");
        else if (!(falha instanceof ApiError) || falha.status === 0 || falha.status === 408 || falha.status >= 500 || (falha.status >= 200 && falha.status < 300)) { setIncerto(true); setErro("Não foi possível confirmar o cadastro. Volte à lista de metas e confira antes de tentar novamente."); }
        else if (falha.status === 401 || falha.status === 403) setErro("A sessão ou as permissões não permitem criar esta meta.");
        else setErro("O servidor não aceitou os dados. Confira os campos e tente novamente.");
      } finally { if (!sinal.aborted) { enviandoRef.current = false; setEnviando(false); } }
    })();
  }
  const pronto = dados.estado !== "carregando" && dados.estado !== "erro";
  return <><section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="criar-meta-titulo">
    <div className="plan-criar-problema_conteudo"><h1 className="plan-criar-problema_titulo" id="criar-meta-titulo">Criar meta</h1><p className="plan-criar-problema_aviso">Campos com * são obrigatórios.</p>
      <form className="plan-editar-problema_campos" onSubmit={salvar}>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-58-9">Plano de ação *<select id="dad-pages-plan-paginaplancriarmeta-index-58-9" name="plano" required defaultValue="" disabled={!pronto || enviando || incerto}><option value="" disabled>Selecione um plano</option>{dados.planos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-59-9">Objetivo *<input id="dad-pages-plan-paginaplancriarmeta-index-59-9" name="objetivo" maxLength={1000} required placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-60-9">Valor base<input id="dad-pages-plan-paginaplancriarmeta-index-60-9" name="valorBase" type="number" min="0" step="0.01" placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-61-9">Valor alvo<input id="dad-pages-plan-paginaplancriarmeta-index-61-9" name="valorAlvo" type="number" min="0.01" step="0.01" placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-62-9">Unidade<input id="dad-pages-plan-paginaplancriarmeta-index-62-9" name="unidade" maxLength={30} placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-63-9">Prazo *<input id="dad-pages-plan-paginaplancriarmeta-index-63-9" name="prazo" type="date" required disabled={enviando || incerto} /></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-64-9">Prioridade *<select id="dad-pages-plan-paginaplancriarmeta-index-64-9" name="prioridade" required defaultValue="" disabled={enviando || incerto}><option value="" disabled>Selecione a prioridade</option><option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-65-9">Responsáveis *<select id="dad-pages-plan-paginaplancriarmeta-index-65-9" name="responsaveis" multiple required disabled={!pronto || enviando || incerto}>{dados.usuarios.map((item) => <option key={item.idUsuario} value={item.idUsuario}>{item.nomeUsuario}</option>)}</select></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-66-9">Área<input id="dad-pages-plan-paginaplancriarmeta-index-66-9" name="area" maxLength={100} placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        <label htmlFor="dad-pages-plan-paginaplancriarmeta-index-67-9">Categoria<input id="dad-pages-plan-paginaplancriarmeta-index-67-9" name="categoria" maxLength={100} placeholder="Preencha este campo" disabled={enviando || incerto} /></label>
        <p className="plan-editar-problema_aviso" role="status">{dados.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando planos e participantes..." /> : dados.estado === "erro" ? "Não foi possível carregar planos e participantes." : !dados.planos.length ? "Cadastre um plano de ação antes de criar uma meta." : !dados.usuarios.length ? "O ciclo precisa ter participantes para atribuir a meta." : !autorizado ? "O cadastro está disponível para gestores e administradores em ciclos ativos." : "Selecione um ou mais responsáveis do ciclo."}</p>
        <div className="plan-editar-problema_acoes"><Link to={voltar} onClick={(evento) => { if (enviando) evento.preventDefault(); }}>Cancelar</Link><button type="submit" disabled={!autorizado || !pronto || !dados.planos.length || !dados.usuarios.length || enviando || incerto}>{enviando ? "Salvando..." : "Criar meta"}</button></div>
      </form>
    </div>
  </section>{erro && <ModalErroPlan titulo={incerto ? "Não foi possível confirmar o cadastro" : "Não foi possível criar a meta"} mensagem={erro} aoFechar={() => setErro(null)} />}</>;
}

export function PaginaPlanCriarMeta() {
  const { cicloId } = useParams(); const ciclo = useCicloDaConta(cicloId);
  return <main className="plan-criar-problema">{ciclo.estado === "sucesso" ? <FormularioMeta key={ciclo.ciclo.id} cicloId={ciclo.ciclo.id} cicloAberto={ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO"} /> : <section className="plan-criar-problema_estado" role="status"><p>{ciclo.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando ciclo..." /> : "Ciclo indisponível."}</p><Link to="/ciclos">Voltar aos ciclos</Link></section>}</main>;
}

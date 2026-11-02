import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../components/auth/AuthProvider";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useProblemasDoCiclo } from "../../../features/plan/hooks/useProblemasDoCiclo";
import { listarCausasRaizPorCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { criarCausaRaizPg, PdcaWriteError } from "../../../services/api/pg/pdca.write.api";
import { ApiError } from "../../../services/http/client";
import "../../../../features/plan/styles/pagina-plan-criar-problema.css";
import "../../../../features/plan/styles/pagina-plan-editar-problema.css";

function FormularioCausa({ idCiclo, habilitado }: { idCiclo: number; habilitado: boolean }) {
  const problemas = useProblemasDoCiclo(idCiclo);
  const navigate = useNavigate();
  const controller = useRef<AbortController | null>(null);
  const bloqueio = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  useEffect(() => {
    const atual = new AbortController();
    controller.current = atual;
    return () => { atual.abort(); controller.current = null; };
  }, [idCiclo]);
  const voltar = `/do/ciclo/${idCiclo}/plan/causas`;
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!habilitado || incerto || bloqueio.current || problemas.estado !== "sucesso" || !controller.current) return;
    const dados = new FormData(evento.currentTarget);
    const idProblema = Number(dados.get("problema"));
    const descricao = String(dados.get("descricao") ?? "").trim();
    const principal = dados.get("principal") === "on";
    if (!problemas.dados.some((p) => p.id === idProblema && p.idCiclo === idCiclo) || !descricao || descricao.length > 1000) return;
    const sinal = controller.current.signal;
    bloqueio.current = true;
    setEnviando(true);
    setMensagem("");
    try {
      const id = await criarCausaRaizPg(idCiclo, idProblema, descricao, principal, sinal);
      const causas = await listarCausasRaizPorCicloPg(idCiclo, sinal).catch(() => { throw new PdcaWriteError("INVALID_RESPONSE"); });
      if (!causas.some((c) => c.id === id && c.idCiclo === idCiclo && c.descricao === descricao)) throw new PdcaWriteError("INVALID_RESPONSE");
      if (!sinal.aborted) navigate(voltar);
    } catch (erro) {
      if (sinal.aborted) return;
      if ((erro instanceof ApiError && (erro.status === 0 || erro.status >= 500 || (erro.status >= 200 && erro.status < 300))) || (erro instanceof PdcaWriteError && erro.code === "INVALID_RESPONSE") || !(erro instanceof ApiError || erro instanceof PdcaWriteError)) {
        setIncerto(true);
        setMensagem("Não foi possível confirmar o resultado. Confira a lista de causas antes de tentar novamente.");
      } else setMensagem(erro instanceof ApiError && erro.status === 403 ? "Sua conta não tem permissão para criar esta causa." : "Não foi possível criar a causa. Revise os dados e tente novamente.");
    } finally {
      if (!sinal.aborted) { bloqueio.current = false; setEnviando(false); }
    }
  }
  return <section className="plan-criar-problema_modal plan-editar-problema" aria-labelledby="criar-causa-titulo"><div className="plan-criar-problema_conteudo">
    <h1 className="plan-criar-problema_titulo" id="criar-causa-titulo">Criar causa</h1><p>Campos com * são obrigatórios.</p>
    <form className="plan-editar-problema_campos" onSubmit={enviar}>
      <label>Problema *<select name="problema" required defaultValue="" disabled={problemas.estado !== "sucesso" || enviando}><option value="" disabled>Selecione um problema</option>{problemas.estado === "sucesso" && problemas.dados.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}</select></label>
      {problemas.estado !== "sucesso" && <p role="status">{problemas.estado === "carregando" ? "Carregando problemas..." : problemas.estado === "vazio" ? "Cadastre um problema neste ciclo antes de criar uma causa." : "Não foi possível carregar os problemas."}</p>}
      <label>Descrição *<input name="descricao" required maxLength={1000} disabled={enviando} /></label>
      <label><input type="checkbox" name="principal" disabled={enviando} /> Causa principal</label>
      {!habilitado && <p role="status">A criação está indisponível para esta conta ou ciclo.</p>}
      {mensagem && <p role="alert">{mensagem}</p>}
      <div className="plan-editar-problema_acoes"><Link to={voltar} onClick={(e) => { if (enviando) e.preventDefault(); }}>{incerto ? "Conferir causas" : "Cancelar"}</Link><button type="submit" disabled={!habilitado || enviando || incerto || problemas.estado !== "sucesso"}>{enviando ? "Salvando..." : "Criar causa"}</button></div>
    </form></div></section>;
}

export function PaginaPlanCriarCausa() {
  const { cicloId } = useParams();
  const ciclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  if (ciclo.estado !== "sucesso") return <main className="plan-criar-problema"><section className="plan-criar-problema_estado" role="status">{ciclo.estado === "carregando" ? <CarregandoConteudo compacto mensagem="Carregando ciclo..." /> : "Ciclo indisponível."}<Link to="/ciclos">Voltar aos ciclos</Link></section></main>;
  const habilitado = Boolean(firebaseUser?.emailVerified && firebaseUser.uid && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && actaUser.idEmpresa === ciclo.ciclo.idEmpresa && (actaUser.tipo === "ADMIN" || actaUser.tipo === "GESTOR") && ciclo.ciclo.status !== "CONCLUIDO" && ciclo.ciclo.status !== "CANCELADO");
  return <main className="plan-criar-problema"><FormularioCausa key={`${firebaseUser?.uid}:${ciclo.ciclo.idEmpresa}:${ciclo.ciclo.id}`} idCiclo={ciclo.ciclo.id} habilitado={habilitado} /></main>;
}

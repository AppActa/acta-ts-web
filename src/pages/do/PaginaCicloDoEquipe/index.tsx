import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { PaginaCicloDoEquipeProps } from "../../../types/do";
import { Sidebar } from "../../../components/layout/Sidebar";
import { CabecalhoNavegacaoCiclo } from "../../../components/ciclo/CabecalhoNavegacaoCiclo";
import { useCicloDaConta } from "../../../features/ciclo/hooks/useCicloDaConta";
import { useAuth } from "../../../components/auth/AuthProvider";
import { listarUsuariosDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import { adicionarUsuarioAoCicloPg, type PapelCicloPg } from "../../../services/api/pg/ciclo.api";
import { useUsuariosDaEmpresa } from "../../../features/ciclo/hooks/useUsuariosDaEmpresa";
import { ApiError } from "../../../services/http/client";
import { convidarColaborador, type DadosConvite } from "../../../services/api/auth/convite.api";
import voltarMoldura from "../../../../features/ciclos/assets/voltar-moldura.svg";
import voltarSeta from "../../../../features/ciclos/assets/voltar-seta.svg";
import "../../../../features/do/styles/pagina-ciclo-do.css";
import "../../../../features/do/styles/pagina-ciclo-do-equipe.css";

function ConvidarPessoa({ cicloId, empresaId, permitido, conta, aoAtualizar }: { cicloId: number; empresaId: number; permitido: boolean; conta: string; aoAtualizar: () => void }) {
  const [ocupado, setOcupado] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const trava = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => { const c = new AbortController(); controller.current = c; return () => { c.abort(); controller.current = null; }; }, [cicloId, conta]);
  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permitido || ocupado || bloqueado || trava.current || !controller.current) return;
    const form = new FormData(event.currentTarget);
    const texto = (campo: string) => String(form.get(campo) ?? "").trim();
    const tipo = texto("tipo");
    const papel = texto("papel");
    if ((tipo !== "COLABORADOR" && tipo !== "GESTOR") || !["PARTICIPANTE", "EXECUTOR", "VALIDADOR", "OBSERVADOR"].includes(papel)) return;
    const dados: DadosConvite = {
      nome: texto("nome"), cpf: texto("cpf").replace(/\D/g, ""), cargo: texto("cargo"), area: texto("area"),
      dataNascimento: texto("nascimento"), dataContratacao: texto("contratacao"),
      email: texto("email"), telefone: texto("telefone").replace(/\D/g, ""), tipo, permissaoGestor: tipo === "GESTOR",
    };
    if (!/^\d{11}$/.test(dados.cpf) || !/^\d{9,11}$/.test(dados.telefone)) { setMensagem("Informe CPF com 11 dígitos e telefone com 9 a 11 dígitos."); return; }
    const signal = controller.current.signal;
    trava.current = true; setOcupado(true); setMensagem("");
    let convidado = false;
    try {
      const pessoa = await convidarColaborador(dados, empresaId, signal);
      convidado = true;
      await adicionarUsuarioAoCicloPg(cicloId, pessoa.idUsuario, pessoa.nome, papel as PapelCicloPg, signal);
      const membros = await listarUsuariosDoCicloPg(cicloId, signal);
      if (!membros.some((membro) => membro.idUsuario === pessoa.idUsuario && membro.papelCiclo === papel)) throw new Error();
      if (!signal.aborted) { setBloqueado(true); setMensagem("Convite enviado e pessoa vinculada ao ciclo. O acesso depende da ativação do convite."); aoAtualizar(); }
    } catch (erro) {
      if (signal.aborted) return;
      if (convidado) {
        setBloqueado(true);
        setMensagem("O convite foi enviado, mas não foi possível confirmar o vínculo ao ciclo. Confira a equipe antes de tentar qualquer novo envio.");
      } else if (!(erro instanceof ApiError) || erro.status === 0 || erro.status >= 500 || (erro.status >= 200 && erro.status < 300)) {
        setBloqueado(true);
        setMensagem("Não foi possível confirmar o envio. Confira o cadastro e o e-mail antes de tentar novamente.");
      } else setMensagem(erro.status === 403 ? "Apenas administradores podem enviar convites." : "O servidor recusou o convite. Confira os dados e se o e-mail ou CPF já estão cadastrados.");
    } finally { if (!signal.aborted) { trava.current = false; setOcupado(false); } }
  }
  return <section className="ciclo-do-equipe_convidar" aria-labelledby="convidar-nova-pessoa">
    <h3 id="convidar-nova-pessoa">Convidar nova pessoa</h3>
    {!permitido ? <p>O convite está disponível para administradores em ciclos abertos.</p> : <form onSubmit={(event) => void enviar(event)}>
      <label>Nome completo<input name="nome" required maxLength={160} disabled={ocupado || bloqueado} /></label>
      <label>CPF<input name="cpf" inputMode="numeric" required minLength={11} maxLength={14} disabled={ocupado || bloqueado} /></label>
      <label>Cargo<input name="cargo" required maxLength={100} disabled={ocupado || bloqueado} /></label>
      <label>Área<input name="area" required maxLength={100} disabled={ocupado || bloqueado} /></label>
      <label>Data de nascimento<input name="nascimento" type="date" required disabled={ocupado || bloqueado} /></label>
      <label>Data de contratação<input name="contratacao" type="date" required disabled={ocupado || bloqueado} /></label>
      <label>E-mail<input name="email" type="email" required maxLength={254} disabled={ocupado || bloqueado} /></label>
      <label>Telefone<input name="telefone" type="tel" required maxLength={16} disabled={ocupado || bloqueado} /></label>
      <label>Tipo de usuário<select name="tipo" defaultValue="COLABORADOR" disabled={ocupado || bloqueado}><option value="COLABORADOR">Colaborador</option><option value="GESTOR">Gestor</option></select></label>
      <label>Papel no ciclo<select name="papel" defaultValue="PARTICIPANTE" disabled={ocupado || bloqueado}><option value="PARTICIPANTE">Participante</option><option value="EXECUTOR">Executor</option><option value="VALIDADOR">Validador</option><option value="OBSERVADOR">Observador</option></select></label>
      <p>O envio criará um cadastro pendente e enviará um e-mail de ativação.</p>
      <button type="submit" disabled={ocupado || bloqueado}>{ocupado ? "Enviando..." : "Enviar convite"}</button>
    </form>}
    {mensagem && <p role={bloqueado ? "status" : "alert"}>{mensagem}</p>}
  </section>;
}

function AdicionarPessoa({ cicloId, empresaId, conta, permitido, membros, aoAtualizar }: { cicloId: number; empresaId: number; conta: string; permitido: boolean; membros: readonly string[]; aoAtualizar: () => void }) {
  const resultado = useUsuariosDaEmpresa(permitido, empresaId, conta);
  const [ocupado, setOcupado] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const trava = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => { const c = new AbortController(); controller.current = c; return () => { c.abort(); controller.current = null; }; }, [cicloId, conta]);
  const disponiveis = resultado.estado === "sucesso" ? resultado.usuarios.filter((u) => !membros.includes(String(u.id))) : [];
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!permitido || ocupado || incerto || trava.current || !controller.current) return;
    const form = new FormData(evento.currentTarget);
    const usuario = disponiveis.find((u) => u.id === Number(form.get("usuario")));
    const papel = String(form.get("papel"));
    if (!usuario || !["PARTICIPANTE", "EXECUTOR", "VALIDADOR", "OBSERVADOR"].includes(papel)) return;
    const signal = controller.current.signal;
    trava.current = true; setOcupado(true); setMensagem("");
    let enviado = false;
    try {
      await adicionarUsuarioAoCicloPg(cicloId, usuario.id, usuario.nome, papel as PapelCicloPg, signal);
      enviado = true;
      const lista = await listarUsuariosDoCicloPg(cicloId, signal);
      if (!lista.some((item) => item.idUsuario === usuario.id && item.idCiclo === cicloId && item.papelCiclo === papel)) throw new Error();
      if (!signal.aborted) { setMensagem("Pessoa adicionada ao ciclo."); aoAtualizar(); }
    } catch (erro) {
      if (signal.aborted) return;
      if (enviado || !(erro instanceof ApiError) || erro.status === 0 || erro.status >= 500 || (erro.status >= 200 && erro.status < 300)) {
        setIncerto(true); setMensagem("Não foi possível confirmar a inclusão. Atualize a página antes de tentar novamente.");
      } else setMensagem(erro.status === 403 ? "Sua conta não tem permissão para adicionar pessoas." : "Não foi possível adicionar a pessoa ao ciclo.");
    } finally { if (!signal.aborted) { trava.current = false; setOcupado(false); } }
  }
  return <section className="ciclo-do-equipe_convidar" aria-labelledby="ciclo-do-equipe-convidar-titulo">
    <h3 id="ciclo-do-equipe-convidar-titulo">Adicionar pessoa da empresa</h3>
    {!permitido ? <p>A inclusão está disponível para gestores em ciclos abertos.</p> : resultado.estado === "carregando" ? <p role="status">Carregando pessoas...</p> : resultado.estado === "erro" ? <p role="alert">Não foi possível carregar as pessoas da empresa.</p> : <form onSubmit={(event) => void enviar(event)}>
      <label>Pessoa <select name="usuario" required defaultValue="" disabled={ocupado || incerto || !disponiveis.length}><option value="" disabled>Selecione</option>{disponiveis.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}</select></label>
      <label>Papel no ciclo <select name="papel" required defaultValue="" disabled={ocupado || incerto}><option value="" disabled>Selecione</option><option value="PARTICIPANTE">Participante</option><option value="EXECUTOR">Executor</option><option value="VALIDADOR">Validador</option><option value="OBSERVADOR">Observador</option></select></label>
      {!disponiveis.length && <p role="status">Não há outras pessoas ativas disponíveis.</p>}
      <button disabled={ocupado || incerto || !disponiveis.length}>{ocupado ? "Adicionando..." : "Adicionar ao ciclo"}</button>
    </form>}
    {mensagem && <p role={incerto ? "alert" : "status"}>{mensagem}</p>}
  </section>;
}

export function PaginaCicloDoEquipe({ pessoas }: PaginaCicloDoEquipeProps) {
  const { cicloId } = useParams();
  const resultadoCiclo = useCicloDaConta(cicloId);
  const { firebaseUser, actaUser } = useAuth();
  const cicloAtual = resultadoCiclo.estado === "sucesso" ? resultadoCiclo.ciclo : null;
  const chave = cicloAtual && firebaseUser?.emailVerified && actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO" && actaUser.idEmpresa === cicloAtual.idEmpresa ? JSON.stringify([firebaseUser.uid, cicloAtual.idEmpresa, cicloAtual.id]) : null;
  const [consulta, setConsulta] = useState<{ chave: string; estado: "carregando" | "erro" | "sucesso"; pessoas: NonNullable<PaginaCicloDoEquipeProps["pessoas"]> } | null>(null);
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    if (!chave || !cicloAtual) return;
    const controller = new AbortController();
    setConsulta({ chave, estado: "carregando", pessoas: [] });
    void listarUsuariosDoCicloPg(cicloAtual.id, controller.signal).then((usuarios) => {
      if (!controller.signal.aborted) setConsulta({ chave, estado: "sucesso", pessoas: usuarios.map((usuario) => ({ id: String(usuario.idUsuario), nome: usuario.nomeUsuario, papel: usuario.papelCiclo?.replaceAll("_", " ") ?? "Não informado", participacao: "Integrante", acesso: "Não informado" })) });
    }).catch(() => { if (!controller.signal.aborted) setConsulta({ chave, estado: "erro", pessoas: [] }); });
    return () => controller.abort();
  }, [chave, cicloAtual?.id, versao]);
  const estado = pessoas != null ? "sucesso" : !chave ? "erro" : consulta?.chave === chave ? consulta.estado : "carregando";
  const listaPessoas = pessoas ?? (consulta?.chave === chave ? consulta.pessoas : []);

  if (resultadoCiclo.estado !== "sucesso") {
    const carregando = resultadoCiclo.estado === "carregando";
    const naoEncontrado = resultadoCiclo.estado === "nao-encontrado";
    return (
      <main className="pagina-ciclo-do pagina-ciclo-do-equipe">
        <Sidebar />
        <div className="ciclo-do_painel">
          <section className="ciclo-do-equipe_estado" role={carregando ? "status" : "alert"} aria-live="polite">
            <h1>{carregando ? <CarregandoConteudo compacto mensagem="Carregando ciclo" /> : naoEncontrado ? "Ciclo não encontrado" : "Não foi possível carregar o ciclo"}</h1>
            {!carregando && <p>{naoEncontrado ? "Este ciclo não está disponível para sua conta." : "Tente novamente mais tarde."}</p>}
          </section>
        </div>
      </main>
    );
  }
  const ciclo = resultadoCiclo.ciclo;

  return (
    <main className="pagina-ciclo-do pagina-ciclo-do-equipe">
      <Sidebar />
      <div className="ciclo-do_painel">
        <CabecalhoNavegacaoCiclo ciclo={ciclo} etapaAtiva="do" />

        <div className="ciclo-do-equipe_conteudo">
          <header className="ciclo-do-equipe_titulo-linha">
            <Link className="ciclo-do-equipe_voltar" to={`/do/ciclo/${cicloId}/visao-geral`} aria-label="Voltar à visão geral do ciclo">
              <img src={voltarMoldura} alt="" aria-hidden="true" />
              <img src={voltarSeta} alt="" aria-hidden="true" />
            </Link>
            <h2>Equipe</h2>
          </header>

          <div className="ciclo-do-equipe_paineis">
            <section className="ciclo-do-equipe_pessoas" aria-labelledby="ciclo-do-equipe-pessoas-titulo">
              <header className="ciclo-do-equipe_pessoas-cabecalho">
                <h3 id="ciclo-do-equipe-pessoas-titulo">Pessoas do ciclo</h3>
                <span>{estado !== "sucesso" ? "Contagem indisponível" : `${listaPessoas.length} ${listaPessoas.length === 1 ? "pessoa" : "pessoas"}`}</span>
                <p>Participantes e permissões do ciclo.</p>
              </header>

              <table className="ciclo-do-equipe_tabela">
                <caption className="sr-only">Pessoas do ciclo, papel, participação e acesso</caption>
                <thead>
                  <tr>
                    <th scope="col">Pessoa</th>
                    <th scope="col">Papel</th>
                    <th scope="col">Participação</th>
                    <th scope="col">Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPessoas.map((pessoa) => (
                    <tr key={pessoa.id}>
                      <th scope="row">{pessoa.nome}</th>
                      <td>{pessoa.papel}</td>
                      <td>
                        <span
                          data-estado={
                            pessoa.estadoParticipacao === "ativa" || pessoa.estadoParticipacao === "pendente"
                              ? pessoa.estadoParticipacao
                              : "neutra"
                          }
                        >
                          {pessoa.participacao}
                        </span>
                      </td>
                      <td>{pessoa.acesso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {estado !== "sucesso" ? (
                <p className="ciclo-do-equipe_vazio" role={estado === "erro" ? "alert" : "status"} aria-live="polite">{estado === "erro" ? "Não foi possível carregar a equipe." : "Carregando equipe..."}</p>
              ) : listaPessoas.length === 0 ? (
                <p className="ciclo-do-equipe_vazio" role="status" aria-live="polite">Nenhuma pessoa no ciclo.</p>
              ) : null}
            </section>

            {chave && <AdicionarPessoa key={chave} cicloId={ciclo.id} empresaId={ciclo.idEmpresa} conta={chave} permitido={Boolean((actaUser?.tipo === "ADMIN" || actaUser?.tipo === "GESTOR") && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO" && estado === "sucesso")} membros={listaPessoas.map((p) => p.id)} aoAtualizar={() => setVersao((v) => v + 1)} />}
            {chave && <ConvidarPessoa key={chave} cicloId={ciclo.id} empresaId={ciclo.idEmpresa} conta={chave} permitido={Boolean(actaUser?.tipo === "ADMIN" && ciclo.status !== "CONCLUIDO" && ciclo.status !== "CANCELADO")} aoAtualizar={() => setVersao((v) => v + 1)} />}
          </div>
        </div>
      </div>
    </main>
  );
}


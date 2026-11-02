import { useEffect, useReducer, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { CarregandoConteudo } from "../../../components/layout/CarregandoConteudo";
import type { PaginaOnboardingProps } from "../../../types/empresa";
import { useAuth } from "../../../components/auth/AuthProvider";
import { ApiError } from "../../../services/http/client";
import { getCurrentActaUser } from "../../../services/api/auth/auth.api";
import { cadastrarGestor, iniciarOnboarding } from "../../../services/api/auth/onboarding.api";
import type { Empresa, Endereco, Gestor, ResultadoOnboarding } from "../../../types/empresa";
import { buscarEnderecoPorCep } from "../../../services/api/viacep.api";
import { atualizarUsuarioFirebase, enviarVerificacaoDeEmail, renovarTokenFirebase, solicitarTrocaDeEmail } from "../../../services/api/auth/firebase-auth.api";
import { digitos, emailValido, hojeLocal, ontemLocal, mascaraCep, mascaraCpf, mascaraCnpj, mascaraTelefone, validarEmpresa, validarEndereco, validarGestor, type CampoEnderecoViaCep, type ErrosOnboarding } from "../../../utils/onboarding-validation";
import { PainelMarca } from "../../../components/auth/PainelMarca";
import "../../../../features/empresas/styles/onboarding.css";

type Etapa = "gestor" | "empresa" | "endereco" | "convite" | "espera";
type CampoEndereco = CampoEnderecoViaCep;
type Erros = ErrosOnboarding;
const gestorInicial: Gestor = { cpf: "", nome: "", cargo: "", area: "", dataNascimento: "", dataContratacao: "", email: "" };
const empresaInicial: Empresa = { cnpj: "", nome: "", tamanhoEmpresa: "PEQUENA", setorEmpresa: "", emailEmpresa: "", telefoneEmpresa: "" };
const enderecoInicial: Endereco = { cep: "", uf: "", cidade: "", bairro: "", logradouro: "", numeroEndereco: "", complemento: null };

type EstadoOnboarding = {
  etapa: Etapa;
  ultimaEtapaFormulario: "gestor" | "empresa";
  gestor: Gestor;
  empresa: Empresa;
  endereco: Endereco;
  erros: Erros;
  mensagem: string;
  trocandoEmail: boolean;
  novoEmail: string;
  emailVerificado: boolean;
  mensagemCep: string;
  camposViaCep: Partial<Record<CampoEndereco, boolean>>;
};

type AcaoOnboarding =
  | { type: "ATUALIZAR"; atualizar: (estado: EstadoOnboarding) => EstadoOnboarding }
  | { type: "EMAIL_VERIFICADO"; confirmado: boolean };

function reduzirOnboarding(estado: EstadoOnboarding, acao: AcaoOnboarding): EstadoOnboarding {
  switch (acao.type) {
    case "ATUALIZAR": return acao.atualizar(estado);
    case "EMAIL_VERIFICADO": return { ...estado, emailVerificado: acao.confirmado };
  }
}

function criarSetter<K extends keyof EstadoOnboarding>(
  dispatch: Dispatch<AcaoOnboarding>,
  chave: K,
): Dispatch<SetStateAction<EstadoOnboarding[K]>> {
  return (valor) => dispatch({
    type: "ATUALIZAR",
    atualizar: (estado) => ({
      ...estado,
      [chave]: typeof valor === "function"
        ? (valor as (anterior: EstadoOnboarding[K]) => EstadoOnboarding[K])(estado[chave])
        : valor,
    }),
  });
}

export function PaginaOnboarding({ pendente = false }: PaginaOnboardingProps) {
  const { firebaseUser, refreshActaUser, logout } = useAuth();
  const navigate = useNavigate();
  const [estado, dispatch] = useReducer(reduzirOnboarding, {
    etapa: pendente ? "espera" : "gestor",
    ultimaEtapaFormulario: "gestor",
    gestor: { ...gestorInicial, email: firebaseUser?.email ?? "" },
    empresa: empresaInicial,
    endereco: enderecoInicial,
    erros: {}, mensagem: "", trocandoEmail: false, novoEmail: "",
    emailVerificado: Boolean(firebaseUser?.emailVerified), mensagemCep: "", camposViaCep: {},
  });
  const { etapa, ultimaEtapaFormulario, gestor, empresa, endereco, erros, mensagem, trocandoEmail, novoEmail, emailVerificado, mensagemCep, camposViaCep } = estado;
  const setEtapa = criarSetter(dispatch, "etapa");
  const setUltimaEtapaFormulario = criarSetter(dispatch, "ultimaEtapaFormulario");
  const setGestor = criarSetter(dispatch, "gestor");
  const setEmpresa = criarSetter(dispatch, "empresa");
  const setEndereco = criarSetter(dispatch, "endereco");
  const setErros = criarSetter(dispatch, "erros");
  const setMensagem = criarSetter(dispatch, "mensagem");
  const setTrocandoEmail = criarSetter(dispatch, "trocandoEmail");
  const setNovoEmail = criarSetter(dispatch, "novoEmail");
  const setEmailVerificado = (confirmado: boolean) => dispatch({ type: "EMAIL_VERIFICADO", confirmado });
  const setMensagemCep = criarSetter(dispatch, "mensagemCep");
  const setCamposViaCep = criarSetter(dispatch, "camposViaCep");
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [atualizandoEmail, setAtualizandoEmail] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const cepNumeros = digitos(endereco.cep);

  useEffect(() => {
    if (etapa !== "endereco" || cepNumeros.length !== 8) {
      setBuscandoCep(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setBuscandoCep(true);
      setMensagemCep("");
      try {
        const resultado = await buscarEnderecoPorCep(cepNumeros, controller.signal);
        if (!resultado) {
          setMensagemCep("CEP não encontrado. Confira os números ou preencha o endereço manualmente.");
          return;
        }
        setEndereco((atual) => ({
          ...atual,
          cep: mascaraCep(resultado.cep),
          logradouro: resultado.logradouro,
          bairro: resultado.bairro,
          cidade: resultado.localidade,
          uf: resultado.uf,
        }));
        setCamposViaCep({
          uf: Boolean(resultado.uf),
          cidade: Boolean(resultado.localidade),
          bairro: Boolean(resultado.bairro),
          logradouro: Boolean(resultado.logradouro),
        });
        setMensagemCep("");
      } catch (cause) {
        if (!controller.signal.aborted) {
          setMensagemCep("Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.");
        }
      } finally {
        if (!controller.signal.aborted) setBuscandoCep(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [cepNumeros, etapa]);

  const capturarErro = (cause: unknown) => {
    if (cause instanceof ApiError) {
      const lista = cause.mensagens.length ? cause.mensagens : [cause.message];
      const campos = [...Object.keys(gestor), ...Object.keys(empresa), ...Object.keys(endereco), "cnpj", "token"];
      const proximos: Erros = {};
      for (const texto of lista) {
        const campo = campos.find((item) => new RegExp(item.replace(/([A-Z])/g, " $1"), "i").test(texto));
        if (campo) proximos[campo === "token" ? "codigo" : campo] = texto;
      }
      setErros(proximos);
      setMensagem(cause.status === 401
        ? "Sua sessão expirou ou não foi autorizada. Entre novamente e tente outra vez."
        : cause.status === 403
          ? "Sua conta não tem autorização para concluir esta etapa. Procure um administrador ou o suporte do ACTA."
          : cause.status === 0 || cause.status >= 500
            ? "O serviço de autenticação está indisponível no momento. Tente novamente em alguns minutos."
            : lista.join(" "));
    } else setMensagem("Não foi possível conectar ao serviço de autenticação. Verifique sua conexão e tente novamente.");
  };
  const seguir = (resultado: ResultadoOnboarding) => {
    if (resultado.empresaExistente && resultado.statusEmpresa === "ATIVO") {
      setEtapa("convite");
      setMensagem(resultado.mensagem || "Esta empresa já está ativa. Peça a um administrador da empresa para convidar você. O convite ainda não foi enviado.");
    } else if (resultado.empresaExistente && resultado.statusEmpresa === "PENDENTE") {
      setEtapa("espera");
      setMensagem(resultado.mensagem || "Esta empresa já possui um cadastro pendente. Não é possível avançar por esse cadastro. Procure o suporte do ACTA.");
    } else if (resultado.proximaEtapa && !resultado.empresaExistente) {
      setEtapa("empresa"); setMensagem(resultado.mensagem ?? "");
    } else setMensagem("Não foi possível confirmar seu cadastro. Tente novamente ou procure o suporte.");
  };
  const confirmarPerfilAtivo = async () => {
    if (enviando) return false;
    setEnviando(true);
    try {
    const perfil = await getCurrentActaUser();
    if (perfil.estadoPerfil === "PERFIL_CRIADO" && perfil.status === "ATIVO") {
      await refreshActaUser();
      navigate("/", { replace: true });
      return true;
    }
    setEtapa("espera");
    setMensagem("Ainda não foi possível confirmar se seu perfil está ativo. Verifique novamente ou volte ao formulário para tentar de novo.");
    return false;
    } catch (cause) {
      capturarErro(cause);
      return false;
    } finally { setEnviando(false); }
  };
  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    if (enviando || !emailVerificado) return;
    setMensagem("");
    if (etapa === "gestor") { const proximosErros = validarGestor(gestor, empresa.cnpj, firebaseUser?.email ?? ""); setErros(proximosErros); if (Object.keys(proximosErros).length) return; }
    if (etapa === "empresa") { const proximosErros = validarEmpresa(empresa); setErros(proximosErros); if (Object.keys(proximosErros).length) return; }
    if (etapa === "endereco") { const proximosErros = validarEndereco(endereco); setErros(proximosErros); if (Object.keys(proximosErros).length) return; }
    if (etapa === "empresa") { setEtapa("endereco"); setMensagem(""); setErros({}); return; }
    setEnviando(true); setErros({});
    try {
      if (etapa === "gestor") { setUltimaEtapaFormulario("gestor"); seguir(await iniciarOnboarding({ ...gestor, cpf: digitos(gestor.cpf), email: firebaseUser?.email ?? "" }, digitos(empresa.cnpj))); }
      if (etapa === "endereco") {
        setUltimaEtapaFormulario("empresa");
        const resultado = await cadastrarGestor(
          { ...gestor, cpf: digitos(gestor.cpf), email: firebaseUser?.email ?? "" },
          { ...empresa, cnpj: digitos(empresa.cnpj), telefoneEmpresa: digitos(empresa.telefoneEmpresa), emailEmpresa: empresa.emailEmpresa.trim() },
          { ...endereco, cep: digitos(endereco.cep), uf: endereco.uf.toUpperCase(), complemento: endereco.complemento?.trim() || null },
        );
        const perfil = await getCurrentActaUser();
        if (perfil.estadoPerfil !== "PERFIL_CRIADO" || perfil.status !== "ATIVO") {
          setEtapa("espera");
          setMensagem(resultado.mensagem || "Seu cadastro foi enviado, mas ainda não foi possível confirmar se o perfil está ativo. Verifique a situação ou volte ao formulário para tentar novamente.");
          return;
        }
        await refreshActaUser();
        navigate("/", { replace: true });
      }
    } catch (cause) { capturarErro(cause); } finally { setEnviando(false); }
  };
  const confirmarEmail = async () => { if (!firebaseUser) return; setVerificando(true); try { await atualizarUsuarioFirebase(firebaseUser); if (!firebaseUser.emailVerified) { setEmailVerificado(false); setMensagem("Seu e-mail ainda não foi confirmado. Abra o link que enviamos e tente novamente."); return; } await renovarTokenFirebase(firebaseUser); setEmailVerificado(true); setMensagem(""); } catch { setMensagem("Não foi possível atualizar sua confirmação agora. Tente novamente."); } finally { setVerificando(false); } };
  const reenviarEmail = async () => { if (!firebaseUser) return; setReenviando(true); try { await enviarVerificacaoDeEmail(firebaseUser); setMensagem("Enviamos um novo link de verificação para seu e-mail."); } catch { setMensagem("Não foi possível reenviar o link agora."); } finally { setReenviando(false); } };
  const atualizarEmail = async (event: FormEvent) => {
    event.preventDefault();
    const email = novoEmail.trim();
    if (!firebaseUser || !emailValido(email) || email.length > 254) {
      setMensagem("Informe um e-mail válido de até 254 caracteres.");
      return;
    }
    if (email.toLowerCase() === firebaseUser.email?.toLowerCase()) {
      setMensagem("Informe um endereço diferente do e-mail atual.");
      return;
    }
    setAtualizandoEmail(true);
    setMensagem("");
    try {
      await solicitarTrocaDeEmail(firebaseUser, email);
      setTrocandoEmail(false);
      setNovoEmail("");
      setEmailVerificado(false);
      setMensagem(`Enviamos um link para ${email}. Confirme o novo endereço para continuar.`);
    } catch (cause) {
      setMensagem(cause instanceof Error && cause.message.includes("requires-recent-login")
        ? "Por segurança, saia da sua conta e entre novamente antes de trocar o e-mail."
        : "Não foi possível trocar o e-mail agora. Confira o endereço e tente novamente.");
    } finally {
      setAtualizandoEmail(false);
    }
  };
  const campo = (id: string, label: string, value: string, change: (value: string) => void, options: { type?: string; max?: number; maxDate?: string; readOnly?: boolean; required?: boolean } = {}) => <label htmlFor={`dad-pages-empresas-paginaonboarding-index-${String(id)}`} className="onboarding-campo" key={id}>{label}<input id={`dad-pages-empresas-paginaonboarding-index-${String(id)}`} aria-invalid={Boolean(erros[id])} aria-describedby={erros[id] ? `${id}-erro` : undefined} type={options.type ?? "text"} maxLength={options.max} max={options.maxDate} readOnly={options.readOnly} required={options.required !== false} value={value} onChange={(e) => change(e.target.value)} />{erros[id] && <small id={`${id}-erro`}>{erros[id]}</small>}</label>;
  const titulo = etapa === "gestor" ? "Comece o cadastro" : etapa === "empresa" ? "Dados da empresa" : etapa === "endereco" ? "Endereço" : etapa === "convite" ? "Acesso à empresa" : "Cadastro não concluído";
  const descricao = etapa === "gestor" ? "Informe seus dados e o CNPJ para iniciar." : etapa === "empresa" ? "Complete os dados da empresa." : etapa === "endereco" ? "Informe o endereço da empresa." : etapa === "convite" ? "Peça a um administrador da empresa para enviar seu convite. Depois, siga as instruções recebidas para ativar o acesso." : "Não foi possível concluir o onboarding. Confira a situação ou procure o suporte do ACTA.";
  return <main className="onboarding"><section className="onboarding-card" aria-labelledby="titulo-onboarding"><PainelMarca /><div className="onboarding-conteudo"><header className="onboarding-cabecalho"><h1 id="titulo-onboarding">{titulo}</h1><p>{descricao}</p></header>
    {(etapa === "gestor" || etapa === "empresa" || etapa === "endereco") && <div className="onboarding-progresso" role="group" aria-label={`Etapa ${etapa === "gestor" ? 1 : etapa === "empresa" ? 2 : 3} de 3`}><span className={etapa === "gestor" ? "ativo" : "concluido"} aria-label="Etapa 1: dados do gestor" /><span className={etapa === "empresa" ? "ativo" : etapa === "endereco" ? "concluido" : ""} aria-label="Etapa 2: dados da empresa" /><span className={etapa === "endereco" ? "ativo" : ""} aria-label="Etapa 3: endereço" /></div>}
    {!emailVerificado && <div className="onboarding-aviso" role="alert"><strong>Confirme seu e-mail para continuar.</strong><p>Enviamos um link para {firebaseUser?.email}. Abra a mensagem, confirme seu e-mail e volte aqui.</p><button type="button" disabled={verificando} onClick={() => void confirmarEmail()}>{verificando ? "Verificando…" : "Já confirmei meu e-mail"}</button><button type="button" disabled={reenviando} onClick={() => void reenviarEmail()}>{reenviando ? "Enviando…" : "Reenviar link"}</button><button type="button" onClick={() => { setTrocandoEmail((aberto) => !aberto); setMensagem(""); setNovoEmail(""); }}>{trocandoEmail ? "Cancelar troca" : "Trocar e-mail"}</button>{trocandoEmail && <form className="onboarding-troca-email" onSubmit={(e) => void atualizarEmail(e)}><label className="onboarding-campo" htmlFor="novo-email">Novo e-mail<input id="novo-email" type="email" autoComplete="email" maxLength={254} required value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} /></label><button type="submit" disabled={atualizandoEmail}>{atualizandoEmail ? "Enviando…" : "Enviar confirmação"}</button></form>}</div>}
    {mensagem && <p className="onboarding-mensagem" role="alert">{mensagem}</p>}
    {etapa === "espera" || etapa === "convite" ? <div className="onboarding-acoes">{etapa === "espera" && <button type="button" disabled={enviando} onClick={() => { setEtapa(ultimaEtapaFormulario); setMensagem(""); }}>{"Voltar ao formulário"}</button>}<button type="button" disabled={enviando} onClick={() => void confirmarPerfilAtivo()}>{enviando ? "Consultando…" : "Consultar situação"}</button><button type="button" onClick={() => void logout()}>Sair</button></div> : <form onSubmit={(e) => void enviar(e)} noValidate>
      {etapa === "gestor" && <><h2>Gestor</h2><div className="onboarding-grade">{campo("cpf", "CPF", gestor.cpf, v => setGestor({ ...gestor, cpf: mascaraCpf(v) }), { max: 14 })}{campo("nome", "Nome completo", gestor.nome, v => setGestor({ ...gestor, nome: v }), { max: 160 })}{campo("cargo", "Cargo", gestor.cargo, v => setGestor({ ...gestor, cargo: v }), { max: 100 })}{campo("area", "Área", gestor.area, v => setGestor({ ...gestor, area: v }), { max: 100 })}{campo("dataNascimento", "Data de nascimento", gestor.dataNascimento, v => setGestor({ ...gestor, dataNascimento: v }), { type: "date", maxDate: ontemLocal() })}{campo("dataContratacao", "Data de contratação", gestor.dataContratacao, v => setGestor({ ...gestor, dataContratacao: v }), { type: "date", maxDate: hojeLocal() })}{campo("email", "E-mail do gestor", firebaseUser?.email ?? "", () => {}, { type: "email", max: 254, readOnly: true })}{campo("cnpj", "CNPJ da empresa", empresa.cnpj, v => setEmpresa({ ...empresa, cnpj: mascaraCnpj(v) }), { max: 18 })}</div></>}
    {etapa === "empresa" && <><h2>Empresa</h2><div className="onboarding-grade">{campo("cnpj", "CNPJ", empresa.cnpj, v => setEmpresa({ ...empresa, cnpj: mascaraCnpj(v) }), { max: 18 })}{campo("nome", "Nome da empresa", empresa.nome, v => setEmpresa({ ...empresa, nome: v }), { max: 160 })}<label htmlFor="dad-pages-empresas-paginaonboarding-index-272-290" className="onboarding-campo">Porte<select id="dad-pages-empresas-paginaonboarding-index-272-290" value={empresa.tamanhoEmpresa} onChange={e => setEmpresa({ ...empresa, tamanhoEmpresa: e.target.value as Empresa["tamanhoEmpresa"] })}><option value="PEQUENA">Pequena</option><option value="MEDIA">Média</option><option value="GRANDE">Grande</option></select></label>{campo("setorEmpresa", "Setor", empresa.setorEmpresa, v => setEmpresa({ ...empresa, setorEmpresa: v }), { max: 100 })}{campo("emailEmpresa", "E-mail da empresa", empresa.emailEmpresa, v => setEmpresa({ ...empresa, emailEmpresa: v }), { type: "email", max: 254 })}{campo("telefoneEmpresa", "Telefone", empresa.telefoneEmpresa, v => setEmpresa({ ...empresa, telefoneEmpresa: mascaraTelefone(v) }), { max: 15 })}</div></>}
    {etapa === "endereco" && <><h2>Endereço</h2><div className="onboarding-grade"><label className="onboarding-campo" htmlFor="cep">CEP<input id="cep" name="cep" type="text" inputMode="numeric" autoComplete="postal-code" maxLength={9} placeholder="00000-000" value={endereco.cep} aria-describedby="cep-ajuda" onChange={e => { const cep = mascaraCep(e.target.value); setEndereco(atual => ({ ...atual, cep, ...(digitos(cep) !== cepNumeros ? { uf: "", cidade: "", bairro: "", logradouro: "" } : {}) })); setCamposViaCep({}); setMensagemCep(""); }} />{erros.cep && <small>{erros.cep}</small>}</label>{(buscandoCep || mensagemCep) && (buscandoCep ? <CarregandoConteudo compacto mensagem="Buscando endereço pelo CEP" /> : <p className="onboarding-cep-status" id="cep-ajuda" role="status" aria-live="polite">{mensagemCep}</p>)}{([ ["uf","UF",2], ["cidade","Cidade",100], ["bairro","Bairro",100], ["logradouro","Logradouro",180], ["numeroEndereco","Número",20], ["complemento","Complemento",1000] ] as const).map(([key,label,max]) => campo(key,label,endereco[key] ?? "",v => setEndereco(atual => ({ ...atual, [key]: v })),{ max, readOnly: key in camposViaCep && camposViaCep[key as CampoEndereco], required: key !== "complemento" }))}</div></>}      <div className="onboarding-acoes">{etapa === "empresa" && <button type="button" disabled={enviando} onClick={() => { setEtapa("gestor"); setMensagem(""); }}>Voltar</button>}{etapa === "endereco" && <button type="button" disabled={enviando} onClick={() => { setEtapa("empresa"); setMensagem(""); }}>Voltar</button>}<button type="submit" disabled={enviando || !emailVerificado}>{enviando ? "Enviando…" : etapa === "gestor" || etapa === "empresa" ? "Continuar" : "Enviar cadastro"}</button></div></form>}
  </div></section></main>;
}

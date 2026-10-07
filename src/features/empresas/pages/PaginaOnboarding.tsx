import { useEffect, useState, type FormEvent } from "react";
import { reload, sendEmailVerification, verifyBeforeUpdateEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { ApiError } from "../../../services/http/client";
import { getCurrentActaUser } from "../../../services/api/pg/auth.api";
import { cadastrarGestor, iniciarOnboarding, type Empresa, type Endereco, type Gestor, type ResultadoOnboarding } from "../../../services/api/pg/onboarding.api";
import { buscarEnderecoPorCep } from "../../../services/api/viacep.api";
import { PainelMarca } from "../../auth/components/PainelMarca";
import "../styles/onboarding.css";

type Etapa = "gestor" | "empresa" | "endereco" | "convite" | "espera";
type Erros = Record<string, string>;
type CampoEndereco = "uf" | "cidade" | "bairro" | "logradouro";
const digitos = (value: string) => value.replace(/\D/g, "");
const mascara = (value: string, grupos: number[]) => {
  const numeros = digitos(value).slice(0, grupos.reduce((a, b) => a + b, 0));
  let indice = 0;
  return grupos.map((tamanho, i) => { const trecho = numeros.slice(indice, indice + tamanho); indice += tamanho; return trecho ? `${i ? (grupos.length === 4 && i === 3 ? "-" : grupos.length === 3 && i === 2 ? "-" : ".") : ""}${trecho}` : ""; }).join("");
};
const mascaraCpf = (v: string) => mascara(v, [3,3,3,2]);
const mascaraCnpj = (v: string) => digitos(v).slice(0,14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2").replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
const mascaraCep = (v: string) => digitos(v).slice(0,8).replace(/^(\d{5})(\d)/, "$1-$2");
const mascaraTelefone = (v: string) => { const d = digitos(v).slice(0,11); return d.length <= 10 ? d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2") : d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2"); };
const emailValido = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const hojeLocal = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};
const ontemLocal = () => {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const ano = ontem.getFullYear();
  const mes = String(ontem.getMonth() + 1).padStart(2, "0");
  const dia = String(ontem.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};
const estados = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
function documentoValido(value: string, tamanho: number) {
  const d = digitos(value);
  if (d.length !== tamanho || /^(\d)\1+$/.test(d)) return false;
  const calcular = (base: string, pesos: number[]) => {
    const resto = base.split("").reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  if (tamanho === 11) return Number(d[9]) === calcular(d.slice(0, 9), [10,9,8,7,6,5,4,3,2]) && Number(d[10]) === calcular(d.slice(0, 10), [11,10,9,8,7,6,5,4,3,2]);
  return Number(d[12]) === calcular(d.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]) && Number(d[13]) === calcular(d.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
}
function dataValida(value: string, passado: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && (passado ? value < hojeLocal() : value <= hojeLocal());
}
const gestorInicial: Gestor = { cpf: "", nome: "", cargo: "", area: "", dataNascimento: "", dataContratacao: "", email: "" };
const empresaInicial: Empresa = { cnpj: "", nome: "", tamanhoEmpresa: "PEQUENA", setorEmpresa: "", emailEmpresa: "", telefoneEmpresa: "" };
const enderecoInicial: Endereco = { cep: "", uf: "", cidade: "", bairro: "", logradouro: "", numeroEndereco: "", complemento: null };

export function PaginaOnboarding({ pendente = false }: { pendente?: boolean }) {
  const { firebaseUser, refreshActaUser, logout } = useAuth();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>(pendente ? "espera" : "gestor");
  const [ultimaEtapaFormulario, setUltimaEtapaFormulario] = useState<"gestor" | "empresa">(pendente ? "gestor" : "gestor");
  const [gestor, setGestor] = useState<Gestor>({ ...gestorInicial, email: firebaseUser?.email ?? "" });
  const [empresa, setEmpresa] = useState<Empresa>(empresaInicial);
  const [endereco, setEndereco] = useState<Endereco>(enderecoInicial);
  const [erros, setErros] = useState<Erros>({});
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [trocandoEmail, setTrocandoEmail] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [atualizandoEmail, setAtualizandoEmail] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(Boolean(firebaseUser?.emailVerified));
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [mensagemCep, setMensagemCep] = useState("");
  const [camposViaCep, setCamposViaCep] = useState<Partial<Record<CampoEndereco, boolean>>>({});
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
      setMensagem(lista.join(" "));
    } else setMensagem("Não foi possível concluir a solicitação. Tente novamente.");
  };
  const seguir = (resultado: ResultadoOnboarding) => {
    if (resultado.empresaExistente && resultado.statusEmpresa === "ATIVO") {
      setEtapa("convite");
      setMensagem("Esta empresa já está ativa. Verifique a caixa de entrada e o spam do e-mail informado para receber o convite e concluir a ativação.");
    } else if (resultado.empresaExistente && resultado.statusEmpresa === "PENDENTE") {
      setEtapa("espera");
      setMensagem("Esta empresa já possui um cadastro pendente. Não é possível avançar por esse cadastro. Procure o suporte do ACTA.");
    } else if (resultado.proximaEtapa && !resultado.empresaExistente) {
      setEtapa("empresa"); setMensagem("");
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
  const validarGestor = () => {
    const e: Erros = {};
    if (!documentoValido(gestor.cpf, 11)) e.cpf = "Informe um CPF válido.";
    for (const [key, limit] of [["nome",160],["cargo",100],["area",100]] as const) if (!gestor[key].trim() || gestor[key].length > limit) e[key] = `Campo obrigatório, até ${limit} caracteres.`;
    if (!dataValida(gestor.dataNascimento, true)) e.dataNascimento = "Informe uma data de nascimento passada.";
    if (!dataValida(gestor.dataContratacao, false)) e.dataContratacao = "A contratação deve ser hoje ou anterior.";
    if (!emailValido(firebaseUser?.email ?? "") || (firebaseUser?.email?.length ?? 0) > 254) e.email = "Informe um endereço de e-mail válido para sua conta.";
    if (!documentoValido(empresa.cnpj, 14)) e.cnpj = "Informe um CNPJ válido.";
    setErros(e); return Object.keys(e).length === 0;
  };
  const validarEmpresa = () => {
    const e: Erros = {};
    if (!documentoValido(empresa.cnpj, 14)) e.cnpj = "Informe um CNPJ válido.";
    for (const [key, limit] of [["nome",160],["setorEmpresa",100]] as const) if (!empresa[key].trim() || empresa[key].length > limit) e[key] = `Campo obrigatório, até ${limit} caracteres.`;
    if (!emailValido(empresa.emailEmpresa) || empresa.emailEmpresa.length > 254) e.emailEmpresa = "Informe um e-mail válido de até 254 caracteres.";
    if (![10,11].includes(digitos(empresa.telefoneEmpresa).length)) e.telefoneEmpresa = "Informe 10 ou 11 dígitos.";
    setErros(e); return Object.keys(e).length === 0;
  };
  const validarEndereco = () => {
    const e: Erros = {};
    for (const [key, limit] of [["cidade",100],["bairro",100],["logradouro",180],["numeroEndereco",20]] as const) {
      if (!endereco[key].trim() || endereco[key].length > limit) e[key] = `Campo obrigatório, até ${limit} caracteres.`;
    }
    if (digitos(endereco.cep).length !== 8) e.cep = "Informe 8 dígitos.";
    if (!estados.has(endereco.uf.toUpperCase())) e.uf = "Informe uma sigla de estado válida.";
    if ((endereco.complemento?.length ?? 0) > 1000) e.complemento = "Máximo de 1000 caracteres.";
    setErros(e); return Object.keys(e).length === 0;
  };
  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    if (enviando || !emailVerificado) return;
    setMensagem(""); if (etapa === "gestor" && !validarGestor()) return;
    if (etapa === "empresa" && !validarEmpresa()) return;
    if (etapa === "endereco" && !validarEndereco()) return;
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
        if (resultado.statusEmpresa !== "ATIVO" || resultado.statusUsuario !== "ATIVO" || resultado.conviteEnviado || resultado.proximaEtapa) {
          setEtapa("espera");
          setMensagem("Ainda não foi possível confirmar a ativação do cadastro. Confira a situação ou volte ao formulário para tentar novamente.");
          return;
        }
        const perfil = await getCurrentActaUser();
        if (perfil.estadoPerfil !== "PERFIL_CRIADO" || perfil.status !== "ATIVO") {
          setEtapa("espera");
          setMensagem("Seu cadastro foi enviado, mas ainda não foi possível confirmar se o perfil está ativo. Verifique a situação ou volte ao formulário para tentar novamente.");
          return;
        }
        await refreshActaUser();
        navigate("/", { replace: true });
      }
    } catch (cause) { capturarErro(cause); } finally { setEnviando(false); }
  };
  const confirmarEmail = async () => { if (!firebaseUser) return; setVerificando(true); try { await reload(firebaseUser); if (!firebaseUser.emailVerified) { setEmailVerificado(false); setMensagem("Seu e-mail ainda não foi confirmado. Abra o link que enviamos e tente novamente."); return; } await firebaseUser.getIdTokenResult(true); setEmailVerificado(true); setMensagem(""); } catch { setMensagem("Não foi possível atualizar sua confirmação agora. Tente novamente."); } finally { setVerificando(false); } };
  const reenviarEmail = async () => { if (!firebaseUser) return; setReenviando(true); try { await sendEmailVerification(firebaseUser); setMensagem("Enviamos um novo link de verificação para seu e-mail."); } catch { setMensagem("Não foi possível reenviar o link agora."); } finally { setReenviando(false); } };
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
      await verifyBeforeUpdateEmail(firebaseUser, email);
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
  const campo = (id: string, label: string, value: string, change: (value: string) => void, options: { type?: string; max?: number; maxDate?: string; readOnly?: boolean; required?: boolean } = {}) => <label className="onboarding-campo" key={id}>{label}<input aria-invalid={Boolean(erros[id])} aria-describedby={erros[id] ? `${id}-erro` : undefined} type={options.type ?? "text"} maxLength={options.max} max={options.maxDate} readOnly={options.readOnly} required={options.required !== false} value={value} onChange={(e) => change(e.target.value)} />{erros[id] && <small id={`${id}-erro`}>{erros[id]}</small>}</label>;
  const titulo = etapa === "gestor" ? "Comece o cadastro" : etapa === "empresa" ? "Dados da empresa" : etapa === "endereco" ? "Endereço" : etapa === "convite" ? "Convite enviado" : "Cadastro não concluído";
  const descricao = etapa === "gestor" ? "Informe seus dados e o CNPJ para iniciar." : etapa === "empresa" ? "Complete os dados da empresa." : etapa === "endereco" ? "Informe o endereço da empresa." : etapa === "convite" ? "Aguarde o convite enviado para o e-mail da sua conta e siga as instruções recebidas para ativar o acesso." : "Não foi possível concluir o onboarding. Confira a situação ou procure o suporte do ACTA.";
  return <main className="onboarding"><section className="onboarding-card" aria-labelledby="titulo-onboarding"><PainelMarca /><div className="onboarding-conteudo"><header className="onboarding-cabecalho"><h1 id="titulo-onboarding">{titulo}</h1><p>{descricao}</p></header>
    {(etapa === "gestor" || etapa === "empresa" || etapa === "endereco") && <div className="onboarding-progresso" role="group" aria-label={`Etapa ${etapa === "gestor" ? 1 : etapa === "empresa" ? 2 : 3} de 3`}><span className={etapa === "gestor" ? "ativo" : "concluido"} aria-label="Etapa 1: dados do gestor" /><span className={etapa === "empresa" ? "ativo" : etapa === "endereco" ? "concluido" : ""} aria-label="Etapa 2: dados da empresa" /><span className={etapa === "endereco" ? "ativo" : ""} aria-label="Etapa 3: endereço" /></div>}
    {!emailVerificado && <div className="onboarding-aviso" role="alert"><strong>Confirme seu e-mail para continuar.</strong><p>Enviamos um link para {firebaseUser?.email}. Abra a mensagem, confirme seu e-mail e volte aqui.</p><button type="button" disabled={verificando} onClick={() => void confirmarEmail()}>{verificando ? "Verificando…" : "Já confirmei meu e-mail"}</button><button type="button" disabled={reenviando} onClick={() => void reenviarEmail()}>{reenviando ? "Enviando…" : "Reenviar link"}</button><button type="button" onClick={() => { setTrocandoEmail((aberto) => !aberto); setMensagem(""); setNovoEmail(""); }}>{trocandoEmail ? "Cancelar troca" : "Trocar e-mail"}</button>{trocandoEmail && <form className="onboarding-troca-email" onSubmit={(e) => void atualizarEmail(e)}><label className="onboarding-campo" htmlFor="novo-email">Novo e-mail<input id="novo-email" type="email" autoComplete="email" maxLength={254} required value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} /></label><button type="submit" disabled={atualizandoEmail}>{atualizandoEmail ? "Enviando…" : "Enviar confirmação"}</button></form>}</div>}
    {mensagem && <p className="onboarding-mensagem" role="alert">{mensagem}</p>}
    {etapa === "espera" || etapa === "convite" ? <div className="onboarding-acoes">{etapa === "espera" && <button type="button" disabled={enviando} onClick={() => { setEtapa(ultimaEtapaFormulario); setMensagem(""); }}>{"Voltar ao formulário"}</button>}<button type="button" disabled={enviando} onClick={() => void confirmarPerfilAtivo()}>{enviando ? "Consultando…" : "Consultar situação"}</button><button type="button" onClick={() => void logout()}>Sair</button></div> : <form onSubmit={(e) => void enviar(e)} noValidate>
      {etapa === "gestor" && <><h2>Gestor</h2><div className="onboarding-grade">{campo("cpf", "CPF", gestor.cpf, v => setGestor({ ...gestor, cpf: mascaraCpf(v) }), { max: 14 })}{campo("nome", "Nome completo", gestor.nome, v => setGestor({ ...gestor, nome: v }), { max: 160 })}{campo("cargo", "Cargo", gestor.cargo, v => setGestor({ ...gestor, cargo: v }), { max: 100 })}{campo("area", "Área", gestor.area, v => setGestor({ ...gestor, area: v }), { max: 100 })}{campo("dataNascimento", "Data de nascimento", gestor.dataNascimento, v => setGestor({ ...gestor, dataNascimento: v }), { type: "date", maxDate: ontemLocal() })}{campo("dataContratacao", "Data de contratação", gestor.dataContratacao, v => setGestor({ ...gestor, dataContratacao: v }), { type: "date", maxDate: hojeLocal() })}{campo("email", "E-mail do gestor", firebaseUser?.email ?? "", () => {}, { type: "email", max: 254, readOnly: true })}{campo("cnpj", "CNPJ da empresa", empresa.cnpj, v => setEmpresa({ ...empresa, cnpj: mascaraCnpj(v) }), { max: 18 })}</div></>}
    {etapa === "empresa" && <><h2>Empresa</h2><div className="onboarding-grade">{campo("cnpj", "CNPJ", empresa.cnpj, v => setEmpresa({ ...empresa, cnpj: mascaraCnpj(v) }), { max: 18 })}{campo("nome", "Nome da empresa", empresa.nome, v => setEmpresa({ ...empresa, nome: v }), { max: 160 })}<label className="onboarding-campo">Porte<select value={empresa.tamanhoEmpresa} onChange={e => setEmpresa({ ...empresa, tamanhoEmpresa: e.target.value as Empresa["tamanhoEmpresa"] })}><option value="PEQUENA">Pequena</option><option value="MEDIA">Média</option><option value="GRANDE">Grande</option></select></label>{campo("setorEmpresa", "Setor", empresa.setorEmpresa, v => setEmpresa({ ...empresa, setorEmpresa: v }), { max: 100 })}{campo("emailEmpresa", "E-mail da empresa", empresa.emailEmpresa, v => setEmpresa({ ...empresa, emailEmpresa: v }), { type: "email", max: 254 })}{campo("telefoneEmpresa", "Telefone", empresa.telefoneEmpresa, v => setEmpresa({ ...empresa, telefoneEmpresa: mascaraTelefone(v) }), { max: 15 })}</div></>}
    {etapa === "endereco" && <><h2>Endereço</h2><div className="onboarding-grade"><label className="onboarding-campo" htmlFor="cep">CEP<input id="cep" name="cep" type="text" inputMode="numeric" autoComplete="postal-code" maxLength={9} placeholder="00000-000" value={endereco.cep} aria-describedby="cep-ajuda" onChange={e => { const cep = mascaraCep(e.target.value); setEndereco(atual => ({ ...atual, cep, ...(digitos(cep) !== cepNumeros ? { uf: "", cidade: "", bairro: "", logradouro: "" } : {}) })); setCamposViaCep({}); setMensagemCep(""); }} />{erros.cep && <small>{erros.cep}</small>}</label>{(buscandoCep || mensagemCep) && <p className="onboarding-cep-status" id="cep-ajuda" role="status" aria-live="polite">{buscandoCep ? "Buscando endereço pelo CEP…" : mensagemCep}</p>}{([ ["uf","UF",2], ["cidade","Cidade",100], ["bairro","Bairro",100], ["logradouro","Logradouro",180], ["numeroEndereco","Número",20], ["complemento","Complemento",1000] ] as const).map(([key,label,max]) => campo(key,label,endereco[key] ?? "",v => setEndereco(atual => ({ ...atual, [key]: v })),{ max, readOnly: key in camposViaCep && camposViaCep[key as CampoEndereco], required: key !== "complemento" }))}</div></>}      <div className="onboarding-acoes">{etapa === "empresa" && <button type="button" disabled={enviando} onClick={() => { setEtapa("gestor"); setMensagem(""); }}>Voltar</button>}{etapa === "endereco" && <button type="button" disabled={enviando} onClick={() => { setEtapa("empresa"); setMensagem(""); }}>Voltar</button>}<button type="submit" disabled={enviando || !emailVerificado}>{enviando ? "Enviando…" : etapa === "gestor" || etapa === "empresa" ? "Continuar" : "Enviar cadastro"}</button></div></form>}
  </div></section></main>;
}
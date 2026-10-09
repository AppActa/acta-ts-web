import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useAuth } from "../../../auth/AuthProvider";
import { auth } from "../../../lib/firebase";
import { CampoLogin } from "../components/CampoLogin";
import { PainelMarca } from "../components/PainelMarca";
import "../styles/pagina-login.css";

export function PaginaCadastroConta() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  if (firebaseUser) return <Navigate to="/onboarding" replace />;

  const cadastrar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enviando) return;
    const dados = new FormData(event.currentTarget);
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("password") ?? "");
    const confirmacao = String(dados.get("confirmation") ?? "");
    if (senha !== confirmacao) { setErro("As senhas precisam ser iguais."); return; }
    setErro(""); setEnviando(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, senha);
      window.localStorage.setItem(`acta:onboarding:${user.uid}`, "pending");
      try { await sendEmailVerification(user); } catch { /* O onboarding pode reenviar a confirmação. */ }
      navigate("/onboarding", { replace: true });
    } catch (cause) {
      setErro(cause instanceof FirebaseError && cause.code === "auth/email-already-in-use" ? "Este e-mail já tem conta. Entre com sua senha." : cause instanceof FirebaseError && cause.code === "auth/weak-password" ? "Escolha uma senha mais forte." : cause instanceof FirebaseError && cause.code === "auth/invalid-email" ? "Informe um e-mail válido." : "Não foi possível criar sua conta. Tente novamente.");
    } finally { setEnviando(false); }
  };

  return <main className="pagina-login"><section className="layout-login" aria-labelledby="titulo-cadastro"><PainelMarca /><div className="conteudo-login"><div className="cabecalho-login"><h1 id="titulo-cadastro">Criar conta</h1><p>Crie sua conta para cadastrar uma empresa ou solicitar acesso como gestor.</p>{erro && <p className="cabecalho-login_erro" role="alert">{erro}</p>}</div><form className="formulario-login" onSubmit={(e) => void cadastrar(e)}><CampoLogin id="email-cadastro" label="E-mail" name="email" type="email" autoComplete="email" /><CampoLogin id="senha-cadastro" label="Senha" name="password" type="password" autoComplete="new-password" /><CampoLogin id="confirmar-senha" label="Confirme a senha" name="confirmation" type="password" autoComplete="new-password" bloquearColagem /><button className="formulario-login_botao" type="submit" disabled={enviando}>{enviando ? "Criando conta…" : "Criar conta e continuar"}</button></form><Link className="esqueci-senha" to="/login">Já tenho uma conta</Link></div></section></main>;
}
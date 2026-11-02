import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  verifyBeforeUpdateEmail,
  type IdTokenResult,
  type Unsubscribe,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";

export function observarUsuarioFirebase(aoAlterar: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, aoAlterar);
}

export async function entrarComEmail(email: string, senha: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, senha);
}

export async function entrarComGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function sairDaContaFirebase(): Promise<void> {
  return signOut(auth);
}

export async function criarContaFirebase(email: string, senha: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export async function enviarVerificacaoDeEmail(user: User): Promise<void> {
  return sendEmailVerification(user);
}

export async function solicitarRedefinicaoDeSenha(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (cause) {
    if (!(cause instanceof FirebaseError) || cause.code !== "auth/user-not-found") throw cause;
  }
}

export async function atualizarUsuarioFirebase(user: User): Promise<void> {
  return reload(user);
}

export async function renovarTokenFirebase(user: User): Promise<IdTokenResult> {
  return user.getIdTokenResult(true);
}

export async function solicitarTrocaDeEmail(user: User, email: string): Promise<void> {
  return verifyBeforeUpdateEmail(user, email);
}

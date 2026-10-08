type PropriedadesCampoLogin = {
  autoComplete: string;
  id: string;
  label: string;
  name: string;
  type: "email" | "password";
  bloquearColagem?: boolean;
};

export function CampoLogin({
  autoComplete,
  id,
  label,
  name,
  type,
  bloquearColagem = false,
}: PropriedadesCampoLogin) {
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  return (
    <>
      <label htmlFor={id}>{label}</label>
      {type === "password" ? (
        <div className="campo-login-senha">
          <input id={id} name={name} type={mostrarSenha ? "text" : "password"} autoComplete={autoComplete} required
            onPaste={bloquearColagem ? (event) => event.preventDefault() : undefined}/>
          <button
            type="button" className="campo-login-senha_botao"
            onClick={() => definirMostrarSenha((valor) => !valor)}
            aria-label={`${mostrarSenha ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`}
            aria-pressed={mostrarSenha}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {mostrarSenha ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 002.8 2.8" /><path d="M9.9 5.2A11 11 0 0112 5c5 0 9 4.5 10 7a12 12 0 01-3.1 4.5" /><path d="M6.2 6.2A12 12 0 002 12c1 2.5 5 7 10 7a10.8 10.8 0 004-.8" /></> : <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>}
            </svg>
          </button>
        </div>
      ) : (<input id={id} name={name} type={type} autoComplete={autoComplete}  required/>)}
    </>
  );
}
import { useState } from "react";
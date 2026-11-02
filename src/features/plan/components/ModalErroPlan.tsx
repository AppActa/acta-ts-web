import { useEffect, useId, useRef } from "react";
import triangulo from "../assets/aviso-triangulo.svg";
import exclamacao from "../assets/aviso-exclamacao.svg";
import "../styles/modal-erro-plan.css";

type PropriedadesModalErroPlan = { titulo: string; mensagem: string; aoFechar: () => void };

export function ModalErroPlan({ titulo, mensagem, aoFechar }: PropriedadesModalErroPlan) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const elemento = dialogo.current;
    if (elemento && !elemento.open) elemento.showModal();
    return () => { if (elemento?.open) elemento.close(); };
  }, []);
  return <dialog className="modal-erro-plan" ref={dialogo} aria-labelledby={`${id}-titulo`} aria-describedby={`${id}-mensagem`} onClose={aoFechar}>
    <div className="modal-erro-plan_icone" aria-hidden="true"><img src={triangulo} alt="" /><img src={exclamacao} alt="" /></div>
    <h2 id={`${id}-titulo`}>{titulo}</h2>
    <p id={`${id}-mensagem`}>{mensagem}</p>
    <button type="button" autoFocus onClick={() => dialogo.current?.close()}>Ok</button>
  </dialog>;
}

import type { MensagemErroLoginProps } from "../../../types/auth";

export function MensagemErroLogin({ mensagem }: MensagemErroLoginProps) {
  if (!mensagem) return null;

  return <p className="cabecalho-login_erro" role="alert">{mensagem}</p>;
}

type PropriedadesMensagemErro = {
  mensagem: string | null;
};
export function MensagemErroLogin({ mensagem }: PropriedadesMensagemErro) {
  if (!mensagem) return null;

  return <p className="cabecalho-login_erro" role="alert">{mensagem}</p>;
}
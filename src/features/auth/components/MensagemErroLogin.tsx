type PropriedadesMensagemErro = {
    visivel: boolean;
};
export function MensagemErroLogin({ visivel }: PropriedadesMensagemErro) {
    if (!visivel) return null;
    
    return (
        <p className="cabecalho-login_erro" role="alert">
            email/senha incorretos*
        </p>
    );
}


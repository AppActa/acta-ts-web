type PropriedadesModalEdicaoPerfil =
  | { tipo: "sucesso"; aoConfirmar: () => void; aoCancelar?: never }
  | { tipo: "confirmacao" | "saida"; aoConfirmar: () => void; aoCancelar: () => void };

export function ModalEdicaoPerfil({ aoCancelar, aoConfirmar, tipo }: PropriedadesModalEdicaoPerfil) {
  const sucesso = tipo === "sucesso";
  const saida = tipo === "saida";
  const aoFechar = sucesso ? aoConfirmar : aoCancelar;

  return (
    <div className="fundo-modal-edicao" role="presentation">
      <section
        className={`modal-edicao modal-edicao_${tipo}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`titulo-modal-${tipo}`}
        aria-describedby={`descricao-modal-${tipo}`}
      >
        <button className="modal-edicao_fechar" type="button" aria-label="Fechar" onClick={aoFechar}>
          ×
        </button>
        <span className={`modal-edicao_icone modal-edicao_icone-${tipo}`} aria-hidden="true" />

        <h2 id={`titulo-modal-${tipo}`}>
          {sucesso ? (
            <>Alterações de perfil salvas com<br />sucesso!</>
          ) : saida ? (
            <>Tem certeza que deseja sair do<br />perfil?</>
          ) : (
            <>Tem certeza que deseja sair<br />sem salvar suas alterações de<br />perfil?</>
          )}
        </h2>

        <p id={`descricao-modal-${tipo}`}>
          {sucesso
            ? "Confira suas alterações na sua página de perfil"
            : saida
              ? "Você sempre pode retornar à sua conta"
              : "Você vai perder suas alterações"}
        </p>

        {sucesso ? (
          <button className="botao-modal botao-modal_concluir" type="button" onClick={aoConfirmar}>
            Concluído
          </button>
        ) : (
          <div className="acoes-modal-edicao">
            <button className="botao-modal botao-modal_sim" type="button" onClick={aoConfirmar}>
              Sim
            </button>
            <button className="botao-modal botao-modal_nao" type="button" onClick={aoCancelar}>
              Não
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

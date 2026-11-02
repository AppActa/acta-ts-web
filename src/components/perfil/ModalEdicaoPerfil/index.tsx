import "../../../../features/perfil/styles/modal-edicao-perfil.css";
import { useEffect } from "react";
import type { ModalEdicaoPerfilProps } from "../../../types/perfil";
import { useDialogFocus } from "../../../utils/useDialogFocus";

export function ModalEdicaoPerfil({ aoCancelar, aoConfirmar, tipo, aguardando = false, mensagemErro }: ModalEdicaoPerfilProps) {
  const sucesso = tipo === "sucesso";
  const saida = tipo === "saida";
  const aoFechar = sucesso ? aoConfirmar : aoCancelar;
  const { dialogRef: dialogo, onKeyDown: conterFoco } = useDialogFocus<HTMLElement>({ onEscape: () => { if (!aguardando) aoFechar?.(); } });

  useEffect(() => {
    if (aguardando) dialogo.current?.querySelector<HTMLElement>('[role="status"]')?.focus();
    else if (mensagemErro) dialogo.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
  }, [aguardando, mensagemErro]);

  return (
    <div className="fundo-modal-edicao" role="presentation">
      <section
        className={`modal-edicao modal-edicao_${tipo}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`titulo-modal-${tipo}`}
        aria-describedby={`descricao-modal-${tipo}`}
        ref={dialogo}
        tabIndex={-1}
        onKeyDown={conterFoco}
      >
        <button className="modal-edicao_fechar" type="button" aria-label="Fechar" disabled={aguardando} onClick={aoFechar}>
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
        {aguardando && <p role="status" aria-live="polite" tabIndex={-1}>Encerrando sua sessão...</p>}
        {mensagemErro && <p role="alert" tabIndex={-1}>{mensagemErro}</p>}

        {sucesso ? (
          <button className="botao-modal botao-modal_concluir" type="button" onClick={aoConfirmar}>
            Concluído
          </button>
        ) : (
          <div className="acoes-modal-edicao">
            <button className="botao-modal botao-modal_sim" type="button" disabled={aguardando} onClick={aoConfirmar}>
              {aguardando && saida ? "Saindo..." : "Sim"}
            </button>
            <button className="botao-modal botao-modal_nao" type="button" disabled={aguardando} onClick={aoCancelar}>
              Não
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

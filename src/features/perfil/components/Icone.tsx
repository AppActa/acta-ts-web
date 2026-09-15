export type NomeIcone =
  | "acessibilidade"
  | "alto-contraste"
  | "equipe"
  | "notificacao"
  | "perfil"
  | "reproduzir"
  | "sair"
  | "som"
  | "sol"
  | "tarefa"
  | "tamanho-fonte"
  | "varinha"
  | "verificacao";

type PropriedadesIcone = {
  nome: NomeIcone;
  tamanho?: number;
};

export function Icone({ nome, tamanho = 28 }: PropriedadesIcone) {
  const caminhos: Record<NomeIcone, React.ReactNode> = {
    perfil: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    equipe: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><circle cx="17" cy="9" r="3" /><path d="M17 15a6 6 0 0 1 5 3" /></>,
    sol: <><circle cx="12" cy="12" r="5" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1" /></>,
    notificacao: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    "tamanho-fonte": <><path d="M4 19 10 5h4l6 14M7 14h10" /></>,
    "alto-contraste": <><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /></>,
    acessibilidade: <><circle cx="12" cy="4" r="2" /><path d="M5 8h14M12 6v15M8 21l4-8 4 8" /></>,
    som: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 8a6 6 0 0 1 0 8M19.5 5.5a10 10 0 0 1 0 13" /></>,
    tarefa: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="m8 11 2 2 5-5M8 17h8M8 2h8" /></>,
    reproduzir: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="m10 8 6 4-6 4z" /></>,
    verificacao: <><path d="M5 4h14v16H5zM8 2h8" /><path d="m8 12 2.5 2.5L16 9" /></>,
    varinha: <><path d="m4 20 10-10M14 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></>,
    sair: <><path d="M14 8V4H4v16h10v-4M10 12h11M17 8l4 4-4 4" /></>,
  };

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {caminhos[nome]}
    </svg>
  );
}

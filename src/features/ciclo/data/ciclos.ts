const ciclos = [
  { nome: "Redução do tempo de atendimento", inicio: "26/05/2026", prazo: "30/10/2026" },
  { nome: "Organização do estoque", inicio: "18/05/2026", prazo: "30/10/2026" },
  { nome: "Onboarding de novos colaboradores", inicio: "02/06/2026", prazo: "30/10/2026" },
  { nome: "Proteção de dados e acessos", inicio: "12/05/2026", prazo: "30/10/2026" },
  { nome: "Padronização de aprovações", inicio: "01/06/2026", prazo: "30/10/2026" },
];

export function obterCiclo(cicloId: string | undefined) {
  const indice = Number(cicloId);
  return ciclos[Number.isInteger(indice) && indice > 0 ? indice - 1 : 0] ?? ciclos[0];
}

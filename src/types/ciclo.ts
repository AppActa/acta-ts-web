import type { ReactNode } from "react";

export interface PainelCicloPlanDoProps {
  cicloId: string | undefined;
  etapaAtiva: "plan" | "do" | "check" | "act";
  exibirAvisoDemonstrativo?: boolean;
  children: ReactNode;
}

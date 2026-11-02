import { Sidebar } from "../Sidebar";
import type { LayoutSimplesProps } from "../../../types/layout";
import "../../../../features/layout/styles/layout-simples.css";

export function LayoutSimples({ children }: LayoutSimplesProps) {
  return (
    <div className="layout-simples">
      <Sidebar />
      <div className="layout-simples_painel">{children}</div>
    </div>
  );
}

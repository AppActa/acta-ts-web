import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import "../styles/layout-simples.css";

export function LayoutSimples({ children }: { children: ReactNode }) {
  return (
    <main className="layout-simples">
      <Sidebar />
      <div className="layout-simples_painel">{children}</div>
    </main>
  );
}

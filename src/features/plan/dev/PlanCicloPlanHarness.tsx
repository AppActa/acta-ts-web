import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PaginaCicloPlan } from "../pages/PaginaCicloPlan";

if (!import.meta.env.DEV) {
  throw new Error("Esta prévia está disponível somente no modo de desenvolvimento.");
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Não foi possível montar a prévia local.");
}

createRoot(rootElement).render(
  <StrictMode>
    <MemoryRouter initialEntries={["/do/ciclo/1/plan"]}>
      <Routes>
        <Route path="/do/ciclo/:cicloId/plan" element={<PaginaCicloPlan />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { App } from "./components/app/App";
import { iniciarEscalaFonteGlobal } from "./utils/escala-fonte-global";
import "../styles/index.css";

const raiz = createRoot(document.getElementById("root")!);
flushSync(() => {
  raiz.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
iniciarEscalaFonteGlobal();

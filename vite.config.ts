import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/cato": {
        target: "https://acta-ai.34-232-250-240.sslip.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/cato/, ""),
      },
    },
  },
});

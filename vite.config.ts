import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createApiApp } from "./server/apiApp.js";

function apiInVite() {
  return {
    name: "inline-api",
    configureServer(server) {
      const api = createApiApp();
      server.middlewares.use((req, res, next) => {
        const p = (req.url ?? "").split("?")[0] ?? "";
        if (p.startsWith("/api")) return api(req, res, next);
        next();
      });
    },
    configurePreviewServer(server) {
      const api = createApiApp();
      server.middlewares.use((req, res, next) => {
        const p = (req.url ?? "").split("?")[0] ?? "";
        if (p.startsWith("/api")) return api(req, res, next);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiInVite()],
  server: {
    // Altijd dezelfde URL: http://localhost:8000 — geen stille opschuif naar een andere poort
    port: 8000,
    strictPort: true,
  },
  preview: {
    port: 8000,
    strictPort: true,
  },
});

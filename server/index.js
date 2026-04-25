import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createApiApp } from "./apiApp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";
const ADMIN_KEY = process.env.ADMIN_KEY || "verander-mij-bij-start";

const app = express();
app.use(createApiApp());

if (isProd) {
  const staticDir = path.join(__dirname, "..", "dist");
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}${isProd ? " (site + API)" : " (alleen API — gebruik: npm run dev)"}`);
  if (!isProd) {
    console.log(`Voor lokaal met frontend: npm run dev   |   ADMIN_KEY: ${ADMIN_KEY}`);
  }
});

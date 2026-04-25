import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, "data.json");
const ADMIN_KEY = process.env.ADMIN_KEY || "verander-mij-bij-start";

/** @type {{ hints: { id: string, text: string, createdAt: string }[], polls: { id: string, question: string, options: { id: string, label: string }[], votes: { voterName: string, optionId: string, votedAt: string }[] }[] }} */
const empty = { hints: [], polls: [] };

async function loadData() {
  if (!existsSync(DATA_PATH)) {
    await mkdir(path.dirname(DATA_PATH), { recursive: true });
    await writeFile(DATA_PATH, JSON.stringify(empty, null, 2), "utf8");
    return { ...empty };
  }
  const raw = await readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

async function saveData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

function needAdmin(req) {
  const k = req.get("x-admin-key") || req.query.admin_key;
  return k && k === ADMIN_KEY;
}

function randomId() {
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

/**
 * Express-app met uitsluitend /api-routes. Zelfde origin als Vite in dev; productie: achter dezelfde host.
 */
export function createApiApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/hints", async (_req, res) => {
    try {
      const data = await loadData();
      res.json({
        hints: [...data.hints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      });
    } catch {
      res.status(500).json({ error: "Kon hints niet laden." });
    }
  });

  app.post("/api/hints", async (req, res) => {
    if (!needAdmin(req)) {
      return res.status(401).json({ error: "Geen of verkeerde admin-sleutel." });
    }
    const text = String(req.body?.text ?? "").trim();
    if (!text || text.length > 2000) {
      return res.status(400).json({ error: "Hint moet tussen 1 en 2000 tekens." });
    }
    try {
      const data = await loadData();
      const hint = { id: randomId(), text, createdAt: new Date().toISOString() };
      data.hints.push(hint);
      await saveData(data);
      res.json({ hint });
    } catch {
      res.status(500).json({ error: "Opslaan mislukt." });
    }
  });

  app.get("/api/polls", async (_req, res) => {
    try {
      const data = await loadData();
      res.json({ polls: data.polls });
    } catch {
      res.status(500).json({ error: "Kon peilingen niet laden." });
    }
  });

  app.post("/api/polls", async (req, res) => {
    if (!needAdmin(req)) {
      return res.status(401).json({ error: "Geen of verkeerde admin-sleutel." });
    }
    const question = String(req.body?.question ?? "").trim();
    const options = Array.isArray(req.body?.options) ? req.body.options : [];
    if (!question || question.length > 500) {
      return res.status(400).json({ error: "Vraag: 1 t/m 500 tekens." });
    }
    const clean = options
      .map((o) => String(o ?? "").trim())
      .filter(Boolean)
      .slice(0, 20);
    if (clean.length < 2) {
      return res.status(400).json({ error: "Minstens 2 opties met tekst." });
    }
    try {
      const data = await loadData();
      const poll = {
        id: randomId(),
        question,
        options: clean.map((label) => ({ id: randomId(), label })),
        votes: [],
      };
      data.polls.push(poll);
      await saveData(data);
      res.json({ poll });
    } catch {
      res.status(500).json({ error: "Opslaan mislukt." });
    }
  });

  app.post("/api/polls/:pollId/vote", async (req, res) => {
    const { pollId } = req.params;
    const voterName = String(req.body?.voterName ?? "").trim();
    const optionId = String(req.body?.optionId ?? "").trim();
    if (!voterName || voterName.length > 80) {
      return res.status(400).json({ error: "Geef je naam (max 80 tekens)." });
    }
    if (!optionId) {
      return res.status(400).json({ error: "Kies een optie." });
    }
    const norm = (s) => s.toLowerCase().replace(/\s+/g, " ");
    const nameKey = norm(voterName);
    try {
      const data = await loadData();
      const poll = data.polls.find((p) => p.id === pollId);
      if (!poll) {
        return res.status(404).json({ error: "Peiling bestaat niet." });
      }
      if (!poll.options.some((o) => o.id === optionId)) {
        return res.status(400).json({ error: "Ongeldige optie." });
      }
      const already = poll.votes.some((v) => norm(v.voterName) === nameKey);
      if (already) {
        return res.status(409).json({ error: "Deze naam heeft al gestemd op deze peiling." });
      }
      poll.votes.push({
        voterName: voterName.slice(0, 80),
        optionId,
        votedAt: new Date().toISOString(),
      });
      await saveData(data);
      res.json({ ok: true, poll });
    } catch {
      res.status(500).json({ error: "Stemmen mislukt." });
    }
  });

  return app;
}

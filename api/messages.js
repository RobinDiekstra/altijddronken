// Vercel serverless function — gedeelde opslag via Upstash Redis.
// Activeer met de Upstash-integratie op Vercel (Marketplace → Upstash → Add).
// Vercel zet UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN automatisch klaar.

import { Redis } from "@upstash/redis";

const KEY = "ad:messages";
const MAX_LENGTH = 500;

function makeId() {
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({
      error:
        "Server is nog niet verbonden met de database. Activeer Upstash Redis in Vercel → Storage en deploy opnieuw.",
    });
  }

  try {
    if (req.method === "GET") {
      // Bewaard als list: nieuwste eerst dankzij LPUSH
      const raw = await redis.lrange(KEY, 0, MAX_LENGTH - 1);
      const messages = raw
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") {
            try { return JSON.parse(item); } catch { return null; }
          }
          return item;
        })
        .filter(Boolean);
      return res.status(200).json({ messages });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object"
        ? req.body
        : JSON.parse(req.body || "{}");
      const name = String(body.name ?? "").trim();
      const text = String(body.text ?? "").trim();
      if (!name || name.length > 80) {
        return res.status(400).json({ error: "Naam is verplicht (max 80 tekens)." });
      }
      if (!text || text.length > 2000) {
        return res.status(400).json({ error: "Bericht is verplicht (max 2000 tekens)." });
      }
      const message = {
        id: makeId(),
        name: name.slice(0, 80),
        text: text.slice(0, 2000),
        createdAt: new Date().toISOString(),
      };
      await redis.lpush(KEY, JSON.stringify(message));
      await redis.ltrim(KEY, 0, MAX_LENGTH - 1);
      return res.status(200).json({ message });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method niet toegestaan." });
  } catch (err) {
    console.error("messages handler error:", err);
    return res.status(500).json({ error: "Interne fout. Probeer opnieuw." });
  }
}

export type Message = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

async function readError(r: Response): Promise<string> {
  const fallback = `Server gaf ${r.status}. Probeer het later opnieuw.`;
  try {
    const data = await r.clone().json();
    if (data && typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    // not json
  }
  if (r.status === 404) return "API niet gevonden (404). Database is nog niet gekoppeld?";
  if (r.status >= 500) return fallback;
  return fallback;
}

export async function fetchMessages(): Promise<Message[]> {
  const r = await fetch("/api/messages", { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(await readError(r));
  const d = (await r.json()) as { messages: Message[] };
  return d.messages ?? [];
}

export async function postMessage(name: string, text: string): Promise<Message> {
  const r = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, text }),
  });
  if (!r.ok) throw new Error(await readError(r));
  const d = (await r.json()) as { message: Message };
  return d.message;
}

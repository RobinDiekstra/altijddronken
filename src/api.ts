export type Message = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export async function fetchMessages(): Promise<Message[]> {
  const r = await fetch("/api/messages");
  if (!r.ok) throw new Error("Berichten konden niet geladen worden.");
  const d = (await r.json()) as { messages: Message[] };
  return d.messages;
}

export async function postMessage(name: string, text: string): Promise<Message> {
  const r = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, text }),
  });
  const d = (await r.json().catch(() => ({}))) as { error?: string; message?: Message };
  if (!r.ok) throw new Error(d.error ?? "Versturen mislukt.");
  return d.message!;
}

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import adDoner from "../assets/ad-doner.png";
import heroImg from "../assets/hero.png";
import { fetchMessages, postMessage, type Message } from "../api";

// ─── European Capitals Map ────────────────────────────────────────────────
// Coordinates are projected onto a 1000×800 SVG viewBox using:
//   x = (lon + 25) / 75 * 1000,  y = (71 - lat) / 37 * 800

type Anchor = "r" | "l" | "t" | "b";
const CAPITALS: { name: string; x: number; y: number; a: Anchor }[] = [
  { name: "Reykjavik", x: 41, y: 149, a: "r" },
  { name: "Oslo", x: 476, y: 240, a: "l" },
  { name: "Stockholm", x: 575, y: 253, a: "r" },
  { name: "Helsinki", x: 667, y: 234, a: "t" },
  { name: "Tallinn", x: 663, y: 251, a: "r" },
  { name: "Riga", x: 655, y: 303, a: "r" },
  { name: "Vilnius", x: 671, y: 352, a: "r" },
  { name: "Kopenhagen", x: 501, y: 331, a: "r" },
  { name: "Berlijn", x: 512, y: 400, a: "l" },
  { name: "Warschau", x: 613, y: 406, a: "r" },
  { name: "Praag", x: 525, y: 452, a: "l" },
  { name: "Wenen", x: 552, y: 493, a: "l" },
  { name: "Bratislava", x: 561, y: 495, a: "r" },
  { name: "Budapest", x: 587, y: 508, a: "r" },
  { name: "Minsk", x: 701, y: 370, a: "r" },
  { name: "Moskou", x: 835, y: 329, a: "r" },
  { name: "Kiev", x: 740, y: 443, a: "r" },
  { name: "Chisinau", x: 717, y: 519, a: "r" },
  { name: "Amsterdam", x: 399, y: 402, a: "l" },
  { name: "Brussel", x: 392, y: 437, a: "l" },
  { name: "Luxemburg", x: 415, y: 463, a: "r" },
  { name: "Parijs", x: 364, y: 478, a: "l" },
  { name: "Londen", x: 332, y: 422, a: "l" },
  { name: "Dublin", x: 249, y: 383, a: "l" },
  { name: "Bern", x: 432, y: 521, a: "l" },
  { name: "Vaduz", x: 460, y: 517, a: "r" },
  { name: "Rome", x: 500, y: 629, a: "l" },
  { name: "Madrid", x: 284, y: 662, a: "l" },
  { name: "Lissabon", x: 212, y: 699, a: "l" },
  { name: "Andorra la Vella", x: 353, y: 616, a: "l" },
  { name: "Monaco", x: 432, y: 591, a: "r" },
  { name: "San Marino", x: 499, y: 586, a: "r" },
  { name: "Ljubljana", x: 527, y: 538, a: "l" },
  { name: "Zagreb", x: 547, y: 545, a: "r" },
  { name: "Belgrado", x: 607, y: 566, a: "r" },
  { name: "Sarajevo", x: 579, y: 586, a: "l" },
  { name: "Boekarest", x: 681, y: 575, a: "r" },
  { name: "Sofia", x: 644, y: 612, a: "r" },
  { name: "Podgorica", x: 591, y: 618, a: "l" },
  { name: "Pristina", x: 616, y: 612, a: "t" },
  { name: "Skopje", x: 619, y: 627, a: "b" },
  { name: "Tirana", x: 597, y: 642, a: "l" },
  { name: "Athene", x: 649, y: 714, a: "r" },
  { name: "Ankara", x: 772, y: 672, a: "r" },
  { name: "Nicosia", x: 779, y: 774, a: "r" },
  { name: "Valletta", x: 527, y: 759, a: "r" },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function Home() {
  // Forum
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgName, setMsgName] = useState("");
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [msgErr, setMsgErr] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(() => {
    setLoading(true);
    setLoadErr(null);
    fetchMessages()
      .then((m) => setMessages(m))
      .catch((e) => setLoadErr(e instanceof Error ? e.message : "Laden mislukt."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function onSendMessage(e: FormEvent) {
    e.preventDefault();
    setMsgErr(null);
    if (!msgName.trim()) { setMsgErr("Vul je naam in."); return; }
    if (!msgText.trim()) { setMsgErr("Vul een bericht in."); return; }
    setSending(true);
    try {
      const msg = await postMessage(msgName.trim(), msgText.trim());
      setMessages((prev) => [msg, ...prev]);
      setMsgText("");
      window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      setMsgErr(err instanceof Error ? err.message : "Versturen mislukt.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="home">
      {/* Background scatter */}
      <div className="photo-scatter" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, i) => (
          <img key={i} src={adDoner} alt="" />
        ))}
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="badge">4 t/m 6 september</div>
        <h1>Waar gaat AD heen?</h1>
        <figure className="hero-photo">
          <img src={heroImg} alt="AD met de jongens en een biertje" />
        </figure>
      </div>

      {/* New Tip — Europe Capitals Map */}
      <section className="new-tip-section">
        <span className="new-tip-badge">NIEUW</span>
        <svg
          className="europe-map"
          viewBox="0 0 1000 800"
          width={1000}
          height={800}
          role="img"
          aria-label="Kaart van Europa met alle hoofdsteden"
        >
          <rect width={1000} height={800} rx={20} fill="#0f172a" />
          {CAPITALS.map(({ name, x, y, a }) => (
            <g key={name} className="capital-pin">
              <circle cx={x} cy={y} r={6} />
              <text
                x={x}
                y={y}
                textAnchor={a === "l" ? "end" : a === "t" || a === "b" ? "middle" : "start"}
                dx={a === "l" ? -10 : a === "r" ? 10 : 0}
                dy={a === "t" ? -10 : a === "b" ? 18 : 5}
              >
                {name}
              </text>
            </g>
          ))}
        </svg>
      </section>

      {/* Forum */}
      <section className="forum-card" aria-labelledby="forum-title">
        <h2 id="forum-title">Reacties</h2>

        <form className="forum-form" onSubmit={onSendMessage}>
          <input
            value={msgName}
            onChange={(e) => setMsgName(e.target.value)}
            placeholder="Naam"
            maxLength={80}
          />
          <textarea
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="Typ je reactie…"
            maxLength={2000}
            rows={3}
          />
          {msgErr && <p className="forum-error">{msgErr}</p>}
          <button type="submit" className="btn" disabled={sending}>
            {sending ? "Versturen..." : "Verstuur"}
          </button>
        </form>

        {loadErr && (
          <div className="forum-error-box">
            <p className="forum-error">{loadErr}</p>
            <button type="button" className="btn-secondary" onClick={loadMessages}>
              Opnieuw proberen
            </button>
          </div>
        )}

        <div className="forum-messages">
          {loading && !loadErr && <p className="forum-empty">Laden...</p>}
          {!loading && messages.length === 0 && !loadErr && (
            <p className="forum-empty">Nog geen reacties.</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="forum-msg">
              <div className="forum-msg-header">
                <strong>{msg.name}</strong>
                <span className="forum-msg-time">
                  {new Date(msg.createdAt).toLocaleString("nl-NL", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="forum-msg-text">{msg.text}</p>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </section>
    </div>
  );
}

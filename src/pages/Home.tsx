import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import adDoner from "../assets/ad-doner.png";
import { fetchMessages, postMessage, type Message } from "../api";

// ─── Wheel ─────────────────────────────────────────────────────────────────
//
// Conic gradient (no `from` offset = default top = 0°, going clockwise):
//   Yellow  (#facc15):   0° – 120°   center at  60° (≈ 2 o'clock)
//   Orange  (#fb923c): 120° – 240°   center at 180° (≈ 6 o'clock)
//   White   (#ffffff): 240° – 360°   center at 300° (≈ 10 o'clock)
//
// To land a segment at the pointer (top = 0°) we need to rotate the wheel so
// that its center angle reaches 0°.  When the wheel rotates clockwise by R,
// a point originally at angle α ends up at (α + R) % 360.
// So for α + R ≡ 0 (mod 360):  R_target = (360 - α) % 360
//   Yellow  → 300°
//   Orange  → 180°
//   White   →  60°

const SEGMENTS = [
  { label: "Chris is dronken", color: "#facc15", centerDeg: 60 },
  { label: "geen prijs",        color: "#fb923c", centerDeg: 180 },
  { label: "je hebt een tip gewonnen", color: "#ffffff", centerDeg: 300 },
] as const;

type SegmentLabel = (typeof SEGMENTS)[number]["label"];

const SECRET_TIP = "Jim gaan op yn voortuug rijen, waarst nooit eerder op reden hewwe";

const VOTER_KEY = "ad_wheel_name";

// ─── Component ─────────────────────────────────────────────────────────────

export function Home() {
  // Wheel
  const [wheelName, setWheelName] = useState(() => localStorage.getItem(VOTER_KEY) ?? "");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SegmentLabel | null>(null);

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

  useEffect(() => {
    if (wheelName.trim()) localStorage.setItem(VOTER_KEY, wheelName);
  }, [wheelName]);

  function spinWheel() {
    if (!wheelName.trim() || spinning) return;

    const resultIndex = Math.floor(Math.random() * SEGMENTS.length);
    const { centerDeg } = SEGMENTS[resultIndex];

    // How many degrees we still need to add so the segment centre lands at 0°
    const targetRot = (360 - centerDeg) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = ((targetRot - currentMod) + 360) % 360;

    // At least 5 full rotations + the exact offset (minimum 1 extra turn if delta==0)
    const nextRotation = rotation + 1800 + (delta === 0 ? 360 : delta);

    setResult(null);
    setSpinning(true);
    setRotation(nextRotation);

    window.setTimeout(() => {
      setResult(SEGMENTS[resultIndex].label);
      setSpinning(false);
    }, 3200);
  }

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
          <img src={adDoner} alt="AD met eten en een biertje in de donerzaak" />
        </figure>
      </div>

      {/* Wheel */}
      <section className="wheel-card" aria-labelledby="wheel-title">
        <h2 id="wheel-title">Draai het rad</h2>

        <label htmlFor="wheel-name">Naam</label>
        <input
          id="wheel-name"
          value={wheelName}
          onChange={(e) => setWheelName(e.target.value)}
          placeholder="Vul je naam in"
          maxLength={80}
        />

        <div className="wheel-wrap">
          <div className="wheel-pointer" aria-hidden="true" />
          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
            aria-label="Rad met drie gelijke vakken"
          >
            {/* Labels are placed at the visual centre of their segment */}
            <span className="wheel-label wheel-label-yellow">Chris is dronken</span>
            <span className="wheel-label wheel-label-orange">geen prijs</span>
            <span className="wheel-label wheel-label-white">je hebt een tip gewonnen</span>
          </div>
        </div>

        <button
          className="btn wheel-button"
          type="button"
          onClick={spinWheel}
          disabled={!wheelName.trim() || spinning}
        >
          {spinning ? "Draaien..." : "Draai"}
        </button>

        {result && (
          <p className="wheel-result">
            {wheelName.trim()}: <strong>{result}</strong>
          </p>
        )}
      </section>

      {/* Tip reveal */}
      {result === "je hebt een tip gewonnen" && (
        <section className="tip-card">
          <h2>Je tip</h2>
          <p>{SECRET_TIP}</p>
        </section>
      )}

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

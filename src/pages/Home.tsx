import { useState } from "react";
import adDoner from "../assets/ad-doner.png";

const wheelOptions = [
  "Chris is dronken",
  "geen prijs",
  "je hebt een tip gewonnen",
] as const;

const secretTip =
  "Tip: als AD ineens begint over 'lekker praktisch reizen', moet je juist extra wantrouwig worden.";

export function Home() {
  const [name, setName] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof wheelOptions)[number] | null>(null);

  function spinWheel() {
    if (!name.trim() || spinning) return;

    const resultIndex = Math.floor(Math.random() * wheelOptions.length);
    const segmentCenter = resultIndex * 120 + 60;
    const nextRotation = rotation + 1800 + (360 - segmentCenter);

    setResult(null);
    setSpinning(true);
    setRotation(nextRotation);

    window.setTimeout(() => {
      setResult(wheelOptions[resultIndex]);
      setSpinning(false);
    }, 3200);
  }

  return (
    <div className="home">
      <div className="photo-scatter" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, index) => (
          <img key={index} src={adDoner} alt="" />
        ))}
      </div>

      <div className="hero">
        <div className="badge">4 t/m 6 september</div>
        <h1>Waar gaat AD heen?</h1>
        <figure className="hero-photo">
          <img src={adDoner} alt="AD met eten en een biertje in de donerzaak" />
        </figure>
      </div>

      <section className="wheel-card" aria-labelledby="wheel-title">
        <h2 id="wheel-title">Draai het rad</h2>

        <label htmlFor="player-name">Naam</label>
        <input
          id="player-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vul je naam in"
          maxLength={80}
        />

        <div className="wheel-wrap" aria-live="polite">
          <div className="wheel-pointer" aria-hidden="true" />
          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
            aria-label="Rad met drie gelijke vakken"
          >
            <span className="wheel-label wheel-label-one">
              <span>Chris is dronken</span>
            </span>
            <span className="wheel-label wheel-label-two">
              <span>geen prijs</span>
            </span>
            <span className="wheel-label wheel-label-three">
              <span>je hebt een tip gewonnen</span>
            </span>
          </div>
        </div>

        <button className="btn wheel-button" type="button" onClick={spinWheel} disabled={!name.trim() || spinning}>
          {spinning ? "Draaien..." : "Draai"}
        </button>

        {result && <p className="wheel-result">{name.trim()} draaide: {result}</p>}
      </section>

      {result === "je hebt een tip gewonnen" && (
        <section className="tip-card">
          <h2>Je tip</h2>
          <p>{secretTip}</p>
        </section>
      )}
    </div>
  );
}

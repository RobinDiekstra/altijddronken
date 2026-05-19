const ITEMS = [
  { emoji: "👔", text: "Tjatjie kleding" },
  { emoji: "🍾", text: "1 grappige fles drank naar keuze" },
  { emoji: "✨", text: "Een goed flesje parfum" },
  { emoji: "🛂", text: "Paspoort" },
];

export function Paklijst() {
  return (
    <div className="page-content">
      <h1 className="page-title">Paklijst</h1>
      <p className="page-sub">Zorg dat je dit allemaal bij je hebt!</p>

      <ul className="paklijst">
        {ITEMS.map((item) => (
          <li key={item.text} className="paklijst-item">
            <span className="paklijst-emoji">{item.emoji}</span>
            <span className="paklijst-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

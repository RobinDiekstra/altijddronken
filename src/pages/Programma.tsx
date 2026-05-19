type TimeSlot = { time: string; label: string };

const DAYS: { date: string; title: string; slots: TimeSlot[] }[] = [
  {
    date: "4 juni",
    title: "Dag 1",
    slots: [
      { time: "11:00", label: "Brak ontbijten" },
      { time: "12:00", label: "—" },
      { time: "14:00", label: "—" },
      { time: "16:00", label: "—" },
      { time: "18:00", label: "Dineren" },
      { time: "19:00", label: "Saufen" },
      { time: "03:00", label: "Terug bij hotel" },
    ],
  },
  {
    date: "5 juni",
    title: "Dag 2",
    slots: [
      { time: "11:00", label: "Brak ontbijten" },
      { time: "12:00", label: "—" },
      { time: "14:00", label: "—" },
      { time: "16:00", label: "—" },
      { time: "18:00", label: "Dineren" },
      { time: "19:00", label: "Saufen" },
      { time: "03:00", label: "Terug bij hotel" },
    ],
  },
  {
    date: "6 juni",
    title: "Dag 3",
    slots: [
      { time: "11:00", label: "Brak ontbijten" },
      { time: "12:00", label: "—" },
      { time: "14:00", label: "—" },
      { time: "16:00", label: "—" },
      { time: "18:00", label: "—" },
    ],
  },
];

export function Programma() {
  return (
    <div className="page-content">
      <h1 className="page-title">Programma</h1>
      <p className="page-sub">Het reisschema — wordt nog aangevuld!</p>

      <div className="programma-days">
        {DAYS.map((day) => (
          <div key={day.date} className="programma-card">
            <div className="programma-header">
              <span className="programma-date">{day.date}</span>
              <span className="programma-day">{day.title}</span>
            </div>
            <ul className="programma-slots">
              {day.slots.map((slot, i) => (
                <li
                  key={i}
                  className={`programma-slot${slot.label === "—" ? " programma-slot--empty" : ""}`}
                >
                  <span className="programma-time">{slot.time}</span>
                  <span className="programma-label">{slot.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

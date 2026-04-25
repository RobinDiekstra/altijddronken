import { Home } from "./pages/Home";

export function App() {
  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          waargaataltijddronkennaartoe
          <small>Speculeren kun je leren</small>
        </div>
      </header>
      <main>
        <Home />
      </main>
    </div>
  );
}

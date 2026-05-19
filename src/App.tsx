import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Home } from "./pages/Home";
import { Paklijst } from "./pages/Paklijst";
import { Programma } from "./pages/Programma";

export function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <header className="topbar">
          <div className="brand">
            waargaataltijddronkennaartoe
            <small>Speculeren kun je leren</small>
          </div>
          <nav className="nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/paklijst">Paklijst</NavLink>
            <NavLink to="/programma">Programma</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paklijst" element={<Paklijst />} />
            <Route path="/programma" element={<Programma />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

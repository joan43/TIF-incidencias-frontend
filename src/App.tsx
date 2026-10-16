import { useState, useEffect } from "react";
import { api, User } from "./api";
import Login from "./views/Login";
import IncidentList from "./views/IncidentList";
import NewIncident from "./views/NewIncident";
import IncidentDetail from "./views/IncidentDetail";
import Sidebar from "./components/Sidebar";

type View = "list" | "new" | "detail";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckingSession(false);
      return () => { active = false; };
    }

    api.getCurrentUser()
      .then((authenticatedUser) => {
        if (active) {
          localStorage.setItem("user", JSON.stringify(authenticatedUser));
          setUser(authenticatedUser);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (active) setUser(null);
      })
      .finally(() => { if (active) setCheckingSession(false); });

    return () => { active = false; };
  }, []);

  function handleLogin(loggedUser: User, authToken: string) {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    setView("list");
    setSelectedId(null);
  }

  async function handleLogout() {
    // Aunque el token haya vencido, siempre permitimos salir y limpiar la sesión local.
    try { await api.logout(); } catch { /* El cierre local sigue siendo válido. */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView("list");
    setSelectedId(null);
  }

  function handleViewDetail(id: number) {
    setSelectedId(id);
    setView("detail");
  }

  function handleNewIncidentSuccess(id: number) {
    setSelectedId(id);
    setView("detail");
  }

  if (checkingSession) {
    return (
      <div className="login-page">
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status" aria-label="Verificando sesión" />
          <div>Verificando sesión...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        currentView={view}
        onNavigate={(nextView) => setView(nextView)}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-crumb">
            {view === "list" && <><i className="bi bi-list-ul me-1" /> Listado de incidencias</>}
            {view === "new" && <>
              <button className="btn btn-link btn-sm p-0 text-muted text-decoration-none" onClick={() => setView("list")}>Incidencias</button>
              <span className="mx-1">/</span><i className="bi bi-plus-circle me-1" /> Nueva incidencia
            </>}
            {view === "detail" && selectedId !== null && <>
              <button className="btn btn-link btn-sm p-0 text-muted text-decoration-none" onClick={() => setView("list")}>Incidencias</button>
              <span className="mx-1">/</span><i className="bi bi-ticket-detailed me-1" /> #{selectedId}
            </>}
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-light text-dark border d-flex align-items-center gap-1 user-pill">
              <i className="bi bi-person-circle text-primary" />{user.name}
            </span>
          </div>
        </header>

        <nav className="mobile-nav" aria-label="Navegación principal">
          <button className={`mobile-nav-link ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
            <i className="bi bi-list-ul" /> Incidencias
          </button>
          <button className={`mobile-nav-link ${view === "new" ? "active" : ""}`} onClick={() => setView("new")}>
            <i className="bi bi-plus-circle" /> Nueva
          </button>
          <button className="mobile-nav-link" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right" /> Salir
          </button>
        </nav>

        <main className="content-area">
          {view === "list" && <IncidentList onViewDetail={handleViewDetail} onNewIncident={() => setView("new")} />}
          {view === "new" && <NewIncident onSuccess={handleNewIncidentSuccess} onCancel={() => setView("list")} />}
          {view === "detail" && selectedId !== null && <IncidentDetail incidentId={selectedId} currentUser={user} onBack={() => setView("list")} />}
        </main>
      </div>
    </div>
  );
}

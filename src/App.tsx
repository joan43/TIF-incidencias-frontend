import { useState, useEffect } from "react";
import { User } from "./api";
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

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  function handleLogin(loggedUser: User) {
    setUser(loggedUser);
    setView("list");
  }

  function handleLogout() {
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        user={user}
        currentView={view}
        onNavigate={(v) => setView(v)}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        {/* Topbar */}
        <div className="topbar">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
              {view === "list" && (
                <><i className="bi bi-list-ul me-1"></i> Listado de incidencias</>
              )}
              {view === "new" && (
                <>
                  <button className="btn btn-link btn-sm p-0 text-muted text-decoration-none" onClick={() => setView("list")}>
                    Incidencias
                  </button>
                  <span className="mx-1">/</span>
                  <i className="bi bi-plus-circle me-1"></i> Nueva incidencia
                </>
              )}
              {view === "detail" && selectedId && (
                <>
                  <button className="btn btn-link btn-sm p-0 text-muted text-decoration-none" onClick={() => setView("list")}>
                    Incidencias
                  </button>
                  <span className="mx-1">/</span>
                  <i className="bi bi-ticket-detailed me-1"></i> #{selectedId}
                </>
              )}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-light text-dark border d-flex align-items-center gap-1" style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}>
              <i className="bi bi-person-circle text-primary"></i>
              {user.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          {view === "list" && (
            <IncidentList
              onViewDetail={handleViewDetail}
              onNewIncident={() => setView("new")}
            />
          )}
          {view === "new" && (
            <NewIncident
              onSuccess={handleNewIncidentSuccess}
              onCancel={() => setView("list")}
            />
          )}
          {view === "detail" && selectedId !== null && (
            <IncidentDetail
              incidentId={selectedId}
              currentUser={user}
              onBack={() => setView("list")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

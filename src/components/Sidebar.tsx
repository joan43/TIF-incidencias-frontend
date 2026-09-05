import { User } from "../api";

type View = "list" | "new" | "detail";

interface Props {
  user: User;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  tecnico: "Técnico",
  usuario: "Usuario",
};

export default function Sidebar({ user, currentView, onNavigate, onLogout }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: 32,
              height: 32,
              background: "#2563eb",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.875rem",
              flexShrink: 0,
            }}
          >
            <i className="bi bi-ticket-detailed-fill"></i>
          </div>
          <div>
            <h5>IncidenciasApp</h5>
            <small>v1.0</small>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="px-3 mb-2" style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569" }}>
          Gestión
        </div>
        <button
          className={`nav-link border-0 bg-transparent w-100 text-start${currentView === "list" ? " active" : ""}`}
          onClick={() => onNavigate("list")}
        >
          <i className="bi bi-list-ul"></i>
          Listado de incidencias
        </button>
        <button
          className={`nav-link border-0 bg-transparent w-100 text-start${currentView === "new" ? " active" : ""}`}
          onClick={() => onNavigate("new")}
        >
          <i className="bi bi-plus-circle"></i>
          Nueva incidencia
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#1e3a5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#93c5fd",
              fontSize: "0.875rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{ROLE_LABELS[user.role] || user.role}</div>
          </div>
        </div>
        <button
          className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.8rem" }}
          onClick={onLogout}
        >
          <i className="bi bi-box-arrow-left"></i>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

import { useState, useEffect } from "react";
import { api, Incident, User } from "../api";

const STATUS_LABELS: Record<string, string> = {
  abierta: "Abierta",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
};

function StatusBadge({ estado }: { estado: string }) {
  return (
    <span className={`badge-status badge-${estado}`}>
      {STATUS_LABELS[estado] || estado}
    </span>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  incidentId: number;
  currentUser: User;
  onBack: () => void;
}

export default function IncidentDetail({ incidentId, currentUser, onBack }: Props) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [resolucion, setResolucion] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);

  useEffect(() => {
    async function fetchIncident() {
      setLoading(true);
      setError("");
      try {
        const res = await api.getIncident(incidentId);
        setIncident(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar la incidencia");
      } finally {
        setLoading(false);
      }
    }
    fetchIncident();
  }, [incidentId]);

  async function handleTake() {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await api.takeIncident(incidentId);
      setIncident(res.data);
      setActionSuccess("Incidencia tomada correctamente. Ahora eres el técnico asignado.");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al tomar la incidencia");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResolve() {
    if (!resolucion.trim()) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await api.resolveIncident(incidentId, resolucion.trim());
      setIncident(res.data);
      setShowResolveForm(false);
      setResolucion("");
      setActionSuccess("Incidencia marcada como resuelta.");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al resolver la incidencia");
    } finally {
      setActionLoading(false);
    }
  }


  async function handleComment() {
    if (!commentText.trim()) return;
    setActionError("");
    setActionSuccess("");
    setCommentLoading(true);
    try {
      const res = await api.addComment(incidentId, commentText.trim());
      setIncident((prev) =>
        prev ? { ...prev, comentarios: [...(prev.comentarios || []), res.data] } : prev
      );
      setCommentText("");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al añadir comentario");
    } finally {
      setCommentLoading(false);
    }
  }

  const isTecnico = currentUser.role === "tecnico";
  const isAssignedTecnico = incident?.tecnico?.id === currentUser.id;
  const canTake = isTecnico && incident?.estado === "abierta" && !incident?.tecnico;
  const canResolve = isAssignedTecnico && incident?.estado === "en_proceso";

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5 gap-3">
        <div className="spinner-border text-primary"></div>
        <span className="text-muted">Cargando incidencia...</span>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div>
        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 mb-3" onClick={onBack}>
          <i className="bi bi-arrow-left"></i> Volver
        </button>
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error || "No se pudo cargar la incidencia"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header d-flex align-items-start gap-3">
        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 mt-1 flex-shrink-0" onClick={onBack}>
          <i className="bi bi-arrow-left"></i> Volver
        </button>
        <div className="flex-fill">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span style={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.8rem" }}>#{incident.id}</span>
            <StatusBadge estado={incident.estado} />
            <span className="badge bg-light text-dark border" style={{ fontSize: "0.75rem" }}>{incident.categoria}</span>
          </div>
          <h4 style={{ marginBottom: 0 }}>{incident.titulo}</h4>
          <p>Creado el {formatDateTime(incident.created_at)} por {incident.creador?.name || "—"}</p>
        </div>
      </div>

      {/* Action feedback */}
      {actionSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-check-circle-fill flex-shrink-0"></i>
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          {actionError}
        </div>
      )}

      <div className="row g-3">
        {/* Main column */}
        <div className="col-12 col-lg-8">
          {/* Description */}
          <div className="card mb-3">
            <div className="card-header">
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                <i className="bi bi-card-text me-2 text-primary"></i>
                Descripción
              </span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                {incident.descripcion}
              </p>
            </div>
          </div>

          {/* Resolution */}
          {incident.resolucion && (
            <div className="card mb-3" style={{ borderColor: "#86efac" }}>
              <div className="card-header" style={{ background: "#d1fae5" }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#065f46" }}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Resolución
                </span>
              </div>
              <div className="card-body">
                <p style={{ fontSize: "0.9rem", color: "#134e4a", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                  {incident.resolucion}
                </p>
              </div>
            </div>
          )}

          {/* Resolve form */}
          {showResolveForm && (
            <div className="card mb-3" style={{ borderColor: "#93c5fd" }}>
              <div className="card-header" style={{ background: "#eff6ff" }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e40af" }}>
                  <i className="bi bi-pencil-square me-2"></i>
                  Registrar resolución
                </span>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control mb-3"
                  rows={4}
                  placeholder="Describe cómo se resolvió el problema..."
                  value={resolucion}
                  onChange={(e) => setResolucion(e.target.value)}
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                    onClick={handleResolve}
                    disabled={actionLoading || !resolucion.trim()}
                  >
                    {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                    Marcar como resuelta
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowResolveForm(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                <i className="bi bi-chat-text me-2 text-primary"></i>
                Comentarios
                {incident.comentarios?.length > 0 && (
                  <span className="badge bg-primary ms-2" style={{ fontSize: "0.7rem" }}>
                    {incident.comentarios.length}
                  </span>
                )}
              </span>
            </div>
            <div className="card-body">
              {(!incident.comentarios || incident.comentarios.length === 0) ? (
                <p className="text-muted text-center py-3 mb-0" style={{ fontSize: "0.875rem" }}>
                  <i className="bi bi-chat-dots d-block mb-2" style={{ fontSize: "1.5rem", opacity: 0.3 }}></i>
                  Sin comentarios aún
                </p>
              ) : (
                <div className="mb-3">
                  {incident.comentarios.map((c) => (
                    <div key={c.id} className="comment-item">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="comment-author">{c.usuario?.name || "Usuario"}</span>
                        <span className="comment-date">— {formatDateTime(c.created_at)}</span>
                      </div>
                      <div className="comment-body">{c.contenido}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* El PDF permite comentarios durante el seguimiento de la incidencia. */}
              <div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Escribe un comentario..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                    />
                    <button
                      className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                      onClick={handleComment}
                      disabled={commentLoading || !commentText.trim()}
                    >
                      {commentLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-send"></i>
                      )}
                      Enviar
                    </button>
                  </div>
                  <div className="form-text">Presiona Enter para enviar</div>
                </div>
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="col-12 col-lg-4">
          {/* Info card */}
          <div className="card mb-3">
            <div className="card-header">
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Información
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-lg-12">
                  <div className="detail-field">
                    <label>Estado</label>
                    <p><StatusBadge estado={incident.estado} /></p>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="detail-field">
                    <label>Categoría</label>
                    <p>
                      <span className="badge bg-light text-dark border">{incident.categoria}</span>
                    </p>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="detail-field">
                    <label>Creador</label>
                    <p className="d-flex align-items-center gap-1">
                      <i className="bi bi-person text-muted"></i>
                      {incident.creador?.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="detail-field">
                    <label>Técnico asignado</label>
                    <p className="d-flex align-items-center gap-1">
                      {incident.tecnico ? (
                        <>
                          <i className="bi bi-person-check" style={{ color: "#059669" }}></i>
                          {incident.tecnico.name}
                        </>
                      ) : (
                        <span className="text-muted d-flex align-items-center gap-1">
                          <i className="bi bi-person-dash"></i>
                          Sin asignar
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="detail-field">
                    <label>Creado</label>
                    <p>{formatDateTime(incident.created_at)}</p>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="detail-field">
                    <label>Última actualización</label>
                    <p>{formatDateTime(incident.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions card */}
          {(canTake || canResolve) && (
            <div className="card">
              <div className="card-header">
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  <i className="bi bi-lightning me-2 text-warning"></i>
                  Acciones disponibles
                </span>
              </div>
              <div className="card-body d-flex flex-column gap-2">
                {canTake && (
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleTake}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-person-check"></i>
                    )}
                    Tomar incidencia
                  </button>
                )}
                {canResolve && !showResolveForm && (
                  <button
                    className="btn btn-success d-flex align-items-center gap-2"
                    onClick={() => setShowResolveForm(true)}
                  >
                    <i className="bi bi-check-circle"></i>
                    Resolver incidencia
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Role info */}
          <div className="mt-3 p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#64748b" }}>
            <i className="bi bi-shield-check me-1"></i>
            Sesión como <strong>{currentUser.name}</strong> ({currentUser.role})
          </div>
        </div>
      </div>
    </div>
  );
}

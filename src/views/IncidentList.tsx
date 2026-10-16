import { useState, useEffect, useCallback } from "react";
import { api, Category, Incident } from "../api";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  onViewDetail: (id: number) => void;
  onNewIncident: () => void;
}

export default function IncidentList({ onViewDetail, onNewIncident }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getIncidents({
        estado: filterEstado || undefined,
        categoria: filterCategoria || undefined,
      });
      setIncidents(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar las incidencias");
    } finally {
      setLoading(false);
    }
  }, [filterEstado, filterCategoria]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    let active = true;
    api.getCategories()
      .then((items) => { if (active) setCategories(items); })
      .catch((err: unknown) => {
        if (active && !error) setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías");
      });
    return () => { active = false; };
    // La carga de categorías debe ejecutarse una sola vez al montar la vista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = {
    total: incidents.length,
    abiertas: incidents.filter((i) => i.estado === "abierta").length,
    en_proceso: incidents.filter((i) => i.estado === "en_proceso").length,
    resueltas: incidents.filter((i) => i.estado === "resuelta").length,
  };

  return (
    <div>
      <div className="page-header d-flex align-items-start justify-content-between">
        <div>
          <h4>Incidencias</h4>
          <p>Gestión y seguimiento de incidencias técnicas</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onNewIncident}>
          <i className="bi bi-plus-lg"></i>
          Nueva incidencia
        </button>
      </div>

      {/* Stat row */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total", value: counts.total, icon: "bi-ticket-detailed", color: "#eff6ff", iconColor: "#2563eb" },
          { label: "Abiertas", value: counts.abiertas, icon: "bi-circle-fill", color: "#fef3c7", iconColor: "#d97706" },
          { label: "En proceso", value: counts.en_proceso, icon: "bi-arrow-repeat", color: "#dbeafe", iconColor: "#2563eb" },
          { label: "Resueltas", value: counts.resueltas, icon: "bi-check-circle-fill", color: "#d1fae5", iconColor: "#059669" },
        ].map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.color }}>
                <i className={`bi ${s.icon}`} style={{ color: s.iconColor }}></i>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-auto">
              <label className="form-label mb-1">Filtrar por estado</label>
              <select
                className="form-select form-select-sm"
                style={{ minWidth: 160 }}
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="abierta">Abierta</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelta">Resuelta</option>
              </select>
            </div>
            <div className="col-12 col-md-auto">
              <label className="form-label mb-1">Filtrar por categoría</label>
              <select
                className="form-select form-select-sm"
                style={{ minWidth: 160 }}
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-auto">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => { setFilterEstado(""); setFilterCategoria(""); }}
              >
                <i className="bi bi-x-circle"></i>
                Limpiar filtros
              </button>
            </div>
            <div className="col-12 col-md-auto ms-md-auto">
              <button
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={fetchIncidents}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {loading ? "Cargando..." : `${incidents.length} incidencia${incidents.length !== 1 ? "s" : ""} en esta página`}
          </span>
          {(filterEstado || filterCategoria) && (
            <div className="d-flex gap-1">
              {filterEstado && (
                <span className="badge bg-light text-dark border" style={{ fontSize: "0.72rem" }}>
                  Estado: {STATUS_LABELS[filterEstado]}
                </span>
              )}
              {filterCategoria && (
                <span className="badge bg-light text-dark border" style={{ fontSize: "0.72rem" }}>
                  Categoría: {filterCategoria}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger m-3 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5 gap-3">
            <div className="spinner-border spinner-border-sm text-primary"></div>
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>Cargando incidencias...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: "2.5rem", color: "#cbd5e1" }}></i>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.875rem" }}>
              No se encontraron incidencias con los filtros aplicados
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Técnico</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: "0.8rem" }}>
                        #{inc.id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>{inc.titulo}</span>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                        Por {inc.creador?.name || "—"}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border" style={{ fontSize: "0.75rem" }}>
                        {inc.categoria}
                      </span>
                    </td>
                    <td>
                      <StatusBadge estado={inc.estado} />
                    </td>
                    <td style={{ color: inc.tecnico ? "#334155" : "#94a3b8", fontSize: "0.875rem" }}>
                      {inc.tecnico ? (
                        <span className="d-flex align-items-center gap-1">
                          <i className="bi bi-person-check" style={{ color: "#059669" }}></i>
                          {inc.tecnico.name}
                        </span>
                      ) : (
                        <span className="d-flex align-items-center gap-1">
                          <i className="bi bi-person-dash"></i>
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.8rem" }}>
                      {formatDate(inc.created_at)}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={() => onViewDetail(inc.id)}
                        style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}
                      >
                        <i className="bi bi-eye"></i>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

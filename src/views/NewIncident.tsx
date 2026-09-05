import { useState } from "react";
import { api } from "../api";

const CATEGORIES = ["Hardware", "Software", "Red", "Accesos", "Correo", "Impresora", "Otro"];

interface Props {
  onSuccess: (id: number) => void;
  onCancel: () => void;
}

export default function NewIncident({ onSuccess, onCancel }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidated(true);
    if (!titulo.trim() || !descripcion.trim() || !categoria) return;

    setError("");
    setLoading(true);
    try {
      const res = await api.createIncident({ titulo: titulo.trim(), descripcion: descripcion.trim(), categoria });
      onSuccess(res.data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la incidencia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={onCancel}>
          <i className="bi bi-arrow-left"></i>
          Volver
        </button>
        <div>
          <h4>Nueva incidencia</h4>
          <p>Completa el formulario para registrar una nueva incidencia técnica</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                <i className="bi bi-ticket-detailed me-2 text-primary"></i>
                Datos de la incidencia
              </span>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="titulo" className="form-label">
                    Título <span className="text-danger">*</span>
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    className={`form-control${validated && !titulo.trim() ? " is-invalid" : ""}`}
                    placeholder="Describe brevemente el problema"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    maxLength={120}
                  />
                  {validated && !titulo.trim() && (
                    <div className="invalid-feedback">El título es obligatorio.</div>
                  )}
                  <div className="form-text">{titulo.length}/120 caracteres</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="categoria" className="form-label">
                    Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoria"
                    className={`form-select${validated && !categoria ? " is-invalid" : ""}`}
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="">Selecciona una categoría...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {validated && !categoria && (
                    <div className="invalid-feedback">Selecciona una categoría.</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="descripcion"
                    className={`form-control${validated && !descripcion.trim() ? " is-invalid" : ""}`}
                    rows={5}
                    placeholder="Detalla el problema: cuándo ocurrió, qué pasos lo reproducen, qué error aparece..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                  {validated && !descripcion.trim() && (
                    <div className="invalid-feedback">La descripción es obligatoria.</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={loading}
                    style={{ fontWeight: 600 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send"></i>
                        Registrar incidencia
                      </>
                    )}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help box */}
          <div className="card mt-3" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
            <div className="card-body py-3">
              <div className="d-flex gap-2">
                <i className="bi bi-info-circle-fill text-primary mt-1 flex-shrink-0"></i>
                <div style={{ fontSize: "0.8rem", color: "#1e40af" }}>
                  <strong>Consejos para una buena incidencia:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    <li>Sé específico en el título: "Impresora HP 3° piso sin papel" es mejor que "Impresora rota".</li>
                    <li>Indica el equipo afectado y el número de activo si lo conoces.</li>
                    <li>Adjunta el mensaje de error exacto si lo hay.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

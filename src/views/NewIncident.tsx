import { useEffect, useState } from "react";
import { api, Category } from "../api";

interface Props {
  onSuccess: (id: number) => void;
  onCancel: () => void;
}

export default function NewIncident({ onSuccess, onCancel }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    let active = true;
    api.getCategories()
      .then((items) => { if (active) setCategories(items); })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías");
      })
      .finally(() => { if (active) setLoadingCategories(false); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidated(true);
    if (titulo.trim().length < 3 || descripcion.trim().length < 5 || !categoriaId) return;

    setError("");
    setLoading(true);
    try {
      const res = await api.createIncident({ title: titulo.trim(), description: descripcion.trim(), category_id: Number(categoriaId) });
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
                    className={`form-control${validated && titulo.trim().length < 3 ? " is-invalid" : ""}`}
                    placeholder="Describe brevemente el problema"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    maxLength={180}
                  />
                  {validated && titulo.trim().length < 3 && (
                    <div className="invalid-feedback">El título debe tener al menos 3 caracteres.</div>
                  )}
                  <div className="form-text">{titulo.length}/180 caracteres</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="categoria" className="form-label">
                    Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoria"
                    className={`form-select${validated && !categoriaId ? " is-invalid" : ""}`}
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    disabled={loadingCategories || categories.length === 0}
                  >
                    <option value="">{loadingCategories ? "Cargando categorías..." : "Selecciona una categoría..."}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {validated && !categoriaId && (
                    <div className="invalid-feedback">Seleccioná una categoría.</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="descripcion"
                    className={`form-control${validated && descripcion.trim().length < 5 ? " is-invalid" : ""}`}
                    rows={5}
                    placeholder="Detalla el problema: cuándo ocurrió, qué pasos lo reproducen, qué error aparece..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                  {validated && descripcion.trim().length < 5 && (
                    <div className="invalid-feedback">La descripción debe tener al menos 5 caracteres.</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={loading || loadingCategories || categories.length === 0}
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

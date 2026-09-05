import { useState } from "react";
import { api, User } from "../api";

interface Props {
  onLogin: (user: User, token: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      onLogin(res.user, res.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <i className="bi bi-ticket-detailed-fill"></i>
        </div>
        <h5 className="fw-700 mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.35rem", color: "#0f172a" }}>
          Sistema de Incidencias
        </h5>
        <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
          Ingresa con tu cuenta corporativa
        </p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <div className="input-group">
              <span className="input-group-text text-muted" style={{ background: "#f8fafc" }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-group">
              <span className="input-group-text text-muted" style={{ background: "#f8fafc" }}>
                <i className="bi bi-lock"></i>
              </span>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
            style={{ padding: "0.625rem", fontWeight: 600 }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                Autenticando...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: "0.75rem" }}>
          Acceso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  );
}

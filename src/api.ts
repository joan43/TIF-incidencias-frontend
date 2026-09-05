const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }
  return data as T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "tecnico" | "usuario";
}

export interface Incident {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: "abierta" | "en_proceso" | "resuelta" | "cerrada";
  creador: User;
  tecnico: User | null;
  resolucion: string | null;
  comentarios: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  contenido: string;
  usuario: User;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<void>("/logout", { method: "POST" }),

  getIncidents: (params?: { estado?: string; categoria?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(Object.fromEntries(
          Object.entries(params).filter(([, v]) => v)
        )).toString()
      : "";
    return request<{ data: Incident[] }>(`/incidencias${qs}`);
  },

  getIncident: (id: number) =>
    request<{ data: Incident }>(`/incidencias/${id}`),

  createIncident: (payload: { titulo: string; descripcion: string; categoria: string }) =>
    request<{ data: Incident }>("/incidencias", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  takeIncident: (id: number) =>
    request<{ data: Incident }>(`/incidencias/${id}/tomar`, { method: "POST" }),

  resolveIncident: (id: number, resolucion: string) =>
    request<{ data: Incident }>(`/incidencias/${id}/resolver`, {
      method: "POST",
      body: JSON.stringify({ resolucion }),
    }),

  closeIncident: (id: number) =>
    request<{ data: Incident }>(`/incidencias/${id}/cerrar`, { method: "POST" }),

  addComment: (id: number, contenido: string) =>
    request<{ data: Comment }>(`/incidencias/${id}/comentarios`, {
      method: "POST",
      body: JSON.stringify({ contenido }),
    }),
};

/**
 * Cliente de la API REST del TIF.
 * La interfaz conserva nombres legibles en español, pero este módulo adapta
 * el contrato real de Laravel (title, status, category, user, technician...).
 * Las solicitudes HTTP se realizan mediante jQuery.ajax, como pide el TIF.
 */
const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");

export type Role = "usuario" | "tecnico" | "admin";
export type IncidentStatus = "abierta" | "en_proceso" | "resuelta";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  contenido: string;
  usuario: User;
  created_at: string;
}

export interface Incident {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  category_id: number;
  estado: IncidentStatus;
  creador: User;
  tecnico: User | null;
  resolucion: string | null;
  comentarios: Comment[];
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface ApiList<T> {
  data: T[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}

interface RawRecord {
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function token(): string | null {
  return localStorage.getItem("token");
}

function apiRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!window.jQuery?.ajax) {
      reject(new ApiError("No se pudo cargar jQuery. Revisá tu conexión e intentá recargar la página."));
      return;
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    const storedToken = token();
    if (storedToken) headers.Authorization = `Bearer ${storedToken}`;

    const settings: JQueryAjaxSettings = {
      url: `${API_BASE}${path}`,
      method,
      dataType: "json",
      headers,
      success: (data) => resolve(data as T),
      error: (xhr) => {
        const response = (xhr.responseJSON && typeof xhr.responseJSON === "object")
          ? xhr.responseJSON as RawRecord
          : parseResponse(xhr.responseText);
        const message = readableError(response, xhr.status);
        reject(new ApiError(message, xhr.status));
      },
    };

    if (body !== undefined) {
      settings.contentType = "application/json; charset=UTF-8";
      settings.data = JSON.stringify(body);
    }

    window.jQuery.ajax(settings);
  });
}

function parseResponse(text: string): RawRecord {
  if (!text) return {};
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" ? value as RawRecord : {};
  } catch {
    return {};
  }
}

function readableError(response: RawRecord, status: number): string {
  const errors = response.errors;
  if (errors && typeof errors === "object") {
    for (const value of Object.values(errors as Record<string, unknown>)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
    }
  }
  if (typeof response.message === "string" && response.message.trim()) {
    return response.message;
  }
  if (status === 0) return "No se pudo conectar con el backend. Comprobá que Laravel esté ejecutándose en el puerto 8000.";
  if (status === 401) return "Tu sesión venció o las credenciales no son correctas. Iniciá sesión nuevamente.";
  if (status === 403) return "No tenés permisos para realizar esta acción.";
  if (status === 404) return "No se encontró el recurso solicitado.";
  if (status === 422) return "Revisá los datos ingresados.";
  if (status >= 500) return "El servidor tuvo un problema. Revisá la terminal de Laravel.";
  return `La API respondió con un error HTTP ${status}.`;
}

function mapRole(value: unknown): Role {
  if (value === "tecnico" || value === "admin") return value;
  return "usuario";
}

function mapUser(value: unknown): User {
  const user = (value && typeof value === "object" ? value : {}) as RawRecord;
  return {
    id: Number(user.id || 0),
    name: String(user.name || "Usuario"),
    email: String(user.email || ""),
    role: mapRole(user.role),
  };
}

function mapStatus(value: unknown): IncidentStatus {
  const status = String(value || "").trim().toUpperCase();
  if (status === "EN PROCESO" || status === "EN_PROCESO") return "en_proceso";
  if (status === "RESUELTA" || status === "RESUELTO") return "resuelta";
  return "abierta";
}

function toApiStatus(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "en_proceso" || normalized === "en proceso") return "EN PROCESO";
  if (normalized === "resuelta" || normalized === "resuelto") return "RESUELTA";
  if (normalized === "abierta" || normalized === "abierto") return "ABIERTA";
  return value;
}

function mapComment(value: unknown): Comment {
  const comment = (value && typeof value === "object" ? value : {}) as RawRecord;
  return {
    id: Number(comment.id || 0),
    contenido: String(comment.comment ?? comment.contenido ?? ""),
    usuario: mapUser(comment.user ?? comment.usuario),
    created_at: String(comment.created_at || ""),
  };
}

function mapIncident(value: unknown): Incident {
  const raw = (value && typeof value === "object" ? value : {}) as RawRecord;
  const rawCategory = raw.category ?? raw.categoria;
  const category = rawCategory && typeof rawCategory === "object"
    ? rawCategory as RawRecord
    : null;
  const rawComments = raw.comments ?? raw.comentarios;

  return {
    id: Number(raw.id || 0),
    titulo: String(raw.title ?? raw.titulo ?? "Sin título"),
    descripcion: String(raw.description ?? raw.descripcion ?? ""),
    categoria: String(category?.name ?? (typeof rawCategory === "string" ? rawCategory : null) ?? "Sin categoría"),
    category_id: Number(raw.category_id ?? category?.id ?? 0),
    estado: mapStatus(raw.status ?? raw.estado),
    creador: mapUser(raw.user ?? raw.creador),
    tecnico: (raw.technician ?? raw.tecnico) ? mapUser(raw.technician ?? raw.tecnico) : null,
    resolucion: (raw.resolution ?? raw.resolucion) == null ? null : String(raw.resolution ?? raw.resolucion),
    comentarios: Array.isArray(rawComments) ? rawComments.map(mapComment) : [],
    created_at: String(raw.created_at || ""),
    updated_at: String(raw.updated_at || ""),
  };
}

export const api = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<RawRecord>("/login", "POST", { email: email.trim(), password });
    return {
      token: String(response.token || ""),
      token_type: String(response.token_type || "Bearer"),
      user: mapUser(response.user),
    };
  },

  logout: () => apiRequest<{ message: string }>("/logout", "POST"),

  getCurrentUser: async () => mapUser(await apiRequest<unknown>("/user")),

  getCategories: async (): Promise<Category[]> => {
    const response = await apiRequest<{ data: RawRecord[] }>("/categorias");
    return (response.data || []).map((item) => ({ id: Number(item.id), name: String(item.name) }));
  },

  getIncidents: async (params?: { estado?: string; categoria?: string }): Promise<ApiList<Incident>> => {
    const query = new URLSearchParams();
    if (params?.estado) query.set("status", toApiStatus(params.estado));
    if (params?.categoria) query.set("category", params.categoria);
    query.set("per_page", "100");
    const queryStringWithPage = query.toString();
    const suffix = queryStringWithPage ? `?${queryStringWithPage}` : "";
    const response = await apiRequest<{ data: unknown[]; meta?: ApiList<Incident>["meta"] }>(`/incidencias${suffix}`);
    return { data: (response.data || []).map(mapIncident), meta: response.meta };
  },

  getIncident: async (id: number): Promise<{ data: Incident }> => {
    const response = await apiRequest<{ data: unknown }>(`/incidencias/${id}`);
    return { data: mapIncident(response.data) };
  },

  createIncident: async (payload: { title: string; description: string; category_id: number }): Promise<{ data: Incident }> => {
    const response = await apiRequest<{ data: unknown }>("/incidencias", "POST", payload);
    return { data: mapIncident(response.data) };
  },

  takeIncident: async (id: number): Promise<{ data: Incident }> => {
    const response = await apiRequest<{ data: unknown }>(`/incidencias/${id}/tomar`, "PUT");
    return { data: mapIncident(response.data) };
  },

  resolveIncident: async (id: number, resolution: string): Promise<{ data: Incident }> => {
    const response = await apiRequest<{ data: unknown }>(`/incidencias/${id}/resolver`, "PUT", { resolution });
    return { data: mapIncident(response.data) };
  },

  addComment: async (id: number, comment: string): Promise<{ data: Comment }> => {
    const response = await apiRequest<{ data: unknown }>(`/incidencias/${id}/comentarios`, "POST", { comment });
    return { data: mapComment(response.data) };
  },
};

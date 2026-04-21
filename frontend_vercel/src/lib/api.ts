const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

interface ApiError extends Error {
  status?: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("sigrene_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("sigrene_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("sigrene_token");
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol || null;
    } catch {
      return null;
    }
  }

  getDefaultRouteForRole(rol: string): string {
    switch (rol) {
      case "admin": return "/app/admin";
      case "director": return "/app/director";
      case "coach": return "/app/coach";
      case "swimmer": return "/app/swimmer";
      default: return "/app/coach";
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.detail || "Error en la solicitud") as ApiError;
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Error al iniciar sesión");
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(data: { email: string; password: string; nombre_completo: string; rol: string; nadadores_asignados: string[] }) {
    return this.request("/usuarios/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMiPerfil() {
    return this.request<any>("/usuarios/me");
  }

  async updateMiPerfil(data: { nombre_completo?: string; password?: string }) {
    return this.request<{ message: string }>("/usuarios/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getUsuarios(params: { skip?: number; limit?: number; rol?: string } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.rol) query.append("rol", params.rol);
    const queryStr = query.toString();
    return this.request<{ total: number; skip: number; limit: number; datos: any[] }>(
      `/usuarios/${queryStr ? `?${queryStr}` : ""}`
    );
  }

  async updateUsuario(email: string, data: { rol?: string; activo?: boolean; nombre_completo?: string; nadadores_asignados?: string[] }) {
    return this.request<{ message: string; modified_count: number }>(`/usuarios/${email}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUsuario(email: string) {
    return this.request<{ message: string; deleted_count: number }>(`/usuarios/${email}`, {
      method: "DELETE",
    });
  }

  async getNadadores(params: { skip?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    const queryStr = query.toString();
    return this.request<{ total: number; datos: any[] }>(`/nadadores/${queryStr ? `?${queryStr}` : ""}`);
  }

  async createNadador(data: any) {
    return this.request<{ message: string; id_seudonimo: string }>("/nadadores/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRegistros(params: { skip?: number; limit?: number; nadador_id?: string } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.nadador_id) query.append("nadador_id", params.nadador_id);
    const queryStr = query.toString();
    return this.request<{ total: number; datos: any[] }>(`/registros/${queryStr ? `?${queryStr}` : ""}`);
  }
}

export const api = new ApiClient();

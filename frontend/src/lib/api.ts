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
      case "admin":
        return "/app/admin";
      case "director":
        return "/app/director";
      case "coach":
        return "/app/coach";
      case "swimmer":
        return "/app/swimmer";
      default:
        return "/app/coach";
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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.detail || "Error en la solicitud") as ApiError;
      error.status = response.status;
      throw error;
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Credenciales incorrectas");
    }

    this.setToken(data.access_token);
    return data;
  }

  async register(userData: {
    email: string;
    password: string;
    nombre_completo: string;
    rol: string;
    nadadores_asignados?: string[];
  }) {
    return this.request("/usuarios/registrar", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async requestPasswordRecovery(email: string) {
    return this.request("/usuarios/recuperar", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request("/usuarios/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  // Users (Admin)
  async getUsuarios(params: {
    skip?: number;
    limit?: number;
    rol?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.rol) query.append("rol", params.rol);
    const queryStr = query.toString();
    return this.request<{
      total: number;
      skip: number;
      limit: number;
      datos: any[];
    }>(`/usuarios/${queryStr ? `?${queryStr}` : ""}`);
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

  async getMiPerfil() {
    return this.request<any>("/usuarios/me");
  }

  async updateMiPerfil(data: { nombre_completo?: string; password?: string }) {
    return this.request<{ message: string }>("/usuarios/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Nadadores
  async getNadadores(params: {
    skip?: number;
    limit?: number;
    group_id?: string;
    include_archived?: boolean;
    search?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.group_id) query.append("group_id", params.group_id);
    if (params.include_archived) query.append("include_archived", "true");
    if (params.search) query.append("search", params.search);
    const queryStr = query.toString();
    return this.request<{
      total: number;
      skip: number;
      limit: number;
      datos: any[];
    }>(`/nadadores/${queryStr ? `?${queryStr}` : ""}`);
  }

  async getNadador(id: string) {
    return this.request<any>(`/nadadores/${id}`);
  }

  async createNadador(data: any) {
    return this.request<{ message: string; id: string; pseudonym: string }>("/nadadores/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNadador(id: string, data: any) {
    return this.request(`/nadadores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNadador(id: string) {
    return this.request<{ message: string; deleted_count: number; archived?: boolean }>(`/nadadores/${id}`, {
      method: "DELETE",
    });
  }

  // Training Groups
  async getGrupos() {
    return this.request<{
      total: number;
      skip: number;
      limit: number;
      datos: any[];
    }>("/grupos/");
  }

  async createGrupo(data: { name: string; description?: string }) {
    return this.request<{ message: string; id: string }>("/grupos/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateGrupo(id: string, data: { name?: string; description?: string; is_active?: boolean }) {
    return this.request(`/grupos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteGrupo(id: string) {
    return this.request(`/grupos/${id}`, {
      method: "DELETE",
    });
  }

  // Registros Diarios (Entrenamiento)
  async getRegistros(params: {
    skip?: number;
    limit?: number;
    nadador_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.nadador_id) query.append("nadador_id", params.nadador_id);
    if (params.fecha_desde) query.append("fecha_desde", params.fecha_desde);
    if (params.fecha_hasta) query.append("fecha_hasta", params.fecha_hasta);
    const queryStr = query.toString();
    return this.request<{
      total: number;
      skip: number;
      limit: number;
      registros: any[];
    }>(`/registros-diarios/${queryStr ? `?${queryStr}` : ""}`);
  }

  async getRegistrosByNadador(nadadorId: string, skip = 0, limit = 50) {
    return this.request<{
      total: number;
      skip: number;
      limit: number;
      registros: any[];
    }>(`/registros-diarios/nadador/${nadadorId}?skip=${skip}&limit=${limit}`);
  }

  async createRegistro(data: any) {
    return this.request("/registros-diarios/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRegistro(id: string, data: any) {
    return this.request(`/registros-diarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRegistro(id: string) {
    return this.request(`/registros-diarios/${id}`, {
      method: "DELETE",
    });
  }

  // Dashboard Stats
  async getDashboardStats(nadador_id?: string) {
    const query = nadador_id ? `?nadador_id=${nadador_id}` : "";
    return this.request<any>(`/dashboard/stats${query}`);
  }

  // Controles Fisiológicos
  async getControlesFisiologicos(params: { skip?: number; limit?: number; nadador_id?: string } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.nadador_id) query.append("nadador_id", params.nadador_id);
    const queryStr = query.toString();
    return this.request<{ total: number; skip: number; limit: number; datos: any[] }>(
      `/controles-fisiologicos/${queryStr ? `?${queryStr}` : ""}`
    );
  }

  async createControlFisiologico(data: any) {
    return this.request("/controles-fisiologicos/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateControlFisiologico(id: string, data: any) {
    return this.request(`/controles-fisiologicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteControlFisiologico(id: string) {
    return this.request(`/controles-fisiologicos/${id}`, {
      method: "DELETE",
    });
  }

  // Composición Corporal
  async getComposicionCorporal(params: { skip?: number; limit?: number; nadador_id?: string } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.nadador_id) query.append("nadador_id", params.nadador_id);
    const queryStr = query.toString();
    return this.request<{ total: number; skip: number; limit: number; datos: any[] }>(
      `/composicion-corporal/${queryStr ? `?${queryStr}` : ""}`
    );
  }

  async createComposicionCorporal(data: any) {
    return this.request("/composicion-corporal/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateComposicionCorporal(id: string, data: any) {
    return this.request(`/composicion-corporal/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteComposicionCorporal(id: string) {
    return this.request(`/composicion-corporal/${id}`, {
      method: "DELETE",
    });
  }

  // Análisis Competición
  async getAnalisisCompeticion(params: { skip?: number; limit?: number; nadador_id?: string; prueba?: string } = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append("skip", String(params.skip));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.nadador_id) query.append("nadador_id", params.nadador_id);
    if (params.prueba) query.append("prueba", params.prueba);
    const queryStr = query.toString();
    return this.request<{ total: number; skip: number; limit: number; datos: any[] }>(
      `/analisis-competicion/${queryStr ? `?${queryStr}` : ""}`
    );
  }

  async createAnalisisCompeticion(data: any) {
    return this.request("/analisis-competicion/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAnalisisCompeticion(id: string, data: any) {
    return this.request(`/analisis-competicion/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAnalisisCompeticion(id: string) {
    return this.request(`/analisis-competicion/${id}`, {
      method: "DELETE",
    });
  }

  // ACWR
  async getACWR(nadadorId: string, semanas = 8) {
    return this.request<any[]>(`/acwr/${nadadorId}?semanas=${semanas}`);
  }
}

export const api = new ApiClient();
export type { ApiError };

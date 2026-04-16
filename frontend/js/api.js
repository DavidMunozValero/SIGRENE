const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const SWIMMERS_CACHE_KEY = 'sigrene_swimmers_cache';
const SWIMMERS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        return localStorage.getItem('sigrene_token');
    }

    setToken(token) {
        localStorage.setItem('sigrene_token', token);
    }

    clearToken() {
        localStorage.removeItem('sigrene_token');
    }

    invalidateSwimmersCache() {
        localStorage.removeItem(SWIMMERS_CACHE_KEY);
    }

    getCachedSwimmers() {
        try {
            const cached = localStorage.getItem(SWIMMERS_CACHE_KEY);
            if (!cached) return null;
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > SWIMMERS_CACHE_TTL) {
                localStorage.removeItem(SWIMMERS_CACHE_KEY);
                return null;
            }
            return data;
        } catch {
            localStorage.removeItem(SWIMMERS_CACHE_KEY);
            return null;
        }
    }

    setCachedSwimmers(data) {
        try {
            localStorage.setItem(SWIMMERS_CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch {
            // Ignore storage errors
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error en la solicitud');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('No se pudo conectar con el servidor');
            }
            throw error;
        }
    }

    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Credenciales incorrectas');
        }

        return data;
    }

    async register(userData) {
        return this.request('/usuarios/registrar', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getRegistros(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.nadador_id) queryParams.append('nadador_id', params.nadador_id);
        if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
        if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);

        const query = queryParams.toString();
        const endpoint = `/registros-diarios/${query ? '?' + query : ''}`;
        
        return this.request(endpoint);
    }

    async getRegistroById(id) {
        return this.request(`/registros-diarios/${id}`);
    }

    async getRegistrosByNadador(nadadorId, skip = 0, limit = 50) {
        return this.request(`/registros-diarios/nadador/${nadadorId}?skip=${skip}&limit=${limit}`);
    }

    async createRegistro(data) {
        return this.request('/registros-diarios/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async requestPasswordRecovery(email) {
        return this.request('/usuarios/recuperar', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token, newPassword) {
        return this.request('/usuarios/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, new_password: newPassword })
        });
    }

    async createControlFisiologico(data) {
        return this.request('/controles-fisiologicos/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getControlesFisiologicos(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.nadador_id) queryParams.append('nadador_id', params.nadador_id);
        const query = queryParams.toString();
        return this.request(`/controles-fisiologicos/${query ? '?' + query : ''}`);
    }

    async createComposicionCorporal(data) {
        return this.request('/composicion-corporal/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getComposicionCorporal(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.nadador_id) queryParams.append('nadador_id', params.nadador_id);
        const query = queryParams.toString();
        return this.request(`/composicion-corporal/${query ? '?' + query : ''}`);
    }

    async createAnalisisCompeticion(data) {
        return this.request('/analisis-competicion/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getAnalisisCompeticion(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.nadador_id) queryParams.append('nadador_id', params.nadador_id);
        if (params.prueba) queryParams.append('prueba', params.prueba);
        const query = queryParams.toString();
        return this.request(`/analisis-competicion/${query ? '?' + query : ''}`);
    }

    async getACWR(nadadorId, semanas = 8) {
        return this.request(`/acwr/${nadadorId}?semanas=${semanas}`);
    }

    // Nadadores
    async getNadadores() {
        // Try cache first
        const cached = this.getCachedSwimmers();
        if (cached) return cached;
        
        const result = await this.request('/nadadores/');
        this.setCachedSwimmers(result);
        return result;
    }

    async getNadador(id) {
        return this.request(`/nadadores/${id}`);
    }

    async createNadador(data) {
        this.invalidateSwimmersCache();
        return this.request('/nadadores/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateNadador(id, data) {
        this.invalidateSwimmersCache();
        return this.request(`/nadadores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteNadador(id) {
        this.invalidateSwimmersCache();
        return this.request(`/nadadores/${id}`, {
            method: 'DELETE'
        });
    }

    // Updates y Deletes
    async updateRegistro(id, data) {
        return this.request(`/registros-diarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteRegistro(id) {
        return this.request(`/registros-diarios/${id}`, {
            method: 'DELETE'
        });
    }

    async updateControlFisiologico(id, data) {
        return this.request(`/controles-fisiologicos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteControlFisiologico(id) {
        return this.request(`/controles-fisiologicos/${id}`, {
            method: 'DELETE'
        });
    }

    async updateComposicionCorporal(id, data) {
        return this.request(`/composicion-corporal/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteComposicionCorporal(id) {
        return this.request(`/composicion-corporal/${id}`, {
            method: 'DELETE'
        });
    }

    async updateAnalisisCompeticion(id, data) {
        return this.request(`/analisis-competicion/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteAnalisisCompeticion(id) {
        return this.request(`/analisis-competicion/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new ApiClient();

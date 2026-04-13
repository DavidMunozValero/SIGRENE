const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
}

const api = new ApiClient();

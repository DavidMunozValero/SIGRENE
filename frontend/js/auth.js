class AuthManager {
    constructor() {
        this.TOKEN_KEY = 'sigrene_token';
        this.USER_KEY = 'sigrene_user';
    }

    isAuthenticated() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    login(token, userData = null) {
        localStorage.setItem(this.TOKEN_KEY, token);
        if (userData) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        }
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = 'index.html';
    }

    getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    }

    updateUser(userData) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }
}

const auth = new AuthManager();

function showAlert(message, type = 'error', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertHtml = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
    
    container.innerHTML = alertHtml;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

function setLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="loading"></span> Cargando...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateInput(date) {
    return date.toISOString().split('T')[0];
}

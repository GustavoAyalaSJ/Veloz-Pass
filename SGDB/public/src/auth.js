class AuthManager {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'user_data';
    }

    setToken(token, userData) {
        sessionStorage.setItem(this.tokenKey, token);
        sessionStorage.setItem(this.userKey, JSON.stringify({
            id: userData.id,
            nome: userData.nome,
        }));
    }

    getToken() {
        return sessionStorage.getItem(this.tokenKey);
    }

    getUserData() {
        const userData = sessionStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    clear() {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/introduction';
    }

    async request(url, options = {}) {
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.clear();
            return null;
        }

        return response;
    }

}

const auth = new AuthManager();
class AuthManager {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'user_data';
        this.newUserFlag = 'user-first-login';
        this.csrfTokenKey = 'csrf_token';
        this.csrfTokenFetched = false;
    }

    async initializeCsrfToken() {
        if (this.csrfTokenFetched) return;

        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.csrfToken) {
                    sessionStorage.setItem(this.csrfTokenKey, data.csrfToken);
                    this.csrfTokenFetched = true;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch CSRF token:', error);
        }
    }

    getCsrfToken() {
        return sessionStorage.getItem(this.csrfTokenKey);
    }

    setToken(token, userData) {
        sessionStorage.setItem(this.tokenKey, token);
        sessionStorage.setItem(this.userKey, JSON.stringify({
            id: userData.id,
            nome: userData.nome,
            cod_identificador: userData.cod_identificador
        }));

        const completionKey = 'mint-visto-' + userData.id;
        if (!localStorage.getItem(completionKey)) {
            sessionStorage.setItem(this.newUserFlag, 'true');
        }
    }

    getToken() {
        return sessionStorage.getItem(this.tokenKey);
    }

    getUserData() {
        const userDataStr = sessionStorage.getItem(this.userKey);
        return this.safeParse(userDataStr);
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    safeRedirect(path) {
        const allowedPaths = ['/introduction', '/dashboard', '/recarga', '/carteira_digital', '/historico'];
        if (allowedPaths.includes(path)) {
            window.location.href = path;
        } else {
            console.error('Unsafe redirect blocked:', path);
        }
    }

    clear() {
        try {
            sessionStorage.removeItem(this.tokenKey);
            sessionStorage.removeItem(this.userKey);
            sessionStorage.removeItem(this.newUserFlag);
            sessionStorage.removeItem(this.csrfTokenKey);
        } catch (e) {
            console.warn('Falha ao limpar sessionStorage:', e);
        }

        this.safeRedirect('/introduction');
    }

    safeParse(str) {
        if (typeof str !== 'string') return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            console.warn('JSON parse failed:', e);
            return null;
        }
    }

    async request(url, options = {}) {
        const token = this.getToken();
        const csrfToken = this.getCsrfToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase())) {
            headers['x-csrf-token'] = csrfToken;
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include'
        });

        if (response.status === 401) {
            this.clear();
            return null;
        }

        return response;
    }
}

const auth = new AuthManager();

document.addEventListener('DOMContentLoaded', () => {
    auth.initializeCsrfToken();
});

const rotasProtegidas = ['/dashboard', '/carteira_digital', '/recarga', '/historico'];

document.addEventListener('click', function (e) {
    const targetAnchor = e.target.closest('a[href]');
    if (!targetAnchor) return;

    const href = targetAnchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;

    try {
        const url = new URL(
            href.startsWith('/') ? `${window.location.origin}${href}` : href,
            window.location.origin
        );
        const pathname = url.pathname;
        
        if (pathname === '/app') return;

        const usuarioLogado = !!(auth.getToken() && auth.getUserData());

        if (rotasProtegidas.includes(pathname) && !usuarioLogado) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/introduction';
        }
    } catch (err) {
    }
});
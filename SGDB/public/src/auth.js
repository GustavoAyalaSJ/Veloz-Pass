class AuthManager {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'user_data';
        this.newUserFlag = 'user-first-login';
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
        return safeParse(userDataStr);
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
        sessionStorage.clear();
        localStorage.clear();
        this.safeRedirect('/introduction');
    }

    async getCsrfToken() {
        try {
            const response = await fetch('/csrf-token', { credentials: 'same-origin' });
            if (response.ok) {
                const data = await response.json();
                return data.csrfToken;
            }
        } catch (e) {
            console.warn('CSRF token fetch failed:', e);
        }
        return null;
    }

    async request(url, options = {}) {
        const token = this.getToken();
        const csrfToken = await this.getCsrfToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(csrfToken && ['POST', 'PUT', 'DELETE'].includes(options.method) && { 'X-CSRF-Token': csrfToken }),
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

document.addEventListener('click', function (e) {
    const target = e.target.closest('a, button, [onclick]');
    if (!target) return;

    let href = target.getAttribute('href') ||
        target.closest('a')?.getAttribute('href') ||
        target.getAttribute('data-href');

    if (!href || href.startsWith('http') || href.startsWith('#')) return;

    try {
        const url = new URL(href.startsWith('/') ? `${window.location.origin}${href}` : href, window.location.origin);
        const pathname = url.pathname;

        const rotasProtegidas = ['/dashboard', '/carteira_digital', '/recarga', '/historico'];
        const usuarioLogado = !!(auth.getToken() && auth.getUserData());

        if (rotasProtegidas.includes(pathname) && !usuarioLogado) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/introduction';
        }
    } catch (err) {

    }
}, true);
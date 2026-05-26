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
        sessionStorage.clear();
        localStorage.clear();
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

        const usuarioLogado = !!(auth.getToken() && auth.getUserData());

        if (rotasProtegidas.includes(pathname) && !usuarioLogado) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/introduction';
        }
    } catch (err) {
    }
});
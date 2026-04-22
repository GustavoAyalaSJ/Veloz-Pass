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
            cod_identificador: userData.cod_identificador
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

document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, [onclick]');
    if (!target) return;

    let href = target.getAttribute('href') || 
               target.closest('a')?.getAttribute('href') ||
               target.getAttribute('data-href');

    if (!href || href.startsWith('http') || href.startsWith('#')) return;

    try {
        const url = new URL(href.startsWith('/') ? `${window.location.origin}${href}` : href, window.location.origin);
        const pathname = url.pathname;

        const rotasProtegidas = ['/dashboard', '/Carteira_Digital', '/Recarga', '/historico_geral'];
        const usuarioLogado = !!(auth.getToken() && auth.getUserData());

        if (rotasProtegidas.includes(pathname) && !usuarioLogado) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/introduction';
        }
    } catch (err) {
       
    }
}, true);
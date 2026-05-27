const API_URL = process.env.REACT_APP_API_URL;

export const authService = {
  async login(email, senha, csrfToken) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ email, senha }),
    });
    if (!response.ok) throw new Error('Erro ao fazer login');
    return response.json();
  },

  async register(userData, csrfToken) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Erro ao fazer cadastro');
    return response.json();
  },

  async logout() {
    sessionStorage.clear();
  },
};

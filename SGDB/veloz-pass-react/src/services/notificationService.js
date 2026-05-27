const API_URL = process.env.REACT_APP_API_URL;

export const notificationService = {
  async listarNotificacoes(idUsuario, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/notifications/${idUsuario}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Erro ao listar notificações');
    return response.json();
  },

  async criarNotificacao(payload, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao criar notificação');
    return response.json();
  },
};

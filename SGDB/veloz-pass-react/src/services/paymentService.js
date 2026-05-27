const API_URL = process.env.REACT_APP_API_URL;

export const paymentService = {
  async obterCarteira(idUsuario, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/payments/wallet-data/${idUsuario}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Erro ao obter carteira');
    return response.json();
  },

  async obterHistorico(idUsuario, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/payments/historico-geral/${idUsuario}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Erro ao obter histórico');
    return response.json();
  },

  async adicionarCredito(payload, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/payments/add-credit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao adicionar crédito');
    return response.json();
  },

  async recarregaTransporte(payload, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/payments/recarga-transporte`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro na recarga de transporte');
    return response.json();
  },

  async salvarCartao(payload, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/payments/save-card`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao salvar cartão');
    return response.json();
  },

  async verificarCartao(payload, token, csrfToken) {
    const response = await fetch(`${API_URL}/api/payments/verify-card`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao verificar cartão');
    return response.json();
  },
};

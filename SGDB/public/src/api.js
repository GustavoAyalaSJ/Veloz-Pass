async function obterDadosCarteira(idUsuario) {

    if (typeof auth === 'undefined' || !auth.isAuthenticated()) {
        console.warn("Busca de carteira cancelada: Usuário não está logado.");
        return null; 
    }
    
    try {
        const response = await auth.request(`/api/payments/wallet-data/${idUsuario}`);
        if (!response || !response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Erro ao obter dados da carteira:", error);
        return null;
    }
}

async function adicionarCredito(valor, metodo, numCartao, idBandeira) {
    try {
        const response = await auth.request('/api/payments/add-credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor, metodo, numCartao, idBandeira })
        });

        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.error || 'Erro ao adicionar crédito');
        }

        const data = await response.json();
        console.log("Crédito adicionado:", data);
        return data;
    } catch (error) {
        console.error("Erro na API de crédito:", error);
        return null;
    }
}

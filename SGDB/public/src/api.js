async function obterDadosCarteira(idUsuario) {
    const token = auth.getToken();
    if (!token) {
        console.warn("Usuário não autenticado.");
        return null;
    }

    try {
        const response = await fetch(`/api/payments/wallet-data/${idUsuario}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Erro ao obter dados da carteira:", error);
        return null;
    }
}

async function adicionarCredito(valor, metodoRaw, numCartaoInput) {
    const token = auth.getToken();
    if (!token) return alert("Usuário não autenticado.");

    const payload = { valor, metodo: metodoRaw, numCartao: numCartaoInput };

    try {
        const response = await fetch('/api/payments/add-credit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data.error || "Erro ao adicionar crédito.");
        }

        alert(`Crédito solicitado com sucesso! Protocolo: ${data.protocolo}`);
    } catch (err) {
        console.error(err);
        alert("Erro de conexão ao adicionar crédito.");
    }
}

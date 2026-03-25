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
    const mapaMetodos = {
        'débito': 'DEBITO',
        'crédito': 'CREDITO',
        'internacional': 'INTERNACIONAL',
        'pix': 'PIX',
        'carteira_digital': 'CARTEIRA_DIGITAL'
    };

    const metodo = mapaMetodos[metodoRaw.toLowerCase()];
    if (!metodo) return alert("Método de pagamento inválido.");

    let idBandeira = null;
    let numCartao = null;
    const metodosComCartao = ['DEBITO', 'CREDITO', 'INTERNACIONAL'];

    if (metodosComCartao.includes(metodo)) {
        numCartao = numCartaoInput.replace(/\D/g, '');
        if (numCartao.length < 13 || numCartao.length > 19) return alert("Número de cartão inválido.");
        const ultimoDigito = parseInt(numCartao.slice(-1));
        if (ultimoDigito >= 1 && ultimoDigito <= 5) idBandeira = ultimoDigito;
        else return alert("Último dígito do cartão não reconhecido.");
    }

    const payload = {
        valor: parseFloat(valor),
        metodo,
        numCartao,
        idBandeira
    };

    try {
        const response = await auth.request('/api/payments/add-credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response) return;
        const data = await response.json();
        if (!response.ok) return alert(data.error || "Erro ao adicionar crédito.");
        alert(`Crédito solicitado com sucesso! Protocolo: ${data.protocolo}`);
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Erro de conexão ao adicionar crédito.");
    }
}
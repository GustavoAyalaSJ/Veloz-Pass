async function obterDadosCarteira(idUsuario) {
    const token = auth.getToken();
    if (!token) return null;

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
    let numCartaoLimpo = null;
    const metodosComCartao = ['DEBITO', 'CREDITO', 'INTERNACIONAL'];

    if (metodosComCartao.includes(metodo)) {
        numCartaoLimpo = numCartaoInput.replace(/\D/g, '');
        if (numCartaoLimpo.length < 13 || numCartaoLimpo.length > 16) {
            return alert("O número do cartão deve ter entre 13 e 16 dígitos.");
        }
        const ultimoDigito = parseInt(numCartaoLimpo.slice(-1));
        if (ultimoDigito >= 1 && ultimoDigito <= 5) {
            idBandeira = ultimoDigito;
        } else {
            return alert("Para testes, use um cartão com final entre 1 e 5.");
        }
    }

    const payload = {
        valor: parseFloat(valor),
        metodo,
        numCartao: numCartaoLimpo,
        idBandeira
    };

    try {
        const token = auth.getToken();
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
            console.error('API Error:', data);
            return alert('Erro ao adicionar crédito: ' + (data.error || data.details || 'Erro desconhecido'));
        }

        alert(`Crédito adicionado com sucesso! Protocolo: ${data.protocolo}`);
        location.reload();
    } catch (err) {
        console.error('Fetch Error:', err);
        alert("Erro de conexão ao adicionar crédito.");
    }
}

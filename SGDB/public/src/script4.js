document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;
    if (!idLogado) return window.location.href = "/introduction";

    const btnInserir = document.getElementById('btn-inserir-credito');
    const modalValor = document.getElementById('modal-valor');
    const modalPagamento = document.getElementById('modal-pagamento');
    const btnProximo = document.getElementById('btn-proximo');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const optValores = document.querySelectorAll('.opt-valor');
    const inputPersonalizado = document.getElementById('valor-personalizado');
    const valorConfirmadoTxt = document.getElementById('valor-confirmado');
    const saldoDisplay = document.getElementById('saldo-usuario');
    const corpoTabela = document.getElementById('corpo-tabela');
    const selectPagamento = document.getElementById('select-pagamento');

    let valorParaInserir = 0;
    const metodosComCartao = ['débito', 'crédito', 'internacional'];

    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
    containerCartao.style.display = 'none';
    containerCartao.innerHTML = `
        <input type="text" id="num-cartao" placeholder="Número do Cartão" maxlength="16">
        <input type="text" id="validade-cartao" placeholder="MM/YY" maxlength="5">
        <input type="text" id="cvv-cartao" placeholder="CVV" maxlength="3">
    `;
    const containerPix = document.createElement('div');
    containerPix.id = 'container-pix';
    containerPix.style.display = 'none';
    containerPix.innerHTML = `<div>PIX QR Code Aqui</div>`;

    if (selectPagamento) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');
        if (wrapper) {
            wrapper.parentNode.insertBefore(containerCartao, wrapper.nextSibling);
            wrapper.parentNode.insertBefore(containerPix, wrapper.nextSibling);
        }
        selectPagamento.addEventListener('change', () => {
            const metodo = selectPagamento.value;
            containerCartao.style.display = metodosComCartao.includes(metodo) ? 'block' : 'none';
            containerPix.style.display = metodo === 'pix' ? 'block' : 'none';
        });
    }

    document.addEventListener('input', e => {
        if (e.target.id === 'validade-cartao') {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 4) v = v.slice(0, 4);
            if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
            e.target.value = v;
        }
    });

    optValores.forEach(opt => {
        opt.addEventListener('click', () => {
            optValores.forEach(o => o.classList.remove('ativo'));
            opt.classList.add('ativo');
            if (inputPersonalizado) inputPersonalizado.value = '';
            valorParaInserir = parseFloat(opt.dataset.valor);
        });
    });

    if (inputPersonalizado) {
        inputPersonalizado.addEventListener('input', () => {
            optValores.forEach(o => o.classList.remove('ativo'));
            valorParaInserir = parseFloat(inputPersonalizado.value) || 0;
        });
    }

    if (btnInserir) btnInserir.addEventListener('click', () => modalValor.style.display = 'flex');
    document.querySelectorAll('.btn-cancelar').forEach(btn => btn.addEventListener('click', () => {
        modalValor.style.display = 'none';
        modalPagamento.style.display = 'none';
        optValores.forEach(o => o.classList.remove('ativo'));
        if (inputPersonalizado) inputPersonalizado.value = '';
        valorParaInserir = 0;
    }));

    if (btnProximo) btnProximo.addEventListener('click', () => {
        if (valorParaInserir <= 0) return alert("Valor inválido.");
        if (valorConfirmadoTxt) valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        modalValor.style.display = 'none';
        modalPagamento.style.display = 'flex';
    });

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            const metodoRaw = selectPagamento?.value;
            let numCartaoInput = document.getElementById('num-cartao')?.value || "";
            numCartaoInput = numCartaoInput.replace(/\D/g, '');

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
            if (['DEBITO', 'CREDITO', 'INTERNACIONAL'].includes(metodo)) {
                const ultimoDigito = parseInt(numCartao.slice(-1), 10);
                if (ultimoDigito >= 1 && ultimoDigito <= 5) {
                    idBandeira = ultimoDigito;
                } else {
                    idBandeira = null;
                }
            }

            const metodosComCartao = ['DEBITO', 'CREDITO', 'INTERNACIONAL'];
            if (metodosComCartao.includes(metodo)) {
                if (numCartaoInput.length !== 16)
                    return alert("O número do cartão deve ter 16 dígitos.");

                const ultimoDigito = parseInt(numCartaoInput.slice(-1), 10);
                if (ultimoDigito >= 1 && ultimoDigito <= 5) idBandeira = ultimoDigito;
                else return alert("Último dígito do cartão não corresponde no sistema.");
            }

            const payload = {
                valor: valorParaInserir,
                metodo,
                numCartao: metodosComCartao.includes(metodo) ? numCartaoInput : null,
                idBandeira
            };

            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Processando...";

            try {
                const response = await auth.request('/api/payments/add-credit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response && response.ok) {
                    const data = await response.json();
                    alert(`Crédito solicitado com sucesso! Protocolo: ${data.protocolo}`);
                    location.reload();
                } else {
                    const erroData = await response.json();
                    alert(erroData.error || "Erro no servidor.");
                    btnFinalizar.disabled = false;
                    btnFinalizar.innerText = "Finalizar";
                }
            } catch (err) {
                alert("Erro de conexão.");
                btnFinalizar.disabled = false;
                btnFinalizar.innerText = "Finalizar";
            }
        });
    }

    async function carregarDadosIniciais() {
        const token = auth.getToken();
        if (!token) return console.error("Token não encontrado.");

        try {
            const response = await fetch(`/api/payments/wallet-data/${idLogado}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            if (!data) return;
            if (saldoDisplay) saldoDisplay.innerText = `R$ ${parseFloat(data.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            if (!corpoTabela) return;
            corpoTabela.innerHTML = '';
            if (!data.historico || !data.historico.length) {
                corpoTabela.innerHTML = '<tr><td colspan="5">Sem movimentações.</td></tr>';
            } else {
                data.historico.forEach(mov => {
                    const situacao = (mov.situacao || 'pendente').toLowerCase();
                    const classe = situacao.includes('concl') ? 'status-verde' :
                        (situacao.includes('rev') || situacao.includes('pend') ? 'status-amarelo' : 'status-vermelho');
                    const linha = document.createElement('tr');
                    linha.className = classe;
                    linha.innerHTML = `
                        <td>${mov.bandeira_banco?.nome_bandeira || '---'}</td>
                        <td>${mov.n_protocolo || '---'}</td>
                        <td>${(mov.tipo || 'Crédito').toUpperCase()}</td>
                        <td>${mov.metodo_pagamento || '---'}</td>
                        <td>R$ ${parseFloat(mov.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td><button class="btn-print"><i class="bi bi-printer"></i> IMPRIMIR</button></td>
                    `;
                    corpoTabela.appendChild(linha);
                });
            }
        } catch (e) { console.error(e); }
    }

    carregarDadosIniciais();
});
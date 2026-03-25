document.addEventListener('DOMContentLoaded', () => {

    const userData = auth.getUserData();
    const idLogado = userData?.id;

    if (!idLogado) {
        window.location.href = "/introduction";
        return;
    }

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
        <p>Informações do Cartão:</p>
        <input type="text" id="num-cartao" placeholder="Número do Cartão (16 dígitos)" maxlength="16">
        <div class="card-inputs-wrapper">
            <input type="text" id="validade-cartao" placeholder="MM/YY" maxlength="5">
            <input type="text" id="cvv-cartao" placeholder="CVV" maxlength="3">
        </div>
    `;

    const containerPix = document.createElement('div');
    containerPix.id = 'container-pix';
    containerPix.style.display = 'none';
    containerPix.innerHTML = `
        <p>QR Code PIX:</p>
        <div style="text-align:center; padding:10px; background:#f4f4f4; border-radius:8px;">
            <i class="bi bi-qr-code" style="font-size: 80px;"></i>
            <p style="font-size:12px; color:#666;">Aguardando confirmação...</p>
        </div>
    `;

    if (selectPagamento) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');
        if (wrapper) {
            wrapper.parentNode.insertBefore(containerCartao, wrapper.nextSibling);
            wrapper.parentNode.insertBefore(containerPix, wrapper.nextSibling);
        }

        selectPagamento.addEventListener('change', () => {
            const metodoSelecionado = selectPagamento.value;
            containerCartao.style.display = metodosComCartao.includes(metodoSelecionado) ? 'block' : 'none';
            containerPix.style.display = metodoSelecionado === 'pix' ? 'block' : 'none';
            if (wrapper) wrapper.classList.remove('active');
        });
    }

    document.addEventListener('input', (e) => {
        if (e.target.id === 'validade-cartao') {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 4) v = v.slice(0, 4);
            if (v.length >= 3) {
                v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
            }
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

    if (btnInserir) {
        btnInserir.addEventListener('click', () => {
            modalValor.style.display = 'flex';
        });
    }

    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', () => {
            modalValor.style.display = 'none';
            modalPagamento.style.display = 'none';
            optValores.forEach(o => o.classList.remove('ativo'));
            if (inputPersonalizado) inputPersonalizado.value = '';
            valorParaInserir = 0;
        });
    });

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (valorParaInserir <= 0) return alert("Selecione ou digite um valor válido.");
            if (valorConfirmadoTxt) {
                valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }
            modalValor.style.display = 'none';
            modalPagamento.style.display = 'flex';
        });
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            const metodoRaw = selectPagamento?.value;
            if (!metodoRaw) return alert("Selecione o método de pagamento.");

            const numCartao = document.getElementById('num-cartao')?.value || "";

            if (metodosComCartao.includes(metodoRaw) && numCartao.length < 16) {
                return alert("Por favor, digite os 16 dígitos do cartão.");
            }

            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Processando...";

            let metodoFormatado = metodoRaw.toUpperCase();
            if (metodoRaw === 'débito') metodoFormatado = 'DEBITO';
            if (metodoRaw === 'crédito') metodoFormatado = 'CREDITO';

            try {
                const response = await auth.request('/api/payments/add-credit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        valor: valorParaInserir,
                        metodo: metodoFormatado,
                        numCartao: metodosComCartao.includes(metodoRaw) ? numCartao : null,
                        idBandeira: null
                    })
                });

                if (response && response.ok) {
                    alert("Crédito solicitado com sucesso!");
                    location.reload();
                } else {
                    const erro = await response.json();
                    alert(erro.error || "Erro ao processar. Tente novamente.");
                    btnFinalizar.disabled = false;
                    btnFinalizar.innerText = "Finalizar";
                }
            } catch (err) {
                alert("Erro de conexão com o servidor.");
                btnFinalizar.disabled = false;
                btnFinalizar.innerText = "Finalizar";
            }
        });
    }

    async function carregarDadosIniciais() {
        try {
            const response = await auth.request(`/api/payments/wallet-data/${idLogado}`);
            if (!response || !response.ok) return;

            const data = await response.json();
            if (!data) return;

            if (saldoDisplay) {
                const saldoNumerico = parseFloat(data.saldo_atual) || 0;
                saldoDisplay.innerText = `R$ ${saldoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            if (corpoTabela && data.historico) {
                corpoTabela.innerHTML = data.historico.length ? '' : '<tr><td colspan="5">Sem movimentações.</td></tr>';
                data.historico.forEach(mov => {
                    const situacao = (mov.situacao || 'pendente').toLowerCase();
                    const classe = situacao.includes('concl') ? 'status-verde' :
                                   (situacao.includes('rev') || situacao.includes('pend') ? 'status-amarelo' : 'status-vermelho');

                    const linha = document.createElement('tr');
                    linha.className = classe;
                    linha.innerHTML = `
                        <td class="protocolo-texto">${mov.n_protocolo || '---'}</td>
                        <td class="table-bold">${(mov.tipo || 'Crédito').toUpperCase()}</td>
                        <td>${mov.metodo_pagamento || '---'}</td>
                        <td class="table-bold">R$ ${parseFloat(mov.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td><button class="btn-print"><i class="bi bi-printer"></i> IMPRIMIR</button></td>
                    `;
                    corpoTabela.appendChild(linha);
                });
            }
        } catch (e) { console.error(e); }
    }

    carregarDadosIniciais();
});
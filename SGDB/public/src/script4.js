document.addEventListener('DOMContentLoaded', () => {

    const userData = auth.getUserData();
    const idLogado = userData?.id;

    if (!idLogado) {
        window.location.href = "/introduction";
        return;
    }

    const listButton = document.getElementById('list-button');
    const contentDropdown = document.getElementById('content-dropdown');
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

    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
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
    containerPix.innerHTML = `
        <p>QR Code PIX:</p>
        <div>
            Placeholder QR Code
        </div>
    `;

    if (selectPagamento) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');
        
        if (wrapper) {
            wrapper.parentNode.insertBefore(containerCartao, wrapper.nextSibling);
            wrapper.parentNode.insertBefore(containerPix, wrapper.nextSibling);
        }

        selectPagamento.addEventListener('change', () => {
            const metodosComCartao = ['débito', 'crédito', 'internacional'];
            const metodoSelecionado = selectPagamento.value;
            
            containerCartao.style.display = metodosComCartao.includes(metodoSelecionado) ? 'block' : 'none';
            containerPix.style.display = metodoSelecionado === 'pix' ? 'block' : 'none';
            
            if (wrapper) wrapper.classList.remove('active');
        });

        selectPagamento.addEventListener('click', () => {
            if (wrapper) wrapper.classList.toggle('active');
        });

        selectPagamento.addEventListener('blur', () => {
            setTimeout(() => { if (wrapper) wrapper.classList.remove('active'); }, 200);
        });
    }

    optValores.forEach(opt => {
        opt.addEventListener('click', () => {
            if (opt.classList.contains('ativo')) {
                opt.classList.remove('ativo');
                valorParaInserir = 0;
            } else {
                optValores.forEach(o => o.classList.remove('ativo'));
                opt.classList.add('ativo');
                if (inputPersonalizado) inputPersonalizado.value = '';
                valorParaInserir = parseFloat(opt.dataset.valor);
            }
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
            const metodo = selectPagamento?.value;
            if (!metodo) return alert("Selecione o método de pagamento.");

            const inputCartao = document.getElementById('num-cartao');
            const numCartao = inputCartao?.value || "";

            const metodosComCartao = ['débito', 'crédito', 'internacional'];

            if (metodosComCartao.includes(metodo) && numCartao.length < 16) {
                return alert("Por favor, digite os 16 dígitos do cartão.");
            }

            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Processando...";

            try {
                const response = await auth.request('/api/payments/add-credit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        valor: valorParaInserir,
                        metodo: metodo.toUpperCase(),
                        numCartao: metodosComCartao.includes(metodo) ? numCartao : null,
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
            if (typeof obterDadosCarteira !== 'function') return;
            const data = await obterDadosCarteira(idLogado);
            if (!data) return;

            if (saldoDisplay) {
                const saldoNumerico = parseFloat(data.saldo) || 0;
                saldoDisplay.innerText = `R$ ${saldoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            if (corpoTabela && data.historico) {
                corpoTabela.innerHTML = data.historico.length ? '' : '<tr><td colspan="5">Sem movimentações.</td></tr>';
                data.historico.forEach(mov => {
                    const situacao = (mov.situacao || 'pendente').toLowerCase();
                    const classe = situacao.includes('concl') ? 'status-verde' : (situacao.includes('rev') || situacao.includes('pend') ? 'status-amarelo' : 'status-vermelho');
                    
                    const linha = document.createElement('tr');
                    linha.className = classe;
                    linha.innerHTML = `
                        <td class="protocolo-texto">${mov.n_protocolo || '---'}</td>
                        <td class="table-bold">${(mov.tipo || 'Crédito').toUpperCase()}</td>
                        <td>${mov.nome_bandeira || '---'}</td>
                        <td class="table-bold">R$ ${parseFloat(mov.valor).toFixed(2).replace('.', ',')}</td>
                        <td><button class="btn-print"><i class="bi bi-printer"></i> IMPRIMIR</button></td>
                    `;
                    corpoTabela.appendChild(linha);
                });
            }
        } catch (e) { console.error(e); }
    }

    if (listButton && contentDropdown) {
        listButton.addEventListener('click', (e) => {
            e.stopPropagation();
            contentDropdown.classList.toggle('active');
        });
        window.addEventListener('click', () => contentDropdown.classList.remove('active'));
    }

    carregarDadosIniciais();
});
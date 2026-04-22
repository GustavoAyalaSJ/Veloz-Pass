document.addEventListener('DOMContentLoaded', () => {
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };
    
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
    const btnDropdown = document.querySelector('#list-button.icon-button');
    const contentDropdown = document.getElementById('content-dropdown');
    const filtroRealizadoPor = document.getElementById('filtro-realizado-por');
    const filtroBandeira = document.getElementById('filtro-bandeira');
    const filtroSituacao = document.getElementById('filtro-situacao');

    let dadosHistoricoCompleto = [];
    let valorParaInserir = 0;
    let idBandeiraSelecionada = null;
    const metodosComCartaoTexto = ['débito', 'crédito', 'internacional'];

    if (btnDropdown && contentDropdown) {
        btnDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        const icon = btnDropdown.querySelector('i');
        window.toggleElement(btnDropdown, contentDropdown, 'open', 'show', icon);
        });
    }

    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
    containerCartao.className = 'payment-method-container';
    containerCartao.style.display = 'none';
    containerCartao.innerHTML = `
        <input type="text" id="num-cartao" placeholder="Número do Cartão" maxlength="16">
        <div class="row-cartao">
            <input type="text" id="validade-cartao" placeholder="MM/YY" maxlength="5">
            <input type="text" id="cvv-cartao" placeholder="CVV" maxlength="3">
        </div>
    `;

    const containerPix = document.createElement('div');
    containerPix.id = 'container-pix';
    containerPix.className = 'payment-method-container';
    containerPix.style.display = 'none';
    containerPix.innerHTML = `<div class="pix-placeholder">Placeholder QR Code...</div>`;

    if (selectPagamento) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');
        if (wrapper) {
            wrapper.parentNode.insertBefore(containerCartao, wrapper.nextSibling);
            wrapper.parentNode.insertBefore(containerPix, wrapper.nextSibling);
        }

        selectPagamento.addEventListener('change', () => {
            const metodo = selectPagamento.value.toLowerCase();
            containerCartao.style.display = metodosComCartaoTexto.includes(metodo) ? 'block' : 'none';
            containerPix.style.display = metodo === 'pix' ? 'block' : 'none';
            idBandeiraSelecionada = null;
        });
    }

    const inputCartao = containerCartao.querySelector('#num-cartao');
    if (inputCartao) {
        inputCartao.addEventListener('input', (e) => {
            let num = e.target.value.replace(/\D/g, '');
            e.target.value = num;
            if (num.length > 0) {
                const ultimoDigito = parseInt(num.slice(-1));
                idBandeiraSelecionada = (ultimoDigito >= 1 && ultimoDigito <= 5) ? ultimoDigito : null;
            } else {
                idBandeiraSelecionada = null;
            }
        });
    }

    document.addEventListener('input', (e) => {
        if (e.target.id === 'validade-cartao') {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 4) v = v.slice(0, 4);
            if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
            e.target.value = v;
        }
    });

    function formatarMoeda(valor) {
        let v = valor.replace(/\D/g, "");
        v = (v / 100).toFixed(2).replace(".", ",");
        v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return "R$ " + v;
    }

    if (inputPersonalizado) {
        inputPersonalizado.addEventListener('input', (e) => {
            optValores.forEach(o => o.classList.remove('ativo'));
            const valorFormatado = formatarMoeda(e.target.value);
            e.target.value = valorFormatado;
            valorParaInserir = parseFloat(valorFormatado.replace("R$ ", "").replace(/\./g, "").replace(",", ".")) || 0;
        });
    }

    optValores.forEach(opt => {
        opt.addEventListener('click', () => {
            const jaEstaAtivo = opt.classList.contains('ativo');

            optValores.forEach(o => o.classList.remove('ativo'));
            if (inputPersonalizado) inputPersonalizado.value = '';

            if (jaEstaAtivo) {
                valorParaInserir = 0;
            } else {
                opt.classList.add('ativo');
                valorParaInserir = parseFloat(opt.dataset.valor);
            }
        });
    });

    if (btnInserir) btnInserir.addEventListener('click', () => modalValor.style.display = 'flex');

    document.querySelectorAll('.btn-cancelar').forEach(btn => btn.addEventListener('click', () => {
        modalValor.style.display = 'none';
        modalPagamento.style.display = 'none';
        optValores.forEach(o => o.classList.remove('ativo'));
        if (inputPersonalizado) inputPersonalizado.value = '';
        valorParaInserir = 0;
    }));

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (valorParaInserir < 5.00) {
                return alert("Valor mínimo requisitado: R$ 5,00.");
            }

            if (valorConfirmadoTxt) {
                valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            modalValor.style.display = 'none';
            modalPagamento.style.display = 'flex';
        });
    }

    function validarDataExpiracao(validade) {
        if (!validade || validade.length < 5) {
            alert("Preencha a validade corretamente (MM/YY).");
            return false;
        }
        const [mes, ano] = validade.split('/').map(v => parseInt(v));
        const anoAtual = new Date().getFullYear() % 100;

        if (mes < 1 || mes > 12) return alert("Mês inválido!");
        if (ano < anoAtual) return alert("Cartão vencido!");
        return true;
    }

    async function adicionarCredito(valor, metodo, numCartao) {
        const token = auth.getToken();

        try {
            const response = await fetch(`${window.location.origin}/api/payments/add-credit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    valor,
                    metodo: metodo.toUpperCase(),
                    numCartao,
                    idBandeira: idBandeiraSelecionada,
                    origem: "Carteira Digital"
                })
            });

            const result = await response.json();

            let mensagemAlert = '';
            if (result.situacao?.includes('Concluido') || result.success) {
                mensagemAlert = `Crédito adicionado com sucesso! Protocolo: ${result.protocolo}`;
            } else if (result.situacao?.includes('Em_Revisão')) {
                mensagemAlert = `Saldo em revisão, aguarde a aprovação do sistema. Protocolo: ${result.protocolo}`;
            } else if (result.situacao?.includes('Recusada')) {
                mensagemAlert = `Transação recusada! Protocolo: ${result.protocolo}`;
            } else {
                alert(result.error || 'Erro desconhecido');
                return;
            }

            alert(mensagemAlert);
            modalPagamento.style.display = 'none';
            valorParaInserir = 0;

            if (inputPersonalizado) inputPersonalizado.value = '';
            optValores.forEach(o => o.classList.remove('ativo'));

            await carregarDadosIniciais();
        } catch (error) {
            console.error("Erro na transação:", error);
            alert("Erro de conexão com o servidor.");
        }
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            const metodoRaw = selectPagamento?.value;
            if (!metodoRaw) return alert('Selecione um método de pagamento.');

            if (metodosComCartaoTexto.includes(metodoRaw.toLowerCase())) {
                const validadeInput = document.getElementById('validade-cartao')?.value;
                if (!validarDataExpiracao(validadeInput)) return;
            }

            const numCartaoInput = document.getElementById('num-cartao')?.value || "";
            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Processando...";

            await adicionarCredito(valorParaInserir, metodoRaw, numCartaoInput);

            btnFinalizar.disabled = false;
            btnFinalizar.innerText = "Finalizar";
        });
    }

    async function carregarDadosIniciais() {
        const token = auth.getToken();
        if (!token) return;

        try {
            const response = await fetch(`${window.location.origin}/api/payments/wallet-data/${idLogado}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) return;
            const data = await response.json();

            if (saldoDisplay) {
                saldoDisplay.innerText = `R$ ${parseFloat(data.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            dadosHistoricoCompleto = data.historico || [];

            const historicoFiltrado = dadosHistoricoCompleto.filter(mov =>
                normalizarTexto(mov.tipo_movimentacao).includes('carteira_digital')
            );

            renderizarTabela(historicoFiltrado);

            if (filtroRealizadoPor) filtroRealizadoPor.onchange = aplicarFiltros;
            if (filtroBandeira) filtroBandeira.onchange = aplicarFiltros;
            if (filtroSituacao) filtroSituacao.onchange = aplicarFiltros;

        } catch (e) {
            console.error("Erro ao carregar dados:", e);
        }
    }

    function renderizarTabela(dados) {
        if (!dados || !dados.length) {
            corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align:center;">Sem movimentações encontradas.</td></tr>';
            return;
        }

        const fragment = document.createDocumentFragment();

        dados.forEach(mov => {
            const situacao = (mov.situacao || '').toLowerCase();

            let classe = 'status-vermelho';

            if (situacao.includes('concl')) {
                classe = 'status-verde';
            } else if (situacao.includes('revis') || situacao.includes('pend')) {
                classe = 'status-amarelo';
            }

            const linha = document.createElement('tr');
            linha.className = classe;

            const metodoExibicao = (mov.metodo_pagamento || mov.metodo || 'PIX').toUpperCase();
            const bandeira = (mov.bandeira_banco?.nome_bandeira || '---').toUpperCase();

            const valorFormatado = parseFloat(mov.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            linha.innerHTML = `
            <td>${mov.n_protocolo || '---'}</td>
            <td>${metodoExibicao}</td>
            <td>${bandeira}</td>
            <td class="table-bold">${valorFormatado}</td>
            <td>
                <button class="btn-print">
                    <i class="bi bi-printer"></i> IMPRIMIR
                </button>
            </td>
        `;
            fragment.appendChild(linha);
        });

        corpoTabela.innerHTML = '';
        corpoTabela.appendChild(fragment);
    }

    function aplicarFiltros() {
        const valRealizadoPor = normalizarTexto(filtroRealizadoPor?.value);
        const valBandeira = normalizarTexto(filtroBandeira?.value);
        const valSituacao = normalizarTexto(filtroSituacao?.value);

        const filtrados = dadosHistoricoCompleto.filter(mov => {
            const rPor = normalizarTexto(mov.metodo_pagamento || mov.metodo || 'pix');
            const band = normalizarTexto(mov.bandeira_banco?.nome_bandeira || '');
            const sit = normalizarTexto(mov.situacao || '');

            return (!valRealizadoPor || rPor === valRealizadoPor) &&
                (!valBandeira || band === valBandeira) &&
                (!valSituacao || sit === valSituacao);
        });

        renderizarTabela(filtrados);
    }

    function normalizarTexto(txt) {
        return (txt || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    document.querySelectorAll('.filtro-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const select = item.querySelector('.filtro-select');
            const icon = item.querySelector('.select-icon');
            if (select && icon) {
                toggleElement(item, item, 'active', 'active', icon);
            }
        });
    });

    carregarDadosIniciais();
});
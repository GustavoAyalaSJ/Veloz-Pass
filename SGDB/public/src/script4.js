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
    const filtroRealizadoPor = document.getElementById('filtro-realizado-por');
    const filtroBandeira = document.getElementById('filtro-bandeira');
    const filtroSituacao = document.getElementById('filtro-situacao');

    let dadosHistoricoCompleto = [];
    let valorParaInserir = 0;
    let idBandeiraSelecionada = null;
    const metodosComCartaoTexto = ['débito', 'crédito', 'internacional'];

    const containerCartao = document.getElementById('container-cartao');
    const containerPix = document.getElementById('container-pix');

    if (selectPagamento && containerCartao && containerPix) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');

        function atualizarVisibilidadePagamento() {
            const metodo = (selectPagamento.value || '').toLowerCase();

            const selecionado = !!metodo;

            const exibeCartao = selecionado && metodosComCartaoTexto.includes(metodo);
            const exibePix = selecionado && (metodo === 'pix');

            containerCartao.classList.toggle('hidden', !exibeCartao);
            containerPix.classList.toggle('hidden', !exibePix);

            if (btnFinalizar) {
                btnFinalizar.classList.toggle('hidden', !selecionado);
            }

            idBandeiraSelecionada = null;
        }

        selectPagamento.addEventListener('focus', () => wrapper?.classList.add('active'));
        selectPagamento.addEventListener('blur', () => wrapper?.classList.remove('active'));

        selectPagamento.addEventListener('change', () => {
            wrapper?.classList.add('active');
            atualizarVisibilidadePagamento();
        });

        atualizarVisibilidadePagamento();
    }

    const inputCartao = document.getElementById('num-cartao');
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
            optValores.forEach(o => o.classList.remove('active'));
            const valorFormatado = formatarMoeda(e.target.value);
            e.target.value = valorFormatado;
            valorParaInserir = parseFloat(valorFormatado.replace("R$ ", "").replace(/\./g, "").replace(",", ".")) || 0;
        });
    }

    optValores.forEach(opt => {
        opt.addEventListener('click', () => {
            const jaEstaAtivo = opt.classList.contains('active');

            optValores.forEach(o => o.classList.remove('active'));
            if (inputPersonalizado) inputPersonalizado.value = '';

            if (jaEstaAtivo) {
                valorParaInserir = 0;
            } else {
                opt.classList.add('active');
                valorParaInserir = parseFloat(opt.dataset.valor);
            }
        });
    });

    if (btnInserir) {
        btnInserir.addEventListener('click', () => {
            modalValor.classList.add('active');

        });
    }

    const btnRetornar = document.querySelector('.btn-retornar');
    if (btnRetornar) {
        btnRetornar.addEventListener('click', (e) => {
            e.preventDefault();
            modalValor.classList.add('active');
            modalPagamento.classList.remove('active');
        });
    }

    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', () => {
            modalValor.classList.remove('active');
            modalPagamento.classList.remove('active');
            optValores.forEach(o => o.classList.remove('active'));
            if (inputPersonalizado) inputPersonalizado.value = '';
            valorParaInserir = 0;
        });
    });

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (valorParaInserir < 5.00) {
                return alert("Valor mínimo requisitado: R$ 5,00.");
            }

            if (valorConfirmadoTxt) {
                valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            modalValor.classList.remove('active');
            modalPagamento.classList.add('active');

            if (selectPagamento && containerCartao && containerPix) {
                const metodo = (selectPagamento.value || '').toLowerCase();
                const selecionado = !!metodo;

                const exibeCartao = selecionado && metodosComCartaoTexto.includes(metodo);
                const exibePix = selecionado && (metodo === 'pix');

                containerCartao.classList.toggle('hidden', !exibeCartao);
                containerPix.classList.toggle('hidden', !exibePix);

                if (btnFinalizar) btnFinalizar.classList.toggle('hidden', !selecionado);
                idBandeiraSelecionada = null;
            }
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
        if (ano < anoAtual) return alert("Data de validade inválida ou expirada.");
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

            let modalStatus = null;
            const situacaoNormalizada = result.situacao?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (situacaoNormalizada?.includes('Concluido')) {
                modalStatus = 'success';
            } else if (situacaoNormalizada?.includes('Em_Revisao')) {
                modalStatus = 'under-review';
            } else if (situacaoNormalizada?.includes('Recusada') || !result.success) {
                modalStatus = 'rejected';
            } else {
                showProcessModal('rejected', 'carteira');
                return;
            }

            showProcessModal(modalStatus, 'carteira', () => {
                modalPagamento.classList.remove('active');
                valorParaInserir = 0;
                if (inputPersonalizado) inputPersonalizado.value = '';
                optValores.forEach(o => o.classList.remove('active'));
                carregarDadosIniciais();
            });
        } catch (error) {
            console.error("Erro na transação:", error);
            showProcessModal('rejected', 'carteira');
        }
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            const metodoRaw = selectPagamento?.value;
            if (!metodoRaw) return alert('Selecione um método de pagamento.');

            if (valorParaInserir <= 0) return alert('Por favor, informe um valor para inserir.');

            if (valorParaInserir > 5000) return alert('Valor incábivel para recarga! Tente colocar um valor menor.');

            if (metodosComCartaoTexto.includes(metodoRaw.toLowerCase())) {
                const numCartaoInput = document.getElementById('num-cartao')?.value || "";
                if (!numCartaoInput || numCartaoInput.trim().length === 0) {
                    return alert('Por favor, informe o número do cartão.');
                }

                if (numCartaoInput.length < 13) return alert("Número do cartão de pagamento incompleto.");

                const validadeInput = document.getElementById('validade-cartao')?.value;
                if (!validarDataExpiracao(validadeInput)) return;

                const cvvInput = document.getElementById('cvv-cartao')?.value || "";
                if (cvvInput.length < 3) return alert("CVV incompleto.");
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

            const chavePix = data.chavePix || "placeholder@test01";

            const pixValueSpan = document.querySelector('#container-pix .pix-key-value');
            const pixBtnCopia = document.querySelector('#container-pix .pix-copy-btn');

            if (pixValueSpan) pixValueSpan.innerText = chavePix;
            if (pixBtnCopia) pixBtnCopia.dataset.chave = chavePix;

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

    function mapearClasseStatus(situacaoRaw) {
        const situacao = (situacaoRaw || '').toLowerCase();

        if (situacao.includes('concl')) {
            return 'status-verde';
        }
        if (situacao.includes('revis') || situacao.includes('pend')) {
            return 'status-amarelo';
        }
        return 'status-vermelho';
    }

    function processarLinhaMovimentacao(mov) {
        const situacao = (mov.situacao || '').toLowerCase();

        return {
            protocolo: mov.n_protocolo || '---',
            metodo: (mov.metodo_pagamento || mov.metodo || 'PIX').toUpperCase(),
            bandeira: (mov.bandeira_banco?.nome_bandeira || '---').toUpperCase(),
            classeCss: mapearClasseStatus(mov.situacao),
            podeImprimir: !situacao.includes('revis') && !situacao.includes('pend'),
            valorFormatado: parseFloat(mov.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })
        };
    }

    function renderizarTabela(dados) {
        if (!dados || !dados.length) {
            corpoTabela.innerHTML = '<tr><td colspan="5" class="mensagem-aviso" style="text-align:center;">Sem movimentações encontradas.</td></tr>';
            return;
        }

        const fragment = document.createDocumentFragment();

        dados.forEach(mov => {
            const info = processarLinhaMovimentacao(mov);

            const linha = document.createElement('tr');
            linha.className = info.classeCss;

            linha.innerHTML = `
            <td>${info.protocolo}</td>
            <td>${info.metodo}</td>
            <td>${info.bandeira}</td>
            <td class="table-bold">${info.valorFormatado}</td>
            <td>
                ${info.podeImprimir ? `
                <button class="btn-print">
                    <i class="bi bi-printer"></i> IMPRIMIR
                </button>` : ''}
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

        let valSituacao = filtroSituacao?.value || '';
        valSituacao = normalizarTexto(valSituacao).replace(/_/g, ' ');

        function situacaoNormalizada(s) {
            let x = (s || '').toLowerCase();
            x = x.replace(/_/g, ' ');
            x = x.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
            x = x.trim();

            if (x.includes('em revisao') || x.includes('under review')) {
                return 'em revisao';
            }
            return x;
        }

        const filtrados = dadosHistoricoCompleto.filter(mov => {
            const rPor = normalizarTexto(mov.metodo_pagamento || mov.metodo || 'pix');
            const band = normalizarTexto(mov.bandeira_banco?.nome_bandeira || '');
            const sit = mov.situacao || '';

            return (!valRealizadoPor || rPor.includes(valRealizadoPor)) &&
                (!valBandeira || band.includes(valBandeira)) &&
                (!valSituacao || situacaoNormalizada(sit).includes(valSituacao));
        });

        renderizarTabela(filtrados);
    }

    function normalizarTexto(txt) {
        return (txt || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    function dispararFeedbackCopia(botao) {
        if (botao.classList.contains('copied')) return;

        botao.classList.add('copied');
        const originalIcon = botao.innerHTML;
        botao.innerHTML = '<i class="bi bi-check-lg"></i>';

        setTimeout(() => {
            botao.classList.remove('copied');
            botao.innerHTML = originalIcon;
        }, 2000);
    }

    const btnCopiarPix = document.querySelector('#container-pix .pix-copy-btn');
    if (btnCopiarPix) {
        btnCopiarPix.addEventListener('click', () => {
            const textoParaCopiar = btnCopiarPix.dataset.chave || '(placeholderPIX)';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textoParaCopiar)
                    .then(() => dispararFeedbackCopia(btnCopiarPix))
                    .catch(err => console.error("Erro ao copiar PIX:", err));
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = textoParaCopiar;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    dispararFeedbackCopia(btnCopiarPix);
                } catch (err) {
                    console.error(err);
                }
                document.body.removeChild(textArea);
            }
        });
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
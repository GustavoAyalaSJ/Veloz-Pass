document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;
    const corpoTabelaInfo = document.querySelector('.tabela-corpoInfo');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroRealizadoNo = document.getElementById('filtro-realizado-no');

    let dadosHistoricoCompleto = [];

    if (!idLogado) {
        window.location.href = "/introduction";
        return;
    }

    async function carregarHistoricoGeral() {
        try {
            const data = await obterDadosCarteira(idLogado);

            if (!data || !data.historico) {
                corpoTabelaInfo.innerHTML = '<div class="empty-table-message">Nenhum registro encontrado.</div>';
                return;
            }

            dadosHistoricoCompleto = data.historico.filter(mov => mov.situacao === 'Concluído' || mov.situacao === 'Recusada');

            if (dadosHistoricoCompleto.length === 0) {
                corpoTabelaInfo.innerHTML = '<div class="empty-table-message">Sem movimentações.</div>';
                return;
            }

            renderizarTabela(dadosHistoricoCompleto);

            if (filtroTipo) filtroTipo.onchange = aplicarFiltros;
            if (filtroRealizadoNo) filtroRealizadoNo.onchange = aplicarFiltros;

        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        }
    }

    function aplicarFiltros() {
        const valTipoMov = normalizarTexto(filtroTipo?.value).replace(/_/g, "");
        const valMetodo = normalizarTexto(filtroRealizadoNo?.value).replace(/_/g, "");

        const dadosFiltrados = dadosHistoricoCompleto.filter(mov => {
            const tipoBanco = normalizarTexto(mov.tipo_movimentacao).replace(/_/g, "");
            const metodoBanco = normalizarTexto(mov.metodo_pagamento)
                .replace(/_/g, "");

            const metodoBancoCompat = metodoBanco === 'carteira digital'
                ? 'carteira_digital'
                : metodoBanco;

            const bateTipo = !valTipoMov || tipoBanco.includes(valTipoMov);
            const bateMetodo = !valMetodo || metodoBancoCompat.includes(valMetodo);


            return bateTipo && bateMetodo;
        });

        renderizarTabela(dadosFiltrados);
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

    function renderizarTabela(dados) {
        if (!dados || dados.length === 0) {
            corpoTabelaInfo.innerHTML = '<div class="empty-table-message">Sem movimentações confirmadas.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        dados.forEach(mov => {
            const linha = document.createElement('div');
            linha.className = 'tabela-linha-item linha-historico';
            if (mov.situacao === 'Recusada') {
                linha.classList.add('linha-recusada');
            }

            const valorFormatado = parseFloat(mov.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const tipoExibicao = (mov.tipo_movimentacao || 'Carteira Digital');
            const metodoExibicao = (mov.metodo_pagamento || 'PIX').toUpperCase();

            linha.innerHTML = `
                <span class="col-protocolo">${mov.n_protocolo || '---'}</span>
                <span class="col-origem">${tipoExibicao}</span>
                <span class="col-metodo">${metodoExibicao}</span>
                <span class="col-valor ${mov.situacao === 'Recusada' ? 'valor-recusado' : ''}">${valorFormatado}</span>
                <span class="col-acao">
                    <button class="btn-imprimir">IMPRIMIR</button>
                </span>
            `;

            fragment.appendChild(linha);
        });

        corpoTabelaInfo.innerHTML = '';
        corpoTabelaInfo.appendChild(fragment);
    }

    function toggleElement(trigger, content, triggerClass = 'open', contentClass = 'show', icon = null) {
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func(...args), delay);
            };
        };
        const debouncedToggle = debounce(() => {
            const isOpen = content.classList.contains(contentClass);
            if (isOpen) {
                content.classList.remove(contentClass);
                if (trigger) trigger.classList.remove(triggerClass);
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                document.querySelectorAll('.filtro-item.active').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.select-icon').forEach(i => i.style.transform = 'rotate(0deg)');
                content.classList.add(contentClass);
                if (trigger) trigger.classList.add(triggerClass);
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        }, 50);
        debouncedToggle();
    }

    function normalizarTexto(txt) {
        return (txt || '')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    async function obterDadosCarteira(idUsuario) {
        try {
            if (typeof auth !== 'undefined') {
                const response = await auth.request(`/api/payments/historico-geral/${idUsuario}`);
                if (!response || !response.ok) return null;
                return await response.json();
            }
        } catch (error) {
            console.error("Erro ao obter dados da carteira:");
            return null;
        }
    }

    carregarHistoricoGeral();
});
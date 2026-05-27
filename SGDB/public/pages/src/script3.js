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
                exibirMensagemVazia("Nenhum registro encontrado.");
                return;
            }

            dadosHistoricoCompleto = data.historico.filter(mov =>
                mov.situacao === 'Concluído' || mov.situacao === 'Recusada'
            );

            if (dadosHistoricoCompleto.length === 0) {
                exibirMensagemVazia("Sem movimentações registradas.");
                return;
            }

            renderizarTabela(dadosHistoricoCompleto);

            filtroTipo?.addEventListener('change', aplicarFiltros);
            filtroRealizadoNo?.addEventListener('change', aplicarFiltros);

        } catch (error) {
            console.error("Erro ao inicializar histórico:", error);
            exibirMensagemVazia("Erro ao carregar dados do histórico.");
        }
    }

    function aplicarFiltros() {
        const valTipoMov = normalizarBuscar(filtroTipo?.value);
        const valMetodo = normalizarBuscar(filtroRealizadoNo?.value);

        const dadosFiltrados = dadosHistoricoCompleto.filter(mov => {
            const tipoBanco = normalizarBuscar(mov.tipo_movimentacao);

            let metodoBanco = normalizarBuscar(mov.metodo_pagamento);
            if (metodoBanco === 'carteiradigital') metodoBanco = 'carteira_digital';

            const bateTipo = !valTipoMov || tipoBanco.includes(valTipoMov);
            const bateMetodo = !valMetodo || metodoBanco.includes(valMetodo.replace(/_/g, ""));

            return bateTipo && bateMetodo;
        });

        renderizarTabela(dadosFiltrados);
    }

    document.querySelectorAll('.filtro-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();

            const estaAtivo = item.classList.contains('active');

            document.querySelectorAll('.filtro-item.active').forEach(el => el.classList.remove('active'));

            if (!estaAtivo) {
                item.classList.add('active');
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.filtro-item.active').forEach(el => el.classList.remove('active'));
    });

    function renderizarTabela(dados) {
        const fragment = document.createDocumentFragment();

        dados.forEach(mov => {
            const linha = document.createElement('div');
            linha.className = 'tabela-linha-item';

            if (mov.situacao === 'Recusada') {
                linha.classList.add('linha-recusada');
            }

            const valorFormatado = parseFloat(mov.valor || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const tipoExibicao = mov.tipo_movimentacao || 'Carteira Digital';
            const metodoExibicao = (mov.metodo_pagamento || 'PIX').toUpperCase();
            const podeImprimir = mov.situacao === 'Concluído' || mov.situacao === 'Recusada';

            linha.innerHTML = `
                <span class="col-protocolo">${mov.n_protocolo || '---'}</span>
                <span class="col-origem">${tipoExibicao}</span>
                <span class="col-metodo">${metodoExibicao}</span>
                <span class="col-valor ${mov.situacao === 'Recusada' ? 'valor-recusado' : ''}">${valorFormatado}</span>
                <span class="col-acao">
                    ${podeImprimir ? `<button class="btn-imprimir" data-protocolo="${mov.n_protocolo}">IMPRIMIR</button>` : ''}
                </span>
            `;

            fragment.appendChild(linha);
        });

        corpoTabelaInfo.innerHTML = '';
        corpoTabelaInfo.appendChild(fragment);
    }

    function normalizarBuscar(txt) {
        return (txt || '')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\s_]/g, "")
            .trim();
    }

    function exibirMensagemVazia(mensagem) {
        corpoTabelaInfo.innerHTML = `<div class="empty-table-message">${mensagem}</div>`;
    }

    async function obterDadosCarteira(idUsuario) {
        try {
            if (typeof auth !== 'undefined') {
                const response = await auth.request(`/api/payments/historico-geral/${idUsuario}`);
                if (response && response.ok) {
                    return await response.json();
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }
    carregarHistoricoGeral();
});
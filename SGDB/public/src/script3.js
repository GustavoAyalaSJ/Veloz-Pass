document.addEventListener('DOMContentLoaded', () => {
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
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

            const historicoFiltrado = data.historico.filter(mov => {
                const situacao = (mov.situacao || '').toLowerCase();
                return situacao.includes('concl') || situacao.includes('pago') || situacao.includes('confirmado');
            });

            dadosHistoricoCompleto = historicoFiltrado;
            renderizarTabela(dadosHistoricoCompleto);

            if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
            if (filtroRealizadoNo) filtroRealizadoNo.addEventListener('change', aplicarFiltros);

        } catch (error) {
            console.error(error);
        }
    }

    function renderizarTabela(dados) {
        corpoTabelaInfo.innerHTML = '';

        if (!dados || dados.length === 0) {
            corpoTabelaInfo.innerHTML = '<div class="empty-table-message">Sem movimentações confirmadas.</div>';
            return;
        }

        dados.forEach(mov => {
            const linha = document.createElement('div');
            linha.className = 'tabela-linha-item linha-historico';

            const valorFormatado = parseFloat(mov.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const metodoExibicao = (mov.metodo || mov.tipo || 'PIX').toUpperCase();
            const origemExibicao = (mov.origem || 'CARTEIRA DIGITAL').toUpperCase();

            linha.innerHTML = `
                <span class="col-protocolo">${mov.n_protocolo || '---'}</span>
                <span class="col-origem">${origemExibicao}</span>
                <span class="col-metodo">${metodoExibicao}</span>
                <span class="col-valor">${valorFormatado}</span>
                <span class="col-acao">
                    <button class="btn-imprimir">IMPRIMIR</button>
                </span>
            `;

            corpoTabelaInfo.appendChild(linha);
        });
    }

    function aplicarFiltros() {
        const valOrigem = normalizarTexto(filtroTipo?.value);
        const valRealizadoNo = normalizarTexto(filtroRealizadoNo?.value);

        const dadosFiltrados = dadosHistoricoCompleto.filter(mov => {
            const origemBanco = normalizarTexto(mov.origem || 'carteira digital');
            const metodoBanco = normalizarTexto(mov.metodo || mov.tipo || 'pix');

            const bateOrigem = !valOrigem || origemBanco === valOrigem;
            const bateMetodo = !valRealizadoNo || metodoBanco === valRealizadoNo;

            return bateOrigem && bateMetodo;
        });

        renderizarTabela(dadosFiltrados);
    }

    async function obterDadosCarteira(idUsuario) {
        try {
            if (typeof auth !== 'undefined') {
                const response = await auth.request(`/api/payments/wallet-data/${idUsuario}`);
                if (!response || !response.ok) return null;
                return await response.json();
            }
        } catch (error) {
            console.error("Erro ao obter dados da carteira:", error);
            return null;
        }
    }

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.style.display = "flex";
        });
    }

    const btnSimLogout = document.getElementById('btn-sim-logout');
    const btnNaoLogout = document.getElementById('btn-nao-logout');

    if (btnSimLogout) btnSimLogout.addEventListener('click', () => auth.clear());
    if (btnNaoLogout) btnNaoLogout.addEventListener('click', () => logoutModal.style.display = "none");

    carregarHistoricoGeral();
});
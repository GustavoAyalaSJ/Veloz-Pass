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
        if (!dados || dados.length === 0) {
            corpoTabelaInfo.innerHTML = '<div class="empty-table-message">Sem movimentações confirmadas.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        dados.forEach(mov => {
            const linha = document.createElement('div');
            linha.className = 'tabela-linha-item linha-historico';

            const valorFormatado = parseFloat(mov.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const metodoExibicao = (mov.tipo || 'PIX').toUpperCase();
            const origemExibicao = (mov.realizado_no || 'Carteira Digital');

            linha.innerHTML = `
                <span class="col-protocolo">${mov.n_protocolo || '---'}</span>
                <span class="col-origem">${origemExibicao}</span>
                <span class="col-metodo">${metodoExibicao}</span>
                <span class="col-valor">${valorFormatado}</span>
                <span class="col-acao">
                    <button class="btn-imprimir">IMPRIMIR</button>
                </span>
            `;

            fragment.appendChild(linha);
        });

        corpoTabelaInfo.innerHTML = '';
        corpoTabelaInfo.appendChild(fragment);
    }

    function normalizarTexto(txt) {
        return (txt || '')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function aplicarFiltros() {
        const valOrigen = normalizarTexto(filtroTipo?.value);
        const valTipo = normalizarTexto(filtroRealizadoNo?.value);

        const dadosFiltrados = dadosHistoricoCompleto.filter(mov => {
            const realizadoNoBanco = normalizarTexto(mov.realizado_no || 'carteira digital');
            const tipoBanco = normalizarTexto(mov.tipo || 'pix');

            const bateOrigem = !valOrigen || realizadoNoBanco === valOrigen;
            const bateTipo = !valTipo || tipoBanco === valTipo;

            return bateOrigem && bateTipo;
        });

        renderizarTabela(dadosFiltrados);
    }

    if (filtroTipo) {
        const filtroItem1 = filtroTipo.closest('.filtro-item');
        if (filtroItem1) {
            filtroTipo.addEventListener('focus', () => filtroItem1.classList.add('active'));
            filtroTipo.addEventListener('blur', () => filtroItem1.classList.remove('active'));
        }
    }

    if (filtroRealizadoNo) {
        const filtroItem2 = filtroRealizadoNo.closest('.filtro-item');
        if (filtroItem2) {
            filtroRealizadoNo.addEventListener('focus', () => filtroItem2.classList.add('active'));
            filtroRealizadoNo.addEventListener('blur', () => filtroItem2.classList.remove('active'));
        }
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
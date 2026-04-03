document.addEventListener('DOMContentLoaded', () => {

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const userData = auth.getUserData();
    const idLogado = userData?.id;
    const corpoTabelaInfo = document.querySelector('.tabela-corpoInfo');

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

            corpoTabelaInfo.innerHTML = '';

            if (historicoFiltrado.length === 0) {
                corpoTabelaInfo.innerHTML = '<div class="empty-table-message">Sem movimentações confirmadas.</div>';
                return;
            }

            historicoFiltrado.forEach(mov => {
                const linha = document.createElement('div');
                linha.className = 'tabela-linha-item linha-historico';

                const valorFormatado = parseFloat(mov.valor).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                const metodoExibicao = (mov.metodo || mov.tipo || 'PIX').toUpperCase();

                linha.innerHTML = `
                    <span class="col-protocolo">${mov.n_protocolo || '---'}</span>
                    <span class="col-origem">CARTEIRA DIGITAL</span>
                    <span class="col-metodo">${metodoExibicao}</span>
                    <span class="col-valor">${valorFormatado}</span>
                    <span class="col-acao">
                        <button class="btn-imprimir">IMPRIMIR</button>
                    </span>
                `;

                corpoTabelaInfo.appendChild(linha);
            });

        } catch (error) {
            console.error(error);
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


    carregarHistoricoGeral();

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.style.display = "flex";
        });
    }

    const btnSimLogout = document.getElementById('btn-sim-logout');
    const btnNaoLogout = document.getElementById('btn-nao-logout');

    if (btnSimLogout) {
        btnSimLogout.addEventListener('click', () => {
            auth.clear();
        });
    }

    if (btnNaoLogout) {
        btnNaoLogout.addEventListener('click', () => {
            logoutModal.style.display = "none";
        });
    }
});
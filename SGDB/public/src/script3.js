document.addEventListener('DOMContentLoaded', () => {

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const idLogado = localStorage.getItem('userId');
    const corpoTabelaInfo = document.querySelector('.tabela-corpoInfo');

    if (!idLogado || idLogado === "undefined") {
        window.location.href = "/introduction";
        return;
    }

    async function obterDadosCarteira(id) {
        try {
            const response = await fetch(`/api/payments/wallet-data/${id}`);
            if (response.ok) return await response.json();
            return null;
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            return null;
        }
    }

    async function carregarHistoricoGeral() {
        try {
            const data = await obterDadosCarteira(idLogado);
            
            if (!data || !data.historico) {
                corpoTabelaInfo.innerHTML = '<div style="text-align:center; padding:20px; font-size:0.8rem;">Nenhum registro encontrado.</div>';
                return;
            }

            const historicoFiltrado = data.historico.filter(mov => {
                const situacao = (mov.situacao || '').toLowerCase();
                return situacao.includes('concl') || situacao.includes('pago') || situacao.includes('confirmado');
            });

            corpoTabelaInfo.innerHTML = '';

            if (historicoFiltrado.length === 0) {
                corpoTabelaInfo.innerHTML = '<div style="text-align:center; padding:20px; font-size:0.8rem;">Sem movimentações confirmadas.</div>';
                return;
            }

            historicoFiltrado.forEach(mov => {
                const linha = document.createElement('div');
                linha.className = 'linha-historico';

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

    carregarHistoricoGeral();

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.style.display = "flex";
        });
    }
    window.fecharModal = () => logoutModal.style.display = "none";
    window.confirmarLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/introduction';
    };
});
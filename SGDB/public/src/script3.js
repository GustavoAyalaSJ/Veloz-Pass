document.addEventListener('DOMContentLoaded', () => {

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const idLogado = localStorage.getItem('userId');
    const corpoTabelaInfo = document.querySelector('.tabela-corpoInfo');

    if (!idLogado || idLogado === "undefined") {
        window.location.href = "/introduction";
        return;
    }

    async function carregarHistoricoGeral() {
        try {
            if (typeof obterDadosCarteira !== 'function') return;

            const data = await obterDadosCarteira(idLogado);
            
            if (!data || !data.historico) {
                corpoTabelaInfo.innerHTML = '<div style="text-align:center; padding:20px;">Nenhum registro encontrado.</div>';
                return;
            }

            const historicoFiltrado = data.historico.filter(mov => {
                const situacao = (mov.situacao || '').toLowerCase();
                return situacao.includes('concl') || situacao.includes('pago') || situacao.includes('confirmado');
            });

            corpoTabelaInfo.innerHTML = '';

            if (historicoFiltrado.length === 0) {
                corpoTabelaInfo.innerHTML = '<div style="text-align:center; padding:20px;">Sem movimentações confirmadas.</div>';
                return;
            }

            historicoFiltrado.forEach(mov => {
                const linha = document.createElement('div');
                linha.style.display = 'flex';
                linha.style.justifyContent = 'space-between';
                linha.style.width = '100%';
                linha.style.padding = '15px 0';
                linha.style.borderBottom = '1px solid #e0e0e0';
                linha.style.alignItems = 'center';

                const valorFormatado = parseFloat(mov.valor).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                });

                linha.innerHTML = `
                    <span style="flex:1; text-align:center; font-size:0.85rem;">${mov.n_protocolo || '---'}</span>
                    <span style="flex:1; text-align:center; font-size:0.85rem; font-weight:bold;">CARTEIRA DIGITAL</span>
                    <span style="flex:1; text-align:center; font-size:0.85rem;">${(mov.metodo || mov.nome_bandeira || 'PIX').toUpperCase()}</span>
                    <span style="flex:1; text-align:center; font-size:0.85rem; font-weight:800; color:#27ae60;">${valorFormatado}</span>
                    <span style="flex:1; text-align:center;">
                        <button onclick="imprimirProtocolo('${mov.n_protocolo}')" style="background:#375477; color:white; border:none; padding:6px 12px; border-radius:5px; font-size:0.7rem; font-weight:bold; cursor:pointer;">
                            IMPRIMIR
                        </button>
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

    window.fecharModal = function () {
        logoutModal.style.display = "none";
    };

    window.confirmarLogout = function () {

        localStorage.removeItem('nomeUsuario');
        sessionStorage.clear();

        window.location.href = '/introduction';
    };
});
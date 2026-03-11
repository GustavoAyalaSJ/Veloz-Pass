document.addEventListener('DOMContentLoaded', () => {

    /* Comentário em breve. */

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const selectElement = document.getElementById('select-pagamento');
    const wrapper = selectElement.parentElement;

    selectElement.addEventListener('click', () => {
        wrapper.classList.toggle('active');
    });

    selectElement.addEventListener('blur', () => {
        wrapper.classList.remove('active');
    });

    selectElement.addEventListener('change', () => {
        wrapper.classList.remove('active');
    });

    const idLogado = localStorage.getItem('userId');
    const selectPagamento = document.getElementById('select-pagamento');

    if (!idLogado || idLogado === "undefined") return;

    async function atualizarSaldoNoSelect() {
        try {
            if (typeof obterDadosCarteira !== 'function') return;
            
            const data = await obterDadosCarteira(idLogado);
            
            if (data && data.saldo !== undefined) {
                const saldoFormatado = parseFloat(data.saldo).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2 
                });

                if (selectPagamento) {
                    const options = selectPagamento.options;
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].text.includes('Carteira Digital')) {
                            options[i].text = `Carteira Digital (R$ ${saldoFormatado})`;
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao carregar saldo para o select:", error);
        }
    }

    atualizarSaldoNoSelect();

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

document.addEventListener('DOMContentLoaded', () => {

    const spanNome = document.getElementById('nome-logado');
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const saldoDashboard = document.getElementById("saldo-dashboard");

    function atualizarNome() {
        const nomeSalvo = localStorage.getItem('nomeUsuario');

        if (nomeSalvo && spanNome) {
            const partes = nomeSalvo.trim().split(/\s+/);
            const primeiroNome = partes[0];
            const ultimoNome = partes.length > 1 ? partes[partes.length - 1] : "";

            spanNome.textContent = `${primeiroNome} ${ultimoNome}`.trim();
        }
    }

    async function carregarSaldoDashboard() {
        const idUsuario = localStorage.getItem('userId');

        if (!idUsuario) return;

        const dadosCarteira = await obterDadosCarteira(idUsuario);

        if (!dadosCarteira) return;

        const saldo = parseFloat(dadosCarteira.saldo) || 0;

        if (saldoDashboard) {
            saldoDashboard.textContent =
                `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }
    }

    atualizarNome();
    carregarSaldoDashboard();

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
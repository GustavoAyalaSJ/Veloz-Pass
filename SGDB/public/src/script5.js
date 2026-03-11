document.addEventListener('DOMContentLoaded', () => {

    /* Comentário em breve. */

    const idLogado = localStorage.getItem('userId');
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const selectElement = document.getElementById('select-pagamento');
    const inputValor = document.querySelector('.top-group.valor input');
    const wrapper = selectElement ? selectElement.parentElement : null;

    if (!idLogado || idLogado === "undefined") {
        window.location.href = "/introduction";
        return;
    }

    if (selectElement && wrapper) {
        selectElement.addEventListener('click', () => {
            wrapper.classList.toggle('active');
        });

        selectElement.addEventListener('blur', () => {
            setTimeout(() => wrapper.classList.remove('active'), 200);
        });

        selectElement.addEventListener('change', () => {
            wrapper.classList.remove('active');
        });
    }

    async function carregarSaldoCarteira() {
        try {
            const response = await fetch(`/api/payments/wallet-data/${idLogado}`);
            const data = await response.json();

            if (data && data.saldo !== undefined) {
                const saldoNumerico = parseFloat(data.saldo) || 0;
                const saldoFormatado = saldoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

                const options = selectElement.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].text.includes('Carteira Digital')) {
                        options[i].text = `Carteira Digital (R$ ${saldoFormatado})`;
                        break;
                    }
                }
            }
        } catch (err) {
            console.error("Erro ao buscar saldo:", err);
        }
    }

    if (inputValor) {
        inputValor.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v === "") {
                e.target.value = "";
                return;
            }
            v = (v / 100).toFixed(2).replace(".", ",");
            v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
            v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
            e.target.value = "R$ " + v;
        });
    }

    carregarSaldoCarteira();

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (logoutModal) logoutModal.style.display = "flex";
        });
    }

    window.fecharModal = function () {
        if (logoutModal) logoutModal.style.display = "none";
    };

    window.confirmarLogout = function () {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/introduction';
    };
});
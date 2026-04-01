document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const selectElement = document.getElementById('select-pagamento');
    const inputValor = document.querySelector('.top-group.valor input');
    const btnProsseguir = document.querySelector('.btn-prosseguir');
    const wrapper = selectElement ? selectElement.parentElement : null;

    let saldoAtualCarteira = 0;

    if (!idLogado) {
        window.location.href = "/introduction";
        return;
    }

    function formatarMoeda(valor) {
        let v = valor.replace(/\D/g, "");
        if (v === "") return "";

        v = (v / 100).toFixed(2).replace(".", ",");
        v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return "R$ " + v;
    }

    function validarSaldo() {
        const valorDigitado = parseFloat(inputValor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".")) || 0;

        const options = Array.from(selectElement.options);
        const opcaoCarteira = options.find(opt => opt.text.includes('Carteira Digital'));

        if (opcaoCarteira) {
            if (valorDigitado > saldoAtualCarteira) {
                opcaoCarteira.disabled = true;

                if (selectElement.value === opcaoCarteira.value) {
                    selectElement.selectedIndex = 0;
                    selectElement.style.borderColor = "red";
                    setTimeout(() => selectElement.style.borderColor = "", 1500);
                }
            } else {
                opcaoCarteira.disabled = false;
            }
        }
    }

    if (inputValor) {
        inputValor.addEventListener('input', (e) => {
            e.target.value = formatarMoeda(e.target.value);
            validarSaldo();
        });
    }

    async function carregarSaldoCarteira() {
        try {
            const response = await auth.request(`/api/payments/wallet-data/${idLogado}`);
            if (!response || !response.ok) return;

            const data = await response.json();
            if (data && data.saldo !== undefined) {
                saldoAtualCarteira = parseFloat(data.saldo) || 0;
                const saldoFormatado = saldoAtualCarteira.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

                const options = selectElement.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].text.includes('Carteira Digital')) {
                        options[i].text = `Carteira Digital (R$ ${saldoFormatado})`;
                        break;
                    }
                }
                validarSaldo();
            }
        } catch (err) {
            console.error("Erro ao buscar saldo:", err);
        }
    }

    const inputsTransporte = document.querySelectorAll('.confirm-card input');
    inputsTransporte.forEach(input => {
        aplicarMascara(input, "00.00.00000000-0");
    });

    const containerPagamento = document.querySelector('.payment-information');

    selectElement.addEventListener('change', () => {
        wrapper.classList.remove('active');
        validarSaldo();
        renderizarPasso2();
    });

    function aplicarMascara(input, mascara) {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            let k = 0;
            let novoValor = "";

            if (v.length === 0) {
                e.target.value = "";
                return;
            }

            for (let i = 0; i < mascara.length && k < v.length; i++) {
                if (mascara[i] === '0') {
                    novoValor += v[k++];
                } else {
                    novoValor += mascara[i];
                }
            }
            e.target.value = novoValor;
        });
    }

    function renderizarPasso2() {
        const metodo = selectElement.value.toLowerCase();
        containerPagamento.innerHTML = '';
        btnProsseguir.disabled = (metodo === 'pix');

        if (metodo.includes('cartão')) {
            containerPagamento.innerHTML = `
            <div class="card-inputs-row">
                <div class="input-group-full">
                    <label>Número do Cartão</label>
                    <input type="text" id="card-num" placeholder="0000 0000 0000 0000" maxlength="19">
                </div>
                <div class="input-group-half">
                    <div>
                        <label>Validade</label>
                        <input type="text" id="card-valid" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div>
                        <label>CVV</label>
                        <input type="text" id="card-cvv" placeholder="000" maxlength="3">
                    </div>
                </div>
            </div>
        `;

            aplicarMascara(document.getElementById('card-num'), "0000 0000 0000 0000");
            aplicarMascara(document.getElementById('card-valid'), "00/00");
            aplicarMascara(document.getElementById('card-cvv'), "000");

        } else if (metodo === 'pix') {
            containerPagamento.innerHTML = `
            <div class="pix-container">
                <div class="qr-placeholder">QR PLACEHOLDER</div>
                <div class="pix-copy-field">
                    <input type="text" value="Placeholder_cod_PIX" id="pix-input" readonly>
                    <button class="btn-copy" onclick="copiarPix()"><i class="bi bi-copy"></i></button>
                </div>
            </div>
        `;
        }
    }

    if (btnProsseguir) {
        btnProsseguir.addEventListener('click', () => {
            const valorDigitado = parseFloat(inputValor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".")) || 0;

            if (valorDigitado < 5.00) {
                alert("Valor mínimo de recarga: R$ 5,00.");
                return;
            }

            if (selectElement.selectedIndex === 0) {
                alert("Selecione uma forma de pagamento.");
                return;
            }
        });
    }

    if (selectElement && wrapper) {
        selectElement.addEventListener('click', () => wrapper.classList.toggle('active'));
        selectElement.addEventListener('blur', () => setTimeout(() => wrapper.classList.remove('active'), 200));
        selectElement.addEventListener('change', () => {
            wrapper.classList.remove('active');
            validarSaldo();
        });
    }

    const setupLogout = () => {
        if (exitLink) exitLink.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.style.display = "flex";
        });
        document.getElementById('btn-sim-logout')?.addEventListener('click', () => auth.clear());
        document.getElementById('btn-nao-logout')?.addEventListener('click', () => logoutModal.style.display = "none");
    };

    setupLogout();
    carregarSaldoCarteira();
});
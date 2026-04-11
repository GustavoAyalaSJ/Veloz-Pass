document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const selectElement = document.getElementById('select-pagamento');
    const inputValor = document.querySelector('.top-group.valor input');
    const btnProsseguir = document.querySelector('.btn-prosseguir');
    const displayImagem = document.querySelector('.buscard-image img');
    const wrapper = selectElement ? selectElement.parentElement : null;

    let saldoAtualCarteira = 0;

    const mapaBandeiras = {
        1: "Visa.png",
        2: "Mastercard.png",
        3: "Hipercard.png",
        4: "Elo.png",
        5: "Amex.png"
    };

    if (!idLogado) {
        window.location.href = "/introduction";
        return;
    }

    function resetarImagem() {
        if (displayImagem) displayImagem.src = imgDefault;
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
                    selectElement.classList.add('saldo-insuficiente');
                    setTimeout(() => selectElement.classList.remove('saldo-insuficiente'), 1500);
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

    const imgDefault = "Assets/Cartão-ideal.png";
    const pastaBandeiras = "Assets/Bandeira/";

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

    function configurarListenerBandeira(inputCartao) {
        if (!inputCartao) return;
        
        inputCartao.addEventListener('input', (e) => {
            const valor = e.target.value.replace(/\D/g, '');
            const metodoAtual = selectElement?.value.toLowerCase();
            const eMetodoCartao = ['débito', 'crédito', 'internacional'].includes(metodoAtual) || metodoAtual.includes('cartão');

            if (eMetodoCartao && valor.length > 0) {
                const ultimoDigito = parseInt(valor.slice(-1));
                if (mapaBandeiras[ultimoDigito]) {
                    displayImagem.src = `${pastaBandeiras}${mapaBandeiras[ultimoDigito]}`;
                } else {
                    resetarImagem();
                }
            }
        });
    }

    function aplicarMascara(input, mascara) {
        if (!input) return;
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

    if (selectElement) {
        selectElement.addEventListener('change', () => {
            const metodo = selectElement.value.toLowerCase();

            if (metodo === 'pix') {
                displayImagem.src = `${pastaBandeiras}Pix.png`;
            } else {
                resetarImagem();
            }

            if (wrapper) wrapper.classList.remove('active');
            validarSaldo();
            renderizarPasso2();
        });
    }

    function renderizarPasso2() {
        const metodo = selectElement.value.toLowerCase();
        containerPagamento.innerHTML = '';

        if (metodo === 'pix') {
            if (btnProsseguir) btnProsseguir.classList.add('hidden-button');

            containerPagamento.innerHTML = `
            <div class="pix-container">
                <div class="qr-placeholder">QR PLACEHOLDER</div>
                <div class="pix-copy-wrapper">
                    <input type="text" value="Placeholder_cod_PIX" id="pix-input" readonly>
                    <button class="btn-copy">
                        <i class="bi bi-copy"></i>
                    </button>
                </div>
            </div>
        `;
        } else {
            if (btnProsseguir) {
                btnProsseguir.classList.remove('hidden-button');
                btnProsseguir.disabled = false;
            }

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
                </div>`;
                const inputNum = document.getElementById('card-num');
                const inputValid = document.getElementById('card-valid');
                const inputCvv = document.getElementById('card-cvv');

                aplicarMascara(inputNum, "0000 0000 0000 0000");
                aplicarMascara(inputValid, "00/00");
                aplicarMascara(inputCvv, "000");
                
                configurarListenerBandeira(inputNum);
            }
        }
    }

    function abrirModalFinalizacao() {
        const metodoTexto = selectElement.options[selectElement.selectedIndex].text;
        const valorInserido = inputValor.value;
        const numCartaoTransporte = document.querySelectorAll('.confirm-card input')[0].value;
        const tipoSelecionado = document.getElementById('select-type').value;
        const metodo = selectElement.value.toLowerCase();

        let modalOverlay = document.getElementById('modalRecarga');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'modalRecarga';
            document.body.appendChild(modalOverlay);
        }

        modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Visão Geral</h2>
            <div class="modal-separator"></div>
            
            <div class="modal-details">
                <p><strong>Pagamento:</strong> <span class="modal-details-value">${metodoTexto}</span></p>
                <p><strong>Valor:</strong> <span class="modal-details-value">${valorInserido}</span></p>
                <p><strong>Cartão:</strong> <span class="modal-details-value">${numCartaoTransporte}</span></p>
            </div>

            <div class="modal-buttons-wrapper">
                <button id="btn-finalizar-fake" class="btn-prosseguir">Concluir</button>
                <button id="btn-cancelar-modal">Cancelar</button>
            </div>
        </div>
    `;

        modalOverlay.style.display = 'flex';

        document.getElementById('btn-cancelar-modal').addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        document.getElementById('btn-finalizar-fake').addEventListener('click', async () => {
            await finalizarRecarga(valorInserido, metodo, numCartaoTransporte, tipoSelecionado, modalOverlay);
        });
    }

    async function finalizarRecarga(valor, metodo, numCartao, tipo, modalOverlay) {
        const btn = document.getElementById('btn-finalizar-fake');
        btn.disabled = true;
        btn.textContent = 'Processando...';

        try {
            const valorNum = parseFloat(valor.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
            
            const response = await auth.request('/api/payments/recarga-transporte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    valor: valorNum.toString(),
                    metodo: metodo,
                    numCartaoTransporte: numCartao,
                    tipo: tipo
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                btn.textContent = 'Recarga realizada!';
                setTimeout(() => {
                    window.location.href = '/historico_geral';
                }, 1500);
            } else {
                alert(data.error || 'Erro ao processar recarga');
                btn.disabled = false;
                btn.textContent = 'Concluir';
            }
        } catch (err) {
            console.error("Erro ao finalizar recarga:", err);
            alert('Erro ao processar recarga: ' + err.message);
            btn.disabled = false;
            btn.textContent = 'Concluir';
        }
    }

    function validarDataExpiracao(validade) {
        if (!validade || validade.length < 5) {
            alert("Preencha a validade corretamente (MM/YY).");
            return false;
        }
        const partes = validade.split('/');
        const mes = parseInt(partes[0]);
        const ano = parseInt(partes[1]);
        const anoAtual = 26;

        if (mes < 1 || mes > 12) {
            alert("Mês inválido! Use de 01 a 12.");
            return false;
        }
        if (ano < anoAtual) {
            alert("Cartão vencido! O ano deve ser 26 ou superior.");
            return false;
        }
        return true;
    }

    if (btnProsseguir) {
        btnProsseguir.addEventListener('click', () => {
            const valorRaw = inputValor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
            const valorDigitado = parseFloat(valorRaw) || 0;

            const inputsTransporte = document.querySelectorAll('.confirm-card input');
            const numTransp1 = inputsTransporte[0]?.value || "";
            const numTransp2 = inputsTransporte[1]?.value || "";

            const metodoSelecionado = selectElement.value.toLowerCase();

            const campoNumCard = document.getElementById('card-num')?.value || "";
            const campoValidCard = document.getElementById('card-valid')?.value || "";
            const campoCvvCard = document.getElementById('card-cvv')?.value || "";

            if (valorDigitado < 5.00) {
                alert("Coloque um valor (Mínimo requisitado: 5 reais).");
                return;
            }

            if (selectElement.selectedIndex === 0 && numTransp1 === "") {
                alert("Complete as informações abaixo.");
                return;
            }

            if (selectElement.selectedIndex !== 0 && numTransp1 === "") {
                alert("Coloque o número do seu cartão de passagem.");
                return;
            }

            if (metodoSelecionado.includes('cartão')) {
                if (campoNumCard.length < 19 || campoValidCard.length < 5 || campoCvvCard.length < 3) {
                    alert("Complete os campos da informação do cartão para continuar.");
                    return;
                }

                if (!validarDataExpiracao(campoValidCard)) {
                    alert("Data de validade inválida!");
                    return;
                }
            }

            if (numTransp1 !== numTransp2) {
                alert("A confirmação do número do cartão de transporte não confere.");
                return;
            }

            abrirModalFinalizacao();
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
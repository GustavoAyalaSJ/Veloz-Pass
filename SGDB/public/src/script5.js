document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;

    if (!idLogado) {
        auth.safeRedirect("/introduction");
        return;
    }

    const selectElement = document.getElementById('select-pagamento');
    const inputValor = document.querySelector('.top-group.valor input');
    const btnProsseguir = document.querySelector('.btn-prosseguir');
    const displayImagem = document.querySelector('.buscard-image img');
    const containerPagamento = document.querySelector('.payment-information');
    const wrapper = selectElement?.parentElement;

    let saldoAtualCarteira = 0;
    let idBandeiraSelecionada = null;

    const imgDefault = "Assets/Cartão-ideal.webp";
    const pastaBandeiras = "Assets/Bandeira/";

    const mapaBandeiras = {
        1: "Visa.webp",
        2: "Mastercard.webp",
        3: "Hipercard.webp",
        4: "Elo.webp",
        5: "Amex.webp"
    };

    function formatarMoeda(valor) {
        let v = valor.replace(/\D/g, "");
        if (v === "") return "";
        v = (v / 100).toFixed(2).replace(".", ",");
        v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return "R$ " + v;
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

    function getValorSeguro(raw) {
        if (typeof raw !== "string") return parseFloat(raw || 0);
        let limpo = raw.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
        return parseFloat(limpo) || 0;
    }

    function validarDataCartao(validade) {
        if (!validade || validade.length < 5) return false;

        const [mes, anoStr] = validade.split('/');
        const mesDigitado = parseInt(mes);
        const anoDigitado = parseInt("20" + anoStr);
        const agora = new Date();
        const mesAtual = agora.getMonth() + 1;
        const anoAtual = agora.getFullYear();

        if (mesDigitado < 1 || mesDigitado > 12) return false;

        if (anoDigitado < anoAtual || (anoDigitado === anoAtual && mesDigitado < mesAtual)) {
            return false;
        }
        return true;
    }

    function validarSaldo() {
        const valorDigitado = getValorSeguro(inputValor.value);

        const options = Array.from(selectElement.options);
        const opcaoCarteira = options.find(opt => opt.text.toLowerCase().includes('carteira'));

        if (opcaoCarteira) {
            if (valorDigitado > 0 && valorDigitado > saldoAtualCarteira) {
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

    async function carregarSaldoCarteira() {
        try {
            const response = await auth.request(`/api/payments/wallet-data/${idLogado}`);
            if (!response || !response.ok) return;

            const data = await response.json();

            if (data && data.saldo !== undefined) {
                saldoAtualCarteira = parseFloat(data.saldo) || 0;

                const saldoFormatado = saldoAtualCarteira.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                });

                const options = selectElement.options;

                for (let i = 0; i < options.length; i++) {
                    if (options[i].text.includes('Carteira Digital')) {
                        options[i].text = `Carteira Digital (Saldo: R$ ${saldoFormatado})`;
                        break;
                    }
                }

                validarSaldo();
            }

        } catch (err) {
            console.error("Erro ao carregar saldo da carteira");
        }
    }

    function configurarListenerBandeira(inputCartao) {
        if (!inputCartao) return;
        inputCartao.addEventListener('input', (e) => {
            const valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 0) {
                const primeiroDigito = parseInt(valor[0]);
                const idBandeira = mapaBandeiras[primeiroDigito] ? primeiroDigito : null;
                if (idBandeira) {
                    displayImagem.src = `${pastaBandeiras}${mapaBandeiras[idBandeira]}`;
                    idBandeiraSelecionada = idBandeira;
                } else {
                    displayImagem.src = imgDefault;
                    idBandeiraSelecionada = null;
                }
            }
        });
    }

    const transInputs = document.querySelectorAll('.confirm-card input');

    if (transInputs.length >= 2) {
        const n1 = transInputs[0];
        const n2 = transInputs[1];

        const setupIcons = (input) => {
            const parent = input.parentElement;

            const check = document.createElement('i');
            check.className = 'bi bi-check check-icon';
            check.style.visibility = 'hidden';

            const xIcon = document.createElement('i');
            xIcon.className = 'bi bi-x-circle error-icon';
            xIcon.style.visibility = 'hidden';

            parent.appendChild(check);
            parent.appendChild(xIcon);

            return { check, xIcon };
        };

        const icons1 = setupIcons(n1);
        const icons2 = setupIcons(n2);

        const validarCartaoTransp = () => {
            const val1 = n1.value.trim();
            const val2 = n2.value.trim();

            [icons1.check, icons1.xIcon, icons2.check, icons2.xIcon].forEach(el => el.style.visibility = 'hidden');

            if (val1.length > 0 && val2.length > 0) {
                if (val1 === val2) {
                    icons1.check.style.visibility = 'visible';
                    icons2.check.style.visibility = 'visible';
                } else {
                    icons1.xIcon.style.visibility = 'visible';
                    icons2.xIcon.style.visibility = 'visible';
                }
            }
        };

        n1.addEventListener('input', validarCartaoTransp);
        n2.addEventListener('input', validarCartaoTransp);
    }

    function renderizarPasso2() {
        const metodo = selectElement.value.toLowerCase();
        containerPagamento.innerHTML = '';

        const warningBox = document.querySelector('.warning-box');
        if (warningBox) {
            if (metodo.includes('credito') || metodo.includes('debito') || metodo.includes('internacional')) {
                warningBox.classList.remove('hidden');
            } else {
                warningBox.classList.add('hidden');
            }
        }

        if (metodo.includes('pix')) {
            containerPagamento.innerHTML = `
                <div class="pix-container">
                    <div class="qr-placeholder">Placeholder QR Code</div>
                    <div class="pix-key-section">
                        <p class="pix-key-label">Chave PIX:</p>
                        <div class="pix-key-content">
                            <span class="pix-key-value">(placeholderPIX)</span>
                            <button class="pix-copy-btn" aria-label="Copiar chave PIX" title="Copiar">
                                <i class="bi bi-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            btnProsseguir.style.display = 'none';
        }

        else if (metodo.includes('cartão') || metodo.includes('credito') || metodo.includes('debito') || metodo.includes('internacional')) {
            btnProsseguir.style.display = 'block';
            containerPagamento.innerHTML = `
                <div class="card-inputs-row">
                    <div class="input-group-full">
                        <label>Número do Cartão</label>
                        <input type="text" id="card-num" maxlength="19">
                    </div>
                    <div class="input-group-half">
                    <label>Data de Validação</label>
                        <input type="text" id="card-valid" placeholder="MM/YY">
                        <label>CCV</label>
                        <input type="text" id="card-cvv" placeholder="CVV">
                    </div>
                </div>
            `;

            aplicarMascara(document.getElementById('card-num'), "0000 0000 0000 0000");
            aplicarMascara(document.getElementById('card-valid'), "00/00");
            aplicarMascara(document.getElementById('card-cvv'), "000");

            configurarListenerBandeira(document.getElementById('card-num'));
        } else {
            btnProsseguir.style.display = 'block';
            displayImagem.src = imgDefault;
        }
    }

    async function finalizarRecarga(valorStr, situacao, metodo, numCartaoTransp, modal) {
        const btn = document.getElementById('btn-finalizar-fake');

        btn.disabled = true;
        btn.textContent = 'Processando...';

        const valorNum = getValorSeguro(valorStr);

        try {
            const payload = {
                valor: valorNum,
                metodo: metodo.trim().toUpperCase().replace(/\s/g, '_'),
                numCartaoTransporte: numCartaoTransp,
                idBandeira: idBandeiraSelecionada,
                situacao: situacao
            };

            const response = await auth.request('/api/payments/recarga-transporte', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (modal) modal.classList.remove('active');

            if (response.ok && data.success) {
                btn.textContent = 'Sucesso!';

                let modalStatus;
                if (situacao === 'Concluído') {
                    modalStatus = 'success';
                } else if (situacao === 'Em_Revisão') {
                    modalStatus = 'under-review';
                } else if (situacao === 'Recusada') {
                    modalStatus = 'rejected';
                }

                showProcessModal(modalStatus, 'recarga', () => {
                    auth.safeRedirect('/dashboard');
                });
            } else {
                showProcessModal('rejected', 'recarga', () => {
                    btn.disabled = false;
                    btn.textContent = 'Concluir';
                });
            }

        } catch (err) {
            showProcessModal('rejected', 'recarga', () => {
                btn.disabled = false;
                btn.textContent = 'Concluir';
            });
        }
    }

    function abrirModalFinalizacao(valorStr, situacao) {
        const metodoTexto = selectElement.options[selectElement.selectedIndex].text.split('(')[0].trim();
        const valorInserido = valorStr || inputValor.value;
        const numTransp = document.querySelectorAll('.confirm-card input')[0].value;
        const metodo = selectElement.value;

        let modal = document.getElementById('modalRecarga');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalRecarga';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
        <div class="modal-content">
            <h2>Confirmação de Recarga</h2>

            <div class="modal-details">
                <p><strong>Método:</strong> ${metodoTexto}</p>
                <p><strong>Valor:</strong> ${valorInserido}</p>
                <p><strong>Cartão:</strong> ${numTransp}</p>
            </div>

            <div class="modal-buttons-wrapper">
                <button id="btn-finalizar-fake" class="btn-prosseguir">Concluir</button>
                <button id="btn-cancelar-modal">Cancelar</button>
            </div>
        </div>
    `;

        modal.classList.add('active');

        document.getElementById('btn-cancelar-modal').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.classList.remove('active');
        });

        document.getElementById('btn-finalizar-fake').onclick = () => {
            finalizarRecarga(valorInserido, situacao, metodo, numTransp, modal);
        };
    }

    if (inputValor) {
        inputValor.addEventListener('input', (e) => {
            e.target.value = formatarMoeda(e.target.value);
            validarSaldo();
        });
    }

    if (selectElement) {
        selectElement.addEventListener('change', () => {
            validarSaldo();
            renderizarPasso2();
        });
    }

    if (btnProsseguir) {
        btnProsseguir.addEventListener('click', () => {
            const valorRaw = getValorSeguro(inputValor.value);
            const metodo = selectElement.value;
            const inputsTransporte = document.querySelectorAll('.confirm-card input');
            const n1 = inputsTransporte[0].value;
            const n2 = inputsTransporte[1].value;

            if (!metodo || metodo === "Selecione") return alert("Por favor, selecione um método de pagamento.");

            if (valorRaw <= 0) return alert("Por favor, informe o valor da recarga.");
            if (valorRaw < 5) return alert("Valor mínimo: R$ 5,00");
            if (valorRaw > 650) return alert("Valor muito alto, coloque um valor mais baixo.");

            if (!n1 || n1.length < 15) return alert("Informe o número completo do cartão de transporte.");
            if (n1 !== n2) return alert("A confirmação do número do cartão de transporte não confere.");

            if (['CREDITO', 'DEBITO', 'INTERNACIONAL'].includes(metodo)) {
                const cardNum = document.getElementById('card-num')?.value.replace(/\s/g, '') || "";
                const cardValid = document.getElementById('card-valid')?.value || "";
                const cardCvv = document.getElementById('card-cvv')?.value || "";

                if (cardNum.length < 13) return alert("Número do cartão de pagamento incompleto.");

                if (!validarDataCartao(cardValid)) {
                    return alert("Data de validade inválida ou expirada (Mínimo: 2026).");
                }

                if (cardCvv.length < 3) return alert("CVV incompleto.");
            }

            const situacao = valorRaw <= 300 ? 'Concluído' : 'Em_Revisão';
            abrirModalFinalizacao(inputValor.value, situacao);
        });
    }

    document.querySelectorAll('.confirm-card input')
        .forEach(i => aplicarMascara(i, "00.00.00000000-0"));

    document.addEventListener('click', (e) => {
        if (e.target.closest('.pix-copy-btn')) {
            const btn = e.target.closest('.pix-copy-btn');
            const keyValue = btn.parentElement.querySelector('.pix-key-value');
            const pixKey = keyValue ? keyValue.textContent : '(placeholderPIX)';

            navigator.clipboard.writeText(pixKey).then(() => {
                btn.classList.add('copied');
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check-lg"></i>';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalIcon;
                }, 2000);
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = pixKey;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                btn.classList.add('copied');
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check-lg"></i>';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalIcon;
                }, 2000);
            });
        }
    });

    if (wrapper) {
        selectElement.addEventListener('focus', () => wrapper.classList.add('active'));
        selectElement.addEventListener('blur', () => wrapper.classList.remove('active'));
    }

    carregarSaldoCarteira();
});
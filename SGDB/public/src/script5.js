document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;

    if (!idLogado) {
        window.location.href = "/introduction";
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
            if (v.length === 0) { e.target.value = ""; return; }

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
                        options[i].text = `Carteira Digital (Saldo: R$ ${saldoFormatado})`;
                        break;
                    }
                }
                validarSaldo();
            }
        } catch (err) {
            console.error("Erro ao carregar saldo para recarga.");
        }
    }

    function validarSaldo() {
        const valorRaw = inputValor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
        const valorDigitado = parseFloat(valorRaw) || 0;

        const options = Array.from(selectElement.options);
        const opcaoCarteira = options.find(opt => opt.value.toLowerCase().includes('carteira'));

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

    function configurarListenerBandeira(inputCartao) {
        if (!inputCartao) return;
        inputCartao.addEventListener('input', (e) => {
            const valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 0) {
                const ultimoDigito = parseInt(valor.slice(-1));
                if (mapaBandeiras[ultimoDigito]) {
                    displayImagem.src = `${pastaBandeiras}${mapaBandeiras[ultimoDigito]}`;
                    idBandeiraSelecionada = ultimoDigito;
                } else {
                    displayImagem.src = imgDefault;
                    idBandeiraSelecionada = null;
                }
            }
        });
    }
    

    function renderizarPasso2() {
        const metodo = selectElement.value.toLowerCase();
        containerPagamento.innerHTML = '';

        if (metodo.includes('pix')) {
            containerPagamento.innerHTML = `
                <div class="pix-container">
                    <div class="qr-placeholder">QR CODE</div>
                </div>
            `;
        }

        else if (
            metodo.includes('cartão') ||
            metodo.includes('credito') ||
            metodo.includes('debito')
        ) {
            containerPagamento.innerHTML = `
                <div class="card-inputs-row">
                    <div class="input-group-full">
                        <label>Número do Cartão</label>
                        <input type="text" id="card-num" maxlength="19">
                    </div>
                    <div class="input-group-half">
                        <input type="text" id="card-valid" placeholder="MM/YY">
                        <input type="text" id="card-cvv" placeholder="CVV">
                    </div>
                </div>
            `;

            aplicarMascara(document.getElementById('card-num'), "0000 0000 0000 0000");
            aplicarMascara(document.getElementById('card-valid'), "00/00");
            aplicarMascara(document.getElementById('card-cvv'), "000");

            configurarListenerBandeira(document.getElementById('card-num'));
        } else {
            displayImagem.src = imgDefault;
        }
    }

    async function finalizarRecarga(valorStr, situacao, metodo, numCartaoTransp, tipo, modal) {
        const btn = document.getElementById('btn-finalizar-fake');
        btn.disabled = true;
        btn.textContent = 'Processando...';

        const valorNum = typeof valorStr === "string"
            ? valorStr.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
            : valorStr;
        const valor = parseFloat(valorNum);

        try {
            const payload = {
                valor: valorNum,
                metodo: metodo.trim().toUpperCase().replace(/\s/g, '_'),
                numCartaoTransporte: numCartaoTransp,
                tipo: tipo,
                idBandeira: idBandeiraSelecionada,
                situacao: situacao
            };

            const response = await auth.request('/api/payments/recarga-transporte', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                btn.textContent = 'Sucesso!';
                if (situacao === 'Concluido') {
                    alert('Recarga realizada com sucesso! Aguarde algumas horas para o saldo ser creditado no seu cartão de transporte.');
                    window.location.href = '/dashboard';
                } else {
                    alert('Recarga em revisão, aguarde uma resposta do nosso servidor.');
                    window.location.href = '/dashboard';
                }
            } else {
                alert(data.error || 'Erro ao processar recarga');
                btn.disabled = false;
                btn.textContent = 'Concluir';
            }
        } catch (err) {
            alert('Erro de conexão.');
            btn.disabled = false;
            btn.textContent = 'Concluir';
        } finally {
            if (modal) modal.style.display = 'none';
        }
    }

    function abrirModalFinalizacao(valorStr, situacao) {
        const metodoTexto = selectElement.options[selectElement.selectedIndex].text.split('(')[0].trim();
        const valorInserido = valorStr || inputValor.value;
        const numTransp = document.querySelectorAll('.confirm-card input')[0].value;
        const tipo = document.getElementById('select-type').value;
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
                    <p><strong>Tipo:</strong> ${tipo}</p>
                    <p><strong>Cartão:</strong> ${numTransp}</p>
                </div>
                <div class="modal-buttons-wrapper">
                    <button id="btn-finalizar-fake" class="btn-prosseguir">Concluir</button>
                    <button id="btn-cancelar-modal">Voltar</button>
                </div>
            </div>`;

        modal.style.display = 'flex';
        document.getElementById('btn-cancelar-modal').onclick = () => modal.style.display = 'none';
        document.getElementById('btn-finalizar-fake').onclick = () =>
        finalizarRecarga(valorInserido, situacao, metodo, numTransp, tipo, modal);
    }

    if (inputValor) {
        inputValor.addEventListener('input', (e) => {
            e.target.value = formatarMoeda(e.target.value);
            validarSaldo();
        });
    }

    if (selectElement && wrapper) {
        selectElement.addEventListener('change', () => {
            validarSaldo();
            renderizarPasso2();
        });
    }

    const selectType = document.getElementById('select-type');
    const typeWrapper = document.querySelector('.type-card');
    if (selectType && typeWrapper) {
        typeWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = typeWrapper.querySelector('.select-icon');
            toggleElement(typeWrapper, typeWrapper, 'active', 'active', icon);
        });
        selectType.addEventListener('change', () => {
            typeWrapper.classList.add('active');
        });
    }

    if (btnProsseguir) {
        btnProsseguir.addEventListener('click', () => {
            const valor = inputValor.value;
            const valorNum = parseFloat(valor.replace(/\D/g, '')) / 100;
            const inputs = document.querySelectorAll('.confirm-card input');
            const n1 = inputs[0]?.value;
            const n2 = inputs[1]?.value;

            if (valor < 5.00) return alert("Valor mínimo: R$ 5,00");
            if (!n1 || n1.length < 15) return alert("Informe o número do cartão de transporte.");
            if (n1 !== n2) return alert("A confirmação do número do cartão não confere.");

            if (selectElement.value.toLowerCase().includes('cartão')) {
                const cv = document.getElementById('card-valid')?.value;
                if (!cv || cv.length < 5) return alert("Validade do cartão incompleta.");
            }

            if (valor > 650) {
                const pixOption = Array.from(selectElement.options).find(opt => 
                    opt.text.toLowerCase().includes('pix')
                );
                if (pixOption) pixOption.disabled = true;
                if (selectElement.value.toLowerCase().includes('pix')) {
                    selectElement.selectedIndex = 0;
                }
                return alert('Valor muito alto, coloque um valor mais baixo.');
            }

            if (valorNum <= 300) {
                abrirModalFinalizacao(valor, 'Concluido');
            } else {
                abrirModalFinalizacao(valor, 'Em_Revisão');
            }
        });
    }

    document.querySelectorAll('.confirm-card input').forEach(i => aplicarMascara(i, "00.00.00000000-0"));

    carregarSaldoCarteira();
});

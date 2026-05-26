document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;

    if (!idLogado) {
        auth.safeRedirect("/introduction");
        return;
    }

    const selectElement = document.getElementById('select-pagamento');
    const inputValor = document.querySelector('.top-group.valor input');
    const btnProsseguir = document.getElementById('btn-prosseguir');
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
            const val1 = (n1.value || '').trim();
            const val2 = (n2.value || '').trim();

            const d1 = val1.replace(/\D/g, '');
            const d2 = val2.replace(/\D/g, '');

            [icons1.check, icons1.xIcon, icons2.check, icons2.xIcon].forEach(el => el.style.visibility = 'hidden');

            if (d1.length > 0 && d2.length > 0) {
                if (d1 === d2) {
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

    function gerenciarAvisos(metodo) {
        const warningBox = document.querySelector('.warning-box');
        const infoBox = document.querySelector('.info-box');

        if (!warningBox || !infoBox) return;

        const metodoNormalizado = metodo.toLowerCase();

        const mostrarWarning = [
            'credito',
            'debito',
            'internacional'
        ].some(tipo => metodoNormalizado.includes(tipo));

        const mostrarInfo = metodoNormalizado.includes('carteira');

        warningBox.classList.toggle('hidden', !mostrarWarning);
        infoBox.classList.toggle('hidden', !mostrarInfo);
    }

    function alternarVisibilidadeComponentes(metodo) {
        if (metodo.includes('pix')) {
            containerPagamento.innerHTML = obterHtmlPix();
            btnProsseguir.style.display = 'none';
            configurarCopiaPix();
        }
        else if (['cartao', 'credito', 'debito', 'internacional'].some(tipo => metodo.includes(tipo))) {
            btnProsseguir.style.display = 'block';
            containerPagamento.innerHTML = obterHtmlCartao();
            inicializarComportamentosCartao();
        }
        else {
            containerPagamento.innerHTML = '';
            btnProsseguir.style.display = 'block';
            displayImagem.src = imgDefault;
        }
    }

    function obterHtmlPix() {
        return `
        <div class="pix-container">
            <div class="qr-placeholder">Placeholder QR Code</div>
            <div class="pix-key-section">
                <p class="pix-key-label">Chave PIX:</p>
                <div class="pix-key-content">
                    <span class="pix-key-value">placeholder@test02</span>
                    <button class="pix-copy-btn" aria-label="Copiar chave PIX" title="Copiar">
                        <i class="bi bi-copy"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    }

    function obterHtmlCartao() {
        return `
        <div class="card-inputs-row">
            <div class="card-inputs-row">
                <label class="num-card" for="card-num">Número do Cartão</label>
                <input type="text" id="card-num" placeholder="0000 0000 0000 0000">

                <div class="row-cartao">
                    <label class="date-card" for="card-valid">Data de Validade</label>
                    <input type="text" id="card-valid" placeholder="00/00">

                    <label class="cvv-card" for="card-cvv">CVV</label>
                    <input type="text" id="card-cvv" placeholder="000">
                </div>
            </div>
        </div>
        `;
    }

    function inicializarComportamentosCartao() {
        const cardNum = document.getElementById('card-num');
        const cardValid = document.getElementById('card-valid');
        const cardCvv = document.getElementById('card-cvv');

        aplicarMascara(cardNum, "0000 0000 0000 0000");
        aplicarMascara(cardValid, "00/00");
        aplicarMascara(cardCvv, "000");

        configurarListenerBandeira(cardNum);
    }

    function renderizarPasso2() {
        const metodo = selectElement.value.toLowerCase();
        gerenciarAvisos(metodo);
        alternarVisibilidadeComponentes(metodo);
    }

    async function finalizarRecarga(valorStr, metodo, numCartaoTransp, modal) {

        const btn = document.getElementById('btn-finalizar-fake');

        btn.disabled = true;
        btn.textContent = 'Processando...';

        const valorNum = getValorSeguro(valorStr);

        try {

            const payload = {
                valor: valorNum,
                metodo: metodo.trim().toUpperCase().replace(/\s/g, '_'),
                numCartaoTransporte: numCartaoTransp,
                idBandeira: idBandeiraSelecionada
            };

            const response = await auth.request('/api/payments/recarga-transporte', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (modal) {
                modal.classList.remove('active');
                
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }

            const situacao = data.situacao || (response.ok && data.success ? 'Concluído' : 'Recusada');
            
            if (!response.ok || !data.success) {
                showProcessModal(situacao === 'Recusada' ? 'rejected' : 'under-review', 'recarga', () => {
                    auth.safeRedirect('/dashboard');
                });
                return;
            }

            showProcessModal(situacao === 'Concluído' ? 'approved' : 'under-review', 'recarga', () => {
                auth.safeRedirect('/dashboard');
            });

        } catch (err) {

            console.error("Erro ao finalizar recarga:", err);
            showProcessModal('rejected', 'recarga', () => {
                auth.safeRedirect('/dashboard');
            });
        }
    }
    function obterDadosFormulario(valorStr) {
        const selectOptions = selectElement.options;
        const metodoTexto = selectOptions[selectElement.selectedIndex].text.split('(')[0].trim();
        const valorInserido = valorStr || inputValor.value;
        const inputNumTransp = document.querySelectorAll('.confirm-card input')[0];
        const numTransp = inputNumTransp ? inputNumTransp.value : '';
        const metodo = selectElement.value;

        return { metodoTexto, valorInserido, numTransp, metodo };
    }

    function preencherDadosModal(dados) {
        const modal = document.getElementById('modalRecarga');
        if (!modal) return;

        const detalhes = modal.querySelector('.modal-details');
        if (detalhes) {
            detalhes.innerHTML = `
            <p><strong>Método:</strong> ${dados.metodoTexto}</p>
            <p><strong>Valor:</strong> ${dados.valorInserido}</p>
            <p><strong>Cartão:</strong> ${dados.numTransp}</p>
        `;
        }
    }

    function configurarEventosModal() {
        const btnCancelar = document.getElementById('btn-cancelar-modal');
        const btnFinalizar = document.getElementById('btn-finalizar-fake');
        const modal = document.getElementById('modalRecarga');

        if (btnCancelar && modal) {
            btnCancelar.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.remove('active');

                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            });
        }

        if (btnFinalizar) {
            btnFinalizar.onclick = () => {
                const modalContexto = btnFinalizar.dataset;
                finalizarRecarga(
                    modalContexto.valor,
                    modalContexto.metodo,
                    modalContexto.cartao,
                    modal
                );
            };
        }
    }

    function abrirModalFinalizacao(valorStr) {
        const modal = document.getElementById('modalRecarga');
        if (!modal) {
            alert('Erro ao gerar o modal de finalizar recarga.');
            return;
        }

        const dadosForm = obterDadosFormulario(valorStr);
        preencherDadosModal(dadosForm);

        const btnFinalizar = document.getElementById('btn-finalizar-fake');
        if (btnFinalizar) {
            btnFinalizar.dataset.valor = dadosForm.valorInserido;
            btnFinalizar.dataset.metodo = dadosForm.metodo;
            btnFinalizar.dataset.cartao = dadosForm.numTransp;
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.pointerEvents = 'auto';

        configurarEventosModal();
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

            if (valorRaw > 5000) return alert("Valor incábivel para recarga! Tente colocar um valor menor.");

            if (!n1 || n1.length < 15) return alert("Informe o número completo do cartão de transporte.");
            if (n1 !== n2) return alert("A confirmação do número do cartão de transporte não estão iguais.");

            if (['CREDITO', 'DEBITO', 'INTERNACIONAL'].includes(metodo)) {
                const cardNum = document.getElementById('card-num')?.value.replace(/\s/g, '') || "";
                const cardValid = document.getElementById('card-valid')?.value || "";
                const cardCvv = document.getElementById('card-cvv')?.value || "";

                if (cardNum.length < 13) return alert("Número do cartão de pagamento incompleto.");

                if (!validarDataCartao(cardValid)) {
                    return alert("Data de validade inválida ou expirada.");
                }

                if (cardCvv.length < 3) return alert("CVV incompleto.");
            }

            abrirModalFinalizacao(inputValor.value);
        });
    }

    document.querySelectorAll('.confirm-card input')
        .forEach(i => aplicarMascara(i, "00.00.00000000-0"));

    function dispararFeedbackCopia(botao) {
        if (botao.classList.contains('copied')) return;

        botao.classList.add('copied');
        const originalIcon = botao.innerHTML;
        botao.innerHTML = '<i class="bi bi-check-lg"></i>';

        setTimeout(() => {
            botao.classList.remove('copied');
            botao.innerHTML = originalIcon;
        }, 2000);
    }

    function configurarCopiaPix() {
        const containerPix = document.querySelector('.pix-container');
        if (!containerPix) return;

        const btnCopiar = containerPix.querySelector('.pix-copy-btn');
        if (!btnCopiar) return;

        btnCopiar.addEventListener('click', () => {
            const textoParaCopiar = btnCopiar.dataset.chave || "placeholder@test02";

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textoParaCopiar)
                    .then(() => dispararFeedbackCopia(btnCopiar))
                    .catch(err => console.error("Erro ao copiar", err));
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = textoParaCopiar;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    dispararFeedbackCopia(btnCopiar);
                } catch (err) {
                    console.error(err);
                }
                document.body.removeChild(textArea);
            }
        });
    }

    document.querySelectorAll('.confirm-card input').forEach(i => aplicarMascara(i, "00.00.00000000-0"));

    async function salvarCartaoTransporte(numeroCartao) {
        if (!numeroCartao || numeroCartao.length < 15) {
            return false;
        }

        try {
            const response = await auth.request('/api/payments/save-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n_card: numeroCartao })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('Cartão salvo com sucesso:', data);
                return true;
            } else if (response.status === 409) {
                console.log('Cartão já foi registrado:', data.error);
                return false;
            } else {
                console.error('Erro ao salvar cartão:', data.error);
                return false;
            }
        } catch (err) {
            console.error('Erro na requisição de salvar cartão:', err);
            return false;
        }
    }

    const transInputs = document.querySelectorAll('.confirm-card input');
    if (transInputs.length >= 1) {
        const inputPrimeiro = transInputs[0];
        const inputSegundo = transInputs[1];

        let ultimoValorSalvo = '';

        inputPrimeiro.addEventListener('blur', async (e) => {
            const valorAtual = e.target.value.trim();

            if (valorAtual.length >= 15 && valorAtual !== ultimoValorSalvo) {
                const resultado = await salvarCartaoTransporte(valorAtual);
                
                if (resultado) {
                    ultimoValorSalvo = valorAtual;
                    // Feedback visual
                    inputPrimeiro.style.borderColor = '#4CAF50';
                    setTimeout(() => {
                        inputPrimeiro.style.borderColor = '';
                    }, 2000);
                }
            }
        });

        inputSegundo.addEventListener('input', () => {
            const val1 = inputPrimeiro.value.replace(/\D/g, '');
            const val2 = inputSegundo.value.replace(/\D/g, '');

        });
    }

    carregarSaldoCarteira();
});

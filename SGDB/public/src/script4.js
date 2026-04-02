document.addEventListener('DOMContentLoaded', () => {
    const userData = auth.getUserData();
    const idLogado = userData?.id;
    if (!idLogado) return window.location.href = "/introduction";

    const btnInserir = document.getElementById('btn-inserir-credito');
    const modalValor = document.getElementById('modal-valor');
    const modalPagamento = document.getElementById('modal-pagamento');
    const btnProximo = document.getElementById('btn-proximo');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const optValores = document.querySelectorAll('.opt-valor');
    const inputPersonalizado = document.getElementById('valor-personalizado');
    const valorConfirmadoTxt = document.getElementById('valor-confirmado');
    const saldoDisplay = document.getElementById('saldo-usuario');
    const corpoTabela = document.getElementById('corpo-tabela');
    const selectPagamento = document.getElementById('select-pagamento');
    const btnDropdown = document.querySelector('#list-button.icon-button');
    const contentDropdown = document.getElementById('content-dropdown');
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");

    if (btnDropdown && contentDropdown) {
        btnDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            contentDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            if (contentDropdown.classList.contains('show')) {
                contentDropdown.classList.remove('show');
            }
        });
    }

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.style.display = "flex";
        });
    }

    const btnSimLogout = document.getElementById('btn-sim-logout');
    const btnNaoLogout = document.getElementById('btn-nao-logout');

    if (btnSimLogout) {
        btnSimLogout.addEventListener('click', () => {
            auth.clear();
        });
    }

    if (btnNaoLogout) {
        btnNaoLogout.addEventListener('click', () => {
            logoutModal.style.display = "none";
        });
    }

    let valorParaInserir = 0;
    let idBandeiraSelecionada = null;
    const metodosComCartaoTexto = ['débito', 'crédito', 'internacional'];

    // Mapeamento de métodos de pagamento para ID de bandeira
    const mapaBandeiras = {
        'débito': 1,      // VISA Débito
        'crédito': 1,     // VISA Crédito (usando mesmo ID como padrão)
        'internacional': 2, // Mastercard
        'pix': null       // PIX não tem bandeira
    };

    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
    containerCartao.style.display = 'none';
    containerCartao.innerHTML = `
        <input type="text" id="num-cartao" placeholder="Número do Cartão" maxlength="16">
        <input type="text" id="validade-cartao" placeholder="MM/YY" maxlength="5">
        <input type="text" id="cvv-cartao" placeholder="CVV" maxlength="3">
    `;
    const containerPix = document.createElement('div');
    containerPix.id = 'container-pix';
    containerPix.style.display = 'none';
    containerPix.innerHTML = `<div class="pix-placeholder">PIX QR Code Placeholder</div>`;

    if (selectPagamento) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');
        if (wrapper) {
            wrapper.parentNode.insertBefore(containerCartao, wrapper.nextSibling);
            wrapper.parentNode.insertBefore(containerPix, wrapper.nextSibling);
        }
        selectPagamento.addEventListener('change', () => {
            const metodo = selectPagamento.value.toLowerCase();
            containerCartao.style.display = metodosComCartaoTexto.includes(metodo) ? 'block' : 'none';
            containerPix.style.display = metodo === 'pix' ? 'block' : 'none';
            
            // Atualizar ID de bandeira baseado no método selecionado
            idBandeiraSelecionada = mapaBandeiras[metodo] || null;
        });
    }

    document.addEventListener('input', e => {
        if (e.target.id === 'validade-cartao') {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 4) v = v.slice(0, 4);
            if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
            e.target.value = v;
        }
    });

    optValores.forEach(opt => {
        opt.addEventListener('click', () => {
            if (opt.classList.contains('ativo')) {
                opt.classList.remove('ativo');
                valorParaInserir = 0;
            } else {
                optValores.forEach(o => o.classList.remove('ativo'));
                opt.classList.add('ativo');

                if (inputPersonalizado) inputPersonalizado.value = '';

                valorParaInserir = parseFloat(opt.dataset.valor);
            }
        });
    });

    if (inputPersonalizado) {
        inputPersonalizado.addEventListener('input', (e) => {
            optValores.forEach(o => o.classList.remove('ativo'));

            const valorFormatado = formatarMoeda(e.target.value);
            e.target.value = valorFormatado;
            valorParaInserir = parseFloat(valorFormatado.replace("R$ ", "").replace(/\./g, "").replace(",", ".")) || 0;
        });
    }

    function formatarMoeda(valor) {
        let v = valor.replace(/\D/g, "");

        v = (v / 100).toFixed(2).replace(".", ",");

        v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return "R$ " + v;
    }

    if (btnInserir) btnInserir.addEventListener('click', () => modalValor.style.display = 'flex');

    document.querySelectorAll('.btn-cancelar').forEach(btn => btn.addEventListener('click', () => {
        modalValor.style.display = 'none';
        modalPagamento.style.display = 'none';
        optValores.forEach(o => o.classList.remove('ativo'));
        if (inputPersonalizado) inputPersonalizado.value = '';
        valorParaInserir = 0;
    }));

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (valorParaInserir <= 0) {
                return alert("Selecione ou digite um valor.");
            }

            if (valorParaInserir < 5.00) {
                alert("Valor mínimo requisitado: 5,00.");
                return;
            }

            if (valorConfirmadoTxt) {
                valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            modalValor.style.display = 'none';
            modalPagamento.style.display = 'flex';
        });
    }

    if (selectPagamento) {
        const wrapper = selectPagamento.closest('.select-wrapper-modal');

        if (wrapper) {
            selectPagamento.addEventListener('focus', () => {
                wrapper.classList.add('active');
            });

            selectPagamento.addEventListener('blur', () => {
                wrapper.classList.remove('active');
            });

            selectPagamento.addEventListener('change', () => {
                wrapper.classList.remove('active');
                const metodo = selectPagamento.value.toLowerCase();
                containerCartao.style.display = metodosComCartaoTexto.includes(metodo) ? 'block' : 'none';
                containerPix.style.display = metodo === 'pix' ? 'block' : 'none';
            });
        }
    }

    async function adicionarCredito(valor, metodo, numCartao) {
        const token = auth.getToken();
        try {
            const response = await fetch(`${window.location.origin}/api/payments/process-credit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    valor: valor,
                    metodo: metodo.toUpperCase(),
                    numCartao: numCartao,
                    idBandeira: idBandeiraSelecionada,
                    origem: "Carteira Digital"
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Crédito adicionado com sucesso!");
                modalPagamento.style.display = 'none';
                valorParaInserir = 0;
                if (inputPersonalizado) inputPersonalizado.value = '';
                optValores.forEach(o => o.classList.remove('ativo'));
            } else {
                alert("Erro: " + (result.error || "Falha ao processar"));
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de conexão com o servidor.");
        }
    }

function validarMesExpiracao(validade) {
    if (!validade) return false;
    const mes = parseInt(validade.substring(0, 2));
    return mes >= 1 && mes <= 12;
}


    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            const metodoRaw = selectPagamento?.value;
            if (!metodoRaw) {
                alert('Selecione um método de pagamento.');
                return;
            }

        if (metodosComCartaoTexto.includes(metodoRaw)) {
            const validadeInput = document.getElementById('validade-cartao')?.value;
            
            if (!validarMesExpiracao(validadeInput)) {
                alert("Data de validade inválida!");
                return;
            }
        }
            const numCartaoInput = document.getElementById('num-cartao')?.value || "";

            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Processando...";

            await adicionarCredito(valorParaInserir, metodoRaw, numCartaoInput);

            btnFinalizar.disabled = false;
            btnFinalizar.innerText = "Finalizar";

            await carregarDadosIniciais();
        });
    }

    async function carregarDadosIniciais() {
        const token = auth.getToken();
        if (!token) {
            console.error("Token não encontrado.");
            return window.location.href = "/introduction"
        }
        try {
            const response = await fetch(`${window.location.origin}/api/payments/wallet-data/${idLogado}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) return;
            const data = await response.json();
            if (saldoDisplay) saldoDisplay.innerText = `R$ ${parseFloat(data.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            if (!corpoTabela) return;
            corpoTabela.innerHTML = '';
            if (!data.historico || !data.historico.length) {
                corpoTabela.innerHTML = '<tr><td colspan="5">Sem movimentações.</td></tr>';
            } else {
                data.historico.forEach(mov => {
                    const situacao = (mov.situacao || 'pendente').toLowerCase();
                    const classe = situacao.includes('concl') ? 'status-verde' : (situacao.includes('rev') || situacao.includes('pend') ? 'status-amarelo' : 'status-vermelho');
                    const linha = document.createElement('tr');
                    linha.className = classe;
                    linha.innerHTML = `
                        <td>${mov.n_protocolo || '---'}</td>
                        <td>${(mov.tipo || 'Crédito').toUpperCase()}</td>
                        <td>${mov.bandeira_banco?.nome_bandeira || '---'}</td>
                        <td>R$ ${parseFloat(mov.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td><button class="btn-print"><i class="bi bi-printer"></i> IMPRIMIR</button></td>
                    `;
                    corpoTabela.appendChild(linha);
                });
            }
        } catch (e) { console.error(e); }
    }

    carregarDadosIniciais();
});
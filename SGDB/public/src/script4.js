document.addEventListener('DOMContentLoaded', () => {

    const idLogado = localStorage.getItem('userId');

    if (!idLogado || idLogado === "undefined") {
        window.location.href = "/introduction";
        return;
    }

    const listButton = document.getElementById('list-button');
    const contentDropdown = document.getElementById('content-dropdown');
    const btnInserir = document.getElementById('btn-inserir-credito');
    const modalValor = document.getElementById('modal-valor');
    const modalPagamento = document.getElementById('modal-pagamento');
    const btnProximo = document.getElementById('btn-proximo');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const optValores = document.querySelectorAll('.opt-valor');
    const inputPersonalizado = document.getElementById('valor-personalizado');
    const valorConfirmadoTxt = document.getElementById('valor-confirmado');
    const selectPagamento = document.getElementById('metodo-pagamento'); // Select do Modal
    const saldoDisplay = document.getElementById('saldo-usuario');
    const corpoTabela = document.getElementById('corpo-tabela');
    const selectElement = document.getElementById('select-pagamento'); // Select da Página
    
    let valorParaInserir = 0;

    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
    containerCartao.style.display = 'none';

    containerCartao.innerHTML = `
        <p style="font-size:0.8rem; margin-top:10px; font-weight:bold;">
            Informações do Cartão:
        </p>
        <input 
            type="text" 
            id="num-cartao" 
            placeholder="Número do Cartão (16 dígitos)" 
            maxlength="16"
            style="width:100%; padding:12px; margin-top:5px; border-radius:15px; border:3px solid #375477; background:#dbdbdb;"
        >
    `;

    if (selectPagamento && selectPagamento.parentNode) {
        selectPagamento.parentNode.insertBefore(containerCartao, selectPagamento.nextSibling);

        selectPagamento.addEventListener('change', () => {
            const metodosComCartao = ['débito', 'crédito', 'internacional'];
            
            if (metodosComCartao.includes(selectPagamento.value)) {
                containerCartao.style.display = 'block';
            } else {
                containerCartao.style.display = 'none';
                const inputCartao = document.getElementById('num-cartao');
                if (inputCartao) inputCartao.value = ""; 
            }
            
            if (selectPagamento.parentElement) {
                selectPagamento.parentElement.classList.remove('active');
            }
        });

        selectPagamento.addEventListener('click', () => {
            if (selectPagamento.parentElement) selectPagamento.parentElement.classList.toggle('active');
        });
        selectPagamento.addEventListener('blur', () => {
            setTimeout(() => { 
                if (selectPagamento.parentElement) selectPagamento.parentElement.classList.remove('active');
            }, 200);
        });
    }

    if (selectElement && selectElement.parentElement) {
        const wrapper = selectElement.parentElement;
        selectElement.addEventListener('click', () => wrapper.classList.toggle('active'));
        selectElement.addEventListener('blur', () => wrapper.classList.remove('active'));
        selectElement.addEventListener('change', () => wrapper.classList.remove('active'));
    }

    async function carregarDadosIniciais() {
        try {
            const data = await obterDadosCarteira(idLogado);
            if (!data) return;

            if (saldoDisplay) {
                const saldoNumerico = parseFloat(data.saldo) || 0;
                saldoDisplay.innerText = `R$ ${saldoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }

            if (corpoTabela) {
                corpoTabela.innerHTML = '';
                if (data.historico && data.historico.length > 0) {
                    data.historico.forEach(mov => {
                        const linha = document.createElement('tr');
                        const situacao = (mov.situacao || 'pendente').toLowerCase().trim();
                        let classeStatus = '';

                        if (['concluído', 'concluido', 'validado', 'sucesso'].includes(situacao)) {
                            classeStatus = 'status-verde';
                        } else if (['em revisão', 'pendente', 'processando'].includes(situacao)) {
                            classeStatus = 'status-amarelo';
                        } else {
                            classeStatus = 'status-vermelho';
                        }

                        linha.className = classeStatus;
                        linha.innerHTML = `
                            <td class="protocolo-texto">${mov.n_protocolo || '---'}</td>
                            <td style="font-weight:bold;">${(mov.tipo || 'Crédito').toUpperCase()}</td>
                            <td>${mov.nome_bandeira || 'VISA'}</td>
                            <td style="font-weight:bold;">R$ ${parseFloat(mov.valor).toFixed(2).replace('.', ',')}</td>
                            <td><button class="btn-print"><i class="bi bi-printer"></i> IMPRIMIR</button></td>
                        `;
                        corpoTabela.appendChild(linha);
                    });
                } else {
                    corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhuma movimentação encontrada.</td></tr>';
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    }

    optValores.forEach(opt => {
        opt.addEventListener('click', () => {
            optValores.forEach(o => o.classList.remove('ativo'));
            opt.classList.add('ativo');
            if (inputPersonalizado) inputPersonalizado.value = '';
            valorParaInserir = parseFloat(opt.dataset.valor);
        });
    });

    if (inputPersonalizado) {
        inputPersonalizado.addEventListener('input', () => {
            optValores.forEach(o => o.classList.remove('ativo'));
            valorParaInserir = parseFloat(inputPersonalizado.value) || 0;
        });
    }

    if (btnInserir) btnInserir.addEventListener('click', () => modalValor.style.display = 'flex');

    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modalValor) modalValor.style.display = 'none';
            if (modalPagamento) modalPagamento.style.display = 'none';
            valorParaInserir = 0;
        });
    });

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (!valorParaInserir || valorParaInserir <= 0) return alert("Selecione um valor.");
            if (valorConfirmadoTxt) valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            modalValor.style.display = 'none';
            modalPagamento.style.display = 'flex';
        });
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            const metodo = selectPagamento?.value;
            if (!metodo) return alert("Selecione o método de pagamento.");

            const inputCartao = document.getElementById('num-cartao');
            const numCartao = inputCartao?.value || "";


            const metodosComCartao = ['débito', 'crédito', 'internacional'];
            if (metodosComCartao.includes(metodo) && numCartao.length < 16) {
                return alert("Por favor, digite os 16 dígitos do cartão.");
            }

            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Processando...";

            try {
                const response = await fetch('/api/payments/add-credit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idUsuario: idLogado,
                        valor: valorParaInserir,
                        metodo: metodo,
                        numCartao: numCartao || "0000000000000000"
                    })
                });

                if (response.ok) {
                    alert("Crédito inserido com sucesso!");
                    location.reload();
                } else {
                    alert("Erro ao processar pagamento.");
                    btnFinalizar.disabled = false;
                    btnFinalizar.innerText = "Finalizar";
                }
            } catch (err) {
                alert("Erro de conexão.");
                btnFinalizar.disabled = false;
            }
        });
    }

    if (listButton && contentDropdown) {
        listButton.addEventListener('click', (e) => {
            e.stopPropagation();
            contentDropdown.classList.toggle('active');
        });

        window.onclick = (e) => {
            if (!e.target.closest('.dropdown-container')) {
                contentDropdown.classList.remove('active');
            }
        };
    }

    carregarDadosIniciais();
});
document.addEventListener('DOMContentLoaded', () => {
    const listButton = document.getElementById('list-button');
    const contentDropdown = document.getElementById('content-dropdown');
    const btnInserir = document.getElementById('btn-inserir-credito');
    const modalValor = document.getElementById('modal-valor');
    const modalPagamento = document.getElementById('modal-pagamento');
    const btnProximo = document.getElementById('btn-proximo');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const btnTheme = document.getElementById('change-button');
    const optValores = document.querySelectorAll('.opt-valor');
    const inputPersonalizado = document.getElementById('valor-personalizado');
    const valorConfirmadoTxt = document.getElementById('valor-confirmado');
    const saldoDisplay = document.getElementById('saldo-usuario');
    const corpoTabela = document.getElementById('corpo-tabela');
    const selectPagamento = document.getElementById('metodo-pagamento');


    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
    containerCartao.style.display = 'none';
    containerCartao.innerHTML = `
    <input type="text" id="num-cartao" placeholder="Número do Cartão (16 dígitos)" 
    style="width: 100%; padding: 10px; margin-top: 10px; border-radius: 10px; border: 2px solid #375477;">
`;
    selectPagamento.parentNode.insertBefore(containerCartao, selectPagamento.nextSibling);


    selectPagamento.addEventListener('change', () => {
        const metodosCartao = ['débito', 'crédito', 'internacional'];
        if (metodosCartao.includes(selectPagamento.value)) {
            containerCartao.style.display = 'block';
        } else {
            containerCartao.style.display = 'none';
        }
    });

    btnFinalizar.addEventListener('click', async () => {
        const metodo = selectPagamento.value;
        const numCartaoInput = document.getElementById('num-cartao').value;

        if (!metodo) return alert("Selecione um método!");

        if (['débito', 'crédito', 'internacional'].includes(metodo) && numCartaoInput.length < 13) {
            return alert("Por favor, insira um número de cartão válido.");
        }

        const dados = {
            idUsuario: 1,
            valor: valorParaInserir,
            metodo: metodo,
            numCartao: numCartaoInput || "0000000000000"
        };

        try {
            const response = await fetch('/api/payments/add-credit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                alert("Pagamento processado com sucesso!");
                modalPagamento.style.display = 'none';
                document.getElementById('num-cartao').value = '';
                selectPagamento.value = '';
                containerCartao.style.display = 'none';
                carregarDadosIniciais();
            } else {
                const erro = await response.json();
                alert("Erro: " + erro.error);
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão com o servidor.");
        }

        let valorParaInserir = 0;

        async function carregarDadosIniciais() {
            try {
                const idUsuario = 1;
                const response = await fetch(`/api/payments/wallet-data/${idUsuario}`);
                const data = await response.json();

                saldoDisplay.innerText = `R$ ${parseFloat(data.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

                corpoTabela.innerHTML = '';
                data.historico.forEach(mov => {
                    const linha = `
                    <tr>
                        <td>${mov.n_protocolo}</td>
                        <td>${mov.tipo.toUpperCase()}</td>
                        <td>${mov.nome_bandeira || 'N/A'}</td>
                        <td>R$ ${parseFloat(mov.valor).toFixed(2)}</td>
                        <td><button class="btn-print"><i class="bi bi-printer"></i></button></td>
                    </tr>
                `;
                    corpoTabela.innerHTML += linha;
                });
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                saldoDisplay.innerText = "R$ 0.00";
            }
        }

        async function executarPagamento() {
            const metodo = document.getElementById('metodo-pagamento').value;
            if (!metodo) return alert("Selecione um método!");

            const dados = {
                idUsuario: 1,
                valor: valorParaInserir,
                metodo: metodo,
                numCartao: "444455556666777" + "1"
            };

            try {
                const response = await fetch('/api/payments/add-credit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert("Crédito inserido com sucesso!");
                    modalPagamento.style.display = 'none';
                    carregarDadosIniciais(); // Recarrega saldo e tabela sem dar F5
                }
            } catch (err) {
                alert("Erro ao processar pagamento.");
            }
        }

        carregarDadosIniciais();

        listButton.addEventListener('click', (e) => {
            e.stopPropagation();
            contentDropdown.classList.toggle('active');
        });

        btnTheme.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });

        btnInserir.addEventListener('click', () => {
            modalValor.style.display = 'flex';
        });

        document.querySelectorAll('.btn-retornar, .btn-cancelar').forEach(btn => {
            btn.addEventListener('click', () => {
                modalValor.style.display = 'none';
                modalPagamento.style.display = 'none';
            });
        });

        optValores.forEach(opt => {
            opt.addEventListener('click', () => {
                optValores.forEach(o => o.classList.remove('ativo'));
                opt.classList.add('ativo');
                inputPersonalizado.value = '';
                valorParaInserir = parseFloat(opt.dataset.valor);
            });
        });

        btnProximo.addEventListener('click', () => {
            let valor = inputPersonalizado.value;
            if (valor) {
                valorParaInserir = parseFloat(valor);
            } else {
                const selecionado = document.querySelector('.opt-valor.ativo');
                if (!selecionado) return alert("Selecione ou digite um valor");
                valorParaInserir = parseFloat(selecionado.dataset.valor);
            }

            valorConfirmadoTxt.innerText = `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            modalValor.style.display = 'none';
            modalPagamento.style.display = 'flex';
        });

        btnFinalizar.addEventListener('click', executarPagamento);

        window.onclick = (e) => {
            if (!e.target.closest('.dropdown-container')) contentDropdown.classList.remove('active');
        };
    });
});
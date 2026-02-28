document.addEventListener('DOMContentLoaded', () => {
    const idLogado = localStorage.getItem('userId');

    if (!idLogado) {
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
    const btnTheme = document.getElementById('change-button');
    const optValores = document.querySelectorAll('.opt-valor');
    const inputPersonalizado = document.getElementById('valor-personalizado');
    const valorConfirmadoTxt = document.getElementById('valor-confirmado');
    const selectPagamento = document.getElementById('metodo-pagamento');
    const saldoDisplay = document.getElementById('saldo-usuario');
    const corpoTabela = document.getElementById('corpo-tabela');

    let valorParaInserir = 0;

    async function carregarDadosIniciais() {
        try {
            const response = await fetch(`/api/payments/wallet-data/${idLogado}`);
            if (!response.ok) throw new Error("Falha na resposta do servidor");

            const data = await response.json();

            saldoDisplay.innerText = `R$ ${parseFloat(data.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

            corpoTabela.innerHTML = '';
            data.historico.forEach(mov => {
                const linha = `
                    <tr>
                        <td>${mov.n_protocolo}</td>
                        <td>${mov.tipo.toUpperCase()}</td>
                        <td>${mov.nome_bandeira || '---'}</td>
                        <td>R$ ${parseFloat(mov.valor).toFixed(2).replace('.', ',')}</td>
                        <td><button class="btn-print"><i class="bi bi-printer"></i></button></td>
                    </tr>
                `;
                corpoTabela.innerHTML += linha;
            });
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        }
    }

    const containerCartao = document.createElement('div');
    containerCartao.id = 'container-cartao';
    containerCartao.style.display = 'none';
    containerCartao.innerHTML = `
        <p style="font-size: 0.8rem; margin-top:10px; font-weight:bold;">Informações do Cartão:</p>
        <input type="text" id="num-cartao" placeholder="Número do Cartão (16 dígitos)" maxlength="16"
        style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 15px; border: 3px solid #375477; background:#dbdbdb;">
    `;
    selectPagamento.parentNode.insertBefore(containerCartao, selectPagamento.nextSibling);

    selectPagamento.addEventListener('change', () => {
        const metodosComCartao = ['débito', 'crédito', 'internacional'];
        containerCartao.style.display = metodosComCartao.includes(selectPagamento.value) ? 'block' : 'none';
    });

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

    btnFinalizar.addEventListener('click', async () => {
        const idLogado = localStorage.getItem('userId');
        const metodo = selectPagamento.value;
        const numCartao = document.getElementById('num-cartao').value;

        if (!idLogado || idLogado === "undefined") {
            return alert("Erro: Usuário não identificado. Tente fazer login novamente.");
        }

        const dados = {
            idUsuario: idLogado,
            valor: valorParaInserir,
            metodo: metodo,
            numCartao: numCartao || "0000000000000000"
        };

        try {
            const response = await fetch('/api/payments/add-credit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                alert("Pagamento finalizado com sucesso!");
                modalPagamento.style.display = 'none';
                carregarDadosIniciais(); // Atualiza a tela
            } else {
                const erro = await response.json();
                alert("Erro no pagamento: " + erro.error);
            }
        } catch (err) {
            alert("Erro ao conectar com o servidor.");
        }
    });

    window.onclick = (e) => {
        if (!e.target.closest('.dropdown-container')) contentDropdown.classList.remove('active');
    };
});
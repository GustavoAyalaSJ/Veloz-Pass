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
    const selectPagamento = document.getElementById('metodo-pagamento');
    const saldoDisplay = document.getElementById('saldo-usuario');
    const corpoTabela = document.getElementById('corpo-tabela');

    let valorParaInserir = 0;

    async function carregarDadosIniciais() {

        const data = await obterDadosCarteira(idLogado);

        if (!data) return;

        if (saldoDisplay) {
            const saldoNumerico = parseFloat(data.saldo) || 0;
            saldoDisplay.innerText =
                `R$ ${saldoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }

        corpoTabela.innerHTML = '';

        if (data.historico && data.historico.length > 0) {

            data.historico.forEach(mov => {

                const linha = document.createElement('tr');

                const situacao = (mov.situacao || 'pendente').toLowerCase().trim();
                let classeStatus = '';

                if (
                    situacao === 'concluído' ||
                    situacao === 'concluido' ||
                    situacao === 'validado' ||
                    situacao === 'sucesso'
                ) {
                    classeStatus = 'status-verde';
                } else if (
                    situacao === 'em revisão' ||
                    situacao === 'pendente' ||
                    situacao === 'processando'
                ) {
                    classeStatus = 'status-amarelo';
                } else {
                    classeStatus = 'status-vermelho';
                }

                linha.className = classeStatus;

                linha.innerHTML = `
                    <td class="protocolo-texto">${mov.n_protocolo || '---'}</td>
                    <td style="font-weight: bold;">${(mov.tipo || 'Crédito').toUpperCase()}</td>
                    <td>${mov.nome_bandeira || 'VISA'}</td>
                    <td style="font-weight: bold;">
                        R$ ${parseFloat(mov.valor).toFixed(2).replace('.', ',')}
                    </td>
                    <td>
                        <button class="btn-print">
                            <i class="bi bi-printer"></i> IMPRIMIR
                        </button>
                    </td>
                `;

                corpoTabela.appendChild(linha);
            });

        } else {

            corpoTabela.innerHTML =
                '<tr><td colspan="5" style="text-align:center;">Nenhuma movimentação encontrada.</td></tr>';

        }
    }

    optValores.forEach(opt => {

        opt.addEventListener('click', () => {

            if (opt.classList.contains('ativo')) {

                opt.classList.remove('ativo');
                valorParaInserir = 0;

            } else {

                optValores.forEach(o => o.classList.remove('ativo'));

                opt.classList.add('ativo');
                inputPersonalizado.value = '';

                valorParaInserir = parseFloat(opt.dataset.valor);
            }
        });
    });

    inputPersonalizado.addEventListener('input', () => {

        if (inputPersonalizado.value !== "") {

            optValores.forEach(o => o.classList.remove('ativo'));

            valorParaInserir = parseFloat(inputPersonalizado.value);
        }
    });

    btnInserir.addEventListener('click', () => modalValor.style.display = 'flex');

    document.querySelectorAll('.btn-cancelar').forEach(btn => {

        btn.addEventListener('click', () => {

            modalValor.style.display = 'none';
            modalPagamento.style.display = 'none';

            optValores.forEach(o => o.classList.remove('ativo'));

            inputPersonalizado.value = '';

            valorParaInserir = 0;
        });
    });

    btnProximo.addEventListener('click', () => {

        if (inputPersonalizado.value !== "") {
            valorParaInserir = parseFloat(inputPersonalizado.value);
        }

        if (!valorParaInserir || valorParaInserir <= 0) {
            return alert("Por favor, selecione ou digite um valor válido.");
        }

        valorConfirmadoTxt.innerText =
            `R$ ${valorParaInserir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        modalValor.style.display = 'none';
        modalPagamento.style.display = 'flex';
    });

    btnFinalizar.addEventListener('click', async () => {

        const metodo = selectPagamento.value;

        if (!metodo) {
            return alert("Selecione um método de pagamento.");
        }

        const dados = {
            idUsuario: idLogado,
            valor: valorParaInserir,
            metodo: metodo,
            numCartao: document.getElementById('num-cartao')?.value || "0000000000000000"
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

                carregarDadosIniciais();

            } else {

                const erro = await response.json();

                alert("Erro: " + erro.error);
            }

        } catch (err) {

            alert("Erro ao conectar com o servidor.");
        }
    });

    listButton.addEventListener('click', (e) => {
        e.stopPropagation();
        contentDropdown.classList.toggle('active');
    });

    window.onclick = (e) => {
        if (!e.target.closest('.dropdown-container')) {
            contentDropdown.classList.remove('active');
        }
    };

    carregarDadosIniciais();

});
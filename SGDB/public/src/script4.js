document.addEventListener('DOMContentLoaded', () => {
    const listButton = document.getElementById('list-button');
    const contentDropdown = document.getElementById('content-dropdown');
    const btnInserir = document.getElementById('btn-inserir-credito');
    const modalValor = document.getElementById('modal-valor');
    const modalPagamento = document.getElementById('modal-pagamento');
    const btnProximo = document.getElementById('btn-proximo');
    const btnTheme = document.getElementById('change-button');
    const optValores = document.querySelectorAll('.opt-valor');
    const inputPersonalizado = document.getElementById('valor-personalizado');
    const valorConfirmadoTxt = document.getElementById('valor-confirmado');

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
        });
    });

    btnProximo.addEventListener('click', () => {
        let valor = inputPersonalizado.value;
        if (!valor) {
            const selecionado = document.querySelector('.opt-valor.ativo');
            valor = selecionado ? selecionado.dataset.valor : "0";
        }
        valorConfirmadoTxt.innerText = `R$ ${parseFloat(valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        modalValor.style.display = 'none';
        modalPagamento.style.display = 'flex';
    });

    window.onclick = (e) => {
        if (!e.target.closest('.dropdown-container')) contentDropdown.classList.remove('active');
    };
});
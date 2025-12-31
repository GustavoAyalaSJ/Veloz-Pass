document.addEventListener('DOMContentLoaded', () => {
    const modalRoot = document.getElementById('rootModal');
    const modalContentContainer = document.getElementById('modalContentContainer');
    const btnOpenLoginMain = document.getElementById('btnOpenLoginMain');
    const btnOpenTermosHeader = document.getElementById('btnOpenTermosHeader');

    const loginTemplate = modalContentContainer.innerHTML;

    const cadastroTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Crie sua conta</h2>
<form id="formCadastro" autocomplete="off">

    <label>Nome Completo:</label>
    <input type="text" placeholder="Digite o seu nome aqui" required autocomplete="off">

    <label>CPF:</label>
    <input type="text" id="inputCPF" placeholder="000.000.000-00"required autocomplete="off" maxlength="11">

    <label>Telefone:</label>
    <input type="text" placeholder="(xx) xxxxx-xxxx" maxlength="11" required autocomplete="off">

    <label>E-mail:</label>
    <input type="email" placeholder="@email.com" required autocomplete="username">

    <label>Senha:</label>
    <input type="password" placeholder="Crie uma senha forte" required autocomplete="new-password">

    <label>Confirmar Senha:</label>
    <input type="password" placeholder="Confirme a senha aqui!" required autocomplete="new-password">

    <button type="submit">Finalizar Cadastro</button>
</form>
    `;

    const termosTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Termos e Políticas</h2>
        <div">
            <p><strong>1. Uso do Site:</strong> PLACEHOLDER</p>
            <p><strong>2. Privacidade:</strong> PLACEHOLDER</p>
            <p><strong>3. Serviços:</strong> PLACEHOLDER</p>
            <p>PLACEHOLDER TEXT.</p>
        </div>
    `;

    function openModal() {
        modalRoot.classList.remove('hidden');
    }

    function closeModal() {
        modalRoot.classList.add('hidden');
        setTimeout(() => renderView('login'), 300);
    }

    function renderView(viewName) {
        if (viewName === 'login') {
            modalContentContainer.innerHTML = loginTemplate;
        } else if (viewName === 'cadastro') {
            modalContentContainer.innerHTML = cadastroTemplate;
        } else if (viewName === 'termos') {
            modalContentContainer.innerHTML = termosTemplate;
        }

        setupDynamicEvents();
    }

    function setupDynamicEvents() {
        const btnClose = document.getElementById('btnCloseModal');
        if (btnClose) btnClose.onclick = closeModal;

        const btnGoToCadastro = document.getElementById('btnGoToCadastro');
        if (btnGoToCadastro) {
            btnGoToCadastro.onclick = () => renderView('cadastro');
        }

        const btnGoToTermos = document.getElementById('btnGoToTermos');
        if (btnGoToTermos) {
            btnGoToTermos.onclick = () => renderView('termos');
        }

        const btnBackToLogin = document.getElementById('btnBackToLogin');
        if (btnBackToLogin) {
            btnBackToLogin.onclick = () => renderView('login');
        }

        const formCadastro = document.getElementById('formCadastro');
        if (formCadastro) {
            formCadastro.addEventListener('submit', (event) => {
                event.preventDefault();

                const cpfInput = document.getElementById('inputCPF');
                const cpfValue = cpfInput.value.trim();

                if (cpfValue.startsWith('9')) {
                    alert("Cadastro finalizado com sucesso!");
                    closeModal();
                } else {
                    alert("Disponível apenas para Santa Catarina.");
                    cpfInput.value = '';
                    cpfInput.focus();
                }
            });
        }
    }

    btnOpenLoginMain.addEventListener('click', () => {
        renderView('login');
        openModal();
    });

    btnOpenTermosHeader.addEventListener('click', () => {
        renderView('termos');
        openModal();
    });

    setupDynamicEvents();
});
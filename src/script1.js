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
        <h2>Termos de Uso e Políticas de Privacidade</h2>
        <div class="modal-terms-content">
            <div>
                <strong>1. Uso do Site</strong>
                <p>O Veloz Pass é um serviço de recarga de cartão de transporte. Ao utilizar este site, você concorda em usar o serviço apenas para fins legítimos e não-comerciais. Você não pode reproduzir, duplicar, copiar, vender, revender ou explorar qualquer parte deste site sem permissão expressa.</p>
            </div>
            
            <div>
                <strong>2. Privacidade e Proteção de Dados</strong>
                <p>Coletamos informações pessoais como nome, CPF, telefone e e-mail apenas para processar suas solicitações de recarga. Todos os seus dados são protegidos com encriptação de segurança. Nunca compartilhamos suas informações com terceiros sem consentimento.</p>
            </div>
            
            <div>
                <strong>3. Serviços de Recarga</strong>
                <p>O Veloz Pass oferece recargas rápidas e seguras de cartões de transporte. As transações são processadas em tempo real e você receberá confirmação imediata. Em caso de problemas, nosso suporte humano está disponível para ajudá-lo.</p>
            </div>
            
            <div>
                <strong>4. Responsabilidade</strong>
                <p>O Veloz Pass não se responsabiliza por falhas de conexão de internet, erros do usuário ou problemas em servidores de terceiros. Você aceita todos os riscos associados ao uso deste serviço.</p>
            </div>
            
            <div>
                <strong>5. Modificações nos Termos</strong>
                <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após publicação. O uso continuado do site constitui aceitação dos termos modificados.</p>
            </div>
        </div>
    `;

    const esqueceuSenhaTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Recuperar Senha</h2>
        <form id="formEsqueceuSenha" autocomplete="off">
            <label>E-mail cadastrado:</label>
            <input type="email" placeholder="Digite seu e-mail" required autocomplete="email">

            <p style="font-size: 0.85rem; color: #ffffff; margin: 10px 0;">Você receberá um link de recuperação em seu e-mail em poucos minutos.</p>

            <button type="submit" style="background-color: #007bff; color: white; margin-top: 10px;">Enviar Link de Recuperação</button>
            <button type="button" id="btnBackToLogin">Voltar ao Login</button>
        </form>
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
        } else if (viewName === 'esqueceuSenha') {
            modalContentContainer.innerHTML = esqueceuSenhaTemplate;
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
            btnGoToTermos.onclick = (e) => {
                e.preventDefault();
                renderView('termos');
            };
        }

        const btnGoToPrivacidade = document.getElementById('btnGoToPrivacidade');
        if (btnGoToPrivacidade) {
            btnGoToPrivacidade.onclick = (e) => {
                e.preventDefault();
                renderView('termos');
            };
        }

        const btnBackToLogin = document.getElementById('btnBackToLogin');
        if (btnBackToLogin) {
            btnBackToLogin.onclick = () => renderView('login');
        }

        const btnEsqueceuSenha = document.getElementById('btnEsqueceuSenha');
        if (btnEsqueceuSenha) {
            btnEsqueceuSenha.onclick = (e) => {
                e.preventDefault();
                renderView('esqueceuSenha');
            };
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

        const formEsqueceuSenha = document.getElementById('formEsqueceuSenha');
        if (formEsqueceuSenha) {
            formEsqueceuSenha.addEventListener('submit', (event) => {
                event.preventDefault();
                alert("Link de recuperação enviado para seu e-mail!");
                closeModal();
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
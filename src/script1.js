document.addEventListener('DOMContentLoaded', () => {
    const modalRoot = document.getElementById('rootModal');
    const modalContentContainer = document.getElementById('modalContentContainer');
    const btnOpenLoginMain = document.getElementById('btnOpenLoginMain');
    const btnOpenTermosHeader = document.getElementById('btnOpenTermosHeader');
    const btnOpenSuporteHeader = document.getElementById('btnOpenSuporteHeader');

    const loginTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Login</h2>
        <form id="formLogin">
            <label>E-mail:</label>
            <input type="email" name="email" placeholder="Digite o email aqui." required />
            <div class="password-input-container">
                <label>Senha:</label>
                <input type="password" name="senha" placeholder="Digite a senha aqui." id="password" required>
            </div>
            <a href="#" id="btnEsqueceuSenha">Esqueceu a senha?</a>
            <button type="submit" class="botao-estilizado">Entrar</button>
            <button type="button" id="btnGoToCadastro">Criar conta</button>
        </form>
    `;

    const cadastroTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Crie sua conta</h2>
        <form id="formCadastro">
            <label>Nome Completo:</label>
            <input type="text" name="nome_usuario" required>
            <label>CPF:</label>
            <input type="text" name="cpf" maxlength="11" required>
            <label>Telefone:</label>
            <input type="text" name="telefone" maxlength="11" required>
            <label>E-mail:</label>
            <input type="email" name="email" required>
            <label>Senha:</label>
            <input type="password" name="senha" required>
            <label>Confirmar Senha:</label>
            <input type="password" name="confirmar_senha" required>
            <button type="submit">Finalizar Cadastro</button>
        </form>
    `;

    function renderView(viewName) {
        if (viewName === 'login') modalContentContainer.innerHTML = loginTemplate;
        else if (viewName === 'cadastro') modalContentContainer.innerHTML = cadastroTemplate;
        setupDynamicEvents();
    }

    function setupDynamicEvents() {
        const btnCloseModal = document.getElementById('btnCloseModal');
        if (btnCloseModal) btnCloseModal.onclick = () => modalRoot.classList.add('hidden');

        const btnGoToCadastro = document.getElementById('btnGoToCadastro');
        if (btnGoToCadastro) btnGoToCadastro.onclick = () => renderView('cadastro');

        const formLogin = document.getElementById('formLogin');
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(formLogin);
                const payload = Object.fromEntries(formData.entries());

                try {
                    const response = await fetch('http://localhost:3000/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (response.ok && data.nome) {
                        localStorage.setItem('nomeUsuario', data.nome);
                        
                        if (localStorage.getItem('nomeUsuario') !== null) {
                            window.location.href = 'index2.html';
                        }
                    } else {
                        alert(data.message || "Erro ao obter nome do usuário");
                    }
                } catch (err) {
                    alert("Erro ao conectar com o servidor.");
                }
            });
        }

        const formCadastro = document.getElementById('formCadastro');
        if (formCadastro) {
            formCadastro.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(formCadastro);
                const payload = Object.fromEntries(formData.entries());

                try {
                    const response = await fetch('http://localhost:3000/cadastro', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();
                    if (response.ok && data.nome) {
                        localStorage.setItem('nomeUsuario', data.nome);
                        alert("Cadastro realizado!");
                        window.location.href = 'index2.html';
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    alert("Erro ao salvar os dados.");
                }
            });
        }
    }

    btnOpenLoginMain.onclick = () => {
        renderView('login');
        modalRoot.classList.remove('hidden');
    };
});
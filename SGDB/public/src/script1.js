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
                <div style="position: relative;">
                    <input type="password" name="senha" placeholder="Digite a senha aqui." id="password" required>
                    <i id="togglePassword" class="bi bi-eye-fill"
                       style="position:absolute; right:10px; top:50%; transform:translateY(-50%); cursor:pointer;">
                    </i>
                </div>
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
            <input type="text" name="nome_usuario" placeholder="Coloque seu nome completo." required>

            <label>CPF:</label>
            <input type="text" name="cpf" id="inputCPF" placeholder="Coloque seu CPF aqui." maxlength="11" required>

            <label>Telefone:</label>
            <input type="text" name="telefone" id="inputTelefone" placeholder="Coloque o telefone aqui." maxlength="11" required>

            <label>E-mail:</label>
            <input type="email" name="email" placeholder="Digite o email aqui." required>

            <label>Senha:</label>
            <input type="password" name="senha" placeholder="Digite a senha aqui." required>

            <label>Confirmar Senha:</label>
            <input type="password" name="confirmar_senha" placeholder="Confirmar a senha." required>

            <button type="submit">Finalizar Cadastro</button>
        </form>
    `;

    const termosTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Termos de Uso e Políticas de Privacidade</h2>
        <div class="modal-terms-content">
            <div><strong>1. Uso do Site</strong>
                <p>Veloz Pass é um serviço de recarga de cartão de transporte online para Joinville e Região. Ao utilizar o site, você concorda em usar o serviço apenas para fins legítimos. Você não pode reproduzir, duplicar ou copiar dados pessoais neste site, o cadastro é único para um usuário.</p>
            </div>
            <div><strong>2. Privacidade e Proteção de Dados</strong>
                <p>Coletamos informações pessoais como nome, CPF, telefone e e-mail para processar suas solicitações de recarga. Para sua segurança, os dados bancários não são salvos no site, apenas o nome do banco que foi efetuado a recarga. Nunca compartilhe dados sigilosos com terceiros sem consentimento.</p>
            </div>
            <div><strong>3. Serviços de Recarga</strong>
                <p>O Veloz Pass oferece recargas rápidas e seguras de cartões de transporte. As transações são processadas e analisadas em tempo real, mas, em caso de atrasos ou outros problemas, nosso suporte estará disponível para ajudá-lo.</p>
            </div>
            <div><strong>4. Responsabilidade</strong>
                <p>O Veloz Pass se responsabiliza em entregar uma solução rápida para usuários de transporte, porém, não responsabilizamos por falhas de conexão de internet, erros do usuário, como inserção de dados solicitações de transações incorretas. Ao cadastrar, você aceita todos os riscos associados ao uso deste serviço.</p>
            </div>
        </div>
    `;

    const suporteTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Suporte</h2>
        <form id="formSuporte">
            <label>Selecione um problema:</label>
            <select required>
                <option value="">Selecione</option>
                <option>Não consigo acessar minha conta.</option>
                <option>Meus dados de cadastro foram considerados inválidos.</option>
                <option>Erro na validação das informações do cartão.</option>
                <option>Saldo creditado em cartão incorreto.</option>
            </select>

            <label>Email:</label>
            <input type="email" placeholder="Seu email" required/>

            <label>Número de Telefone:</label>
            <input type="text" placeholder="(xx) xxxxx-xxxx" maxlength="11" required/>

            <label>Detalhes do problema:</label>
            <textarea rows="4" maxlength="500"></textarea>

            <button type="submit" class="botao-estilizado">Enviar</button>
        </form>
    `;

    const esqueceuSenhaTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Recuperar Senha</h2>
        <form id="formEsqueceuSenha">
            <label>E-mail cadastrado:</label>
            <input type="email" required>

            <button type="submit">Enviar Link</button>
            <button type="button" id="btnBackToLogin">Voltar ao Login</button>
        </form>
    `;

    function renderView(viewName) {
        modalContentContainer.classList.remove('scrollable');

        if (viewName === 'login') {
            modalContentContainer.innerHTML = loginTemplate;
        } else if (viewName === 'cadastro') {
            modalContentContainer.innerHTML = cadastroTemplate;
        } else if (viewName === 'termos') {
            modalContentContainer.innerHTML = termosTemplate;
        } else if (viewName === 'suporte') {
            modalContentContainer.innerHTML = suporteTemplate;
            modalContentContainer.classList.add('scrollable');
        } else if (viewName === 'esqueceuSenha') {
            modalContentContainer.innerHTML = esqueceuSenhaTemplate;
        }

        setupDynamicEvents();
    }

    function setupDynamicEvents() {

        const btnCloseModal = document.getElementById('btnCloseModal');
        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => {
                modalRoot.classList.add('hidden');
            });
        }

        const btnGoToCadastro = document.getElementById('btnGoToCadastro');
        if (btnGoToCadastro) {
            btnGoToCadastro.addEventListener('click', () => renderView('cadastro'));
        }

        const btnBackToLogin = document.getElementById('btnBackToLogin');
        if (btnBackToLogin) {
            btnBackToLogin.addEventListener('click', () => renderView('login'));
        }

        const btnEsqueceuSenha = document.getElementById('btnEsqueceuSenha');
        if (btnEsqueceuSenha) {
            btnEsqueceuSenha.addEventListener('click', (e) => {
                e.preventDefault();
                renderView('esqueceuSenha');
            });
        }

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const input = document.getElementById('password');
                if (input.type === "password") {
                    input.type = "text";
                    togglePassword.classList.replace("bi-eye-fill", "bi-eye-slash-fill");
                } else {
                    input.type = "password";
                    togglePassword.classList.replace("bi-eye-slash-fill", "bi-eye-fill");
                }
            });
        }

        const formLogin = document.getElementById('formLogin');
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();

                const payload = Object.fromEntries(new FormData(formLogin).entries());

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (response.ok && data.nome) {
                        localStorage.setItem('nomeUsuario', data.nome);
                        window.location.href = "/dashboard";
                    } else {
                        alert(data.message || "Erro ao obter nome.");
                    }

                } catch {
                    alert("Erro ao conectar com o servidor.");
                }
            });
        }

        const formCadastro = document.getElementById('formCadastro');
        if (formCadastro) {
            formCadastro.addEventListener('submit', async (e) => {
                e.preventDefault();

                const cpfInput = document.getElementById('inputCPF');
                const cpfValue = cpfInput.value.trim();

                if (cpfValue[8] !== '9') {
                    alert("Disponível apenas para Santa Catarina.");
                    cpfInput.focus();
                    return;
                }

                const telefoneInput = document.getElementById('inputTelefone');
                const telefoneValue = telefoneInput.value.trim();

                if (!telefoneValue.startsWith('47')) {
                    alert("Disponível apenas para o DDD da região onde está situado Joinville.");
                    telefoneInput.focus();
                    return;
                }

                const payload = Object.fromEntries(new FormData(formCadastro).entries());

                try {
                    const response = await fetch('/cadastro', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (response.ok && data.nome) {
                        localStorage.setItem('nomeUsuario', data.nome);
                        window.location.href = "/dashboard";
                    } else {
                        alert(data.message);
                    }

                } catch {
                    alert("Erro ao salvar os dados.");
                }
            });
        }

        const formEsqueceuSenha = document.getElementById('formEsqueceuSenha');
        if (formEsqueceuSenha) {
            formEsqueceuSenha.addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Link de recuperação enviado.");
                modalRoot.classList.add('hidden');
            });
        }
    }

    if (btnOpenLoginMain) {
        btnOpenLoginMain.addEventListener('click', () => {
            renderView('login');
            modalRoot.classList.remove('hidden');
        });
    }

    if (btnOpenTermosHeader) {
        btnOpenTermosHeader.addEventListener('click', () => {
            renderView('termos');
            modalRoot.classList.remove('hidden');
        });
    }

    if (btnOpenSuporteHeader) {
        btnOpenSuporteHeader.addEventListener('click', () => {
            renderView('suporte');
            modalRoot.classList.remove('hidden');
        });
    }

});

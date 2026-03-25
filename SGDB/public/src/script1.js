document.addEventListener('DOMContentLoaded', () => {

    const modalRoot = document.getElementById('rootModal');
    const modalContentContainer = document.getElementById('modalContentContainer');
    const btnOpenLoginMain = document.getElementById('btnOpenLoginMain');
    const btnOpenTermosHeader = document.getElementById('btnOpenTermosHeader');
    const btnOpenSuporteHeader = document.getElementById('btnOpenSuporteHeader');
    const spanNome = document.getElementById('spanNomeUsuario');

    const termsOverlay = document.createElement('div');
    termsOverlay.id = 'termsOverlay';
    termsOverlay.className = 'modal-overlay hidden';
    termsOverlay.style.zIndex = "3000";

    const termsBox = document.createElement('div');
    termsBox.className = 'modal-content';

    termsOverlay.appendChild(termsBox);
    document.body.appendChild(termsOverlay);

    const loginTemplate = `
        <button class="close-btn">X</button>
        <h2>Login</h2>
        <form id="formLogin">
            <label>E-mail:</label>
            <input type="email" name="email" placeholder="Digite o email aqui." required />
            <a href="#" id="btnEsqueceuEmail">Esqueceu o email?</a>

            <div class="password-input-container">
                <label>Senha:</label>
                <div class="password-wrapper">
                    <input type="password" name="senha" placeholder="Digite a senha aqui." id="password" required>
                    <i id="togglePassword" class="bi bi-eye-fill toggle-password-icon"></i>
                </div>
            </div>
            <a href="#" id="btnEsqueceuSenha">Esqueceu a senha?</a>

            <div class="checkbox">
               <input type="checkbox" id="checkbox" name="checar" required />
               <label for="checkbox">
                  Ao conectar-se com o site, você estará concordando com nossos termos de <span class="destacarTermos abrir-termos">Políticas de Privacidade</span>.
               </label>
            </div>

            <button type="submit" class="botao-estilizado">Entrar</button>
            <button type="button" id="btnGoToCadastro">Criar conta</button>
        </form>
    `;

    const cadastroTemplate = `
        <button class="close-btn">X</button>
        <h2>Crie sua conta</h2>
        <form id="formCadastro">
            <label>Nome Completo:</label>
            <input type="text" name="nome_usuario" placeholder="Coloque seu nome completo." required>

            <label>CPF:</label>
            <input type="text" name="cpf" id="inputCPF" placeholder="000.000.000-00." maxlength="11" required>

            <label>Telefone:</label>
            <input type="text" name="telefone" id="inputTelefone" placeholder="(xx) xxxxx-xxxx." maxlength="11" required>

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
        <button class="close-btn">X</button>
        <h2>Termos de Privacidade</h2>
        <div class="modal-terms-content">
            <div><strong>1. Coleta de Informações: </strong>
                <p>Para a utilização do serviço, coletamos algumas informações pessoais como nome, CPF, telefone e e-mail. Esses dados são necessários para identificar o usuário e permitir o processamento correto das recargas realizadas na plataforma.</p>
            </div>
            <div><strong>2. Proteção de Dados: </strong>
                <p>O Veloz Pass adota medidas de segurança para proteger os dados dos usuários. Informações bancárias completas não são armazenadas no sistema, sendo registrada apenas a bandeira do cartão utilizado na transação. Recomendamos que os usuários nunca compartilhem dados sensíveis com terceiros.</p>
            </div>
            <div><strong>3. Finalidade das Informações: </strong>
                <p>As informações coletadas são utilizadas exclusivamente para permitir o funcionamento do serviço de recarga, identificar a conta do usuário e garantir o suporte quando necessário.</p>
            </div>
            <div><strong>4. Direitos do Usuário: </strong>
                <p>O usuário pode solicitar a atualização, correção ou exclusão de seus dados pessoais a qualquer momento por meio do suporte da plataforma.</p>
            </div>
        </div>
    `;

    const suporteTemplate = `
        <button class="close-btn">X</button>
        <h2>Suporte</h2>
        <form id="formSuporte">
            <label>Selecione um problema:</label>
            <select required>
                <option value="" disabled selected>Selecione</option>
                <option>Não consigo acessar minha conta.</option>
                <option>Meus dados de cadastro foram considerados inválidos.</option>
                <option>Erro na validação das informações pela Carteira Digital.</option>
                <option>Recarga realizada em um cartão incorreto.</option>
                <option>Meu cartão foi registrado por outro usuário sem meu consentimento.</option>
            </select>

            <label>Email:</label>
            <input type="email" placeholder="Seu email cadastro aqui." required/>

            <label>Número de Telefone:</label>
            <input type="text" placeholder="(xx) xxxxx-xxxx" maxlength="11" required/>

            <label>Detalhes do problema:</label>
            <textarea rows="4" maxlength="500"></textarea>

            <button type="submit" class="botao-estilizado">Enviar</button>
        </form>
    `;

    const esqueceuSenhaTemplate = `
        <button class="close-btn">X</button>
        <h2>Recuperar Senha</h2>
        <form id="formEsqueceuSenha">
            <label>Informe o E-mail cadastrado:</label>
            <input type="email" required>
            <button type="submit">Enviar Link</button>
            <button type="button" id="btnBackToLogin">Voltar ao Login</button>
        </form>
    `;

    const esqueceuEmailTemplate = `
        <button class="close-btn">X</button>
        <h2>Recuperar Conta</h2>
        <form id="formEsqueceuEmail">
            <label>Informe o CPF cadastrado:</label>
            <input type="text" id="inputCPF_Recuperar" maxlength="11" required>
            <button type="submit">Enviar SMS</button>
            <button type="button" id="btnBackToLogin">Voltar ao Login</button>
        </form>
    `;

    function renderView(viewName) {
        modalContentContainer.classList.remove('scrollable');

        if (viewName === 'login') modalContentContainer.innerHTML = loginTemplate;
        else if (viewName === 'cadastro') modalContentContainer.innerHTML = cadastroTemplate;
        else if (viewName === 'termos') modalContentContainer.innerHTML = termosTemplate;
        else if (viewName === 'suporte') {
            modalContentContainer.innerHTML = suporteTemplate;
            modalContentContainer.classList.add('scrollable');
        }
        else if (viewName === 'esqueceuSenha') modalContentContainer.innerHTML = esqueceuSenhaTemplate;
        else if (viewName === 'esqueceuEmail') modalContentContainer.innerHTML = esqueceuEmailTemplate;

        setupDynamicEvents();
    }

    function openTermsOverlay() {
        termsBox.innerHTML = termosTemplate;
        termsOverlay.classList.remove('hidden');
        setupDynamicEvents();
    }

    function atualizarNome() {
        if (typeof auth !== 'undefined') {
            const userData = auth.getUserData();
            if (userData && spanNome) {
                const partes = userData.nome.trim().split(/\s+/);
                spanNome.textContent = partes[0];
            }
        }
    }

    async function obterDadosCarteira(idUsuario) {
        try {
            if (typeof auth !== 'undefined') {
                const response = await auth.request(`/api/payments/wallet-data/${idUsuario}`);
                if (!response || !response.ok) return null;
                return await response.json();
            }
        } catch (error) {
            console.error("Erro ao obter dados da carteira:", error);
            return null;
        }
    }

    function setupDynamicEvents() {
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                if (!termsOverlay.classList.contains('hidden') && btn.closest('#termsOverlay')) {
                    termsOverlay.classList.add('hidden');
                } else {
                    modalRoot.classList.add('hidden');
                }
            };
        });

        const btnGoToCadastro = document.getElementById('btnGoToCadastro');
        if (btnGoToCadastro) btnGoToCadastro.onclick = () => renderView('cadastro');

        const btnBackToLogin = document.getElementById('btnBackToLogin');
        if (btnBackToLogin) btnBackToLogin.onclick = () => renderView('login');

        const btnEsqueceuSenha = document.getElementById('btnEsqueceuSenha');
        if (btnEsqueceuSenha) {
            btnEsqueceuSenha.onclick = (e) => { e.preventDefault(); renderView('esqueceuSenha'); };
        }

        const btnEsqueceuEmail = document.getElementById('btnEsqueceuEmail');
        if (btnEsqueceuEmail) {
            btnEsqueceuEmail.onclick = (e) => { e.preventDefault(); renderView('esqueceuEmail'); };
        }

        const termosLinks = document.querySelectorAll('.abrir-termos');
        termosLinks.forEach(link => {
            link.onclick = (e) => { e.preventDefault(); openTermsOverlay(); };
        });

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.onclick = () => {
                const input = document.getElementById('password');
                if (input.type === "password") {
                    input.type = "text";
                    togglePassword.classList.replace("bi-eye-fill", "bi-eye-slash-fill");
                } else {
                    input.type = "password";
                    togglePassword.classList.replace("bi-eye-slash-fill", "bi-eye-fill");
                }
            };
        }

        const formLogin = document.getElementById('formLogin');
        if (formLogin) {
            formLogin.onsubmit = async (e) => {
                e.preventDefault();
                const email = formLogin.querySelector('[name="email"]').value;
                const senha = formLogin.querySelector('[name="senha"]').value;

                try {
                    const response = await fetch('/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, senha })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        alert(data.message || 'Erro ao fazer login');
                        return;
                    }

                    auth.setToken(data.token, { id: data.id, nome: data.nome });
                    
                    window.location.href = '/dashboard';

                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert('Erro na requisição. Verifique sua conexão.');
                }
            };
        }

        const formCadastro = document.getElementById('formCadastro');
        if (formCadastro) {
            formCadastro.onsubmit = async (e) => {
                e.preventDefault();

                const cpfInput = document.getElementById('inputCPF');
                const cpfRaw = cpfInput.value.trim();
                const cpfDigits = cpfRaw.replace(/\D/g, '');

                if (cpfDigits.length !== 11) {
                    alert("CPF deve conter 11 dígitos numéricos.");
                    cpfInput.focus();
                    return;
                }

                if (cpfDigits[8] !== '9') {
                    alert("Disponível apenas para Santa Catarina.");
                    cpfInput.focus();
                    return;
                }

                cpfInput.value = cpfDigits;

                const telefoneInput = document.getElementById('inputTelefone');
                const telefoneRaw = telefoneInput.value.trim();
                const telefoneDigits = telefoneRaw.replace(/\D/g, '');

                if (telefoneDigits.length !== 11) {
                    alert("Telefone deve conter 11 dígitos (DDD + 9 dígitos do celular). Ex: 47999999999");
                    telefoneInput.focus();
                    return;
                }

                if (!telefoneDigits.startsWith('47')) {
                    alert("Disponível apenas para o DDD da região onde está situado Joinville.");
                    telefoneInput.focus();
                    return;
                }

                if (telefoneDigits[2] !== '9') {
                    alert("O telefone deve começar com 9 após o DDD (ex: 479...).");
                    telefoneInput.focus();
                    return;
                }

                telefoneInput.value = telefoneDigits;

                const payload = Object.fromEntries(new FormData(formCadastro).entries());

                try {
                    const response = await fetch('/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (response.ok && data.id) {
                        auth.setToken(data.token || '', { id: data.id, nome: data.nome });
                        
                        setTimeout(() => { window.location.href = "/dashboard"; }, 100);
                    } else {
                        alert(data.message || "Erro ao salvar os dados.");
                    }
                } catch (error) {
                    console.error("Erro no cadastro:", error);
                    alert("Erro ao salvar os dados.");
                }
            };
        }

        const formEsqueceuSenha = document.getElementById('formEsqueceuSenha');
        if (formEsqueceuSenha) {
            formEsqueceuSenha.onsubmit = (e) => {
                e.preventDefault();
                alert("Link de recuperação enviado.");
                modalRoot.classList.add('hidden');
            };
        }

        const formEsqueceuEmail = document.getElementById('formEsqueceuEmail');
        if (formEsqueceuEmail) {
            formEsqueceuEmail.onsubmit = (e) => {
                e.preventDefault();
                alert("Mensagem de SMS enviada.");
                modalRoot.classList.add('hidden');
            };
        }
    }

    if (btnOpenLoginMain) {
        btnOpenLoginMain.onclick = () => {
            renderView('login');
            modalRoot.classList.remove('hidden');
        };
    }

    if (btnOpenTermosHeader) {
        btnOpenTermosHeader.onclick = () => {
            renderView('termos');
            modalRoot.classList.remove('hidden');
        };
    }

    if (btnOpenSuporteHeader) {
        btnOpenSuporteHeader.onclick = () => {
            renderView('suporte');
            modalRoot.classList.remove('hidden');
        };
    }

    atualizarNome();
});

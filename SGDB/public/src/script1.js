document.addEventListener('DOMContentLoaded', () => {

    const modalRoot = document.getElementById('rootModal');
    const modalContentContainer = document.getElementById('modalContentContainer');
    const btnOpenLoginMain = document.getElementById('btnOpenLoginMain');
    const btnOpenTermosHeader = document.getElementById('btnOpenTermosHeader');
    const btnOpenSuporteHeader = document.getElementById('btnOpenSuporteHeader');
    const spanNome = document.getElementById('nome-logado');
    const spanCodUnique = document.getElementById('codUnique-user');

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
            <input type="email" name="email" placeholder="Digite o email aqui." autocomplete="off" required />
            <a href="#" id="btnEsqueceuEmail">Esqueceu o email?</a>
            <div class="password-input-container">
                <label>Senha:</label>
                <div class="password-wrapper">
                    <input type="password" name="senha" placeholder="Digite a senha aqui." id="password" autocomplete="off" required>
                    <i id="togglePassword" class="toggle-password-icon"></i>
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
            <input type="text" name="nome_usuario" placeholder="Coloque seu nome completo." maxlength="100" autocomplete="off" required>
            <label>CPF:</label>
            <input type="text" name="cpf" id="inputCPF" placeholder="000.000.000-00." maxlength="14" autocomplete="off" required>
            <label>Telefone:</label>
            <input type="text" name="telefone" id="inputTelefone" placeholder="(xx) xxxxx-xxxx." maxlength="15" autocomplete="off" required>
            <label>E-mail:</label>
            <input type="email" name="email" placeholder="Digite o email aqui." maxlength="100" autocomplete="off" required>
            <label>Senha:</label>
            <input type="password" name="senha" placeholder="Digite a senha aqui." maxlength="50" autocomplete="off" required>
            <label>Confirmar Senha:</label>
            <input type="password" name="confirmar_senha" placeholder="Confirmar a senha." maxlength="50" autocomplete="off" required>
            <div class="checkbox">
             <input type="checkbox" id="checkboxCadastro" name="aceite_termos" required />
              <label for="checkboxCadastro">
                Eu li e concordo com as <span class="destacarTermos abrir-termos">Políticas de Privacidade</span> do Veloz Pass.
              </label>
            </div>
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
            <label>Selecione o problema que enfrenta:</label>
            <select required>
                <option value="" disabled selected>Selecione</option>
                <option>Não estou conseguindo acessar minha conta do Veloz Pass.</option>
                <option>Minhas credenciais foram consideradas como inválidas.</option>
                <option>O saldo não está sendo creditado na minha Carteira Digital.</option>
                <option>Meu cartão foi registrado por outro usuário sem meu consentimento.</option>
                <option>PLACEHOLDER.</option>
            </select>
            <label>Email:</label>
            <input type="email" placeholder="Seu email cadastro aqui." required/>
            <label>Número de Telefone:</label>
            <input type="text" id="inputTelefoneSuporte" placeholder="(xx) xxxxx-xxxx" maxlength="15" required/>
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

    const esqueceuEmailTemplate = `
        <button id="btnCloseModal" class="close-btn">X</button>
        <h2>Recuperar Conta</h2>
        <form id="formEsqueceuEmail">
            <label>Informe o CPF cadastrado:</label>
            <input type="text" id="inputCPF" maxlength="11" required>
            <button type="submit">Enviar SMS</button>
            <button type="button" id="btnBackToLogin">Voltar ao Login</button>
        </form>
    `;

    const dddNaturalidade = {
        '47': { id: 'A', nome: 'Joinville e Região' },
        '48': { id: 'B', nome: 'Florianópolis e Região' },
        '49': { id: 'C', nome: 'Chapecó e Região' }
    };

    function gerarCodIdentificador(telefoneLimpo) {
        const ddd = telefoneLimpo.slice(0, 2);
        const naturalidade = dddNaturalidade[ddd];
        if (!naturalidade) return null;
        const randomNumber = Math.floor(100 + Math.random() * 900);
        return `${randomNumber}${naturalidade.id}`;
    }

    function preencherDashboard(userData) {
        if (!userData) return;
        if (spanNome) spanNome.textContent = userData.nome.split(' ')[0];
        if (spanCodUnique) spanCodUnique.textContent = userData.cod_identificador || '---';
    }


    function renderView(viewName) {
        modalContentContainer.classList.remove('scrollable');
        if (viewName === 'login') modalContentContainer.innerHTML = loginTemplate;
        else if (viewName === 'cadastro') modalContentContainer.innerHTML = cadastroTemplate;
        else if (viewName === 'termos') modalContentContainer.innerHTML = termosTemplate;
        else if (viewName === 'suporte') {
            modalContentContainer.innerHTML = suporteTemplate;
            modalContentContainer.classList.add('scrollable');
        } else if (viewName === 'esqueceuSenha') {
            modalContentContainer.innerHTML = esqueceuSenhaTemplate;
        } else if (viewName === 'esqueceuEmail') {
            modalContentContainer.innerHTML = esqueceuEmailTemplate;
        }
        setupDynamicEvents();
    }

    function openTermsOverlay() {
        termsBox.innerHTML = termosTemplate;
        termsOverlay.classList.remove('hidden');
        setupDynamicEvents();
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

        const btnEsqueceuSenha = document.getElementById('btnEsqueceuSenha');
        if (btnEsqueceuSenha) {
            btnEsqueceuSenha.addEventListener('click', (e) => {
                e.preventDefault();
                renderView('esqueceuSenha');
            });
        }

        const btnEsqueceuEmail = document.getElementById('btnEsqueceuEmail');
        if (btnEsqueceuEmail) {
            btnEsqueceuEmail.addEventListener('click', (e) => {
                e.preventDefault();
                renderView('esqueceuEmail');
            });
        }

        const btnBackToLogin = document.getElementById('btnBackToLogin');
        if (btnBackToLogin) {
            btnBackToLogin.onclick = (e) => {
                e.preventDefault();
                renderView('login');
            };
        }

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.classList.add('bi', 'bi-eye-slash-fill');

            togglePassword.onclick = function () {
                const passwordInput = document.getElementById('password');
                if (!passwordInput) return;

                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';

                if (isPassword) {
                    this.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
                } else {
                    this.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
                }
            };
        }

        const inputCPF = document.getElementById('inputCPF');
        if (inputCPF) {
            inputCPF.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                e.target.value = v;
            });
        }

        const inputTelefone = document.getElementById('inputTelefone') || document.getElementById('inputTelefoneSuporte');
        if (inputTelefone) {
            inputTelefone.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
                v = v.replace(/(\d{5})(\d)/, "$1-$2");
                e.target.value = v;
            });
        }

        const btnGoToCadastro = document.getElementById('btnGoToCadastro');
        if (btnGoToCadastro) btnGoToCadastro.onclick = () => renderView('cadastro');

        const termosLinks = document.querySelectorAll('.abrir-termos');
        termosLinks.forEach(link => {
            link.onclick = (e) => { e.preventDefault(); openTermsOverlay(); };
        });

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
                    if (!response.ok) { alert(data.message || 'Erro ao fazer login'); return; }
                    auth.setToken(data.token, {
                        id: data.id,
                        nome: data.nome,
                        cod_identificador:
                            data.cod_identificador
                    });
                    preencherDashboard({
                        nome: data.nome,
                        cod_identificador: data.cod_identificador
                    });

                    window.location.href = '/dashboard';
                } catch (error) {
                    alert('Erro na requisição.');
                }
            };
        }

        const formCadastro = document.getElementById('formCadastro');
        if (formCadastro) {
            formCadastro.onsubmit = async (e) => {
                e.preventDefault();
                const cpfField = document.getElementById('inputCPF');
                const telField = document.getElementById('inputTelefone');
                const cpfLimpo = cpfField.value.replace(/\D/g, '');
                const telefoneLimpo = telField.value.replace(/\D/g, '');
                if (cpfLimpo.length !== 11) { alert("CPF deve conter 11 dígitos."); return; }
                if (telefoneLimpo.length !== 11) { alert("Telefone inválido."); return; }
                const payload = Object.fromEntries(new FormData(formCadastro).entries());
                payload.cpf = cpfLimpo;
                payload.telefone = telefoneLimpo;
                const codIdentificador = gerarCodIdentificador(telefoneLimpo);
                payload.cod_identificador = codIdentificador;
                payload.id_naturalidade = dddNaturalidade[telefoneLimpo.slice(0, 2)]?.id || null;
                try {
                    const response = await fetch('/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        auth.setToken(data.token, {
                            id: data.id,
                            nome: data.nome,
                            cod_identificador: codIdentificador
                        });
                        preencherDashboard({
                            nome: data.nome,
                            cod_identificador:
                                codIdentificador
                        });
                        window.location.href = "/dashboard";
                    } else {
                        alert(data.message || "Erro ao salvar os dados.");
                    }
                } catch (error) {
                    alert("Erro no servidor.");
                }
            };
        }
    }

    if (btnOpenLoginMain) btnOpenLoginMain.onclick = () => {
        renderView('login'); modalRoot.classList.remove('hidden');
    };
    if (btnOpenTermosHeader) btnOpenTermosHeader.onclick = () => {
        renderView('termos'); modalRoot.classList.remove('hidden');
    };
    if (btnOpenSuporteHeader) btnOpenSuporteHeader.onclick = () => {
        renderView('suporte'); modalRoot.classList.remove('hidden');
    };

    if (typeof auth !== 'undefined') {
        const userData = auth.getUserData();
        if (userData && spanNome) spanNome.textContent = userData.nome.split(' ')[0];
    }

});

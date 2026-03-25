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
            <input type="email" name="email" placeholder="Digite o email aqui." maxlength="100" required />
            <a href="#" id="btnEsqueceuEmail">Esqueceu o email?</a>
            <div class="password-input-container">
                <label>Senha:</label>
                <div class="password-wrapper">
                    <input type="password" name="senha" placeholder="Digite a senha aqui." id="password" maxlength="50" required>
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
            <input type="text" name="nome_usuario" placeholder="Coloque seu nome completo." maxlength="100" required>
            <label>CPF:</label>
            <input type="text" name="cpf" id="inputCPF" placeholder="000.000.000-00" maxlength="14" required>
            <label>Telefone:</label>
            <input type="text" name="telefone" id="inputTelefone" placeholder="(xx) xxxxx-xxxx" maxlength="15" required>
            <label>E-mail:</label>
            <input type="email" name="email" placeholder="Digite o email aqui." maxlength="100" required>
            <label>Senha:</label>
            <input type="password" name="senha" placeholder="Digite a senha aqui." maxlength="50" required>
            <label>Confirmar Senha:</label>
            <input type="password" name="confirmar_senha" placeholder="Confirmar a senha." maxlength="50" required>
            <div class="checkbox">
             <input type="checkbox" id="checkboxCadastro" name="aceite_termos" required />
              <label for="checkboxCadastro">
                Eu li e concordo com as <span class="destacarTermos abrir-termos">Políticas de Privacidade</span>.
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
                <p>Coletamos informações pessoais como nome, CPF, telefone e e-mail para identificação e processamento das recargas.</p>
            </div>
            <div><strong>2. Proteção de Dados: </strong>
                <p>Medidas de segurança são aplicadas. Dados bancários completos não são armazenados.</p>
            </div>
            <div><strong>3. Finalidade das Informações: </strong>
                <p>Permitir funcionamento do serviço, identificar a conta e dar suporte.</p>
            </div>
            <div><strong>4. Direitos do Usuário: </strong>
                <p>O usuário pode solicitar atualização, correção ou exclusão dos dados.</p>
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
            <input type="email" placeholder="Seu email cadastro aqui." maxlength="100" required/>
            <label>Número de Telefone:</label>
            <input type="text" id="inputTelefoneSuporte" placeholder="(xx) xxxxx-xxxx" maxlength="15" required/>
            <label>Detalhes do problema:</label>
            <textarea rows="4" maxlength="500"></textarea>
            <button type="submit" class="botao-estilizado">Enviar</button>
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
        setupDynamicEvents();
    }

    function openTermsOverlay() {
        termsBox.innerHTML = termosTemplate;
        termsOverlay.classList.remove('hidden');
        setupDynamicEvents();
    }

    function setupDynamicEvents() {
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.onclick = () => {
                if (!termsOverlay.classList.contains('hidden') && btn.closest('#termsOverlay')) {
                    termsOverlay.classList.add('hidden');
                } else {
                    modalRoot.classList.add('hidden');
                }
            };
        });

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                if (!passwordInput) return;
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('bi-eye-fill');
                this.classList.toggle('bi-eye-slash');
            });
        }

        const inputCPF = document.getElementById('inputCPF');
        if (inputCPF) {
            inputCPF.addEventListener('input', e => {
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
            inputTelefone.addEventListener('input', e => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
                v = v.replace(/(\d{5})(\d)/, "$1-$2");
                e.target.value = v;
            });
        }
        
        const btnGoToCadastro = document.getElementById('btnGoToCadastro');
        if (btnGoToCadastro) btnGoToCadastro.onclick = () => renderView('cadastro');

        document.querySelectorAll('.abrir-termos').forEach(link => {
            link.onclick = e => { e.preventDefault(); openTermsOverlay(); };
        });

        const formLogin = document.getElementById('formLogin');
        if (formLogin) {
            formLogin.onsubmit = async e => {
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
                    auth.setToken(data.token, { id: data.id, nome: data.nome });
                    window.location.href = '/dashboard';
                } catch (error) { alert('Erro na requisição.'); }
            };
        }

        const formCadastro = document.getElementById('formCadastro');
        if (formCadastro) {
            formCadastro.onsubmit = async e => {
                e.preventDefault();
                
                const cpfField = document.getElementById('inputCPF');
                const telField = document.getElementById('inputTelefone');
                
                const cpfLimpo = cpfField.value.replace(/\D/g, '');
                const telefoneLimpo = telField.value.replace(/\D/g, '');

                if (cpfLimpo.length !== 11) { alert("CPF deve conter 11 dígitos."); return; }
                if (telefoneLimpo.length !== 11) { alert("Telefone inválido."); return; }

                const senha = formCadastro.querySelector('[name="senha"]').value;
                const confirmarSenha = formCadastro.querySelector('[name="confirmar_senha"]').value;
                if (senha !== confirmarSenha) { alert("Senhas não conferem."); return; }

                const payload = Object.fromEntries(new FormData(formCadastro).entries());
                payload.cpf = cpfLimpo;
                payload.telefone = telefoneLimpo;

                try {
                    const response = await fetch('/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        auth.setToken(data.token, { id: data.id, nome: data.nome });
                        window.location.href = "/dashboard";
                    } else {
                        alert(data.message || "Erro ao salvar os dados.");
                    }
                } catch (error) { alert("Erro no servidor."); }
            };
        }
    }

    if (btnOpenLoginMain) btnOpenLoginMain.onclick = () => { renderView('login'); modalRoot.classList.remove('hidden'); };
    if (btnOpenTermosHeader) btnOpenTermosHeader.onclick = () => { renderView('termos'); modalRoot.classList.remove('hidden'); };
    if (btnOpenSuporteHeader) btnOpenSuporteHeader.onclick = () => { renderView('suporte'); modalRoot.classList.remove('hidden'); };

    if (typeof auth !== 'undefined') {
        const userData = auth.getUserData();
        if (userData && spanNome) spanNome.textContent = userData.nome.split(' ')[0];
    }

});

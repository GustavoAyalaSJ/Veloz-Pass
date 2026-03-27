document.addEventListener('DOMContentLoaded', () => {

    const spanNome = document.getElementById('nome-logado');
    const spanCodUnique = document.getElementById('codUnique-user');
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const saldoDashboard = document.getElementById("saldo-dashboard");
    const btnOpenPoliticasHeader = document.getElementById('btnOpenPoliticasHeader');

    function atualizarNomeECod() {
        const userData = auth.getUserData();

        if (userData) {
            if (spanNome && userData.nome) {
                const partes = userData.nome.trim().split(/\s+/);
                const primeiroNome = partes[0];
                const ultimoNome = partes.length > 1 ? partes[partes.length - 1] : "";
                spanNome.textContent = `${primeiroNome} ${ultimoNome}`.trim();
            }

            if (spanCodUnique) {
                spanCodUnique.textContent = userData.cod_identificador || '---';
            }
        } else {
            console.error("UserData não encontrado no sessionStorage");
        }
    }

    async function carregarSaldoDashboard() {
        const userData = auth.getUserData();
        const idUsuario = userData?.id;
        if (!idUsuario) return;

        const dadosCarteira = await obterDadosCarteira(idUsuario);
        if (!dadosCarteira) return;

        const saldo = parseFloat(dadosCarteira.saldo || dadosCarteira.saldo_atual) || 0;
        if (saldoDashboard) {
            saldoDashboard.textContent = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
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

    const politicasOverlay = document.createElement('div');
    politicasOverlay.className = "politicas-overlay hidden";
    const politicasBox = document.createElement('div');
    politicasBox.className = "politicas-box";
    politicasBox.innerHTML = `
        <button id="btnClosePoliticas" class="close-btn">X</button>
        <h2>Termos de Política</h2>
        <div class="politicas-content">
            <div>
                <strong>1. Sobre o Serviço:</strong>
                <p>O Veloz Pass é um sistema online desenvolvido para facilitar a realização de recarga sem cartões de transporte utilizados na cidade de Joinville. O serviço tem como objetivo oferecer praticidade e rapidez aos usuários, sem cobrança de taxas adicionais pelo uso do site. </p>
            </div>

            <div>
                <strong>2. Uso da Conta:</strong>
                <p>Cada usuário deve possuir apenas uma conta vinculada aos seus dados pessoais. Não é permitido criar contas duplicadas utilizando o mesmo CPF ou telefone. Em caso de perda de acesso à conta, o usuário deve entrar em contato com o suporte para realizar o processo de recuperação. </p>
            </div>

            <div>
                <strong>3. Sistema de Recarga:</strong>
                <p>O sistema de recarga funciona de forma direta e não armazena dados bancários dos usuários. As informações utilizadas para pagamento são processadas apenas no momento da transação. O Veloz Pass não incentiva o compartilhamento de dados pessoais ou financeiros entre usuários ou terceiros.
                </p>
            </div>

            <div>
                <strong>4. Responsabilidade:</strong>
                <p>O Veloz Pass se compromete a fornecer um sistema funcional e acessível. Entretanto, não nos responsabilizamos por falhas decorrentes de problemas de conexão com a internet, erros de preenchimento de dados por parte do usuário ou solicitações de transações realizadas incorretamente. Ao utilizar o serviço, o usuário reconhece e aceita essas condições.
                </p>
            </div>

        </div>
    `;
    politicasOverlay.appendChild(politicasBox);
    document.body.appendChild(politicasOverlay);

    if (btnOpenPoliticasHeader) {
        btnOpenPoliticasHeader.addEventListener('click', () => {
            politicasOverlay.classList.remove('hidden');
        });
    }

    politicasOverlay.addEventListener('click', (event) => {
        if (event.target.id === "btnClosePoliticas" || event.target === politicasOverlay) {
            politicasOverlay.classList.add('hidden');
        }
    });

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.style.display = "flex";
        });
    }

    const btnSimLogout = document.getElementById('btn-sim-logout');
    const btnNaoLogout = document.getElementById('btn-nao-logout');
    if (btnSimLogout) btnSimLogout.addEventListener('click', () => auth.clear());
    if (btnNaoLogout) btnNaoLogout.addEventListener('click', () => logoutModal.style.display = "none");

    atualizarNomeECod();

    setTimeout(atualizarNomeECod, 100);

    carregarSaldoDashboard();
});
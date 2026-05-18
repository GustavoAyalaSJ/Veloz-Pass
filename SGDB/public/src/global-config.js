(() => {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    let logoutModal = null;

    const changeTheme = document.getElementById('change-button');
    if (changeTheme) {
        const atualizarIconeTema = () => {
            const isDark = document.documentElement.classList.contains('dark-mode');
            changeTheme.innerHTML = isDark
                ? '<i class="bi bi-moon-fill"></i>'
                : '<i class="bi bi-brightness-high-fill"></i>';
        };

        atualizarIconeTema();

        changeTheme.onclick = () => {
            document.documentElement.classList.toggle('dark-mode');
            const modoAtivo = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', modoAtivo);
            atualizarIconeTema();
        };
    }

    function criarModalLogout() {
        if (logoutModal) return;

        logoutModal = document.createElement('div');
        logoutModal.id = 'logoutModal';
        logoutModal.className = 'logout-overlay';
        logoutModal.innerHTML = `
            <div class="logout-box">
                <h3>Deseja sair da sua conta?</h3>
                <div class="logout-buttons">
                    <button id="btn-sim-logout" class="btn-sim">Sim</button>
                    <button id="btn-nao-logout" class="btn-nao">Não</button>
                </div>
            </div>
        `;
        document.body.appendChild(logoutModal);

        document.getElementById('btn-sim-logout').onclick = () => {
            if (typeof auth !== 'undefined') {
                auth.clear();
            } else {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/introduction';
            }
        };

        const closeModal = () => logoutModal.classList.remove('active');
        document.getElementById('btn-nao-logout').onclick = closeModal;
        logoutModal.onclick = (e) => { if (e.target === logoutModal) closeModal(); };
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.exit-link')) {
            e.preventDefault();
            criarModalLogout();
            logoutModal.classList.add('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            logoutModal?.classList.remove('active');
            document.getElementById('notification-dropdown')?.classList.remove('show');
            document.getElementById('notification-button')?.classList.remove('open');
        }
    });

    const botaoNotificacao = document.getElementById('notification-button');
    const dropdownNotificacao = document.getElementById('notification-dropdown');

    if (botaoNotificacao && dropdownNotificacao) {
        botaoNotificacao.addEventListener('click', (e) => {
            e.stopPropagation();
            const abrir = !dropdownNotificacao.classList.contains('show');

            dropdownNotificacao.classList.toggle('show', abrir);
            botaoNotificacao.classList.toggle('open', abrir);

            if (abrir) {
                const fecharDropdownFora = (event) => {
                    if (!event.target.closest('#notification-dropdown') && !event.target.closest('#notification-button')) {
                        dropdownNotificacao.classList.remove('show');
                        botaoNotificacao.classList.remove('open');
                        document.removeEventListener('click', fecharDropdownFora);
                    }
                };
                setTimeout(() => document.addEventListener('click', fecharDropdownFora), 0);
            }
        });
    }
});

(() => {
    let modalProcesso = null;
    let temporizadorFechamentoAuto = null;

    function createProcessModal() {
        if (modalProcesso) return;

        modalProcesso = document.createElement('div');
        modalProcesso.id = 'processModal';
        modalProcesso.className = 'process-overlay';
        modalProcesso.innerHTML = `
            <div class="process-box">
                <div class="process-header">
                    <h3 id="process-modal-title">Resultado</h3>
                </div>
                <div class="process-body" id="process-modal-body"></div>
                <div class="process-footer">
                    <p id="process-modal-message">Mensagem</p>
                    <button id="process-modal-ok" class="btn-ok">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalProcesso);

        modalProcesso.onclick = (e) => {
            if (e.target === modalProcesso) closeModalProcesso();
        };
    }

    function closeModalProcesso() {
        if (temporizadorFechamentoAuto) {
            clearTimeout(temporizadorFechamentoAuto);
            temporizadorFechamentoAuto = null;
        }
        modalProcesso?.classList.remove('active');
    }

    window.showProcessModal = function (status, tipoPagina, acaoAoConfirmar) {
        createProcessModal();
        closeModalProcesso();

        const elementoTitulo = document.getElementById('process-modal-title');
        const elementoCorpo = document.getElementById('process-modal-body');
        const elementoMensagem = document.getElementById('process-modal-message');
        const botaoOk = document.getElementById('process-modal-ok');

        const mapaStatus = {
            'success': 'success', 'concluido': 'success', 'concluído': 'success',
            'under-review': 'under-review', 'em_revisao': 'under-review', 'em_revisão': 'under-review',
            'rejected': 'rejected', 'recusada': 'rejected'
        };

        const statusNormalizado = mapaStatus[(status || '').toLowerCase().trim()] || 'rejected';

        const titulos = {
            'success': 'Resultado: Sucesso',
            'under-review': 'Resultado: Em Revisão',
            'rejected': 'Resultado: Recusado'
        };

        const icones = {
            'success': '<i class="bi bi-check-circle icon-success"></i>',
            'under-review': '<i class="bi bi-question-circle icon-review"></i>',
            'rejected': '<i class="bi bi-x-circle icon-rejected"></i>'
        };

        const mensagens = {
            'success': {
                'carteira': 'Crédito inserido na carteira com sucesso. Aguarde alguns segundos para atualizar o valor da sua carteira.',
                'recarga': 'Recarga realizada com sucesso. Aguarde algumas horas para o saldo ser creditado em seu cartão de transporte.'
            },
            'under-review': 'Processo em revisão! Aguarde uma resposta do nosso sistema, pode levar alguns minutos.',
            'rejected': 'Processo recusado pelo provedor ou falha no sistema. Em caso de dúvidas, contate o suporte.'
        };

        elementoTitulo.textContent = titulos[statusNormalizado];
        elementoCorpo.innerHTML = icones[statusNormalizado];
        elementoMensagem.textContent = statusNormalizado === 'success' && tipoPagina
            ? (mensagens.success[tipoPagina] || mensagens.success['carteira'])
            : mensagens[statusNormalizado];

        botaoOk.onclick = () => {
            closeModalProcesso();
            if (typeof acaoAoConfirmar === 'function') acaoAoConfirmar();
        };

        modalProcesso.classList.add('active');

        temporizadorFechamentoAuto = setTimeout(() => {
            closeModalProcesso();
            if (typeof acaoAoConfirmar === 'function') acaoAoConfirmar();
        }, 2500);
    };
})();
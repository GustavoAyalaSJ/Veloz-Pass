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
    let intervaloRelogio = null;

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
        if (intervaloRelogio) {
            clearInterval(intervaloRelogio);
            intervaloRelogio = null;
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

        const statusNormalizado = ['success', 'concluido', 'concluído', 'under-review', 'em_revisao', 'em_revisão']
            .includes((status || '').toLowerCase().trim()) ? 'under-review' : 'rejected';

        if (statusNormalizado === 'under-review') {
            elementoTitulo.textContent = 'Processo em Revisão';
            
            elementoCorpo.innerHTML = `
                <div class="timer-container" style="text-align: center; margin: 15px 0;">
                    <i class="bi bi-clock-history" style="font-size: 3rem; color: #f39c12;"></i>
                    <div id="countdown-clock" style="font-size: 1.8rem; font-weight: bold; margin-top: 10px; color: #333;">02:00</div>
                </div>
            `;

            elementoMensagem.textContent = 'Aguarde uma resposta do nosso sistema, pode levar alguns minutos.';

            let tempoRestante = 120;
            
            intervaloRelogio = setInterval(() => {
                tempoRestante--;
                
                const minutos = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
                const segundos = (tempoRestante % 60).toString().padStart(2, '0');
                
                const relogioDisplay = document.getElementById('countdown-clock');
                if (relogioDisplay) {
                    relogioDisplay.textContent = `${minutos}:${segundos}`;
                }

                if (tempoRestante <= 0) {
                    closeModalProcesso();
                    if (typeof acaoAoConfirmar === 'function') acaoAoConfirmar();
                }
            }, 1000);

        } else {
            elementoTitulo.textContent = 'Resultado: Recusado';
            elementoCorpo.innerHTML = '<i class="bi bi-x-circle" style="font-size: 3rem; color: #e74c3c;"></i>';
            elementoMensagem.textContent = 'Processo recusado pelo provedor ou falha no sistema. Em caso de dúvidas, contate o suporte.';
        }

        botaoOk.onclick = () => {
            closeModalProcesso();
            if (typeof acaoAoConfirmar === 'function') acaoAoConfirmar();
        };

        modalProcesso.classList.add('active');
    };
})();
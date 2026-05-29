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
    let pollingInterval = null;
    let ultimoProtocolo = null;

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
            if (e.target === modalProcesso) {
                closeModalProcesso();
            }
        };
    }

    function closeModalProcesso() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            ultimoProtocolo = null;
        }
        modalProcesso?.classList.remove('processing');
        modalProcesso?.classList.remove('active');
    }

    async function verificarStatusProcesso(protocolo) {
        if (!protocolo) return null;

        try {
            const token = typeof auth !== 'undefined' ? auth.getToken() : null;
            if (!token) return null;

            const response = await fetch(`${window.location.origin}/api/payments/check-status/${protocolo}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });

            if (!response.ok) return null;
            const data = await response.json();
            return data.situacao || null;
        } catch (error) {
            console.error("Erro ao verificar status:", error);
            return null;
        }
    }

    function atualizarStatusModal(novoStatus) {
        if (!novoStatus) return;

        const statusNormalizado = (novoStatus || '')
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/_/g, '-')
            .trim();

        const elementoTitulo = document.getElementById('process-modal-title');
        const elementoCorpo = document.getElementById('process-modal-body');
        const elementoMensagem = document.getElementById('process-modal-message');
        const botaoOk = document.getElementById('process-modal-ok');

        const concluido =
            statusNormalizado.includes('success') ||
            statusNormalizado.includes('concluido');

        const recusado =
            statusNormalizado.includes('rejected') ||
            statusNormalizado.includes('recusado') ||
            statusNormalizado.includes('recusada');

        if (concluido) {
            clearInterval(pollingInterval);
            pollingInterval = null;

            elementoTitulo.textContent = 'Processo Finalizado';
            elementoCorpo.innerHTML = `<i class="bi bi-check-circle success-icon"></i>`;
            elementoMensagem.textContent = 'Operação concluída com sucesso!';
            
            modalProcesso?.classList.remove('processing');
        } else if (recusado) {
            clearInterval(pollingInterval);
            pollingInterval = null;

            elementoTitulo.textContent = 'Processo Recusado';
            elementoCorpo.innerHTML = `<i class="bi bi-x-circle rejected-icon"></i>`;
            elementoMensagem.textContent = 'O processo foi recusado pelo sistema.';
            
            modalProcesso?.classList.remove('processing');
        }
    }

    window.showProcessModal = function (
        status,
        tipoPagina,
        acaoAoConfirmar,
        protocolo
    ) {

        createProcessModal();

        const elementoTitulo = document.getElementById('process-modal-title');
        const elementoCorpo = document.getElementById('process-modal-body');
        const elementoMensagem = document.getElementById('process-modal-message');
        const botaoOk = document.getElementById('process-modal-ok');

        const statusNormalizado = (status || '')
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/_/g, '-')
            .trim();

        const emRevisao =
            statusNormalizado.includes('under-review') ||
            statusNormalizado.includes('em-revisao');

        const concluido =
            statusNormalizado.includes('success') ||
            statusNormalizado.includes('concluido');

        const recusado =
            statusNormalizado.includes('rejected') ||
            statusNormalizado.includes('recusado') ||
            statusNormalizado.includes('recusada');

        if (emRevisao) {
            elementoTitulo.textContent = 'Atualizando Informações';
            elementoCorpo.innerHTML = `
                <div class="timer-container">
                    <i class="bi bi-arrow-repeat process-spin"></i>
                </div>
            `;

            elementoMensagem.textContent = 'Sua solicitação foi enviada para análise do sistema.';

            botaoOk.style.display = 'inline-flex';
            botaoOk.textContent = 'Continuar Navegando';
            botaoOk.onclick = () => {

                closeModalProcesso();
                if (typeof acaoAoConfirmar === 'function') {
                    acaoAoConfirmar();
                }

            };

            // Inicia polling se houver protocolo
            if (protocolo && !pollingInterval) {
                ultimoProtocolo = protocolo;
                pollingInterval = setInterval(() => {
                    verificarStatusProcesso(protocolo).then(novoStatus => {
                        if (novoStatus) {
                            atualizarStatusModal(novoStatus);
                        }
                    });
                }, 2000); // Verifica a cada 2 segundos
            }

        } else if (concluido) {

            elementoTitulo.textContent = 'Processo Finalizado';

            elementoCorpo.innerHTML = `
                <i class="bi bi-check-circle success-icon"></i>
            `;

            elementoMensagem.textContent = 'Operação concluída.';
            botaoOk.style.display = 'inline-flex';
            botaoOk.textContent = 'OK';
            botaoOk.onclick = () => {

                closeModalProcesso();
                if (typeof acaoAoConfirmar === 'function') {
                    acaoAoConfirmar();
                }

            };

        } else if (recusado) {
            elementoTitulo.textContent = 'Processo Recusado';
            elementoCorpo.innerHTML = `
                <i class="bi bi-x-circle rejected-icon"></i>
            `;

            elementoMensagem.textContent = 'O processo foi recusado pelo sistema.';

            botaoOk.style.display = 'inline-flex';
            botaoOk.textContent = 'Fechar';
            botaoOk.onclick = () => {

                closeModalProcesso();
                if (typeof acaoAoConfirmar === 'function') {
                    acaoAoConfirmar();
                }

            };

        } else {

            elementoTitulo.textContent = 'Processando';
            elementoCorpo.innerHTML = `
                <div class="timer-container">
                    <i class="bi bi-arrow-repeat process-spin"></i>
                </div>
            `;

            elementoMensagem.textContent = 'Seu processo está sendo analisado.';
            botaoOk.style.display = 'inline-flex';
            botaoOk.textContent = 'OK';
            botaoOk.onclick = () => {
                closeModalProcesso();
            };
        }

        modalProcesso.classList.add('active');

        if (emRevisao) {
            modalProcesso.classList.add('processing');
        } else {
            modalProcesso.classList.remove('processing');
        }
    };
})();
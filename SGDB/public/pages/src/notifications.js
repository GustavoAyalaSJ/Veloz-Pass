(() => {
    let idUsuarioLogado = null;

    function obterIdUsuario() {
        const spanCodigo = document.getElementById('codUnique-user');
        if (spanCodigo) {
            idUsuarioLogado = spanCodigo.textContent.trim();
        }
        return idUsuarioLogado;
    }

    async function fetchNotificacoes() {
        const idUsuario = obterIdUsuario();
        if (!idUsuario || idUsuario === 'PLACEHOLDER') {
            console.warn('ID do usuário não disponível');
            return [];
        }

        try {
            const response = await fetch(`/notifications/${idUsuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Erro ao buscar notificações:', response.status);
                return [];
            }

            const data = await response.json();
            return data.notifications || [];
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            return [];
        }
    }

    function renderizarNotificacoesDropdown(notificacoes) {
        const dropdownNotificacao = document.getElementById('notification-dropdown');
        if (!dropdownNotificacao) return;

        if (!notificacoes || notificacoes.length === 0) {
            dropdownNotificacao.innerHTML = `
                <label class="notificationLabel">Notificações</label>
                <section class="notificationWarning">
                    Você não possui nenhuma notificação no momento.
                </section>
                <div class="notificationFooter">
                    <p>Aviso: As notificações apagarão sozinhas no prazo de 30 dias.</p>
                </div>
            `;
            return;
        }

        let notificacoesHTML = '<label class="notificationLabel">Notificações</label>';
        
        notificacoes.forEach(notif => {
            const dataEnvio = new Date(notif.data_envio).toLocaleDateString('pt-BR');
            notificacoesHTML += `
                <div class="notification-item" data-id="${notif.id_notificacao}">
                    <div class="notification-content">
                        <i class="bi bi-exclamation-circle-fill"></i>
                        <div class="notification-text">
                            <p class="notification-message">O status do protocolo <strong>${notif.protocolo}</strong> foi atualizado para <strong>${notif.situacao}</strong>. Clique para visualizar.</p>
                            <span class="notification-date">${dataEnvio}</span>
                        </div>
                    </div>
                    <i class="bi bi-trash delete-notification" style="cursor: pointer;"></i>
                </div>
            `;
        });

        notificacoesHTML += `
            <div class="notificationFooter">
                <p>Aviso: As notificações apagarão sozinhas no prazo de 30 dias.</p>
            </div>
        `;

        dropdownNotificacao.innerHTML = notificacoesHTML;

        document.querySelectorAll('.delete-notification').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notifItem = btn.closest('.notification-item');
                notifItem?.remove();
            });
        });

        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-notification')) {
                    const protocolo = item.querySelector('.notification-message strong').textContent;
                    console.log('Notificação clicada - Protocolo:', protocolo);
                }
            });
        });
    }

    function renderizarNotificacoesModal(notificacoes) {
        const modalMobile = document.getElementById('notification-mobile-modal');
        const modalBody = modalMobile?.querySelector('.modal-body');
        if (!modalBody) return;

        const modalList = modalBody.querySelector('.modal-list');
        if (!modalList) return;

        if (!notificacoes || notificacoes.length === 0) {
            modalList.innerHTML = `<p class="modal-empty">Você não possui nenhuma notificação no momento.</p>`;
            return;
        }

        let notificacoesHTML = '';
        
        notificacoes.forEach(notif => {
            const dataEnvio = new Date(notif.data_envio).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            notificacoesHTML += `
                <div class="notification-mobile-item" data-id="${notif.id_notificacao}">
                    <div class="notification-mobile-content">
                        <i class="bi bi-exclamation-circle-fill"></i>
                        <div class="notification-mobile-text">
                            <p>O status do protocolo <strong>${notif.protocolo}</strong> foi atualizado para <strong>${notif.situacao}</strong>. Clique para visualizar.</p>
                            <span class="notification-mobile-date">${dataEnvio}</span>
                        </div>
                    </div>
                    <i class="bi bi-trash delete-notification-mobile" title="Remover notificação"></i>
                </div>
            `;
        });

        modalList.innerHTML = notificacoesHTML;

        document.querySelectorAll('.delete-notification-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notifItem = btn.closest('.notification-mobile-item');
                notifItem?.remove();
            });
        });

        document.querySelectorAll('.notification-mobile-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-notification-mobile')) {
                    const protocolo = item.querySelector('strong').textContent;
                    console.log('Notificação mobile clicada - Protocolo:', protocolo);
                }
            });
        });
    }

    async function carregarNotificacoes() {
        const notificacoes = await fetchNotificacoes();
        renderizarNotificacoesDropdown(notificacoes);
        renderizarNotificacoesModal(notificacoes);
    }

    function setupNotificationButtonListener() {
        const botaoNotificacao = document.getElementById('notification-button');
        if (botaoNotificacao) {
            botaoNotificacao.addEventListener('click', async (e) => {
                e.stopPropagation();
                const dropdownNotificacao = document.getElementById('notification-dropdown');
                
                if (dropdownNotificacao?.classList.contains('show')) {
                    dropdownNotificacao.classList.remove('show');
                    botaoNotificacao.classList.remove('open');
                } else {
                    await carregarNotificacoes();
                    dropdownNotificacao?.classList.add('show');
                    botaoNotificacao?.classList.add('open');
                }
            });
        }
    }

    function setupNotificationMobileModal() {
        const notificationButtonMobile = document.querySelector('.mobile-nav-item[id*="notification"]');
        const modalMobile = document.getElementById('notification-mobile-modal');
        const closeBtn = modalMobile?.querySelector('.modal-close');

        if (notificationButtonMobile && modalMobile) {
            notificationButtonMobile.addEventListener('click', async (e) => {
                e.stopPropagation();
                await carregarNotificacoes();
                modalMobile.classList.add('show');
            });
        }

        if (closeBtn && modalMobile) {
            closeBtn.addEventListener('click', () => {
                modalMobile.classList.remove('show');
            });
        }

        if (modalMobile) {
            modalMobile.addEventListener('click', (e) => {
                if (e.target === modalMobile) {
                    modalMobile.classList.remove('show');
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        obterIdUsuario();
        setupNotificationButtonListener();
        setupNotificationMobileModal();

        setInterval(carregarNotificacoes, 30000);
    });

    window.notificacoes = {
        carregarNotificacoes,
        fetchNotificacoes
    };
})();

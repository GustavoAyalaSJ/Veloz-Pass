document.addEventListener('DOMContentLoaded', async () => {
    const dropdown = document.getElementById('notification-dropdown');
    const button = document.getElementById('notification-button');

    if (!dropdown || !button) return;
    if (typeof auth === 'undefined') return;

    const userData = auth.getUserData();
    const idLogado = userData?.id;
    if (!idLogado) return;

    let pollingInterval = null;
    const POLLING_INTERVAL = 10000; // 10 segundos

    const carregarNotificacoes = async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const csrfToken = auth.getCsrfToken();
            if (csrfToken) {
                headers['x-csrf-token'] = csrfToken;
            }

            const response = await fetch(`/api/notifications/${idLogado}`, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                console.warn("Erro ao carregar notificações:", response.status);
                return;
            }

            const payload = await response.json();
            const notifications = payload?.notifications || [];

            renderNotifications(notifications);
        } catch (e) {
            console.error("Erro ao carregar notificações:", e);
        }
    };

    const renderNotifications = (notifications) => {
        const existingList = dropdown.querySelector('.notification-list');
        if (existingList) existingList.remove();

        const warning = dropdown.querySelector('.notificationWarning');
        if (warning) warning.style.display = notifications.length ? 'none' : 'block';

        if (notifications.length === 0) return;

        const listWrapper = document.createElement('div');
        listWrapper.className = 'notification-list';
        listWrapper.style.display = 'flex';
        listWrapper.style.gap = '10px';
        listWrapper.style.paddingBottom = '2px';

        if (notifications.length >= 2) {
            listWrapper.style.overflowX = 'auto';
            listWrapper.style.overflowY = 'hidden';
            listWrapper.style.whiteSpace = 'nowrap';
        } else {
            listWrapper.style.overflowX = 'visible';
            listWrapper.style.whiteSpace = 'normal';
        }

        notifications.forEach((n) => {
            const item = document.createElement('div');
            item.className = 'notification-item';

            const situacao = (n.situacao || '').toLowerCase();
            const protocolo = n.protocolo || '---';

            const isConcluido = situacao.includes('concluído') || situacao.includes('concluido');
            const iconHtml = isConcluido
                ? '<i class="bi bi-check-circle-fill" style="color:#2ecc71; font-size:1.3rem;"></i>'
                : '<i class="bi bi-x-circle-fill" style="color:#e74c3c; font-size:1.3rem;"></i>';

            const mensagem = isConcluido
                ? 'Foi confirmado pela nossa equipe, o saldo foi creditado na sua conta.'
                : 'Foi recusado pela nossa equipe, você não perdeu saldo ou foi penalizado na sua conta bancária. Caso de erro, contate suporte.';

            const dataEnvio = n.data_envio ? new Date(n.data_envio) : null;
            const dataHora = dataEnvio && !isNaN(dataEnvio.getTime())
                ? dataEnvio.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : '';

            item.style.display = 'inline-flex';
            item.style.flex = '0 0 auto';
            item.style.minWidth = notifications.length >= 2 ? '280px' : '100%';
            item.style.maxWidth = '320px';
            item.style.border = '1px solid rgba(114,150,190,0.35)';
            item.style.borderRadius = '12px';
            item.style.padding = '10px 12px';
            item.style.background = 'rgba(114,150,190,0.06)';

            item.innerHTML = `
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <div style="flex:0 0 auto;">${iconHtml}</div>
                    <div style="flex:1 1 auto;">
                        <div style="font-weight:800; color:#4a6b94; font-size:0.92rem;">
                            Protocolo: <span style="color:#2c3e50;">${protocolo}</span>
                        </div>
                        <div style="margin-top:6px; color:#2c3e50; font-size:0.92rem; line-height:1.25;">
                            ${mensagem}
                        </div>
                        ${dataHora ? `<div style="margin-top:8px; font-size:0.78rem; color:#7f8c8d;">Enviado em: ${dataHora}</div>` : ''}
                    </div>
                </div>
            `;

            listWrapper.appendChild(item);
        });

        dropdown.appendChild(listWrapper);
    };

    button.addEventListener('click', carregarNotificacoes);

    const startPolling = () => {
        if (pollingInterval) return;

        pollingInterval = setInterval(carregarNotificacoes, POLLING_INTERVAL);
        carregarNotificacoes();
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
        } else {
            startPolling();
        }
    });

    startPolling();
});

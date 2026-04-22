function toggleElement(trigger, content, triggerClass = 'open', contentClass = 'show', icon = null) {
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };
    const debouncedToggle = debounce(() => {
        const isOpen = content.classList.contains(contentClass);
        if (isOpen) {
            content.classList.remove(contentClass);
            if (trigger) trigger.classList.remove(triggerClass);
            if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
            document.querySelectorAll('.dropdown-content.show, .select-wrapper.open, .filtro-item.active, .type-card.active').forEach(el => {
                el.classList.remove('show', 'open', 'active');
            });
            document.querySelectorAll('.select-icon, .icon-button.open i').forEach(i => i.style.transform = 'rotate(0deg)');
            content.classList.add(contentClass);
            if (trigger) trigger.classList.add(triggerClass);
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    }, 50);
    debouncedToggle();
}

document.addEventListener('DOMContentLoaded', () => {
    let logoutModal = null;

    function createLogoutModal() {
        if (logoutModal) return;

        logoutModal = document.createElement('div');
        logoutModal.id = 'logoutModal';
        logoutModal.className = 'logout-overlay';
        logoutModal.style.display = 'none';
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
            if (typeof auth !== 'undefined') auth.clear();
            else {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/introduction';
            }
        };

        document.getElementById('btn-nao-logout').onclick = () => logoutModal.style.display = 'none';

        logoutModal.onclick = (e) => {
            if (e.target === logoutModal) logoutModal.style.display = 'none';
        };

        document.onkeydown = (e) => {
            if (e.key === 'Escape' && logoutModal.style.display !== 'none') logoutModal.style.display = 'none';
        };
    }

    document.onclick = (e) => {
        if (e.target.closest('.exit-link')) {
            e.preventDefault();
            createLogoutModal();
            logoutModal.style.display = 'flex';
        }
    };

    (function() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') document.documentElement.classList.add('dark-mode');
    })();

    const changeButton = document.getElementById('change-button');
    if (changeButton) {
        const updateIcon = () => {
            const isDark = document.documentElement.classList.contains('dark-mode');
            changeButton.innerHTML = isDark ? '<i class="bi bi-moon-fill"></i>' : '<i class="bi bi-brightness-high-fill"></i>';
        };
        updateIcon();
        changeButton.onclick = () => {
            document.documentElement.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light');
            updateIcon();
        };
    }
});

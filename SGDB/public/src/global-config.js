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
            document.querySelectorAll('.select-wrapper.open, .filtro-item.active').forEach(el => {
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

        document.getElementById('btn-nao-logout').onclick = () => logoutModal.classList.remove('active');

        logoutModal.onclick = (e) => {
            if (e.target === logoutModal) logoutModal.classList.remove('active');
        };

        document.onkeydown = (e) => {
            if (e.key === 'Escape' && logoutModal.classList.contains('active')) logoutModal.classList.remove('active');
        };
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.exit-link')) {
            e.preventDefault();
            createLogoutModal();
            logoutModal.classList.add('active');
        }
    });

    (function () {
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

const MINT_KEY_PREFIX = "mint-visto-";
let stepIndex = 0;

const MINT_SPRITES = {
    'greeting': '../Assets/MINT/placeholder-icon.webp',
    'introduction': '../Assets/MINT/placeholder-icon.webp',
    'pointing': '../Assets/MINT/placeholder-icon.webp',
    'happy': '../Assets/MINT/placeholder-icon.webp',
    'thinking': '#',
    'celebrate': '../Assets/MINT/placeholder-icon.webp'
};

function safeParse(str) {
    if (typeof str !== 'string') return null;
    try {
        return JSON.parse(str);
    } catch (e) {
        console.warn('JSON parse failed:', e);
        return null;
    }
}

function getCurrentUserId() {
    const userDataStr = sessionStorage.getItem('user_data');
    if (userDataStr) {
        const userData = safeParse(userDataStr);
        return userData ? userData.id : null;
    }
    return null;
}

function getMintCompletionKey(userId) {
    return MINT_KEY_PREFIX + (userId || 'anonymous');
}

const mintSteps = [
    {
        texto: "Olá usuário! Seja bem-vindo ao Veloz Pass.",
        sprite: "greeting",
        acao: "next"
    },
    {
        texto: "Eu me chamo <span class='destacarMint'>MINT</span> seu robozinho introdutório do Veloz Pass.",
        sprite: "introduction",
        acao: "next"
    },
    {
        texto: "No momento, estou ainda em desenvolvimento, então fim de testes.",
        sprite: "pointing",
        acao: "next"
    },

];

function initMint(force = false) {
    const userId = getCurrentUserId();
    const mintCompletionKey = getMintCompletionKey(userId);
    const isNewUser = sessionStorage.getItem('user-first-login') === 'true';
    const hasSavedStep = localStorage.getItem("mint-step") !== null;

    if (!force && localStorage.getItem(mintCompletionKey) === "true") {
        return;
    }

    if (!force && !isNewUser && !hasSavedStep) {
        return;
    }

    if (document.getElementById("mint-ui")) return;

    const savedStep = localStorage.getItem("mint-step");
    if (savedStep !== null) {
        stepIndex = parseInt(savedStep);
    }

    if (force) stepIndex = 0;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="mint-overlay"></div>
        <div class="mint-highlight"></div>
        <div class="mint-ui" id="mint-ui">
            <div class="mint-sprite-container">
                <img id="mint-sprite" class="mint-sprite" src="" alt="MINT Avatar">
            </div>
            <div class="mint-balao">
                <div id="mint-texto"></div>
                <div class="mint-actions">
                    <button class="mint-btn mint-next">Próximo</button>
                </div>
            </div>
        </div>
    `);

    document.querySelector('.mint-next').addEventListener('click', proximoPasso);

    executarPasso();
}

function executarPasso() {
    const step = mintSteps[stepIndex];
    if (!step) {
        finalizarMint();
        return;
    }

    const textoEl = document.getElementById('mint-texto');
    const spriteEl = document.getElementById('mint-sprite');
    const ui = document.getElementById('mint-ui');
    const overlay = document.querySelector('.mint-overlay');
    const highlight = document.querySelector('.mint-highlight');
    const nextBtn = document.querySelector('.mint-next');

    textoEl.innerHTML = step.texto;

    if (step.sprite && MINT_SPRITES[step.sprite] !== "#") {
        spriteEl.src = MINT_SPRITES[step.sprite];
        spriteEl.classList.add('active');
        spriteEl.style.display = "block";
    } else {
        spriteEl.style.display = "none";
    }

    if (step.target) {
        const targetEl = document.querySelector(step.target);

        if (!targetEl) {
            console.warn("MINT: Target not found:", step.target);
            proximoPasso();
            return;
        }

        overlay.style.display = "block";
        highlight.style.display = "block";

        const rect = targetEl.getBoundingClientRect();
        highlight.style.top = rect.top + "px";
        highlight.style.left = rect.left + "px";
        highlight.style.width = rect.width + "px";
        highlight.style.height = rect.height + "px";

        targetEl.classList.add("mint-target");

        ui.style.top = (rect.bottom + 15) + "px";
        ui.style.left = rect.left + "px";
        ui.style.transform = "none";

        if (step.acao === "click") {
            nextBtn.style.display = "none";
            overlay.style.pointerEvents = "all";

            const handleTargetClick = (e) => {
                const isLink = targetEl.tagName.toLowerCase() === "a";

                if (isLink) {
                    e.preventDefault();
                }

                targetEl.removeEventListener("click", handleTargetClick);

                stepIndex++;
                localStorage.setItem("mint-step", stepIndex);

                if (isLink) {
                    window.location.href = targetEl.href;
                } else {
                    proximoPasso();
                }
            };

            targetEl.addEventListener("click", handleTargetClick);

        } else {
            nextBtn.style.display = "block";
            overlay.style.pointerEvents = "none";
        }

    } else {
        nextBtn.style.display = "block";
        overlay.style.pointerEvents = "none";
        highlight.style.display = "none";

        ui.style.top = "50%";
        ui.style.left = "50%";
        ui.style.transform = "translate(-50%, -50%)";
    }

    ui.style.display = "block";
}

function proximoPasso() {
    stepIndex++;

    localStorage.setItem("mint-step", stepIndex);

    if (stepIndex >= mintSteps.length) {
        finalizarMint();
    } else {
        executarPasso();
    }
}

function finalizarMint() {
    const userId = getCurrentUserId();
    const mintCompletionKey = getMintCompletionKey(userId);

    document.querySelector('.mint-overlay')?.remove();
    document.querySelector('.mint-highlight')?.remove();
    document.getElementById('mint-ui')?.remove();

    localStorage.setItem(mintCompletionKey, "true");

    localStorage.removeItem("mint-step");
    sessionStorage.removeItem('user-first-login');
}


document.addEventListener("DOMContentLoaded", () => {
    initMint();

    const btnReplay = document.getElementById("mint-replay-btn");
    if (btnReplay) {
        btnReplay.onclick = () => initMint(true);
    }
});

(function () {
    let processModal = null;
    let autoCloseTimeout = null;

    function createProcessModal() {
        if (processModal) return;

        processModal = document.createElement('div');
        processModal.id = 'processModal';
        processModal.className = 'process-overlay';
        processModal.innerHTML = `
            <div class="process-box">
                <div class="process-header">
                    <h3 id="process-modal-title">Resultado</h3>
                </div>
                <div class="process-body" id="process-modal-body">
                    <i class="bi bi-check-circle icon-success"></i>
                </div>
                <div class="process-footer">
                    <p id="process-modal-message">Mensagem</p>
                    <button id="process-modal-ok" class="btn-ok">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(processModal);

        processModal.onclick = (e) => {
            if (e.target === processModal) dismissProcessModal();
        };

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && processModal.classList.contains('active')) {
                dismissProcessModal();
            }
        });
    }

    function hideProcessModal() {
        if (processModal) {
            processModal.classList.remove('active');
        }
    }

    function dismissProcessModal() {
        if (autoCloseTimeout) {
            clearTimeout(autoCloseTimeout);
            autoCloseTimeout = null;
        }
        hideProcessModal();
    }

    window.showProcessModal = function (status, pageType, onConfirm) {
        createProcessModal();

        if (autoCloseTimeout) {
            clearTimeout(autoCloseTimeout);
            autoCloseTimeout = null;
        }

        const titleEl = document.getElementById('process-modal-title');
        const bodyEl = document.getElementById('process-modal-body');
        const msgEl = document.getElementById('process-modal-message');
        const okBtn = document.getElementById('process-modal-ok');

        const statusMap = {
            'concluido': 'success',
            'concluído': 'success',
            'success': 'success',
            'em_revisão': 'under-review',
            'em revisão': 'under-review',
            'under-review': 'under-review',
            'recusada': 'rejected',
            'rejected': 'rejected',
            'declined': 'rejected'
        };

        const normalizedStatus = statusMap[(status || '').toLowerCase().replace(/\s/g, '_')] || 'rejected';

        const icons = {
            'success': '<i class="bi bi-check-circle icon-success"></i>',
            'under-review': '<i class="bi bi-question-circle icon-review"></i>',
            'rejected': '<i class="bi bi-x-circle icon-rejected"></i>'
        };

        const titles = {
            'success': 'Resultado: Sucesso',
            'under-review': 'Resultado: Em Revisão',
            'rejected': 'Resultado: Recusado'
        };

        const messages = {
            'success': {
                'carteira': 'Crédito inserido na carteira com sucesso. Aguarde alguns segundos para atualizar o valor da sua carteira.',
                'recarga': 'Recarga realizada com sucesso, aguarda algumas horas para saldo ser creditado em seu cartão de transporte.'
            },
            'under-review': 'Processo em revisão! Aguarde uma resposta do nosso sistema, pode levar minutos ou horas.',
            'rejected': 'Processo recusado pelo provedor do banco ou falha em nosso sistema. Sua conta não será penalizada, em caso de engano, contate o suporte.'
        };

        titleEl.textContent = titles[normalizedStatus];
        bodyEl.innerHTML = icons[normalizedStatus];

        if (normalizedStatus === 'success' && pageType) {
            msgEl.textContent = messages.success[pageType] || messages.success['carteira'];
        } else {
            msgEl.textContent = messages[normalizedStatus];
        }

        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        function executeCallback() {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        }

        newOkBtn.onclick = () => {
            dismissProcessModal();
            executeCallback();
        };

        processModal.classList.add('active');

        autoCloseTimeout = setTimeout(() => {
            hideProcessModal();
            executeCallback();
            autoCloseTimeout = null;
        }, 2500);
    };
})();
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

    document.onclick = (e) => {
        if (e.target.closest('.exit-link')) {
            e.preventDefault();
            createLogoutModal();
            logoutModal.classList.add('active');
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

const MINT_KEY = "mint-visto";
let stepIndex = 0;
const MINT_SPRITES = {
    'greeting': '#',
    'introduction': '#',
    'pointing': '#',
    'happy': '#',
    'thinking': '#',
    'celebrate': '#'
};

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
        texto: "Estou sendo desenvolvido pela equipe do Veloz Pass, então fim dos testes.",
        sprite: "introduction",
        acao: "next"
    },
];

function initMint(force = false) {
    if (!force && localStorage.getItem(MINT_KEY)) return;

    const savedStep = localStorage.getItem("mint-step");
    if (savedStep !== null) {
        stepIndex = parseInt(savedStep);
    }

    if (document.getElementById("mint-ui")) return;

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

    document.querySelector('.mint-next').onclick = proximoPasso;

    executarPasso();
}

function executarPasso() {
    const step = mintSteps[stepIndex];
    const textoEl = document.getElementById('mint-texto');
    const spriteEl = document.getElementById('mint-sprite');
    const highlight = document.querySelector('.mint-highlight');
    const overlay = document.querySelector('.mint-overlay');
    const ui = document.getElementById('mint-ui');

    if (!step) return;

    textoEl.innerHTML = step.texto;

    if (step.sprite && MINT_SPRITES[step.sprite]) {
        spriteEl.src = MINT_SPRITES[step.sprite];
        spriteEl.style.display = "block";
    } else {
        spriteEl.style.display = "none";
    }

    // reset visual
    highlight.style.display = "none";
    overlay.style.pointerEvents = "none";
    ui.style.transform = "";

    limparTarget();

    if (step.target) {
        const el = document.querySelector(step.target);

        if (!el) {
            console.warn("MINT target não encontrado:", step.target);
            proximoPasso();
            return;
        }

        const rect = el.getBoundingClientRect();

        highlight.style.display = "block";
        highlight.style.top = rect.top + "px";
        highlight.style.left = rect.left + "px";
        highlight.style.width = rect.width + "px";
        highlight.style.height = rect.height + "px";

        el.classList.add("mint-target");

        ui.style.top = (rect.bottom + 15) + "px";
        ui.style.left = rect.left + "px";

        if (step.acao === "click") {

            overlay.style.pointerEvents = "all";
            el.classList.add("mint-target");

            const isLink = el.tagName.toLowerCase() === "a";

            const handleClick = (e) => {

                if (isLink) {
                    e.preventDefault();
                }

                el.removeEventListener("click", handleClick);

                stepIndex++;
                localStorage.setItem("mint-step", stepIndex);

                if (isLink) {
                    window.location.href = el.href;
                } else {
                    proximoPasso();
                }
            };

            el.addEventListener("click", handleClick);

            return;
        }
    } else {
        ui.style.top = "50%";
        ui.style.left = "50%";
        ui.style.transform = "translate(-50%, -50%)";
    }
}

function proximoPasso() {
    stepIndex++;

    if (stepIndex >= mintSteps.length) {
        finalizarMint();
        return;
    }

    localStorage.setItem("mint-step", stepIndex);

    executarPasso();
}

function limparTarget() {
    document.querySelectorAll('.mint-target').forEach(el => {
        el.classList.remove('mint-target');
    });
}

function finalizarMint() {
    document.querySelector('.mint-overlay')?.remove();
    document.querySelector('.mint-highlight')?.remove();
    document.getElementById('mint-ui')?.remove();

    limparTarget();

    localStorage.setItem(MINT_KEY, "true");

    localStorage.removeItem("mint-step");
}

function startMintReplay() {
    stepIndex = 0;

    document.querySelector('.mint-overlay')?.remove();
    document.querySelector('.mint-highlight')?.remove();
    document.getElementById('mint-ui')?.remove();

    limparTarget();

    initMint(true);
}

document.addEventListener("DOMContentLoaded", () => {
    initMint();
});

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("mint-replay-btn");

    if (btn) {
        btn.onclick = startMintReplay;
    }
});


(function() {
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

    window.showProcessModal = function(status, pageType, onConfirm) {
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

(() => {
    const MINT_KEY_PREFIX = "mint-visto-";

    function safeParse(str) {
        if (typeof str !== 'string') return null;
        try { return JSON.parse(str); } catch { return null; }
    }

    function getCurrentUserId() {
        const userDataStr = sessionStorage.getItem('user_data');
        if (!userDataStr) return null;
        const userData = safeParse(userDataStr);
        return userData ? userData.id : null;
    }

    function getMintCompletionKey(userId) {
        return MINT_KEY_PREFIX + (userId || 'anonymous');
    }

    function removeMintUI() {
        document.querySelector('.mint-highlight')?.remove();
        document.getElementById('mint-ui')?.remove();
        document.body.classList.remove('mint-active');
        document.querySelectorAll('.mint-target').forEach(el => el.classList.remove('mint-target'));
        document.body.style.overflow = "";
    }

    function createMintUI() {
        if (document.getElementById("mint-ui")) return;
        document.body.insertAdjacentHTML('beforeend', `
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
    }

    function setMintStepUI(step, { getTargetEl, spriteMap, onStepComplete }) {
        const textoEl = document.getElementById('mint-texto');
        const spriteEl = document.getElementById('mint-sprite');
        const ui = document.getElementById('mint-ui');
        const highlight = document.querySelector('.mint-highlight');
        const nextBtn = document.querySelector('.mint-next');

        if (!textoEl || !spriteEl || !ui || !highlight || !nextBtn) return;
        textoEl.innerHTML = step.texto || '';

        if (step.sprite && spriteMap[step.sprite] && spriteMap[step.sprite] !== "#") {
            spriteEl.src = spriteMap[step.sprite];
            spriteEl.classList.add('active');
            spriteEl.style.display = "block";
        } else {
            spriteEl.style.display = "none";
        }

        document.querySelectorAll('.mint-target').forEach(el => el.classList.remove('mint-target'));
        nextBtn.style.display = "block";

        if (!step.target) {
            highlight.style.display = "none";
            ui.style.top = "50%";
            ui.style.left = "50%";
            ui.style.transform = "translate(-50%, -50%)";
            ui.style.display = "block";
            return;
        }

        highlight.style.display = "none";

        const targetEl = getTargetEl(step.target);
        if (!targetEl) {
            onStepComplete?.();
            return;
        }

        targetEl.classList.add("mint-target");
        highlight.style.display = "block";

        const updatePosition = () => {
            requestAnimationFrame(() => {
                const rect = targetEl.getBoundingClientRect();
                const padding = 8;
                const viewportW = window.innerWidth;
                const viewportH = window.innerHeight;

                const safeLeft = Math.max(padding, rect.left);
                const safeTop = Math.max(padding, rect.top);
                const safeWidth = Math.max(20, Math.min(viewportW - padding, rect.right) - safeLeft);
                const safeHeight = Math.max(20, Math.min(viewportH - padding, rect.bottom) - safeTop);

                highlight.style.top = `${safeTop}px`;
                highlight.style.left = `${safeLeft}px`;
                highlight.style.width = `${safeWidth}px`;
                highlight.style.height = `${safeHeight}px`;

                try {
                    targetEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
                } catch { /* Fallback para navegadores antigos */ }

                ui.style.transform = "none";
                ui.style.display = "block";

                const bubbleW = ui.offsetWidth || 260;
                const bubbleH = ui.offsetHeight || 120;

                const safeLeftUI = Math.min(Math.max(padding, rect.left), viewportW - bubbleW - padding);
                const safeTopUI = Math.min(Math.max(padding, rect.bottom + 15), viewportH - bubbleH - padding);

                ui.style.left = `${safeLeftUI}px`;
                ui.style.top = `${safeTopUI}px`;
            });
        };

        updatePosition();

        let updateTimeout;
        const debouncedUpdate = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updatePosition, 100);
        };

        window.addEventListener('scroll', debouncedUpdate);
        window.addEventListener('resize', debouncedUpdate);
        window.addEventListener('orientationchange', debouncedUpdate);

        const cleanup = () => {
            window.removeEventListener('scroll', debouncedUpdate);
            window.removeEventListener('resize', debouncedUpdate);
            window.removeEventListener('orientationchange', debouncedUpdate);
            clearTimeout(updateTimeout);
        };

        if (step.acao === "click") {
            // skippable=true => clicar no alvo avança imediatamente.
            // skippable=false => alvo não deve avançar (mantém o passo até Próximo).
            nextBtn.style.display = "none";

            const handleTargetClick = (e) => {
                if (step.skippable === false) return;
                const isLink = targetEl.tagName?.toLowerCase() === "a";
                if (isLink) e.preventDefault();

                cleanup();
                onStepComplete?.();

                if (isLink) {
                    window.location.href = targetEl.href;
                }
            };

            targetEl.addEventListener("click", handleTargetClick, { once: true });
            return;
        }

        window._mintCleanup = cleanup;
    }

    function finalizeMint({ userId }) {
        removeMintUI();
        localStorage.setItem(getMintCompletionKey(userId), "true");
        localStorage.removeItem("mint-step");
        sessionStorage.removeItem('user-first-login');
    }

    function start({
        steps,
        spriteMap,
        force = false,
        replay = false,
        getTargetEl = (selector) => document.querySelector(selector),
        replayButton
    }) {
        const userId = getCurrentUserId();
        const mintCompletionKey = getMintCompletionKey(userId);

        if (!force && localStorage.getItem(mintCompletionKey) === "true") return;
        if (!force && localStorage.getItem("mint-step") === null) return;

        createMintUI();
        document.body.classList.add('mint-active');
        document.body.style.overflow = "hidden";

        let stepIndex = force ? 0 : (parseInt(localStorage.getItem("mint-step")) || 0);

        const nextBtn = document.querySelector('.mint-next');

        const renderCurrentStep = () => {
            if (typeof window._mintCleanup === 'function') {
                window._mintCleanup();
            }

            if (stepIndex >= steps.length) {
                finalizeMint({ userId });
                return;
            }

            localStorage.setItem("mint-step", stepIndex);
            const currentStep = steps[stepIndex];

            setMintStepUI(currentStep, {
                getTargetEl,
                spriteMap,
                onStepComplete: () => {
                    stepIndex++;
                    renderCurrentStep();
                }
            });
        };

        if (nextBtn) {
            nextBtn.onclick = () => {
                stepIndex++;
                renderCurrentStep();
            };
        }

        if (replayButton && typeof replayButton === "function") {
            replayButton();
        }

        renderCurrentStep();
    }

    window.MintEngine = {
        startMint: start
    };
})();
(function () {
    const MINT_KEY_PREFIX = "mint-visto-";

    function safeParse(str) {
        if (typeof str !== 'string') return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            console.warn('MINT: JSON parse failed', e);
            return null;
        }
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
        document.querySelector('.mint-overlay')?.remove();
        document.querySelector('.mint-highlight')?.remove();
        document.getElementById('mint-ui')?.remove();
    }

    function createMintUI() {
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
    }

    function setMintStepUI(step, { getTargetEl, spriteMap, onStepComplete }) {
        const textoEl = document.getElementById('mint-texto');
        const spriteEl = document.getElementById('mint-sprite');
        const ui = document.getElementById('mint-ui');
        const overlay = document.querySelector('.mint-overlay');
        const highlight = document.querySelector('.mint-highlight');
        const nextBtn = document.querySelector('.mint-next');

        if (!textoEl || !spriteEl || !ui || !overlay || !highlight || !nextBtn) return;

        textoEl.innerHTML = step.texto || '';

        if (step.sprite && spriteMap[step.sprite] && spriteMap[step.sprite] !== "#") {
            spriteEl.src = spriteMap[step.sprite];
            spriteEl.classList.add('active');
            spriteEl.style.display = "block";
        } else {
            spriteEl.style.display = "none";
        }

        nextBtn.style.display = "block";
        overlay.style.pointerEvents = "none";
        highlight.style.display = "none";

        if (!step.target) {
            highlight.style.display = "none";
            overlay.style.display = "none";
            ui.style.top = "50%";
            ui.style.left = "50%";
            ui.style.transform = "translate(-50%, -50%)";
            ui.style.display = "block";
            return;
        }

        const targetEl = getTargetEl(step.target);
        if (!targetEl) {
            console.warn("MINT: Target not found:", step.target);
            onStepComplete?.({ skipped: true });
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
        ui.style.display = "block";

        if (step.acao === "click") {
            nextBtn.style.display = "none";
            overlay.style.pointerEvents = "all";

            const handleTargetClick = (e) => {
                const isLink = targetEl.tagName?.toLowerCase() === "a";
                if (isLink) e.preventDefault();

                targetEl.removeEventListener("click", handleTargetClick);

                onStepComplete?.({ clicked: true, isLink });
                if (isLink) window.location.href = targetEl.href;
            };

            targetEl.addEventListener("click", handleTargetClick, { once: true });
        } else {
            overlay.style.pointerEvents = "none";
        }
    }

    function finalizeMint({ userId }) {
        removeMintUI();
        const mintCompletionKey = getMintCompletionKey(userId);
        localStorage.setItem(mintCompletionKey, "true");
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

        const hasCompleted = !force && localStorage.getItem(mintCompletionKey) === "true";
        if (hasCompleted) return;

        const hasSavedStep = localStorage.getItem("mint-step") !== null;

        if (!force && !hasSavedStep) return;

        createMintUI();

        let stepIndex = 0;
        const savedStep = localStorage.getItem("mint-step");
        if (savedStep !== null && !force) {
            const parsed = parseInt(savedStep);
            stepIndex = Number.isFinite(parsed) ? parsed : 0;
        }
        if (force) stepIndex = 0;

        const nextBtn = document.querySelector('.mint-next');
        const highlight = document.querySelector('.mint-highlight');

        if (nextBtn) {
            nextBtn.onclick = null;
            nextBtn.addEventListener('click', () => {
                stepIndex++;
                localStorage.setItem("mint-step", stepIndex);

                if (stepIndex >= steps.length) {
                    finalizeMint({ userId });
                    return;
                }

                const step = steps[stepIndex];
                setMintStepUI(step, {
                    getTargetEl,
                    spriteMap,
                    onStepComplete: null
                });
            });
        }

        const renderCurrentStep = () => {
            const step = steps[stepIndex];
            setMintStepUI(step, {
                getTargetEl,
                spriteMap,
                onStepComplete: () => {
                    stepIndex++;
                    localStorage.setItem("mint-step", stepIndex);

                    if (stepIndex >= steps.length) {
                        finalizeMint({ userId });
                        return;
                    }

                    renderCurrentStep();
                }
            });
        };

        if (replayButton && typeof replayButton === "function") {
            replayButton();
        }

        renderCurrentStep();

        if (highlight) highlight.style.display = "none";
    }

    window.MintEngine = {
        startMint: start
    };
})();

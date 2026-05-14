(function () {
    const MINT_KEY_PREFIX = "mint-visto-";

    function safeParse(str) {
        if (typeof str !== 'string') return null;

        try {
            return JSON.parse(str);
        } catch {
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
        document.querySelector('.mint-highlight')?.remove();
        document.getElementById('mint-ui')?.remove();
        document.body.classList.remove('mint-active');

        document.querySelectorAll('.mint-target')
            .forEach(el => el.classList.remove('mint-target'));

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

        if (
            step.sprite &&
            spriteMap[step.sprite] &&
            spriteMap[step.sprite] !== "#"
        ) {
            spriteEl.src = spriteMap[step.sprite];
            spriteEl.classList.add('active');
            spriteEl.style.display = "block";
        } else {
            spriteEl.style.display = "none";
        }

        nextBtn.style.display = "block";

        document.querySelectorAll('.mint-target')
            .forEach(el => el.classList.remove('mint-target'));

        if (!step.target) {
            highlight.style.display = "none";
            ui.style.top = "50%";
            ui.style.left = "50%";
            ui.style.transform = "translate(-50%, -50%)";
            ui.style.display = "block";

            return;
        }

        const targetEl = getTargetEl(step.target);

        if (!targetEl) {
            onStepComplete?.({ skipped: true });
            return;
        }

        targetEl.classList.add("mint-target");

        highlight.style.display = "block";

        targetEl.classList.add("mint-target");

        highlight.style.display = "block";

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {

                const rect = targetEl.getBoundingClientRect();
                const padding = 8;

                const viewportW = window.innerWidth;
                const viewportH = window.innerHeight;

                const safeLeft = Math.max(padding, rect.left);
                const safeTop = Math.max(padding, rect.top);
                const safeRight = Math.min(viewportW - padding, rect.right);
                const safeBottom = Math.min(viewportH - padding, rect.bottom);

                const safeWidth = Math.max(20, safeRight - safeLeft);
                const safeHeight = Math.max(20, safeBottom - safeTop);

                highlight.style.top = safeTop + "px";
                highlight.style.left = safeLeft + "px";
                highlight.style.width = safeWidth + "px";
                highlight.style.height = safeHeight + "px";

                try {
                    targetEl.scrollIntoView({
                        block: 'nearest',
                        inline: 'nearest',
                        behavior: 'instant'
                    });
                } catch { }

                ui.style.transform = "none";
                ui.style.display = "block";

                const bubbleRect = ui.getBoundingClientRect();

                const bubbleW =
                    bubbleRect.width ||
                    ui.offsetWidth ||
                    260;

                const bubbleH =
                    bubbleRect.height ||
                    ui.offsetHeight ||
                    120;

                const desiredLeft = rect.left;
                const desiredTop = rect.bottom + 15;

                const safeLeftUI = Math.min(
                    Math.max(padding, desiredLeft),
                    window.innerWidth - bubbleW - padding
                );

                const safeTopUI = Math.min(
                    Math.max(padding, desiredTop),
                    window.innerHeight - bubbleH - padding
                );

                ui.style.left = safeLeftUI + "px";
                ui.style.top = safeTopUI + "px";

            });
        });
        
        if (step.acao === "click") {
            nextBtn.style.display = "none";

            const handleTargetClick = (e) => {
                const isLink =
                    targetEl.tagName?.toLowerCase() === "a";

                if (isLink) {
                    e.preventDefault();
                }

                targetEl.removeEventListener(
                    "click",
                    handleTargetClick
                );

                onStepComplete?.({
                    clicked: true,
                    isLink
                });

                if (isLink) {
                    window.location.href = targetEl.href;
                }
            };

            targetEl.addEventListener(
                "click",
                handleTargetClick,
                { once: true }
            );
        }
    }

    function finalizeMint({ userId }) {
        removeMintUI();

        const mintCompletionKey =
            getMintCompletionKey(userId);

        localStorage.setItem(
            mintCompletionKey,
            "true"
        );

        localStorage.removeItem("mint-step");

        sessionStorage.removeItem('user-first-login');
    }

    function start({
        steps,
        spriteMap,
        force = false,
        replay = false,
        getTargetEl = (selector) =>
            document.querySelector(selector),
        replayButton
    }) {
        const userId = getCurrentUserId();

        const mintCompletionKey =
            getMintCompletionKey(userId);

        const hasCompleted =
            !force &&
            localStorage.getItem(mintCompletionKey) === "true";

        if (hasCompleted) return;

        const hasSavedStep =
            localStorage.getItem("mint-step") !== null;

        if (!force && !hasSavedStep) return;

        createMintUI();

        document.body.classList.add('mint-active');
        document.body.style.overflow = "hidden";

        let stepIndex = 0;

        const savedStep =
            localStorage.getItem("mint-step");

        if (savedStep !== null && !force) {
            const parsed = parseInt(savedStep);

            stepIndex =
                Number.isFinite(parsed)
                    ? parsed
                    : 0;
        }

        if (force) {
            stepIndex = 0;
        }

        const nextBtn =
            document.querySelector('.mint-next');

        if (nextBtn) {
            nextBtn.onclick = null;

            nextBtn.addEventListener('click', () => {
                stepIndex++;

                localStorage.setItem(
                    "mint-step",
                    stepIndex
                );

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

                    localStorage.setItem(
                        "mint-step",
                        stepIndex
                    );

                    if (stepIndex >= steps.length) {
                        finalizeMint({ userId });
                        return;
                    }

                    renderCurrentStep();
                }
            });
        };

        if (
            replayButton &&
            typeof replayButton === "function"
        ) {
            replayButton();
        }

        renderCurrentStep();
    }

    window.MintEngine = {
        startMint: start
    };
})();
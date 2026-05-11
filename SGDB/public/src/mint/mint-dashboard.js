document.addEventListener('DOMContentLoaded', () => {
    const btnReplay = document.getElementById("mint-replay-btn");
    if (!btnReplay) return;

    // When user clicks MINT on dashboard, they stay here and get a message
    btnReplay.addEventListener('click', () => {
        const steps = [
            {
                texto: "Você pode ver como cada página funciona tocando no botão de interrogação ( ? ).",
                sprite: "greeting",
                acao: "next"
            },
            {
                texto: "Quando você for para outra página, procure o botão de interrogação ( ? ) para aprender como cada página funciona.",
                sprite: "thinking",
                acao: "next"
            },
            {
                texto: "Pronto! Agora é só visitar: Histórico / Carteira Digital / Recarga.",
                sprite: "celebrate",
                acao: "next"
            }
        ];

        const spriteMap = {
            greeting: '../Assets/MINT/placeholder-icon.webp',
            thinking: '#',
            celebrate: '../Assets/MINT/placeholder-icon.webp',
        };

        // engine will render without targets (no highlight)
        window.MintEngine?.startMint?.({
            steps,
            spriteMap,
            force: true,
            replay: true
        });
    });
});

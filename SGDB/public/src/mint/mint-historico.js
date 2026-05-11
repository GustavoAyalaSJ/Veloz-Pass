document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '../Assets/MINT/placeholder-icon.webp',
        pointing: '../Assets/MINT/placeholder-icon.webp',
        thinking: '#',
        celebrate: '../Assets/MINT/placeholder-icon.webp'
    };

    const steps = [
        {
            texto: "Bem-vindo ao Histórico! Vou te mostrar como usar os filtros.",
            sprite: "greeting",
            acao: "next",
            target: "#filtro-tipo"
        },
        {
            texto: "Use o seletor de Tipo para filtrar Carteira Digital ou Recarga.",
            sprite: "pointing",
            acao: "next",
            target: "#filtro-tipo"
        },
        {
            texto: "Agora use o seletor Realizado no para filtrar por PIX, Débito, Crédito e mais.",
            sprite: "pointing",
            acao: "next",
            target: "#filtro-realizado-no"
        },
        {
            texto: "Pronto! Você pode aplicar os filtros e visualizar a lista logo abaixo.",
            sprite: "celebrate",
            acao: "next",
            target: ".tabela-corpoInfo"
        }
    ];

    qBtn.addEventListener('click', () => {
        window.MintEngine?.startMint?.({
            steps,
            spriteMap,
            force: true
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '../Assets/Mint/sprite1.webp',
        'pointing-left': '../Assets/Mint/placeholder-icon.webp',
        'pointing-right': '../Assets/Mint/placeholder-icon.webp',
        'pointing-up': '../Assets/Mint/placeholder-icon.webp',
        'pointing-down': '../Assets/Mint/placeholder-icon.webp',
        happy: '../Assets/Mint/sprite4.webp',
        thinking: '../Assets/Mint/sprite3.webp',
        celebrate: '../Assets/Mint/sprite4.webp'
    };

    const steps = [
        {
            texto: "Bem-vindo ao Histórico! Vou te mostrar como usar os filtros.",
            sprite: "greeting",
            acao: "next",
        },
        {
            texto: "Use o seletor 'Tipo' para filtrar os dados entre Carteira Digital ou Recarga.",
            sprite: "pointing-right",
            acao: "next",
            target: "#filtro-tipo"
        },
        {
            texto: "Use o seletor 'Realizado no' para filtrar transações feitas nos métodos de pagamento.",
            sprite: "pointing-right",
            acao: "next",
            target: "#filtro-realizado-no"
        },
        {
            texto: "Pronto! Você poderá visualizar a lista logo abaixo (caso tenha feito alguma transação).",
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

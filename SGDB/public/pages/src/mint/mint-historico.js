document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '/assets/Mint/sprite1.webp',
        'pointing-left': '/assets/Mint/sprite7.webp',
        'pointing-right': '/assets/Mint/sprite2.webp',
        'pointing-up': '/assets/Mint/sprite9.webp',
        'pointing-down': '/assets/Mint/sprite8.webp',
        introduction: '/assets/Mint/sprite5.webp',
        warning: '/assets/Mint/sprite6.webp',
        happy: '/assets/Mint/sprite4.webp',
        thinking: '/assets/Mint/sprite3.webp',
    };

    const steps = [
        {
            texto: "Bem-vindo ao Histórico! Vou te mostrar como utilizar os filtros para visualizar os processos.",
            sprite: "greeting",
            spriteForMobile: "greeting",
            skippable: false
        },
        {
            texto: "Use o seletor 'Tipo' para filtrar os dados entre Carteira Digital ou Recarga.",
            sprite: "pointing-up",
            spriteForMobile: "#",
            target: "#filtro-tipo",
            skippable: false
        },
        {
            texto: "Use o seletor 'Realizado no' para filtrar transações feitas nos métodos de pagamento disponíveis.",
            sprite: "pointing-up",
            spriteForMobile: "#",
            target: "#filtro-realizado-no",
            skippable: false
        },
        {
            texto: "Para visualizar as transações realizadas, basta olhar na tabela logo abaixo.",
            sprite: "introduction",
            spriteForMobile: "#",
            target: ".tabela-corpoInfo",
            skippable: false
        },
        {
            texto: "É isto sobre a página histórico, espero que eu tenha ajudado a entender como ela funciona.",
            sprite: "happy",
            spriteForMobile: "#",
            skippable: false
        }
    ];

    qBtn.addEventListener('click', () => {
        window.MintEngine?.startMint?.({
            steps,
            spriteMap,
            spriteMapForMobile: spriteMap,
            force: true
        });
    });
});

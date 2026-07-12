document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        test: '/assets/Mint/placeholder-icon.webp',
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
            texto: "O seletor 'Tipo' ajuda a filtrar transações feitas na Carteira Digital ou Recarga.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: "#filtro-tipo",
            skippable: false
        },
        {
            texto: "O seletor 'Realizado no' ajuda a filtrar em qual método de pagamento foi feito.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-down",
            target: "#filtro-realizado-no",
            skippable: false
        },
        {
            texto: "Para visualizar as transações realizadas, basta olhar na tabela logo abaixo.",
            sprite: "introduction",
            spriteForMobile: "pointing-down",
            target: ".tabela-corpoInfo",
            skippable: false
        },
        {
            texto: "Finalizamos a introdução da página Histórico, espero ter ajudado a entender sua funcionalidade.",
            sprite: "greeting",
            spriteForMobile: "happy",
            skippable: false
        },
        {
            texto: "Para retornar ao dashboard, clique na logotipo.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: ".logotipo",
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

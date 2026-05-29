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
            acao: "next",
            skippable=false
        },
        {
            texto: "Use o seletor 'Tipo' para filtrar os dados entre Carteira Digital ou Recarga.",
            sprite: "pointing-up",
            acao: "next",
            target: "#filtro-tipo",
            skippable=false
        },
        {
            texto: "Use o seletor 'Realizado no' para filtrar transações feitas nos métodos de pagamento disponíveis.",
            sprite: "pointing-up",
            acao: "next",
            target: "#filtro-realizado-no",
            skippable=false
        },
        {
            texto: "Para visualizar as transações realizadas, basta olhar na tabela logo abaixo.",
            sprite: "introduction",
            acao: "next",
            target: ".tabela-corpoInfo",
            skippable=false
        },
        {
            texto: "É isto sobre a página histórico, espero que eu tenha ajudado a entender esta interface.",
            sprite: "happy",
            acao: "next",
            skippable=false
        }
    ];

    qBtn.addEventListener('click', () => {
        const stepsComTargetExistente = steps.filter((s) => {
            if (!s.target) return true;
            return !!document.querySelector(s.target);
        });

        window.MintEngine?.startMint?.({
            steps: stepsComTargetExistente,
            spriteMap,
            force: true
        });
    });
});

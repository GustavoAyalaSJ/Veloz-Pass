document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '/Assets/Mint/sprite1.webp',
        'pointing-left': '/Assets/Mint/sprite7.webp',
        'pointing-right': '/Assets/Mint/sprite2.webp',
        'pointing-up': '/Assets/Mint/sprite9.webp',
        'pointing-down': '/Assets/Mint/sprite8.webp',
        introduction: '/Assets/Mint/sprite5.webp',
        warning: '/Assets/Mint/sprite6.webp',
        happy: '/Assets/Mint/sprite4.webp',
        thinking: '/Assets/Mint/sprite3.webp',
    };

    const steps = [
        {
            texto: "Bem-vindo ao Histórico! Vou te mostrar como utilizar os filtros para visualizar os processos.",
            sprite: "greeting",
            acao: "next",
        },
        {
            texto: "Use o seletor 'Tipo' para filtrar os dados entre Carteira Digital ou Recarga.",
            sprite: "pointing-up",
            acao: "next",
            target: "#filtro-tipo"
        },
        {
            texto: "Use o seletor 'Realizado no' para filtrar transações feitas nos métodos de pagamento disponíveis.",
            sprite: "pointing-up",
            acao: "next",
            target: "#filtro-realizado-no"
        },
        {
            texto: "Para visualizar as transações realizadas, basta olhar na tabela logo abaixo.",
            sprite: "introduction",
            acao: "next",
            target: ".tabela-corpoInfo"
        },
        {
            texto: "É isto sobre a página histórico, espero que eu tenha ajudado a entender esta interface.",
            sprite: "happy",
            acao: "next",
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

document.addEventListener('DOMContentLoaded', () => {
    const btnReplay = document.getElementById("mint-replay-btn");
    if (!btnReplay) return;

    const spriteMap = {
        greeting: './assets/Mint/sprite1.webp',
        'pointing-left': './assets/Mint/sprite7.webp',
        'pointing-right': './assets/Mint/sprite2.webp',
        'pointing-up': './assets/Mint/sprite9.webp',
        'pointing-down': './assets/Mint/sprite8.webp',
        introduction: './assets/Mint/sprite5.webp',
        warning: './assets/Mint/sprite6.webp',
        happy: './assets/Mint/sprite4.webp',
        thinking: './assets/Mint/sprite3.webp',
    };

    btnReplay.addEventListener('click', () => {
        const steps = [
            {
                texto: "Olá, seja bem-vindo ao Veloz Pass. Eu me chamo MINT, seu assistente do site.",
                sprite: "greeting",
                acao: "next"
            },
            {
                texto: "Meu objetivo é introduzir a interface de cada página, caso não esteja familiarizado.",
                sprite: "introduction",
                acao: "next"
            },
            {
                texto: "Vamos começar?",
                sprite: "thinking",
                acao: "next"
            },
            {
                texto: "Então, conheça o Dashboard, aqui você tem acesso as principais páginas do site.",
                sprite: "introduction",
                acao: "next",
                target: ".card-container"
            },
            {
                texto: "A carteira digital é onde você pode visualizar os créditos disponíveis, para acessar a página, clique no botão logo abaixo.",
                sprite: "pointing-up",
                acao: "next",
                target: ".card-carteira"
            },
            {
                texto: "A recarga é onde será realizada as recargas do seu cartão de transporte.",
                sprite: "pointing-up",
                acao: "next",
                target: ".card-recarga"
            },
            {
                texto: "O histórico é onde quaisquer transação será registrada, para acessar a página, basta clicar no botão logo abaixo.",
                sprite: "pointing-right",
                acao: "next",
                target: ".card-historico"
            },
            {
                texto: "Além disso, você poderá obter atualizações sobre o valor da passagem do transporte coletivo.",
                sprite: "pointing-up",
                acao: "next",
                target: ".card-info"
            },
            {
                texto: "A interface é bem simples, então você saberá manusear caso necessário.",
                sprite: "introduction",
                acao: "next"
            },
            {
                texto: "Um lembrete, caso você for para outra página, procure um botão de interrogação <b>(?)</b> para aprender como a página funciona por mim.",
                sprite: "warning",
                acao: "next"
            },
            {
                texto: "Aproveite o Veloz Pass, usuário.",
                sprite: "happy",
                acao: "next"
            }
        ];

        window.MintEngine?.startMint?.({
            steps,
            spriteMap,
            force: true,
            replay: true
        });
    });
});

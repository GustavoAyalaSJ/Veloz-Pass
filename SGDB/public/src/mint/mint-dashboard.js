document.addEventListener('DOMContentLoaded', () => {
    const btnReplay = document.getElementById("mint-replay-btn");
    if (!btnReplay) return;

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

    btnReplay.addEventListener('click', () => {
        const steps = [
            {
                texto: "Olá, seja bem-vindo ao Veloz Pass. Eu me chamo MINT, seu assistente do site",
                sprite: "greeting",
                acao: "next"
            },
            {
                texto: "Meu objetivo é introduzir a interface de cada página, caso não esteja familiarizado.",
                sprite: "introduction",
                acao: "next"
            },
            {
                texto: "Vamos começar.",
                sprite: "thinking",
                acao: "next"
            },
            {
                texto: "Conheça o Dashboard, aqui você tem acesso as principais páginas do site.",
                sprite: "introduction",
                acao: "next",
                target: ".card-container"
            },
            {
                texto: "A Carteira Digital, você pode visualizar os créditos disponíveis e acessar a página, clicando no botão logo abaixo.",
                sprite: "pointing-up",
                acao: "next",
                target: ".card-carteira"
            },
            {
                texto: "Recarga onde irá realizar as recargas do seu cartão.",
                sprite: "pointing-up",
                acao: "next",
                target: ".card-recarga"
            },
            {
                texto: "Histórico onde verá suas transações, acessando clicando no botão logo abaixo.",
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

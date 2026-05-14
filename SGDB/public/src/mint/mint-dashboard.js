document.addEventListener('DOMContentLoaded', () => {
    const btnReplay = document.getElementById("mint-replay-btn");
    if (!btnReplay) return;

    const spriteMap = {
        greeting: 'Assets/Mint/sprite1.webp',
        'pointing-left': 'Assets/Mint/placeholder-icon.webp',
        'pointing-right': 'Assets/Mint/sprite2.webp',
        'pointing-up': 'Assets/Mint/placeholder-icon.webp',
        'pointing-down': 'Assets/Mint/placeholder-icon.webp',
        introduction: 'Assets/Mint/placeholder-icon.webp',
        warning: 'Assets/Mint/placeholder-icon.webp',
        happy: 'Assets/Mint/sprite4.webp',
        thinking: 'Assets/Mint/sprite3.webp',
        celebrate: '/Assets/Mint/sprite4.webp'
    };

    btnReplay.addEventListener('click', () => {
        const steps = [
            {
                texto: "Olá, seja bem vindo ao Veloz Pass. Eu me chamo MINT, seu assistente de ajuda no site",
                sprite: "greeting",
                acao: "next"
            },
            {
                texto: "Eu irei introduzir ao dashboard, caso não esteja familiarizado.",
                sprite: "thinking",
                acao: "next"
            },
            {
                texto: "Pelo dashboard, você tem acesso as principais páginas do site.",
                sprite: "introduction",
                acao: "next",
                target: ".card-container"
            },
            {
                texto: "Carteira Digital, você pode visualizar os créditos disponíveis e acessar a página, clicando no botão logo abaixo.",
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
                texto: "Histórico onde verá suas transações aprovadas e recusadas, acessando clicando no botão logo abaixo.",
                sprite: "pointing-right",
                acao: "next",
                target: ".card-historico"
            },
            {
                texto: "Além de obter atualizações sobre o valor da passagem do transporte coletivo.",
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
                texto: "Só um lembrete, quando você for para outra página, procure o botão de interrogação ( ? ) para aprender como cada página funciona por mim.",
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

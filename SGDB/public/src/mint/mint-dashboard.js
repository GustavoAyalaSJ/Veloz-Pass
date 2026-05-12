document.addEventListener('DOMContentLoaded', () => {
    const btnReplay = document.getElementById("mint-replay-btn");
    if (!btnReplay) return;

    const spriteMap = {
        greeting: '../Assets/MINT/placeholder-icon.webp',
        pointing: '../Assets/MINT/placeholder-icon.webp',
        happy: '../Assets/MINT/placeholder-icon.webp',
        thinking: '#',
        celebrate: '../Assets/MINT/placeholder-icon.webp'
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
                sprite: "happy",
                acao: "next",
                target: ".card-container"
            },
            {
                texto: "Carteira Digital, você pode visualizar os créditos disponíveis e acessar a página, clicando no botão logo abaixo.",
                sprite: "pointing",
                acao: "next",
                target: ".card-carteira"
            },
            {
                texto: "Recarga onde irá realizar as recargas do seu cartão.",
                sprite: "pointing",
                acao: "next",
                target: ".card-recarga"
            },
            {
                texto: "Histórico onde verá suas transações aprovadas e recusadas, acessando clicando no botão logo abaixo.",
                sprite: "pointing",
                acao: "next",
                target: ".card-historico"
            },
            {
                texto: "Além de obter atualizações sobre o valor da passagem do transporte coletivo.",
                sprite: "pointing",
                acao: "next",
                target: ".card-info"
            },
            {
                texto: "A interface é bem simples, então você saberá manusear caso necessário.",
                sprite: "pointing",
                acao: "next",
            },
            {
                texto: "Só um lembrete, quando você for para outra página, procure o botão de interrogação ( ? ) para aprender como cada página funciona por mim.",
                sprite: "happy",
                acao: "next"
            },
            {
                texto: "Aproveite o Veloz Pass, usuário.",
                sprite: "happy",
                acao: "next"
            }
        ];

        const spriteMap = {
            greeting: '../Assets/MINT/placeholder-icon.webp',
            thinking: '#',
            celebrate: '../Assets/MINT/placeholder-icon.webp',
        };

        window.MintEngine?.startMint?.({
            steps,
            spriteMap,
            force: true,
            replay: true
        });
    });
});

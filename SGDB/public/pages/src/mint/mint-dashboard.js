document.addEventListener('DOMContentLoaded', () => {
    const btnReplay = document.getElementById("mint-replay-btn");
    const btnOpenPoliticasHeader = document.getElementById('btnOpenPoliticasHeader');
    const btnOpenPoliticasMobile = document.querySelectorAll('.btnOpenPoliticas');
    const nomeUsuario = document.getElementById('nome-logado')?.innerText || 'usuário';

    if (!btnReplay) return;

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

    btnReplay.addEventListener('click', () => {
        const steps = [
            {
                texto: "Olá, seja bem-vindo ao Veloz Pass.",
                sprite: "greeting",
                spriteForMobile: "greeting",
                skippable: false
            },
            {
                texto: "Eu sou MINT, seu assistente com objetivo de introduzir sobre interface de cada página, caso não esteja familiarizado.",
                sprite: "introduction",
                spriteForMobile: "introduction",
                skippable: false
            },
            {
                texto: "Vamos começar?",
                sprite: "thinking",
                spriteForMobile: "thinking",
                skippable: false
            },
            {
                texto: "Conheça o seu Dashboard, aqui você tem acesso as principais páginas do site.",
                sprite: "introduction",
                spriteForMobile: "introduction",
                target: ".card-container",
                skippable: false
            },
            {
                texto: "Nesta parte é a página <b>Carteira Digital</b>, onde você usará como opção de recarga em caso de emergência.",
                sprite: "pointing-down",
                spriteForMobile: "pointing-up",
                target: ".card-carteira",
                skippable: false
            },
            {
                texto: "Para acessar clique no botão azul logo abaixo.",
                sprite: "introduction",
                spriteForMobile: "introduction",
                target: ".btn-carteira",
                skippable: false
            },
            {
                texto: "A página <b>Recarga</b> é onde será realizada as recargas do seu cartão de transporte.",
                sprite: "pointing-down",
                spriteForMobile: "pointing-up",
                target: ".card-recarga",
                skippable: false
            },
            {
                texto: "O <b>histórico</b> é onde quaisquer transação realizada na Carteira Digital ou na Recarga será registrada.",
                sprite: "pointing-down",
                spriteForMobile: "pointing-down",
                target: ".card-historico",
                skippable: false
            },
            {
                texto: "Para acessar clique no botão azul logo abaixo.",
                sprite: "pointing-down",
                spriteForMobile: "pointing-down",
                target: ".btn-historico",
                skippable: false
            },
            {
                texto: "Além disso, você poderá obter atualizações sobre o valor da passagem do transporte coletivo.",
                sprite: "pointing-down",
                spriteForMobile: "pointing-down",
                target: ".card-info",
                skippable: false
            },
            {
                texto: "Lembrete: caso você for para outra página, procure um botão de interrogação <b>(?)</b> para aprender como a página funciona por mim.",
                sprite: "warning",
                spriteForMobile: "warning",
                skippable: false
            },
            {
                texto: "Aproveite o Veloz Passd.",
                sprite: "happy",
                spriteForMobile: "happy",
                skippable: false
            }
        ];

        window.MintEngine?.startMint?.({
            steps,
            spriteMap,
            spriteMapForMobile: spriteMap,
            force: true,
            replay: true
        });
    });
});
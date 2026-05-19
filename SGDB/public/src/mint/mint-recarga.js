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
            texto: "Bem-vindo à Recarga! Vou te mostrar as etapas principais.",
            sprite: "greeting",
            acao: "next",
        },
        {
            texto: "Primeiro, selecione a forma de pagamento nesta seção.",
            sprite: "pointing-up",
            acao: "next",
            target: "#select-pagamento"
        },
        {
            texto: "Então, você irá informar um valor neste campo para realizar uma recarga.",
            sprite: "pointing-up",
            acao: "next",
            target: ".top-group.valor input"
        },
        {
            texto: "Aqui você terá que colocar o número do cartão de passagem para localizar o cartão no sistema da empresa de ônibus",
            sprite: "pointing-down",
            acao: "next",
            target: ".confirm-card"
        },
        {
            texto: "Por fim, avance e conclua a recarga no final da tela.",
            sprite: "pointing-down",
            acao: "next",
            target: ".btn-prosseguir"
        },
        {
            texto: "É isso da página Recarga, para retornar ao dashboard, clique na logotipo do Veloz Pass.",
            sprite: "pointing-up",
            acao: "next",
            target: ".logotipo"
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

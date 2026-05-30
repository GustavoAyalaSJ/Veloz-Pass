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
            texto: "Bem-vindo à Recarga! Vou te mostrar as etapas principais.",
            sprite: "greeting",
            skippable: false
        },
        {
            texto: "Primeiro, selecione a forma de pagamento nesta seção.",
            sprite: "pointing-up",
            target: "#select-pagamento",
            skippable: true
        },
        {
            texto: "Então, você irá informar um valor neste campo para realizar uma recarga.",
            sprite: "pointing-up",
            target: ".top-group.valor input",
            skippable: false
        },
        {
            texto: "Aqui você terá que colocar o número do cartão de passagem para localizar o cartão no sistema da empresa de ônibus",
            sprite: "pointing-down",
            target: ".confirm-card",
            skippable: false
        },
        {
            texto: "Por fim, avance e conclua a recarga no final da tela.",
            sprite: "pointing-down",
            target: ".btn-prosseguir",
            skippable: false
        },
        {
            texto: "É isso da página Recarga, para retornar ao dashboard, clique na logotipo do Veloz Pass.",
            sprite: "pointing-up",
            target: ".logotipo",
            skippable: false
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

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
            texto: "Bem-vindo à Recarga! Vou te mostrar as etapas principais.",
            sprite: "greeting",
            spriteForMobile: "greeting",
            skippable: false
        },
        {
            texto: "Primeiro, clique nesta caixa para visualizar as opções de pagamento.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: "#select-pagamento",
            skippable: true
        },
        {
            texto: "Selecione qualquer método de pagamento disponível para realizar a recarga.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: "#select-pagamento",
            skippable: true
        },
        {
            texto: "Então ao lado, você irá informar um valor para inserir no seu cartão de transporte neste campo.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: ".top-group.valor input",
            skippable: false
        },
        {
            texto: "Neste campo para confirmar qual cartão está realizando a recarga, escreva o número da via do seu cartão neste dois campos.",
            sprite: "pointing-down",
            spriteForMobile: "pointing-down",
            target: ".confirm-card",
            skippable: false
        },
        {
            texto: "Dependendo do método selecionado, coloque as informações bancárias para prosseguir com a recarga (visto no passo 2).",
            sprite: "pointing-down",
            spriteForMobile: "pointing-down",
            skippable: false
        },
        {
            texto: "Quando estiver tudo concluído, clique neste botão para concluir sua recarga.",
            sprite: "pointing-down",
            spriteForMobile: "pointing-down",
            target: ".btn-prosseguir",
            skippable: false
        },
        {
            texto: "Finalizamos a introdução da página Recarga, espero que tenha ajudado.",
            sprite: "greeting",
            spriteForMobile: "greeting",
            skippable: false
        },
        {
            texto: "Para retornar ao dashboard, clique na logotipo do Veloz Pass.",
            sprite: "pointing-up",
            spriteForMobile: "test",
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

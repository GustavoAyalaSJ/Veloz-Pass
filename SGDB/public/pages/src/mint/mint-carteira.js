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
            texto: "Bem-vindo à Carteira Digital! Aqui irei te mostrar como você insere créditos para sua carteira.",
            sprite: "greeting",
            spriteForMobile: "greeting",
            skippable: false
        },
        {
            texto: "Clique em “Inserir crédito” para começar.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: "#btn-inserir-credito",
            skippable: true
        },
        {
            texto: "Isto irá abrir janela flutuante onde você irá escolher um valor existente (ou personalizado) para avançar.",
            sprite: "introduction",
            spriteForMobile: "introduction",
            target: "#modal-valor .modal-box",
            skippable: false
        },
        {
            texto: "Selecione este valor para continuarmos.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: ".opt-valor",
            skippable: true
        },
        {
            texto: "Agora clique no botão 'Próximo'.",
            sprite: "pointing-down",
            spriteForMobile: "pointing-down",
            target: ".btn-proximo",
            skippable: true
        },
        {
            texto: "Após, selecione um método de pagamento.",
            sprite: "introduction",
            spriteForMobile: "introduction",
            target: "#modal-pagamento .modal-box",
            skippable: false
        },
        {
            texto: "Então, na seção abaixo, você colocará suas informações para confirmar a transação para sua Carteira Digital.",
            sprite: "introduction",
            spriteForMobile: "introduction",
            skippable: false
        },
        {
            texto: "Mas não iremos fazer isso, então, clique em cancelar.",
            sprite: "pointing-down",
            spriteForMobile: "pointing-down",
            target: ".btn-cancelar",
            skippable: true
        },
        {
            texto: "Lembrete: Após cada transação na Carteira Digital, você poderá visualiza-las na tabela abaixo.",
            sprite: "warning",
            spriteForMobile: "warning",
            target: ".histórico-valores",
            skippable: false
        },
        {
            texto: "Você pode utilizar dos filtros acima para visualizar suas transações de forma dinâmica.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: ".filtros-container",
            skippable: false
        },
        {
            texto: "Para retornar ao dashboard, clique na logotipo do Veloz Pass.",
            sprite: "pointing-up",
            spriteForMobile: "pointing-up",
            target: ".logotipo",
            skippable: false
        },
        {
            texto: "Então, isso é a página Carteira Digital, espero que tenha ajudado.",
            sprite: "introduction",
            spriteForMobile: "greeting",
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

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
            texto: "Bem-vindo à Carteira Digital! Aqui irei te mostrar como você insere créditos para sua carteira.",
            sprite: "greeting",
            skippable: false
        },
        {
            texto: "Clique em “Inserir crédito” para começar.",
            sprite: "pointing-up",
            target: "#btn-inserir-credito",
            skippable: true
        },
        {
            texto: "Aqui você irá abrir uma janela para escolher um valor existente (ou personalizado) para avançar.",
            sprite: "introduction",
            target: "#modal-valor .modal-box",
            skippable: false
        },
        {
            texto: "Selecione este valor.",
            sprite: "pointing-up",
            target: ".opt-valor",
            skippable: true
        },
        {
            texto: "Agora clique no botão 'Próximo' para continuar.",
            sprite: "pointing-right",
            target: ".btn-proximo",
            skippable: true
        },
        {
            texto: "Após selecionar um valor, você irá escolher um valor selecionando aqui.",
            sprite: "pointing-up",
            target: "#modal-pagamento .modal-box",
            skippable: false
        },
        {
            texto: "Selecione um método de pagamento.",
            sprite: "pointing-up",
            target: "#select-pagamento .modal-box",
            skippable: true
        },
        {
            texto: "Então você colocará suas informações para confirmar a transação para sua Carteira Digital.",
            sprite: "pointing-up",
            target: ".modal-box",
            skippable: false
        },
        {
            texto: "Mas não iremos fazer isso, então, clique em cancelar.",
            sprite: "pointing-down",
            target: ".btn-cancelar",
            skippable: true
        },
        {
            texto: "Lembrete: Após cada transação na Carteira Digital, você poderá visualiza-las na tabela abaixo.",
            sprite: "pointing-right",
            target: ".histórico-valores",
            skippable: false
        },
        {
            texto: "Você pode utilizar dos filtros acima para visualizar suas transações de forma dinâmica.",
            sprite: "pointing-up",
            target: ".filtros-container",
            skippable: false
        },
        {
            texto: "É isso da página Carteira Digital, para retornar ao dashboard, clique na logotipo do Veloz Pass.",
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

document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '/Assets/Mint/sprite1.webp',
        'pointing-left': '/Assets/Mint/sprite7.webp',
        'pointing-right': '/Assets/Mint/sprite2.webp',
        'pointing-up': '/Assets/Mint/placeholder-icon.webp',
        'pointing-down': '/Assets/Mint/placeholder-icon.webp',
        introduction: '/Assets/Mint/sprite5.webp',
        warning: '/Assets/Mint/sprite6.webp',
        happy: '/Assets/Mint/sprite4.webp',
        thinking: '/Assets/Mint/sprite3.webp',
    };

    const steps = [
        {
            texto: "Bem-vindo à Carteira Digital! Aqui irei te mostrar como você inserir créditos através da sua carteira virtual.",
            sprite: "greeting",
            acao: "next"
        },
        {
            texto: "Clique em “Inserir crédito” para começar.",
            sprite: "pointing-up",
            acao: "next",
            target: "#btn-inserir-credito"
        },
        {
            texto: "Aqui você irá abrir uma janela para escolher um valor existente (ou personalizado) para avançar.",
            sprite: "introduction",
            acao: "next",
            target: "#modal-valor .modal-box"
        },
        {
            texto: "Depois selecione o método de pagamento e finalize a transação.",
            sprite: "pointing-up",
            acao: "next",
            target: "#modal-pagamento .modal-box"
        },
        {
            texto: "Entretando sendo uma introdução, clique em cancelar.",
            sprite: "pointing-down",
            acao: "next",
            target: ".btn-cancelar"
        },
        {
            texto: "Após cada transação na Carteira Digital, você poderá visualiza-las na tabela abaixo.",
            sprite: "pointing-down",
            acao: "next",
            target: ".histórico-valores"
        },
        {
            texto: "É utilizar dos filtros acima para visualizar suas transações de forma dinâmica.",
            sprite: "pointing-up",
            acao: "next",
            target: ".filtros-container"
        },
        {
            texto: "É isso da página Carteira Digital, para retornar ao dashboard, clique na logotipo do Veloz Pass.",
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
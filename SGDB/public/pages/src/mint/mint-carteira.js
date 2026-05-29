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
            acao: "next",
            skippable=false
        },
        {
            texto: "Clique em “Inserir crédito” para começar.",
            sprite: "pointing-up",
            acao: "next",
            target: "#btn-inserir-credito",
            skippable=true
        },
        {
            texto: "Aqui você irá abrir uma janela para escolher um valor existente (ou personalizado) para avançar.",
            sprite: "introduction",
            acao: "next",
            target: "#modal-valor .modal-box",
            skippable=false
        },
        {
            texto: "Selecione algum destes valores para continuar.",
            sprite: "pointing-up",
            acao: "next",
            target: ".opt-valor",
            skippable=true
        },
        {
            texto: "Após selecionar um valor, você irá escolher um valor selecionando aqui.",
            sprite: "pointing-up",
            acao: "next",
            target: "#modal-pagamento .modal-box",
            skippable=false
        },
        {
            texto: "Selecione um método de pagamento.",
            sprite: "pointing-up",
            acao: "next",
            target: "#select-pagamento .modal-box",
            skippable=true
        },
        {
            texto: "Então você colocará suas informações para confirmar a transação para sua Carteira Digital.",
            sprite: "pointing-up",
            acao: "next",
            target: ".modal-box",
            skippable=false
        },
        {
            texto: "Mas não iremos fazer isso, então, clique em cancelar.",
            sprite: "pointing-down",
            acao: "next",
            target: ".btn-cancelar",
            skippable=true
        },
        {
            texto: "Lembrete: Após cada transação na Carteira Digital, você poderá visualiza-las na tabela abaixo.",
            sprite: "pointing-right",
            acao: "next",
            target: ".histórico-valores",
            skippable=false
        },
        {
            texto: "Você pode utilizar dos filtros acima para visualizar suas transações de forma dinâmica.",
            sprite: "pointing-up",
            acao: "next",
            target: ".filtros-container",
            skippable=false
        },
        {
            texto: "É isso da página Carteira Digital, para retornar ao dashboard, clique na logotipo do Veloz Pass.",
            sprite: "pointing-up",
            acao: "next",
            target: ".logotipo",
            skippable=false
        }
    ];

    qBtn.addEventListener('click', () => {
        const stepsComTargetExistente = steps.filter((s) => {
            if (!s.target) return true;
            return !!document.querySelector(s.target);
        });

        window.MintEngine?.startMint?.({
            steps: stepsComTargetExistente,
            spriteMap,
            force: true
        });
    });
});

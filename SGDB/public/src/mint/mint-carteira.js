document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '../Assets/MINT/placeholder-icon.webp',
        pointing: '../Assets/MINT/placeholder-icon.webp',
        happy: '../Assets/MINT/placeholder-icon.webp',
        thinking: '#',
        celebrate: '../Assets/MINT/placeholder-icon.webp'
    };

    const steps = [
        {
            texto: "Bem-vindo à Carteira Digital! Vou te mostrar onde ver seu saldo e inserir crédito.",
            sprite: "greeting",
            acao: "next",
            target: "#saldo-usuario"
        },
        {
            texto: "Clique em “Inserir crédito” para adicionar saldo na sua carteira.",
            sprite: "pointing",
            acao: "next",
            target: "#btn-inserir-credito"
        },
        {
            texto: "Na janela seguinte, escolha um valor (ou personalize) e avance.",
            sprite: "pointing",
            acao: "next",
            target: "#modal-valor"
        },
        {
            texto: "Depois selecione o método de pagamento e finalize a transação.",
            sprite: "pointing",
            acao: "next",
            target: "#modal-pagamento"
        },
        {
            texto: "Porém sendo uma introdução, clique em cancelar.",
            sprite: "pointing",
            acao: "next",
            target: ".btn-cancelar"
        },
        {
            texto: "Você pode visualizar suas transação na carteira digtal pela tabela abaixo.",
            sprite: "pointing",
            acao: "next",
            target: ".histórico-valores"
        },
        {
            texto: "É utilizar dos filtros acima para visualizar suas transações de forma dinâmica.",
            sprite: "pointing",
            acao: "next",
            target: ".filtros-container"
        },
        {
            texto: "É isso da página Carteira Digital, para retornar ao dashboard, clique na logotipo do Veloz Pass.",
            sprite: "happy",
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

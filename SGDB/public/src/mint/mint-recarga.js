document.addEventListener('DOMContentLoaded', () => {
    const qBtn = document.querySelector('.bi.bi-question-circle');
    if (!qBtn) return;

    const spriteMap = {
        greeting: '../Assets/MINT/placeholder-icon.webp',
        pointing: '../Assets/MINT/placeholder-icon.webp',
        thinking: '#',
        celebrate: '../Assets/MINT/placeholder-icon.webp'
    };

    const steps = [
        {
            texto: "Bem-vindo à Recarga! Vou te mostrar as etapas principais.",
            sprite: "greeting",
            acao: "next",
            target: ".container-recarga"
        },
        {
            texto: "Primeiro selecione a forma de pagamento em “Selecione”.",
            sprite: "pointing",
            acao: "next",
            target: "#select-pagamento"
        },
        {
            texto: "Depois informe o valor no campo de valor.",
            sprite: "pointing",
            acao: "next",
            target: ".top-group.valor input"
        },
        {
            texto: "Por fim, avance e conclua a recarga no final da tela.",
            sprite: "celebrate",
            acao: "next",
            target: ".btn-prosseguir"
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

document.addEventListener('DOMContentLoaded', () => {

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");

    /* Comentário JS: JS gerar uma tabela:
    <!-- Container onde terá as informações de:
        - Recarga: Informando os valores que foram avaliados corretamente para recarga do cartão.
        - Carteira Digital: Colocar com um fundo vermelho translúcido (recusado), amarelo translúcido (em revisão) e verde translúcido (confirmado). 
    Ele vai ser gerado quando o usuário realizar algumas das informações. 
    --> \
    */

    if (exitLink) {
        exitLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutModal.style.display = "flex";
        });
    }

    window.fecharModal = function () {
        logoutModal.style.display = "none";
    };

    window.confirmarLogout = function () {

        localStorage.removeItem('nomeUsuario');
        sessionStorage.clear();

        window.location.href = '/introduction';
    };
});
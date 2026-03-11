document.addEventListener('DOMContentLoaded', () => {

    /* Comentário em breve. */

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");

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

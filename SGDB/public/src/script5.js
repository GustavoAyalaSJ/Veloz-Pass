document.addEventListener('DOMContentLoaded', () => {

    /* Comentário em breve. */

    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");
    const selectElement = document.getElementById('select-pagamento');
    const wrapper = selectElement.parentElement;

    selectElement.addEventListener('click', () => {
        wrapper.classList.toggle('active');
    });

    selectElement.addEventListener('blur', () => {
        wrapper.classList.remove('active');
    });


    selectElement.addEventListener('change', () => {
        wrapper.classList.remove('active');
    });

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

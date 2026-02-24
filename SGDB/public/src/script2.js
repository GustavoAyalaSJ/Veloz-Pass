document.addEventListener('DOMContentLoaded', () => {
    const spanNome = document.getElementById('nome-logado');
    const changeButton = document.getElementById("change-button");
    const body = document.body;
    const exitLink = document.querySelector('.exit-link');
    const logoutModal = document.getElementById("logoutModal");

    function atualizarNome() {
        const nomeSalvo = localStorage.getItem('nomeUsuario');
        console.log("Nome salvo:", nomeSalvo);

        if (nomeSalvo && spanNome) {
            const partes = nomeSalvo.trim().split(/\s+/);
            const primeiroNome = partes[0];
            const ultimoNome = partes.length > 1 ? partes[partes.length - 1] : "";

            spanNome.textContent = `${primeiroNome} ${ultimoNome}`.trim();
        }
    }

    atualizarNome();

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

    if (changeButton) {
        const currentTheme = localStorage.getItem("theme");

        if (currentTheme === "dark") {
            body.classList.add("dark-mode");
            changeButton.innerHTML = '<i class="bi bi-moon-fill"></i>';
        }

        changeButton.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");

            changeButton.innerHTML = isDark ?
                '<i class="bi bi-moon-fill"></i>' :
                '<i class="bi bi-brightness-high-fill"></i>';
        });
    }
});
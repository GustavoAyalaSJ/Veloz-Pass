document.addEventListener('DOMContentLoaded', () => {
    const spanNome = document.getElementById('nome-logado');
    const changeButton = document.getElementById("change-button");
    const body = document.body;
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const exitLink = document.querySelector('.exit-link');

    function atualizarNome() {
        const nomeSalvo = localStorage.getItem('nomeUsuario');
        
        if (nomeSalvo && spanNome) {
            const partes = nomeSalvo.trim().split(/\s+/);
            const primeiroNome = partes[0];
            const ultimoNome = partes.length > 1 ? partes[partes.length - 1] : "";
            
            spanNome.textContent = `${primeiroNome} ${ultimoNome}`.trim();
        }
    }

    atualizarNome();

    if (exitLink) {
        exitLink.addEventListener('click', () => {
            localStorage.removeItem('nomeUsuario');
        });
    }

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

    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('active');
        });
    }
});
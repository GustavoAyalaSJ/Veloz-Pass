(function () {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.documentElement.classList.add("dark-mode");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const changeButton = document.getElementById("change-button");
    if (!changeButton) return;

    const updateIcon = () => {
        const isDark = document.documentElement.classList.contains("dark-mode");
        changeButton.innerHTML = isDark
            ? '<i class="bi bi-moon-fill"></i>'
            : '<i class="bi bi-brightness-high-fill"></i>';
    };

    updateIcon();

    changeButton.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark-mode");
        const isDark = document.documentElement.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateIcon();
    });
});
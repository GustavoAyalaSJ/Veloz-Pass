document.addEventListener('DOMContentLoaded', () => {
    const listbutton = document.getElementById('list-button');
    const contentDropdown = document.getElementById('content-dropdown');

    listbutton.addEventListener('click', (event) => {
        event.stopPropagation();

        contentDropdown.classList.toggle('active');
    });

    window.addEventListener('click', (event) => {
        if (contentDropdown.classList.contains('active')) {
            if (!contentDropdown.contains(event.target)) {
                contentDropdown.classList.remove('active');
            }
        }
    });
});

const changeButton = document.getElementById("change-button");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
}

changeButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        changeButton.innerHTML = '<i class="bi bi-moon-fill"></i>';
    } else {
        localStorage.setItem("theme", "light");
        changeButton.innerHTML = '<i class="bi bi-brightness-high-fill"></i>';
    }
});
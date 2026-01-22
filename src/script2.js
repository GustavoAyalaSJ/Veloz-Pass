document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    profileButton.addEventListener('click', (event) => {
        event.stopPropagation();

        profileDropdown.classList.toggle('active');
    });

    window.addEventListener('click', (event) => {
        if (profileDropdown.classList.contains('active')) {
            if (!profileDropdown.contains(event.target)) {
                profileDropdown.classList.remove('active');
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
        changeButton.innerHTML = '<i class="bi bi-moon"></i>';
    }
});

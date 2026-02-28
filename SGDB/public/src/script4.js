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



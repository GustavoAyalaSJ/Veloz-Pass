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
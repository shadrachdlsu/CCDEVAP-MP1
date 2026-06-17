// elements
const themeToggleBtn = document.getElementById('themeToggle');
const bodyElement = document.body;

// dark mode toggle
themeToggleBtn.addEventListener('click', function() {
    bodyElement.classList.toggle('dark-mode');
});

// LOGOUT
const logoutBtn = document.querySelector('.logout-btn');

logoutBtn.addEventListener('click', function() {
    
    const confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        window.location.href = 'login.html'; 
    }
});

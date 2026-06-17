// Persistent dark mode handler
(function () {
  const THEME_KEY = "docuflow-theme";

  function applyTheme(isDarkMode) {
    if (isDarkMode) {
      document.body.classList.add("night-mode");
    } else {
      document.body.classList.remove("night-mode");
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const isDarkMode = savedTheme === "dark";
    applyTheme(isDarkMode);
  }

  function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("night-mode");
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }

  function attachThemeToggle() {
    const themeButtons = document.querySelectorAll("#themeToggle");
    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        toggleTheme();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initTheme();
      attachThemeToggle();
    });
  } else {
    initTheme();
    attachThemeToggle();
  }

  window.toggleTheme = toggleTheme;
})();

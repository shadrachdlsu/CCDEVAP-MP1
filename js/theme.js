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
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    const isDarkMode = savedTheme === "dark";
    applyTheme(isDarkMode);
  }

  function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("night-mode");
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }

  // Initialize theme on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  // Make toggleTheme globally available
  window.toggleTheme = toggleTheme;
})();

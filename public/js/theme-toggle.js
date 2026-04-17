window.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");

  const themes = ["variant-1", "variant-2", "variant-3", "variant-4", "variant-5"];
  let currentThemeIndex = 0;

  // Check if the theme is saved in localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && themes.includes(savedTheme)) {
    // If a theme is saved, apply it immediately
    root.classList.add(savedTheme);
    currentThemeIndex = themes.indexOf(savedTheme);
  } else {
    // If no theme is saved, apply the default one (variant-1)
    root.classList.add(themes[currentThemeIndex]);
  }

  themeButton.addEventListener("click", function () {
    // Remove the current theme
    root.classList.remove(themes[currentThemeIndex]);

    // Change to the next theme
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;

    // Apply the new theme
    root.classList.add(themes[currentThemeIndex]);

    // Save the new theme to localStorage
    localStorage.setItem("theme", themes[currentThemeIndex]);
  });
});

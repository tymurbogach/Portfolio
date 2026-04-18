window.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");

  const themes = [
    "variant-1", "variant-2", "variant-3",
    "variant-4", "variant-5", "variant-6", "variant-7",
  ];
  let currentThemeIndex = 0;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && themes.includes(savedTheme)) {
    root.className = savedTheme;
    currentThemeIndex = themes.indexOf(savedTheme);
  } else {
    root.className = themes[currentThemeIndex];
  }

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      root.classList.remove(themes[currentThemeIndex]);
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      root.classList.add(themes[currentThemeIndex]);
      localStorage.setItem("theme", themes[currentThemeIndex]);
    });
  }
});

// this configuration use for theme dark and light for tailwindcss
// you can use this for personal project or others without libs download

export const setDarkMode = (toggle) => {
  if (localStorage.getItem("color-theme")) {
    if (toggle) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
    }
    // if NOT set via local storage previously
  } else {
    if (document.documentElement.classList.contains("light")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    }
  }
};

export const hexToRgb = (hex) => {
  if (!hex) return "79, 70, 229";
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
};

export const setPrimaryColor = (hex) => {
  if (!hex) return;
  const rgb = hexToRgb(hex);
  document.documentElement.style.setProperty("--color-primary", hex);
  document.documentElement.style.setProperty("--color-primary-rgb", rgb);
  localStorage.setItem("primary-color", hex);
};

export const loadPrimaryColor = () => {
  const saved = localStorage.getItem("primary-color") || "#4F46E5";
  setPrimaryColor(saved);
  return saved;
};

export const loadDarkMode = () => {
  const isDark = localStorage.getItem("color-theme") == "dark" ? true : false;
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  return isDark;
};

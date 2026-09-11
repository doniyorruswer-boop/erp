// Theme dark and light mode helper for tailwindcss
import { THEME_COLORS } from "@/constants/colors.constants";
import { STORAGE_KEYS } from "@/constants/storage.constants";

export const setDarkMode = (toggle) => {
  if (localStorage.getItem(STORAGE_KEYS.COLOR_THEME)) {
    if (toggle) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(STORAGE_KEYS.COLOR_THEME, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(STORAGE_KEYS.COLOR_THEME, "light");
    }
  } else {
    if (document.documentElement.classList.contains("light")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(STORAGE_KEYS.COLOR_THEME, "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem(STORAGE_KEYS.COLOR_THEME, "dark");
    }
  }
};

export const hexToRgb = (hex) => {
  if (!hex) return THEME_COLORS.PRIMARY_RGB;
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
};

export const setPrimaryColor = (hex) => {
  if (!hex) return;
  const rgb = hexToRgb(hex);
  document.documentElement.style.setProperty("--color-primary", hex);
  document.documentElement.style.setProperty("--color-primary-rgb", rgb);
  localStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, hex);
};

export const loadPrimaryColor = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR) || THEME_COLORS.PRIMARY;
  setPrimaryColor(saved);
  return saved;
};

export const loadDarkMode = () => {
  const isDark = localStorage.getItem(STORAGE_KEYS.COLOR_THEME) === "dark";
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  return isDark;
};

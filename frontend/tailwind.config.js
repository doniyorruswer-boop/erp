module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    // "./node_modules/flowbite/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      width: {
        sidebar: "280px",
        search: "400px",
      },
      rotate: {
        137: "137deg",
      },
      backgroundColor: {
        packed: "#EEF6FF",
        // packed: "#f2f2f2", you can use this color if you like
      },
      colors: {
        primary: "rgba(var(--color-primary-rgb, 79, 70, 229), <alpha-value>)",
      },
      fontFamily: {
        lexend: "'Lexend', sans-serif",
      },
    },
  },
  plugins: [],
};

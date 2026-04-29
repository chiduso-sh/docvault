/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F6E56",
          light: "#E1F5EE",
          dark: "#085041",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

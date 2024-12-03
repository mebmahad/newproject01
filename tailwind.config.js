/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#4A90E2",
        secondary: "#50E3C2",
        danger: "#E94E77",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0A2540",
          navy: "#0A2540",
          light: "#1A3E66",
        },
        secondary: {
          DEFAULT: "#2C5234",
          forest: "#2C5234",
          light: "#3E7449",
        },
        accent: {
          DEFAULT: "#D4A373",
          amber: "#D4A373",
          light: "#E1BE9A",
        },
        background: {
          DEFAULT: "#FAF8F5",
          cream: "#FAF8F5",
          dark: "#0F172A", // Slate-900 for dark mode background
        },
        border: {
          DEFAULT: "#E5E1D8",
          sand: "#E5E1D8",
        },
      },
      fontFamily: {
        serif: ["System", "serif"],
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
}

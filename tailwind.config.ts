import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gold: {
          100: "#fef9e7",
          200: "#fdedc2",
          300: "#fbe08a",
          400: "#f8cd4d",
          500: "#f5b921",
          600: "#d99a12",
          700: "#b47610",
        },
        ivory: "#FFFEF9",
        sand: "#FAF7F0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["'Amiri'", "'Scheherazade New'", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(6,78,59,.08), 0 8px 24px -12px rgba(6,78,59,.18)",
        lift: "0 12px 32px -12px rgba(6,78,59,.28)",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};

export default config;

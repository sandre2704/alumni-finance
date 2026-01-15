/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#2424eb",
        "primary-dark": "#1b1bbd", // Added from Reports/Login
        "background-light": "#f6f6f8",
        "background-dark": "#111122",
        "card-dark": "#1e1e2f",
        "card-border": "#2d2d44",
        "surface-dark": "#1a1a2e", // Added from Login
        "surface-light": "#ffffff", // Added from Transactions
        "surface-border": "#333366", // Added from Input Modal
        "input-dark": "#1a1a33", // Added from Login
        "border-dark": "#333366", // Added from Login/Reports
        "text-secondary": "#9292c8", // Added from Reports
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

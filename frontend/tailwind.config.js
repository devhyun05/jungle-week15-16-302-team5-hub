/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: "#0f766e",
        "mint-dark": "#115e59",
        "mint-soft": "#e6f4f1",
        page: "#faf7ef",
        ink: "#243044",
        muted: "#4f5d6d",
        line: "#e1d8c8",
        lavender: "#4f46e5",
        "lavender-soft": "#eef2ff",
        coral: "#b45309",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(36, 48, 68, 0.06)",
        card: "0 18px 44px rgba(36, 48, 68, 0.12)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "sans-serif"],
      },
    },
  },
  plugins: [],
};

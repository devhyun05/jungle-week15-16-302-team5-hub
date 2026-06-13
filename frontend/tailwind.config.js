/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: "#11b89a",
        "mint-dark": "#0f766e",
        "mint-soft": "#e8f7f3",
        page: "#f5f6f8",
        ink: "#202124",
        muted: "#667085",
        line: "#e5e8eb",
        lavender: "#0f766e",
        "lavender-soft": "#e8f7f3",
        coral: "#d9480f",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(16, 24, 40, 0.04)",
        card: "0 10px 24px rgba(16, 24, 40, 0.08)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "sans-serif"],
      },
    },
  },
  plugins: [],
};

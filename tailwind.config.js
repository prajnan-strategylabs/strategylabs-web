/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Strategy Labs brand
        bg: {
          DEFAULT: "#0a0e1a",       // deep navy
          card:    "#0f1525",
          elev:    "#141b2e",
        },
        ink: {
          DEFAULT: "#e6e9f0",
          muted:   "#8b94a8",
          subtle:  "#5a6378",
        },
        accent: {
          DEFAULT: "#22d3aa",        // mint green — positive PnL
          warm:    "#f59e0b",
          danger:  "#ef4444",
        },
        line: "#1e2740",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%":   { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

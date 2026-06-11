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
        // Hex mirrors of the CSS tokens in index.css (Tailwind v3 needs plain
        // colors for opacity modifiers like bg-card/45). Keep both in sync.
        surface: {
          0: "#070b14",
          1: "#0d1322",
          2: "#131a2c",
          3: "#1a2238",
        },
        // Legacy names — alias onto the token system
        bg: {
          DEFAULT: "#070b14",
          card:    "#0d1322",
          elev:    "#131a2c",
        },
        ink: {
          DEFAULT: "#e8ecf5",
          muted:   "#a5a9b2",   // ink-70 over surface-0
          subtle:  "#6c7079",   // ink-45 over surface-0
          faint:   "#3f434c",   // ink-25 over surface-0
        },
        accent: {
          DEFAULT: "#2ee6b8",
          pressed: "#26c9a1",
          soft:    "rgba(46, 230, 184, 0.12)",
          warm:    "#ffb02e",
          danger:  "#ff5c7a",
        },
        positive: "#2ee6b8",
        negative: {
          DEFAULT: "#ff5c7a",
          soft:    "rgba(255, 92, 122, 0.12)",
        },
        warning: {
          DEFAULT: "#ffb02e",
          soft:    "rgba(255, 176, 46, 0.10)",
        },
        line: {
          DEFAULT: "#1d2438",
          strong:  "#29314d",
        },
      },
      spacing: {
        13: "3.25rem",  // 52px — lg control height, used as h-13 across the app
      },
      borderRadius: {
        sm2: "var(--r-sm)",
        md2: "var(--r-md)",
        lg2: "var(--r-lg)",
        xl2: "var(--r-xl)",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      // Type scale (DESIGN.md §3) — usage: text-display, text-title-1, …
      fontSize: {
        display:    ["40px", { lineHeight: "44px", fontWeight: "800", letterSpacing: "-0.03em" }],
        "title-1":  ["28px", { lineHeight: "32px", fontWeight: "800", letterSpacing: "-0.02em" }],
        "title-2":  ["20px", { lineHeight: "24px", fontWeight: "700", letterSpacing: "-0.01em" }],
        headline:   ["16px", { lineHeight: "22px", fontWeight: "650" }],
        body:       ["14.5px", { lineHeight: "21px", fontWeight: "450" }],
        footnote:   ["12.5px", { lineHeight: "17px", fontWeight: "500" }],
        caption:    ["11px", { lineHeight: "14px", fontWeight: "600", letterSpacing: "0.06em" }],
        stat:       ["22px", { lineHeight: "26px", fontWeight: "750", letterSpacing: "-0.01em" }],
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        spring: "cubic-bezier(0.34, 1.3, 0.64, 1)",
      },
      transitionDuration: {
        press: "120ms",
        state: "200ms",
        enter: "280ms",
        sheet: "360ms",
      },
      animation: {
        "fade-in": "fadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%":   { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

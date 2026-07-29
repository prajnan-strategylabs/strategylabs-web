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
          0: "#0e0f12",
          1: "#16181d",
          2: "#1e2128",
          3: "#282c35",
        },
        // Legacy names — alias onto the token system
        bg: {
          DEFAULT: "#0e0f12",
          card:    "#16181d",
          elev:    "#1e2128",
        },
        ink: {
          DEFAULT: "#f0efec",
          muted:   "#adaca8",   // ink-70 over surface-0
          subtle:  "#918f8b",   // ink-45 over surface-0 — AA at 10-11px
          faint:   "#514f4c",   // ink-25 over surface-0
        },
        // Brass is the brand. Green/red mean money and nothing else — see the
        // note in index.css for why these must not share a hue.
        accent: {
          DEFAULT: "#d9a83c",
          pressed: "#c2922f",
          soft:    "rgba(217, 168, 60, 0.14)",
          warm:    "#d9a83c",
          danger:  "#f2555a",
        },
        positive: "#3ecf8e",
        negative: {
          DEFAULT: "#f2555a",
          soft:    "rgba(242, 85, 90, 0.14)",
        },
        warning: {
          DEFAULT: "#d9a83c",
          soft:    "rgba(217, 168, 60, 0.12)",
        },
        line: {
          DEFAULT: "#23262e",
          strong:  "#333845",
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
        // Headings and section titles. Deliberately NOT used for numbers —
        // DESIGN.md §1 rule 2 requires data keep one tabular face.
        display: ["Instrument Serif", "ui-serif", "Georgia", "serif"],
      },
      // Type scale (DESIGN.md §3) — usage: text-display, text-title-1, …
      // Measured before this change: 51 arbitrary text-[Npx] values against 2
      // uses of the scale, 11 distinct sizes (7.5px to 48px), 76% of text at
      // weight 700-800. Uniform emphasis is the same as none — that, not the
      // palette, is why the UI read as characterless.
      //
      // The scale now carries the hierarchy so components don't have to invent
      // it: one large moment per screen, a real gap down to body, and captions
      // that stop shouting. Weights drop because size is doing the work.
      fontSize: {
        display:    ["52px", { lineHeight: "52px", fontWeight: "500", letterSpacing: "-0.035em" }],
        "title-1":  ["30px", { lineHeight: "34px", fontWeight: "400", letterSpacing: "-0.015em" }],
        "title-2":  ["21px", { lineHeight: "26px", fontWeight: "400", letterSpacing: "-0.01em" }],
        headline:   ["16px", { lineHeight: "22px", fontWeight: "600" }],
        body:       ["14.5px", { lineHeight: "21px", fontWeight: "440" }],
        footnote:   ["12.5px", { lineHeight: "17px", fontWeight: "440" }],
        // 11px floor. Anything below was failing AA and is unreadable on a
        // phone; the app previously went down to 7.5px.
        caption:    ["11px", { lineHeight: "14px", fontWeight: "520", letterSpacing: "0.05em" }],
        stat:       ["22px", { lineHeight: "26px", fontWeight: "500", letterSpacing: "-0.01em" }],
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

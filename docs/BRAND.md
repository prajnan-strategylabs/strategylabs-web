# Brand Guidelines

> Read this before writing any user-facing copy or UI.

---

## Name + domain

- **Brand:** Strategy Labs (always two words, capital S, capital L)
- **Domain:** `strategylabs.trade`
- **Email:** `hello@strategylabs.trade`
- **Handles:** `@strategylabs` (Twitter/X, Instagram, TikTok, YouTube, Reddit)
- **GitHub org:** `strategylabs`

---

## Tagline + core message

**Core message:**
*"Test any trading idea in 30 seconds. AI converts your words into a strategy. Years of data. Robustness tests included. Live signals if it works."*

**Tagline candidates:**
- "Where strategies are tested."
- "Your edge, verified."
- "Backtests for everyone."
- "Test it. Trade it. Prove it."

---

## Voice + tone

| | Like this | Not like this |
|---|---|---|
| Mood | Precise, calm, confident | Pumped, urgent, hype-y |
| Style | Linear, geometric, mathematical | Organic, illustrative, cartoony |
| Vibe | Bloomberg meets Linear | FTX meets Robinhood |

### Words we use

✅ Strategy testing
✅ Historical performance
✅ Backtested signals
✅ Trading research
✅ Educational tool
✅ Signal alerts
✅ For informational purposes
✅ Walk-forward validated
✅ Audit-grade transparency

### Words we NEVER use

❌ Make money
❌ Guaranteed returns
❌ Risk-free
❌ Get rich
❌ Beat the market
❌ Financial advice
❌ Investment opportunity
❌ Profitable
❌ "To the moon" / 🚀

### Voice examples

| Bad copy | Good copy |
|---|---|
| "Make 30% returns with our proven crypto strategy!" | "Our showcase strategy historically returned 31% annualized in backtests." |
| "Get rich-trading signals!" | "Receive real-time strategy alerts." |
| "Beat the market with AI!" | "Build, test, and validate strategies with AI." |
| "Risk-free profits!" | "Walk-forward tested for robustness." |

---

## Visual identity

### Colors (Tailwind tokens)

```js
bg: {
  DEFAULT: "#0a0e1a",       // deep navy — primary background
  card:    "#0f1525",       // card surfaces
  elev:    "#141b2e",       // elevated buttons/inputs
},
ink: {
  DEFAULT: "#e6e9f0",       // primary text
  muted:   "#8b94a8",       // secondary text
  subtle:  "#5a6378",       // tertiary text, captions
},
accent: {
  DEFAULT: "#22d3aa",       // mint green — positive PnL, primary CTA
  warm:    "#f59e0b",       // warnings (use sparingly)
  danger:  "#ef4444",       // errors only
},
line: "#1e2740",            // borders, dividers
```

**Rule:** mint is reserved for positive/value moments (CTAs, success states, positive numbers). Don't use it as decoration.

### Typography

- **Body:** Inter (variable weight, 400-800)
- **Numbers / code:** JetBrains Mono (tabular figures matter for financial UI)
- **Headings:** Inter, weight 600-700, tight tracking (`tracking-tight`)

### Logo

- **Mark:** Ascending chart line with V dip (price retest) and spark at peak
- **Symbolism:** The V represents the retest pattern (foundation of S5 strategy); the spark = discovery/validation
- **Color:** Always mint (#22d3aa) on dark background
- **Component:** `<LogoMark size={32} className="text-accent" />` from `src/components/Logo.tsx`
- **File:** `public/logo.svg` (full) and `public/favicon.svg` (optimized 32×32)

### Layout

- Container max-width: 1152px (`max-w-6xl` / `container-app`)
- Section vertical padding: 96px (`py-24`)
- Border radius: 8px buttons (`rounded-lg`), 12px cards (`rounded-xl`), full for pills
- Card shadow: `shadow-[0_4px_30px_rgba(0,0,0,0.3)]` (custom — heavier than default)

### Animation

- Use sparingly. Subtle fade-in / slide-up on initial page load (`animate-fade-in`, `animate-slide-up` defined in `tailwind.config.js`)
- Stagger by 100-200ms for cascading sections
- Hover: scale 1.02 on primary buttons, translate-y-1 on cards
- No bouncy/elastic animations — keep it precise

### Iconography

- **Library:** lucide-react (default for all UI icons)
- **Size:** 16px (`h-4 w-4`) inline, 20-24px (`h-5/6 w-5/6`) standalone, 32px (`h-8 w-8`) hero
- **Stroke weight:** 2 (lucide default)
- **Brand icons** (Twitter/X, GitHub): inline SVG only — lucide removed them

---

## Compliance copy (must appear)

These exact patterns appear on the live product. Don't dilute them.

### Every screen footer
> Educational tool only. Past performance does not predict future results.

### First-launch modal (when we build it)
> I understand cryptocurrency trading involves substantial risk including possible loss of principal.
> [ Checkbox required to proceed ]

### Every signal alert
> This is not financial advice. Trade at your own risk.

### Risk disclosure block (footer of every page)
> **Not financial advice.** Strategy Labs is an educational and research tool. We do not provide investment advice. Past performance shown in backtests does not predict or guarantee future results. Trading involves substantial risk of loss, including the possibility of losing your entire investment.

---

## Multi-asset messaging

**Even though crypto is the launch asset class, marketing should never say "crypto signals" or "crypto trading bot."**

| ❌ Avoid | ✅ Use instead |
|---|---|
| "crypto signals" | "trading signals" or "strategy signals" |
| "crypto trading bot" | "strategy automation" or "auto-execution" |
| "crypto backtesting" | "strategy backtesting" |
| "crypto strategy lab" | "strategy lab" |
| "I built a crypto bot" | "I built a strategy testing platform" |
| "BTC + ETH only" | "across asset classes" (once we expand) |

The crypto angle stays in the **examples** — never in the **positioning**.

---

## Brand inspiration

These products nail the vibe we want:
- **Linear** — design language, color discipline
- **Stripe** — trust + clarity
- **Notion** — quiet sophistication
- **TradingView** — chart UX
- **Cursor** — AI integration UX
- **Vercel** — terminal-like density without being intimidating

What we explicitly are NOT trying to be:
- Robinhood (too gamified)
- Crypto.com (too hype)
- WallStreetBets (too irreverent)
- Bloomberg (too institutional/cold)

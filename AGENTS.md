# Agent Context — Strategy Labs

> **You are an AI agent picking this project up.** Read this entire file before touching code. Then read `docs/` for deeper context.

---

## What this project is (30-second version)

**Strategy Labs** is a web + mobile app that lets retail traders **describe a trading strategy in plain English, get it AI-translated into executable rules, then backtest it against years of real market data — all in 30 seconds.** If the strategy survives, they can subscribe to live signals or auto-execute via their exchange API.

The killer differentiator: **transparency**. Every strategy on the platform shows full historical performance, walk-forward validation, Monte Carlo, and slippage stress tests. No black-box "trust me bro" signal services.

The foundation: a **proven trading strategy** (8-year backtest: $5K → $44K, 8.57% max DD, walk-forward validated, +91% YTD 2026). That's the first showcase strategy on the lab — and proof the platform works.

**Domain:** strategylabs.trade (purchased, on `.trade` TLD)
**Brand:** Strategy Labs (intentionally generic — multi-asset future: crypto first, then stocks/gold/forex)

---

## Quick-start for an AI agent

### To understand the BUSINESS
Read in this order:
1. `../crypto-bot/APP_BUILD_PLAN.md` — architecture + monetization
2. `../crypto-bot/MARKETING_ROADMAP.md` — positioning + go-to-market
3. `../crypto-bot/LOGO_BRIEF.md` — brand identity
4. `docs/STATE.md` — exactly where we are right now

### To understand the TRADING STRATEGY (the foundation)
Read in this order:
1. `docs/STRATEGY_BACKGROUND.md` — the v22 strategy summary
2. `../crypto-bot/swingbot/strategy_3/backtest.py` — the actual engine
3. `../crypto-bot/swingbot/strategy_3/config.py` — current production config

### To understand the CODE
Read in this order:
1. `docs/ARCHITECTURE.md` — tech stack + folder structure
2. `docs/DECISIONS.md` — why we chose what we chose
3. `docs/BRAND.md` — visual/voice guidelines for any UI work
4. `package.json` — actual dependencies
5. `src/App.tsx` — entry point

---

## Hard rules (don't break these)

### Compliance (legal exposure if violated)
- **Never** call the product "financial advice" — it's an *educational tool*
- **Never** show specific future-return numbers — only historical backtests
- **Never** custody user funds — users execute on their own exchanges
- **Never** auto-execute trades without explicit user consent per session
- **Every screen** must have the "Not financial advice" footer

### Forbidden words in copy/UI
❌ "Make money", "Guaranteed", "Risk-free", "Get rich", "Beat the market", "Financial advice", "Investment opportunity", "Profitable"

✅ "Strategy testing", "Historical performance", "Backtested signals", "Trading research", "Educational tool", "Signal alerts"

### Security
- **Never** put `SUPABASE_SECRET_KEY` in any `VITE_*` env var (would leak to browser)
- **Never** disable Row Level Security on tables containing user data
- **Never** add tables without RLS policies
- **Never** commit `.env.local` (already in `.gitignore`)

### Technical
- Use **Vite** (not Next.js) — see `docs/DECISIONS.md` for why
- Use **Tailwind v3** (not v4 yet — v4 still has rough edges)
- Use **Supabase** (not Firebase) — Postgres + RLS is the right model
- Use the **new Supabase key format** (`sb_publishable_...`), not the legacy `anon` JWT
- Brand icons (Twitter, GitHub) — use inline SVG, lucide-react removed them

---

## Current state (snapshot)

**As of last AI session:** see `docs/STATE.md` for the live version.

- ✅ Landing page (hero, proof, how-it-works, pricing, footer) built and working locally
- ✅ Brand mark + favicon (SVG)
- ✅ Supabase schema written (`supabase/migrations/001_initial_schema.sql`)
- ✅ Waitlist form wired with graceful fallback if Supabase env vars missing
- ⏸ User needs to: create Supabase project + run migration + fill `.env.local`
- 🚧 Not done: Vercel deployment, auth, AI Strategy Lab, Stripe, mobile wrap

---

## How to continue safely

If you're picking this up fresh:

1. **Check `docs/STATE.md`** for the latest "what's done, what's next"
2. **Run `npm install && npm run dev`** — confirm landing page renders at `http://localhost:5173`
3. **Run `npm run build`** before committing anything — catches TypeScript errors that dev mode hides
4. **Ask the user** which roadmap item to work on next before assuming — they have product context you don't
5. **Update `docs/STATE.md`** when you finish meaningful work
6. **Update `docs/DECISIONS.md`** when you make non-obvious choices

---

## File map (most important entries)

```
strategylabs/
├── AGENTS.md                              ← YOU ARE HERE
├── README.md                              ← (TODO: write a human-facing version)
├── SUPABASE_SETUP.md                      ← Step-by-step DB setup
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example                           ← Template for env vars
├── .env.local                             ← Real values (gitignored)
│
├── docs/                                  ← Detailed agent context
│   ├── STATE.md                           ← What's done / in-progress / next
│   ├── ARCHITECTURE.md                    ← Tech stack + folder structure
│   ├── DECISIONS.md                       ← Why we chose what we chose
│   ├── BRAND.md                           ← Voice, colors, naming rules
│   └── STRATEGY_BACKGROUND.md             ← The trading strategy we sell
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql         ← All tables + RLS policies
│
├── public/
│   ├── favicon.svg                        ← 32×32 brand mark
│   └── logo.svg                           ← Full brand mark
│
└── src/
    ├── main.tsx
    ├── App.tsx                            ← Page composition
    ├── index.css                          ← Tailwind + globals
    ├── lib/
    │   ├── supabase.ts                    ← Typed client (null-safe)
    │   ├── db-types.ts                    ← TypeScript schema types
    │   ├── waitlist.ts                    ← joinWaitlist() with fallback
    │   └── utils.ts                       ← cn(), formatters
    └── components/
        ├── Logo.tsx                       ← <LogoMark> + <LogoLockup>
        ├── Header.tsx
        ├── Hero.tsx
        ├── Proof.tsx                      ← v22 backtest showcase + chart
        ├── HowItWorks.tsx
        ├── Pricing.tsx                    ← 4 tiers
        └── Footer.tsx                     ← Legal disclaimers
```

---

## Sister projects

- **`../crypto-bot/swingbot/strategy_3/`** — the actual trading strategy engine (Python + Pandas + ccxt). This is what powers the showcase backtest. Eventually a FastAPI wrapper will expose it as the backtest service for the platform.

- **`../crypto-bot/`** root — contains the historical build plans (APP_BUILD_PLAN.md, MARKETING_ROADMAP.md, LOGO_BRIEF.md, SUPABASE_SETUP.md was older copy — newer version is here in `strategylabs/SUPABASE_SETUP.md`).

---

## Contact / Decisions

If you need to ask the user (Prajn) something before proceeding:
- For **compliance** questions → always escalate, never assume
- For **branding** copy → propose options, don't commit
- For **architecture** changes → propose with tradeoffs, don't ship
- For **dependencies** → suggest, don't auto-install

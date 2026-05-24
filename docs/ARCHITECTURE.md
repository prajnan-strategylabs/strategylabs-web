# Architecture

---

## High-level diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USERS                                        │
│   iOS app (Capacitor) │ Android (Capacitor) │ Web/PWA (browser)      │
└─────────────────────────┬────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                Vite + React + TypeScript (this repo)                  │
│                       Hosted: Vercel                                  │
│                                                                       │
│   src/                                                                │
│   ├── lib/supabase.ts ──── Supabase client (browser)                  │
│   ├── lib/waitlist.ts ──── DB ops (waitlist join)                     │
│   ├── lib/db-types.ts ──── Generated table types                      │
│   └── components/    ──── UI (Hero, Proof, Pricing, etc.)             │
└─────────────────────────┬────────────────────────────────────────────┘
                          │
            ┌─────────────┼────────────────────┐
            │             │                    │
            ▼             ▼                    ▼
   ┌─────────────┐ ┌──────────────┐  ┌──────────────────────┐
   │  Supabase   │ │   Stripe     │  │  Python Backend      │
   │  Postgres + │ │  (billing,   │  │  (FastAPI on Railway)│
   │  Auth + RLS │ │   webhooks)  │  │                      │
   │             │ │              │  │  Wraps existing      │
   │  Tables:    │ │              │  │  backtest engine     │
   │   waitlist  │ │              │  │  (crypto-bot/        │
   │   profiles  │ │              │  │   swingbot/          │
   │   strategies│ │              │  │   strategy_3/)       │
   │   bt_runs   │ │              │  │                      │
   │   signals   │ │              │  │  + signal worker     │
   └─────────────┘ └──────────────┘  │  (cron every 4h)     │
                                     └──────────────────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │  Binance API     │
                                     │  (cached locally │
                                     │   in data_cache/)│
                                     └──────────────────┘
```

---

## Why each piece

### Frontend: Vite + React + TypeScript
- **Vite** (not Next.js) — see `DECISIONS.md`
- **React 18** — most ubiquitous, easiest to hire for, best ecosystem
- **TypeScript** — non-negotiable for a financial product, catches bugs at build time

### Styling: Tailwind v3
- Utility-first, no CSS files to maintain across components
- v3 (not v4) — v4 still has rough edges in mid-2026
- Custom theme with brand colors (mint accent on deep navy)

### State: React local state + Supabase real-time
- No Redux/Zustand needed at this scale
- For collaborative/real-time features later: Supabase real-time channels

### Auth + DB: Supabase
- Postgres (familiar, JSONB for flexible spec storage)
- Auth built in (saves 3 days vs rolling our own)
- Row Level Security = no backend needed for simple CRUD
- Generous free tier
- New key format: `sb_publishable_...` (browser) + `sb_secret_...` (server)

### Payments: Stripe
- Industry standard
- Webhooks → update `profiles.tier`
- Avoid Apple/Google 30% via "Reader App" pattern (sell on web, app reads)

### Backend (later): Python FastAPI
- Reuses the existing trading strategy code (already in `crypto-bot/`)
- Same pandas + pandas_ta + ccxt stack
- Deployed on Railway ($5/mo to start)

### Mobile: Capacitor
- Wraps the Vite static build
- One codebase → iOS + Android
- See `DECISIONS.md` for why over React Native

---

## Folder structure (this repo)

```
strategylabs/
├── AGENTS.md                      Entry for any AI agent
├── README.md                      (TODO: human-facing)
├── SUPABASE_SETUP.md              5-min DB setup walkthrough
│
├── package.json                   npm dependencies
├── vite.config.ts                 Vite config (default for now)
├── tsconfig.json                  TypeScript config
├── tailwind.config.js             Brand theme
├── postcss.config.js              Tailwind PostCSS plugin
├── eslint.config.js               Linting rules
├── index.html                     SEO + OG tags
│
├── .env.example                   Template
├── .env.local                     Real env vars (gitignored)
├── .gitignore
│
├── docs/                          ← Detailed AI context
│   ├── STATE.md                   What's done / next
│   ├── ARCHITECTURE.md            This file
│   ├── DECISIONS.md               Why we chose what we chose
│   ├── BRAND.md                   Voice, colors, naming
│   └── STRATEGY_BACKGROUND.md     Trading strategy summary
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql Initial DB schema
│
├── public/                        Static assets
│   ├── favicon.svg                32×32 brand mark
│   └── logo.svg                   Full brand mark
│
└── src/
    ├── main.tsx                   React entry
    ├── App.tsx                    Page composition
    ├── vite-env.d.ts              Vite types
    ├── index.css                  Tailwind + global styles
    │
    ├── lib/
    │   ├── supabase.ts            Typed Supabase client
    │   ├── db-types.ts            Schema TypeScript types
    │   ├── waitlist.ts            joinWaitlist() with fallback
    │   └── utils.ts               cn(), formatNumber(), etc.
    │
    └── components/
        ├── Logo.tsx               <LogoMark>, <LogoLockup>
        ├── Header.tsx             Sticky top nav
        ├── Hero.tsx               Hero + waitlist form
        ├── Proof.tsx              Stat cards + equity chart
        ├── HowItWorks.tsx         4-step explainer
        ├── Pricing.tsx            4-tier pricing
        └── Footer.tsx             Nav + disclaimers
```

---

## Database schema (high-level)

| Table | Purpose | RLS policy |
|---|---|---|
| `waitlist` | Pre-launch email captures | `INSERT` allowed for anon, `SELECT` blocked (admin-only) |
| `profiles` | User metadata + subscription tier | Users read/update own row only |
| `strategies` | User-defined trading strategy specs (JSONB) | Users CRUD own rows only |
| `backtest_runs` | Backtest results per strategy | Users read/insert own runs only |
| `signals` | Live signals from running strategies | Users see signals from owned strategies |

Full schema in `supabase/migrations/001_initial_schema.sql`.
TypeScript types in `src/lib/db-types.ts` (keep in sync manually for now; later generate with `supabase gen types`).

---

## Conventions

### Naming
- Components: `PascalCase.tsx`
- Hooks: `useThing()` in `src/hooks/`
- Utilities: `camelCase.ts` in `src/lib/`
- SQL tables: `snake_case`, plural (`strategies`, `backtest_runs`)
- Env vars: `SCREAMING_SNAKE_CASE`, prefix with `VITE_` only if exposed to browser

### Imports
- Use `@/` alias for `src/` (configured in Vite — TODO: verify in `vite.config.ts`)
- Lucide icons by name: `import { LineChart } from "lucide-react"`
- Brand icons (Twitter, GitHub) — inline SVG (lucide removed them)

### Component patterns
- Server components? No — everything is client (it's a SPA)
- Co-locate small subcomponents in the same file (`Hero.tsx` has `TrustItem`)
- Promote to its own file once used 3+ places

### Styling
- Use Tailwind utilities by default
- Use `@apply` only for the small set of reusable patterns in `index.css` (`btn-primary`, `card`, `stat-num`, `container-app`)
- Brand colors via theme tokens: `bg-bg`, `text-ink`, `text-accent` — not raw hex

---

## Build + deploy

```bash
# Local dev
npm run dev                    # http://localhost:5173

# Type-check + production build
npm run build                  # outputs to dist/

# Preview production build locally
npm run preview                # http://localhost:4173

# Deploy to Vercel (after `vercel link`)
vercel --prod
```

Vercel auto-detects Vite. Add env vars in Project Settings → Environment Variables.

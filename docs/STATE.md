# Project State

> **Update this file every meaningful session.** It's the canonical "where are we" source.

**Last updated:** 2026-05-24
**Current sprint:** MVP launch — get a real waitlist page live at strategylabs.trade

---

## ✅ Done

### Foundation
- [x] Domain purchased: `strategylabs.trade` ($5/yr)
- [x] Vite + React + TypeScript project scaffolded
- [x] Tailwind v3 configured with brand colors + custom theme
- [x] Custom brand mark designed (mint chart line + V dip + spark peak)
- [x] Favicon (`public/favicon.svg`) + full logo (`public/logo.svg`)
- [x] `<LogoMark>` + `<LogoLockup>` reusable components

### Landing page (live locally at http://localhost:5173)
- [x] Header with logo + nav + "Join waitlist" CTA
- [x] Hero section with email capture
- [x] Proof section: 4 stat cards + 8-year equity curve (custom SVG, no chart lib)
- [x] How-it-works: 4-step explainer
- [x] Pricing: 4 tiers (Free → Explorer $19 → Trader $59 → Auto $249)
- [x] Footer with legal disclaimers, brand links, custom X/GitHub SVGs
- [x] Dark theme baked in, mobile-responsive
- [x] OG tags + Twitter meta in `index.html`

### Database (schema written, not yet provisioned)
- [x] Supabase client (`src/lib/supabase.ts`) — null-safe, supports new key format
- [x] TypeScript types for all tables (`src/lib/db-types.ts`)
- [x] Migration: `supabase/migrations/001_initial_schema.sql`
  - `waitlist` table (anon-insert allowed, anon-select blocked)
  - `profiles` table (linked to auth.users via trigger)
  - `strategies` table (RLS: users see own only)
  - `backtest_runs` table (RLS)
  - `signals` table (RLS via strategy ownership)
- [x] Waitlist form wired to `joinWaitlist()` with localStorage fallback in dev
- [x] Validates email, handles duplicates idempotently, shows error UI

### Documentation
- [x] `AGENTS.md` — primary AI context
- [x] `docs/` folder with detailed reference
- [x] `SUPABASE_SETUP.md` — 5-min user walkthrough
- [x] Companion docs in `../crypto-bot/`: APP_BUILD_PLAN, MARKETING_ROADMAP, LOGO_BRIEF

---

## ⏸ Blocked on user

User needs to:
1. Create free Supabase project at https://supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy `Project URL` + `Publishable key` into `.env.local`
4. Restart `npm run dev`
5. Verify waitlist insert works → check Supabase Table Editor for the row

Once that's done, the waitlist captures real emails.

---

## 🚧 Up next (priority order)

### Sprint 1: Get live
1. **Deploy to Vercel** so `strategylabs.trade` resolves to the landing page (20 min)
   - Push code to GitHub (org: `strategylabs`)
   - Connect Vercel to repo
   - Add env vars in Vercel project settings (same as `.env.local`)
   - Point DNS for strategylabs.trade at Vercel
2. **First "build in public" tweet** with link to live URL (1 hr — separate from code)

### Sprint 2: Make it real
3. **Supabase Auth** — magic link login (45 min)
   - User can create a free account
   - Logged-in nav shows different state
   - Profile page stub
4. **AI Strategy Lab page** — the killer feature (2-3 hr)
   - Chat UI where user describes a strategy
   - Claude API integration
   - Generate structured strategy spec (JSON)
   - "Run backtest" button (initially mocked, then wired to Python backend)
5. **Stripe subscription gate** (60 min)
   - Free tier always works
   - Paid tiers gated behind subscription
   - Stripe checkout + webhook → update `profiles.tier`

### Sprint 3: Mobile + polish
6. **Capacitor wrap** for iOS/Android (2-4 hr)
7. **App Store + Play Store submission**

---

## 🧊 Frozen / parked

- ❌ Strategy auto-execute (Auto tier feature) — wait until we have first paying users asking for it
- ❌ Marketplace (user-published strategies) — Phase 5 in roadmap
- ❌ Multi-asset (stocks/forex/gold backtesting) — Phase 2+ after crypto MVP proves

---

## 🐛 Known issues

- Dev server white screen if you forget to clean lucide-react missing imports — see history: `Twitter`/`Github` icons were removed from lucide-react and caused initial white screen. Fixed in Footer.tsx by inlining SVGs.
- `npm audit` shows ~4 dev-dep warnings — none are runtime risks. Re-audit before deploy.

---

## 📊 Metrics to track (once live)

- Daily unique visitors
- Waitlist signup conversion rate (target: 5-10% of visitors)
- Time to first interaction (hero email field)
- Bounce rate (target: < 60%)
- Twitter referral % vs organic % vs direct %

# Architectural Decisions Log

> Append-only. When you change something non-obvious, add an entry here so future agents understand the "why".

---

## ADR-001: Brand name "Strategy Labs" (generic, not crypto-specific)

**Date:** 2026-05-23
**Status:** Accepted

**Context:** Initial name was "Crypto Strategy Lab" — locking the brand to crypto would cap TAM and create bear-market risk.

**Decision:** Use **Strategy Labs**. Generic, multi-asset future-proof. Crypto is the launch beachhead (data is free + we have a working strategy), but the architecture supports stocks, forex, gold, indices.

**Trade-offs:**
- ✅ ~10× larger TAM (retail traders globally vs crypto-only)
- ✅ Survives crypto bear markets (stocks still trade)
- ✅ Sounds institutional next to TradingView/QuantConnect
- ❌ Less SEO-specific in crypto-only searches (mitigated by content strategy)

---

## ADR-002: Domain on `.trade` TLD, not `.com`

**Date:** 2026-05-24
**Status:** Accepted

**Context:** `strategylabs.com/.io/.app` were all taken or expensive. `strategylabs.trade` was $5/yr.

**Decision:** Use `strategylabs.trade`. On-brand TLD reinforces what the product does.

**Trade-offs:**
- ✅ Cheap, available, on-brand
- ✅ Memorable (rolls off the tongue)
- ✅ App stores don't penalize alt TLDs in 2026
- ❌ Users may fat-finger `.com` → consider buying it later as redirect
- ❌ Some old email spam filters flag non-.com → mitigated with SPF/DKIM/DMARC

---

## ADR-003: Vite (not Next.js)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Choosing between Next.js (SSR) and Vite (SPA) for the web framework.

**Decision:** Use **Vite + React Router**.

**Trade-offs:**

| | Next.js | Vite (chosen) |
|---|---|---|
| Dev server speed | Slower | Instant HMR |
| SSR for SEO | Built-in | Need vite-ssg if we want it |
| API routes | Built-in | Separate backend (FastAPI) |
| Capacitor wrap | Hard | Native fit (static output) |
| Server/client component split | Required | Not needed |

**Why Vite wins for this product:**
1. **Capacitor wraps a static build** — Vite's native output is exactly what Capacitor wants. Next.js needs more config.
2. **Mobile app is a key channel** — SPA architecture matches the eventual mobile experience.
3. **API lives in Python** — we already have FastAPI in plan. No reason to add Next.js's mixed server/client model.
4. **Faster iteration** — instant HMR matters for a 1-2 person team shipping fast.

**When to reconsider:** if SEO becomes critical AND the AI Strategy Lab pages need to be crawlable. Then add `vite-ssg` for static generation of public pages.

---

## ADR-004: Tailwind v3 (not v4)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Tailwind v4 released but still has rough edges (CSS engine rewrite, breaking changes).

**Decision:** Pin to Tailwind v3 for now. Revisit in 6 months.

**Trade-offs:**
- ✅ Stable, well-documented, every Tailwind tutorial works
- ❌ Slightly slower build than v4 (not noticeable at our scale)
- 🔄 Plan to migrate to v4 in 2026 Q4 once ecosystem catches up

---

## ADR-005: Supabase (not Firebase, not roll-our-own)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Need auth + database + real-time for the product.

**Decision:** Use **Supabase**.

**Trade-offs:**

| | Supabase (chosen) | Firebase | Roll our own |
|---|---|---|---|
| Database | Postgres | Firestore (NoSQL) | Whatever |
| Auth | Built-in | Built-in | Build from scratch |
| Pricing model | Generous free tier | Pay-per-read | Hosting cost |
| RLS / row security | First-class | Limited | DIY |
| SQL | Yes | No | Yes |
| Vendor lock-in | Postgres = portable | High | None |

**Why Supabase wins:**
- Postgres = familiar to anyone with SQL background
- RLS = auth + authorization in one place (no separate backend needed for simple CRUD)
- Free tier covers us until we hit ~10K monthly visitors
- Postgres data is portable — we can leave anytime

---

## ADR-006: New Supabase key format (sb_publishable_/sb_secret_)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Supabase migrated from JWT keys (`anon` / `service_role`) to prefixed keys (`sb_publishable_...` / `sb_secret_...`) in late 2024.

**Decision:** Use the **new format** for all new code. Fallback support for old `VITE_SUPABASE_ANON_KEY` kept in client to not break existing deployments.

**Env var naming:**
- `VITE_SUPABASE_PUBLISHABLE_KEY` — for browser (safe to expose, requires RLS)
- `SUPABASE_SECRET_KEY` — for server-side ONLY, never prefix with `VITE_`

**Why:**
- New keys are visually distinct (you can spot a leaked secret in code review)
- Old JWT keys will be deprecated eventually
- Cleaner separation of trust boundaries

---

## ADR-007: Inline SVG for brand icons (not lucide-react)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** lucide-react v0.376+ removed branded social icons (Twitter, GitHub) due to trademark concerns.

**Decision:** Use inline SVG components for Twitter/X and GitHub icons. Defined inline in `Footer.tsx`.

**Trade-offs:**
- ✅ Always works, no version surprises
- ✅ Accurate to current brands (e.g., X logo, not Twitter bird)
- ❌ Small code duplication if used elsewhere (promote to `Logo.tsx` if needed)

---

## ADR-008: Custom SVG charts (not Recharts/Chart.js)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Landing page proof section needs to show an equity curve. Could use Recharts, Chart.js, lightweight-charts, etc.

**Decision:** Hand-roll an SVG `<EquityChart>` component in `Proof.tsx`.

**Why:**
- Zero dependencies (saves ~50KB)
- Total control over styling
- Landing pages need to be FAST — every kilobyte matters
- The chart is essentially static — no need for chart library complexity

**When to reconsider:** When we build the AI Strategy Lab page where users see interactive charts for their own backtest results. Then use TradingView Lightweight Charts (free, accepted UX in trading apps).

---

## ADR-009: "Reader App" pattern for App Store

**Date:** 2026-05-24
**Status:** Pending (will implement at Capacitor wrap stage)

**Context:** Apple takes 30% of in-app purchases. Same for Google.

**Decision:** Sell subscriptions on the **web** only. Mobile app is a "reader" that authenticates with existing accounts.

**Why:**
- Saves 27% on every dollar (Stripe 3% vs App Store 30%)
- Same model as Spotify, Netflix, Audible (all allowed by Apple)
- Apple explicitly permits this for "reader apps"

**Rules to follow:**
- No "Buy" button in the app
- No link from inside app directly to web payment page
- Subscriptions managed externally (user-initiated on web)

---

## ADR-010: Localstorage fallback for waitlist in dev

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Dev experience matters. If a contributor clones the repo and doesn't set up Supabase, the landing page should still work.

**Decision:** `joinWaitlist()` falls back to `localStorage` when Supabase client is null (missing env vars).

**Why:**
- New developers can `npm run dev` and see the form work
- Production builds throw a console error if env vars missing — catches deploy mistakes
- Zero risk: localStorage in dev is never exposed to users

---

## ADR-011: R2-backed Capacitor live updates

**Date:** 2026-07-30
**Status:** Accepted

**Context:** Installed mobile apps need JavaScript-only fixes without waiting for
store review. The API runs on Fly, whose local filesystem is not durable across
deploys.

**Decision:** Use `@capawesome/capacitor-live-update` (Capacitor 8 line).
Versioned ZIP bundles are stored durably in Cloudflare R2 and published via a
deploy-secret-protected FastAPI endpoint. Apps check a no-store manifest during
the custom splash screen and continue with the installed bundle if anything
fails.

**Trade-offs:**
- ✅ Updates survive Fly deploys and can be rolled forward quickly
- ✅ Immutable bundle URLs avoid stale CDN caches
- ✅ A failed update check never blocks app startup
- ❌ Native/plugin changes still require an App Store or Play Store release
- ❌ R2 public delivery and deploy-secret rotation must be managed operationally

---

## Template for new ADRs

```markdown
## ADR-XXX: [Short title]

**Date:** YYYY-MM-DD
**Status:** Proposed / Accepted / Rejected / Superseded by ADR-YYY

**Context:** [What's the situation that demands a decision]

**Decision:** [What we chose]

**Trade-offs:** [What we're giving up by choosing this]

**Alternatives considered:** [What we rejected and why]
```

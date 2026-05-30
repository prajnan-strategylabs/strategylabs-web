# Launch Strategy — 90-Day Sprint

> **Owner:** Prajn · **Drafted:** 2026-05-27 · **Public launch target:** 2026-08-25 (Day 90)
> **Companion to:** [MARKETING_ROADMAP.md](../../crypto-bot/MARKETING_ROADMAP.md) (12-month plan) and [APP_BUILD_PLAN.md](../../crypto-bot/APP_BUILD_PLAN.md)
> **Channel mix:** Twitter/X + Reddit + YouTube + SEO/Blog. **No "boots on ground" — 100% online.**

---

## TL;DR

In the next 90 days we run **one play**: convert the v22 trading strategy's 8-year backtest into a public, audit-grade proof artifact, and use that artifact as the magnet that pulls quant-curious retail traders into the Strategy Labs waitlist → free tier → paid signal subscription.

The product narrative is fixed: **"Test any trading idea in 30 seconds. Years of data. Robustness tests included. Live signals if it works."**

The wedge is **transparency**. Every other signal service hides losses. We publish them.

---

## Goals (90-day targets)

| Metric | Day 0 (today) | Day 30 | Day 60 | Day 90 |
|---|---|---|---|---|
| Email waitlist | ~0 | 500 | 2,000 | 5,000 |
| Twitter followers | 0 | 500 | 2,500 | 8,000 |
| YouTube subs | 0 | 50 | 300 | 1,500 |
| Reddit karma (`u/strategylabs`) | 0 | 200 | 1,500 | 5,000 |
| Indexed blog posts | 0 | 4 | 10 | 18 |
| Free signups | 0 | 0 | 100 (closed beta) | 800 |
| Paid signups (Explorer/Trader) | 0 | 0 | 0 | 25 |
| MRR | $0 | $0 | $0 | ~$800 |

**North star metric: email waitlist signups.** Every piece of content has the same CTA — go to strategylabs.trade and drop your email.

Revenue is **not** the 90-day goal. Audience is. Conversion comes in months 4–6 once we have a beta-tested AI Strategy Lab and Stripe wired up.

---

## Current state baseline (2026-05-27)

What is real today:

- ✅ `strategylabs.trade` purchased, landing page built locally (`npm run dev` works)
- ✅ Waitlist form wired, Supabase schema written
- ✅ FastAPI backend live on fly.io (`strategylabs-api`) with V22 scanner running
- ✅ Telegram bot router exists (`strategylabs-api/app/routers/telegram.py`)
- ✅ v22 strategy validated: $5K → $44K over 8yr, max DD 8.57%, walk-forward + Monte Carlo + slippage stress tested
- ✅ `MARKETING_ROADMAP.md`, `BRAND.md`, `STRATEGY_BACKGROUND.md` all written

What is **not** real yet (and 90-day plan must work around):

- ⏸ Landing page not deployed to Vercel — DNS not pointed
- ⏸ Supabase project not provisioned — migration not run
- ⏸ No auth flow live (Supabase Auth not wired into UI)
- ⏸ No Stripe — no way to take money
- ⏸ AI Strategy Lab not built
- ⏸ No Twitter / YouTube / Reddit accounts created
- ⏸ No blog yet

**Critical implication:** the 90-day plan front-loads infrastructure setup (Days 1–7) so the audience-building work has somewhere to send traffic.

---

## Compliance guardrails (read every time before posting)

These apply to **every** tweet, video, post, blog, and email. Violations create legal exposure that is hard to undo.

### Hard rules
- ❌ Never use: "make money", "guaranteed", "risk-free", "get rich", "beat the market", "financial advice", "profitable", "investment opportunity", "to the moon", 🚀
- ✅ Always use: "strategy testing", "historical performance", "backtested signals", "trading research", "educational tool", "signal alerts", "for informational purposes", "walk-forward validated"
- ❌ Never state or imply future return numbers
- ✅ Always frame results as: *"In historical backtest, this would have done X."*
- ❌ Never refer to the product as "crypto bot" or "crypto signals" — it is **strategy testing platform** / **strategy signals**
- ✅ Every long-form piece (blog, YouTube description) ends with: *"Educational tool only. Past performance does not predict future results."*

### Per-channel disclosure footers

| Channel | Required footer |
|---|---|
| Twitter thread | Last tweet of every thread: "Educational only. Past performance ≠ future results." |
| YouTube | Pin a comment with full risk disclosure + link this in the description |
| Reddit | Disclosure paragraph at the bottom of every post body |
| Blog | `<RiskDisclosure />` component at the bottom of every article |
| Newsletter | One-line footer in every email |

If any post would still be defensible after a hostile screenshot lands on r/Buttcoin — ship it. If not — rewrite.

---

## Phase 1 — Days 1–30: Foundation + Waitlist Engine

**Phase goal:** Get the landing page deployed, accounts claimed, first 500 waitlist emails captured, content production rhythm established.

### Week 1 (Days 1–7) — Ship the foundation

| Day | Task | Channel |
|---|---|---|
| 1 (Thu) | Provision Supabase project, run `001_initial_schema.sql`, fill `.env.local` | Infra |
| 1 | Deploy `strategylabs` to Vercel, set env vars, point `strategylabs.trade` DNS | Infra |
| 1 | Verify waitlist form inserts row in production | Infra |
| 2 | Claim `@strategylabs` on Twitter/X, YouTube, Reddit, Instagram (defensive), TikTok (defensive) | All |
| 2 | Set up bio + header on Twitter (mint accent banner, link to strategylabs.trade) | Twitter |
| 3 | Set up GitHub org `strategylabs`, push frontend repo as public-but-readme-only (no business logic until launch) | Infra |
| 3 | Set up Resend.com for transactional email ($20/mo). Welcome email + waitlist confirmation | Infra |
| 4 | Set up Posthog (free) for product analytics on the landing page | Infra |
| 4 | Set up a `/blog` route in the Vite app (markdown-rendered, no CMS yet) | Infra |
| 5 | Set up a basic newsletter — ConvertKit free tier or Resend Broadcasts | Newsletter |
| 6 | Write **"build in public" pinned tweet** announcing the project + the v22 result | Twitter |
| 6 | Post **first launch tweet thread** — see template T1 below | Twitter |
| 7 | Post first blog: *"What 8 years of backtesting taught me about crypto signal services"* — see SEO post B1 below | Blog/SEO |

**End of Week 1 deliverables:**
- Live waitlist at strategylabs.trade ✅
- 1 indexed blog post ✅
- 1 launch tweet thread ✅
- Resend + Posthog + ConvertKit wired ✅

### Week 2 (Days 8–14) — First content cadence

Daily cadence locks in starting Day 8. **Treat this as a job. Same time every day.**

| Cadence | Channel | Content |
|---|---|---|
| Daily 9am IST | Twitter | 1 post (data screenshot + 3 sentences, no thread) |
| Tue/Thu 7pm IST | Twitter | 1 longer thread (5–8 tweets) |
| Friday | Blog | 1 long-form post (1,500–2,500 words) |
| Sunday | Newsletter | Weekly digest to waitlist subscribers |
| Sat | YouTube | 1 video (8–15 min) — record Mon, edit Wed–Fri, publish Sat 4pm IST |

**Week 2 content:**
- Mon: Tweet template T2 (regime classifier explainer with 1 chart)
- Tue thread: "I backtested the most popular crypto signal pattern over 8 years. Here's what actually worked." (Break-Retest-Go intro)
- Wed: Tweet T3 — "Things people get wrong about backtests"
- Thu thread: "Why 70% of my strategy's days have ZERO trades — and why that's a feature"
- Fri blog: B2 — *"Walk-forward validation: the only backtest metric that matters"*
- Sat YouTube: V1 — *"I tested every crypto signal pattern over 8 years. Here's what worked."*
- Sun newsletter: NL1 — Welcome + this week's results

### Week 3 (Days 15–21) — First Reddit drops

Reddit needs trust *before* it converts. Two weeks of pure comments first → then post.

| Day | Action |
|---|---|
| 15 | Sub list locked: r/algotrading, r/quant, r/Daytrading, r/CryptoCurrency, r/Forex (browse, not post yet) |
| 15–17 | Comment-only mode: leave 3–5 thoughtful answers/day on existing posts. Build karma + recognition. |
| 18 | **First Reddit post:** r/algotrading — *"I open-sourced the regime classifier I used to backtest 47 USDT pairs over 8 years [full data + CSV]"* |
| 19 | Engage every comment within 1 hour for 12 hours |
| 20 | Cross-promote the same data as a Twitter thread (different angle) |
| 21 | Friday blog: B3 — *"The regime classifier: how to tell if a market is trending or chopping"* |

**Why this order:** lurk → comment → post. Reddit detects and bans drive-by promoters. Comments first builds the account history that lets the first post survive moderator review.

### Week 4 (Days 22–30) — Optimize + first waitlist push

| Day | Action |
|---|---|
| 22–24 | A/B test 3 landing page hero variants (Posthog session recordings) |
| 25 | Tweet template T4 — month-1 recap with metrics ("here's where we are: 412 waitlist signups in 30 days") |
| 26 | Second Reddit post (r/CryptoCurrency or r/quant depending on which converted better) |
| 27 | YouTube V4 — *"I went public 30 days ago. Here's every number, including what's not working."* |
| 28 | Blog B4 — *"Month 1 of Strategy Labs: what I shipped, what got traction, what flopped"* |
| 29–30 | **Outreach week:** DM 10 crypto/finance Twitter accounts (5K–50K followers, builders not influencers) offering early access to the AI Strategy Lab beta in exchange for honest feedback |

**End of Phase 1 review (Day 30):**
- Waitlist: target 500 emails
- Twitter: 500 followers
- 4 blog posts indexed
- 4 YouTube videos posted
- 2 Reddit posts with positive net comments
- 5 builders signed up for closed beta access

---

## Phase 2 — Days 31–60: Audience Build + Soft Beta

**Phase goal:** Get the AI Strategy Lab beta working, onboard 100 closed-beta users from the waitlist, generate enough product feedback + user stories to power the public launch in Phase 3.

### What ships in Phase 2

| Week | Product work | Marketing work |
|---|---|---|
| 5 | Supabase Auth wired (magic link login), profile page | Daily content continues. Start a 5-part "Building the AI Strategy Lab in public" Twitter thread series. |
| 6 | AI Strategy Lab page: chat UI + Claude API integration + JSON spec output | Reddit post 3: r/algotrading — *"Building an AI that converts plain English into testable trading strategies. Here's the JSON schema."* |
| 7 | Wire strategy spec → Python backtest engine (`strategylabs-api` endpoint that runs `crypto-bot/swingbot/strategy_3/`) | YouTube V5–V8: weekly cadence holds. Topic: *"Watch me describe a strategy to AI and backtest it in 30 seconds"* |
| 8 | Open closed beta to the first 100 waitlist members. Invite-only via magic link. | First 10 user success stories tweeted (with permission) |

### Beta program structure

- **Cohort 1 (Day 50):** First 25 waitlist members. Email them personally. Free Trader tier for 90 days in exchange for weekly written feedback + permission to quote them.
- **Cohort 2 (Day 56):** Next 75. Same deal.
- **Daily standup post (Twitter):** "Yesterday in the lab: 12 strategies tested, 3 survived walk-forward, here's the best one."

### Content focus shifts

In Phase 1 the hero is the backtest. In Phase 2 the hero is **the lab itself + early user strategies**.

| Phase 1 framing | Phase 2 framing |
|---|---|
| "Here's a strategy that worked" | "Here's how a stranger tested their idea on the platform" |
| "Look at this 8-year backtest" | "Look at what users built last week" |
| Single-author voice | User stories voice |

### Phase 2 metric checkpoints

| Day | Waitlist | Twitter | YouTube | Beta users | Blog posts |
|---|---|---|---|---|---|
| 30 | 500 | 500 | 50 | 0 | 4 |
| 45 | 1,200 | 1,400 | 150 | 25 | 7 |
| 60 | 2,000 | 2,500 | 300 | 100 | 10 |

If waitlist is **<1,200 by day 45**, halt new feature work and double down on Twitter threads + 1 viral attempt on r/algotrading. The product is fine — distribution is the gap.

---

## Phase 3 — Days 61–90: Public Launch + Conversion

**Phase goal:** Open the gates, ship Stripe, convert first 25 paying users, lay the SEO foundation that compounds for the rest of the year.

### What ships in Phase 3

| Week | Product work |
|---|---|
| 9 | Stripe wired. Subscription gate: Explorer ($19), Trader ($59). Auto + Pro tiers parked until later. |
| 10 | Public-facing showcase strategies page (the v22 + 5 best beta-user strategies, with full backtest CSVs downloadable) |
| 11 | Telegram bot wired for paid-tier signal delivery (`strategylabs-api/app/routers/telegram.py` already exists — finish UI) |
| 12 | Launch week prep: ProductHunt assets, press kit, FAQ page |

### Launch week (Days 85–91)

| Day | Date (approx) | Action |
|---|---|---|
| 85 (Wed) | 2026-08-19 | "Tomorrow we launch publicly" tweet thread + waitlist email (give 24h heads-up) |
| 86 (Thu) | 2026-08-20 | ProductHunt scheduled at 12:01am PST. Hero tweet thread at 7am IST. Reddit post r/algotrading at 9am IST. Email waitlist with launch link + first-100 promo code (25% off Trader tier for first month). |
| 87 (Fri) | 2026-08-21 | Reddit posts to r/CryptoCurrency + r/Daytrading. Reply to every comment within 1 hour. YouTube V12: 5-min launch walkthrough. |
| 88 (Sat) | 2026-08-22 | Outreach week to journalists/newsletters: DLnews, CoinDesk, The Block (crypto angle), Milk Road, Bankless |
| 89 (Sun) | 2026-08-23 | Customer support marathon — DM every signup personally |
| 90 (Mon) | 2026-08-24 | Recap blog: *"Launch week: every metric, including the ones I'm embarrassed about"* |
| 91 (Tue) | 2026-08-25 | Day 91 recap thread on Twitter |

### Launch promo offer

- **First 100 paid signups:** 25% off Trader tier for the first month ($59 → $44.25)
- **Annual discount:** 20% off (sticks beyond launch — standard pricing)
- **Affiliate kickoff:** 30% rev-share on first 6 months recurring for the first 10 affiliates who refer ≥5 paid users

### Phase 3 targets (Day 90)

- Waitlist: 5,000 emails
- Free signups: 800
- Paid signups: 25
- MRR: ~$800
- Twitter: 8,000 followers
- YouTube: 1,500 subs
- 18 blog posts ranking for at least one tail keyword each

---

## Channel playbooks

### 1) Twitter / X — Build in Public

**Why it's channel #1:** crypto + algotrading Twitter is the densest concentration of our target user. They self-organize, they retweet data, they love transparency stories.

**Posting cadence:**
- 1 daily post (Mon–Sun, no skips)
- 2 threads per week (Tue + Thu, 7pm IST)
- Reply to ~10 posts per day from accounts in our niche (engagement budget: 30 min/day)

**Content mix (over a rolling 30 days):**
| % | Type |
|---|---|
| 50% | Data/results — screenshots of backtest CSVs, equity curves, trade lists |
| 20% | Education — explainers on regime classifiers, walk-forward, RR ratios |
| 15% | Behind-the-scenes — what broke, what's being built |
| 10% | User wins — beta users testing their own strategies |
| 5% | Industry commentary — only when it's adjacent to the work |

**Templates:**

**T1 — Launch thread (Day 6):**
```
1/ I'm building Strategy Labs — a platform where you describe a trading strategy in plain English and get it backtested against 8 years of data in 30 seconds.

This is the foundational backtest that proves the engine works. Here's all the data, including every losing trade.

2/ The strategy: Two-pattern ensemble (S3 + S5) across 47 USDT pairs on Binance.
S3 = pullback to EMA21 in trending regime.
S5 = breakout → retest → reclaim pattern. Works in all regimes.

[chart: equity curve]

3/ 8-year backtest (2017–2024):
$5,000 → $44,196
Max drawdown: 8.57%
Trades: 1,946
Win rate: 49.2%
Profit factor: 2.14

YTD 2026 (5 months forward-walk): +91%, 4.77% max DD.

4/ Things I tested that DIDN'T work — receipts in the thread:
- Pyramid at +1R with BE stop: -$766/3yr
- Wider trail (2.5x flat): -$1,800/8yr
- Long-only-outperformers filter: -$2,233/3yr
- Mean-reversion in chop: -$286/3yr

5/ The platform's not the strategy. The strategy is the *proof* the platform works.

The actual product: you describe YOUR idea. AI translates it. The same backtest engine runs it. You get walk-forward + Monte Carlo + slippage stress on every test.

6/ Joining the waitlist gets you:
- First access when the AI Strategy Lab opens (target: late August 2026)
- The 8-year backtest CSV (every trade, downloadable)
- Weekly newsletter with what the live scanner is firing

strategylabs.trade

7/ Educational only. Past performance ≠ future results. Trading involves substantial risk of loss including total loss of principal.
```

**T2 — Daily data post:**
```
Yesterday in the live scanner:

3 signals fired (BTC, SOL, INJ)
0 stops hit
1 still open

Win rate over last 30 days: 52%
PF: 2.31

Strategy Labs — every signal is publicly logged. No hidden losses.

strategylabs.trade
```

**T3 — Education thread:**
```
1/ Most published "backtest results" are useless. Here's how to read them like an adult.

2/ The most important number is NOT the total return. It's the max drawdown. A 500% return with 60% DD is a strategy that will get you liquidated.

3/ Look for: walk-forward validation. If the strategy was tuned on 2017–2022 and only tested forward on 2023, the 2023 result is the only one that matters.

4/ Look for: Monte Carlo trade-order shuffling. If reshuffling the order of trades changes the DD by 3x, the backtest got lucky with sequencing.

5/ Look for: slippage stress. Add 0.15% slip + 0.05% fees per side. If PnL goes negative, the strategy doesn't survive real execution.

6/ Every backtest on Strategy Labs runs all three by default. If your strategy survives, you get a signal subscription. If it doesn't, you saved yourself the trades.

strategylabs.trade
```

**T4 — Monthly recap:**
```
Strategy Labs — Month 1 in public:

✅ 512 waitlist signups
✅ 487 Twitter followers
✅ 64 YouTube subs
✅ 4 blog posts indexed
✅ Launched closed beta to first 25 users

❌ Reddit posts underperformed (1 went well, 1 got 4 upvotes)
❌ YouTube CTR is 3.2% — needs better thumbnails

Onwards.
```

### 2) Reddit — Strategic value posts

**Why it's channel #2:** unlike Twitter, Reddit converts on *depth*. One great r/algotrading post drives more waitlist signups than 30 tweets. But the cost of failure is high — bans are permanent.

**Sub priority (by ROI per post):**

| Sub | Members | Style | Cadence |
|---|---|---|---|
| r/algotrading | 220K | Sophisticated, demands data + code | 1 post / 2 weeks max |
| r/quant | 50K | High signal/noise, academic | 1 post / month |
| r/CryptoCurrency | 6M | Volume, low conversion | 1 post / month |
| r/Daytrading | 1M | Emotional, mid conversion | 1 post / month |
| r/Forex | 200K | Adjacent, future channel | Phase 2+ only |

**Post structure that works on r/algotrading:**

1. **Title:** *"[Result/Code/Data] Specific claim with a number"* — e.g., *"[Data] I backtested the Break-Retest-Go pattern across 47 USDT pairs over 8 years. Every trade in the CSV (linked)."*
2. **Body opening (2 lines):** what the post is, why it exists
3. **The data:** screenshots, tables, equity curve
4. **What worked / what didn't:** balanced — losses make wins credible
5. **How others can reproduce:** code link, CSV link, methodology
6. **One sentence about Strategy Labs at the bottom** — never above the fold
7. **Disclosure paragraph**

**What NOT to do on Reddit:**
- ❌ "Check out my new platform" posts
- ❌ Promo-only threads
- ❌ Replying to your own post with another account
- ❌ Posting the same thing in 3 subs in 24h

### 3) YouTube — Educational long-form

**Why it's channel #3:** YouTube is the only channel that **compounds** over years. A great backtest video posted in week 8 still drives waitlist signups in month 18. Twitter and Reddit are flow channels; YouTube is stock.

**Format:**
- 8–15 minutes
- Screen recording + voiceover (no face-cam in Phase 1; add face-cam Phase 3 if comfortable)
- Free royalty music (Epidemic Sound, $10/mo)
- Captions burned in (40% of viewers watch muted)

**90-day video calendar:**

| Wk | Video | Topic | Target keyword |
|---|---|---|---|
| 1 | V1 | "I tested every crypto signal pattern over 8 years. Here's what worked." | "crypto signal backtest" |
| 2 | V2 | "Why most crypto signal services lie about win rate" | "crypto signal service review" |
| 3 | V3 | "Walk-forward validation explained in 10 minutes" | "walk-forward optimization" |
| 4 | V4 | "Month 1 of Strategy Labs: every number, including what's not working" | (build-in-public series) |
| 5 | V5 | "Building an AI that translates trading ideas into code (live demo)" | "AI trading strategy" |
| 6 | V6 | "The regime classifier: ADX + Choppiness + EMA slope explained" | "regime classifier trading" |
| 7 | V7 | "Monte Carlo backtesting: why your strategy got lucky" | "monte carlo trading" |
| 8 | V8 | "I let a stranger describe their crypto strategy. Then I backtested it." | (user story) |
| 9 | V9 | "Position sizing: 1% risk, ATR tiers, and why fixed-size kills you" | "trading position sizing" |
| 10 | V10 | "Why slippage destroys 90% of backtests (and how to test for it)" | "slippage backtest" |
| 11 | V11 | "Closed beta wrap: what the first 100 users built" | (build-in-public series) |
| 12 | V12 | "Strategy Labs is live: 5-minute walkthrough" | "Strategy Labs launch" |

**Description template:**
```
[1-line video summary]

🔗 Strategy Labs waitlist: https://strategylabs.trade
📊 The 8-year backtest CSV: [drive link]
📰 Newsletter (weekly): https://strategylabs.trade/newsletter

—

Timestamps:
0:00 ...

—

⚠️ Educational tool only. Past performance does not predict future results. Trading involves substantial risk of loss.
```

### 4) SEO + Blog — Compounding organic

**Why it's channel #4 (but really channel #1 for month 6+):** SEO takes 90+ days to start showing in rankings. We seed it now so by month 4–6 it carries flow.

**Domain authority strategy:** the blog lives at `strategylabs.trade/blog/*`. Inline SEO basics:
- `<title>` and `<meta description>` per post
- Open Graph image per post (auto-generated from title)
- Internal linking — every post links to 2–3 others
- Schema.org Article markup
- Sitemap.xml + robots.txt
- Fast load (Vite static = already <100ms FCP)

**Target keywords (90-day batch):**

| Post # | Slug | Target keyword | Search volume | Difficulty | Phase |
|---|---|---|---|---|---|
| B1 | `/8-years-crypto-signal-services` | "crypto signal services review" | 1,800/mo | Medium | Wk 1 |
| B2 | `/walk-forward-validation-explained` | "walk forward validation" | 800/mo | Low | Wk 2 |
| B3 | `/regime-classifier-trending-vs-ranging` | "trending vs ranging market" | 1,200/mo | Low | Wk 3 |
| B4 | `/month-1-strategy-labs-build-in-public` | "build in public trading saas" | 200/mo | Low | Wk 4 |
| B5 | `/break-retest-go-pattern` | "break retest go strategy" | 600/mo | Low | Wk 5 |
| B6 | `/best-crypto-backtesting-tools-2026` | "crypto backtesting tools" | 1,200/mo | Medium | Wk 6 |
| B7 | `/no-code-trading-strategy-builder` | "no code trading strategy" | 800/mo | Low | Wk 7 |
| B8 | `/monte-carlo-trading-explained` | "monte carlo trading" | 900/mo | Low | Wk 8 |
| B9 | `/position-sizing-atr-trading` | "ATR position sizing" | 700/mo | Low | Wk 9 |
| B10 | `/closed-beta-results-strategy-labs` | (brand/build-in-public) | n/a | n/a | Wk 10 |
| B11 | `/slippage-backtest-trading` | "slippage in backtesting" | 400/mo | Low | Wk 11 |
| B12 | `/strategy-labs-launch` | (brand) | n/a | n/a | Wk 12 |

Post format (every post):
1. H1 = exact target keyword (within reason)
2. TL;DR in 3 bullets at the top
3. 1,500–2,500 words
4. ≥2 internal links to other Strategy Labs posts
5. ≥1 outbound link to an authority (academic paper, Investopedia)
6. CTA box mid-article: *"Test this idea yourself — join the Strategy Labs waitlist."*
7. Risk disclosure at bottom

**Backlink strategy (Phase 2+):**
- Cross-post excerpts to Medium and Substack with canonical link back
- Submit to Hacker News once per phase (only the best post)
- Submit to IndieHackers (BIP narrative fits perfectly)
- Quora answers in trading/quant questions with link to relevant post

---

## Content calendar (weekly grid)

| | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| **Twitter daily post** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Twitter thread (long)** | | 7pm IST | | 7pm IST | | | |
| **Blog post** | | | | | Publish | | |
| **YouTube video** | Record | | Edit | Edit | Edit | Publish 4pm | |
| **Reddit post** | | | | Bi-weekly Thu | | | |
| **Newsletter** | | | | | | | 6pm IST |
| **Engagement budget (replies, DMs)** | 30 min | 30 min | 30 min | 30 min | 30 min | 15 min | 15 min |

**Time budget per week:** ~14 hours of marketing. If this becomes >20 hours, hire a part-time editor for YouTube before doing anything else.

---

## Tooling stack (90-day budget)

| Tool | Use | Cost / mo |
|---|---|---|
| Vercel | Frontend hosting | $0 (Hobby tier) |
| fly.io | Backend hosting | ~$5 |
| Supabase | DB + Auth | $0 (free tier covers Phase 1–3) |
| Resend | Transactional + broadcast email | $20 |
| ConvertKit free | Newsletter (until 1K subs) | $0 |
| Posthog | Product analytics | $0 (free tier) |
| Buffer | Twitter scheduling | $15 |
| Canva | Tweet images, YouTube thumbnails | $13 |
| Descript | YouTube editing + auto-captions | $24 |
| Epidemic Sound | YouTube music | $10 |
| Ahrefs Webmaster | Free SEO tracking | $0 |
| Google Search Console | SEO data | $0 |
| Namecheap | Domain renewals | ~$1 |
| **Total** | | **~$88 / mo** |

Total 90-day marketing tooling spend: **~$265**. No paid ads until Day 91+.

---

## Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| V22 strategy underperforms in launch month | High | Have weekly transparency posts ready: *"Here's a losing week — this is normal and here's why."* Don't hide it. |
| Reddit ban from r/algotrading | Medium | Comment-first rule. Read each sub's rules before posting. Disclose affiliation in every post. |
| Twitter algorithm suppresses promotional links | Medium | Put strategylabs.trade in reply tweets, not the main tweet. Use plain text "strategylabs dot trade" in some posts. |
| YouTube monetization rejected (financial services flag) | Medium | We're not monetizing on AdSense — channel is a top-of-funnel for waitlist. Set channel to "made for kids = no" and never mention "investment advice." |
| Negative viral comment on r/Buttcoin or similar | Low-Med | Respond once, factually, publicly. Don't get drawn into long threads. Have FAQ ready. |
| US regulator (SEC/CFTC) inquiry about "investment advice" framing | Low (90-day) | All copy already compliant. T&C and Privacy Policy live before launch (via Termly $99/yr). Education-tool framing exclusively. |
| Strategy Labs gets copied by a better-funded competitor | Low | The 8-year verifiable backtest + AI Strategy Lab UX is the moat. Move faster, ship more, be more transparent. |
| Burnout from 14 hr/wk content cadence | High | Pre-record YouTube videos 2 weeks ahead. Schedule tweets via Buffer. Build a 30-tweet bank Day 1–7 you can drip from. |
| Audience doesn't convert to paid in Phase 3 | Medium | Phase 3 metric is 25 paid users. If we're at 5 by Day 85, extend free-trial of Trader tier to 14 days. Don't panic-discount the price. |
| Waitlist growth stalls in Phase 2 | High | If <1,200 by Day 45, halt feature work, write 1 dedicated long-form data piece per day (Reddit + Twitter thread + blog) for 7 days. |

---

## Decision triggers

These are the "if X then Y" rules that prevent paralysis when something goes sideways mid-sprint.

| Trigger | Decision |
|---|---|
| Waitlist <300 by Day 21 | Hero on landing page is wrong. Rewrite headline. A/B test 3 variants. |
| Twitter follower growth <50/week by week 3 | Posting cadence is wrong. Add 1 more thread/week. Cut weak daily posts. |
| Reddit post gets downvoted into oblivion | Don't repost. Comment in the thread to learn what went wrong. Wait 30 days before next post in that sub. |
| YouTube CTR <4% on week 4 video | Thumbnails are bad. Get 3 templates from a freelancer ($50–100) and switch. |
| Blog post not indexed by Google after 14 days | Check Search Console — fix robots.txt or sitemap. Submit URL manually. |
| Beta user reports a bug that breaks their backtest | Stop everything. Fix that day. Email them personally. Public post-mortem if it's funny enough. |
| Beta user publicly criticizes the product | Reply publicly within 1 hour. Acknowledge. Offer 1-on-1 call. Convert critic to ally if possible. |

---

## Post-90-day handoff

At Day 90 we will know:
- Which channel converts best (cost per waitlist signup by channel)
- Which content format converts best (thread vs post vs video vs blog)
- The first 25 paying users' pain points and upgrade triggers

Day 91+ plan (not in scope of this doc):
- Begin paid Twitter ads at $500/mo budget targeting lookalikes of converted paid users
- Affiliate program goes live
- Phase 4 product work begins: Auto-execution tier (the high-margin SKU)
- Capacitor wrap → App Store + Play Store submission (4-week review pipeline)

The first 90 days build the audience. Months 4–12 monetize it. Don't conflate them.

---

## Daily checklist (Phase 1, Days 8+)

Print this. Keep it visible.

- [ ] Morning (15 min): post 1 tweet
- [ ] Mid-day (30 min): reply to ~10 tweets in niche, leave 1 Reddit comment, check Posthog dashboard
- [ ] Afternoon (Tue/Thu only, 60 min): write + publish 1 Twitter thread
- [ ] Evening (45 min): work on the week's blog post / YouTube edit
- [ ] Sunday (90 min): write the weekly newsletter

If you skip a day, **don't double up** the next day. Resume the cadence. Skipping reads as authentic. Catch-up bursts read as desperate.

---

## Compliance footer (paste into every long-form piece)

> **Educational tool only.** Strategy Labs is a research and backtesting platform. Nothing on this site, in our content, or in our communications constitutes financial advice, investment advice, or a recommendation to buy or sell any asset. Backtested historical performance is not indicative of future results. Trading involves substantial risk of loss, including the possibility of losing your entire investment. You are solely responsible for your own trading decisions.

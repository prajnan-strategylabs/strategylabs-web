# Strategy Labs — Marketing Playbook

> Internal strategy document · Last updated 2026-05-27
> Owner: Prajnan · Distribution: founders only

## TL;DR

Strategy Labs is a **plain-English crypto backtesting engine**: describe any trading idea in words → it compiles to executable rules → backtests across 9 years / 47 pairs / 1.2M bars → verdict in ~30 seconds. No Pine Script, no Python. The flagship strategy V22 (built *with* the engine) is the proof: **+953% audited over 9 years**, and you can follow its live signals or build your own. 3-tier subscription (Free / Trader $49 / Auto $149).

**Core marketing thesis**: the crypto-signals market is a scam-ridden race to the bottom. We're not selling signals — **we sell the engine that produces them, and let you verify everything yourself.** The product is a *tool*, not advice. That repositioning is the entire strategy: it's more defensible, less regulated, has a broader audience, and V22's audited track record becomes the demo rather than the pitch.

> **Why "engine" beats "signals" as the lead:**
> - **Tool, not tipster** — much cleaner regulatory footing. Software that backtests *your* idea ≠ investment advice telling you what to buy.
> - **Bigger TAM** — every curious trader has an idea they want to test, not just signal-followers.
> - **Defensible** — "describe a strategy in English, get a walk-forward-validated backtest in 30s" is a hard product to clone. "We post signals in Telegram" is not.
> - **Trust through agency** — users test their OWN thesis and watch it fail/succeed. That builds more conviction than "trust our calls."
> - **V22 as proof** — instead of "buy our signals," it's "here's a strategy we built with this engine — +953% audited. Now build yours, or follow ours."

---

## 1. Positioning & Brand Story

### The one-line pitch
> *"Test any trading idea in 30 seconds. Describe it in plain English — we backtest it across 9 years of crypto data and tell you if it actually works."*

(This is already the landing-page hero. Lean into it everywhere.)

### The secondary pitch (where V22 + signals live)
> *"Don't have an idea? Follow V22 — the strategy we built with this engine. +953% audited over 9 years, signals delivered to Telegram in real-time."*

### The brand voice
- **Calm, not gamified.** This is Bloomberg-meets-Linear, not Robinhood.
- **Quant, not hype.** Lead with Sharpe, drawdown, win rate — never "TO THE MOON 🚀".
- **Tool-first, not tipster.** "Here's the engine, test your own edge" — not "follow our calls."
- **Transparent, not opaque.** Show losses (2019: −3%) as confidently as wins (2024: +197%).
- **Educational, not financial advice.** Boilerplate everywhere, but lean into it as a feature.

### The four competitive moats to keep hammering
1. **Plain-English → backtest** — the killer feature. Competitors make you learn Pine Script (TradingView) or Python (QuantConnect). We compile natural language into an executable, validated spec. This is "Composer for crypto."
2. **Walk-forward validation, not naive backtesting** — most backtesters overfit (test on the same data you optimized on). Ours validates AS IF you'd run it live since 2017. This is the difference between a real edge and a curve-fit fantasy — and it's a teachable, marketable concept.
3. **Audited proof via V22** — public year-by-year breakdown, regenerated monthly. The engine isn't vaporware; here's a 9-year strategy it produced. Most "backtest tools" can't show you a single strategy that survived live.
4. **Build → backtest → live, in one loop** — most tools stop at the backtest. We close the loop: a strategy you validate can go live with realtime signals (Trader) or auto-execute on Binance/Bybit (Auto).

### Competitive set (this changes with the repositioning)
We are NO LONGER competing with AltSignals / Cornix / signal-Telegram-channels. New competitive set:

| Competitor | Their angle | Our wedge |
|---|---|---|
| **TradingView** | Charting + Pine Script backtests | No code — plain English. Crypto-native. |
| **QuantConnect** | Python algo backtesting, institutional | No code, 30-second verdict, retail-friendly |
| **Composer.trade** | No-code strategy building (US equities) | Crypto, not equities. + live signals + auto-execute |
| **3Commas / Cryptohopper** | Bot automation, preset templates | We validate the *idea* first; they just automate execution |
| **Backtrader / NautilusTrader** | Open-source Python libs | Zero setup, zero code, hosted |

The wedge sentence: **"The only crypto backtester where you describe the strategy in English and get a walk-forward-validated verdict in 30 seconds — then take it live."**

### Anti-positioning (things we will not say)
- ❌ "Guaranteed profits", "100% win rate", "easy money"
- ❌ "AI-powered" (we removed that from the UI; it's "auto-compiled")
- ❌ "Buy our signals" as the LEAD (signals are the *second* act, not the headline)
- ❌ "Get rich quick" hooks
- ❌ Anything that triggers SEC/CFPB-style "investment advice" framing — the tool framing helps us here, don't undermine it

---

## 2. Target Personas

> Repositioning note: with the backtest-engine lead, the **primary persona shifts from the signal-follower to the idea-tester.** People who have a trading hypothesis and want to validate it are a bigger, less cynical, less price-sensitive audience than people shopping for signal channels.

### Persona A — "Tinkerer Tanvir" (NEW primary target — the idea-tester)
- 25-40, trades crypto actively, has *opinions* ("I bet buying BTC when RSI < 30 in a bull market works")
- Technical enough to describe a strategy, NOT technical enough to code it in Python
- Has tried TradingView Pine Script and bounced off the learning curve
- Pain: *"I have ideas but no way to test them without learning to code or trusting my gut."*
- Hook: "Test any trading idea in 30 seconds — in plain English"
- Conversion path: Free (build + backtest a few ideas) → hits the strategy-slot / realtime ceiling → Trader $49/mo
- LTV target: $49 × 9 months = **$441**

### Persona B — "Quant Curious Kunal" (high-LTV, now second priority)
- 25-35, software dev / data engineer who codes but values speed
- Could write a backtester but doesn't want to maintain one; wants hosted + 9yr data ready
- Will stress-test the engine's rigor (asks about look-ahead bias, slippage modeling) — win them with the walk-forward story
- Conversion path: Free → builds + validates own strategies → Trader/Auto for live execution
- LTV target: $49–$149/mo for 12+ months = **$588–$1788**

### Persona C — "Signal-Follower Sasha" (was primary, now a SECONDARY segment)
- 28-40, doesn't want to build anything — just wants V22's proven calls
- Enters via the V22 showcase / audit wall, not the backtest tool
- Pain: "I don't have a strategy, I just want to follow one that works."
- Conversion path: Free 24h-delayed V22 → Trader $49/mo for realtime
- LTV target: $49 × 8 months = **$392**
- **Still valuable, but no longer the headline.** V22 + signals serve this person.

### Persona D — "Hands-Off Henrietta" (top-tier, lowest volume)
- 35-50, professional with side capital, no time to trade actively
- Wants auto-execution; comes via warm referral, not cold ads
- LTV target: $149/mo for 12+ months = **$1788+**

### Persona E — "Content Tourist" (free-tier flywheel)
- 20-30, on crypto Twitter / Reddit / Telegram, loves a good data thread
- Won't pay, but shares backtest results and "I tested X and here's what happened" content
- **Value to us**: organic distribution. Backtest-result screenshots are inherently shareable.
- Conversion: 1–3%. The rest are our distribution engine.

**Budget allocation rule of thumb** (reweighted for the engine lead):
- 45% → Persona A (Tinkerer Tanvir) — the new primary
- 25% → Persona B (Quant Curious Kunal)
- 15% → Persona C (Signal-Follower Sasha) — V22 showcase content
- 10% → Persona E (Content Tourist) — shareable content
- 5% → Persona D (Hands-Off Henrietta) — warm referrals

---

## 3. Funnel

The funnel now has TWO entry doors that converge — the "test your idea" door (primary) and the "follow V22" door (secondary). Both land in the free tier.

```
   ┌──────────────────────┐        ┌──────────────────────┐
   │ "Test your idea" hook │        │  "Follow V22" hook    │
   │ (the backtest engine) │        │ (the audited proof)   │
   │  → Tinkerer / Quant   │        │  → Signal-follower    │
   └───────────┬───────────┘        └───────────┬───────────┘
               │                                │
               ▼                                ▼
   ┌───────────────────────┐        ┌───────────────────────┐
   │ Landing: "Test any    │        │ Audit Wall: scroll    │
   │ trading idea in 30s"  │        │ 2,410 trades, +953%   │
   └───────────┬───────────┘        └───────────┬───────────┘
               └───────────────┬────────────────┘
                               ▼
              ┌────────────────────────────────────┐
              │  Free tier — run backtests + see    │
              │  V22 (24h delayed) + free Telegram  │
              └────────────────┬───────────────────┘
                               │
        ┌──────────────────────▼───────────────────────┐
        │ 14-day nurture — "here's how to read a        │
        │ backtest", "why walk-forward matters",        │
        │ "the strategy you built vs V22" → trial offer │
        └──────────────────────┬───────────────────────┘
                               │
          ┌────────────────────▼─────────────────────┐
          │ Trader $49/mo — run YOUR strategies live │
          │ + realtime V22 signals + full history     │
          └────────────────────┬─────────────────────┘
                               │
          ┌────────────────────▼─────────────────────┐
          │ Auto $149/mo — auto-execute on exchange  │
          │ Promoted in-app + email at month 3+       │
          └───────────────────────────────────────────┘
```

**Key funnel insight**: the backtest engine is a *better top-of-funnel* than signals because testing an idea is a low-commitment, high-curiosity action. "Will my RSI idea actually work?" is an itch people scratch immediately. Once they've run 2-3 backtests and seen most of their ideas fail, V22's +953% lands far harder — they now *understand* how rare a good strategy is.

**Funnel benchmarks to aim for** (industry rough averages for crypto SaaS):
- Visitor → Free signup: **3–6%**
- Free → Trader trial: **5–10%**
- Trial → Paid: **40–55%**
- Paid month 1 → month 6: **65–75% retention**
- Trader → Auto: **8–15% over 6 months**

If you hit these middle-of-the-road numbers with 5,000 monthly visitors, you'd get ~10–18 new paying subscribers per month at month 6. **That's $500–$900 MRR added per month** = $30k–$54k ARR by end of year 1.

---

## 4. Channel Strategy (online-first)

Ranked by expected effectiveness for the backtest-engine positioning + our budget profile.

### #1 — Twitter / X 🥇 (highest leverage for crypto)

**Why it matters**: Crypto Twitter is where the audience lives. A single viral thread can drive 10k+ visitors. **Backtest-result content is even more viral than signal content** — "I tested [popular strategy everyone believes in] across 9 years and here's what happened" is share-bait. It triggers debate, which the algorithm loves.

**Tactics (backtest-engine flavored)**:
- **"I backtested ___" threads** (the flagship format): take a widely-believed crypto trading maxim ("buy the golden cross", "RSI < 30 is always a buy", "sell in May") → run it through the engine → post the real result with charts. Most will debunk the myth. Each thread is a live demo of the product.
- **"Test this yourself" CTA**: every backtest thread ends with "run your own version free → strategylabs.trade". The thread IS the funnel.
- **Daily cadence**: 2–4 posts/day — backtest snippets, myth-busts, market commentary, V22 recaps (secondary), witty replies.
- **Weekly thread**: either a "I backtested X" debunk OR a single-year V22 deep-dive OR an educational ("why your backtest is lying to you — look-ahead bias explained").
- **Live signals tweets** (secondary): when V22 fires, auto-tweet a redacted teaser — drives the signal-follower segment.
- **Twitter Spaces**: weekly Friday 30-min — take audience trading ideas LIVE and backtest them on stream. Interactive, sticky, demos the product in real-time.

**Why this is stronger than signal-tweeting**: signal recaps only interest people who already want signals. "I backtested the strategy your favorite YouTuber swears by and it lost money" interests *everyone* and positions you as the honest-broker with the receipts.

**Tools**:
- Typefully or Tweet Hunter — $19–$49/mo for scheduling/analytics
- Twitter Blue for the verified checkmark and longer threads — $8/mo

**Estimated cost (organic only)**: $30/mo tooling. Time: 6–8 hrs/week.

**Paid Twitter ads**:
- Promoted tweets to crypto interest audiences in US, UK, India, UAE, Singapore
- $20–$50/day budget per campaign during launches
- Best ad creative: 30-second screen recording of the audit log scrolling through 2,410 trades

---

### #2 — YouTube 🥈 (high-trust, long lifetime)

**Why it matters**: Long-form video is where serious traders evaluate tools. A single well-made "I backtested X" video can drive signups for *years* (evergreen). YouTube search intent for "crypto backtesting" / "trading strategy tester" is high and under-served.

**Content slate** (one per week) — engine-first:
1. **"I Backtested ___" series** (flagship, evergreen) — each video tests one popular trading belief on the engine, on camera. Endless supply of topics, each ranks for its own search term.
2. **"Build a strategy in 5 minutes" series** — screen-record building + backtesting a real idea from scratch. Pure product demo disguised as a tutorial.
3. **"TradingView/Composer/QuantConnect vs Strategy Labs"** — honest tool comparison for crypto backtesting. Captures high-intent switchers.
4. **"Why your backtest is lying to you"** — educational on look-ahead bias + walk-forward. Establishes authority + teaches the concept that makes our validation a moat.
5. **"We backtested 9 years of crypto — the V22 story"** — the proof video. One deep-dive on how the engine produced a +953% strategy. (V22 lives here, as proof — not as the channel's whole identity.)
6. **"Don't Trade This Year"** — counter-content on V22's 2019 −3% + why DD discipline matters.

**Production**:
- Loom screen recordings for week-1 (free)
- Upgrade to OBS + Riverside.fm ($15–$25/mo) once budget allows
- Thumbnails: hire on Fiverr at $25–$75 per thumbnail, or use Canva templates
- Editing: DIY or hire a freelance editor on Upwork at $50–$150/video

**Estimated cost**: $200–$500/mo for editing + thumbnails once you're at 1 video/week.

---

### #3 — Telegram (channel + lead magnet) 🥉

**Why it matters**: Crypto signals + Telegram = native pairing. Every competitor lives here. **Skip Telegram and you give up half the market.**

**Setup**:
- `@StrategyLabsV22Free` — free channel, posts 24h-delayed signals + commentary
- `@StrategyLabsV22Pro` — paid Trader+ channel, realtime signals via the bot we already built
- Auto-post free channel from a scheduled fly job (it's just a 24h-delayed mirror of the live `v22_signals` table)
- Free channel description includes call-to-action: "Get these in realtime → strategylabs.trade"

**Growth**:
- **Cross-promote with other free crypto channels** — message admins, swap shoutouts
- **List on Telegram-channel-finder sites** (Telemetrio, TelegramChannels.me)
- **Buy initial subscribers** (yes, this is a thing) — DON'T DO IT. Fake subscribers tank engagement metrics + your channel gets ghosted by Telegram's algorithm.

**Real lever**: post genuinely useful content (not just signals) — market analysis, infographics, trade explanations. The free channel functions as a content marketing surface, not a signal feed.

**Estimated cost**: $0 to start. Telegram itself is free; channel-admin tooling like Combot ~$10/mo when scale demands it.

---

### #4 — SEO / Blog content

**Why it matters**: With the engine positioning, we target backtesting + strategy-building search intent — `crypto backtesting`, `backtest trading strategy`, `no code trading bot`, `tradingview alternative` — collectively 60k+ monthly searches, and far less scam-saturated than "best crypto signals". Organic SEO compounds — every post is a permanent funnel.

**Cluster strategy** — pick 3 topic clusters, write 5–8 long-form posts in each:

**Cluster 1: "Backtesting" (the new core — highest intent for the engine)**
- "How to backtest a crypto trading strategy (without code)" (target: `crypto backtesting`)
- "TradingView backtesting alternatives for crypto in 2026" (target: `tradingview alternative`)
- "What is walk-forward validation and why your backtest is lying without it"
- "Look-ahead bias: the #1 way backtests fool you"
- "Backtesting vs paper trading vs forward testing — explained"
- "How much historical data do you need to trust a backtest?"

**Cluster 2: "Build a strategy" (mid-funnel, product-led)**
- "How to turn a trading idea into testable rules"
- "No-code crypto trading bots: a 2026 comparison" (target: `no code trading bot`)
- "Composer vs QuantConnect vs Strategy Labs" (target: `composer alternative crypto`)
- "5 simple crypto strategies you can backtest in 30 seconds"
- "RSI, EMA, Bollinger — which indicator actually backtests well?"

**Cluster 3: "Proof + education" (V22 showcase + trust)**
- "We backtested 9 years of crypto — here's what survived" (the V22 story)
- "Why Sharpe ratio matters more than win rate"
- "The 9 worst trading mistakes (with examples from V22's losing years)"
- "Crypto trading vs HODL: a 9-year backtest comparison"
- "BTC regime classifier: detecting bull / bear / chop"

**Why these keywords beat the old ones**: "best crypto signals" searchers are bargain-hunting skeptics who've been burned. "How to backtest a strategy" searchers are curious builders with intent to *do something* — they convert better and churn less. And the comparison posts (vs TradingView/Composer/QuantConnect) capture high-intent switchers.

**Already published**:
- The blog page in the app (`/blog`) — repurpose existing posts as SEO content, add metadata, add a sitemap

**Tools**:
- Ahrefs Lite ($99/mo) OR Ubersuggest ($30/mo) for keyword research
- Frase or SurferSEO for content optimization ($45–$120/mo)
- Cloudflare Pages or Vercel — already on Vercel, just need sitemap.xml + robots.txt added

**Estimated cost**: $80–$200/mo for tools. Time: 6–10 hrs to write one good post.

---

### #5 — Reddit

**Why it matters**: r/cryptocurrency (~7M members), r/algotrading (~1.7M), r/Bitcoin (~6M). Active engaged users, but unforgiving to anything that smells like marketing.

**Strategy**: do NOT post promotional content directly. Instead:
- Become a known account first — answer questions for 3–4 weeks before mentioning your product even once
- When you do post, lead with data: "I open-sourced my 9-year crypto strategy backtest" + screenshot of audit
- AMA in r/algotrading once you have credibility ("I built a trading platform from a single backtest CSV — AMA")
- Comment-marketing: when someone asks "what's the best signal service" — link to your transparency page, not your subscription page

**Risk**: shadowbans are real. Read each subreddit's self-promotion rules. Most allow ~1 post per 10 comments.

**Estimated cost**: $0. Time: 2–3 hrs/week.

---

### #6 — Newsletter sponsorships

**Why it matters**: Crypto newsletters have *exceptionally* high engagement. Subscribers chose to receive them; CTR is 5–15× higher than social. Bonus: the audience pre-qualifies — they've already opted into "I want to learn about crypto".

**Top targets** (descending by audience size):
- **Bankless** — ~150k subs, $5k–$15k per sponsored slot. Crypto-native, sophisticated.
- **Milk Road** — ~250k subs, $3k–$8k per slot. Mass-market retail.
- **The Defiant** — ~70k subs, $1k–$3k per slot. DeFi-focused, premium audience.
- **Decrypt** — ~80k subs, $2k–$5k. News/educational.
- **Crypto.com Bitalk** — varies, mid-tier.

**Cheaper alternatives** (smaller newsletters with high engagement):
- Substack writers in the crypto space with 5k–20k subs — usually $200–$1k per sponsored mention. Cold-outreach the writer directly.

**Ad creative**: don't write a "Buy now!" ad. Write a *valuable* one-paragraph insight from V22's data (e.g. "Our 9-year backtest shows BTC shorts make money 41% more often when BTC is below the daily EMA21 — here's the chart"). End with one link.

**Estimated cost**: $200–$5,000 per placement. Test cheap newsletters first ($200–$500) to calibrate before committing to a $5k Bankless slot.

---

### #7 — Influencer / KOL partnerships

**Why it matters**: One review from a respected crypto YouTuber can outperform 6 months of ads. The risk: many will charge $5k–$50k and deliver nothing. Pick carefully.

**Tier 1 (top): the influencer-led "validation" play**
- Targets: InvestAnswers, Benjamin Cowen, Coin Bureau, CryptosRUs
- These take $20k–$100k for an integrated sponsorship. Skip until you have product-market fit.

**Tier 2 (cost-effective sweet spot): the 50k–500k subscriber range**
- Targets: niche channels like Crypto Banter side-channels, smaller TA-focused YouTubers
- $1k–$8k per integration. Negotiable.
- **Better idea**: instead of paying for an ad, send them a free Trader account + offer to pay them an *affiliate commission* on each conversion via their custom link. Aligns incentives.

**Tier 3 (cheap but works): crypto Twitter micro-influencers**
- 10k–50k follower accounts that post quality TA. They'll often retweet a free month giveaway for nothing more than being given that month.
- $0–$500 per shoutout

**How to structure deals**:
- Always ask for **rev-share or CPA** before a flat fee. CPA at $20–$40 per converted user beats a $5k flat in 90% of cases.
- Avoid "exclusive" deals — never let one influencer block others.
- Track via UTM-tagged URLs (`?utm_source=influencer-name`) so you can measure.

**Estimated cost**: $0 to $30k depending on tier. Start with Tier 3 affiliates.

---

### #8 — ProductHunt / launch platforms

**One-time event, very high impact if done right.**

**Plan**:
- Pick a Tuesday or Wednesday (best ProductHunt days)
- Coordinate launch — get 50+ "hunters" lined up to upvote in the first 4 hours
- Founder posts a long, honest, data-rich launch comment ("Here's why we built this, here's the audit, here's what could go wrong")
- Cross-post simultaneously to HackerNews ("Show HN") + IndieHackers
- Plan for "if we hit #1 of the day" → tweet thread celebrating + driving traffic

**Expected results**: a #1-of-the-day on ProductHunt = ~10k–30k landing-page visits over 48 hours. Conversion rates from PH are LOW (browsers, not buyers) but the SEO + social spillover lasts months.

**Estimated cost**: $0–$200 for some pre-launch coordination tools. Time: 20–30 hrs prep over 2 weeks.

---

### #9 — Discord communities

**Less leverage than Telegram for crypto, but worth a beachhead.**

- Set up `Strategy Labs Community` Discord
- Channels: `#signals` (auto-posts from V22 like Telegram), `#discussion`, `#paper-trading`, `#feedback`, `#announcements`
- Recruit 5–10 active mods from your first 50 paying users (in exchange for free Trader access)
- Cross-link Discord ↔ Telegram so each platform's traffic feeds the other

**Estimated cost**: $0. Time: ongoing community moderation, ~4 hrs/week.

---

### #10 — Email marketing

**Underused in crypto.** Every newsletter / signup goes via email. Build the list aggressively from day 1.

**Free signup → 14-day nurture sequence** (engine-first):
- **Day 0**: Welcome + "test your first idea" — prompt them to run a backtest right now. Activation is the goal.
- **Day 1**: "3 strategies you can backtest in 60 seconds" — give them ideas to test, get them back in the product.
- **Day 3**: "Why your backtest is probably lying to you" — teach look-ahead bias + walk-forward. Positions our validation as the moat + makes them distrust naive backtesters.
- **Day 5**: "We backtested 9 years of crypto — here's what survived (the V22 story)" — NOW introduce V22 as proof the engine produces real edges.
- **Day 7**: Soft pitch — "Run your strategies live + get V22 realtime — here's what Trader unlocks"
- **Day 10**: Social proof — testimonials, "a user tested X and it became their main strategy"
- **Day 14**: Hard pitch — "Start a 7-day free trial of Trader — run your validated strategies live + realtime V22"

**Ongoing**:
- Weekly "Monday market memo" — short market analysis, no overt pitch. Sent to ALL subscribers, paid or free.
- Monthly "V22 month-in-review" — pure data dump. Number of trades, win rate, biggest moves. Even paid users want this.

**Tools**: ConvertKit ($30/mo for 1k subs, $100/mo for 5k) or Beehiiv (free up to 2.5k subs)

**Estimated cost**: $0–$100/mo. Time: 3–4 hrs to write the initial sequence.

---

## 5. Creative Campaign Ideas (use 2–3 of these to differentiate)

> The first three are **backtest-engine-native** and should be your headliners. The rest (Audit Wall, Live Stream, etc.) support the V22-proof / signal-follower side.

### Idea 0A — "I Backtested ___" content engine (THE flagship)
The single highest-leverage marketing motion for the engine positioning. Pick a widely-held crypto belief and test it publicly:
- "I backtested 'buy the golden cross' on BTC over 9 years"
- "I backtested every crypto influencer's favorite RSI strategy"
- "I backtested 'sell in May and go away' for crypto"
- "I backtested buying every Bitcoin halving"

Each becomes: a Twitter thread + a YouTube short + a blog post + a Reddit post. The result is usually counter-intuitive (most beliefs lose money), which drives engagement, debate, and shares. **Every piece ends with "test your own version free."** The content IS the product demo. This is repeatable forever — there's an endless supply of trading myths to test.

**Cost**: $0. Time: 2–3 hrs per myth (run it, screenshot, write). Do 2–3/week.

### Idea 0B — "Strategy Roast" (interactive + viral)
On Twitter/X and in Telegram, invite people to reply with their trading strategy in plain English. You run it through the engine live and reply with the backtested result + chart. Brutal, funny, addictive, and a perfect live demo. Bonus: the good ones become testimonials ("holy sh*t my idea actually works").

**Cost**: $0. Time: a few hours/week of running + replying.

### Idea 0C — "30-Second Verdict" demo video
A tight, looping 30-second screen recording: type a strategy in plain English → hit compile → watch the backtest run → see the verdict (+ equity curve drawing in). This is the single best ad creative + landing-page hero video + ProductHunt asset. Make 5 variations with different strategies.

**Cost**: $0 (Loom/OBS). The most reusable asset you'll make — use it in every paid ad.

---

### Idea 1 — "The Audit Wall"
Public, scrollable page at `strategylabs.trade/audit` showing every single closed trade in V22's history. Tap any trade for full detail (entry, exit, R, why it fired). Use the data we already have. **Marketing message**: "Show me one other signal service with this." We already built most of this in `HistoryDrawer` — just expose it without auth.

**Cost**: $0 (mostly built). 1 day of engineering to expose the route publicly.

### Idea 2 — "Live Trade Stream"
Once a week, founder live-streams himself watching V22 fire signals in realtime. No commentary on whether to take them — just narrating what's happening. Builds authority + entertainment value.

**Cost**: $30/mo Riverside.fm subscription. Time: 1 hour/week.

### Idea 3 — "Pioneer Pricing" (lifetime deal for first 100)
Launch with a "Cohort #1" offer: first 100 customers get **lifetime Trader access for $249** (vs $588/year normal price). Creates urgency + a vocal early-believer community.

Tradeoff: $24,900 cap on initial revenue but locks in 100 evangelist customers who'll refer others.

**Cost**: Lost margin only. Use Lemon Squeezy or Paddle for one-time payment processing.

### Idea 4 — "Bring your own signal" comparison tool
Free tool on the marketing site where users paste another signal service's trade history → we compute the same Sharpe/Win/DD metrics + compare to V22 over the same period. Honest. Devastating.

**Cost**: 3–5 days of engineering. Could go viral.

### Idea 5 — "The Lost Year" content series
**Counter-intuitive marketing.** Publish a series openly addressing V22's WORST moments: the 2019 chop year (−3%), individual losing trades, the 2025 silence. Most signal services lie about their losses. We lead with them.

**Cost**: Time only. Publish via blog, Twitter thread, YouTube video.

### Idea 6 — Public bounty for finding overfitting
Offer $500 to anyone who can find a flaw in V22's walk-forward methodology. Most won't. The very offer is the marketing message.

**Cost**: $500 + maybe an actual payout if someone wins.

### Idea 7 — Affiliate program with tiered rewards
- $20 commission for each Trader signup ($49/mo)
- $50 commission for each Auto signup ($149/mo)
- Pay for 12 months → strong incentive for long-tail bloggers, YouTubers, Twitter accounts
- Self-serve dashboard at `strategylabs.trade/partners`

**Cost**: Engineering time to build (~1 week). Revenue share is post-conversion so no upfront budget.

### Idea 8 — Twitter Pinned Embeds
Build an embeddable "V22 live PnL" widget that anyone can paste into their personal site, Substack, or even tweet via iframely. Every embed is a backlink + brand exposure.

**Cost**: 2–3 days of engineering.

### Idea 9 — Cohort-style "trade-along" challenge
Run a monthly public challenge: announce on Twitter that for the next 30 days, you'll publicly paper-trade alongside V22 on a $10k account. Daily updates. End-of-month writeup. Drives engagement + content.

**Cost**: Time only.

### Idea 10 — Free month for honest reviewer
Reach out to ~20 crypto reviewers/YouTubers and offer them 3 months of free Trader access in exchange for an **honest video review** (not paid). State explicitly: "If you hate it, we want you to say so." 1 in 5 will do a video. 1 in 10 will be glowing. The honesty is the marketing.

**Cost**: $0 cash (just free access).

---

## 6. Paid Advertising Strategy

**The brutal truth about crypto + paid ads**:
- Google Ads — banned for most crypto trading content. Whitelisting required + heavy compliance ($).
- Meta (Facebook/Instagram) — strict regulator/financial vertical, slow approval, frequent rejection.
- TikTok Ads — banned for crypto trading in most major markets.
- Twitter/X Ads — most permissive of the big platforms. **This is where 60% of paid budget should go.**

### Twitter/X Ads (primary)
**Budget**: $1,500–$5,000/mo to start
**Targeting**:
- Interests: cryptocurrency, bitcoin, ethereum, trading, technical analysis
- Followers of: @MartyParty, @TheRoaringKitty, @ApeFollower, top crypto educators
- Lookalike of your existing Twitter followers + email list
**Creative**: 30-second screen-recording videos of audit log scrolling, with a CTA card at the end.
**Expected CPL**: $3–$8 per email signup, $25–$50 per paid conversion.

### Newsletter sponsorships (secondary)
Already covered in §4 #6. **Budget**: $500–$3000/mo across 2–4 placements.

### Reddit Ads
**Budget**: $300–$800/mo
**Targeting**: r/cryptocurrency, r/cryptomarkets, r/algotrading subscribers
**Creative**: long-form "I built this" copy with screenshot. Reddit users tune out "ad-y" creative.

### YouTube pre-roll (via Google Ads · audience targeting)
**Budget**: $500–$2000/mo
**Targeting**: viewers of specific channels (Coin Bureau, InvestAnswers, etc.)
**Creative**: 30-second video, lead with audit + Sharpe number
Note: Google's crypto restrictions still apply — your account needs whitelisting first ($).

### Telegram Ads
Telegram has an official ads platform, but it's expensive and not great for our spend tier. Skip until later.

### What NOT to spend on
- ❌ Generic display ads on retargeting networks (cheap, ineffective)
- ❌ "SEO services" agencies promising rank #1 in 30 days (scams)
- ❌ Email blasts to bought lists (illegal in most regions, also useless)
- ❌ Influencer fees over $5k without rev-share fallback

---

## 7. 90-Day Launch Sequence

### Days 1–14 (Foundation)
- ✅ Domain + email + LLC/setup if not done
- ✅ Build email capture pipeline (Beehiiv or ConvertKit)
- ✅ Set up Twitter, Telegram, Discord, YouTube channels
- ✅ Write 5 blog posts (cluster #1 + 1 from each other cluster)
- ✅ Set up Google Analytics + PostHog/Plausible for product analytics
- ✅ Set up affiliate program backend (track via UTMs)
- ✅ Build the "Audit Wall" public page (Idea #1)
- ✅ Create initial brand assets: logo variants, OG images, social banners
- ✅ Write the 14-day email nurture sequence

**Cost so far**: $200–$400 (tools, fonts, occasional design help)

### Days 15–30 (Soft launch)
- 🚀 Start posting on Twitter daily (4 posts/day, mix of types)
- 🚀 Publish 1 blog post per week to SEO
- 🚀 Open Free Telegram channel — auto-post 24h-delayed signals
- 🚀 Outreach: list 50 crypto YouTubers/influencers, send 25 free-access offers
- 🚀 Get 20–30 founding users via word of mouth + LinkedIn + personal network
- 🚀 Launch the "Cohort #1 lifetime deal" — first 100 at $249
- 🚀 First Twitter Space (Friday, 30 min)

**Goal by day 30**: 500 email signups, 50 free-tier users, 5–10 paid Trader subscribers

### Days 31–60 (Acceleration)
- 🚀 ProductHunt launch (Tuesday, day 35–45 window)
- 🚀 Coordinated launch tweet thread + HN "Show HN" + IndieHackers
- 🚀 Start Twitter Ads campaign ($50/day = $1500/mo)
- 🚀 Sponsor 1 mid-tier newsletter ($500–$1000)
- 🚀 Record + publish 4 YouTube videos (1/week)
- 🚀 Reach out to 5 affiliate partners with tracking links
- 🚀 First "Lost Year" content piece (Idea #5)
- 🚀 Customer interviews with first 5 paid users — write a public case study

**Goal by day 60**: 2000 email signups, 200 free users, 25 paid subscribers ($1,225 MRR)

### Days 61–90 (Scale)
- 🚀 Scale Twitter Ads if CPL is hitting target ($3–$8 per signup)
- 🚀 Add 1 second-tier newsletter sponsorship per month
- 🚀 Launch affiliate program publicly
- 🚀 Bring on first 5 active affiliates
- 🚀 First influencer integration (Tier 3 — micro-influencer + rev-share)
- 🚀 Publish "V22 vs Cornix vs AltSignals" comparison post + tweet thread
- 🚀 Run the "Trade-along challenge" (Idea #9)
- 🚀 Hire a part-time content creator/editor on Upwork to produce videos consistently

**Goal by day 90**: 5000 email signups, 500 free users, 60 paid subscribers ($2,940 MRR), 5 Auto subscribers ($745 MRR), **total ARR ~$44k**

---

## 8. Budget Tiers

### Tier 1 — Bootstrap ($500/month, founder-only effort)
Focus: organic content + Twitter ads only. Slow but sustainable.

| Line | Cost/mo |
|---|---|
| Twitter Blue + Tweet Hunter | $30 |
| ConvertKit email | $30 |
| Twitter Ads | $300 |
| Blog SEO tools (Ubersuggest) | $30 |
| Misc tooling (Loom, Tally, Canva) | $30 |
| Buffer for testing | $80 |
| **Total** | **$500** |

**Realistic outcome at month 6**: 30–50 paid subscribers, ~$1,500–$2,500 MRR

### Tier 2 — Growth ($3,000/month, founder + 1 contractor)
Adds paid newsletter sponsorships, light influencer spend, video production.

| Line | Cost/mo |
|---|---|
| Twitter Ads | $1,500 |
| Newsletter sponsorships (rotation) | $600 |
| YouTube video editing | $400 |
| Tools (SEO, email, analytics) | $200 |
| Tier-3 influencer/affiliate program | $200 |
| Reddit Ads | $100 |
| **Total** | **$3,000** |

**Realistic outcome at month 6**: 150–250 paid subscribers, ~$8,000–$13,000 MRR

### Tier 3 — Aggressive ($10,000+/month, full marketing operator + agency)
Big newsletter slots, tier-2 influencer integrations, dedicated content team.

| Line | Cost/mo |
|---|---|
| Twitter Ads | $3,500 |
| Newsletter sponsorships (premium) | $3,000 |
| YouTube full production | $1,500 |
| Tier-2 influencer integration (avg) | $1,500 |
| Premium tools + analytics | $500 |
| **Total** | **$10,000** |

**Realistic outcome at month 6**: 400–700 paid subscribers, ~$25,000–$40,000 MRR

**Recommendation**: start at Tier 1 ($500/mo) for the first 60 days. Once you hit 50 paid subscribers, you have product-market fit signal — graduate to Tier 2.

---

## 9. Tools & Tech Stack

| Category | Tool | Cost | Why |
|---|---|---|---|
| **Email** | ConvertKit | $30/mo (1k) | Crypto-friendly (Mailchimp can ban) |
| **Email alt** | Beehiiv | Free (2.5k) | Free tier is generous |
| **Twitter mgmt** | Typefully | $19/mo | Threading + scheduling |
| **Analytics** | PostHog Cloud | Free (1M events) | Self-hosted option also |
| **SEO** | Ubersuggest | $30/mo | Cheaper than Ahrefs |
| **Video record** | Loom + Riverside.fm | $0 + $15/mo | Free Loom → Riverside for production |
| **Thumbnails** | Canva Pro | $13/mo | Templates + AI |
| **Landing pages** | Existing Vercel | $0 | Already deployed |
| **Payment** | Stripe | 2.9%+30¢ | Standard |
| **Payment (EU)** | Lemon Squeezy | 5% | MoR handles VAT |
| **Affiliate** | Rewardful or in-house | $49/mo or build | Track UTMs to conversions |
| **Comms** | Slack + Discord | Free | Team + community |
| **Scheduling** | Cal.com | Free | Replace Calendly |
| **Forms** | Tally | Free | Survey, signup, contact |

**Total monthly tooling**: ~$150–$300 depending on tier

---

## 10. KPIs & Measurement

### Top-line metrics (weekly review)
- **Visitors → email signups** (target: 3–6%)
- **Email signups → paid trial** (target: 5–10%)
- **Trial → paid** (target: 40–55%)
- **MRR growth %** (target: 15–30%/mo in months 2–6)

### Activation metrics
- % of signups who join the Free Telegram channel
- % of signups who open ≥3 emails in the nurture sequence
- % of signups who view the Audit Wall

### Retention metrics
- Month 1 → Month 2 retention (target: 75%+)
- Month 1 → Month 6 retention (target: 50%+)
- Churn reasons (qualitative — survey on cancel)

### Channel attribution
- UTM-tagged links everywhere
- "How did you hear about us?" question on signup
- Roll up monthly: which channel drove the most signups / most paid conversions / best LTV?

### Anti-vanity rule
Don't optimize for: follower count, total downloads, post likes. Optimize for: paid subscribers, MRR, retention.

---

## 11. Compliance & Risk

Crypto + paid promotion + signal services = regulatory minefield. Cover yourself:

### Legal must-haves
- **Educational platform disclaimer** prominent everywhere ("Not financial advice. Past performance does not guarantee future results.")
- **Terms of Service** with: liability cap, no-refund policy on subscriptions, jurisdiction (consider Delaware C-corp or BVI)
- **Privacy Policy** GDPR-compliant + CCPA-compliant
- **No US retail without thinking hard** — selling "trading signals" to US retail traders may invoke SEC/CFTC scrutiny under "investment advisor" rules. Geofence US IPs from paid tiers OR consult a US securities lawyer before going broad in US.

### Ad-platform compliance
- Twitter, Reddit, YouTube all allow crypto with caveats. Get your business verified BEFORE writing campaigns.
- Google Ads requires "Crypto Services" certification — apply early, takes 2–4 weeks.
- Always include disclaimers in ad creative.

### Backed-up data
- Maintain audit log of every claim made on the marketing site (the +953%, 49.3% etc.) — store the underlying CSV + computation script in case audited
- Update the live numbers monthly from fresh backtest CSV — never let outdated stats sit on the page

### Trade execution liability (for Auto tier)
- Auto-execute = direct API access to user's exchange = HIGHER liability tier
- Mandatory "risk acknowledgment" checkbox on Auto signup
- Position-size limits enforced by code (e.g. max 1% of account per trade)
- Insurance: get errors-and-omissions coverage once Auto MRR > $5k

---

## 12. First 7 Days — Tactical Action Plan

If you start tomorrow, this is what to do:

### Day 1
- [ ] Buy `@StrategyLabs` on Twitter, Instagram, YouTube, Telegram, Discord
- [ ] Create branded OG images (1200×630) for the landing page
- [ ] Sign up for ConvertKit, set up the email account + sender verification
- [ ] Install PostHog or Plausible on the landing page

### Day 2
- [ ] Write the 14-day nurture sequence (~6 hrs)
- [ ] Sign up for Typefully or Tweet Hunter

### Day 3
- [ ] Set up Free Telegram channel
- [ ] Write the "Audit Wall" route in the app (expose `/v22/history` as a public page)
- [ ] Write first blog post: "How to backtest a crypto strategy without code" (1500 words, targets `crypto backtesting`)
- [ ] Record the "30-Second Verdict" demo video (Idea 0C) — your #1 reusable asset

### Day 4
- [ ] Pinned tweet: the 30-second demo video — "Test any trading idea in 30 seconds"
- [ ] First "I backtested ___" thread (Idea 0A) — pick a popular belief, post the real result
- [ ] Cross-post the demo to LinkedIn + r/algotrading

### Day 5
- [ ] Write outreach template for influencer/reviewer "free access in exchange for honest review"
- [ ] Send to 20 targets
- [ ] First newsletter email: welcome email kicks in for any new signup

### Day 6
- [ ] Record first short video: founder explaining V22 in 5 min. Upload to YouTube + Twitter
- [ ] Schedule the first 2 weeks of Twitter content via Typefully

### Day 7
- [ ] Launch the "Cohort #1 lifetime deal" — Twitter announcement + email blast
- [ ] First Twitter Space (Friday evening)
- [ ] Review: what's working, what's not. Recalibrate for week 2.

---

## 13. Things This Document Doesn't Cover (yet)

- **In-person events** (intentionally excluded per scope)
- **Crypto conferences** (Token2049, Consensus, etc. — $5k–$50k investment, defer to year 2)
- **Press / PR** (CoinDesk, The Block coverage — requires PR firm, $5k+/mo retainer)
- **B2B sales** (selling V22 white-label to hedge funds — different motion entirely)
- **International / non-English markets** (Asia, LatAm — language localization + local KOLs)
- **Mobile app launch marketing** (when we ship iOS/Android)

Each of these is its own playbook. Park them. Master the online motion first.

---

## Appendix A — Useful Reading

- **"Traction" by Gabriel Weinberg** — channel-by-channel growth taxonomy
- **"Show Your Work" by Austin Kleon** — the philosophy behind transparent marketing
- **"From Impossible to Inevitable" by Aaron Ross** — sales process discipline (when you scale)
- **Lenny's Newsletter** — applied B2C SaaS marketing tactics, $20/mo
- **First Round Review** — case studies (free)

## Appendix B — Recurring Calendar

- **Daily** (15 min): post on Twitter, check engagement, reply to comments
- **Monday**: send Monday Market Memo email + post recap to socials
- **Wednesday**: publish 1 piece of long-form content (blog or YouTube)
- **Friday 5pm**: host 30-min Twitter Space
- **Last Friday of month**: publish month-in-review (data dump for credibility)
- **Quarterly**: refresh the V22 backtest CSVs + audit numbers on the site

---

*This is a living document. Edit it monthly as you learn what's working.*

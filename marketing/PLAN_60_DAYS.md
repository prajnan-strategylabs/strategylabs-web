# Strategy Labs — 60-Day Marketing Plan (Jul 19 – Sep 16, 2026)

Written as a handover by the outgoing head of marketing. Everything here is
executable by one founder at ~5 focused hours/week plus an AI session for
content production. No step in this plan requires information that isn't in
this document, the repo, or the listed data sources.

---

## 0. Where we are (verified baseline, Jul 18)

| Metric | Value | Source |
|---|---|---|
| Play Store installs (28d) | 5 | Play Console |
| Monthly active devices | 4 | Play Console |
| X followers | 6 (112 posts) | @StrategyLabs_ |
| Email list | 22 raw / 20 real | Supabase `waitlist` |
| Blog posts live | 2 | strategylabs.trade/blog |
| Paying subscribers | 0 | RevenueCat |
| ASO | Finance category live, short-desc A/B running | Play Console |

What is unusually strong: the proof assets. A public 1,946-trade backtest CSV,
a live signal log running since 2017 (+142% YTD 2026, verified against the
showcase API), a rebuilt honest backtest engine, and a UI that (as of commit
e1f79a6) contains zero fabricated numbers. Almost nobody in crypto can run a
"here are all our losers" strategy. We can.

What is weak: distribution. Every channel we own is empty. The prior calendar
assumed ~20 hrs/week and silently slipped two weeks; this plan assumes 5.

## 1. The three bets

Everything in the next 60 days serves one of these. If a task doesn't, skip it.

**Bet 1 — Receipts distribution.** Put the proof assets where audiences
already exist instead of broadcasting to empty rooms. Reddit weekly, Product
Hunt once, daily replies on large accounts. Community first, own channels
second: every asset premieres where the audience is, then gets recycled to
our feed/blog/newsletter, never the reverse.

**Bet 2 — SEO compounding.** Two long-form posts a week against long-tail
keywords, each with its own URL (per-post routes shipped), internal links,
and Search Console submission. Expect near-zero traffic until week 6-8.
That's normal. This is the only channel that works while we sleep.

**Bet 3 — Product-led loops.** Convert users into distribution: share cards,
public result links, enough free runs to reach the "aha" moment. This bet is
gated on the engineering asks in section 6. Marketing can't outrun a funnel
that dead-ends.

## 2. Targets for Sep 16 (day 60)

Honest stretch numbers, not fantasy. Baseline is effectively zero everywhere.

- 500 cumulative Play installs
- 400 web signups, of which 250 activated (ran ≥1 backtest)
- 500 emails on the list
- 300 X followers
- 10 paying subscribers (~$200 MRR). The point is proving willingness to pay
  exists, not the revenue.
- 3 blog posts on page 1-2 of Google for their target keyword (early signal)
- 10+ Play Store reviews, 4.0+ average

Miss the numbers but learn which channel converts: acceptable. Hit the
numbers without knowing which channel did it: not acceptable. Instrument
everything (UTMs on every link except Reddit, which gets bare domain).

## 3. Phase plan

### Phase 1 — Ignition (Jul 19 – Jul 27)

Goal: spend our first one-shot (Reddit) and prepare the second (PH) without
botching either. Ship the launch-blocking basics.

- **Jul 19-20:** Founder sends the waitlist launch email (draft exists, 20
  recipients, personalized greeting, from personal address). Same weekend:
  personally ask the 5 most engaged users for an honest Play Store review.
- **Jul 20-22 (weekday AM US Eastern):** r/algotrading data post goes live
  (background task prepared it; founder approves + posts). CSV hosted
  publicly first. Founder stays in-thread for the first 2 hours; AI drafts
  data-cut replies from the CSV on request. Add the post link as a reply to
  the pinned X thread.
- **Jul 24:** Blog #3 "Break-Retest-Go: the pattern that drove most of an
  8-year backtest" (calendar item exists; verify every number against the
  trade log before publish). Same-day X thread, community-first: post the
  chart + finding as a reply under a relevant large account first.
- **Jul 26:** Newsletter #1 of the new cadence ("We published the trade
  log"). Biweekly from here (alternating Sundays).
- **Jul 26-27:** PH pack final review (assets from background task), schedule
  launch, tease to email list ("we launch Tuesday, tell us what's broken").
- Daily throughout: reply engine (section 5.1), 15 min.

### Phase 2 — Launch window (Jul 28 – Aug 10)

Goal: extract maximum value from Product Hunt and convert the attention.

- **Tue Jul 28:** Product Hunt launch. Live 12:31pm IST. Maker comment
  immediately. Reply blocks 3pm / 6:30pm / 9:30pm IST. X launch tweet
  12:45pm, thread 7pm. Email list gets the "we're live on PH, come poke
  holes" note in the morning. Never ask for upvotes anywhere.
- **Jul 29:** Honest PH recap on X with real numbers, whatever they are.
  Losing gracefully in public IS our brand; a mediocre rank stated plainly
  earns more trust than silence.
- **Jul 30 – Aug 2:** "What 48 hours on Product Hunt taught us" blog + the
  feedback-to-fixes list published openly. Reply to every single PH comment.
- **Week of Aug 3:** Second Reddit post, different community and angle:
  r/CryptoCurrency "I backtested 5 popular crypto beliefs, here's what
  actually held up" (compiles Golden Cross, RSI<30, Sell-in-May, weekend dip,
  DCA — all already backtested with real numbers on file). Blog #4 and #5 per
  the SEO keyword list.
- **Fri Aug 7:** Checkpoint 1 (section 7). First A/B test readout attempt.

### Phase 3 — Compounding engine (Aug 11 – Sep 16)

Goal: lock a repeatable weekly rhythm and let the loops run. No new channels.

The standard week (total ~5 hrs founder time):
- **Mon:** Community post day. Alternate: r/algotrading methodology post,
  r/CryptoCurrency belief-bust, r/SideProject build-in-public update, Quora
  answer batch (5 answers). 90 min.
- **Tue:** Blog post A publishes + its X thread. AI drafts, founder reviews
  20 min.
- **Wed:** Reply blitz: 30 min, 8-10 quality replies on 10k+ accounts.
- **Thu:** Product/marketing sync with AI session: metrics pull, next week's
  drafts queued, one experiment decided. 60 min.
- **Sat:** Blog post B publishes + share-worthy result card posted (one real
  backtest finding as an image). 30 min.
- **Sun (biweekly):** Newsletter. AI drafts Friday, founder sends. 30 min.
- Daily: 10-15 min replies at 7pm IST alongside the scheduled own-post.

Monthly anchors:
- **Aug 17:** ASO A/B test conclusion (30 days of data). Ship winner, start
  test #2 (app icon or feature graphic).
- **Aug 28:** Checkpoint 2 + month-1-of-plan public recap ("every number,
  including the embarrassing ones" format from the calendar, now with real
  post-launch data). Decide the paid experiment (section 8).
- **Sep 12-16:** Day-60 review against section 2 targets. Write the next
  60-day plan from what the data says, not from this document's assumptions.

## 4. Content engine rules

- **1 backtest = 7 assets**, community-first ordering: Reddit/PH post →
  X thread → blog post → newsletter section → result card image → Quora
  answer → (later) video script. Never produce an asset without a parent
  backtest.
- **Backlog of parent backtests already verified and unused:** DCA vs lump
  sum, weekend dip (negative result, great hook), Sell-in-May yearly
  breakdown, RSI<30 across 58 pairs, regime cross-tab (51.7% vs 35.8% vs
  19.0%), 70.3% zero-signal days, per-pair and per-year cuts of the 1,946
  CSV. That is 8+ weeks of material with zero new research required.
- **Verified numbers only.** Sources of truth: `crypto-bot/swingbot/
  strategy_3/s3s5_v22_top47_8yr.csv` (recompute, never quote from memory),
  `https://strategylabs-api.fly.dev/api/v1/showcase/v22` (live/YTD figures),
  the belief-backtest scripts. If a number can't be reproduced on demand in
  a reply thread, it doesn't get published.
- **Compliance:** never use Make money / Guaranteed / Risk-free / Get rich /
  Beat the market / Financial advice / Investment opportunity / Profitable.
  Every public asset carries "Educational tool. Past performance does not
  predict future results." No em-dashes in any copy.
- **Voice:** quiet confidence, numbers first, losers included, no alpha-bro
  vocabulary. If a sentence would look at home in a signal-seller's Telegram,
  rewrite it.

## 5. Channel playbooks

### 5.1 X / Twitter (@StrategyLabs_)
- Cadence: 1 own post daily 7pm IST (from the content bank), 1 thread weekly
  (Tue), 3-5 replies daily.
- The reply engine is the actual growth mechanism at 6 followers. Target
  accounts: 10k-500k follower quant/crypto/trading-tool accounts. Reply types
  that worked Jul 18: add-a-real-number, witty contrarian, genuine question.
  Never link-drop in replies; the profile does the converting.
- Kill criterion: under 50 followers by Aug 15 → cut own posts to 3/week,
  double replies. The feed becomes a portfolio, not a channel.

### 5.2 Reddit
- 1 quality post/week max, rotating subreddits, data-first, tool mentioned
  once at the end, bare domain, no UTM. Maintain a 10:1 comment-to-post
  ratio; karma is the entry fee.
- Have the mod-removal contingency ready: polite modmail template, offer to
  strip the tool mention entirely, repost adjusted. The content works even
  with zero product mention because the CSV is the hero.

### 5.3 Blog / SEO
- 2 posts/week (Tue, Sat), 1,200+ words, one target keyword each, submitted
  to Search Console on publish, internal links to prior posts + signal log.
- Keyword queue: how to backtest a crypto strategy (no code) / walk-forward
  validation trading / does DCA work crypto / RSI strategy backtest results /
  best crypto backtesting tools 2026 / TradingView alternative backtesting /
  sell in may crypto / regime filter trading strategy.
- Do not judge this channel before week 8. Judge it by impressions in Search
  Console, not clicks, until then.

### 5.4 Newsletter (Beehiiv)
- Biweekly Sundays. Format: one real backtest finding, one build-in-public
  note, one number from the week, one ask (reply with a strategy idea).
- List growth comes from the site footer, blog CTAs, Reddit bio, PH.

### 5.5 Play Store / ASO
- A/B test running (short description). Readout Aug 17, ship winner, queue
  icon test. Reviews: personal asks only, target 10+ by Sep 16. Reply to
  every review within 48h.

### 5.6 Paused (do not restart before Aug 28 checkpoint)
YouTube, X Spaces, press outreach, podcast pitches, paid ads, partnerships.
Reason: each costs founder-hours that Bets 1-3 need, and none work at
current audience size. Revisit only if a checkpoint shows capacity to spare.

## 6. Product asks (ranked, with the marketing case)

1. **3 free backtest runs** (currently 1). The aha moment routinely needs
   2-3 attempts ("no trades triggered" → loosen → success). One fumbled
   prompt currently ends the relationship. Cheapest activation win available.
2. **Public share links.** The share card exists as an image; add a public
   URL per result ("/r/abc123") with OG tags. Every shared result becomes an
   inbound door. This is Bet 3's engine.
3. **Web checkout (Stripe).** All pricing CTAs currently funnel web users to
   a dead end; purchases are Android-only. Every Reddit/PH/SEO visitor who
   wants to pay on web currently can't.
4. **Empty-feed framing.** ~70% of days have zero signals by design. The
   empty state should say so ("0 signals today. The filter rejected
   everything. That's the system working."), or the quiet feed reads as
   broken to every new user.
5. **Auto tier truth check.** If Binance/Bybit auto-execution isn't live,
   remove or mark it "waitlist" on the pricing page before PH. Selling
   vaporware to the PH crowd is a public flogging.
6. **Unified stat block.** One component, fed by the showcase API, used on
   landing/blog/social templates, with the configuration stated next to it.
   Kills the "your numbers don't match" attack permanently.

## 7. Measurement

Friday scoreboard, 15 minutes, five numbers, written into the repo
(`marketing/SCOREBOARD.md`, one row per week):

| # | Metric | Source |
|---|---|---|
| 1 | Cumulative Play installs | Play Console |
| 2 | Web signups (cumulative) | Supabase profiles count |
| 3 | Activated users (≥1 backtest run) | Supabase backtest_runs distinct users |
| 4 | Email list size | Beehiiv / waitlist table |
| 5 | X followers | profile |

Checkpoints (Fri Aug 7, Fri Aug 28): compare channel-attributed signups.
Pivot rules, decided in advance so the data decides, not mood:
- Any channel producing >3x the signups/hour of the median → double its
  cadence, cut the worst channel by half.
- Reply engine converting (profile visits → follows >5%) → raise to 8/day.
- Blog impressions flat at zero by week 8 → cut to 1/week, reallocate to
  Reddit.
- PH >300 upvotes → immediately pitch the 3 tech newsletters that cover PH
  winners (this is the one press exception).

## 8. Budget ($100/month)

- Month 1 (Jul 19 – Aug 17): $0 spent. Hold. Free tiers cover everything
  (Beehiiv <2.5k subs, Typefully free, Canva free).
- Month 2 (Aug 18 – Sep 16): decide at Aug 28 checkpoint between (a) $100 X
  boost on the single best-performing organic post as a paid-reach probe, or
  (b) $100 on a micro-influencer quote-tweet from a 20-50k quant account, or
  (c) continue holding. Never spend on cold display ads at this list size.

## 9. Risks and pre-written responses

- **PH flops (<50 upvotes):** publish the honest recap anyway; the recap
  IS content. Fold learnings into the "relaunch later" option (PH allows
  relaunches after meaningful product changes, e.g. web checkout).
- **Reddit post removed:** modmail template, strip promo, repost within the
  week in the next community on the rotation.
- **A quant finds a real flaw in the engine or data:** thank them publicly,
  fix it, publish the post-mortem. Our positioning makes errors survivable;
  only cover-ups are fatal. Never argue with someone holding a correct
  criticism.
- **Founder time crunch week:** the Minimum Viable Week is 90 minutes: daily
  scheduled post already queued (10 min), one reply session (30 min), Friday
  scoreboard (15 min), approve one AI-drafted blog post (30 min). Everything
  else can slip a week without breaking the system.
- **Compliance complaint / platform flag:** take the asset down first, argue
  second. The word list in section 4 is non-negotiable.

## 10. Handover notes

- Everything published so far and every verified number lives in: the
  Notion Marketing HQ (calendar history), `marketing/*.md` (drafted copy),
  the trade-log CSV, and the showcase API. Trust those over memory.
- The single non-negotiable inherited rule: **never publish a number you
  didn't verify against source data this week.** The brand is receipts.
  One invented number ends it.
- The prior calendar's mistake was scope, not ideas. When behind, cut scope,
  never cut verification, and never go silent: one honest "we shipped
  nothing this week" post beats a fabricated streak.

*Educational tool. Not financial advice. Past performance does not predict
future results.*

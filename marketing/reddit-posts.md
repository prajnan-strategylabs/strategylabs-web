# Strategy Labs — Reddit Value Posts

**Rules of engagement (or these get removed as ads):** lead with value, the app is one low-key line at the end. Do NOT make the first comment the link. Answer method questions in replies for the first 30+ min to build credibility before anyone clicks. Do NOT cross-post the same copy to both subs on the same day — they have different norms. Best window: US weekday mornings (8–10am ET).

---

## POST 1 — r/algotrading
UTM: `utm_source=reddit&utm_campaign=algotrading`

**Title:** I backtested the classic "buy RSI < 30" dip on 8 years of crypto. The naive version loses to buy-and-hold. One regime filter flips it on the majors. (full methodology inside)

**Body:**

"Buy when RSI drops below 30" is probably the most repeated entry signal in retail crypto. I kept seeing it asserted and never tested, so I ran it properly. Sharing the full setup and the numbers — including the part where the obvious version of the rule underperforms doing nothing.

**The setup**

- **Universe:** 47 crypto pairs, daily candles, ~8 years of data (covers two full bull/bear cycles, which matters — a rule that only saw 2021 is useless).
- **Baseline to beat:** buy-and-hold the same pair over the same window. If a "strategy" can't beat HODL after costs, it's not a strategy, it's a fee generator.
- **Validation:** walk-forward, not a single in-sample fit. I split the history into rolling train/test windows, tuned only on the train slice, and recorded results *only* on the out-of-sample slice that followed. Numbers below are out-of-sample unless stated.
- **Costs:** flat fee + slippage assumption baked into every fill. Skip this and every mean-reversion strategy looks like a money printer.
- **Sample size:** I only kept results where the out-of-sample trade count was high enough to not be noise. A 64% win rate on 11 trades tells you nothing.

**Finding 1 — the naive RSI dip is a trap**

Rule: RSI(14) crosses below 30, buy. Exit when RSI crosses back above 50.

Out-of-sample, aggregated across the universe, this **underperformed buy-and-hold** on the majority of pairs. The win rate looked fine in isolation (often 55-60%), which is exactly how this rule keeps getting recommended. But **the average loser was bigger than the average winner**, and — the killer — it was systematically *out of the market during the strongest trend legs*. In a market that spends long stretches grinding up, a rule that keeps selling back into "neutral" RSI bleeds the upside that actually pays for the drawdowns.

This is the classic mean-reversion-in-a-trending-asset problem. RSI 30 fires constantly in a downtrend, so you catch every falling knife on the way down and exit early on the way up.

**Finding 2 — gating the same signal by regime flips it**

Same entry (RSI < 30), one filter added: only take the dip if price is above its 200-day moving average. In other words, only buy dips when the longer trend is still up. Everything else identical — same exit, same costs, same walk-forward windows.

That single regime filter:
- cut the trade count substantially (you're skipping every dip in a confirmed downtrend),
- shrank max drawdown meaningfully because you stop knife-catching in bear legs,
- and on a chunk of the majors, the *filtered* version cleared buy-and-hold out-of-sample where the naive version didn't.

The lesson isn't "this filter is magic." It's that the entry signal everyone argues about was never the important variable. **The regime context around the signal was.** Same RSI trigger, opposite conclusion, depending entirely on whether you let it fire in downtrends.

**What I'd actually take away from this**

1. A good win rate means nothing without payoff ratio and out-of-sample trade count next to it.
2. Always carry buy-and-hold as your benchmark. In crypto specifically, beating HODL after costs is a high bar and most discretionary rules don't.
3. In-sample backtests are marketing. Walk-forward / out-of-sample is the only version worth showing anyone.
4. The signal is usually less important than the regime you allow it to trade in.

None of this is a recommendation to trade RSI dips. It's a worked example of how to separate a real edge from a story. The point of testing is to find which ideas survive contact with out-of-sample data — most don't, and that's the useful information.

Happy to share the exact RSI/MA parameters and the per-pair out-of-sample breakdown in the comments if people want to pick it apart. Genuinely interested if anyone's tested the inverse regime filter (only buy dips *below* the 200MA) — I got worse results but small sample.

---

I built a tool that runs these kinds of plain-English rules across the data without writing code — happy to share if useful: https://strategylabs.trade/?utm_source=reddit&utm_campaign=algotrading

*Educational tool. Not financial advice. Past performance does not predict future results.*

---

## POST 2 — r/CryptoCurrency
UTM: bare domain only (a tracked link increases removal risk here — keep it low-key)

**Title:** I backtested the "buy the dip" rule on 8 years of crypto data. The version everyone repeats is the one with no exit plan.

**Body:**

"Buy the dip" might be the most repeated advice in crypto. It's also the vaguest. Dip from what? How big a dip? Buy how much? Sell when?

I got tired of nodding along to it, so I actually defined it and ran it against ~8 years of BTC daily data to see if the slogan holds up. Sharing what I found because most of us have lost money to advice that sounds smart but was never actually checked.

A few honest caveats before the numbers: this is one asset (BTC), daily candles, spot only, no leverage, and it ignores fees/slippage. It's a teaching example, not a strategy you should copy. Real testing would run across many pairs and account for costs. But it's enough to show the point.

**The vague version people actually trade**

The way most people run "buy the dip" in practice: price drops a few percent in a day, feels cheap, you ape in. No exit rule. You just hold and hope, and usually you buy again when it drops more.

When you turn that into actual rules — "buy any day BTC closes down 3%+, no defined exit, keep adding on further drops" — it performs badly. Not because dips are bad, but because there's no plan for what happens after you buy. You end up loading up hardest right as price keeps falling, then bag-holding through the worst of it. The "rule" is really just buying fear with no structure.

**What changes when you add the boring missing pieces**

Three things, none of them clever:

1. **Define the dip relative to a trend, not just yesterday.** A 3% drop in a strong uptrend is a very different thing from a 3% drop while price is bleeding below its 200-day average. Same -3%, opposite meaning.

2. **Have an exit before you have an entry.** A fixed take-profit and a fixed stop. Boring. The single biggest difference between "I have a strategy" and "I have a feeling" is whether you wrote down when you sell *before* you bought.

3. **Size the same every time.** Not "more when I'm extra sure." Conviction sizing is where the account-ending losses come from.

The trend-filtered, exit-defined version doesn't win every trade. It still has losing months and ugly stretches. But it stops doing the one thing the vague version does constantly: buying harder into a falling knife with no way out.

**The actual lesson (this is the part that matters)**

The point isn't "here's the magic dip rule." There isn't one, and anyone selling you one is selling you something.

The point is that "buy the dip" was never a strategy — it was a vibe. The moment you force yourself to define it precisely enough to test (what's a dip, when do I exit, how much do I buy), two things happen:

- Most of the advice you've been following quietly falls apart.
- The few rules that actually hold up start to look very different from what crypto Twitter repeats.

You don't need to be right about the future. You need to know whether your idea would have even survived the past before you bet real money on it. Almost nobody checks. That's the whole edge.

If you've got a strategy you trade or want to try, the cheapest thing you can do is write it down as exact rules and test it on history first. Most ideas die there, for free, instead of in your wallet.

---

*Full disclosure since the rules require it: I'm building a tool that does this kind of plain-English backtesting (strategylabs.trade). Mentioning it once for context, not pitching — the testing approach above works with any backtester, including free ones. Happy to talk method in the comments.*

*Educational tool. Not financial advice. Past performance does not predict future results.*

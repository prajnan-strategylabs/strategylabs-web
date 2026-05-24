# Trading Strategy Background

> The strategy that powers Strategy Labs's showcase. This is the proof-of-concept that the platform's backtest engine actually finds real edges.

---

## TL;DR

**v22** — a two-strategy ensemble (S3 + S5) across 47 USDT pairs on Binance:

| Period | PnL | Return | Max DD | Trades | WR |
|---|---|---|---|---|---|
| 8-year (2017-2024) | +$39,196 | +784% | 8.57% | 1,946 | 49.2% |
| YTD 2026 (5 months) | +$4,538 | +91% | 4.77% | 171 | 50.9% |

Walk-forward validated. Survived Monte Carlo + slippage stress tests.

---

## Architecture

```
Daily Regime Classifier (ADX + Choppiness Index + EMA21 slope, 2-of-3 consensus)
    │
    ├─ TRENDING regime
    │     ├─ S3: 4H/1H Pullback to EMA21 (pullback signal)
    │     └─ S5: Break-Retest-Go (continuation signal)
    │
    └─ RANGING / TRANSITIONAL regime
          └─ S5: Break-Retest-Go (only)

Both strategies share:
  - Trail 1.5x ATR → tightens to 1.0x ATR at +3R
  - Per-symbol 72h SL cooldown
  - DD brake (size shrinks during drawdown)
  - BTC regime gate (S5 longs only when BTC > EMA21)
  - ATR 4-tier sizing
  - 47-symbol watchlist (top by Binance volume)
```

---

## Strategy 3 (S3) — Pullback to EMA21

**Active in:** TRENDING regime only

**Signal logic (4H):**
- Daily trend = bull or bear (EMA stack alignment)
- Price has pulled back to EMA21
- RSI in 35-60 range (reset)
- Conviction candle (body > 50% of range)
- BTC regime gate (no longs in correction)

**Entry refinement:** 1H confirmation candle
**Stop:** below entry candle low - 1.0×ATR
**Targets:** TP1 at nearest S/R level (min 2R)
**Trail:** ATR-based after TP1

**Performance contribution (8yr):**
- 125 trades
- 28% WR
- Avg win: $236 / Avg loss: $48
- PnL: $3,929 (10% of total)

---

## Strategy 5 (S5) — Break-Retest-Go (the workhorse)

**Active in:** ALL regimes (parallel with S3 in TRENDING)

**Pattern (the textbook professional setup):**
1. **Breakout candle** — 4H closes outside Bollinger Band (20, 2)
2. **Retest within 6 candles** — price comes back toward the broken band
3. **Reclaim confirmation** — candle closes back in breakout direction with body ≥ 50%

**Stop:** retest swing extreme ± 0.5×ATR
**TP1:** 2× stop distance (RR 2.0)
**TP2:** 4× stop distance

**Filters:**
- BTC regime gate (longs only if BTC > EMA21)
- ATR not in CHAOS tier (skip if >5%)
- Min RR = 2.0

**Performance contribution (8yr):**
- 1,821 trades
- 49% WR
- Avg win: $76 / Avg loss: $38
- PnL: $35,267 (90% of total) ← the engine

---

## Key insights from the data

### Profit is ULTRA-concentrated in busy days

| Day type | % of days | % of PnL |
|---|---|---|
| 1-2 trade days | 70% | ≈ 0% |
| 3-4 trade days | 18% | 25% |
| 5-9 trade days | 11% | 47% |
| **10+ trade days** | **2%** | **29%** |

**Implication:** A user who misses one 10+ trade day loses ~5% of annual PnL. **This is why auto-execution is the high-value SKU.**

### When trades fire

95% of signals fire at 4H candle close times (00, 04, 08, 12, 16, 20 UTC). Users only need to check 6 times per day.

### What we tested and rejected

| Idea | Result | Why it failed |
|---|---|---|
| Pyramid at +1R with BE stop | -$766/3yr | Swing trades retest entry; BE stop chops winners |
| Wider trail (2.5× flat) | -$1,800/8yr | Gives back too much on smaller winners |
| RS filter (long only outperformers) | -$2,233/3yr | Weak alts rip on sector rotation |
| S4 mean reversion in chop | -$286/3yr | TRANSITIONAL → falling knife |
| S4 single-candle breakout in chop | -$4,768/3yr | 80% fakeout rate |
| Streak pause | not adopted | Risks missing recovery rally |
| Compound sizing without DD brake | DD blew to 15% | Amplified losses in 2020 grind |

### What works (current production stack)

| Layer | Detail |
|---|---|
| Regime classifier | 2-of-3 consensus on ADX/CI/EMA-slope |
| S3 entry | EMA21 pullback with 1H refinement |
| S5 entry | Break-Retest-Go pattern |
| Exit | Trail 1.5× ATR → 1.0× at +3R |
| Sizing | 1% risk × ATR 4-tier × DD brake |
| Cooldown | 72h per symbol after SL |
| BTC gate | S3 and S5 longs blocked when BTC < EMA21 |
| Watchlist | 47 USDT pairs (top by volume) |

---

## Robustness audit (v21, similar profile to v22)

- **Walk-forward split:** PASS (test period 2023-2024 outperformed training)
- **Monte Carlo (10K trade-order shuffles):** P95 DD = 19% (manageable but above 15% threshold)
- **Slippage stress** (0.15% slip + 0.05% fee per side): PASS — PnL drops 26% but stays positive ($13.8K over 8yr post-friction)

---

## Where this lives in code

**Repository:** `../crypto-bot/swingbot/strategy_3/` (sibling to this app project)

**Key files:**
- `backtest.py` — main entry point, two-phase time-ordered engine
- `signal_engine.py` — live signal scanner
- `strategy_5_signal.py` — Break-Retest-Go signal detector
- `config.py` — all tunable parameters
- `robustness_audit.py` — walk-forward + Monte Carlo + slippage tests
- `data_cache/` — cached OHLCV (47 symbols × 3 timeframes, ~117MB)

**To run a backtest manually (for debugging):**
```bash
cd ../crypto-bot/swingbot/strategy_3
python backtest.py --start 2017-01-01 --end 2025-01-01 --save s3s5_test.csv
```

---

## How this connects to the platform

The trading strategy in `crypto-bot/` is the **first showcase strategy** on Strategy Labs. The platform's value isn't this specific strategy — it's the **framework** that lets users:

1. Describe their OWN strategy idea in plain English
2. Have AI translate it into a structured spec (JSON)
3. Run it through the same backtest engine (the Python code in `crypto-bot/`)
4. Get robustness audit (walk-forward + MC + slippage)
5. Subscribe to live signals if their strategy holds up

So:
- **The trading strategy** = compelling marketing proof + safety net for early users
- **The platform** = the actual product (let users test their own ideas)
- **The Python backtest engine** = the moat (8 years of cached data + battle-tested code)

---

## Phase expansion plan

| Phase | Asset class | Data source |
|---|---|---|
| 1 (now) | Crypto (47 pairs) | Binance (free, cached) |
| 2 (M6+) | Gold + Silver | PAXG/USDT (Binance) + yfinance |
| 3 (M12+) | US stocks (top 500) | Polygon.io or Tiingo |
| 4 (M18+) | Forex (top 20 pairs) | OANDA REST |
| 5 (M24+) | Indices, commodities | Same |

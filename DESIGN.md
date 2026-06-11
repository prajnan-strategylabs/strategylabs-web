# Strategy Labs — Design System Architecture v1

The spec for rebuilding the UI as an elite native-grade application. Every
implementation PR should reference a section of this document. Reference class:
Linear (discipline), Robinhood (data display), iOS HIG (motion & navigation).

---

## 1. Design philosophy

Three rules that override everything else:

1. **Hierarchy through restraint, not decoration.** One accent moment per
   screen. If everything glows, nothing does. Gradients, glows, and animated
   pulses are currently spent on idle UI — they must be reserved for *state
   changes the user caused*.
2. **Data is the interface.** Numbers are the product. They get the best
   typography on screen (largest, tightest, tabular), and they NEVER flash,
   reflow, or change font. Skeleton-first: no real-looking placeholder values,
   ever.
3. **Motion explains, never entertains.** Every animation answers "where did
   this come from / where did it go". No idle pulsing, no ambient animation
   except explicitly "live" indicators (max one per screen).

Anti-patterns to remove on sight (the "vibe-coded" tells):
- `animate-pulse` on static icons (e.g. the Zap in the runs counter)
- Two different fonts for the same kind of number
- Arbitrary one-off values: `text-[10.5px]`, `h-13`, `blur-[1.5px]`
- Glow blobs on idle cards
- Uppercase micro-labels with 5 different tracking values

---

## 2. Design tokens

Single source of truth: CSS custom properties in `src/index.css`, mirrored in
`tailwind.config.js`. No raw hex values in components — ever.

### 2.1 Color — layered surface system

Dark theme only (current). Surfaces are a ladder, not random alphas:

```css
:root {
  /* Surfaces — each step is one elevation up */
  --surface-0: #070b14;   /* app background (slightly deeper than today) */
  --surface-1: #0d1322;   /* cards */
  --surface-2: #131a2c;   /* elevated: sheets, popovers, inputs */
  --surface-3: #1a2238;   /* highest: pressed rows, active chips */

  /* Ink — one base color, alpha ladder (replaces 3 fixed grays) */
  --ink-100: rgba(232, 236, 245, 1.0);   /* primary text */
  --ink-70:  rgba(232, 236, 245, 0.70);  /* secondary */
  --ink-45:  rgba(232, 236, 245, 0.45);  /* tertiary / labels */
  --ink-25:  rgba(232, 236, 245, 0.25);  /* disabled / hairline icons */

  /* Hairlines */
  --line:       rgba(232, 236, 245, 0.08);
  --line-strong: rgba(232, 236, 245, 0.14);

  /* Brand & semantic — accent keeps brand teal */
  --accent:        #2ee6b8;
  --accent-pressed:#26c9a1;
  --accent-soft:   rgba(46, 230, 184, 0.12);  /* fills behind accent content */
  --positive:      #2ee6b8;                    /* gains = accent (one green) */
  --negative:      #ff5c7a;
  --negative-soft: rgba(255, 92, 122, 0.12);
  --warning:       #ffb02e;
  --warning-soft:  rgba(255, 176, 46, 0.10);
}
```

Rules:
- Backgrounds use surfaces only. Borders use `--line` only. Text uses ink ladder only.
- `--accent` is for: primary CTA, active nav state, positive numbers, live dot. Nothing else.
- Soft fills (`*-soft`) never get borders of the same hue — pick fill OR border, not both.
- The body radial-gradient glow stays but at half current opacity, surface-0 base.

### 2.2 Spacing & radius

4pt grid. Allowed spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
Screen gutter: 20px mobile (`px-5`), max-width 480px for the app shell on web.

Radius scale (continuous-corner feel — pair radius with padding):
- `--r-sm: 10px` chips, small buttons
- `--r-md: 14px` inputs, list rows, stat tiles
- `--r-lg: 20px` cards
- `--r-xl: 28px` sheets, hero cards
- Full pill only for the live-dot pill and tab indicator.

### 2.3 Elevation

Borders carry elevation on dark UI, shadows are secondary:
- Level 1 (card): `border: 1px solid var(--line)`, no shadow
- Level 2 (sheet/popover): `border: 1px solid var(--line-strong)` + `0 16px 48px rgba(0,0,0,0.45)`
- Pressed: surface steps UP one level (`--surface-3`), no scale on rows (scale is for buttons only)

---

## 3. Typography

Two families, strict roles:
- **Inter** (variable, `font-feature-settings: "cv11", "ss01"`) — ALL text and ALL numbers.
  Numbers in data contexts use `font-variant-numeric: tabular-nums` — same family,
  so values never change typeface between loading/empty/loaded states.
- **JetBrains Mono** — ONLY the rules-spec/code view and the compiling terminal.
  Never for stats, prices, or returns.

Type scale (size / line-height / weight / tracking):

| Token        | Spec                          | Usage                          |
|--------------|-------------------------------|--------------------------------|
| display      | 40 / 44 / 800 / -0.03em       | hero return %                  |
| title-1      | 28 / 32 / 800 / -0.02em       | screen titles ("Hey, Trader")  |
| title-2      | 20 / 24 / 700 / -0.01em       | section headers                |
| headline     | 16 / 22 / 650 / 0             | card titles, row titles        |
| body         | 14.5 / 21 / 450 / 0           | default text — nothing readable below this |
| footnote     | 12.5 / 17 / 500 / 0           | secondary metadata             |
| caption      | 11 / 14 / 600 / 0.06em UPPER  | the ONE allowed micro-label style |
| stat         | 22 / 26 / 750 / -0.01em + tabular | metric tile values         |

Rules:
- Exactly ONE uppercase label style (caption). Delete the current zoo of
  `text-[9px]/[10px]/[11px]` × `tracking-[0.15em]/[0.18em]/[0.2em]` variants.
- Body text minimum 12.5px. The current 9–10.5px text is illegible on device.
- Implement as Tailwind utilities: `text-display`, `text-title-1`, … via theme config.

---

## 4. Motion system

One vocabulary, defined once in `tailwind.config.js` + CSS:

```
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);     /* default everything */
--ease-spring:    cubic-bezier(0.34, 1.3, 0.64, 1);  /* sheets, count-ups */
Durations: 120ms (press), 200ms (state), 280ms (enter), 360ms (sheet/page)
```

| Pattern | Spec |
|---|---|
| Press (buttons) | scale 0.97, 120ms. Rows/cards: surface-3 fill instead of scale |
| Enter (content) | opacity 0→1 + translateY 8px→0, 280ms ease-out-quart, stagger 40ms/item (max 6) |
| Page/tab change | outgoing fades 80ms; incoming slides 12px + fade 280ms |
| Sheet | translateY 100%→0, 360ms ease-spring; scrim fade 200ms; drag-to-dismiss follows finger 1:1 |
| Numbers | count-up once on first real data (600ms ease-out-quart). Never on refresh. No fake ticking (delete the random PnL drift in Dashboard) |
| Skeleton | shimmer (translate gradient), not opacity pulse; matches exact final dimensions |
| Stage transitions (Lab) | crossfade + 12px slide between stepper stages; stepper bar animates width 280ms |

Hard rules: animate ONLY `transform` and `opacity` (60fps on mid-range Android).
Respect `prefers-reduced-motion`. Every tap that changes state = 15ms haptic pulse
(existing `hapticLight()`), success moments = same pulse (per user preference).

---

## 5. Component library — `src/ui/`

New directory: pure presentational primitives, zero business logic, every
component consumes tokens only. Pages compose primitives; pages stop carrying
their own one-off styling.

```
src/ui/
  Button.tsx      primary | secondary | ghost | destructive × sm(36) | md(44) | lg(52)
  Card.tsx        surface level 1, r-lg, p-5; <Card.Header/Title/Caption>
  Sheet.tsx       bottom sheet: drag handle, spring, safe-area, scrim, drag-dismiss
  SegmentedControl.tsx  sliding thumb (transform), replaces ad-hoc toggles
  Chip.tsx        selectable pill (the indicator/timeframe chips graduate here)
  StatTile.tsx    caption + stat value + footnote + optional info flip (from MetricCard)
  ListRow.tsx     leading tile / title / sub / trailing value+chevron, pressed=surface-3
  Skeleton.tsx    shimmer block, exact-dimension variants: .text .stat .row .heroNumber
  Banner.tsx      info | warning | error, optional action slot (free-runs + error+retry)
  LiveDot.tsx     THE one ambient animation
  EmptyState.tsx  icon + headline + body + single CTA
  Toast.tsx       (migrate existing Toaster to tokens; spring entrance)
  NavBar.tsx      large-title header: collapses 28px→16px into top bar on scroll
  TabBar.tsx      bottom tabs (see §6)
```

Modal policy: on mobile EVERYTHING that interrupts is a Sheet (upgrade/upsell,
trader-name onboarding, trade list, audit report). Centered dialogs are a
desktop-web-only affordance.

---

## 6. App shell & navigation

- **Tab bar**: fixed bottom, `--surface-1` at 92% + `backdrop-blur-xl`, hairline
  top border, safe-area padding. 4 tabs: icon 24px + 10px label. Active = accent
  icon + label + 3px pill indicator that slides between tabs (transform).
  Haptic on switch. Hidden when keyboard open (existing) AND on inner
  detail/sheet views.
- **Header**: large-title pattern. Title-1 at rest; on scroll past 24px it
  shrinks into a 56px pinned bar (headline weight) with hairline border.
  Implemented once in `NavBar.tsx`, used by all four tabs.
- **Screen transitions**: tab switches use the page-change motion (§4). Back
  gestures: Android back already handled; detail views slide in from right
  16px + fade.
- **Pull-to-refresh** on Dashboard & Signals: native-feeling rubber-band with
  accent spinner (transform-driven).
- **Scroll**: `overscroll-behavior` containment per scroll area; momentum
  preserved; no nested scroll traps.

---

## 7. Screen redesigns

### 7.1 Dashboard
- NavBar large-title: "Hey, {name}" + footnote date. Notification bell in the
  collapsed bar, not floating.
- Hero card (r-xl, surface-1): caption "YOUR STRATEGIES · BACKTEST P&L",
  display-size return, equity curve. Curve draws once (600ms) on first data.
  DELETE the fake PnL ticking interval.
- Stat row: 3 × StatTile. Quick actions: 2 ListRows (not gradient cards).
- Strategy list: ListRow with leading sparkline tile, trailing return
  (positive/negative color) + chevron.
- States: skeleton (shimmer, exact layout) → empty (EmptyState) → data. No
  intermediate flash; loading shows NOTHING numeric (already fixed, keep rule).

### 7.2 Strategy Lab
- The stage machine becomes spatial: stages slide horizontally (input ⇆ spec ⇆
  result), stepper is a thin animated progress bar under the NavBar.
- Input: textarea visually IS the screen (surface-2, r-lg, body size 16px to
  prevent iOS zoom later). Mic + chips row directly beneath; chips use Chip
  primitive; selected chips render as removable tokens.
- Compiling: keep the terminal (it's distinctive) but mono 13px and a real
  progress affordance: step list with check-in animations (staggered).
- Spec view: rules in cards per rule-group (Entry / Exit / Risk) instead of one
  code block; mono ONLY inside rule expressions. Free-run Banner above CTA.
- Run button: lg Button, full-width, fixed above tab bar with gradient-fade
  scrim behind it (content scrolls under).
- Backtesting: full-screen takeover — progress %, equity curve drawing live,
  caption status lines. This is the app's signature moment; it earns the only
  big animation in the product.
- Result: hero verdict card → StatTile grid (info-flip stays) → yearly table →
  audit. Share = secondary Button in hero. Sticky bottom CTA: "Save & go live"
  (primary) / "Refine" (ghost).

### 7.3 Signals
- V22 hero: LiveDot + caption "V22 SCANNER · LIVE", stat trio, sparkline.
- Signal rows: ListRow — asset tile, pair + direction chip, trailing entry
  price + age footnote. Locked rows: real content, 1 unlocked sample, rest
  collapsed under an upgrade Banner (never blur).

### 7.4 Login / Onboarding
- Logo, title-1, ONE primary button, footnote legal. Trader-name capture moves
  into Sheet with autofocus; LabTour restyles onto Card primitive.

### 7.5 Paywall (sheet, replaces modal)
- Caption state line ("You've used your free backtest"), price toggle as
  SegmentedControl, feature list with check icons, primary CTA, footnote
  restore-purchases. Standard mobile paywall anatomy — users recognize it.

---

## 8. Implementation phases

Each phase ships independently; nothing breaks between phases.

1. **Foundation** — tokens into index.css + tailwind.config (map old names to
   new so existing pages keep working), type scale utilities, motion tokens,
   Inter variable font self-hosted (delete Google Fonts request — faster boot,
   no FOUT inside the APK).
2. **Primitives** — build `src/ui/` components + Skeleton/Sheet/TabBar/NavBar.
3. **Shell** — AppLayout rebuilt on TabBar + NavBar, page transitions,
   pull-to-refresh.
4. **Dashboard** — first full screen on the new system (sets the standard).
5. **Lab** — biggest screen, stage transitions + backtesting takeover.
6. **Signals + paywall sheet.**
7. **Login/onboarding + sweep** — delete every legacy one-off style; grep-audit
   for raw hex, `text-[`, `tracking-[`, `animate-pulse`.

Definition of done per screen: zero raw hex / arbitrary values, all text ≥
12.5px, one uppercase style, skeleton-first loading, transform/opacity-only
animation, haptic on every state-changing tap.

-- ============================================================================
-- Strategy Labs — Initial Schema (v1)
-- ============================================================================
-- Run this in Supabase SQL Editor (or via `supabase db push` once CLI is set up)
--
-- Tables:
--   waitlist        : pre-launch email captures (anonymous insert allowed)
--   profiles        : user metadata + subscription tier
--   strategies      : user-defined trading strategies (spec stored as JSONB)
--   backtest_runs   : results of running a strategy against historical data
--   signals         : live signals emitted from running strategies
--
-- Security model: Row Level Security (RLS) enabled on all user data tables.
-- ============================================================================


-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ────────────────────────────────────────────────────────────────────────────
-- 1.  WAITLIST
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid          primary key default uuid_generate_v4(),
  email       text          not null unique,
  source      text          null,                   -- "hero", "footer", "twitter-thread", etc.
  referrer    text          null,                   -- document.referrer at signup
  utm         jsonb         null,                   -- { utm_source, utm_campaign, utm_medium }
  notes       text          null,
  created_at  timestamptz   not null default now()
);

comment on table public.waitlist is 'Pre-launch email captures from anonymous visitors.';

create index if not exists waitlist_email_idx       on public.waitlist (lower(email));
create index if not exists waitlist_created_at_idx  on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Anyone (even anon) can INSERT into waitlist.
drop policy if exists "anyone can join waitlist" on public.waitlist;
create policy "anyone can join waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- Nobody can read waitlist via the API (admin-only via service role key).
-- This protects user emails from being scraped.
-- (No SELECT policy = no access for anon/authenticated.)


-- ────────────────────────────────────────────────────────────────────────────
-- 2.  PROFILES — extends auth.users with our own metadata
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  email           text        not null unique,
  display_name    text        null,
  tier            text        not null default 'free'
                              check (tier in ('free','trader','auto')),
  tier_status     text        null
                              check (tier_status in ('active','trialing','past_due','canceled')),
  tier_renews_at  timestamptz null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is 'Extended user metadata + subscription tier.';

alter table public.profiles enable row level security;

-- Users can read + update their own profile only.
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create profile row when a new auth.users row is inserted (signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────────────────────
-- 3.  STRATEGIES — user-defined trading strategies
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.strategies (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  name            text        not null,
  spec            jsonb       not null,                -- strategy rules JSON
  source_prompt   text        null,                   -- original user prompt if AI-generated
  status          text        not null default 'draft'
                              check (status in ('draft','backtesting','ready','live','paused','archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.strategies is 'User-defined strategies (spec stored as JSONB).';

create index if not exists strategies_user_id_idx    on public.strategies (user_id);
create index if not exists strategies_status_idx     on public.strategies (status);

alter table public.strategies enable row level security;

drop policy if exists "users CRUD own strategies" on public.strategies;
create policy "users CRUD own strategies"
  on public.strategies for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ────────────────────────────────────────────────────────────────────────────
-- 4.  BACKTEST_RUNS — results of backtesting a strategy
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.backtest_runs (
  id              uuid        primary key default uuid_generate_v4(),
  strategy_id     uuid        not null references public.strategies(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  start_date      date        not null,
  end_date        date        not null,
  stats           jsonb       null,                   -- { total_pnl, win_rate, max_dd, profit_factor }
  trades          jsonb       null,                   -- trade-by-trade results
  robustness      jsonb       null,                   -- { walk_fwd, monte_carlo, slippage }
  status          text        not null default 'queued'
                              check (status in ('queued','running','completed','failed')),
  error           text        null,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz null
);

comment on table public.backtest_runs is 'Results of backtesting strategies.';

create index if not exists bt_runs_user_idx        on public.backtest_runs (user_id);
create index if not exists bt_runs_strategy_idx    on public.backtest_runs (strategy_id);
create index if not exists bt_runs_status_idx      on public.backtest_runs (status);

alter table public.backtest_runs enable row level security;

drop policy if exists "users read own backtests" on public.backtest_runs;
create policy "users read own backtests"
  on public.backtest_runs for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users insert own backtests" on public.backtest_runs;
create policy "users insert own backtests"
  on public.backtest_runs for insert
  to authenticated
  with check (user_id = auth.uid());


-- ────────────────────────────────────────────────────────────────────────────
-- 5.  SIGNALS — live signals from running strategies
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.signals (
  id              uuid        primary key default uuid_generate_v4(),
  strategy_id     uuid        not null references public.strategies(id) on delete cascade,
  symbol          text        not null,
  direction       text        not null check (direction in ('long','short')),
  entry           numeric     not null,
  stop_loss       numeric     not null,
  tp1             numeric     not null,
  tp2             numeric     null,
  rr              numeric     not null,
  rsi             numeric     null,
  atr_pct         numeric     null,
  regime          text        null,
  status          text        not null default 'new'
                              check (status in ('new','filled','stopped','closed_tp','closed_trail','expired')),
  pnl_usd         numeric     null,
  exit_price      numeric     null,
  exit_reason     text        null,
  created_at      timestamptz not null default now(),
  closed_at       timestamptz null
);

comment on table public.signals is 'Live signals emitted from running strategies.';

create index if not exists signals_strategy_idx     on public.signals (strategy_id);
create index if not exists signals_status_idx       on public.signals (status);
create index if not exists signals_created_at_idx   on public.signals (created_at desc);

alter table public.signals enable row level security;

-- Users can read signals from strategies they own.
drop policy if exists "users read own strategy signals" on public.signals;
create policy "users read own strategy signals"
  on public.signals for select
  to authenticated
  using (
    exists (
      select 1 from public.strategies s
      where s.id = signals.strategy_id
        and s.user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- 6.  UPDATED_AT TRIGGER (shared)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_updated   on public.profiles;
create trigger profiles_updated
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

drop trigger if exists strategies_updated on public.strategies;
create trigger strategies_updated
  before update on public.strategies
  for each row execute procedure public.touch_updated_at();

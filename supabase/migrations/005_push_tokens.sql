-- ────────────────────────────────────────────────────────────────────────────
-- push_tokens — native FCM device tokens for Strategy Labs mobile app, used
-- to fire an OS-level push notification when a V22 signal opens or closes.
-- Separate from telegram_subscriptions: a user can have both, either, or
-- neither channel enabled. One row per (user_id, token) — a user can have
-- multiple devices registered at once.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.push_tokens (
    id            bigserial primary key,
    user_id       uuid        not null references auth.users(id) on delete cascade,
    token         text        not null,                 -- FCM registration token
    platform      text        not null default 'android',
    enabled       boolean     not null default true,     -- user can pause without unregistering
    last_sent_at  timestamptz,                           -- for audit / debugging delivery
    created_at    timestamptz not null default now()
);

create unique index if not exists push_tokens_token_idx
    on public.push_tokens (token);
create index if not exists push_tokens_user_idx
    on public.push_tokens (user_id)
    where enabled = true;

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Users can read / update / delete their own rows only. Inserts (token
-- registration) go through the service-role backend (bypasses RLS) since the
-- upsert-by-token logic needs to check across all users' tokens.
alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens_self_read"   on public.push_tokens;
create policy        "push_tokens_self_read"
    on public.push_tokens for select using (auth.uid() = user_id);

drop policy if exists "push_tokens_self_update" on public.push_tokens;
create policy        "push_tokens_self_update"
    on public.push_tokens for update using (auth.uid() = user_id);

drop policy if exists "push_tokens_self_delete" on public.push_tokens;
create policy        "push_tokens_self_delete"
    on public.push_tokens for delete using (auth.uid() = user_id);

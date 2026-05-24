# Supabase Setup — 5 Minute Walkthrough

Get your local Strategy Labs talking to a real database.

---

## Step 1 — Create the Supabase project (2 min)

1. Go to **https://supabase.com** and sign up (GitHub login is fastest)
2. Click **"New project"**
3. Fill in:
   - **Name:** `strategy-labs`
   - **Database password:** click "Generate a password" → **SAVE THIS SOMEWHERE SAFE** (you'll need it later for direct DB access)
   - **Region:** pick the one closest to your users. For global launch, US-East-1 or EU-West is safe.
   - **Pricing plan:** Free (you can upgrade to $25/mo Pro later)
4. Click **"Create new project"** — wait ~2 minutes while it provisions

---

## Step 2 — Run the schema migration (1 min)

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Open the file in this repo: `supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents and paste into the SQL editor
5. Click **"Run"** (or `Ctrl+Enter`)

You should see: `Success. No rows returned.`

If you click **Table Editor** on the left, you should now see 5 new tables:
- `waitlist`
- `profiles`
- `strategies`
- `backtest_runs`
- `signals`

---

## Step 3 — Grab your env vars (1 min)

Supabase migrated to a new key format in late 2024. You'll see **two key types**:

1. In Supabase: click **Settings** (gear icon) → **API**
2. You'll see two sections:

   ### **Publishable key** (use this in the browser)
   - Starts with `sb_publishable_...`
   - Safe to expose publicly **as long as you have Row Level Security enabled** (we do — the migration sets it up)
   - This is what replaces the old `anon` JWT key

   ### **Secret key** (NEVER put in the browser)
   - Starts with `sb_secret_...`
   - Has admin privileges — bypasses RLS
   - Only use server-side (Python backend, edge functions, cron jobs)
   - This is what replaces the old `service_role` JWT key

3. Copy the **Project URL** (top of API page) and the **Publishable key**

4. Open `.env.local` in your project root and fill them in:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Only fill this in if you'll run server-side scripts locally.
# NEVER prefix this one with VITE_ (Vite would leak it to the browser).
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=Strategy Labs
```

5. **Restart your dev server:**
   ```bash
   # Stop the running `npm run dev` (Ctrl+C)
   npm run dev
   ```

### Why two keys?

| | Old format (still works) | New format (preferred) |
|---|---|---|
| Public/browser | `anon` (JWT, `eyJ...`) | `sb_publishable_...` |
| Server/admin | `service_role` (JWT, `eyJ...`) | `sb_secret_...` |

The publishable key is easier to spot in code reviews (clearly distinguishable from the secret key by prefix), and Supabase will eventually deprecate the JWT-style keys. Use the new format for new projects.

---

## Step 4 — Test the waitlist (1 min)

1. Open http://localhost:5173 in your browser
2. Scroll to the hero email form
3. Enter a real email and click "Join waitlist"
4. You should see "You're on the list."
5. Go back to Supabase → **Table Editor** → **waitlist**
6. You should see your email row! 🎉

If you submit the same email a second time:
- The form will say "You're already on the list" (idempotent, no error)
- The database will NOT create a duplicate (handled by the unique constraint)

---

## Step 5 — Verify security (optional but recommended)

The whole point of Row Level Security (RLS) is that even if someone gets your `anon` key, they can't scrape your waitlist.

Test it:
1. In Supabase SQL Editor, run:
   ```sql
   select * from waitlist;   -- This works because YOU are the admin
   ```
2. From your app (via the Supabase client), do:
   ```ts
   const { data, error } = await supabase.from("waitlist").select("*");
   console.log(data, error);
   ```
3. You should see: `data: null, error: ...` — RLS blocks reads from the public API.
4. ✅ Your emails are safe.

---

## What's protected vs. open

| Table | INSERT (anon) | SELECT (anon) | UPDATE/DELETE (anon) |
|---|---|---|---|
| `waitlist` | ✅ Allowed | ❌ Blocked | ❌ Blocked |
| `profiles` | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| `strategies` | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| `backtest_runs` | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| `signals` | ❌ Blocked | ❌ Blocked | ❌ Blocked |

Once you add Supabase Auth (Phase 2), `authenticated` users will only see their OWN rows for the user tables.

---

## Troubleshooting

**"Could not join right now" error**
- Check browser DevTools → Console for the actual error
- Most likely cause: `.env.local` not loaded → restart `npm run dev`

**"duplicate key value violates unique constraint"**
- This is fine — the form already handles it gracefully and shows "already on list"

**Page shows waitlist worked but no row in DB**
- You're hitting the localStorage fallback (Supabase client is `null`)
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are both set in `.env.local`
- Both must start with `VITE_` (Vite ignores any others on the frontend)
- Restart `npm run dev` after changing `.env.local`

**RLS blocks my own admin queries from the dashboard**
- Use the SQL Editor — it runs as `service_role` and bypasses RLS automatically.

---

## When to upgrade from free tier

You're fine on Free tier until you hit one of these:
- 500 MB database → ~5 million waitlist rows. Lifetime in early stages.
- 50,000 monthly active users — only counts authenticated users, not anon waitlist
- 5 GB egress / month → ~5K visitors/day before you'd hit this

Upgrade to **Pro ($25/mo)** when you cross 10K monthly visitors. By then you'll have revenue.

---

## What we built (recap)

```
strategylabs/
├── .env.local                              ← Supabase credentials (NEVER commit)
├── .env.example                            ← template for other devs
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql          ← all tables + RLS policies
├── src/
│   ├── lib/
│   │   ├── supabase.ts                     ← typed client (or null in dev)
│   │   ├── db-types.ts                     ← TypeScript types for tables
│   │   └── waitlist.ts                     ← joinWaitlist() with fallback
│   └── components/
│       └── Hero.tsx                        ← uses joinWaitlist()
```

---

## Next steps after this works

1. **Deploy to Vercel** so `strategylabs.trade` shows the live waitlist page
   - Vercel auto-detects Vite. Add the same env vars in Vercel project settings.

2. **Add Supabase Auth** so users can sign up for free tier accounts
   - Email + magic link is easiest (no password to manage)

3. **Build the AI Strategy Lab page** — the killer feature
   - User describes a strategy → Claude API → JSON spec → backtest → results

4. **Wire the Python backend** to listen to `strategies` table changes
   - Each new strategy → kick off backtest worker → write results back to `backtest_runs`

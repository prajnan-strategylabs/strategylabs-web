-- Restrict subscription tiers to the current public model:
-- Free, Trader, Auto.

update public.profiles
set tier = case
  when tier = 'auto' then 'auto'
  when tier = 'trader' then 'trader'
  else 'free'
end;

alter table public.profiles
  drop constraint if exists profiles_tier_check;

alter table public.profiles
  add constraint profiles_tier_check
  check (tier in ('free', 'trader', 'auto'));

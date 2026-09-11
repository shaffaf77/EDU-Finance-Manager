# Enabling cross-device sync

By default this app saves data only to the browser it's opened in. To make your
data follow you across your phone and laptop, connect a free Supabase project —
it's your own private database and login, not shared with anyone (including
Anthropic).

This is a one-time setup, about 5 minutes.

## 1. Create a free Supabase project

1. Go to https://supabase.com and sign up (free tier is enough for this).
2. Click "New project". Pick any name and a strong database password (save it
   somewhere safe — you won't need it day-to-day, but keep it).
3. Wait a minute or two for the project to finish provisioning.

## 2. Create the data table

1. In your new project, open the **SQL Editor** (left sidebar).
2. Paste in the snippet below and click **Run**.

```sql
create table public.app_state (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "Users can view own state"
  on public.app_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own state"
  on public.app_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own state"
  on public.app_state for update
  using (auth.uid() = user_id);
```

This creates one table where each signed-in user can only ever read or write
their own row — enforced by the database itself (Row Level Security), not just
by the app's code.

## 3. (Recommended for personal use) Turn off email confirmation

1. Go to **Authentication → Providers → Email**.
2. Turn off "Confirm email" so you can sign in immediately after creating your
   account, without clicking a confirmation link. (You can leave it on if you'd
   rather have that extra step — you'll just need to check your inbox once
   after signing up.)

## 4. Get your project URL and anon key

1. Go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key (NOT the `service_role`
   key — that one must never be used in a browser app).

## 5. Connect the app

1. Open the app (on the device/browser you're using now).
2. Go to **Settings → Sync**.
3. Paste in the Project URL and anon key, click **Save & connect**.
4. Create an account with an email and password, then sign in.
5. Your current data uploads automatically.

## 6. On your other device

1. Open the same live web address (e.g. your Netlify/GitHub Pages URL).
2. Go to **Settings → Sync**, paste in the *same* Project URL and anon key.
3. Sign in with the *same* email and password.
4. Your data downloads automatically.

From then on, every change syncs in the background whenever you're online.
If you edit on two devices while offline at the same time, whichever change
was saved most recently wins — there's no merge of individual fields.

## Notes

- The anon key is meant to be public/embedded in client apps — it's not a
  secret by itself. Your data is protected by the Row Level Security policies
  above, not by hiding the key.
- Never paste your `service_role` key into this app or anywhere in the
  browser — it bypasses Row Level Security entirely.
- You can disconnect at any time from Settings → Sync → "Change project
  connection." Your local copy on each device stays intact either way.

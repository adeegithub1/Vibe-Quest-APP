# VibeQuest

**Don't just scroll. Go do something.**

A production-architecture rebuild of the VibeQuest prototype: Next.js (App Router) + TypeScript + Tailwind + Framer Motion on the frontend, Supabase (Postgres + Auth + Storage + RLS) on the backend, with all gamification (XP/level/streak/badges) enforced server-side.

## Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Storage)
- **AI:** Server-side route (`app/api/generate-mission`) calling the Anthropic API — the key never reaches the browser
- **Deployment:** Vercel (frontend + API routes) + Supabase (database/auth/storage)
- **PWA:** manifest + service worker + offline fallback, installable on mobile

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run in order:
   - `supabase/schema.sql` — tables, triggers, the nearby-missions RPC
   - `supabase/rls.sql` — Row Level Security policies (**critical** — this is what stops the client from writing its own XP)
   - `supabase/seed.sql` — starter badges + a mission per mood
3. In **Authentication → Providers**, enable Email and (optionally) Google.
4. In **Authentication → URL Configuration**, add your deployed URL and `http://localhost:3000` as redirect URLs (for `/auth/callback`).
5. Copy your Project URL, anon key, and service role key.

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, used by app/api/complete-mission
ANTHROPIC_API_KEY=            # server-only, used by app/api/generate-mission
```

If `ANTHROPIC_API_KEY` is unset, `lib/ai.ts` falls back to a deterministic local
generator so the AI screen still works end-to-end in development.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. New accounts are routed through `/onboarding`,
which writes `city` + a `preferences` JSON blob onto the user's `profiles` row.

## 4. Deploy

- **Vercel:** import the repo, add the four env vars above in Project Settings → Environment Variables, deploy. `middleware.ts` refreshes the Supabase session on every request.
- **Supabase:** already live from step 1 — no separate deploy step, just keep the schema/RLS files as your source of truth (or wire them into `supabase db push` / migrations).

## How the security model works

The brief's core rule — *the frontend never touches XP directly* — is enforced two ways:

1. **RLS trigger** (`supabase/rls.sql`): any `UPDATE` to `profiles` that changes `xp`, `level`, `streak`, `longest_streak`, or `missions_completed` is rejected unless the request is authenticated with the **service role** key.
2. **Server-only write path** (`app/api/complete-mission/route.ts`): the only code that holds the service role key. It re-reads the mission's real XP reward from the database (ignoring anything the client claims), recomputes level/streak/badges via `lib/gamification.ts`, and writes the result.

`app/api/generate-mission/route.ts` follows the same "server holds the secret" pattern for `ANTHROPIC_API_KEY`.

## What's fully wired vs. stubbed

**Fully wired:** auth (email + Google), onboarding → `profiles.preferences`, mood-based and AI-generated missions persisted to Postgres, step-by-step mission completion with server-validated XP/streak/badge awards, community feed (real posts/likes from Supabase), leaderboards (global/city/friends/weekly, all computed from live data), profile + badges, geolocation-based nearby missions via a Postgres RPC, PWA manifest + offline fallback.

**Stubbed / next steps** (flagged inline in code so they're easy to find):
- **Photo/video proof upload** — `mission_completions.proof_image_url` exists and RLS is ready, but the Supabase Storage upload UI isn't wired into `MissionRunner` yet.
- **Comments UI** — the `comments` table + RLS policies exist; there's no comment composer in `CommunityPost` yet.
- **Report / block user** — `reports` and `friendships(status='blocked')` exist in the schema; no UI yet.
- **Group mission creation UI** — joining works (`/api/group-missions/[id]/join`); there's no "create a group mission" form yet.
- **Realtime** — Supabase Realtime isn't subscribed anywhere yet (e.g. live leaderboard/feed updates); everything currently re-fetches on navigation.
- **Maps** — Explore uses a CSS gradient placeholder + a Postgres haversine RPC for "nearby," as the brief specifies for MVP; swapping in Mapbox/Google Maps is a drop-in replacement for that panel.

## Project structure

```
app/
  (app)/            # protected screens, wrapped with BottomNavigation
    home/ missions/ explore/ community/ profile/ leaderboard/ ai/
  onboarding/
  auth/login/  auth/callback/
  api/
    generate-mission/   # AI mission generator (server-side key)
    complete-mission/   # secure XP/streak/badge award
    nearby-missions/    # geolocation RPC wrapper
    posts/[id]/like/
    group-missions/[id]/join/
components/         # BottomNavigation, VibeDial, MissionCard, MissionRunner,
                     # AIChat, CommunityPost, Leaderboard, MoodSelector, ...
lib/
  supabase/          # client.ts, server.ts, middleware.ts
  gamification.ts    # levels, XP curve, badge rules (server-only logic)
  missions.ts        # moods, categories, mood→category mapping
  ai.ts              # Anthropic call + zod validation + local fallback
types/database.ts    # shared types mirroring the Postgres schema
supabase/
  schema.sql  rls.sql  seed.sql
```

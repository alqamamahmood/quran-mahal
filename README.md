# Quran Mahal — Premium Islamic Media & Learning Platform

Next.js 15 (App Router) + TypeScript + Tailwind CSS frontend, Supabase (PostgreSQL + Auth + Storage)
backend. Emerald/gold Islamic-inspired design, Urdu/Roman/English with RTL, dark mode, PWA-ready.

## Quick start (5 minutes, no Supabase needed)

```bash
cd quran-mahal
npm install
npm run dev
# open http://localhost:3000 — runs in SAMPLE MODE with clearly-marked sample content
```

Sample mode lets you click through every page. Real data appears once Supabase is configured.

## Full setup (Supabase)

1. Create a project at https://supabase.com → copy **Project URL** and **anon key**.
2. **SQL Editor** → run the migrations in order:
   - `supabase/migrations/20261031000001_schema.sql`
   - `supabase/migrations/20261031000002_rls.sql`
   - `supabase/migrations/20261031000003_seed.sql`
   - `supabase/migrations/20261031000004_helpers.sql`
   (or `supabase db push` with the Supabase CLI)
3. **Storage** → create buckets: `media-public` (public), `media-private` (private),
   `covers` (public), `documents` (private). See `docs/INTEGRATIONS.md` for policies.
4. Copy `.env.example` → `.env.local`, fill in the Supabase values.
5. **Authentication** → enable Email provider. (Optional: Google OAuth — see INTEGRATIONS.md.)
6. Make yourself admin — in SQL Editor:
   ```sql
   insert into public.user_roles (user_id, role_id)
   select 'YOUR-AUTH-USER-UUID', id from public.roles where name = 'super_administrator';
   ```
   Find your UUID in Authentication → Users after you register/log in once.
7. `npm run dev` → log in → open `/admin`.

## Project structure

```
src/
  app/                    # Routes (public, dashboard, admin, api)
    (auth)/               # login, register, forgot/reset password
    admin/                # Guarded admin panel (/admin)
    dashboard/            # Authenticated user area
    api/search            # JSON search API (also for future mobile apps)
    api/webhooks/stripe   # Verified Stripe webhook (503 until configured)
  components/
    ui/                   # Design system: Button, Card, Badge, Input…
    layout/               # Header, Footer, BottomNav, providers
    media/                # VideoPlayer, MiniPlayer, audio context
    content/              # ContentCard, FavoriteButton, ShareButton…
    admin/                # ContentTable, ContentForm, ContentList
    dashboard/            # Continue-watching/listening
  lib/
    supabase/             # browser/server clients, middleware, session
    auth/roles.ts         # requireUser/requireStaff/requireAdmin guards
    i18n/                 # en/ur/roman dictionaries + RTL provider
    content.ts            # Data access (Supabase with sample-data fallback)
    sample-data.ts         # Clearly-marked SAMPLE content (dev only)
supabase/migrations/      # Schema, RLS, seed, helpers
docs/                     # DEPLOYMENT, TESTING, INTEGRATIONS
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |

## Key behaviors

- **Auth**: Supabase Auth (email/password, verification, reset). Profile row auto-created by DB trigger.
- **Roles**: `user` → `editor` → `content_manager` → `administrator` → `super_administrator`.
  RLS enforces everything server-side; UI guards are convenience only.
- **Premium**: metadata readable by signed-in users; premium *media* should be served via
  signed URLs from `media-private` (see INTEGRATIONS.md). Without Stripe keys the platform
  runs fully in free mode — payments are never faked.
- **Religious content policy**: no fabricated verses/hadith. Duas/hadith render only from DB;
  unverified rows show a visible badge. Quran text comes from a verified external API at
  request time, never stored/invented locally.
- **YouTube**: official iframe embeds only — never treated as downloadable files.

## Docs

- `docs/ARCHITECTURE.md` — system design, data flow, security model
- `docs/DEPLOYMENT.md` — production deployment checklist
- `docs/TESTING.md` — test plan (unit + manual security checks)
- `docs/INTEGRATIONS.md` — Supabase Storage, Stripe, Quran API, OAuth, PWA

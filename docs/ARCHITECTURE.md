# Architecture — Quran Mahal

## Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3.
- **Backend**: Supabase — PostgreSQL (RLS), Auth, Storage.
- **Payments**: Stripe (optional; webhook-verified only).
- **Quran text**: verified external API at request time (`QURAN_API_BASE`).

## Request flow

```
Browser ──► Next.js Route ──► Server Component ──► Supabase (anon key + user JWT)
   │                │                    │
   │                │                    └── RLS policies decide what the JWT may read
   │                └── middleware refreshes the Supabase session cookie
   └── Server Actions (mutations) run with the user's JWT; staff actions
       additionally checked by requireStaff()/requireAdmin() in code AND RLS in DB
```

Privileged writes that must bypass RLS (Stripe webhook) use the **service-role**
client, server-side only, never in the browser.

## Data model (summary)

Shared metadata lives in `content_items` (slug, title, type, scholar, category,
status, visibility, SEO…); each type has one detail table (`videos`, `audio_tracks`,
`books`, `publications`, `articles`) keyed 1:1 by `content_item_id`. This avoids
duplication and keeps listings to a single query.

Personal data: `favorites`, `bookmarks`, `watch_history`, `listening_history`,
`reading_progress` — all owner-scoped by RLS (`auth.uid() = user_id`).

Commerce: `membership_plans` → `subscriptions` → `payment_records`. Writes to the
last two come only from admins or the verified Stripe webhook (service role).

Governance: `roles`/`user_roles` (RBAC), `reports` (user content reports),
`platform_settings` (key/value site config, no code edits), `audit_logs`
(every sensitive admin action).

Reference: `scholars`, `categories`, `duas`, `hadith`, `surahs` (114-row index),
`playlists`/`playlist_items`, `media_assets`, `notifications`.

## Security model

1. **RLS is the enforcement point.** UI route guards (`requireStaff` etc.) are UX
   conveniences; every table denies by default and opens only via policy.
2. **No privilege escalation**: `user_roles` writes require `super_administrator`;
   the signup trigger assigns only `user`.
3. **Secrets**: anon key is public by design; service-role key lives in server env
   only. Stripe webhook signature is verified before any DB write.
4. **Uploads**: validated by type/size (see INTEGRATIONS.md); private media is
   served via short-lived signed URLs, never public bucket links.
5. **Audit**: admin mutations write to `audit_logs` (best-effort, non-blocking).

## i18n / RTL

UI strings in `src/lib/i18n/dictionaries.ts` (`en`, `ur`, `roman`). The language
provider sets `<html dir>` (`rtl` for Urdu) and persists the choice. Arabic text
uses the Amiri webfont with `dir="rtl" lang="ar"`.

## Audio

A single persistent `<audio>` element lives in `AudioPlayerProvider` at the root,
so playback + the mini-player survive navigation. Media Session API wires
lock-screen controls where supported. Progress persists to localStorage every 10s
(and to `listening_history` when signed in) for Continue Listening.

## PWA / mobile path

`manifest.webmanifest` + theme color + icons are shipped. Installable on Android/iOS
via browser. The JSON API (`/api/search`, and the same Supabase schema) is the
contract a future native app reuses — no web-only assumptions in the data layer.
A service worker for offline caching is Stage 4 work (see README roadmap).

## What's intentionally NOT done yet (honest backlog)

- Service worker / offline-first caching (manifest only).
- Social OAuth (Google) — documented, not wired.
- Signed-URL media delivery route (`/api/media/[id]`) — documented pattern, stub pending.
- Full-text search ranking (currently `ilike` + trigram index; pg_trgm installed).
- Automated E2E tests (unit tests + manual security checklist in TESTING.md).

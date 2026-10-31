# Testing — Quran Mahal

## Automated

```bash
npm test          # vitest: slugify, duration formatting, YouTube ID parsing, role helper
npm run typecheck # tsc --noEmit
npm run build     # must compile with zero errors
```

Current unit coverage is intentionally narrow (pure helpers). The honest backlog:
RLS policy tests via `supabase test` / pgTAP, and Playwright E2E for auth flows.

## Manual security checklist (run before every deploy)

### Authentication
- [ ] Register → verification email arrives → login works.
- [ ] Wrong password → clear error, no stack trace.
- [ ] Forgot/reset flow issues a working reset link; old link can't be reused.
- [ ] Logged-out user visiting `/dashboard/*` → redirected to `/login`.
- [ ] Logged-out user visiting `/admin/*` → redirected to `/login`.

### Authorization (critical — do not skip)
- [ ] Plain `user` role visiting `/admin` → redirected to `/` (no data leaks in HTML).
- [ ] `editor` can create/edit content but cannot open `/admin/users`, `/admin/settings`, `/admin/memberships`.
- [ ] Only `super_administrator` sees the Grant-role control; `administrator` cannot grant `administrator`.
- [ ] Direct Supabase calls as a plain user:
  - `select * from user_roles where user_id != me` → empty.
  - `select * from payment_records` (another user's) → empty.
  - `insert into content_items (status='published', …)` as plain user → allowed by policy but invisible publicly until staff publishes? (Verify this matches your policy choice; drafts are fine.)
  - `update platform_settings` as plain user → denied.

### Content & media
- [ ] YouTube URL renders an iframe embed (view-source shows no direct mp4).
- [ ] Upload provider with bad URL → graceful error card, no crash.
- [ ] Audio keeps playing across page navigation; mini-player persists.
- [ ] Premium item visible to guest in listings? Metadata only — playback gated (document your rule).

### Payments
- [ ] Without Stripe keys: `/api/webhooks/stripe` returns 503; pricing page shows "contact admin".
- [ ] With test keys: test checkout → webhook → `subscriptions` row `active` + `payment_records` `succeeded`.
- [ ] Replay an old webhook payload → signature check rejects it.

### Mobile / a11y
- [ ] Bottom nav reachable with thumb; 44px+ touch targets.
- [ ] Keyboard: tab order through header → content → player; focus visible.
- [ ] Screen reader: player buttons have labels; images have alt or are decorative.
- [ ] `prefers-reduced-motion`: animations off.
- [ ] Urdu pages render RTL; Arabic renders with Amiri font.

### Performance
- [ ] Lighthouse mobile ≥ 85 on homepage (sample mode).
- [ ] No video/audio `preload="auto"`; lists paginate (12/page).

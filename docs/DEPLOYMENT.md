# Deployment — Quran Mahal

## Option A: Vercel (recommended)

1. Push this repo to GitHub.
2. Vercel → New Project → import. Framework preset: Next.js.
3. Environment variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = your domain (e.g. `https://quran-mahal.org`)
   - `QURAN_API_BASE` (optional; defaults to `https://api.alquran.cloud/v1`)
   - Stripe vars only when going live with payments.
4. Deploy. Then in Stripe Dashboard → Webhooks add
   `https://YOUR-DOMAIN/api/webhooks/stripe` (events: `checkout.session.completed`,
   `customer.subscription.deleted`, `invoice.payment_failed`) and set
   `STRIPE_WEBHOOK_SECRET`.

## Option B: Any Node host / VPS

```bash
npm ci
npm run build
npm start -- -p 3000
# put behind nginx/Caddy with TLS; set the same env vars
```

## Pre-launch checklist

- [ ] Migrations applied in order (1→4) on the production Supabase project.
- [ ] Storage buckets created (`media-public`, `media-private`, `covers`, `documents`)
      with the policies in `docs/INTEGRATIONS.md`.
- [ ] Supabase Auth → Email enabled; Site URL + Redirect URLs set to your domain.
- [ ] First admin: register, then grant `super_administrator` via SQL (see README).
- [ ] `platform_settings`: set `site_name`, `contact_email`, SEO defaults via `/admin/settings`.
- [ ] Replace ALL `[SAMPLE]` seed content with real, authorized content (or delete it).
- [ ] Verify `/admin` is unreachable when logged out (should redirect to `/login`).
- [ ] Verify a plain `user` cannot open `/admin` (redirects to `/`).
- [ ] Test RLS: as a signed-in non-staff user, try reading another user's favorites
      via the Supabase JS client — must return nothing.
- [ ] `robots.txt`/`sitemap.xml` render; admin + dashboard excluded.
- [ ] Run `npm test` and `npm run typecheck` green.
- [ ] If taking payments: Stripe webhook tested in test mode first; confirm a
      `payment_records` row appears with `status=succeeded` only after the webhook.

## Rollback

Vercel: instant rollback to a previous deployment. Database: Supabase point-in-time
recovery (project settings → backups). Migrations are additive; the seed file is
idempotent-safe only on first run — don't re-run it on a live DB.

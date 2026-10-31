# Integrations — Quran Mahal

## 1. Supabase Storage

Create these buckets in Dashboard → Storage:

| Bucket | Public? | Use |
|---|---|---|
| `media-public` | yes | thumbnails, covers, public images |
| `media-private` | **no** | premium/paid media — serve via signed URLs |
| `covers` | yes | book/risala covers |
| `documents` | no | PDFs (signed URLs; public only if license allows) |

Recommended storage policies (`storage.objects`):

```sql
-- public read on media-public + covers
create policy "public read" on storage.objects for select
  using (bucket_id in ('media-public','covers'));
-- authenticated uploads (validate in app code too)
create policy "auth upload" on storage.objects for insert
  with check (bucket_id in ('media-public','covers','documents')
              and auth.role() = 'authenticated');
```

**Upload validation (enforce in your upload route):**
- Images: `image/jpeg,image/png,image/webp` ≤ 5 MB
- Audio: `audio/mpeg,audio/mp4,audio/wav` ≤ 200 MB
- Video: `video/mp4,video/webm` ≤ 1 GB (prefer a streaming provider for large files)
- Documents: `application/pdf,application/epub+zip` ≤ 100 MB
- Always verify magic bytes server-side, not just the extension.

**Signed URLs (private media):** generate server-side with the service-role client:

```ts
const { data } = await serviceClient.storage
  .from("media-private").createSignedUrl(path, 60 * 30); // 30 min
```

Wire this into a future `GET /api/media/[assetId]` route that checks the user's
subscription before signing. Until then, keep premium files in `media-private`
and don't publish their URLs.

## 2. Stripe (optional)

1. https://dashboard.stripe.com → Developers → API keys → `STRIPE_SECRET_KEY`.
2. Webhooks → Add endpoint `https://YOUR-DOMAIN/api/webhooks/stripe`,
   events: `checkout.session.completed`, `customer.subscription.deleted`,
   `invoice.payment_failed` → `STRIPE_WEBHOOK_SECRET`.
3. Create a Checkout Session server-side with metadata `{ user_id, plan_id }`
   (see `src/app/api/webhooks/stripe/route.ts` for the expected shape).
4. The webhook is the ONLY writer of `succeeded` payments. Without keys the route
   returns 503 and the app runs fully in free mode.

> Stripe availability varies by country (Pakistan: Atlas/international entity
> typically required). Alternatives with the same webhook pattern: Paddle, Lemon
> Squeezy. The DB schema is provider-agnostic (`payment_provider` column).

## 3. Quran text API

Default `QURAN_API_BASE=https://api.alquran.cloud/v1` (Tanzil-based Uthmani text,
Urdu Jalandhry, English Saheeh International — no key needed). Swap to your own
verified source by changing the env var; the surah page fetches
`/surah/{n}/{edition}` at request time with 24h caching. We never store or invent
ayah text locally.

## 4. Social login (Google) — optional

Supabase Dashboard → Authentication → Providers → Google → set Client ID/Secret
(Google Cloud Console → OAuth 2.0). Then:

```ts
await supabase.auth.signInWithOAuth({ provider: "google",
  options: { redirectTo: `${location.origin}/dashboard` } });
```

Add a button on `/login` when you enable it.

## 5. Video providers

- **YouTube**: paste any watch/shorts/embed URL — the app embeds the official
  iframe player. Never hotlink or re-host.
- **Uploads**: put the file in Supabase Storage (or Bunny Stream / Cloudflare
  Stream for serious volume) and paste the authorized URL/file reference.
- **Bunny Stream / Cloudflare Stream**: create the library, store the video ID in
  `videos.video_url` with `provider='external'`, and extend `VideoPlayer` with
  their iframe embed. Documented here so a future step can add it without schema changes.

## 6. PWA

`public/manifest.webmanifest` + icons + theme-color are shipped. Generate PNG
icons (192/512 + maskable 512) from `public/icons/icon.svg` before release —
e.g. `npx @resvg/resvg-js` or any SVG→PNG tool — and place them in
`public/icons/`. A service worker for offline asset caching is backlog (Stage 4).

## 7. Email

Supabase Auth emails work out of the box. For custom SMTP (Resend/SendGrid):
Supabase Dashboard → Project Settings → Auth → SMTP. Required before launch so
verification/reset emails don't land in spam.

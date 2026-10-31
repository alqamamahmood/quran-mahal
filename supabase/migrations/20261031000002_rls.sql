-- ============================================================================
-- Noor-e-Islam · Migration 20261031000002_rls
-- Row Level Security: enable RLS on all 29 tables + policies.
--
-- Role model:
--   staff  = editor | content_manager | administrator | super_administrator
--   admins = administrator | super_administrator  (via public.is_admin())
--
-- Helpers public.has_role(), public.is_admin(), public.has_any_role() are
-- SECURITY DEFINER (see migration 000001), so they bypass RLS and do not
-- recurse. service_role bypasses RLS entirely and is used server-side for
-- payment webhooks.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Enable RLS on every table
-- --------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.roles              enable row level security;
alter table public.user_roles         enable row level security;
alter table public.scholars           enable row level security;
alter table public.categories         enable row level security;
alter table public.content_items      enable row level security;
alter table public.videos             enable row level security;
alter table public.audio_tracks       enable row level security;
alter table public.books              enable row level security;
alter table public.publications       enable row level security;
alter table public.articles           enable row level security;
alter table public.media_assets       enable row level security;
alter table public.playlists          enable row level security;
alter table public.playlist_items     enable row level security;
alter table public.favorites          enable row level security;
alter table public.bookmarks          enable row level security;
alter table public.watch_history      enable row level security;
alter table public.listening_history  enable row level security;
alter table public.reading_progress   enable row level security;
alter table public.membership_plans   enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.payment_records    enable row level security;
alter table public.reports            enable row level security;
alter table public.notifications     enable row level security;
alter table public.platform_settings  enable row level security;
alter table public.audit_logs         enable row level security;
alter table public.duas               enable row level security;
alter table public.hadith             enable row level security;
alter table public.surahs             enable row level security;

-- ============================================================================
-- profiles
-- ============================================================================
create policy "profiles select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles select admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- No DELETE policy: profiles are removed via auth.users cascade.

-- ============================================================================
-- roles
-- ============================================================================
create policy "roles select authenticated"
  on public.roles for select
  to authenticated
  using (true);

create policy "roles all super_admin"
  on public.roles for all
  to authenticated
  using (public.has_role('super_administrator'))
  with check (public.has_role('super_administrator'));

-- ============================================================================
-- user_roles
-- ============================================================================
create policy "user_roles select own or admin"
  on public.user_roles for select
  using (user_id = auth.uid() or public.is_admin());

create policy "user_roles insert super_admin"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role('super_administrator'));

create policy "user_roles delete super_admin"
  on public.user_roles for delete
  using (public.has_role('super_administrator'));
-- No UPDATE policy: change a grant by deleting + re-inserting.

-- ============================================================================
-- scholars
-- ============================================================================
create policy "scholars select public or staff"
  on public.scholars for select
  using (
    status = 'active'
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "scholars insert staff"
  on public.scholars for insert
  to authenticated
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

create policy "scholars update staff"
  on public.scholars for update
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'))
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

create policy "scholars delete staff"
  on public.scholars for delete
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'));

-- ============================================================================
-- categories
-- ============================================================================
create policy "categories select public or staff"
  on public.categories for select
  using (
    is_active = true
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "categories insert staff"
  on public.categories for insert
  to authenticated
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

create policy "categories update staff"
  on public.categories for update
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'))
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

create policy "categories delete staff"
  on public.categories for delete
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'));

-- ============================================================================
-- content_items
-- ============================================================================
create policy "content_items select"
  on public.content_items for select
  using (
    (status = 'published' and visibility = 'public')
    or (status = 'published' and visibility = 'premium' and auth.role() = 'authenticated')
    or (created_by = auth.uid())
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "content_items insert own"
  on public.content_items for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "content_items update own or staff"
  on public.content_items for update
  using (
    created_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  )
  with check (
    created_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "content_items delete staff"
  on public.content_items for delete
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'));

-- ============================================================================
-- Type detail tables: videos, audio_tracks, books, publications, articles
-- Read access follows the parent content_item; writes need ownership or staff.
-- ============================================================================

-- videos
create policy "videos select with parent"
  on public.videos for select
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = videos.content_item_id
        and (
          (ci.status = 'published' and ci.visibility in ('public','premium'))
          or ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "videos insert owner or staff"
  on public.videos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = videos.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "videos update owner or staff"
  on public.videos for update
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = videos.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  )
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = videos.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "videos delete owner or staff"
  on public.videos for delete
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = videos.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

-- audio_tracks
create policy "audio_tracks select with parent"
  on public.audio_tracks for select
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = audio_tracks.content_item_id
        and (
          (ci.status = 'published' and ci.visibility in ('public','premium'))
          or ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "audio_tracks insert owner or staff"
  on public.audio_tracks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = audio_tracks.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "audio_tracks update owner or staff"
  on public.audio_tracks for update
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = audio_tracks.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  )
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = audio_tracks.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "audio_tracks delete owner or staff"
  on public.audio_tracks for delete
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = audio_tracks.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

-- books
create policy "books select with parent"
  on public.books for select
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = books.content_item_id
        and (
          (ci.status = 'published' and ci.visibility in ('public','premium'))
          or ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "books insert owner or staff"
  on public.books for insert
  to authenticated
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = books.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "books update owner or staff"
  on public.books for update
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = books.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  )
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = books.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "books delete owner or staff"
  on public.books for delete
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = books.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

-- publications
create policy "publications select with parent"
  on public.publications for select
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = publications.content_item_id
        and (
          (ci.status = 'published' and ci.visibility in ('public','premium'))
          or ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "publications insert owner or staff"
  on public.publications for insert
  to authenticated
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = publications.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "publications update owner or staff"
  on public.publications for update
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = publications.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  )
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = publications.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "publications delete owner or staff"
  on public.publications for delete
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = publications.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

-- articles
create policy "articles select with parent"
  on public.articles for select
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = articles.content_item_id
        and (
          (ci.status = 'published' and ci.visibility in ('public','premium'))
          or ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "articles insert owner or staff"
  on public.articles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = articles.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "articles update owner or staff"
  on public.articles for update
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = articles.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  )
  with check (
    exists (
      select 1 from public.content_items ci
      where ci.id = articles.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

create policy "articles delete owner or staff"
  on public.articles for delete
  using (
    exists (
      select 1 from public.content_items ci
      where ci.id = articles.content_item_id
        and (
          ci.created_by = auth.uid()
          or public.has_any_role('editor','content_manager','administrator','super_administrator')
        )
    )
  );

-- ============================================================================
-- media_assets
-- ============================================================================
create policy "media_assets select owner or staff"
  on public.media_assets for select
  using (
    uploaded_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "media_assets insert own"
  on public.media_assets for insert
  to authenticated
  with check (uploaded_by = auth.uid());

create policy "media_assets delete owner or admin"
  on public.media_assets for delete
  using (uploaded_by = auth.uid() or public.is_admin());
-- No UPDATE policy: metadata is immutable; delete + re-upload instead.

-- ============================================================================
-- playlists / playlist_items
-- ============================================================================
create policy "playlists select"
  on public.playlists for select
  using (
    is_public = true
    or created_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "playlists insert own"
  on public.playlists for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "playlists update owner or staff"
  on public.playlists for update
  using (
    created_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  )
  with check (
    created_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "playlists delete owner or staff"
  on public.playlists for delete
  using (
    created_by = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "playlist_items select"
  on public.playlist_items for select
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id
        and (p.is_public = true or p.created_by = auth.uid())
    )
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "playlist_items insert owner or staff"
  on public.playlist_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id
        and p.created_by = auth.uid()
    )
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "playlist_items update owner or staff"
  on public.playlist_items for update
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id
        and p.created_by = auth.uid()
    )
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  )
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id
        and p.created_by = auth.uid()
    )
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "playlist_items delete owner or staff"
  on public.playlist_items for delete
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id
        and p.created_by = auth.uid()
    )
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

-- ============================================================================
-- Personal library tables: owner-only, admins may read
-- ============================================================================

-- favorites
create policy "favorites all owner"
  on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "favorites select admin"
  on public.favorites for select
  using (public.is_admin());

-- bookmarks
create policy "bookmarks all owner"
  on public.bookmarks for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "bookmarks select admin"
  on public.bookmarks for select
  using (public.is_admin());

-- watch_history
create policy "watch_history all owner"
  on public.watch_history for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "watch_history select admin"
  on public.watch_history for select
  using (public.is_admin());

-- listening_history
create policy "listening_history all owner"
  on public.listening_history for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "listening_history select admin"
  on public.listening_history for select
  using (public.is_admin());

-- reading_progress
create policy "reading_progress all owner"
  on public.reading_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reading_progress select admin"
  on public.reading_progress for select
  using (public.is_admin());

-- notifications
create policy "notifications all owner"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications select admin"
  on public.notifications for select
  using (public.is_admin());

-- ============================================================================
-- membership_plans
-- ============================================================================
create policy "membership_plans select"
  on public.membership_plans for select
  using (
    is_active = true
    or public.has_any_role('content_manager','administrator','super_administrator')
  );

create policy "membership_plans insert staff"
  on public.membership_plans for insert
  to authenticated
  with check (public.has_any_role('content_manager','administrator','super_administrator'));

create policy "membership_plans update staff"
  on public.membership_plans for update
  using (public.has_any_role('content_manager','administrator','super_administrator'))
  with check (public.has_any_role('content_manager','administrator','super_administrator'));

create policy "membership_plans delete staff"
  on public.membership_plans for delete
  using (public.has_any_role('content_manager','administrator','super_administrator'));

-- ============================================================================
-- subscriptions (admins manage via dashboard; payment webhooks use service_role,
-- which bypasses RLS entirely)
-- ============================================================================
create policy "subscriptions select owner or admin"
  on public.subscriptions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "subscriptions insert admin"
  on public.subscriptions for insert
  to authenticated
  with check (public.is_admin());

create policy "subscriptions update admin"
  on public.subscriptions for update
  using (public.is_admin())
  with check (public.is_admin());
-- No DELETE policy and no user INSERT: users never self-grant premium access.

-- ============================================================================
-- payment_records (append-only; admins + service_role write)
-- ============================================================================
create policy "payment_records select owner or admin"
  on public.payment_records for select
  using (user_id = auth.uid() or public.is_admin());

create policy "payment_records insert admin"
  on public.payment_records for insert
  to authenticated
  with check (public.is_admin());
-- No UPDATE/DELETE: payment history is immutable.

-- ============================================================================
-- reports
-- ============================================================================
create policy "reports insert authenticated"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid() or reporter_id is null);

create policy "reports select own or staff"
  on public.reports for select
  using (
    reporter_id = auth.uid()
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "reports update staff"
  on public.reports for update
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'))
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));
-- No DELETE policy: reports are resolved, not deleted.

-- ============================================================================
-- platform_settings
-- ============================================================================
create policy "platform_settings select public"
  on public.platform_settings for select
  using (true);

create policy "platform_settings insert admin"
  on public.platform_settings for insert
  to authenticated
  with check (public.has_any_role('administrator','super_administrator'));

create policy "platform_settings update admin"
  on public.platform_settings for update
  using (public.has_any_role('administrator','super_administrator'))
  with check (public.has_any_role('administrator','super_administrator'));

-- ============================================================================
-- audit_logs (append-only; admins read)
-- ============================================================================
create policy "audit_logs insert authenticated"
  on public.audit_logs for insert
  to authenticated
  with check (true);

create policy "audit_logs select admin"
  on public.audit_logs for select
  using (public.is_admin());
-- No UPDATE/DELETE: audit trail is immutable.

-- ============================================================================
-- duas / hadith
-- ============================================================================
create policy "duas select published or staff"
  on public.duas for select
  using (
    status = 'published'
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "duas write staff"
  on public.duas for all
  to authenticated
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'))
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

create policy "hadith select published or staff"
  on public.hadith for select
  using (
    status = 'published'
    or public.has_any_role('editor','content_manager','administrator','super_administrator')
  );

create policy "hadith write staff"
  on public.hadith for all
  to authenticated
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'))
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

-- ============================================================================
-- surahs: public reference metadata (read for everyone, staff writes)
-- ============================================================================
create policy "surahs select public"
  on public.surahs for select
  using (true);

create policy "surahs write staff"
  on public.surahs for all
  to authenticated
  using (public.has_any_role('editor','content_manager','administrator','super_administrator'))
  with check (public.has_any_role('editor','content_manager','administrator','super_administrator'));

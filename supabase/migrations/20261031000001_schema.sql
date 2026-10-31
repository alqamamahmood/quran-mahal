-- ============================================================================
-- Noor-e-Islam · Migration 20261031000001_schema
-- Core schema: extensions, helper functions, tables, indexes, triggers.
--
-- Supabase-compatible: no superuser-only operations.
-- Conventions: gen_random_uuid() PKs, timestamptz defaults, text status
-- fields with CHECK constraints (no PG enums).
-- ============================================================================

-- --------------------------------------------------------------------------
-- Extensions
-- --------------------------------------------------------------------------
create extension if not exists "pg_trgm";    -- trigram search indexes
create extension if not exists "uuid-ossp";  -- uuid helpers

-- --------------------------------------------------------------------------
-- Helper: auto-update updated_at on row changes
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- profiles: one row per auth.users entry (created by handle_new_user trigger)
-- --------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  display_name  text,
  avatar_url    text,
  language_pref text default 'ur' check (language_pref in ('en','ur','roman')),
  theme_pref    text default 'light' check (theme_pref in ('light','dark')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- --------------------------------------------------------------------------
-- roles / user_roles: role-based access control
-- --------------------------------------------------------------------------
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text
);

create table if not exists public.user_roles (
  user_id    uuid references public.profiles(id) on delete cascade,
  role_id    uuid references public.roles(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz default now(),
  primary key (user_id, role_id)
);

-- --------------------------------------------------------------------------
-- scholars
-- --------------------------------------------------------------------------
create table if not exists public.scholars (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  name                  text not null,
  name_ur               text,
  bio                   text,
  photo_url             text,
  photo_permission_note text,
  languages             text[] default '{}',
  subjects              text[] default '{}',
  status                text default 'active' check (status in ('active','hidden')),
  created_by            uuid references public.profiles(id),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- --------------------------------------------------------------------------
-- categories (self-referencing for sub-categories)
-- --------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  name_ur     text,
  name_ar     text,
  description text,
  icon        text,
  parent_id   uuid references public.categories(id),
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- --------------------------------------------------------------------------
-- content_items: shared metadata for videos, audio, books, publications, articles
-- --------------------------------------------------------------------------
create table if not exists public.content_items (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text,
  type           text not null check (type in ('video','audio','book','publication','article')),
  scholar_id     uuid references public.scholars(id) on delete set null,
  category_id    uuid references public.categories(id) on delete set null,
  language       text default 'ur' check (language in ('ur','en','ar','roman')),
  status         text default 'draft' check (status in ('draft','scheduled','published','archived')),
  visibility     text default 'public' check (visibility in ('public','premium','private')),
  is_featured    boolean default false,
  published_at   timestamptz,
  scheduled_for  timestamptz,
  view_count     bigint default 0,
  seo_title      text,
  seo_description text,
  tags           text[] default '{}',
  copyright_note text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- --------------------------------------------------------------------------
-- Type-specific detail tables (1:1 with content_items)
-- --------------------------------------------------------------------------
create table if not exists public.videos (
  content_item_id  uuid primary key references public.content_items(id) on delete cascade,
  provider         text not null check (provider in ('youtube','upload','external')),
  video_url        text,
  thumbnail_url    text,
  duration_seconds int,
  captions_url     text
);

create table if not exists public.audio_tracks (
  content_item_id  uuid primary key references public.content_items(id) on delete cascade,
  audio_url        text not null,
  cover_url        text,
  duration_seconds int,
  allow_download   boolean default false
);

create table if not exists public.books (
  content_item_id  uuid primary key references public.content_items(id) on delete cascade,
  author           text,
  cover_url        text,
  file_url         text,
  file_format      text check (file_format in ('pdf','epub','html','other')),
  pages            int,
  publisher        text,
  publication_year int,
  license_note     text,
  allow_download   boolean default false
);

create table if not exists public.publications (
  content_item_id uuid primary key references public.content_items(id) on delete cascade,
  issue_no        text,
  pdf_url         text,
  cover_url       text,
  allow_download  boolean default false
);

create table if not exists public.articles (
  content_item_id uuid primary key references public.content_items(id) on delete cascade,
  body_html       text,
  excerpt         text
);

-- --------------------------------------------------------------------------
-- media_assets: uploaded files (thumbnails, covers, documents, media)
-- --------------------------------------------------------------------------
create table if not exists public.media_assets (
  id              uuid primary key default gen_random_uuid(),
  bucket          text not null,
  path            text not null,
  file_name       text,
  mime_type       text,
  size_bytes      bigint,
  uploaded_by     uuid references public.profiles(id),
  content_item_id uuid references public.content_items(id) on delete set null,
  created_at      timestamptz default now()
);

-- --------------------------------------------------------------------------
-- playlists / playlist_items
-- --------------------------------------------------------------------------
create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  scholar_id  uuid references public.scholars(id) on delete set null,
  created_by  uuid references public.profiles(id),
  is_public   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists public.playlist_items (
  id              uuid primary key default gen_random_uuid(),
  playlist_id     uuid references public.playlists(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  position        int default 0,
  unique (playlist_id, content_item_id)
);

-- --------------------------------------------------------------------------
-- Personal library: favorites, bookmarks, progress histories
-- --------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id         uuid references public.profiles(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  created_at      timestamptz default now(),
  primary key (user_id, content_item_id)
);

create table if not exists public.bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  note            text,
  position_text   text,
  page_number     int,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (user_id, content_item_id)
);

create table if not exists public.watch_history (
  user_id         uuid references public.profiles(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  progress_seconds int default 0,
  duration_seconds int default 0,
  last_watched_at timestamptz default now(),
  primary key (user_id, content_item_id)
);

create table if not exists public.listening_history (
  user_id         uuid references public.profiles(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  progress_seconds int default 0,
  duration_seconds int default 0,
  last_listened_at timestamptz default now(),
  primary key (user_id, content_item_id)
);

create table if not exists public.reading_progress (
  user_id         uuid references public.profiles(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  current_page    int default 1,
  total_pages     int,
  percent         numeric default 0,
  last_read_at    timestamptz default now(),
  primary key (user_id, content_item_id)
);

-- --------------------------------------------------------------------------
-- Memberships & payments
-- --------------------------------------------------------------------------
create table if not exists public.membership_plans (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  price         numeric(10,2) default 0,
  currency      text default 'PKR',
  duration_days int default 30,
  is_active     boolean default true,
  features      jsonb default '[]',
  trial_days    int default 0,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade,
  plan_id          uuid references public.membership_plans(id),
  status           text check (status in ('active','trialing','past_due','cancelled','expired')),
  started_at       timestamptz default now(),
  expires_at       timestamptz,
  trial_ends_at    timestamptz,
  payment_provider text,
  external_id      text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists public.payment_records (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles(id) on delete cascade,
  subscription_id    uuid references public.subscriptions(id) on delete set null,
  amount             numeric(10,2),
  currency           text,
  provider           text,
  external_payment_id text,
  status             text check (status in ('pending','succeeded','failed','refunded')),
  raw_payload        jsonb,
  created_at         timestamptz default now()
);

-- --------------------------------------------------------------------------
-- reports / notifications / platform_settings / audit_logs
-- --------------------------------------------------------------------------
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid references public.profiles(id) on delete set null,
  content_item_id uuid references public.content_items(id) on delete cascade,
  reason          text not null,
  details         text,
  status          text default 'open' check (status in ('open','reviewed','resolved','dismissed')),
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  link       text,
  is_read    boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.platform_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id)
);

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  details     jsonb,
  ip_address  text,
  created_at  timestamptz default now()
);

-- --------------------------------------------------------------------------
-- duas / hadith / surahs
-- Religious text fields are intentionally nullable: seed data must NOT
-- fabricate verses, hadith text, references, or authenticity grades.
-- --------------------------------------------------------------------------
create table if not exists public.duas (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  arabic_text     text,
  transliteration text,
  translation_ur  text,
  translation_en  text,
  source_reference text,
  category        text,
  is_verified     boolean default false,
  audio_url       text,
  status          text default 'draft' check (status in ('draft','published','archived')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.hadith (
  id                uuid primary key default gen_random_uuid(),
  collection        text not null,
  book_name         text,
  chapter           text,
  hadith_number     text,
  arabic_text       text,
  translation_ur    text,
  translation_en    text,
  authenticity_grade text,
  grade_source      text,
  is_verified       boolean default false,
  status            text default 'draft' check (status in ('draft','published','archived')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists public.surahs (
  number          int primary key,
  name_ar         text not null,
  name_en         text not null,
  name_ur         text,
  total_ayahs     int not null,
  revelation_type text check (revelation_type in ('Makki','Madani'))
);

-- --------------------------------------------------------------------------
-- Role helpers.
-- SECURITY DEFINER so they bypass RLS (avoids infinite recursion when used
-- inside RLS policies). search_path is pinned for safety.
-- NOTE: defined AFTER the tables because PostgreSQL validates SQL-language
-- function bodies at CREATE time.
-- --------------------------------------------------------------------------
create or replace function public.has_role(required_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = required_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.has_role('administrator')
      or public.has_role('super_administrator');
$$;

create or replace function public.has_any_role(variadic required_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = any (required_roles)
  );
$$;


-- ============================================================================
-- AUTH TRIGGER: create profile + assign 'user' role on signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_id uuid;
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  select r.id into v_role_id
  from public.roles r
  where r.name = 'user'
  limit 1;

  if v_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, v_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- updated_at TRIGGERS
-- ============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','scholars','categories','content_items','playlists',
    'bookmarks','membership_plans','subscriptions','duas','hadith'
  ]
  loop
    execute format('drop trigger if exists trg_%s_updated_at on public.%I', t, t);
    execute format(
      'create trigger trg_%s_updated_at before update on public.%I ' ||
      'for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists content_items_status_visibility_published
  on public.content_items (status, visibility, published_at desc);
create index if not exists content_items_type
  on public.content_items (type);
create index if not exists content_items_scholar_id
  on public.content_items (scholar_id);
create index if not exists content_items_category_id
  on public.content_items (category_id);
-- Trigram index for fuzzy title search. (scholars.slug is covered by its UNIQUE constraint.)
create index if not exists content_items_title_trgm
  on public.content_items using gin (title gin_trgm_ops);

create index if not exists duas_status
  on public.duas (status);
create index if not exists hadith_status
  on public.hadith (status);
create index if not exists audit_logs_created_at
  on public.audit_logs (created_at desc);
create index if not exists subscriptions_user_id
  on public.subscriptions (user_id);
create index if not exists payment_records_user_id
  on public.payment_records (user_id);
create index if not exists watch_history_user_id
  on public.watch_history (user_id);
create index if not exists listening_history_user_id
  on public.listening_history (user_id);
create index if not exists reading_progress_user_id
  on public.reading_progress (user_id);

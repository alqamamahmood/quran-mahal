-- ============================================================================
-- Noor-e-Islam · Migration 20261031000003_seed
-- Seed data. Migrations run as a privileged role, so RLS does not block these
-- inserts. All rows are idempotent via ON CONFLICT clauses.
--
-- IMPORTANT: every sample row is clearly marked [SAMPLE]. Dua/hadith rows
-- carry NULL religious text fields — never fabricate verses, hadith text,
-- references, or authenticity grades. Surah metadata below (number, Arabic
-- name, English name, ayah count, Makki/Madani) is factual public metadata.
-- ============================================================================

-- --------------------------------------------------------------------------
-- roles
-- --------------------------------------------------------------------------
insert into public.roles (name, description)
values
  ('super_administrator', 'Full platform control, including role assignment.'),
  ('administrator',       'Manages users, settings, and content.'),
  ('content_manager',     'Publishes and manages approved content.'),
  ('editor',              'Creates and edits assigned content.'),
  ('user',                'Standard registered user.')
on conflict (name) do nothing;

-- --------------------------------------------------------------------------
-- categories
-- --------------------------------------------------------------------------
insert into public.categories (slug, name, name_ur, description, sort_order, is_active)
values
  ('quran-tafseer',  'Quran & Tafseer',    'قرآن و تفسیر',   'Quran recitation, translation and tafseer.', 1, true),
  ('seerat',         'Seerat-un-Nabi ﷺ',    'سیرت النبی ﷺ',   'Life of the Prophet Muhammad ﷺ.',             2, true),
  ('aqeedah',        'Aqeedah',             'عقیدہ',          'Islamic creed and belief.',                    3, true),
  ('namaz-ibadat',   'Namaz & Ibadat',      'نماز و عبادت',   'Prayer, fasting and worship.',                 4, true),
  ('islamic-history','Islamic History',     'اسلامی تاریخ',   'History of Islam and the Muslim world.',      5, true),
  ('urdu-bayanaat',  'Urdu Bayanaat',       'اردو بیانات',    'Urdu-language Islamic lectures.',              6, true)
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- membership_plans
-- --------------------------------------------------------------------------
insert into public.membership_plans
  (slug, name, description, price, currency, duration_days, is_active, features, trial_days, sort_order)
values
  ('free', 'Free',
   'Access all public free content.',
   0, 'PKR', 30, true,
   '["Public videos","Public audio","Public books","Bookmarks"]'::jsonb,
   0, 1),
  ('premium-monthly', 'Premium Monthly',
   'Premium content and authorized offline downloads, billed monthly.',
   499, 'PKR', 30, true,
   '["Everything in Free","Premium videos and audio","Offline downloads","Priority support"]'::jsonb,
   0, 2),
  ('premium-yearly', 'Premium Yearly',
   'Premium content and authorized offline downloads, billed yearly.',
   4999, 'PKR', 365, true,
   '["Everything in Free","Premium videos and audio","Offline downloads","Priority support"]'::jsonb,
   0, 3)
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- platform_settings
-- --------------------------------------------------------------------------
insert into public.platform_settings (key, value)
values
  ('site_name',     to_jsonb('Noor-e-Islam'::text)),
  ('tagline',       to_jsonb('Authentic Islamic knowledge — videos, audio, books and more.'::text)),
  ('contact_email', to_jsonb('contact@example.com'::text)),
  ('seo', '{"default_title": "Noor-e-Islam — Islamic Media Platform", "default_description": "Watch bayanaat, listen to audio lectures, and read books and rasail on Noor-e-Islam."}'::jsonb)
on conflict (key) do update
  set value = excluded.value,
      updated_at = now();

-- --------------------------------------------------------------------------
-- surahs: 114 rows of factual public metadata
-- (number, Arabic name, English name, ayah count, Makki/Madani)
-- --------------------------------------------------------------------------
insert into public.surahs (number, name_ar, name_en, total_ayahs, revelation_type)
values
  (1,   'الفاتحة',   'Al-Fatihah',    7,   'Makki'),
  (2,   'البقرة',    'Al-Baqarah',    286, 'Madani'),
  (3,   'آل عمران',  'Aal-e-Imran',   200, 'Madani'),
  (4,   'النساء',    'An-Nisa',       176, 'Madani'),
  (5,   'المائدة',   'Al-Ma''idah',   120, 'Madani'),
  (6,   'الأنعام',   'Al-An''am',     165, 'Makki'),
  (7,   'الأعراف',   'Al-A''raf',     206, 'Makki'),
  (8,   'الأنفال',   'Al-Anfal',      75,  'Madani'),
  (9,   'التوبة',    'At-Tawbah',     129, 'Madani'),
  (10,  'يونس',      'Yunus',         109, 'Makki'),
  (11,  'هود',       'Hud',           123, 'Makki'),
  (12,  'يوسف',      'Yusuf',         111, 'Makki'),
  (13,  'الرعد',     'Ar-Ra''d',      43,  'Madani'),
  (14,  'ابراهيم',   'Ibrahim',       52,  'Makki'),
  (15,  'الحجر',     'Al-Hijr',       99,  'Makki'),
  (16,  'النحل',     'An-Nahl',       128, 'Makki'),
  (17,  'الإسراء',   'Al-Isra',       111, 'Makki'),
  (18,  'الكهف',     'Al-Kahf',       110, 'Makki'),
  (19,  'مريم',      'Maryam',        98,  'Makki'),
  (20,  'طه',        'Ta-Ha',         135, 'Makki'),
  (21,  'الأنبياء',  'Al-Anbiya',     112, 'Makki'),
  (22,  'الحج',      'Al-Hajj',       78,  'Madani'),
  (23,  'المؤمنون',  'Al-Mu''minun',  118, 'Makki'),
  (24,  'النور',     'An-Nur',        64,  'Madani'),
  (25,  'الفرقان',   'Al-Furqan',     77,  'Makki'),
  (26,  'الشعراء',   'Ash-Shu''ara',  227, 'Makki'),
  (27,  'النمل',     'An-Naml',       93,  'Makki'),
  (28,  'القصص',     'Al-Qasas',      88,  'Makki'),
  (29,  'العنكبوت',  'Al-Ankabut',    69,  'Makki'),
  (30,  'الروم',     'Ar-Rum',        60,  'Makki'),
  (31,  'لقمان',     'Luqman',        34,  'Makki'),
  (32,  'السجدة',    'As-Sajdah',     30,  'Makki'),
  (33,  'الأحزاب',   'Al-Ahzab',      73,  'Madani'),
  (34,  'سبأ',       'Saba',          54,  'Makki'),
  (35,  'فاطر',      'Fatir',         45,  'Makki'),
  (36,  'يس',        'Ya-Sin',        83,  'Makki'),
  (37,  'الصافات',   'As-Saffat',     182, 'Makki'),
  (38,  'ص',         'Sad',           88,  'Makki'),
  (39,  'الزمر',     'Az-Zumar',      75,  'Makki'),
  (40,  'غافر',      'Ghafir',        85,  'Makki'),
  (41,  'فصلت',      'Fussilat',      54,  'Makki'),
  (42,  'الشورى',    'Ash-Shura',     53,  'Makki'),
  (43,  'الزخرف',    'Az-Zukhruf',    89,  'Makki'),
  (44,  'الدخان',    'Ad-Dukhan',     59,  'Makki'),
  (45,  'الجاثية',   'Al-Jathiyah',   37,  'Makki'),
  (46,  'الأحقاف',   'Al-Ahqaf',      35,  'Makki'),
  (47,  'محمد',      'Muhammad',      38,  'Madani'),
  (48,  'الفتح',     'Al-Fath',       29,  'Madani'),
  (49,  'الحجرات',   'Al-Hujurat',    18,  'Madani'),
  (50,  'ق',         'Qaf',           45,  'Makki'),
  (51,  'الذاريات',  'Adh-Dhariyat',  60,  'Makki'),
  (52,  'الطور',     'At-Tur',        49,  'Makki'),
  (53,  'النجم',     'An-Najm',       62,  'Makki'),
  (54,  'القمر',     'Al-Qamar',      55,  'Makki'),
  (55,  'الرحمن',    'Ar-Rahman',     78,  'Madani'),
  (56,  'الواقعة',   'Al-Waqi''ah',   96,  'Makki'),
  (57,  'الحديد',    'Al-Hadid',      29,  'Madani'),
  (58,  'المجادلة',  'Al-Mujadila',   22,  'Madani'),
  (59,  'الحشر',     'Al-Hashr',      24,  'Madani'),
  (60,  'الممتحنة',  'Al-Mumtahanah', 13,  'Madani'),
  (61,  'الصف',      'As-Saff',       14,  'Madani'),
  (62,  'الجمعة',    'Al-Jumu''ah',   11,  'Madani'),
  (63,  'المنافقون', 'Al-Munafiqun',  8,   'Madani'),
  (64,  'التغابن',   'At-Taghabun',   18,  'Madani'),
  (65,  'الطلاق',    'At-Talaq',      12,  'Madani'),
  (66,  'التحريم',   'At-Tahrim',     12,  'Madani'),
  (67,  'الملك',     'Al-Mulk',       30,  'Makki'),
  (68,  'القلم',     'Al-Qalam',      52,  'Makki'),
  (69,  'الحاقة',    'Al-Haqqah',     52,  'Makki'),
  (70,  'المعارج',   'Al-Ma''arij',   44,  'Makki'),
  (71,  'نوح',       'Nuh',           28,  'Makki'),
  (72,  'الجن',      'Al-Jinn',       28,  'Makki'),
  (73,  'المزمل',    'Al-Muzzammil',  20,  'Makki'),
  (74,  'المدثر',    'Al-Muddaththir',56,  'Makki'),
  (75,  'القيامة',   'Al-Qiyamah',    40,  'Makki'),
  (76,  'الانسان',   'Al-Insan',      31,  'Madani'),
  (77,  'المرسلات',  'Al-Mursalat',   50,  'Makki'),
  (78,  'النبأ',     'An-Naba',       40,  'Makki'),
  (79,  'النازعات',  'An-Nazi''at',   46,  'Makki'),
  (80,  'عبس',       'Abasa',         42,  'Makki'),
  (81,  'التكوير',   'At-Takwir',     29,  'Makki'),
  (82,  'الإنفطار',  'Al-Infitar',    19,  'Makki'),
  (83,  'المطففين',  'Al-Mutaffifin', 36,  'Makki'),
  (84,  'الإنشقاق',  'Al-Inshiqaq',   25,  'Makki'),
  (85,  'البروج',    'Al-Buruj',      22,  'Makki'),
  (86,  'الطارق',    'At-Tariq',      17,  'Makki'),
  (87,  'الأعلى',    'Al-A''la',      19,  'Makki'),
  (88,  'الغاشية',   'Al-Ghashiyah',  26,  'Makki'),
  (89,  'الفجر',     'Al-Fajr',       30,  'Makki'),
  (90,  'البلد',     'Al-Balad',      20,  'Makki'),
  (91,  'الشمس',     'Ash-Shams',     15,  'Makki'),
  (92,  'الليل',     'Al-Layl',       21,  'Makki'),
  (93,  'الضحى',     'Ad-Duhaa',      11,  'Makki'),
  (94,  'الشرح',     'Ash-Sharh',     8,   'Makki'),
  (95,  'التين',     'At-Tin',        8,   'Makki'),
  (96,  'العلق',     'Al-Alaq',       19,  'Makki'),
  (97,  'القدر',     'Al-Qadr',       5,   'Makki'),
  (98,  'البينة',    'Al-Bayyinah',   8,   'Madani'),
  (99,  'الزلزلة',   'Az-Zalzalah',   8,   'Madani'),
  (100, 'العاديات',  'Al-Adiyat',     11,  'Makki'),
  (101, 'القارعة',   'Al-Qari''ah',   11,  'Makki'),
  (102, 'التكاثر',   'At-Takathur',   8,   'Makki'),
  (103, 'العصر',     'Al-Asr',        3,   'Makki'),
  (104, 'الهمزة',    'Al-Humazah',    9,   'Makki'),
  (105, 'الفيل',     'Al-Fil',        5,   'Makki'),
  (106, 'قريش',      'Quraysh',       4,   'Makki'),
  (107, 'الماعون',   'Al-Ma''un',     7,   'Makki'),
  (108, 'الكوثر',    'Al-Kawthar',    3,   'Makki'),
  (109, 'الكافرون',  'Al-Kafirun',    6,   'Makki'),
  (110, 'النصر',     'An-Nasr',       3,   'Madani'),
  (111, 'المسد',     'Al-Masad',      5,   'Makki'),
  (112, 'الإخلاص',   'Al-Ikhlas',     4,   'Makki'),
  (113, 'الفلق',     'Al-Falaq',      5,   'Makki'),
  (114, 'الناس',     'An-Nas',        6,   'Makki')
on conflict (number) do nothing;

-- --------------------------------------------------------------------------
-- SAMPLE scholar
-- --------------------------------------------------------------------------
insert into public.scholars (slug, name, bio, languages, subjects, status)
values (
  'sample-scholar',
  '[SAMPLE] Scholar Name',
  'SAMPLE — placeholder biography for UI testing only. Replace with a real, authorized scholar profile.',
  array['ur']::text[],
  array[]::text[],
  'active'
)
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- SAMPLE content_items (6): 2 video, 1 audio, 1 book, 1 publication, 1 article
-- --------------------------------------------------------------------------
insert into public.content_items
  (slug, title, description, type, scholar_id, category_id, language,
   status, visibility, is_featured, published_at, view_count,
   seo_title, seo_description, tags, copyright_note)
values
  (
    'sample-video-youtube-1',
    '[SAMPLE] Seerat-un-Nabi ﷺ — Sample Video Lecture',
    'SAMPLE — placeholder description for UI testing only. Replace with real content before publishing.',
    'video',
    (select id from public.scholars   where slug = 'sample-scholar'),
    (select id from public.categories where slug = 'seerat'),
    'ur', 'published', 'public', true, now(), 0,
    '[SAMPLE] Seerat-un-Nabi ﷺ — Sample Video Lecture | Noor-e-Islam',
    'SAMPLE — placeholder SEO description for UI testing only.',
    array['seerat','sample']::text[],
    'SAMPLE — replace with rights-holder permission note.'
  ),
  (
    'sample-video-upload-1',
    '[SAMPLE] Namaz ka Tareeqa — Sample Uploaded Video',
    'SAMPLE — placeholder description for UI testing only. Replace with real content before publishing.',
    'video',
    (select id from public.scholars   where slug = 'sample-scholar'),
    (select id from public.categories where slug = 'namaz-ibadat'),
    'ur', 'published', 'public', false, now(), 0,
    '[SAMPLE] Namaz ka Tareeqa — Sample Uploaded Video | Noor-e-Islam',
    'SAMPLE — placeholder SEO description for UI testing only.',
    array['namaz','sample']::text[],
    'SAMPLE — replace with rights-holder permission note.'
  ),
  (
    'sample-audio-1',
    '[SAMPLE] Dars-e-Quran — Sample Audio Lecture',
    'SAMPLE — placeholder description for UI testing only. Replace with real content before publishing.',
    'audio',
    (select id from public.scholars   where slug = 'sample-scholar'),
    (select id from public.categories where slug = 'quran-tafseer'),
    'ur', 'published', 'public', false, now(), 0,
    '[SAMPLE] Dars-e-Quran — Sample Audio Lecture | Noor-e-Islam',
    'SAMPLE — placeholder SEO description for UI testing only.',
    array['quran','sample']::text[],
    'SAMPLE — replace with rights-holder permission note.'
  ),
  (
    'sample-book-1',
    '[SAMPLE] Sample Islamic Book',
    'SAMPLE — placeholder description for UI testing only. Replace with real, licensed content before publishing.',
    'book',
    (select id from public.scholars   where slug = 'sample-scholar'),
    (select id from public.categories where slug = 'aqeedah'),
    'ur', 'published', 'public', false, now(), 0,
    '[SAMPLE] Sample Islamic Book | Noor-e-Islam',
    'SAMPLE — placeholder SEO description for UI testing only.',
    array['book','sample']::text[],
    'SAMPLE — verify public-domain or licensed status before publishing.'
  ),
  (
    'sample-publication-1',
    '[SAMPLE] Monthly Risala — Sample Issue',
    'SAMPLE — placeholder description for UI testing only. Replace with real content before publishing.',
    'publication',
    (select id from public.scholars   where slug = 'sample-scholar'),
    (select id from public.categories where slug = 'urdu-bayanaat'),
    'ur', 'published', 'public', false, now(), 0,
    '[SAMPLE] Monthly Risala — Sample Issue | Noor-e-Islam',
    'SAMPLE — placeholder SEO description for UI testing only.',
    array['risala','sample']::text[],
    'SAMPLE — replace with rights-holder permission note.'
  ),
  (
    'sample-article-1',
    '[SAMPLE] Sample Islamic Article',
    'SAMPLE — placeholder description for UI testing only. Replace with real, reviewed content before publishing.',
    'article',
    (select id from public.scholars   where slug = 'sample-scholar'),
    (select id from public.categories where slug = 'islamic-history'),
    'ur', 'published', 'public', false, now(), 0,
    '[SAMPLE] Sample Islamic Article | Noor-e-Islam',
    'SAMPLE — placeholder SEO description for UI testing only.',
    array['article','sample']::text[],
    'SAMPLE — replace with rights-holder permission note.'
  )
on conflict (slug) do nothing;

-- SAMPLE detail rows (one per content item, matching its type)
insert into public.videos (content_item_id, provider, video_url, thumbnail_url, duration_seconds)
values
  ((select id from public.content_items where slug = 'sample-video-youtube-1'),
   'youtube', 'https://www.youtube.com/watch?v=REPLACE_ME', null, 1800),
  ((select id from public.content_items where slug = 'sample-video-upload-1'),
   'upload', 'https://cdn.example.com/samples/sample-video.mp4',
   'https://cdn.example.com/samples/sample-thumb.jpg', 1200)
on conflict (content_item_id) do nothing;

insert into public.audio_tracks (content_item_id, audio_url, cover_url, duration_seconds, allow_download)
values
  ((select id from public.content_items where slug = 'sample-audio-1'),
   'https://cdn.example.com/samples/sample-audio.mp3', null, 2400, true)
on conflict (content_item_id) do nothing;

insert into public.books
  (content_item_id, author, cover_url, file_url, file_format, pages,
   publisher, publication_year, license_note, allow_download)
values
  ((select id from public.content_items where slug = 'sample-book-1'),
   '[SAMPLE] Author Name', null,
   'https://cdn.example.com/samples/sample-book.pdf', 'pdf', 120,
   null, null,
   'SAMPLE — public domain or licensed; verify rights before publishing.', false)
on conflict (content_item_id) do nothing;

insert into public.publications (content_item_id, issue_no, pdf_url, cover_url, allow_download)
values
  ((select id from public.content_items where slug = 'sample-publication-1'),
   'Vol 1 — Issue 1 (SAMPLE)',
   'https://cdn.example.com/samples/sample-risala.pdf', null, false)
on conflict (content_item_id) do nothing;

insert into public.articles (content_item_id, body_html, excerpt)
values
  ((select id from public.content_items where slug = 'sample-article-1'),
   '<p><strong>SAMPLE</strong> — placeholder article body for UI testing only. Replace with real, reviewed content.</p>',
   'SAMPLE — placeholder excerpt for UI testing only.')
on conflict (content_item_id) do nothing;

-- --------------------------------------------------------------------------
-- SAMPLE duas: religious text fields are NULL on purpose.
-- Never present these as verified religious content.
-- --------------------------------------------------------------------------
insert into public.duas
  (slug, title, arabic_text, transliteration, translation_ur, translation_en,
   source_reference, category, is_verified, status)
values
  ('sample-dua-1',
   'Sample Dua — replace with verified text',
   null, null, null, null,
   'SAMPLE — unverified placeholder for UI testing only',
   'Daily', false, 'draft'),
  ('sample-dua-2',
   'Sample Dua (Evening) — replace with verified text',
   null, null, null, null,
   'SAMPLE — unverified placeholder for UI testing only',
   'Evening', false, 'draft')
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- SAMPLE hadith: religious text fields are NULL on purpose.
-- Never present this as verified religious content.
-- --------------------------------------------------------------------------
insert into public.hadith
  (collection, book_name, chapter, hadith_number,
   arabic_text, translation_ur, translation_en,
   authenticity_grade, grade_source, is_verified, status)
values
  ('SAMPLE — replace with verified collection name',
   'SAMPLE — replace with book name',
   null, null,
   null, null, null,
   null, null, false, 'draft');

-- ============================================================================
-- STORAGE BUCKETS (manual step — Supabase Dashboard → Storage)
-- ============================================================================
-- Create these buckets in the Supabase Dashboard (Storage section). Bucket
-- creation and storage policies are NOT part of these SQL migrations:
--
--   media-public   (public)   — thumbnails, covers, public images
--   media-private  (private)  — premium/paid media, served via signed URLs
--   covers         (public)   — book / publication / audio cover images
--   documents      (private)  — PDFs, EPUBs, other downloadable documents
--
-- Then add Storage RLS policies, e.g.:
--   - media-public / covers: public read; authenticated insert/update/delete
--     limited to staff roles via public.has_any_role('editor','content_manager',
--     'administrator','super_administrator').
--   - media-private / documents: no public read; signed-URL access only;
--     writes limited to staff roles as above.
-- The media_assets table tracks uploaded files and their metadata.
-- ============================================================================

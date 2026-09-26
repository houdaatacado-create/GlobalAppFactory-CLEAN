-- Open License Videos Table
-- Stores CDN pipeline state for all open-license videos
-- Cloudflare Stream is the video provider for production playback

create table if not exists public.open_license_videos (
  -- Primary key matches the ID used in openLicenseVideoService.ts
  id text primary key,

  -- ── Cloudflare Stream (playback provider) ──────────────────────────────────
  video_provider text not null default 'cloudflare_stream',
  provider_video_id text,                  -- Cloudflare Stream UID
  stream_hls_url text,                     -- https://customer-xxx.cloudflarestream.com/{uid}/manifest/video.m3u8
  fallback_mp4_url text,                   -- MP4 fallback (optional)
  poster_url text,                         -- Poster thumbnail URL
  provider_status text,                    -- Cloudflare: inprogress | ready | error
  provider_percent_complete numeric(5,2),  -- 0.0 – 100.0
  processing_status text not null default 'rights_review',
  -- rights_review | approved_for_ingestion | downloading | transcoding | uploading | ready | failed
  processing_error text,

  -- ── Legal source (attribution record, never used for playback) ─────────────
  original_source_url text,               -- Wikimedia Commons or Archive.org URL
  commons_page_url text,                  -- Human-readable Commons page
  commons_file_title text,                -- e.g. "File:The Science of the Hajj.webm"
  creator text,
  license text,
  license_url text,
  attribution_text text,
  commercial_use_allowed boolean not null default false,
  modification_allowed boolean not null default false,

  -- ── Device test tracking ───────────────────────────────────────────────────
  device_tested boolean not null default false,
  tested_on text,                          -- 'android' | 'ios'
  tested_at timestamptz,

  -- ── Media metadata ─────────────────────────────────────────────────────────
  duration_seconds integer,
  original_mime text,
  original_size_bytes bigint,
  available_qualities text[],              -- ['1080p','720p','480p','360p']

  -- ── Timestamps ────────────────────────────────────────────────────────────
  ingested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast status queries
create index if not exists open_license_videos_processing_status_idx
  on public.open_license_videos (processing_status);

create index if not exists open_license_videos_device_tested_idx
  on public.open_license_videos (device_tested);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists open_license_videos_updated_at on public.open_license_videos;
create trigger open_license_videos_updated_at
  before update on public.open_license_videos
  for each row execute function public.set_updated_at();

-- Row Level Security: public read for ready+tested videos; service role for writes
alter table public.open_license_videos enable row level security;

create policy "Public can read ready videos"
  on public.open_license_videos for select
  using (processing_status = 'ready' and device_tested = true);

create policy "Service role has full access"
  on public.open_license_videos for all
  using (auth.role() = 'service_role');

-- Seed: insert the first 10 pipeline queue items as approved_for_ingestion
insert into public.open_license_videos (
  id, processing_status, commercial_use_allowed, modification_allowed,
  commons_file_title, creator, license, license_url, attribution_text,
  original_source_url, commons_page_url
) values
  (
    'ol_hajj_02', 'approved_for_ingestion', true, true,
    'File:The Science of the Hajj.webm',
    'New Wave Productions',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"The Science of the Hajj" by New Wave Productions. CC BY 3.0. Source: Wikimedia Commons.',
    'https://upload.wikimedia.org/wikipedia/commons/7/72/The_Science_of_the_Hajj.webm',
    'https://commons.wikimedia.org/wiki/File:The_Science_of_the_Hajj.webm'
  ),
  (
    'ol_hajj_01', 'approved_for_ingestion', true, true,
    'File:Aao Hajj Karein.webm',
    'Indian Diplomacy — Ministry of External Affairs, Government of India',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"Aao Hajj Karein" by Indian Diplomacy, CC BY 3.0. Source: Wikimedia Commons.',
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Aao_Hajj_Karein.webm',
    'https://commons.wikimedia.org/wiki/File:Aao_Hajj_Karein.webm'
  ),
  (
    'ol_history_01', 'approved_for_ingestion', true, true,
    'internet_archive:MiddleE1957',
    'United States Army Pictorial Service',
    'US Government Work — Public Domain',
    'https://www.usa.gov/government-copyright',
    'US Government work (1957). Public Domain. No copyright restrictions.',
    'https://archive.org/download/MiddleE1957/MiddleE1957.mp4',
    'https://archive.org/details/MiddleE1957'
  ),
  (
    'ol_b1_001', 'approved_for_ingestion', true, true,
    'File:Hajj.ogv',
    'SyrianMuslim (Wikimedia Commons)',
    'CC BY-SA 2.5',
    'https://creativecommons.org/licenses/by-sa/2.5/',
    'Hajj/Tawaf footage by SyrianMuslim. CC BY-SA 2.5. Any adapted version must use CC BY-SA.',
    'https://upload.wikimedia.org/wikipedia/commons/9/92/Hajj.ogv',
    'https://commons.wikimedia.org/wiki/File:Hajj.ogv'
  ),
  (
    'ol_b1_005', 'approved_for_ingestion', true, true,
    'File:Kaaba at Night (video) - Sep 28, 2016.webm',
    'Wikimedia Commons contributor',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"Kaaba at Night" (Sep 28, 2016). CC BY 3.0. Source: Wikimedia Commons.',
    null,
    'https://commons.wikimedia.org/w/index.php?search=kaaba+night+2016&ns6=1'
  ),
  (
    'ol_b1_003', 'approved_for_ingestion', true, true,
    'File:Great Mosque of Mecca (4k video) - May 27, 2014.webm',
    'Wikimedia Commons contributor',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"Great Mosque of Mecca" (4K, May 27 2014). CC BY 3.0. Source: Wikimedia Commons.',
    null,
    'https://commons.wikimedia.org/w/index.php?search=great+mosque+mecca+4k+2014&ns6=1'
  ),
  (
    'ol_arch_01', 'approved_for_ingestion', true, true,
    'File:A World of Beauty and Grace - Islamic Architecture of India.webm',
    'Indian Diplomacy — Ministry of External Affairs, Government of India',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"A World of Beauty and Grace: Islamic Architecture of India" by Indian Diplomacy, CC BY 3.0.',
    null,
    'https://commons.wikimedia.org/wiki/Category:Videos_by_Indian_Diplomacy'
  ),
  (
    'ol_history_india_01', 'approved_for_ingestion', true, true,
    'File:Islam in India - Part I.webm',
    'Indian Diplomacy — Ministry of External Affairs, Government of India',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"Islam in India – Part I" by Indian Diplomacy, CC BY 3.0. Source: Wikimedia Commons.',
    null,
    'https://commons.wikimedia.org/wiki/Category:Videos_by_Indian_Diplomacy'
  ),
  (
    'ol_history_india_02', 'approved_for_ingestion', true, true,
    'File:Islam in India - Part II.webm',
    'Indian Diplomacy — Ministry of External Affairs, Government of India',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"Islam in India – Part II" by Indian Diplomacy, CC BY 3.0. Source: Wikimedia Commons.',
    null,
    'https://commons.wikimedia.org/wiki/Category:Videos_by_Indian_Diplomacy'
  ),
  (
    'ol_makkah_timelapse_01', 'approved_for_ingestion', true, true,
    'File:Time lapse of Masjid al-Haram (Kaaba) & Hajj rites.webm',
    'Wikimedia Commons contributor',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    '"Time Lapse of Masjid al-Haram and Hajj Rites". CC BY 3.0. Source: Wikimedia Commons.',
    null,
    'https://commons.wikimedia.org/w/index.php?search=masjid+haram+time+lapse&ns6=1'
  )
on conflict (id) do nothing;

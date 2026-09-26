// Powered by OnSpace.AI
// Video Pipeline Service — Supabase + Cloudflare Stream
//
// ─── PRODUCTION STREAMING FLOW ────────────────────────────────────────────────
//
// Wikimedia Commons / Internet Archive (LEGAL SOURCE, not CDN)
//   → resolve original_file_url via Commons API
//   → POST to Cloudflare Stream /accounts/{id}/stream/copy
//   → Cloudflare downloads + transcodes automatically
//   → poll status until state = 'ready'
//   → save stream_hls_url to Supabase open_license_videos table
//   → expo-video plays HLS from Cloudflare CDN
//
// USER PLAYBACK FLOW:
//   User taps شاهد الآن
//   → fetch stream_hls_url from Supabase (processing_status='ready', device_tested=true)
//   → expo-video → HLS adaptive stream from Cloudflare
//   → 100% in-app, no external redirect
//
// ─── SECRETS REQUIRED (Supabase Dashboard → Edge Functions → Secrets) ─────────
//   CLOUDFLARE_ACCOUNT_ID   — your Cloudflare account ID
//   CLOUDFLARE_STREAM_TOKEN — API token with Stream:Write permission
//   (Never put these in app source code)
//
// ─── BACKEND TRIGGER ─────────────────────────────────────────────────────────
// POST https://[project].supabase.co/functions/v1/process-video
//   Body: { video_id: "ol_hajj_02" }
//   → imports to Cloudflare Stream
//
// POST https://[project].supabase.co/functions/v1/process-video?action=poll
//   Body: { video_id: "ol_hajj_02" }
//   → checks Cloudflare status, updates DB when ready

import { createClient } from '@supabase/supabase-js';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ProcessingStatus =
  | 'rights_review'           // License not yet verified
  | 'approved_for_ingestion'  // Verified, ready to enter pipeline
  | 'source_review'           // Ambiguous Commons result — needs manual review
  | 'downloading'             // Cloudflare is downloading from source URL
  | 'transcoding'             // Cloudflare is transcoding
  | 'uploading'               // (legacy — Cloudflare handles this internally)
  | 'ready'                   // Live on Cloudflare CDN, device_tested = true
  | 'failed';                 // Pipeline error — see processing_error

export interface VideoCDNRecord {
  id: string;

  // ── Cloudflare Stream (playback) ─────────────────────────────────────────
  video_provider: string;
  provider_video_id?: string;
  stream_hls_url?: string;
  fallback_mp4_url?: string;
  poster_url?: string;
  provider_status?: string;
  provider_percent_complete?: number;
  processing_status: ProcessingStatus;
  processing_error?: string;

  // ── Legal source (attribution, never used for playback) ──────────────────
  original_source_url?: string;
  commons_page_url?: string;
  commons_file_title?: string;
  creator?: string;
  license?: string;
  license_url?: string;
  attribution_text?: string;
  commercial_use_allowed: boolean;
  modification_allowed: boolean;

  // ── Device test ───────────────────────────────────────────────────────────
  // ── Automated validation ──────────────────────────────────────────────────
  playback_verified: boolean;   // HLS manifest validated automatically
  published: boolean;           // visible in public Watch tab

  // ── Device test ───────────────────────────────────────────────────────────
  device_tested: boolean;
  tested_on?: string;
  tested_at?: string;

  // ── Metadata ──────────────────────────────────────────────────────────────
  duration_seconds?: number;
  ingested_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
// Using anon key (public read for ready+tested videos via RLS)

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    console.warn('[VideoPipeline] Supabase env vars not set — falling back to empty catalog');
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// ─── DATABASE QUERIES ─────────────────────────────────────────────────────────

/**
 * Fetch a single CDN record by video ID.
 * Returns null if not found or Supabase not configured.
 */
export async function fetchCDNRecord(videoId: string): Promise<VideoCDNRecord | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('open_license_videos')
    .select('*')
    .eq('id', videoId)
    .single();

  if (error || !data) return null;
  return data as VideoCDNRecord;
}

/**
 * Fetch all CDN-ready videos (processing_status='ready' AND device_tested=true).
 * These are the only videos the public Watch tab shows as playable.
 */
/**
 * Fetch all publicly visible videos.
 * A video is visible when processing_status='ready' AND (published=true OR device_tested=true).
 * published=true is set automatically after HLS validation.
 * device_tested=true is set manually for QA-verified videos.
 */
export async function fetchReadyCatalog(): Promise<VideoCDNRecord[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('open_license_videos')
    .select('*')
    .eq('processing_status', 'ready')
    .or('published.eq.true,device_tested.eq.true')
    .order('ingested_at', { ascending: false });

  if (error || !data) return [];
  return data as VideoCDNRecord[];
}

/**
 * Fetch all pipeline queue items (all statuses — for admin dashboard).
 *
 * Requires a valid admin JWT (from Supabase Auth session).
 * Calls the process-video Edge Function with action=list.
 * The Edge Function verifies the JWT and checks the admin_users table.
 * Never queries open_license_videos directly with the anon key.
 */
export async function fetchPipelineQueue(accessToken: string): Promise<VideoCDNRecord[]> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  if (!url || !accessToken) return [];

  try {
    const resp = await fetch(`${url}/functions/v1/process-video?action=list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    const data = await resp.json();
    if (!resp.ok || !data.success) {
      console.warn('[VideoPipeline] fetchPipelineQueue error:', data.error || `HTTP ${resp.status}`);
      return [];
    }
    return (data.records || []) as VideoCDNRecord[];
  } catch (e: any) {
    console.warn('[VideoPipeline] fetchPipelineQueue network error:', e?.message);
    return [];
  }
}

// ─── IN-MEMORY CACHE ─────────────────────────────────────────────────────────
// Populated on first fetch, refreshed every 5 minutes.

interface CacheEntry {
  records: Map<string, VideoCDNRecord>;
  fetchedAt: number;
}

let _cache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getCache(): Promise<Map<string, VideoCDNRecord>> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.records;
  }
  const records = await fetchReadyCatalog();
  const map = new Map<string, VideoCDNRecord>();
  for (const r of records) map.set(r.id, r);
  _cache = { records: map, fetchedAt: Date.now() };
  return map;
}

export function invalidateCache(): void {
  _cache = null;
}

// ─── SYNC HELPERS (used by open-player.tsx) ───────────────────────────────────

/**
 * Check if a video is ready for in-app playback (CDN-ready + device tested).
 * Uses in-memory cache — call invalidateCache() to force refresh.
 */
export async function isVideoReadyAsync(videoId: string): Promise<boolean> {
  const cache = await getCache();
  return cache.has(videoId);
}

/**
 * Get the HLS playback URL from Cloudflare Stream CDN.
 * Returns null if not ready.
 */
export async function getCDNHlsUrlAsync(videoId: string): Promise<string | null> {
  const cache = await getCache();
  const record = cache.get(videoId);
  return record?.stream_hls_url || null;
}

/**
 * Get the full CDN record for a video.
 */
export async function getCDNRecordAsync(videoId: string): Promise<VideoCDNRecord | null> {
  const cache = await getCache();
  return cache.get(videoId) || null;
}

// ─── SYNC WRAPPERS (backward-compatible with existing components) ─────────────
// These use the pre-fetched cache. Call preloadCDNCatalog() on app start.

let _syncCache: Map<string, VideoCDNRecord> = new Map();

export function preloadCDNCatalog(records: VideoCDNRecord[]): void {
  _syncCache = new Map(records.map(r => [r.id, r]));
}

export function isVideoOnCDN(videoId: string): boolean {
  const r = _syncCache.get(videoId);
  return !!r && r.processing_status === 'ready' && (r.published || r.device_tested);
}

export function getCDNRecord(videoId: string): VideoCDNRecord | null {
  return _syncCache.get(videoId) || null;
}

export function getCDNHlsUrl(videoId: string): string | null {
  const r = _syncCache.get(videoId);
  if (!r || r.processing_status !== 'ready' || (!r.published && !r.device_tested)) return null;
  return r.stream_hls_url || r.fallback_mp4_url || null;
}

/** Derive Cloudflare thumbnail URL from provider_video_id when poster_url is missing */
function deriveCFThumbUrl(record: VideoCDNRecord): string | null {
  if (!record.provider_video_id) return null;
  // Standard Cloudflare Stream thumbnail endpoint at 15% into video
  return `https://cloudflarestream.com/${record.provider_video_id}/thumbnails/thumbnail.jpg?time=15%&height=400`;
}

export function getCDNPosterUrl(videoId: string): string | null {
  const r = _syncCache.get(videoId);
  if (!r) return null;
  // Priority: stored poster_url → derived CF thumbnail → null
  return r.poster_url || deriveCFThumbUrl(r) || null;
}

export function getVideoProcessingStatus(videoId: string): ProcessingStatus {
  return _syncCache.get(videoId)?.processing_status || 'rights_review';
}

export function canShowPlayButton(videoId: string): boolean {
  return isVideoOnCDN(videoId);
}

// ─── CONTENT TYPE ─────────────────────────────────────────────────────────────

export function getContentType(url: string): 'hls' | 'progressive' {
  return url.endsWith('.m3u8') || url.includes('manifest') ? 'hls' : 'progressive';
}

// ─── PROCESSING STATUS CONFIG ─────────────────────────────────────────────────

export const PROCESSING_STATUS_CONFIG: Record<ProcessingStatus, {
  label: string;
  labelAr: string;
  color: string;
  userMessage: string;
  userMessageAr: string;
  showPlayButton: boolean;
}> = {
  rights_review: {
    label:         'Rights Review',
    labelAr:       'مراجعة الحقوق',
    color:         '#F59E0B',
    userMessage:   'This content is being reviewed.',
    userMessageAr: 'هذا المحتوى قيد المراجعة.',
    showPlayButton: false,
  },
  source_review: {
    label:         'Source Review',
    labelAr:       'مراجعة المصدر',
    color:         '#EC4899',
    userMessage:   'Source ambiguous — needs manual review.',
    userMessageAr: 'المصدر غامض — يحتاج مراجعة يدوية.',
    showPlayButton: false,
  },
  approved_for_ingestion: {
    label:         'Approved — Queued',
    labelAr:       'معتمد — في قائمة الانتظار',
    color:         '#3B82F6',
    userMessage:   'Coming soon — content is being prepared.',
    userMessageAr: 'قريباً — يجري تحضير المحتوى.',
    showPlayButton: false,
  },
  downloading: {
    label:         'Downloading',
    labelAr:       'جارٍ التنزيل',
    color:         '#8B5CF6',
    userMessage:   'Coming soon — content is being prepared.',
    userMessageAr: 'قريباً — يجري تحضير المحتوى.',
    showPlayButton: false,
  },
  transcoding: {
    label:         'Processing',
    labelAr:       'جارٍ المعالجة',
    color:         '#F59E0B',
    userMessage:   'Coming soon — content is being processed.',
    userMessageAr: 'قريباً — يجري معالجة المحتوى.',
    showPlayButton: false,
  },
  uploading: {
    label:         'Finalizing',
    labelAr:       'جارٍ الإنهاء',
    color:         '#6366F1',
    userMessage:   'Almost ready — content will be available shortly.',
    userMessageAr: 'على وشك الاكتمال — المحتوى سيتوفر قريباً.',
    showPlayButton: false,
  },
  ready: {
    label:         'Ready',
    labelAr:       'جاهز للعرض ✓',
    color:         '#22C55E',
    userMessage:   '',
    userMessageAr: '',
    showPlayButton: true,
  },
  failed: {
    label:         'Processing Failed',
    labelAr:       'فشلت المعالجة',
    color:         '#EF4444',
    userMessage:   'This content is temporarily unavailable.',
    userMessageAr: 'تعذر تشغيل هذا المحتوى مؤقتًا.',
    showPlayButton: false,
  },
};

export function getStatusMessage(videoId: string, language: string): string {
  const status = getVideoProcessingStatus(videoId);
  const config = PROCESSING_STATUS_CONFIG[status];
  return language === 'ar' ? config.userMessageAr : config.userMessage;
}

// ─── PIPELINE QUEUE (static reference — actual state lives in Supabase) ───────
export const PIPELINE_QUEUE_IDS = [
  'ol_hajj_02',           // priority 1 — Science of the Hajj
  'ol_hajj_01',           // priority 2 — Aao Hajj Karein
  'ol_history_01',        // priority 3 — Middle East 1957
  'ol_b1_001',            // priority 4 — Hajj Tawaf (OGV)
  'ol_b1_005',            // priority 5 — Kaaba at Night
  'ol_b1_003',            // priority 6 — Great Mosque 4K
  'ol_arch_01',           // priority 7 — Islamic Architecture India
  'ol_history_india_01',  // priority 8 — Islam in India I
  'ol_history_india_02',  // priority 9 — Islam in India II
  'ol_makkah_timelapse_01', // priority 10 — Masjid al-Haram Timelapse
];

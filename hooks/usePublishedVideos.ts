// Powered by OnSpace.AI
// usePublishedVideos — live Supabase query for the Watch tab
//
// Source of truth: Supabase open_license_videos table
// Condition:       processing_status = 'ready' AND (published = true OR device_tested = true)
// Fallback:        static OPEN_LICENSE_CATALOG for metadata enrichment

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { VideoCDNRecord, preloadCDNCatalog } from '../services/videoPipelineService';

// ─── Supabase client ──────────────────────────────────────────────────────────

let _sb: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (_sb) return _sb;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  _sb = createClient(url, key);
  return _sb;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublishedVideo extends VideoCDNRecord {
  // These come from the DB
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  category_ar?: string;       // category tag stored in DB
  tags?: string[];
  series_name?: string;
  series_id?: string;
  season_number?: number;
  episode_number?: number;
  episode_title?: string;
  is_series?: boolean;
  next_episode_id?: string;
  language?: string;
  source_page_url?: string;
  license_name?: string;
}

// ─── Fetch all published videos ───────────────────────────────────────────────

export async function fetchPublishedVideos(): Promise<PublishedVideo[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('open_license_videos')
    .select('*')
    .eq('processing_status', 'ready')
    .or('published.eq.true,device_tested.eq.true')
    .order('ingested_at', { ascending: false });

  if (error) {
    console.warn('[usePublishedVideos] fetch error:', error.message);
    return [];
  }
  return (data || []) as PublishedVideo[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePublishedVideosResult {
  videos: PublishedVideo[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  totalCount: number;
}

export function usePublishedVideos(autoRefreshMs = 60_000): UsePublishedVideosResult {
  const [videos, setVideos] = useState<PublishedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchPublishedVideos();
      if (!mountedRef.current) return;
      setVideos(data);
      setError(null);
      // Keep the sync cache in videoPipelineService updated too
      preloadCDNCatalog(data);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Unknown error');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();

    if (autoRefreshMs > 0) {
      timerRef.current = setInterval(load, autoRefreshMs);
    }
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load, autoRefreshMs]);

  return {
    videos,
    loading,
    error,
    refresh: load,
    totalCount: videos.length,
  };
}

// ─── Thumbnail fallback images (local, by category) ─────────────────────────
// Generated AI images used when no poster_url / CDN thumbnail is available.
// expo-image supports source arrays — it tries each in order until one loads.

const THUMB_FALLBACKS: Record<string, any> = {
  hajj_documentary:     require('../assets/images/thumb_hajj.jpg'),
  hajj_education:       require('../assets/images/thumb_hajj.jpg'),
  hajj_historical:      require('../assets/images/thumb_hajj.jpg'),
  makkah_madinah:       require('../assets/images/thumb_makkah.jpg'),
  islamic_history:      require('../assets/images/thumb_history.jpg'),
  islamic_civilization: require('../assets/images/thumb_civilization.jpg'),
  architecture:         require('../assets/images/thumb_history.jpg'),
  sufi_heritage:        require('../assets/images/thumb_documentary.jpg'),
  general_documentary:  require('../assets/images/thumb_documentary.jpg'),
  eid:                  require('../assets/images/thumb_makkah.jpg'),
  new_muslims:          require('../assets/images/thumb_default.jpg'),
  default:              require('../assets/images/thumb_default.jpg'),
};

/**
 * Central thumbnail resolver — returns an array of image sources for expo-image.
 * expo-image tries each in order; first successful load wins.
 *
 * Priority:
 *  1. curated poster_url from DB
 *  2. Cloudflare thumbnail from provider_video_id
 *  3. archive.org auto-thumbnail
 *  4. category-specific branded fallback (local AI-generated image)
 *  5. universal default (local)
 */
export function getVideoThumbnailSources(v: PublishedVideo): Array<{ uri: string } | number> {
  const sources: Array<{ uri: string } | number> = [];

  // 1. Curated poster
  if (v.poster_url) sources.push({ uri: v.poster_url });

  // 2. Cloudflare CDN thumbnail
  if (v.provider_video_id) {
    sources.push({ uri: `https://videodelivery.net/${v.provider_video_id}/thumbnails/thumbnail.jpg?time=15%25&height=400` });
    // Also try at different timestamp
    sources.push({ uri: `https://videodelivery.net/${v.provider_video_id}/thumbnails/thumbnail.jpg?time=30%25&height=400` });
  }

  // 3. Archive.org auto-thumbnail (reliable for all archive items)
  const isArchive = (v as any).video_provider === 'archive_org' || (!v.stream_hls_url && !v.provider_video_id);
  if (isArchive && v.id && !v.id.startsWith('ol_')) {
    sources.push({ uri: `https://archive.org/services/img/${v.id}` });
  }

  // 4. Category branded fallback
  const cat = getPublishedVideoCategory(v);
  const localFallback = THUMB_FALLBACKS[cat] || THUMB_FALLBACKS.default;
  sources.push(localFallback);

  // 5. Universal default
  if (!sources.includes(THUMB_FALLBACKS.default)) {
    sources.push(THUMB_FALLBACKS.default);
  }

  return sources;
}

/**
 * Legacy helper — returns a single string URI (for non-expo-image contexts).
 * Prefer getVideoThumbnailSources() for expo-image components.
 */
export function getPublishedVideoPoster(v: PublishedVideo): string {
  if (v.poster_url) return v.poster_url;
  if (v.provider_video_id) {
    return `https://videodelivery.net/${v.provider_video_id}/thumbnails/thumbnail.jpg?time=15%25&height=400`;
  }
  const isArchive = (v as any).video_provider === 'archive_org' || (!v.stream_hls_url && !v.provider_video_id);
  if (isArchive && v.id && !v.id.startsWith('ol_')) {
    return `https://archive.org/services/img/${v.id}`;
  }
  return '';
}

// ─── Helper: get title from DB record ────────────────────────────────────────

export function getPublishedVideoTitle(v: PublishedVideo, language: string): string {
  if (language === 'ar' && v.title_ar) return v.title_ar;
  if (v.title_en) return v.title_en;
  // Fallback: derive from commons_file_title or id
  if (v.commons_file_title) return v.commons_file_title.replace(/_/g, ' ').replace(/\.webm$/, '').replace(/\.ogv$/, '');
  return v.id;
}

/**
 * Returns the local require() fallback image for a given category key.
 * Category key is returned by getOpenVideoCategoryKey() in openLicenseVideoService.
 * All require() asset calls MUST live in the hooks/components layer, never in services.
 */
export function getOpenVideoFallbackThumb(categoryKey: string): any {
  const map: Record<string, any> = {
    hajj:         THUMB_FALLBACKS.hajj_documentary,
    makkah:       THUMB_FALLBACKS.makkah_madinah,
    history:      THUMB_FALLBACKS.islamic_history,
    civilization: THUMB_FALLBACKS.islamic_civilization,
    documentary:  THUMB_FALLBACKS.general_documentary,
    default:      THUMB_FALLBACKS.default,
  };
  return map[categoryKey] || THUMB_FALLBACKS.default;
}

/**
 * Builds a multi-source thumbnail array for OpenLicenseVideo catalog items.
 * Pass cdnProviderVideoId and posterUrl from the CDN record when available.
 */
export function getOpenLicenseThumbnailSources(
  categoryKey: string,
  cdnProviderVideoId?: string | null,
  posterUrl?: string | null,
): Array<{ uri: string } | number> {
  const sources: Array<{ uri: string } | number> = [];
  if (posterUrl) sources.push({ uri: posterUrl });
  if (cdnProviderVideoId) {
    sources.push({ uri: `https://videodelivery.net/${cdnProviderVideoId}/thumbnails/thumbnail.jpg?time=15%25&height=400` });
    sources.push({ uri: `https://videodelivery.net/${cdnProviderVideoId}/thumbnails/thumbnail.jpg?time=30%25&height=400` });
  }
  sources.push(getOpenVideoFallbackThumb(categoryKey));
  return sources;
}

export function getPublishedVideoCategory(v: PublishedVideo): string {
  // Try to match DB category_ar/tags to a known category
  const tags = v.tags || [];
  const tagsLow = tags.map((t: string) => t.toLowerCase());

  if (tagsLow.some((t: string) => ['hajj', 'makkah', 'kaaba', 'tawaf', 'umrah', 'pilgrimage', 'الحج', 'العمرة', 'مكة', 'كعبة'].includes(t))) return 'hajj_documentary';
  if (tagsLow.some((t: string) => ['madinah', 'medina', 'masjid al-haram', 'grand mosque', 'al-aqsa', 'holy site', 'المدينة', 'المسجد الحرام'].includes(t))) return 'makkah_madinah';
  if (tagsLow.some((t: string) => ['architecture', 'ottoman', 'istanbul', 'mosque design', 'عمارة', 'أندلس'].includes(t))) return 'architecture';
  if (tagsLow.some((t: string) => ['sufi', 'poetry', 'kashmir', 'shrines', 'mysticism', 'heer ranjha', 'sassi punnu', 'sheikh farid', 'rumi'].includes(t))) return 'sufi_heritage';
  if (tagsLow.some((t: string) => ['eid', 'ramadan', 'prayer', 'khutba', 'adhan', 'takbeer'].includes(t))) return 'eid';
  if (tagsLow.some((t: string) => ['new muslims', 'conversion', 'revert', 'testimony'].includes(t))) return 'new_muslims';
  if (tagsLow.some((t: string) => ['islamic science', 'mathematics', 'knowledge', 'حضارة', 'حضارة إسلامية', 'civilization'].includes(t))) return 'islamic_civilization';
  if (tagsLow.some((t: string) => ['history', 'historical', 'islamic history', 'muslim personality', 'mughal', 'تاريخ', 'تاريخ إسلامي', 'عمر', 'علي', 'الرسالة', 'فيلم', 'وثائقي'].includes(t))) return 'islamic_history';
  if (tagsLow.some((t: string) => ['أفلام إسلامية', 'فيلم', 'رسوم متحركة', 'كرتون'].includes(t))) return 'general_documentary';

  // Match by category_ar field (used by lf_* batch records and archive_org inserts)
  if (v.category_ar) {
    const catLow = v.category_ar;
    if (catLow.includes('الحج') || catLow.includes('العمرة')) return 'hajj_documentary';
    if (catLow.includes('مكة') || catLow.includes('المدينة')) return 'makkah_madinah';
    if (catLow.includes('العمارة')) return 'architecture';
    if (catLow.includes('الصوفي') || catLow.includes('التراث الصوفي')) return 'sufi_heritage';
    if (catLow.includes('رمضان') || catLow.includes('العيد')) return 'eid';
    if (catLow.includes('أسلمت')) return 'new_muslims';
    if (catLow.includes('التاريخ الإسلامي')) return 'islamic_history';
    if (catLow.includes('الحضارة الإسلامية')) return 'islamic_civilization';
    if (catLow.includes('أفلام إسلامية')) return 'general_documentary';
  }

  return 'general_documentary';
}

export function formatPublishedDuration(seconds: number | undefined): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  const s = seconds % 60;
  return `${s}s`;
}

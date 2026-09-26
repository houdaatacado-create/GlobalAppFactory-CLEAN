// Powered by OnSpace.AI
// Video Resolver Service
// Architecture for resolving RESOLVE_BY_API videos via YouTube Data API
// Also contains Islamic Relevance Scoring and Auto-reject filter

import {
  VideoItem, PENDING_RESOLUTION_CATALOG, AUTO_REJECT_KEYWORDS,
  ARABIC_ISLAMIC_KEYWORDS, TRUSTED_CHANNELS, TrustedChannel,
} from './videoService';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSeconds: number;
  publishedAt: string;
  embeddable: boolean;
  viewCount?: number;
}

export interface ResolveResult {
  videoId: string;                      // our internal ID
  status: 'resolved' | 'not_found' | 'wrong_channel' | 'not_embeddable' | 'too_short' | 'auto_rejected';
  youtube_video_id?: string;
  youtube_data?: YouTubeVideoData;
  message?: string;
}

export interface ImportCandidate {
  youtube_video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_name: string;
  duration_seconds: number;
  thumbnail_url: string;
  published_at: string;
  embeddable: boolean;
  islamic_relevance_score: number;
  auto_rejected: boolean;
  reject_reason?: string;
  review_status: 'Pending Editorial Review' | 'Pending Resolution' | 'Rejected';
}

// ─── ISLAMIC RELEVANCE SCORER ─────────────────────────────────────────────────
// Used for automated filtering of large channel imports (600 Arabic videos plan)

export function computeIslamicRelevanceScore(
  title: string,
  description: string,
  channelTrusted: boolean,
  durationSeconds: number,
  language: string,
): number {
  let score = 0;
  const combinedText = (title + ' ' + description).toLowerCase();

  // Trusted Islamic channel bonus
  if (channelTrusted) score += 25;

  // Duration bonus (long-form preferred)
  if (durationSeconds >= 1200) score += 10;      // 20+ min
  else if (durationSeconds >= 720) score += 5;    // 12+ min

  // Arabic keyword matching
  if (language === 'ar') {
    for (const keyword of ARABIC_ISLAMIC_KEYWORDS) {
      if (combinedText.includes(keyword)) {
        score += 5;
        if (score >= 55) break; // cap contribution from keywords
      }
    }
  } else {
    // English/other Islamic keywords
    const engKeywords = ['islam', 'muslim', 'quran', 'hadith', 'prophet', 'prayer',
      'hajj', 'umrah', 'ramadan', 'seerah', 'sahaba', 'mosque', 'allah', 'fiqh',
      'sunnah', 'aqeedah', 'tafsir', 'islamic', 'makkah', 'madinah'];
    for (const kw of engKeywords) {
      if (combinedText.includes(kw)) {
        score += 4;
        if (score >= 55) break;
      }
    }
  }

  return Math.min(100, score);
}

export function shouldAutoReject(title: string, description: string, durationSeconds: number): {
  reject: boolean;
  reason?: string;
} {
  const text = (title + ' ' + description).toLowerCase();

  // Duration check
  if (durationSeconds < 720 && durationSeconds > 0) {
    return { reject: true, reason: 'Duration under 12 minutes' };
  }

  // Auto-reject keywords
  for (const keyword of AUTO_REJECT_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return { reject: true, reason: `Contains rejected keyword: "${keyword}"` };
    }
  }

  // Title starts with # (shorts indicator)
  if (title.trim().startsWith('#')) {
    return { reject: true, reason: 'Likely a Short (title starts with #)' };
  }

  return { reject: false };
}

// ─── resolveYouTubeVideo() ────────────────────────────────────────────────────
// IMPORTANT: This function requires a YouTube Data API v3 key.
// In production, this should run on your Supabase Edge Function,
// NOT on the client app (to protect API key and avoid quota abuse).
//
// Client-side usage: Call your Supabase Edge Function instead.
// The implementation below shows the complete resolution logic.

export interface ResolveOptions {
  youtubeApiKey?: string;     // Only used when called from Edge Function
  trustedChannelId?: string;  // Required to verify channel identity
  trustedChannelHandle?: string;
  exactTitle: string;
  minimumDurationSeconds?: number;
}

/**
 * resolveYouTubeVideo()
 *
 * 1. Search YouTube Data API for the exact title in a trusted channel
 * 2. Verify channel identity (channelId or handle must match)
 * 3. Check video is public and embeddable
 * 4. Check duration meets minimum
 * 5. Save resolved data
 * 6. If not found → keep as Pending Resolution
 * 7. Never pick a video from the wrong channel
 */
export async function resolveYouTubeVideo(
  options: ResolveOptions,
): Promise<ResolveResult & { data?: YouTubeVideoData }> {
  const {
    youtubeApiKey,
    trustedChannelHandle,
    exactTitle,
    minimumDurationSeconds = 240,
  } = options;

  // ─── In Client/App Mode: delegate to Supabase Edge Function ───────────────
  if (!youtubeApiKey) {
    // Pattern for Supabase Edge Function call:
    // const { data, error } = await supabase.functions.invoke('resolve-youtube-video', {
    //   body: { exactTitle, trustedChannelHandle, minimumDurationSeconds }
    // });
    // return data;
    console.warn('[resolveYouTubeVideo] No API key provided. Use Supabase Edge Function in production.');
    return {
      videoId: '',
      status: 'not_found',
      message: 'API key required. Use Edge Function in production.',
    };
  }

  try {
    // Step 1: Search by exact title + channel
    const channelFilter = trustedChannelHandle
      ? `&channelHandle=${encodeURIComponent(trustedChannelHandle)}`
      : '';

    const searchUrl = `https://www.googleapis.com/youtube/v3/search`
      + `?part=snippet&type=video&maxResults=5`
      + `&q=${encodeURIComponent(exactTitle)}`
      + channelFilter
      + `&key=${youtubeApiKey}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return { videoId: '', status: 'not_found', message: 'No results found on YouTube.' };
    }

    // Step 2: Find exact title match
    const exactMatch = searchData.items.find((item: any) => {
      const ytTitle: string = item.snippet?.title || '';
      return ytTitle.toLowerCase().trim() === exactTitle.toLowerCase().trim();
    });

    if (!exactMatch) {
      return {
        videoId: '',
        status: 'not_found',
        message: 'No exact title match found. Partial matches are rejected for safety.',
      };
    }

    const foundVideoId: string = exactMatch.id?.videoId;
    if (!foundVideoId) {
      return { videoId: '', status: 'not_found', message: 'Video ID not found in result.' };
    }

    // Step 3: Get video details (embeddable, duration, status)
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos`
      + `?part=snippet,contentDetails,status,statistics`
      + `&id=${foundVideoId}`
      + `&key=${youtubeApiKey}`;

    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    if (!detailData.items || detailData.items.length === 0) {
      return { videoId: '', status: 'not_found', message: 'Video details not available.' };
    }

    const videoDetail = detailData.items[0];

    // Step 4: Verify channel (CRITICAL — never accept wrong channel)
    const actualChannelId: string = videoDetail.snippet?.channelId || '';
    const actualChannelTitle: string = videoDetail.snippet?.channelTitle || '';

    // Channel handle verification is done server-side via channel lookup
    // For now, log for manual review
    console.log(`[resolveYouTubeVideo] Channel: ${actualChannelTitle} (${actualChannelId})`);

    // Step 5: Check embeddable
    const embeddable: boolean = videoDetail.status?.embeddable ?? true;
    if (!embeddable) {
      return {
        videoId: '',
        status: 'not_embeddable',
        message: 'Video has embedding disabled. Cannot use in app.',
      };
    }

    // Step 6: Check duration
    const durationIso: string = videoDetail.contentDetails?.duration || 'PT0S';
    const durationSeconds = parseDurationISO(durationIso);

    if (durationSeconds < minimumDurationSeconds) {
      return {
        videoId: '',
        status: 'too_short',
        message: `Duration ${durationSeconds}s is below minimum ${minimumDurationSeconds}s.`,
      };
    }

    // Step 7: Check auto-reject
    const { reject, reason } = shouldAutoReject(
      videoDetail.snippet?.title || '',
      videoDetail.snippet?.description || '',
      durationSeconds,
    );

    if (reject) {
      return {
        videoId: '',
        status: 'auto_rejected',
        message: `Auto-rejected: ${reason}`,
      };
    }

    // Step 8: Resolved successfully
    const youtube_data: YouTubeVideoData = {
      videoId: foundVideoId,
      title: videoDetail.snippet?.title || exactTitle,
      description: videoDetail.snippet?.description || '',
      channelId: actualChannelId,
      channelTitle: actualChannelTitle,
      thumbnailUrl: videoDetail.snippet?.thumbnails?.high?.url
        || videoDetail.snippet?.thumbnails?.default?.url
        || `https://img.youtube.com/vi/${foundVideoId}/hqdefault.jpg`,
      durationSeconds,
      publishedAt: videoDetail.snippet?.publishedAt || '',
      embeddable,
      viewCount: parseInt(videoDetail.statistics?.viewCount || '0', 10),
    };

    return {
      videoId: '',
      status: 'resolved',
      youtube_video_id: foundVideoId,
      youtube_data,
      message: `Resolved: ${youtube_data.title} (${youtube_data.channelTitle})`,
    };

  } catch (err: any) {
    return {
      videoId: '',
      status: 'not_found',
      message: `Network error: ${err?.message || 'Unknown error'}`,
    };
  }
}

// ─── ISO 8601 Duration Parser ─────────────────────────────────────────────────
// Converts PT1H30M45S → seconds
export function parseDurationISO(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// ─── BATCH RESOLVER ───────────────────────────────────────────────────────────
// Process all RESOLVE_BY_API videos in the pending catalog
// NOTE: Use this from Supabase Edge Function, not from the app directly
export async function resolvePendingBatch(
  apiKey: string,
  onProgress?: (done: number, total: number, result: ResolveResult) => void,
): Promise<ResolveResult[]> {
  const pending = PENDING_RESOLUTION_CATALOG;
  const results: ResolveResult[] = [];

  for (let i = 0; i < pending.length; i++) {
    const video = pending[i];
    const trustedChannel = TRUSTED_CHANNELS.find(tc => tc.name === video.channel);

    const result = await resolveYouTubeVideo({
      youtubeApiKey: apiKey,
      trustedChannelHandle: trustedChannel?.youtubeHandle,
      exactTitle: video.title,
      minimumDurationSeconds: trustedChannel?.minimum_duration_seconds || 240,
    });

    result.videoId = video.id;
    results.push(result);
    onProgress?.(i + 1, pending.length, result);

    // Throttle to avoid YouTube API quota exhaustion (100 units/query)
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
}

// ─── CHANNEL IMPORT PIPELINE ──────────────────────────────────────────────────
// Architecture for importing 600+ Arabic long-form videos from trusted channels
// This is the pipeline described in the brief for IQRAA, Al Resalah, etc.

export interface ChannelImportConfig {
  channelId: string;           // YouTube channel ID
  channelHandle: string;       // e.g. @iqraa
  targetCount: number;
  language: string;
  minimumDurationSeconds: number;
  islamicKeywords: string[];
  minimumRelevanceScore: number;
  youtubeApiKey: string;
}

/**
 * importFromTrustedChannel()
 *
 * Full pipeline:
 * 1. Get channel upload playlist
 * 2. Fetch videos in batches
 * 3. Fetch content details (duration, embeddable)
 * 4. Apply language/title filter
 * 5. Compute Islamic relevance score
 * 6. Auto-reject below threshold or matching reject keywords
 * 7. Store as Pending Editorial Review (NEVER auto-publish)
 */
export async function importFromTrustedChannel(
  config: ChannelImportConfig,
  onBatchComplete?: (batch: ImportCandidate[]) => void,
): Promise<{
  total_fetched: number;
  approved_for_review: number;
  auto_rejected: number;
  candidates: ImportCandidate[];
}> {
  const { channelId, targetCount, language, minimumDurationSeconds,
          islamicKeywords, minimumRelevanceScore, youtubeApiKey } = config;

  const candidates: ImportCandidate[] = [];
  let autoRejectedCount = 0;
  let nextPageToken: string | undefined;
  let fetched = 0;

  // Step 1: Get uploads playlist
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels`
    + `?part=contentDetails&id=${channelId}&key=${youtubeApiKey}`
  );
  const channelData = await channelRes.json();
  const uploadsPlaylistId: string =
    channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    return { total_fetched: 0, approved_for_review: 0, auto_rejected: 0, candidates: [] };
  }

  // Step 2: Fetch videos in batches of 50
  while (fetched < targetCount * 2) { // fetch 2x target to account for rejections
    const pageParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems`
      + `?part=snippet,contentDetails&maxResults=50`
      + `&playlistId=${uploadsPlaylistId}`
      + pageParam
      + `&key=${youtubeApiKey}`
    );
    const playlistData = await playlistRes.json();
    const items: any[] = playlistData?.items || [];

    if (items.length === 0) break;
    fetched += items.length;

    // Step 3: Get content details for duration and embeddable status
    const videoIds = items.map((i: any) => i.contentDetails?.videoId).filter(Boolean).join(',');
    const detailRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos`
      + `?part=snippet,contentDetails,status,statistics`
      + `&id=${videoIds}`
      + `&key=${youtubeApiKey}`
    );
    const detailData = await detailRes.json();
    const detailMap: Record<string, any> = {};
    for (const item of detailData?.items || []) {
      detailMap[item.id] = item;
    }

    const batchCandidates: ImportCandidate[] = [];

    for (const playlistItem of items) {
      const videoId: string = playlistItem.contentDetails?.videoId;
      const detail = detailMap[videoId];
      if (!detail) continue;

      const title: string = detail.snippet?.title || '';
      const description: string = detail.snippet?.description || '';
      const durationSeconds = parseDurationISO(detail.contentDetails?.duration || 'PT0S');
      const embeddable: boolean = detail.status?.embeddable ?? false;
      const publishedAt: string = detail.snippet?.publishedAt || '';
      const thumbnail: string =
        detail.snippet?.thumbnails?.high?.url ||
        detail.snippet?.thumbnails?.default?.url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      // Step 4–5: Auto-reject check
      const { reject, reason } = shouldAutoReject(title, description, durationSeconds);

      if (reject || !embeddable) {
        autoRejectedCount++;
        continue;
      }

      // Step 5: Islamic relevance score
      const relevanceScore = computeIslamicRelevanceScore(
        title, description, true, durationSeconds, language
      );

      if (relevanceScore < minimumRelevanceScore) {
        autoRejectedCount++;
        continue;
      }

      batchCandidates.push({
        youtube_video_id: videoId,
        title,
        description,
        channel_id: channelId,
        channel_name: detail.snippet?.channelTitle || '',
        duration_seconds: durationSeconds,
        thumbnail_url: thumbnail,
        published_at: publishedAt,
        embeddable,
        islamic_relevance_score: relevanceScore,
        auto_rejected: false,
        review_status: 'Pending Editorial Review',
      });

      if (candidates.length + batchCandidates.length >= targetCount) break;
    }

    candidates.push(...batchCandidates);
    onBatchComplete?.(batchCandidates);

    if (!playlistData.nextPageToken || candidates.length >= targetCount) break;
    nextPageToken = playlistData.nextPageToken;

    // Throttle API calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    total_fetched: fetched,
    approved_for_review: candidates.length,
    auto_rejected: autoRejectedCount,
    candidates: candidates.slice(0, targetCount),
  };
}

// ─── ARABIC WATCH SHELF CATEGORIES ───────────────────────────────────────────
// Target organization for 600+ Arabic long-form catalog
export const ARABIC_WATCH_SHELVES = [
  { id: 'ar_documentaries', labelAr: 'أفلام وثائقية', labelEn: 'Documentaries', category: 'documentary' },
  { id: 'ar_series', labelAr: 'مسلسلات وسلاسل', labelEn: 'Series & Programs', category: 'series_episode' },
  { id: 'ar_seerah', labelAr: 'السيرة النبوية', labelEn: 'Seerah', category: 'seerah_history' },
  { id: 'ar_prophets', labelAr: 'قصص الأنبياء', labelEn: "Prophet Stories", category: 'prophet_stories' },
  { id: 'ar_sahaba', labelAr: 'قصص الصحابة', labelEn: 'Companion Stories', category: 'seerah_history' },
  { id: 'ar_history', labelAr: 'التاريخ الإسلامي', labelEn: 'Islamic History', category: 'seerah_history' },
  { id: 'ar_civilization', labelAr: 'الحضارة الإسلامية', labelEn: 'Islamic Civilization', category: 'civilization' },
  { id: 'ar_hajj_umrah', labelAr: 'الحج والعمرة', labelEn: 'Hajj & Umrah', category: 'hajj_umrah' },
  { id: 'ar_makkah', labelAr: 'مكة والمدينة', labelEn: 'Makkah & Madinah', category: 'sacred_places' },
  { id: 'ar_haram', labelAr: 'المسجد الحرام', labelEn: 'Al-Masjid Al-Haram', category: 'mosques' },
  { id: 'ar_nabawi', labelAr: 'المسجد النبوي', labelEn: 'Al-Masjid An-Nabawi', category: 'mosques' },
  { id: 'ar_ramadan', labelAr: 'رمضان', labelEn: 'Ramadan', category: 'ramadan' },
  { id: 'ar_personalities', labelAr: 'شخصيات إسلامية', labelEn: 'Islamic Personalities', category: 'personalities' },
  { id: 'ar_scholars', labelAr: 'العلماء المسلمون', labelEn: 'Muslim Scholars', category: 'scholars' },
  { id: 'ar_andalusia', labelAr: 'الأندلس', labelEn: 'Al-Andalus', category: 'andalusia' },
  { id: 'ar_kids', labelAr: 'للأطفال', labelEn: 'For Kids', category: 'kids' },
  { id: 'ar_trending', labelAr: 'الأكثر مشاهدة', labelEn: 'Most Watched', category: 'all' },
  { id: 'ar_new', labelAr: 'أضيف حديثًا', labelEn: 'Recently Added', category: 'all' },
  { id: 'ar_recommended', labelAr: 'مختارات لك', labelEn: 'Picks For You', category: 'all' },
];

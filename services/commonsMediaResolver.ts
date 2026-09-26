// Powered by OnSpace.AI
// Wikimedia Commons Media Resolver
//
// Resolves the actual current download URL for a Wikimedia Commons file
// using the official MediaWiki API. Never guess /commons/x/xx/ hash paths.
//
// API endpoint:
//   https://commons.wikimedia.org/w/api.php
//   action=query & prop=imageinfo & iiprop=url|mime|size|mediatype|extmetadata
//
// Usage:
//   const info = await resolveCommonsMedia('File:The Science of the Hajj.webm');
//   // info.originalUrl → actual download URL, e.g. https://upload.wikimedia.org/...
//
// Architecture:
//   Phase 1 (now): resolve URL at play-time, stream directly from Wikimedia (dev/test).
//   Phase 2 (prod): after URL is resolved and rights verified, download → transcode → CDN.
//
// IMPORTANT: Do NOT ingest (download) any file unless:
//   rights_status === 'verified' AND commercial_use_allowed === true

export interface CommonsMediaInfo {
  fileTitle: string;           // e.g. "File:The Science of the Hajj.webm"
  originalUrl: string;         // Actual current download URL from Wikimedia CDN
  descriptionUrl: string;      // Commons page URL
  mime: string;                // e.g. "video/webm"
  mediaType: string;           // e.g. "VIDEO"
  fileSizeBytes: number;
  width: number;
  height: number;
  durationSeconds?: number;    // If available in extmetadata
  resolvedAt: number;          // Date.now() — for cache invalidation
  httpStatus?: number;         // Result of HEAD check
  isStreamable: boolean;       // true if HEAD returned 200 and MIME is video/*
}

export type ResolveStatus =
  | 'resolved'           // URL found and HEAD = 200
  | 'not_found'          // API returned missing page
  | 'http_error'         // HEAD check failed (404 etc.)
  | 'api_error'          // MediaWiki API call failed
  | 'timeout';           // Request timed out

export interface ResolveResult {
  status: ResolveStatus;
  info?: CommonsMediaInfo;
  error?: string;
  httpStatus?: number;
}

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes per session

// In-memory cache (per app session)
const _cache: Map<string, CommonsMediaInfo> = new Map();

// ─── MAIN RESOLVER ────────────────────────────────────────────────────────────

export async function resolveCommonsMedia(
  fileTitle: string,
  checkHttp = true,
  timeoutMs = 12000,
): Promise<ResolveResult> {
  const normalizedTitle = fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`;

  // Cache hit?
  const cached = _cache.get(normalizedTitle);
  if (cached && Date.now() - cached.resolvedAt < CACHE_TTL_MS) {
    return { status: 'resolved', info: cached };
  }

  // ── Step 1: Query Wikimedia API ──────────────────────────────────────────
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'imageinfo',
    titles: normalizedTitle,
    iiprop: 'url|mime|size|mediatype|extmetadata|dimensions',
  });

  let apiData: any;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(`${WIKIMEDIA_API}?${params.toString()}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timer);
    apiData = await resp.json();
  } catch (err: any) {
    if (err?.name === 'AbortError') return { status: 'timeout', error: 'API request timed out' };
    return { status: 'api_error', error: String(err?.message || err) };
  }

  // ── Step 2: Parse API response ───────────────────────────────────────────
  const pages: Record<string, any> = apiData?.query?.pages || {};
  const pageKey = Object.keys(pages)[0];
  if (!pageKey || pageKey === '-1') {
    return { status: 'not_found', error: `File not found on Wikimedia Commons: "${normalizedTitle}"` };
  }

  const page = pages[pageKey];
  const ii = page?.imageinfo?.[0];
  if (!ii?.url) {
    return { status: 'not_found', error: 'imageinfo.url missing from API response' };
  }

  // Parse duration from extmetadata if available
  let durationSeconds: number | undefined;
  const ext = ii?.extmetadata || {};
  if (ext?.Duration?.value) {
    const d = parseFloat(ext.Duration.value);
    if (!isNaN(d)) durationSeconds = Math.round(d);
  }

  const info: CommonsMediaInfo = {
    fileTitle: normalizedTitle,
    originalUrl: ii.url,
    descriptionUrl: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(normalizedTitle)}`,
    mime: ii.mime || 'video/webm',
    mediaType: ii.mediatype || 'VIDEO',
    fileSizeBytes: ii.size || 0,
    width: ii.width || 0,
    height: ii.height || 0,
    durationSeconds,
    resolvedAt: Date.now(),
    isStreamable: false,
  };

  // ── Step 3: HTTP HEAD check ───────────────────────────────────────────────
  if (checkHttp) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const headResp = await fetch(info.originalUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timer);
      info.httpStatus = headResp.status;
      info.isStreamable = headResp.ok && (info.mime.startsWith('video/') || info.mime.startsWith('application/'));
    } catch {
      // HEAD check failed — still return the URL, player will try and show its own error
      info.httpStatus = 0;
      info.isStreamable = false;
    }
  } else {
    info.isStreamable = info.mime.startsWith('video/');
  }

  _cache.set(normalizedTitle, info);
  return {
    status: info.isStreamable ? 'resolved' : 'http_error',
    info,
    httpStatus: info.httpStatus,
    error: info.isStreamable ? undefined : `HTTP ${info.httpStatus} — file not streamable`,
  };
}

// ─── BATCH RESOLVER ───────────────────────────────────────────────────────────
export async function resolveCommonsMediaBatch(
  fileTitles: string[],
): Promise<Map<string, ResolveResult>> {
  const results = new Map<string, ResolveResult>();
  // Process sequentially to be kind to Wikimedia servers
  for (const title of fileTitles) {
    results.set(title, await resolveCommonsMedia(title, false));
    await new Promise(r => setTimeout(r, 200)); // 200ms delay
  }
  return results;
}

// ─── CACHE HELPERS ────────────────────────────────────────────────────────────
export function getCachedMediaInfo(fileTitle: string): CommonsMediaInfo | null {
  const normalized = fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`;
  const cached = _cache.get(normalized);
  if (cached && Date.now() - cached.resolvedAt < CACHE_TTL_MS) return cached;
  return null;
}

export function clearCommonsCache(): void {
  _cache.clear();
}

// ─── DURATION FORMATTER ───────────────────────────────────────────────────────
export function formatDurationSec(seconds: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (s > 0 && m < 2) return `${m}m ${s}s`;
  return `${m}m`;
}

// ─── PHASE 1 VIDEO REGISTRY ───────────────────────────────────────────────────
// Maps video IDs to their canonical Wikimedia Commons file titles.
// These are the only strings needed to resolve the actual download URL.
// DO NOT hardcode upload.wikimedia.org paths — use these titles + resolveCommonsMedia().

export const COMMONS_FILE_TITLES: Record<string, string> = {
  'ol_hajj_01':              'File:Aao Hajj Karein.webm',
  'ol_hajj_02':              'File:The Science of the Hajj.webm',
  'ol_history_01':           'internet_archive:MiddleE1957',         // Special: Internet Archive
  'ol_arch_01':              'File:A World of Beauty and Grace - Islamic Architecture of India.webm',
  'ol_history_india_01':     'File:Islam in India - Part I.webm',
  'ol_history_india_02':     'File:Islam in India - Part II.webm',
  'ol_hajj_historical_01':   'File:Hajj, 1360-61 AH.webm',
  'ol_hajj_guide_01':        'File:A Step by Step Guide to Hajj (Islamic pilgrimages).webm',
  'ol_makkah_timelapse_01':  'File:Time lapse of Masjid al-Haram (Kaaba) & Hajj rites.webm',
  'ol_b1_001':               'File:Hajj.ogv',
  'ol_b1_002':               'File:Great Mosque of Mecca (video) - Feb 4, 2010.webm',
  'ol_b1_003':               'File:Great Mosque of Mecca (4k video) - May 27, 2014.webm',
  'ol_b1_004':               'File:Great Mosque of Mecca (video) - Mar 18, 2015.webm',
  'ol_b1_005':               'File:Kaaba at Night (video) - Sep 28, 2016.webm',
  'ol_b1_006':               'File:Adhan, Great Mosque of Mecca - Jan 21, 2013.webm',
  'ol_b1_007':               'File:Time of Adhan, Great Mosque of Mecca - Jan 6, 2018.webm',
};

// Special case: Internet Archive (no Wikimedia API needed)
const INTERNET_ARCHIVE_URLS: Record<string, string> = {
  'internet_archive:MiddleE1957': 'https://archive.org/download/MiddleE1957/MiddleE1957.mp4',
};

export function getInternetArchiveUrl(identifier: string): string | null {
  return INTERNET_ARCHIVE_URLS[identifier] || null;
}

export function isInternetArchiveId(fileTitle: string): boolean {
  return fileTitle.startsWith('internet_archive:');
}

// ─── CONVENIENCE: resolve by video ID ─────────────────────────────────────────
export async function resolveVideoById(videoId: string): Promise<ResolveResult> {
  const title = COMMONS_FILE_TITLES[videoId];
  if (!title) {
    return { status: 'not_found', error: `No Commons file title registered for video ID: ${videoId}` };
  }
  if (isInternetArchiveId(title)) {
    const url = getInternetArchiveUrl(title);
    if (!url) return { status: 'not_found', error: 'Internet Archive URL not registered' };
    return {
      status: 'resolved',
      info: {
        fileTitle: title,
        originalUrl: url,
        descriptionUrl: 'https://archive.org/details/MiddleE1957',
        mime: 'video/mp4',
        mediaType: 'VIDEO',
        fileSizeBytes: 0,
        width: 0,
        height: 0,
        resolvedAt: Date.now(),
        httpStatus: 200,
        isStreamable: true,
      },
    };
  }
  return resolveCommonsMedia(title);
}

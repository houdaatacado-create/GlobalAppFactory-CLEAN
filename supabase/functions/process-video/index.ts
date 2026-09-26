// Powered by OnSpace.AI
// process-video Edge Function — Cloudflare Stream ingestion pipeline v3
//
// ─── SECURITY ─────────────────────────────────────────────────────────────────
// ALL actions require a valid Supabase JWT (Authorization: Bearer <access_token>).
// Unauthorized requests receive 401/403. No public/anon access.
//
// ─── ACTIONS ──────────────────────────────────────────────────────────────────
// POST /process-video                          { video_id }  → import to Cloudflare
// POST /process-video?action=poll             { video_id }  → poll one video
// POST /process-video?action=poll_all         {}            → poll ALL transcoding/downloading
// POST /process-video?action=validate_hls     { video_id }  → validate HLS + publish
// POST /process-video?action=list             {}            → list all pipeline records
// POST /process-video?action=check_admin      {}            → verify caller is admin
// POST /process-video?action=retry_failures   {}            → retry source-resolution failures

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS } from '../_shared/cors.ts';

// ─── Response helpers ─────────────────────────────────────────────────────────

function okResp(data: object) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function errResp(msg: string, status = 400, details?: string) {
  return new Response(JSON.stringify({ success: false, error: msg, details: details ?? null }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// ─── Cloudflare thumbnail URL ─────────────────────────────────────────────────
// Uses the standard Cloudflare Stream thumbnail endpoint.
// time=15% picks a frame 15% into the video, avoiding black opening frames.

function buildCFThumbUrl(uid: string, sub: string): string {
  const base = sub
    ? `https://${sub}.cloudflarestream.com/${uid}`
    : `https://cloudflarestream.com/${uid}`;
  return `${base}/thumbnails/thumbnail.jpg?time=15%&height=400`;
}

function buildHlsUrl(uid: string, sub: string): string {
  if (sub) return `https://${sub}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
  return `https://cloudflarestream.com/${uid}/manifest/video.m3u8`;
}

// ─── JWT verification + admin check ──────────────────────────────────────────

async function verifyAdmin(
  req: Request,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<{ user: { id: string; email?: string } | null; error: Response | null }> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '').trim();
  if (!token) {
    return { user: null, error: errResp('Authentication required — missing Authorization header', 401) };
  }

  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);
  if (userError || !user) {
    return { user: null, error: errResp('Invalid or expired token', 401) };
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError) {
    console.error('[process-video] Admin check error:', adminError.message);
    return { user: null, error: errResp('Admin verification failed', 500) };
  }
  if (!adminRow) {
    return { user: null, error: errResp('Forbidden — not an admin', 403) };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}

// ─── Wikimedia Commons resolver ───────────────────────────────────────────────
//
// Multi-strategy approach:
//   1. Exact title via imageinfo API
//   2. Normalized variants (punctuation, spacing, dashes)
//   3. URL-decoded variant (handles %27, %e2%80%99 in titles)
//   4. MediaWiki opensearch fallback
//   5. Returns { url, canonicalTitle } or null

interface ResolvedMedia {
  url: string;
  canonicalTitle: string;
  mime: string;
  size?: number;
}

/** Normalize a filename for robust matching */
function normalizeTitle(title: string): string {
  return title
    .replace(/^File:/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")     // smart quotes → straight
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, '-')     // en/em dash → hyphen
    .trim();
}

/** Build title variants to attempt */
function buildTitleVariants(fileTitle: string): string[] {
  const raw = fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`;
  const norm = normalizeTitle(raw);
  const variants = new Set<string>();

  // Original as-is
  variants.add(raw);

  // Normalized (underscores → spaces)
  variants.add(`File:${norm}`);

  // Spacing around hyphens
  const withSpacedDash = `File:${norm}`.replace(/([^ ])-/g, '$1 -').replace(/-([^ ])/g, '- $1');
  const withNoSpaceDash = `File:${norm}`.replace(/ - /g, '-');
  const withSpaceBefore = `File:${norm}`.replace(/ - /g, '- ');
  const withSpaceAfter  = `File:${norm}`.replace(/ - /g, ' -');
  variants.add(withSpacedDash);
  variants.add(withNoSpaceDash);
  variants.add(withSpaceBefore);
  variants.add(withSpaceAfter);

  // URL-decoded version (handles %27 → ' etc.)
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded !== raw) variants.add(decoded);
    variants.add(`File:${normalizeTitle(decoded)}`);
  } catch { /* ignore */ }

  // Drop trailing extension and re-add as .webm / .ogv / .ogg
  const stem = norm.replace(/\.(webm|ogv|ogg|mp4|avi|mov)$/i, '');
  if (stem !== norm) {
    variants.add(`File:${stem}.webm`);
    variants.add(`File:${stem}.ogv`);
    variants.add(`File:${stem}.ogg`);
  }

  return [...variants].filter(Boolean);
}

/** Query Wikimedia Commons imageinfo for a specific title */
async function queryCommonsImageinfo(title: string): Promise<ResolvedMedia | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'imageinfo',
    titles: title,
    iiprop: 'url|mime|size|canonicaltitle',
    redirects: '1',
  });

  try {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
    const r = await fetch(apiUrl, {
      headers: { Accept: 'application/json', 'User-Agent': 'NoorIslamicApp/3.0 (admin pipeline; https://noorislamicapp.com)' },
    });
    if (!r.ok) return null;

    const d = await r.json();
    const pages = d?.query?.pages || {};
    const pageKey = Object.keys(pages)[0];

    if (!pageKey || pageKey === '-1') return null;

    const page = pages[pageKey];
    const info = page?.imageinfo?.[0];
    if (!info?.url) return null;

    // Must be a video file
    const mime: string = info.mime || '';
    if (!mime.startsWith('video/') && !mime.startsWith('application/ogg')) {
      console.warn(`[process-video] Commons: non-video MIME "${mime}" for "${title}"`);
      return null;
    }

    return {
      url: info.url,
      canonicalTitle: page.title || title,
      mime,
      size: info.size,
    };
  } catch (e: any) {
    console.error(`[process-video] Commons imageinfo exception: ${e?.message}`);
    return null;
  }
}

/** MediaWiki opensearch in the File namespace */
async function searchCommonsTitle(stem: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'opensearch',
    format: 'json',
    origin: '*',
    namespace: '6',
    search: stem,
    limit: '8',
    redirects: 'resolve',
  });

  try {
    const r = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
      { headers: { Accept: 'application/json', 'User-Agent': 'NoorIslamicApp/3.0' } }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const titles: string[] = d?.[1] || [];

    // Prefer video-extension titles
    const videoTitle = titles.find(t =>
      /\.(webm|ogv|ogg|mp4)$/i.test(t)
    );
    return videoTitle || titles[0] || null;
  } catch {
    return null;
  }
}

/** Full Commons resolver with fallback chain */
async function resolveCommonsUrl(fileTitle: string): Promise<ResolvedMedia | null> {
  const variants = buildTitleVariants(fileTitle);

  for (const variant of variants) {
    console.log(`[process-video] Commons attempt: "${variant}"`);
    const result = await queryCommonsImageinfo(variant);
    if (result) {
      console.log(`[process-video] Commons resolved: "${variant}" → ${result.url}`);
      return result;
    }
  }

  // Opensearch fallback
  const stem = normalizeTitle(fileTitle)
    .replace(/\.(webm|ogv|ogg|mp4|avi)$/i, '')
    .trim();
  console.log(`[process-video] Commons opensearch: "${stem}"`);
  const searchTitle = await searchCommonsTitle(stem);
  if (searchTitle) {
    const result = await queryCommonsImageinfo(searchTitle);
    if (result) {
      console.log(`[process-video] Commons opensearch hit: "${searchTitle}" → ${result.url}`);
      return result;
    }
  }

  console.error(`[process-video] Commons: all variants failed for "${fileTitle}"`);
  return null;
}

// ─── Archive.org resolver ─────────────────────────────────────────────────────

async function resolveArchiveUrl(sourceUrl: string, archiveId?: string): Promise<string | null> {
  if (sourceUrl.includes('archive.org/download/')) return sourceUrl;

  const detailsMatch = sourceUrl.match(/archive\.org\/details\/([^/?#]+)/);
  const itemId = detailsMatch?.[1] || archiveId;
  if (!itemId) return null;

  try {
    const metaUrl = `https://archive.org/metadata/${itemId}`;
    const r = await fetch(metaUrl, { headers: { Accept: 'application/json' } });
    if (!r.ok) return `https://archive.org/download/${itemId}/${itemId}.mp4`;

    const meta = await r.json();
    const files: Array<{ name: string; format: string }> = meta.files || [];

    const priority = ['h.264', 'mpeg4', '512kb mpeg4', 'ogv - 512kb', 'webm'];
    for (const prio of priority) {
      const match = files.find(f => (f.format || '').toLowerCase().includes(prio) && f.name);
      if (match) return `https://archive.org/download/${itemId}/${match.name}`;
    }

    const anyVideo = files.find(f => {
      const n = f.name?.toLowerCase() || '';
      return n.endsWith('.mp4') || n.endsWith('.ogv') || n.endsWith('.webm');
    });
    if (anyVideo) return `https://archive.org/download/${itemId}/${anyVideo.name}`;

    return null;
  } catch (e: any) {
    console.error(`[process-video] Archive.org: ${e?.message}`);
    return null;
  }
}

// ─── URL validator — must be a real downloadable video ───────────────────────
// Follows redirects and checks Content-Type before sending to Cloudflare.
// Cloudflare error 10005 typically means an HTML page was submitted.

interface UrlValidation {
  ok: boolean;
  finalUrl: string;
  contentType: string;
  contentLength?: number;
  error?: string;
}

async function validateMediaUrl(url: string): Promise<UrlValidation> {
  try {
    console.log(`[process-video] Validating URL: ${url}`);

    // Encode any unencoded unicode characters in the URL path
    const safeUrl = encodeURI(decodeURIComponent(url));

    const r = await fetch(safeUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'NoorIslamicApp/3.0 (media validator)' },
    });

    const ct = r.headers.get('content-type') || '';
    const cl = r.headers.get('content-length');
    const finalUrl = r.url || safeUrl;

    if (!r.ok) {
      return { ok: false, finalUrl, contentType: ct, error: `HTTP ${r.status}` };
    }

    // Wikimedia sometimes returns HTML for non-existent files
    if (ct.includes('text/html')) {
      return { ok: false, finalUrl, contentType: ct, error: 'URL returned HTML page, not a video file' };
    }

    const isVideo = ct.startsWith('video/') ||
      ct.includes('ogg') ||
      ct.includes('webm') ||
      ct.includes('octet-stream') || // Some CDNs use this for video
      ct.includes('mpeg');

    if (!isVideo) {
      return { ok: false, finalUrl, contentType: ct, error: `Unexpected Content-Type: ${ct}` };
    }

    return {
      ok: true,
      finalUrl,
      contentType: ct,
      contentLength: cl ? parseInt(cl) : undefined,
    };
  } catch (e: any) {
    return { ok: false, finalUrl: url, contentType: '', error: `Validation exception: ${e?.message}` };
  }
}

// ─── Main source URL resolver ─────────────────────────────────────────────────

interface SourceResolution {
  url: string | null;
  canonicalTitle?: string;
  mime?: string;
  error?: string;
}

async function getSourceUrl(rec: Record<string, any>): Promise<SourceResolution> {
  const { commons_file_title, original_source_url } = rec;

  // ── Archive.org ────────────────────────────────────────────────────────────
  if (typeof commons_file_title === 'string' && commons_file_title.startsWith('internet_archive:')) {
    const archiveId = commons_file_title.replace('internet_archive:', '').trim();
    const baseUrl = original_source_url || `https://archive.org/details/${archiveId}`;
    const url = await resolveArchiveUrl(baseUrl, archiveId);
    if (!url) return { url: null, error: `Archive.org: no video file found for item "${archiveId}"` };
    return { url };
  }

  // ── Wikimedia Commons ──────────────────────────────────────────────────────
  if (typeof commons_file_title === 'string' && commons_file_title.startsWith('File:')) {
    const resolved = await resolveCommonsUrl(commons_file_title);
    if (resolved) {
      return { url: resolved.url, canonicalTitle: resolved.canonicalTitle, mime: resolved.mime };
    }
    return { url: null, error: `Commons: could not resolve "${commons_file_title}" — all title variants failed` };
  }

  // ── Fallback: stored original_source_url ──────────────────────────────────
  if (original_source_url) {
    return { url: original_source_url };
  }

  return { url: null, error: 'No commons_file_title or original_source_url available' };
}

// ─── Poll Cloudflare Stream status ────────────────────────────────────────────

interface CFPollResult {
  state: string;
  pct?: number;
  hls?: string;
  thumb?: string;
  duration?: number;
  errMsg?: string;
  error?: string;
}

async function pollCloudflare(account: string, token: string, uid: string): Promise<CFPollResult> {
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const d = await r.json();
    if (!r.ok || !d.success) {
      return { state: 'error', error: d.errors?.[0]?.message || `HTTP ${r.status}` };
    }
    const res = d.result;
    const pctRaw = res.status?.pctComplete;
    return {
      state: res.status?.state || 'inprogress',
      pct: pctRaw != null ? parseFloat(pctRaw) : undefined,
      hls: res.playback?.hls,
      thumb: res.thumbnail,
      duration: res.duration ? Math.round(res.duration) : undefined,
      errMsg: res.status?.errorReasonCode
        ? `${res.status.errorReasonCode}: ${res.status.errorReasonText || ''}`
        : undefined,
    };
  } catch (e: any) {
    return { state: 'error', error: `Network: ${e?.message}` };
  }
}

// ─── HLS manifest validator ────────────────────────────────────────────────────

async function validateHLS(hlsUrl: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(hlsUrl, {
      headers: { 'User-Agent': 'NoorIslamicApp/3.0 HLSValidator' },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return { ok: false, error: `Manifest HTTP ${r.status}` };
    const text = await r.text();
    const hasHeader = text.includes('#EXTM3U');
    const hasContent = text.includes('#EXT-X-STREAM-INF') || text.includes('#EXTINF');
    if (!hasHeader || !hasContent) {
      return { ok: false, error: `Manifest invalid (${text.length} chars, hasHeader=${hasHeader}, hasContent=${hasContent})` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: `Manifest fetch exception: ${e?.message}` };
  }
}

// ─── Apply poll result to DB ──────────────────────────────────────────────────

async function applyPollResult(
  supabaseAdmin: ReturnType<typeof createClient>,
  videoId: string,
  rec: Record<string, any>,
  cf: CFPollResult,
  CF_SUB: string
) {
  const patch: Record<string, any> = {
    provider_status: cf.state,
    provider_percent_complete: cf.pct ?? null,
  };

  if (cf.state === 'ready') {
    const hlsUrl = cf.hls || buildHlsUrl(rec.provider_video_id, CF_SUB);
    const thumbUrl = cf.thumb || buildCFThumbUrl(rec.provider_video_id, CF_SUB);

    Object.assign(patch, {
      processing_status: 'ready',
      stream_hls_url: hlsUrl,
      poster_url: thumbUrl,
      ingested_at: new Date().toISOString(),
    });

    // Save duration if available
    if (cf.duration && cf.duration > 0) {
      patch.duration_seconds = cf.duration;
    }

    console.log(`[process-video] ${videoId} → READY | HLS: ${hlsUrl} | Thumb: ${thumbUrl}`);

    // Auto-validate and publish
    const validation = await validateHLS(hlsUrl);
    if (validation.ok) {
      Object.assign(patch, { playback_verified: true, published: true, processing_error: null });
      console.log(`[process-video] ✅ Auto-published ${videoId}`);
    } else {
      console.warn(`[process-video] ⚠️ ${videoId} HLS validation failed: ${validation.error}`);
      patch.processing_error = `HLS validation failed: ${validation.error}`;
    }
  } else if (cf.state === 'inprogress') {
    patch.processing_status = 'transcoding';
  } else if (cf.state === 'pendingupload') {
    patch.processing_status = 'downloading';
  } else if (cf.state === 'error' || cf.errMsg) {
    Object.assign(patch, {
      processing_status: 'failed',
      processing_error: cf.errMsg || cf.error || 'Cloudflare processing error',
    });
  }

  await supabaseAdmin.from('open_license_videos').update(patch).eq('id', videoId);
  return patch;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    if (req.method !== 'POST') return errResp('Method not allowed', 405);

    const CF_ACCOUNT = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const CF_TOKEN   = Deno.env.get('CLOUDFLARE_STREAM_TOKEN');
    const CF_SUB     = Deno.env.get('CLOUDFLARE_STREAM_SUBDOMAIN') || '';

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user, error: authError } = await verifyAdmin(req, supabaseAdmin);
    if (authError) return authError;
    console.log(`[process-video] Authorized: ${user?.email}`);

    const urlObj = new URL(req.url);
    const action = urlObj.searchParams.get('action') || 'import';

    let body: Record<string, any> = {};
    try { body = await req.json(); } catch { /* ok */ }

    // ── CHECK ADMIN ─────────────────────────────────────────────────────────
    if (action === 'check_admin') {
      return okResp({ is_admin: true, user_id: user?.id });
    }

    // ── LIST ─────────────────────────────────────────────────────────────────
    if (action === 'list') {
      const { data, error } = await supabaseAdmin
        .from('open_license_videos')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) return errResp(`Database error: ${error.message}`, 500);
      return okResp({ records: data || [] });
    }

    // ── POLL ALL — batch-poll every transcoding/downloading record ────────────
    if (action === 'poll_all') {
      if (!CF_ACCOUNT || !CF_TOKEN) {
        return errResp('Missing Cloudflare secrets', 500);
      }

      const { data: inProgress } = await supabaseAdmin
        .from('open_license_videos')
        .select('*')
        .in('processing_status', ['transcoding', 'downloading'])
        .not('provider_video_id', 'is', null);

      const records = inProgress || [];
      console.log(`[process-video] poll_all: ${records.length} records to poll`);

      const results: Record<string, string> = {};
      let ready = 0, still_processing = 0, failed = 0;

      for (const rec of records) {
        try {
          const cf = await pollCloudflare(CF_ACCOUNT, CF_TOKEN, rec.provider_video_id);
          const patch = await applyPollResult(supabaseAdmin, rec.id, rec, cf, CF_SUB);
          const newStatus = patch.processing_status || rec.processing_status;
          results[rec.id] = newStatus;
          if (newStatus === 'ready') ready++;
          else if (newStatus === 'failed') failed++;
          else still_processing++;
        } catch (e: any) {
          results[rec.id] = 'poll_error';
          console.error(`[process-video] poll_all error for ${rec.id}: ${e?.message}`);
          failed++;
        }
        // Small delay to avoid hammering Cloudflare
        await new Promise(r => setTimeout(r, 300));
      }

      return okResp({
        polled: records.length,
        ready,
        still_processing,
        failed,
        results,
      });
    }

    // ── RETRY FAILURES — retry source-resolution and import failures ──────────
    if (action === 'retry_failures') {
      if (!CF_ACCOUNT || !CF_TOKEN) {
        return errResp('Missing Cloudflare secrets', 500);
      }

      // Find failed videos that have no CF uid yet (source resolution failure)
      // or where the error mentions source/URL/Commons
      const { data: failed } = await supabaseAdmin
        .from('open_license_videos')
        .select('*')
        .eq('processing_status', 'failed')
        .is('provider_video_id', null); // No CF uid = source failed before Cloudflare

      const toRetry = (failed || []);
      console.log(`[process-video] retry_failures: ${toRetry.length} eligible records`);

      // Reset them to approved_for_ingestion so batch import picks them up
      if (toRetry.length > 0) {
        const ids = toRetry.map((r: any) => r.id);
        await supabaseAdmin
          .from('open_license_videos')
          .update({ processing_status: 'approved_for_ingestion', processing_error: null })
          .in('id', ids);
      }

      return okResp({
        reset_count: toRetry.length,
        ids: toRetry.map((r: any) => r.id),
        message: `${toRetry.length} failed records reset to approved_for_ingestion. Run Import All to retry.`,
      });
    }

    // ── VALIDATE HLS ──────────────────────────────────────────────────────────
    if (action === 'validate_hls') {
      const { video_id } = body;
      if (!video_id) return errResp('video_id is required');

      const { data: vrec, error: vfetchErr } = await supabaseAdmin
        .from('open_license_videos')
        .select('*')
        .eq('id', video_id)
        .single();

      if (vfetchErr || !vrec) return errResp(`Video not found: ${video_id}`, 404);
      if (vrec.processing_status !== 'ready') {
        return errResp(`Cannot validate — status is "${vrec.processing_status}", must be ready`, 409);
      }

      const hlsUrl = vrec.stream_hls_url;
      if (!hlsUrl) return errResp('stream_hls_url missing — run import+poll first', 400);

      const validation = await validateHLS(hlsUrl);

      // Ensure poster_url is set — derive from CF uid if missing
      let posterUrl = vrec.poster_url;
      if (!posterUrl && vrec.provider_video_id) {
        posterUrl = buildCFThumbUrl(vrec.provider_video_id, CF_SUB);
      }

      if (!validation.ok) {
        await supabaseAdmin.from('open_license_videos').update({
          playback_verified: false,
          processing_error: `HLS validation failed: ${validation.error}`,
          ...(posterUrl ? { poster_url: posterUrl } : {}),
        }).eq('id', video_id);
        return errResp('HLS validation failed', 422, validation.error);
      }

      await supabaseAdmin.from('open_license_videos').update({
        playback_verified: true,
        published: true,
        processing_error: null,
        ...(posterUrl ? { poster_url: posterUrl } : {}),
      }).eq('id', video_id);

      console.log(`[process-video] ✅ Manually validated + published: ${video_id}`);
      return okResp({
        video_id,
        playback_verified: true,
        published: true,
        stream_hls_url: hlsUrl,
        poster_url: posterUrl,
        message: 'HLS manifest valid. Video published.',
      });
    }

    // ── IMPORT / POLL require Cloudflare secrets ──────────────────────────────
    if (!CF_ACCOUNT || !CF_TOKEN) {
      return errResp('Missing Cloudflare secrets', 500,
        'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_TOKEN must be set');
    }

    const { video_id } = body;
    if (!video_id) return errResp('video_id is required');

    const { data: rec, error: fetchErr } = await supabaseAdmin
      .from('open_license_videos')
      .select('*')
      .eq('id', video_id)
      .single();

    if (fetchErr || !rec) return errResp(`Video not found: ${video_id}`, 404, fetchErr?.message);

    // ── POLL ──────────────────────────────────────────────────────────────────
    if (action === 'poll') {
      if (!rec.provider_video_id) return errResp('No provider_video_id — run import first', 400);

      console.log(`[process-video] Polling CF for ${video_id} (UID: ${rec.provider_video_id})`);
      const cf = await pollCloudflare(CF_ACCOUNT, CF_TOKEN, rec.provider_video_id);

      if (cf.error && cf.state === 'error') {
        await supabaseAdmin.from('open_license_videos').update({
          processing_status: 'failed',
          processing_error: `Cloudflare poll error: ${cf.error}`,
        }).eq('id', video_id);
        return errResp(`Cloudflare poll error: ${cf.error}`, 502);
      }

      const patch = await applyPollResult(supabaseAdmin, video_id, rec, cf, CF_SUB);

      return okResp({
        video_id,
        cloudflare_state: cf.state,
        percent_complete: cf.pct ?? null,
        processing_status: patch.processing_status || rec.processing_status,
        stream_hls_url: patch.stream_hls_url || rec.stream_hls_url || null,
        poster_url: patch.poster_url || rec.poster_url || null,
        published: patch.published || rec.published || false,
      });
    }

    // ── IMPORT ────────────────────────────────────────────────────────────────
    if (!rec.commercial_use_allowed) {
      return errResp('commercial_use_allowed must be true before importing', 400);
    }

    const allowedStatuses = ['approved_for_ingestion', 'failed'];
    if (!allowedStatuses.includes(rec.processing_status)) {
      return errResp(
        `Cannot import — status is "${rec.processing_status}"`, 409,
        'Must be approved_for_ingestion or failed to import'
      );
    }

    // ── Resolve source URL ────────────────────────────────────────────────────
    console.log(`[process-video] Resolving source: ${rec.commons_file_title} | stored: ${rec.original_source_url}`);

    const resolution = await getSourceUrl(rec);

    if (!resolution.url) {
      const errDetail = `commons_file_title="${rec.commons_file_title}", stored_url="${rec.original_source_url}" | ${resolution.error || ''}`;
      await supabaseAdmin.from('open_license_videos').update({
        processing_status: 'failed',
        processing_error: `Source resolution failed: ${resolution.error || 'unknown'}`,
      }).eq('id', video_id);
      return errResp('Cannot resolve source media URL', 422, errDetail);
    }

    // Persist resolved URL and canonical title if we got them
    const metaPatch: Record<string, any> = {};
    if (resolution.url !== rec.original_source_url) {
      metaPatch.original_source_url = resolution.url;
    }
    if (resolution.canonicalTitle && resolution.canonicalTitle !== rec.commons_file_title) {
      metaPatch.commons_file_title = resolution.canonicalTitle;
      console.log(`[process-video] Canonical title updated: "${rec.commons_file_title}" → "${resolution.canonicalTitle}"`);
    }
    if (Object.keys(metaPatch).length > 0) {
      await supabaseAdmin.from('open_license_videos').update(metaPatch).eq('id', video_id);
    }

    // ── Validate source URL before submitting to Cloudflare ──────────────────
    const validation = await validateMediaUrl(resolution.url);
    if (!validation.ok) {
      const errDetail = `URL="${resolution.url}" | ${validation.error} | Content-Type="${validation.contentType}"`;
      console.error(`[process-video] URL validation failed for ${video_id}: ${errDetail}`);
      await supabaseAdmin.from('open_license_videos').update({
        processing_status: 'failed',
        processing_error: `URL validation failed: ${validation.error}`,
      }).eq('id', video_id);
      return errResp(`Invalid source URL: ${validation.error}`, 422, errDetail);
    }

    // Use the final URL after redirect following
    const finalSourceUrl = validation.finalUrl || resolution.url;
    console.log(`[process-video] Validated URL: ${finalSourceUrl} (${validation.contentType}, ${validation.contentLength ? Math.round(validation.contentLength / 1024 / 1024) + 'MB' : 'size unknown'})`);

    // ── Mark as downloading ───────────────────────────────────────────────────
    await supabaseAdmin.from('open_license_videos').update({
      processing_status: 'downloading',
      processing_error: null,
    }).eq('id', video_id);

    // ── Submit to Cloudflare Stream /copy ─────────────────────────────────────
    console.log(`[process-video] Submitting to Cloudflare Stream: ${finalSourceUrl}`);
    const cfResp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/stream/copy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: finalSourceUrl,
          meta: {
            name: rec.commons_file_title || video_id,
            source: 'Wikimedia Commons / Internet Archive',
            license: rec.license || '',
            attribution: rec.attribution_text || '',
            noor_video_id: video_id,
          },
          requireSignedURLs: false,
          thumbnailTimestampPct: 0.15,  // 15% into video for thumbnail
        }),
      }
    );

    const cfText = await cfResp.text();
    let cfData: any;
    try {
      cfData = JSON.parse(cfText);
    } catch {
      console.error(`[process-video] CF non-JSON (${cfResp.status}): ${cfText.substring(0, 300)}`);
      await supabaseAdmin.from('open_license_videos').update({
        processing_status: 'failed',
        processing_error: `Cloudflare non-JSON response (HTTP ${cfResp.status})`,
      }).eq('id', video_id);
      return errResp('Cloudflare unexpected response', 502, `HTTP ${cfResp.status}: ${cfText.substring(0, 200)}`);
    }

    if (!cfResp.ok || !cfData.success) {
      const cfErrors = cfData.errors || [];
      const cfErr = cfErrors.map((e: any) => `[${e.code}] ${e.message}`).join('; ') || `HTTP ${cfResp.status}`;
      const hasError10005 = cfErrors.some((e: any) => e.code === 10005);
      const detail = [
        `source_url="${finalSourceUrl}"`,
        `http_status=${cfResp.status}`,
        `content_type="${validation.contentType}"`,
        `content_length=${validation.contentLength || 'unknown'}`,
        `cf_errors=${JSON.stringify(cfErrors)}`,
        hasError10005 ? 'NOTE: error 10005 = Cloudflare cannot pull the URL directly. URL may require auth or redirect improperly.' : '',
      ].filter(Boolean).join(' | ');

      console.error(`[process-video] CF import failed for ${video_id}: ${cfErr}`);
      await supabaseAdmin.from('open_license_videos').update({
        processing_status: 'failed',
        processing_error: `Cloudflare: ${cfErr}`,
      }).eq('id', video_id);
      return errResp(`Cloudflare import failed: ${cfErr}`, 502, detail);
    }

    const vid = cfData.result;
    const uid = vid.uid;
    const hlsUrl = vid.playback?.hls || buildHlsUrl(uid, CF_SUB);
    const thumbUrl = vid.thumbnail || buildCFThumbUrl(uid, CF_SUB);

    console.log(`[process-video] CF UID: ${uid} | state: ${vid.status?.state} | thumb: ${thumbUrl}`);

    await supabaseAdmin.from('open_license_videos').update({
      video_provider: 'cloudflare_stream',
      provider_video_id: uid,
      provider_status: vid.status?.state || 'inprogress',
      provider_percent_complete: vid.status?.pctComplete ? parseFloat(vid.status.pctComplete) : 0,
      stream_hls_url: hlsUrl,
      poster_url: thumbUrl,
      processing_status: 'transcoding',
      processing_error: null,
    }).eq('id', video_id);

    return okResp({
      video_id,
      provider_video_id: uid,
      cloudflare_state: vid.status?.state || 'inprogress',
      stream_hls_url: hlsUrl,
      poster_url: thumbUrl,
      source_url_used: finalSourceUrl,
      message: 'Import started. Use action=poll or action=poll_all to track progress.',
    });

  } catch (topLevelError: any) {
    console.error('[process-video] Unhandled exception:', topLevelError?.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: topLevelError?.message || 'Unknown error',
      }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});

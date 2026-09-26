// Powered by OnSpace.AI
// process-video Edge Function — READY TO DEPLOY
//
// ─── HOW TO DEPLOY ───────────────────────────────────────────────────────────
//
// This file contains the complete Edge Function code.
// Copy the contents from the EDGE FUNCTION CODE section below
// and deploy it via:
//
// Option A — Supabase Dashboard (recommended):
//   1. Go to https://supabase.com/dashboard/project/<your-project>/functions
//   2. Click "Create a new function"
//   3. Name it exactly: process-video
//   4. Paste the code from below
//   5. Click Deploy
//
// Option B — Supabase CLI:
//   supabase functions deploy process-video --project-ref <ref>
//
// ─── SECRETS TO ADD ──────────────────────────────────────────────────────────
//
// After deploying, add these secrets in:
// Supabase Dashboard → Project Settings → Edge Functions → Secrets
//
//   CLOUDFLARE_ACCOUNT_ID
//     Your Cloudflare account ID (shown in right sidebar of Cloudflare dashboard)
//
//   CLOUDFLARE_STREAM_TOKEN
//     A Cloudflare API token with "Stream: Edit" permission ONLY
//     Create at: Cloudflare Dashboard → My Profile → API Tokens → Create Token
//     Select template: "Edit Cloudflare Stream videos"
//
//   CLOUDFLARE_STREAM_SUBDOMAIN (optional)
//     Your Cloudflare Stream customer subdomain (e.g. "customer-xyz123")
//     Found in Cloudflare Stream dashboard → Embed section
//     Leave blank if you don't know it — the default URL format will be used
//
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Do NOT add Cloudflare credentials anywhere in app source code.
// They must ONLY be stored as Supabase Edge Function secrets.
// ─────────────────────────────────────────────────────────────────────────────

export const EDGE_FUNCTION_CODE = `
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return errResp('Method not allowed', 405);

  const CF_ACCOUNT = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const CF_TOKEN   = Deno.env.get('CLOUDFLARE_STREAM_TOKEN');
  const CF_SUB     = Deno.env.get('CLOUDFLARE_STREAM_SUBDOMAIN') || '';

  if (!CF_ACCOUNT || !CF_TOKEN) {
    return errResp('Missing secrets: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_TOKEN', 500);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const urlObj = new URL(req.url);
  const action = urlObj.searchParams.get('action') || 'import';

  let body;
  try { body = await req.json(); } catch { return errResp('Invalid JSON'); }
  const { video_id } = body;
  if (!video_id) return errResp('video_id required');

  const { data: rec } = await supabase.from('open_license_videos').select('*').eq('id', video_id).single();
  if (!rec) return errResp('Video not found: ' + video_id);

  // POLL
  if (action === 'poll') {
    if (!rec.provider_video_id) return errResp('No provider_video_id — import first');
    const cf = await pollCF(CF_ACCOUNT, CF_TOKEN, rec.provider_video_id);
    if (cf.error) {
      await supabase.from('open_license_videos').update({ processing_status: 'failed', processing_error: cf.error }).eq('id', video_id);
      return errResp(cf.error);
    }
    const patch = { provider_status: cf.state, provider_percent_complete: cf.pct ?? null };
    if (cf.state === 'ready') {
      Object.assign(patch, {
        processing_status: 'ready',
        stream_hls_url: cf.hls || buildHls(rec.provider_video_id, CF_SUB),
        thumbnail_url: cf.thumb,
        ingested_at: new Date().toISOString(),
      });
    } else if (cf.state === 'inprogress') {
      patch.processing_status = 'transcoding';
    } else if (cf.state === 'error') {
      Object.assign(patch, { processing_status: 'failed', processing_error: cf.errMsg || 'CF error' });
    }
    await supabase.from('open_license_videos').update(patch).eq('id', video_id);
    return okResp({ video_id, cloudflare_state: cf.state, ...patch });
  }

  // IMPORT
  if (!rec.commercial_use_allowed) return errResp('commercial_use_allowed must be true');
  if (!['approved_for_ingestion','failed'].includes(rec.processing_status)) {
    return errResp('Status must be approved_for_ingestion or failed, got: ' + rec.processing_status);
  }

  const srcUrl = await getSourceUrl(rec);
  if (!srcUrl) {
    await supabase.from('open_license_videos').update({ processing_status: 'failed', processing_error: 'Cannot resolve source URL' }).eq('id', video_id);
    return errResp('Cannot resolve source URL');
  }

  await supabase.from('open_license_videos').update({ processing_status: 'downloading', processing_error: null }).eq('id', video_id);

  const cfResp = await fetch(
    \`https://api.cloudflare.com/client/v4/accounts/\${CF_ACCOUNT}/stream/copy\`,
    {
      method: 'POST',
      headers: { Authorization: \`Bearer \${CF_TOKEN}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: srcUrl,
        meta: { name: rec.commons_file_title || video_id, source: 'Wikimedia Commons', license: rec.license, attribution: rec.attribution_text, noor_video_id: video_id },
        requireSignedURLs: false,
      }),
    }
  );
  const cfData = await cfResp.json();
  if (!cfResp.ok || !cfData.success) {
    const msg = cfData.errors?.[0]?.message || 'HTTP ' + cfResp.status;
    await supabase.from('open_license_videos').update({ processing_status: 'failed', processing_error: 'CF: ' + msg }).eq('id', video_id);
    return errResp('Cloudflare import failed: ' + msg);
  }

  const vid = cfData.result;
  const uid = vid.uid;
  const hls = vid.playback?.hls || buildHls(uid, CF_SUB);

  await supabase.from('open_license_videos').update({
    video_provider: 'cloudflare_stream', provider_video_id: uid,
    provider_status: vid.status?.state || 'inprogress',
    provider_percent_complete: vid.status?.pctComplete ? parseFloat(vid.status.pctComplete) : 0,
    stream_hls_url: hls, thumbnail_url: vid.thumbnail || null,
    processing_status: 'transcoding', processing_error: null,
  }).eq('id', video_id);

  return okResp({ video_id, provider_video_id: uid, cloudflare_state: vid.status?.state, stream_hls_url: hls, source_url_used: srcUrl, message: 'Import started. Poll ?action=poll to check status.' });
});

function buildHls(uid, sub) {
  if (sub) return \`https://\${sub}.cloudflarestream.com/\${uid}/manifest/video.m3u8\`;
  return \`https://cloudflarestream.com/\${uid}/manifest/video.m3u8\`;
}

async function getSourceUrl(rec) {
  if (rec.original_source_url?.startsWith('https://archive.org/download/')) return rec.original_source_url;
  if (rec.commons_file_title?.startsWith('File:')) {
    const p = new URLSearchParams({ action: 'query', format: 'json', origin: '*', prop: 'imageinfo', titles: rec.commons_file_title, iiprop: 'url|mime' });
    try {
      const r = await fetch(\`https://commons.wikimedia.org/w/api.php?\${p}\`, { headers: { Accept: 'application/json' } });
      const d = await r.json();
      const pages = d?.query?.pages || {};
      const k = Object.keys(pages)[0];
      if (k && k !== '-1') return pages[k]?.imageinfo?.[0]?.url || null;
    } catch {}
  }
  return rec.original_source_url || null;
}

async function pollCF(account, token, uid) {
  try {
    const r = await fetch(\`https://api.cloudflare.com/client/v4/accounts/\${account}/stream/\${uid}\`, { headers: { Authorization: \`Bearer \${token}\` } });
    const d = await r.json();
    if (!r.ok || !d.success) return { state: 'error', error: d.errors?.[0]?.message || 'HTTP ' + r.status };
    const res = d.result;
    return { state: res.status?.state || 'inprogress', pct: res.status?.pctComplete ? parseFloat(res.status.pctComplete) : undefined, hls: res.playback?.hls, thumb: res.thumbnail, errMsg: res.status?.errorReasonCode ? res.status.errorReasonCode + ': ' + (res.status.errorReasonText || '') : undefined };
  } catch (e) { return { state: 'error', error: 'Network: ' + e?.message }; }
}

function okResp(data) { return new Response(JSON.stringify({ success: true, ...data }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }); }
function errResp(msg, status = 400) { return new Response(JSON.stringify({ success: false, error: msg }), { status, headers: { ...CORS, 'Content-Type': 'application/json' } }); }
`;

// ─── Database Migration (also in supabase/migrations/) ───────────────────────
export const MIGRATION_SQL = `
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.open_license_videos (
  id text primary key,
  video_provider text not null default 'cloudflare_stream',
  provider_video_id text,
  stream_hls_url text,
  fallback_mp4_url text,
  poster_url text,
  thumbnail_url text,
  provider_status text,
  provider_percent_complete numeric(5,2),
  processing_status text not null default 'rights_review',
  processing_error text,
  original_source_url text,
  commons_page_url text,
  commons_file_title text,
  creator text,
  license text,
  license_url text,
  attribution_text text,
  commercial_use_allowed boolean not null default false,
  modification_allowed boolean not null default false,
  device_tested boolean not null default false,
  tested_on text,
  tested_at timestamptz,
  duration_seconds integer,
  original_mime text,
  original_size_bytes bigint,
  available_qualities text[],
  ingested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.open_license_videos enable row level security;

create policy "Public read ready videos" on public.open_license_videos
  for select using (processing_status = 'ready');

create policy "Service role full access" on public.open_license_videos
  for all using (auth.role() = 'service_role');

-- Auto updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists open_license_videos_updated_at on public.open_license_videos;
create trigger open_license_videos_updated_at
  before update on public.open_license_videos
  for each row execute function public.set_updated_at();
`;

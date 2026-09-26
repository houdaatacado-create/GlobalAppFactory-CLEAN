// Powered by OnSpace.AI
// Pipeline Admin Screen v3 — Video Ingestion Dashboard
//
// Security: JWT auth + admin_users table via Edge Function proxy.
// All pipeline reads/writes go through the Edge Function.

import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, Platform, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import {
  ProcessingStatus, VideoCDNRecord, PROCESSING_STATUS_CONFIG,
  fetchPipelineQueue, invalidateCache,
} from '../services/videoPipelineService';
import { AdminAuthContext } from '../contexts/AdminAuthContext';

// ─── Edge Function caller ─────────────────────────────────────────────────────

async function callEdge(
  action: string,
  body: Record<string, any>,
  accessToken: string
) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl || !accessToken) throw new Error('Not configured');

  const url = action === 'import' || action === 'poll' || action === 'validate_hls'
    ? `${supabaseUrl}/functions/v1/process-video${action !== 'import' ? `?action=${action}` : ''}`
    : `${supabaseUrl}/functions/v1/process-video?action=${action}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  const raw = await resp.text();
  let data: any;
  try { data = JSON.parse(raw); } catch {
    throw new Error(`Non-JSON response (HTTP ${resp.status}): ${raw.substring(0, 200)}`);
  }
  if (!resp.ok || !data.success) {
    const detail = data.details ? `\n${data.details}` : '';
    throw new Error((data.error || `HTTP ${resp.status}`) + detail);
  }
  return data;
}

// ─── Failure reason classifier ────────────────────────────────────────────────

function classifyFailure(error: string | undefined): string {
  if (!error) return 'Unknown';
  const e = error.toLowerCase();
  if (e.includes('source resolution') || e.includes('cannot resolve') || e.includes('all variants failed')) return 'Source Not Found';
  if (e.includes('ambiguous') || e.includes('source_review')) return 'Ambiguous Commons Result';
  if (e.includes('html page') || e.includes('content-type') || e.includes('url validation')) return 'Invalid Media URL';
  if (e.includes('10005') || e.includes('bad request')) return 'Cloudflare 10005';
  if (e.includes('hls validation') || e.includes('manifest')) return 'HLS Validation Failure';
  if (e.includes('unsupported') || e.includes('codec')) return 'Unsupported Media';
  if (e.includes('network') || e.includes('timeout')) return 'Network / Timeout';
  return 'Other';
}

// ─── Sign-In Form ─────────────────────────────────────────────────────────────

function SignInForm() {
  const auth = useContext(AdminAuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setLoading(true); setError('');
    const { error: e } = await auth.signIn(email.trim(), password);
    if (e) setError(e);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={s.signInWrap} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.signInCard}>
        <MaterialIcons name="admin-panel-settings" size={40} color={Colors.gold} />
        <Text style={s.signInTitle}>Pipeline Admin</Text>
        <Text style={s.signInSub}>Sign in with your admin account to access the video ingestion pipeline.</Text>
        {error ? (
          <View style={s.signInError}>
            <MaterialIcons name="error-outline" size={14} color={Colors.error} />
            <Text style={s.signInErrorText}>{error}</Text>
          </View>
        ) : null}
        <TextInput style={s.signInInput} placeholder="Admin email" placeholderTextColor={Colors.textMuted}
          value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!loading} />
        <TextInput style={s.signInInput} placeholder="Password" placeholderTextColor={Colors.textMuted}
          value={password} onChangeText={setPassword} secureTextEntry editable={!loading} onSubmitEditing={handleSignIn} />
        <Pressable style={[s.signInBtn, loading && { opacity: 0.6 }]} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={Colors.textInverse} /> : <Text style={s.signInBtnText}>Sign In</Text>}
        </Pressable>
        <Pressable style={s.signInBackBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={14} color={Colors.textMuted} />
          <Text style={s.signInBackText}>Back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProcessingStatus }) {
  const config = PROCESSING_STATUS_CONFIG[status] || PROCESSING_STATUS_CONFIG.rights_review;
  return (
    <View style={[s.badge, { backgroundColor: config.color + '22', borderColor: config.color + '55' }]}>
      <Text style={[s.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

// ─── Video Row ────────────────────────────────────────────────────────────────

function VideoRow({ record, onImport, onPoll, isLoading }: {
  record: VideoCDNRecord;
  onImport: () => void;
  onPoll: () => void;
  isLoading: boolean;
}) {
  const config = PROCESSING_STATUS_CONFIG[record.processing_status] || PROCESSING_STATUS_CONFIG.rights_review;
  const canImport = ['approved_for_ingestion', 'failed'].includes(record.processing_status);
  const canPoll = !!record.provider_video_id && ['transcoding', 'downloading'].includes(record.processing_status);
  const isReady = record.processing_status === 'ready';
  const isPublished = (record as any).published === true;
  const posterUrl = (record as any).poster_url ||
    (record.provider_video_id ? `https://cloudflarestream.com/${record.provider_video_id}/thumbnails/thumbnail.jpg?time=15%&height=80` : null);

  return (
    <View style={s.row}>
      <View style={[s.rowIndicator, { backgroundColor: config.color }]} />
      {posterUrl ? (
        <View style={s.rowThumb}>
          {/* Using Image from react-native since expo-image import would be heavy */}
          <View style={[s.rowThumbInner, { backgroundColor: config.color + '22' }]}>
            <MaterialIcons name="image" size={16} color={config.color} />
          </View>
        </View>
      ) : null}
      <View style={s.rowBody}>
        <View style={s.rowHeader}>
          <Text style={s.rowId} numberOfLines={1}>{record.id}</Text>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {isPublished && (
              <View style={[s.badge, { backgroundColor: Colors.gold + '22', borderColor: Colors.gold + '55' }]}>
                <Text style={[s.badgeText, { color: Colors.gold }]}>✓ Live</Text>
              </View>
            )}
            <StatusBadge status={record.processing_status} />
          </View>
        </View>
        {record.commons_file_title ? (
          <Text style={s.rowSub} numberOfLines={1}>📎 {record.commons_file_title}</Text>
        ) : null}
        {record.provider_video_id ? (
          <Text style={s.rowSub} numberOfLines={1}>☁ CF: {record.provider_video_id.substring(0, 18)}…</Text>
        ) : null}
        {isReady && record.stream_hls_url ? (
          <Text style={[s.rowSub, { color: Colors.success }]} numberOfLines={1}>
            ▶ {record.stream_hls_url.replace('https://', '').substring(0, 50)}…
          </Text>
        ) : null}
        {record.provider_percent_complete != null && record.provider_percent_complete > 0 && !isReady && (
          <View style={s.progressWrap}>
            <View style={[s.progressBar, {
              width: `${Math.min(record.provider_percent_complete, 100)}%` as any,
              backgroundColor: config.color,
            }]} />
            <Text style={s.progressText}>{Math.round(record.provider_percent_complete)}%</Text>
          </View>
        )}
        {record.processing_error ? (
          <Text style={s.rowError} numberOfLines={2}>{record.processing_error}</Text>
        ) : null}
        <View style={s.rowActions}>
          {canImport && (
            <Pressable style={[s.actionBtn, s.importBtn, isLoading && s.btnDisabled]}
              onPress={isLoading ? undefined : onImport} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="upload" size={13} color="#fff" />}
              <Text style={s.actionBtnText}>Import</Text>
            </Pressable>
          )}
          {canPoll && (
            <Pressable style={[s.actionBtn, s.pollBtn, isLoading && s.btnDisabled]}
              onPress={isLoading ? undefined : onPoll} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="refresh" size={13} color="#fff" />}
              <Text style={s.actionBtnText}>Poll</Text>
            </Pressable>
          )}
          {isReady && !isPublished && (
            <View style={[s.actionBtn, { backgroundColor: '#F59E0B22' }]}>
              <MaterialIcons name="pending" size={13} color="#F59E0B" />
              <Text style={[s.actionBtnText, { color: '#F59E0B' }]}>Awaiting Validation</Text>
            </View>
          )}
          {isReady && isPublished && (
            <View style={[s.actionBtn, { backgroundColor: Colors.success + '22' }]}>
              <MaterialIcons name="verified" size={13} color={Colors.success} />
              <Text style={[s.actionBtnText, { color: Colors.success }]}>Published ✓</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Failure Summary Panel ────────────────────────────────────────────────────

function FailureSummary({ records }: { records: VideoCDNRecord[] }) {
  const failed = records.filter(r => r.processing_status === 'failed');
  if (!failed.length) return null;

  const groups: Record<string, number> = {};
  for (const r of failed) {
    const cat = classifyFailure(r.processing_error);
    groups[cat] = (groups[cat] || 0) + 1;
  }

  return (
    <View style={[s.batchCard, { marginTop: 4, borderColor: Colors.error + '44' }]}>
      <Text style={[s.batchTitle, { color: Colors.error }]}>Failure Breakdown ({failed.length} total)</Text>
      <View style={{ marginTop: 8, gap: 4 }}>
        {Object.entries(groups).map(([cat, count]) => (
          <View key={cat} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{cat}</Text>
            <View style={[s.badge, { backgroundColor: Colors.error + '22', borderColor: Colors.error + '44' }]}>
              <Text style={[s.badgeText, { color: Colors.error }]}>{count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function PipelineDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useContext(AdminAuthContext)!;
  const { accessToken, user, signOut } = auth;

  const [records, setRecords] = useState<VideoCDNRecord[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [globalMessage, setGlobalMessage] = useState('');
  const [autoPollActive, setAutoPollActive] = useState(false);
  const [autoPollCountdown, setAutoPollCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState<'queue' | 'failures'>('queue');
  const autoPollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const AUTO_POLL_INTERVAL = 30;

  // Batch import state
  const [batchActive, setBatchActive] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, done: 0, failed: 0 });
  const [batchLog, setBatchLog] = useState<string[]>([]);
  const batchAbortRef = useRef(false);

  // Poll All state
  const [pollAllActive, setPollAllActive] = useState(false);
  const [pollAllLog, setPollAllLog] = useState<string[]>([]);

  // Retry Failures state
  const [retryActive, setRetryActive] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!accessToken) return [];
    setIsRefreshing(true);
    try {
      const data = await fetchPipelineQueue(accessToken);
      setRecords(data);
      setLastRefresh(new Date());
      return data;
    } catch (err: any) {
      setGlobalMessage(`Load error: ${err?.message}`);
      return [];
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken]);

  const stopAutoPoll = useCallback(() => {
    if (autoPollTimer.current) { clearInterval(autoPollTimer.current); autoPollTimer.current = null; }
    if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
    setAutoPollActive(false);
    setAutoPollCountdown(0);
  }, []);

  const startAutoPoll = useCallback(() => {
    if (!accessToken) return;
    stopAutoPoll();
    setAutoPollActive(true);
    setAutoPollCountdown(AUTO_POLL_INTERVAL);

    countdownTimer.current = setInterval(() => {
      setAutoPollCountdown(prev => prev <= 1 ? AUTO_POLL_INTERVAL : prev - 1);
    }, 1000);

    autoPollTimer.current = setInterval(async () => {
      if (!accessToken) return;
      invalidateCache();
      const updated = await loadRecords() as VideoCDNRecord[];
      const inProgress = updated.filter(r =>
        r.processing_status === 'transcoding' || r.processing_status === 'downloading'
      );
      setAutoPollCountdown(AUTO_POLL_INTERVAL);
      if (inProgress.length === 0) {
        stopAutoPoll();
        const readyCount = updated.filter(r => r.processing_status === 'ready').length;
        const publishedCount = updated.filter(r => (r as any).published).length;
        setGlobalMessage(`✅ No more videos processing. ${readyCount} ready, ${publishedCount} published.`);
      }
    }, AUTO_POLL_INTERVAL * 1000);
  }, [accessToken, stopAutoPoll, loadRecords]);

  useEffect(() => { return () => stopAutoPoll(); }, [stopAutoPoll]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  // ── Import single video ───────────────────────────────────────────────────
  const handleImport = useCallback(async (videoId: string) => {
    if (!accessToken) return;
    setLoadingIds(prev => new Set(prev).add(videoId));
    setGlobalMessage('');
    try {
      const result = await callEdge('import', { video_id: videoId }, accessToken);
      setGlobalMessage(`✓ ${videoId} → CF: ${result.provider_video_id?.substring(0, 12)}… Auto-refresh active.`);
      await loadRecords();
      invalidateCache();
      startAutoPoll();
    } catch (err: any) {
      setGlobalMessage(`Import failed for ${videoId}: ${err?.message}`);
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(videoId); return s; });
    }
  }, [accessToken, loadRecords, startAutoPoll]);

  // ── Import All ────────────────────────────────────────────────────────────
  const handleImportAll = useCallback(async () => {
    if (!accessToken) return;
    const pending = records.filter(r => ['approved_for_ingestion', 'failed'].includes(r.processing_status));
    if (!pending.length) { setGlobalMessage('No videos pending import.'); return; }
    batchAbortRef.current = false;
    setBatchActive(true);
    setBatchLog([]);
    setBatchProgress({ current: 0, total: pending.length, done: 0, failed: 0 });
    let done = 0, failed = 0;

    for (let i = 0; i < pending.length; i++) {
      if (batchAbortRef.current) { setBatchLog(l => [...l, `⛔ Cancelled after ${done}.`]); break; }
      const videoId = pending[i].id;
      setBatchProgress({ current: i + 1, total: pending.length, done, failed });
      setBatchLog(l => [...l, `[${i + 1}/${pending.length}] ${videoId}…`]);
      setLoadingIds(prev => new Set(prev).add(videoId));
      try {
        const result = await callEdge('import', { video_id: videoId }, accessToken);
        done++;
        setBatchLog(l => [...l, `  ✓ ${videoId} → CF: ${(result.provider_video_id || '').substring(0, 14)}…`]);
      } catch (err: any) {
        failed++;
        setBatchLog(l => [...l, `  ✗ ${videoId}: ${err?.message?.substring(0, 90)}`]);
      } finally {
        setLoadingIds(prev => { const s = new Set(prev); s.delete(videoId); return s; });
      }
      setBatchProgress({ current: i + 1, total: pending.length, done, failed });
      if (i < pending.length - 1 && !batchAbortRef.current) {
        await new Promise(res => setTimeout(res, 2500));
      }
    }

    setBatchActive(false);
    invalidateCache();
    await loadRecords();
    setBatchLog(l => [...l, `🏁 Done. ${done} sent to Cloudflare, ${failed} failed.`]);
    setGlobalMessage(`Batch: ${done} sent. Auto-refresh will track progress.`);
    startAutoPoll();
  }, [accessToken, records, loadRecords, startAutoPoll]);

  // ── Poll All (batch poll all transcoding records) ─────────────────────────
  const handlePollAll = useCallback(async () => {
    if (!accessToken) return;
    const inProgress = records.filter(r => ['transcoding', 'downloading'].includes(r.processing_status));
    if (!inProgress.length) { setGlobalMessage('No videos currently processing.'); return; }
    setPollAllActive(true);
    setPollAllLog([`Polling ${inProgress.length} processing records…`]);
    try {
      const result = await callEdge('poll_all', {}, accessToken);
      setPollAllLog([
        `✅ Polled ${result.polled} records`,
        `  → ${result.ready} reached ready`,
        `  → ${result.still_processing} still processing`,
        `  → ${result.failed} failed`,
      ]);
      invalidateCache();
      await loadRecords();
    } catch (err: any) {
      setPollAllLog([`✗ poll_all error: ${err?.message}`]);
    } finally {
      setPollAllActive(false);
    }
  }, [accessToken, records, loadRecords]);

  // ── Poll single video ─────────────────────────────────────────────────────
  const handlePoll = useCallback(async (videoId: string) => {
    if (!accessToken) return;
    setLoadingIds(prev => new Set(prev).add(videoId));
    try {
      const result = await callEdge('poll', { video_id: videoId }, accessToken);
      const pct = result.percent_complete ? ` (${result.percent_complete}%)` : '';
      const published = result.published ? ' ✅ Published!' : '';
      setGlobalMessage(`${videoId} → ${result.cloudflare_state}${pct}${published}`);
      invalidateCache();
      await loadRecords();
    } catch (err: any) {
      setGlobalMessage(`Poll failed: ${err?.message}`);
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(videoId); return s; });
    }
  }, [accessToken, loadRecords]);

  // ── Retry source failures ─────────────────────────────────────────────────
  const handleRetryFailures = useCallback(async () => {
    if (!accessToken) return;
    setRetryActive(true);
    try {
      const result = await callEdge('retry_failures', {}, accessToken);
      setGlobalMessage(`Reset ${result.reset_count} failed records to approved_for_ingestion. Tap Import All to retry.`);
      await loadRecords();
    } catch (err: any) {
      setGlobalMessage(`Retry reset failed: ${err?.message}`);
    } finally {
      setRetryActive(false);
    }
  }, [accessToken, loadRecords]);

  // ── Validate & Publish All (manual recovery) ──────────────────────────────
  const [validateActive, setValidateActive] = useState(false);
  const [validateLog, setValidateLog] = useState<string[]>([]);
  const validateAbortRef = useRef(false);

  const handleValidateAll = useCallback(async () => {
    if (!accessToken) return;
    const readyUnpublished = records.filter(
      r => r.processing_status === 'ready' && !(r as any).published && !r.device_tested
    );
    if (!readyUnpublished.length) { setGlobalMessage('No ready-unpublished videos to validate.'); return; }
    validateAbortRef.current = false;
    setValidateActive(true);
    setValidateLog([]);
    let done = 0, failed = 0;

    for (let i = 0; i < readyUnpublished.length; i++) {
      if (validateAbortRef.current) { setValidateLog(l => [...l, '⛔ Cancelled.']); break; }
      const videoId = readyUnpublished[i].id;
      setValidateLog(l => [...l, `[${i + 1}/${readyUnpublished.length}] Validating ${videoId}…`]);
      try {
        await callEdge('validate_hls', { video_id: videoId }, accessToken);
        done++;
        setValidateLog(l => [...l, `  ✓ ${videoId} — published ✅`]);
      } catch (e: any) {
        failed++;
        setValidateLog(l => [...l, `  ✗ ${videoId}: ${e?.message?.substring(0, 80)}`]);
      }
      if (i < readyUnpublished.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
    setValidateActive(false);
    setValidateLog(l => [...l, `🏁 ${done} published, ${failed} failed.`]);
    invalidateCache();
    loadRecords();
  }, [accessToken, records, loadRecords]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:       records.length,
    published:   records.filter(r => (r as any).published === true).length,
    ready:       records.filter(r => r.processing_status === 'ready').length,
    processing:  records.filter(r => ['downloading', 'transcoding'].includes(r.processing_status)).length,
    queued:      records.filter(r => r.processing_status === 'approved_for_ingestion').length,
    srcReview:   records.filter(r => r.processing_status === 'source_review').length,
    failed:      records.filter(r => r.processing_status === 'failed').length,
    review:      records.filter(r => r.processing_status === 'rights_review').length,
  };

  const readyUnpublishedCount = records.filter(
    r => r.processing_status === 'ready' && !(r as any).published && !r.device_tested
  ).length;

  const displayRecords = activeTab === 'failures'
    ? records.filter(r => r.processing_status === 'failed')
    : records;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Video Pipeline</Text>
          <Text style={s.headerSub}>Cloudflare Stream · Admin Only</Text>
        </View>
        <Pressable style={s.refreshBtn} onPress={() => loadRecords()} disabled={isRefreshing}>
          {isRefreshing ? <ActivityIndicator size="small" color={Colors.gold} /> : <MaterialIcons name="refresh" size={20} color={Colors.gold} />}
        </Pressable>
        <Pressable style={s.refreshBtn} onPress={signOut}>
          <MaterialIcons name="logout" size={16} color={Colors.textMuted} />
        </Pressable>
      </View>

      {/* Auth banner */}
      <View style={s.authBanner}>
        <MaterialIcons name="admin-panel-settings" size={13} color={Colors.success} />
        <Text style={s.authBannerText} numberOfLines={1}>Admin: {user?.email}</Text>
      </View>

      {/* Stats bar — 2 rows */}
      <View style={s.statsWrap}>
        <View style={s.statsRow}>
          {[
            { label: 'Total',     value: stats.total,      color: Colors.textMuted },
            { label: 'Published', value: stats.published,  color: Colors.gold },
            { label: 'Ready',     value: stats.ready,      color: Colors.success },
            { label: 'Processing',value: stats.processing, color: '#F59E0B' },
          ].map(st => (
            <View key={st.label} style={s.statItem}>
              <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.statsRow}>
          {[
            { label: 'Queued',    value: stats.queued,    color: '#3B82F6' },
            { label: 'Src Review',value: stats.srcReview, color: '#EC4899' },
            { label: 'Failed',    value: stats.failed,    color: Colors.error },
            { label: 'Rights Rev',value: stats.review,    color: '#9CA3AF' },
          ].map(st => (
            <View key={st.label} style={s.statItem}>
              <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Auto-poll banner */}
      {autoPollActive && (
        <View style={s.autoPollBanner}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={s.autoPollText}>
            Auto-refresh ({stats.processing} processing) — next in {autoPollCountdown}s
          </Text>
          <Pressable style={s.stopPollBtn} onPress={stopAutoPoll}>
            <MaterialIcons name="stop" size={13} color={Colors.error} />
            <Text style={s.stopPollText}>Stop</Text>
          </Pressable>
        </View>
      )}

      {/* Global message */}
      {globalMessage ? (
        <View style={s.globalMsg}>
          <Text style={s.globalMsgText} numberOfLines={6}>{globalMessage}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Step 1: Import All ──────────────────────────────────────────── */}
        <View style={[s.batchCard, { marginTop: Spacing.sm }]}>
          <View style={s.batchHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.batchTitle}>① Import All</Text>
              <Text style={s.batchSub}>
                {batchActive
                  ? `Importing ${batchProgress.current}/${batchProgress.total} — ${batchProgress.done} done, ${batchProgress.failed} failed`
                  : `${stats.queued + stats.failed} videos pending import`}
              </Text>
            </View>
            {batchActive ? (
              <Pressable style={[s.batchBtn, { backgroundColor: Colors.error + '22', borderColor: Colors.error + '55' }]}
                onPress={() => { batchAbortRef.current = true; }}>
                <MaterialIcons name="stop" size={13} color={Colors.error} />
                <Text style={[s.batchBtnText, { color: Colors.error }]}>Stop</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[s.batchBtn, (stats.queued + stats.failed) === 0 && s.btnDisabled]}
                onPress={handleImportAll}
                disabled={(stats.queued + stats.failed) === 0}>
                <MaterialIcons name="cloud-upload" size={13} color="#fff" />
                <Text style={s.batchBtnText}>Import All</Text>
              </Pressable>
            )}
          </View>
          {batchLog.length > 0 && (
            <ScrollView style={s.batchLog} ref={ref => { if (ref) ref.scrollToEnd({ animated: true }); }}>
              {batchLog.map((line, i) => (
                <Text key={i} style={[s.batchLogLine,
                  line.startsWith('  ✓') && { color: Colors.success },
                  line.startsWith('  ✗') && { color: Colors.error },
                  line.startsWith('🏁') && { color: Colors.gold, fontWeight: FontWeight.bold },
                  line.startsWith('⛔') && { color: Colors.error },
                ]}>{line}</Text>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Step 2: Poll All ────────────────────────────────────────────── */}
        <View style={[s.batchCard, { marginTop: 4 }]}>
          <View style={s.batchHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.batchTitle}>② Poll All Processing</Text>
              <Text style={s.batchSub}>{stats.processing} videos currently transcoding</Text>
            </View>
            <Pressable
              style={[s.batchBtn, { backgroundColor: '#8B5CF6' }, (stats.processing === 0 || pollAllActive) && s.btnDisabled]}
              onPress={handlePollAll}
              disabled={stats.processing === 0 || pollAllActive}>
              {pollAllActive ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="update" size={13} color="#fff" />}
              <Text style={s.batchBtnText}>Poll All</Text>
            </Pressable>
          </View>
          {pollAllLog.length > 0 && (
            <View style={[s.batchLog, { maxHeight: 80 }]}>
              {pollAllLog.map((line, i) => (
                <Text key={i} style={[s.batchLogLine,
                  line.includes('reached ready') && { color: Colors.success },
                  line.includes('failed') && { color: Colors.error },
                ]}>{line}</Text>
              ))}
            </View>
          )}
        </View>

        {/* ── Step 3: Validate & Publish All ─────────────────────────────── */}
        <View style={[s.batchCard, { marginTop: 4 }]}>
          <View style={s.batchHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.batchTitle}>③ Validate & Publish</Text>
              <Text style={s.batchSub}>{readyUnpublishedCount} ready videos awaiting HLS validation</Text>
            </View>
            {validateActive ? (
              <Pressable style={[s.batchBtn, { backgroundColor: Colors.error + '22', borderColor: Colors.error + '55' }]}
                onPress={() => { validateAbortRef.current = true; }}>
                <MaterialIcons name="stop" size={13} color={Colors.error} />
                <Text style={[s.batchBtnText, { color: Colors.error }]}>Stop</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[s.batchBtn, { backgroundColor: '#22C55E' }, readyUnpublishedCount === 0 && s.btnDisabled]}
                onPress={handleValidateAll}
                disabled={readyUnpublishedCount === 0}>
                <MaterialIcons name="verified" size={13} color="#fff" />
                <Text style={s.batchBtnText}>Validate All</Text>
              </Pressable>
            )}
          </View>
          {validateLog.length > 0 && (
            <ScrollView style={s.batchLog} ref={ref => { if (ref) ref.scrollToEnd({ animated: true }); }}>
              {validateLog.map((line, i) => (
                <Text key={i} style={[s.batchLogLine,
                  line.startsWith('  ✓') && { color: Colors.success },
                  line.startsWith('  ✗') && { color: Colors.error },
                  line.startsWith('🏁') && { color: Colors.gold },
                ]}>{line}</Text>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Retry Source Failures ───────────────────────────────────────── */}
        {stats.failed > 0 && (
          <View style={[s.batchCard, { marginTop: 4, borderColor: Colors.error + '44' }]}>
            <View style={s.batchHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[s.batchTitle, { color: '#F87171' }]}>Retry Source Failures</Text>
                <Text style={s.batchSub}>
                  {stats.failed} failed records — resets source-failures to approved for re-import
                </Text>
              </View>
              <Pressable
                style={[s.batchBtn, { backgroundColor: '#F87171', borderColor: '#F87171' }, retryActive && s.btnDisabled]}
                onPress={handleRetryFailures}
                disabled={retryActive}>
                {retryActive ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="replay" size={13} color="#fff" />}
                <Text style={s.batchBtnText}>Reset & Retry</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Failure breakdown ────────────────────────────────────────────── */}
        <FailureSummary records={records} />

        {/* ── Instructions ────────────────────────────────────────────────── */}
        <View style={s.instructionCard}>
          <Text style={s.instructionTitle}>Automated Pipeline Flow</Text>
          <Text style={s.instructionBody}>
            1. ① Import All → sends approved videos to Cloudflare Stream{'\n'}
            2. Auto-refresh polls every 30s while videos are transcoding{'\n'}
            3. On ready → HLS validated → published=true automatically{'\n'}
            4. Published videos appear in Watch tab without SQL or restart{'\n'}
            5. ② Poll All — manual batch poll for stuck processing videos{'\n'}
            6. ③ Validate All — manual recovery for ready-but-unpublished{'\n'}
            7. Retry button — resets source-resolution failures for re-import
          </Text>
        </View>

        {lastRefresh && (
          <Text style={s.lastRefresh}>Last refreshed: {lastRefresh.toLocaleTimeString()}</Text>
        )}

        {/* ── Tab selector ─────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: 8, gap: 8 }}>
          {(['queue', 'failures'] as const).map(tab => (
            <Pressable key={tab} style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>
                {tab === 'queue' ? `All Records (${records.length})` : `Failures (${stats.failed})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Video rows ───────────────────────────────────────────────────── */}
        {displayRecords.length === 0 && !isRefreshing ? (
          <View style={s.emptyState}>
            <MaterialIcons name="cloud-off" size={48} color={Colors.textMuted} />
            <Text style={s.emptyText}>
              {activeTab === 'failures' ? 'No failed records' : 'No records found'}
            </Text>
          </View>
        ) : (
          displayRecords.map(record => (
            <VideoRow
              key={record.id}
              record={record}
              onImport={() => handleImport(record.id)}
              onPoll={() => handlePoll(record.id)}
              isLoading={loadingIds.has(record.id)}
            />
          ))
        )}

      </ScrollView>
    </View>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function PipelineAdminScreen() {
  const auth = useContext(AdminAuthContext);
  const insets = useSafeAreaInsets();

  if (!auth) {
    return (
      <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.textMuted }}>AdminAuthProvider not found</Text>
      </View>
    );
  }

  if (auth.isLoading || auth.isCheckingAdmin) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={{ color: Colors.textMuted, marginTop: 12, fontSize: 13 }}>
          {auth.isCheckingAdmin ? 'Verifying admin access…' : 'Loading…'}
        </Text>
      </View>
    );
  }

  if (!auth.session || !auth.isAdmin) return <SignInForm />;
  return <PipelineDashboard />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub:        { fontSize: FontSize.xs, color: Colors.textMuted },
  refreshBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  authBanner:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 5, backgroundColor: Colors.success + '11', borderBottomWidth: 1, borderBottomColor: Colors.success + '33' },
  authBannerText:   { flex: 1, fontSize: 11, color: Colors.success },
  statsWrap:        { borderBottomWidth: 1, borderBottomColor: Colors.border },
  statsRow:         { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 6, gap: 2 },
  statItem:         { flex: 1, alignItems: 'center' },
  statValue:        { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  statLabel:        { fontSize: 9, color: Colors.textMuted, marginTop: 1 },
  globalMsg:        { marginHorizontal: Spacing.md, marginTop: Spacing.sm, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.sm },
  globalMsgText:    { fontSize: FontSize.xs, color: Colors.textPrimary, lineHeight: 17 },
  autoPollBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: Spacing.md, marginTop: 4, backgroundColor: Colors.gold + '15', borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.gold + '44' },
  autoPollText:     { flex: 1, fontSize: 11, color: Colors.gold },
  stopPollBtn:      { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.error + '22', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4 },
  stopPollText:     { fontSize: 11, color: Colors.error, fontWeight: FontWeight.semibold },
  batchCard:        { marginHorizontal: Spacing.md, marginTop: 0, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  batchHeader:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  batchTitle:       { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  batchSub:         { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  batchBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary },
  batchBtnText:     { fontSize: 11, fontWeight: FontWeight.bold, color: '#fff' },
  batchLog:         { maxHeight: 120, marginTop: 8, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, padding: 6 },
  batchLogLine:     { fontSize: 10, color: Colors.textSecondary, lineHeight: 15, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  instructionCard:  { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  instructionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.gold, marginBottom: 6 },
  instructionBody:  { fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },
  lastRefresh:      { fontSize: 10, color: Colors.textMuted, paddingHorizontal: Spacing.md, paddingBottom: 2 },
  tabBtn:           { flex: 1, paddingVertical: 7, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  tabBtnActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabBtnText:       { fontSize: 11, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tabBtnTextActive: { color: '#fff', fontWeight: FontWeight.bold },
  emptyState:       { alignItems: 'center', paddingTop: 40, gap: Spacing.md },
  emptyText:        { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 24 },
  row:              { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: 6, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  rowIndicator:     { width: 4 },
  rowThumb:         { width: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceElevated },
  rowThumbInner:    { width: 36, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rowBody:          { flex: 1, padding: 9, gap: 3 },
  rowHeader:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  rowId:            { flex: 1, fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  rowSub:           { fontSize: 10, color: Colors.textMuted },
  rowError:         { fontSize: 10, color: Colors.error, backgroundColor: Colors.error + '11', borderRadius: 4, padding: 4 },
  badge:            { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1 },
  badgeText:        { fontSize: 9, fontWeight: FontWeight.bold },
  progressWrap:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  progressBar:      { height: 3, borderRadius: 2 },
  progressText:     { fontSize: 10, color: Colors.textMuted },
  rowActions:       { flexDirection: 'row', gap: 5, marginTop: 5, flexWrap: 'wrap' },
  actionBtn:        { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  actionBtnText:    { fontSize: 10, fontWeight: FontWeight.semibold, color: '#fff' },
  importBtn:        { backgroundColor: Colors.primary },
  pollBtn:          { backgroundColor: '#8B5CF6' },
  btnDisabled:      { opacity: 0.45 },
  signInWrap:       { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  signInCard:       { width: '100%', maxWidth: 380, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  signInTitle:      { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  signInSub:        { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  signInInput:      { width: '100%', backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.body, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  signInBtn:        { width: '100%', backgroundColor: Colors.gold, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  signInBtnText:    { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textInverse },
  signInError:      { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.error + '15', borderRadius: BorderRadius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '44' },
  signInErrorText:  { flex: 1, fontSize: FontSize.sm, color: Colors.error },
  signInBackBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
  signInBackText:   { fontSize: FontSize.sm, color: Colors.textMuted },
});

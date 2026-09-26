// Powered by OnSpace.AI
// Watch Progress Service — local AsyncStorage + optional Supabase sync
//
// Priority: local-first (works offline), syncs to Supabase when user is authenticated.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WatchProgress {
  videoId: string;
  positionSeconds: number;
  durationSeconds: number | null;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: string; // ISO date
}

const STORAGE_KEY = 'noor_watch_progress';
const COMPLETED_THRESHOLD = 0.90; // 90% watched = completed

// ─── Local Storage ────────────────────────────────────────────────────────────

async function loadAllLocal(): Promise<Record<string, WatchProgress>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WatchProgress>;
  } catch {
    return {};
  }
}

async function saveAllLocal(data: Record<string, WatchProgress>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export async function getProgress(videoId: string): Promise<WatchProgress | null> {
  const all = await loadAllLocal();
  return all[videoId] || null;
}

export async function saveProgress(
  videoId: string,
  positionSeconds: number,
  durationSeconds: number | null
): Promise<WatchProgress> {
  const all = await loadAllLocal();
  const progressPercent = durationSeconds && durationSeconds > 0
    ? Math.min(100, (positionSeconds / durationSeconds) * 100)
    : 0;
  const completed = progressPercent >= COMPLETED_THRESHOLD * 100;

  const entry: WatchProgress = {
    videoId,
    positionSeconds: Math.floor(positionSeconds),
    durationSeconds,
    progressPercent: Math.round(progressPercent * 100) / 100,
    completed,
    lastWatchedAt: new Date().toISOString(),
  };

  all[videoId] = entry;
  await saveAllLocal(all);

  // Fire-and-forget Supabase sync
  syncToSupabase(entry).catch(() => {});

  return entry;
}

export async function clearProgress(videoId: string): Promise<void> {
  const all = await loadAllLocal();
  delete all[videoId];
  await saveAllLocal(all);
}

export async function getRecentlyWatched(limit = 10): Promise<WatchProgress[]> {
  const all = await loadAllLocal();
  return Object.values(all)
    .filter(p => p.positionSeconds > 5) // Skip accidental taps
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .slice(0, limit);
}

export async function getContinueWatching(limit = 8): Promise<WatchProgress[]> {
  const all = await loadAllLocal();
  return Object.values(all)
    .filter(p => !p.completed && p.positionSeconds > 30 && p.progressPercent < 95)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .slice(0, limit);
}

export function formatPosition(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Supabase Sync ────────────────────────────────────────────────────────────

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
}

async function syncToSupabase(progress: WatchProgress): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return; // Not logged in — local only

    await sb.from('watch_progress').upsert({
      user_id: user.id,
      video_id: progress.videoId,
      position_seconds: progress.positionSeconds,
      duration_seconds: progress.durationSeconds,
      progress_percent: progress.progressPercent,
      completed: progress.completed,
      last_watched_at: progress.lastWatchedAt,
    }, { onConflict: 'user_id,video_id' });
  } catch {
    // Sync failure is non-critical — local data is always the source of truth
  }
}

// Powered by OnSpace.AI
// useWatchProgress — hook for reading and writing video watch progress

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  WatchProgress,
  getProgress,
  saveProgress,
  getContinueWatching,
  getRecentlyWatched,
  formatPosition,
} from '../services/watchProgressService';

// ─── Single video progress ────────────────────────────────────────────────────

export function useVideoProgress(videoId: string) {
  const [progress, setProgress] = useState<WatchProgress | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    getProgress(videoId).then(p => {
      if (active) { setProgress(p); setLoaded(true); }
    });
    return () => { active = false; };
  }, [videoId]);

  // Debounced save — call frequently during playback, saves every 5s max
  const updateProgress = useCallback((positionSeconds: number, durationSeconds: number | null) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const updated = await saveProgress(videoId, positionSeconds, durationSeconds);
      setProgress(updated);
    }, 5000);
  }, [videoId]);

  // Immediate save (on pause, exit, end)
  const flushProgress = useCallback(async (positionSeconds: number, durationSeconds: number | null) => {
    if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
    const updated = await saveProgress(videoId, positionSeconds, durationSeconds);
    setProgress(updated);
  }, [videoId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    progress,
    loaded,
    updateProgress,
    flushProgress,
    resumePosition: progress && !progress.completed ? progress.positionSeconds : null,
    progressPercent: progress?.progressPercent ?? 0,
    isCompleted: progress?.completed ?? false,
    formattedPosition: progress ? formatPosition(progress.positionSeconds) : null,
  };
}

// ─── Continue watching list ───────────────────────────────────────────────────

export function useContinueWatching(limit = 8) {
  const [items, setItems] = useState<WatchProgress[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getContinueWatching(limit);
    setItems(data);
    setLoaded(true);
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loaded, refresh };
}

// ─── Recently watched ─────────────────────────────────────────────────────────

export function useRecentlyWatched(limit = 10) {
  const [items, setItems] = useState<WatchProgress[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getRecentlyWatched(limit).then(data => {
      if (active) { setItems(data); setLoaded(true); }
    });
    return () => { active = false; };
  }, [limit]);

  return { items, loaded };
}

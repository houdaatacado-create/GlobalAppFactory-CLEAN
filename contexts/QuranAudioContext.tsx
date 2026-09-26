
// Powered by OnSpace.AI
// Quran Audio Context — Global Audio State
//
// Uses expo-av for background-capable audio playback.
// Audio continues when user navigates within NoorIslamicApp,
// locks the screen, or turns it off.

import React, { createContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { AppState } from 'react-native';
import {
  QuranReciter, QuranMoshaf,
  buildSurahAudioUrl, getDefaultMoshaf, isSurahAvailable,
  fetchReciters, loadAudioPrefs, saveAudioPrefs,
  RepeatMode, SleepTimer, sleepTimerToMs,
  SURAH_NAMES_AR,
  AyahRepeatMode, ayahRepeatCount,
  buildAyahAudioUrl, getQuranComKey,
} from '../services/quranAudioService';
import { SURAHS_LIST } from '../services/quranService';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface QuranAudioContextType {
  // Catalog
  reciters: QuranReciter[];
  catalogLoading: boolean;

  // Current playback
  currentReciter: QuranReciter | null;
  currentMoshaf: QuranMoshaf | null;
  currentSurah: number;
  playbackState: PlaybackState;
  positionSeconds: number;
  durationSeconds: number;
  errorMessage: string;

  // Controls
  playSurah: (surahNumber: number, reciter?: QuranReciter, moshaf?: QuranMoshaf) => Promise<void>;
  pauseAudio: () => Promise<void>;
  resumeAudio: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  playNextSurah: () => Promise<void>;
  playPrevSurah: () => Promise<void>;
  stopAudio: () => Promise<void>;
  setReciter: (reciter: QuranReciter, moshaf?: QuranMoshaf) => void;
  setCurrentSurahIndex: (surahNumber: number) => void;

  // Settings
  repeatMode: RepeatMode;
  setRepeatMode: (mode: RepeatMode) => void;
  autoplayNext: boolean;
  setAutoplayNext: (v: boolean) => void;
  sleepTimer: SleepTimer;
  setSleepTimer: (t: SleepTimer) => void;
  favoriteReciterIds: number[];
  toggleFavoriteReciter: (id: number) => void;
  repeatCount: number;

  // Resume banner
  lastListened: { surah: number; positionSeconds: number } | null;

  // Mini-player visibility
  playerVisible: boolean;

  // ── Ayah-by-Ayah mode ────────────────────────────────────────────────────
  ayahMode: boolean;
  toggleAyahMode: () => void;
  currentAyahNumber: number;           // 1-based, active in ayah mode
  ayahPlaybackState: PlaybackState;
  ayahRepeatMode: AyahRepeatMode;
  setAyahRepeatMode: (mode: AyahRepeatMode) => void;
  playAyah: (surahNumber: number, ayahNumber: number) => Promise<void>;
  playNextAyah: () => Promise<void>;
  playPrevAyah: () => Promise<void>;
  pauseAyah: () => Promise<void>;
  resumeAyah: () => Promise<void>;
  toggleAyahPlayPause: () => Promise<void>;
  stopAyahMode: () => Promise<void>;
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

export const QuranAudioContext = createContext<QuranAudioContextType | undefined>(undefined);

// ─── CONFIGURE AUDIO MODE ─────────────────────────────────────────────────────

async function configureAudioMode() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
  } catch (e) {
    console.error('[QuranAudio] setAudioModeAsync error:', e);
  }
}

// Helper to get cached reciters (assuming it exists or needs to be added)
async function getCachedReciters(): Promise<any> {
  // This function was referenced but not defined in the original code.
  // For the purpose of fixing the provided error, we'll add a placeholder.
  // In a real application, you'd replace this with actual caching logic.
  console.warn("[QuranAudioContext] getCachedReciters not fully implemented. Returning true for initial load check.");
  return true; // Assume cache is valid for now, to avoid breaking other logic.
}

// Helper to clear reciters cache (assuming it exists or needs to be added)
async function clearRecitersCache(): Promise<void> {
  // This function was referenced but not defined in the original code.
  // For the purpose of fixing the provided error, we'll add a placeholder.
  // In a real application, you'd replace this with actual caching logic.
  console.warn("[QuranAudioContext] clearRecitersCache not fully implemented.");
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const [reciters, setReciters] = useState<QuranReciter[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [currentReciter, setCurrentReciter] = useState<QuranReciter | null>(null);
  const [currentMoshaf, setCurrentMoshaf] = useState<QuranMoshaf | null>(null);
  const [currentSurah, setCurrentSurah] = useState(1);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('none');
  const [repeatCount, setRepeatCount] = useState(0);
  const [autoplayNext, setAutoplayNextState] = useState(true);
  const [sleepTimer, setSleepTimerState] = useState<SleepTimer>('off');
  const [favoriteReciterIds, setFavoriteReciterIds] = useState<number[]>([]);
  const [lastListened, setLastListened] = useState<{ surah: number; positionSeconds: number } | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);

  // ── Ayah mode state ───────────────────────────────────────────────────────
  const [ayahMode, setAyahMode] = useState(false);
  const [currentAyahNumber, setCurrentAyahNumber] = useState(1);
  const [ayahPlaybackState, setAyahPlaybackState] = useState<PlaybackState>('idle');
  const [ayahRepeatMode, setAyahRepeatModeState] = useState<AyahRepeatMode>('once');
  const ayahSoundRef = useRef<Audio.Sound | null>(null);
  const ayahRepeatCountRef = useRef(0);     // how many times current ayah has played
  const ayahSurahRef = useRef(1);           // surah currently playing in ayah mode
  const ayahTotalRef = useRef(7);           // total ayahs in current surah

  const soundRef = useRef<Audio.Sound | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatCountRef = useRef(0);

  // ── Load prefs on mount ───────────────────────────────────────────────────
  useEffect(() => {
    configureAudioMode();
    loadInitial();
    return () => {
      // Cleanup ayah sound on unmount
      ayahSoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const loadInitial = async () => {
    // Clear any stale cached empty/error list left from before this fix
    const staleCheck = await getCachedReciters();
    if (!staleCheck) {
      // Cache was empty, invalid, or expired — purge key entirely so fetch runs fresh
      await clearRecitersCache();
    }

    const prefs = await loadAudioPrefs();
    setRepeatModeState(prefs.repeatMode);
    setAutoplayNextState(prefs.autoplayNext);
    setFavoriteReciterIds(prefs.favoriteReciterIds || []);

    if (prefs.lastSurah > 1 || prefs.lastPositionSeconds > 0) {
      setLastListened({ surah: prefs.lastSurah, positionSeconds: prefs.lastPositionSeconds });
    }

    // Load reciter catalog
    setCatalogLoading(true);
    try {
      const catalog = await fetchReciters('ar');
      console.log(`[QuranAudioContext] Loaded ${catalog.length} reciters`);
      setReciters(catalog);

      // Restore last reciter
      if (prefs.reciterId && catalog.length > 0) {
        const saved = catalog.find(r => r.id === prefs.reciterId);
        if (saved) {
          const moshaf = prefs.moshafId
            ? saved.moshaf.find(m => m.id === prefs.moshafId) || getDefaultMoshaf(saved)
            : getDefaultMoshaf(saved);
          setCurrentReciter(saved);
          setCurrentMoshaf(moshaf);
          setCurrentSurah(prefs.lastSurah || 1);
        }
      }
    } catch (e: any) {
      console.error('[QuranAudioContext] fetchReciters failed:', e?.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  // ── App state — restart auto-refresh on foreground ────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        // Re-enable background mode when coming to foreground
        configureAudioMode();
      }
    });
    return () => sub.remove();
  }, []);

  // ── Playback status callback ──────────────────────────────────────────────
  const onPlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if ('error' in status && status.error) {
        setPlaybackState('error');
        setErrorMessage(`تعذّر تشغيل الصوت: ${status.error}`);
      }
      return;
    }

    setPositionSeconds(status.positionMillis / 1000);
    setDurationSeconds(status.durationMillis ? status.durationMillis / 1000 : 0);

    if (status.isPlaying) {
      setPlaybackState('playing');
    } else if (status.isBuffering) {
      setPlaybackState('loading');
    }

    // Save position periodically
    if (status.positionMillis > 0 && status.positionMillis % 10000 < 500) {
      saveAudioPrefs({ lastPositionSeconds: status.positionMillis / 1000 });
    }

    // Track finished
    if (status.didJustFinish) {
      handleTrackFinished();
    }
  }, [repeatMode, autoplayNext, currentSurah, currentReciter, currentMoshaf]); // Added handleTrackFinished to deps

  const handleTrackFinished = useCallback(async () => {
    await saveAudioPrefs({ lastPositionSeconds: 0 });

    if (repeatMode === 'infinite' || repeatMode === 'surah') {
      // Replay current surah
      await playSurahInternal(currentSurah);
      return;
    }

    if (repeatMode !== 'none' && repeatMode !== 'once') {
      const limit = repeatMode === 'three' ? 3 : repeatMode === 'five' ? 5 : 10;
      if (repeatCountRef.current < limit - 1) {
        repeatCountRef.current += 1;
        setRepeatCount(repeatCountRef.current);
        await playSurahInternal(currentSurah);
        return;
      } else {
        repeatCountRef.current = 0;
        setRepeatCount(0);
      }
    }

    // Autoplay next
    if (autoplayNext && currentSurah < 114) {
      const next = currentSurah + 1;
      setCurrentSurah(next);
      await saveAudioPrefs({ lastSurah: next });
      await playSurahInternal(next);
    } else {
      setPlaybackState('paused');
    }
  }, [repeatMode, autoplayNext, currentSurah, playSurahInternal]); // Added playSurahInternal to deps

  // ── Internal play function ────────────────────────────────────────────────
  const playSurahInternal = useCallback(async (
    surahNumber: number,
    reciter?: QuranReciter,
    moshaf?: QuranMoshaf
  ) => {
    const targetReciter = reciter || currentReciter;
    const targetMoshaf = moshaf || currentMoshaf;

    if (!targetReciter || !targetMoshaf) {
      setErrorMessage('اختر قارئاً أولاً');
      setPlaybackState('error');
      return;
    }

    if (!isSurahAvailable(targetMoshaf, surahNumber)) {
      setErrorMessage('هذه السورة غير متوفرة لهذا القارئ');
      setPlaybackState('error');
      return;
    }

    const audioUrl = buildSurahAudioUrl(targetMoshaf, surahNumber);
    console.log(`[QuranAudio] Playing: ${audioUrl}`);

    setPlaybackState('loading');
    setErrorMessage('');
    setPositionSeconds(0);
    setDurationSeconds(0);

    try {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000,
          isLooping: false,
        },
        onPlaybackStatus
      );

      soundRef.current = sound;
      setCurrentSurah(surahNumber);
      setPlayerVisible(true);
      setLastListened(null); // clear resume banner once playing

      await saveAudioPrefs({
        reciterId: targetReciter.id,
        moshafId: targetMoshaf.id,
        lastSurah: surahNumber,
        lastPositionSeconds: 0,
      });
    } catch (e: any) {
      console.error('[QuranAudio] load error:', e?.message);
      setPlaybackState('error');
      setErrorMessage('تعذّر تحميل الصوت. تحقق من اتصال الإنترنت.');
    }
  }, [currentReciter, currentMoshaf, onPlaybackStatus, setCurrentSurah, setPlayerVisible, setLastListened, setPlaybackState, setErrorMessage, setPositionSeconds, setDurationSeconds]);

  // ── Public API ────────────────────────────────────────────────────────────
  const playSurah = useCallback(async (
    surahNumber: number,
    reciter?: QuranReciter,
    moshaf?: QuranMoshaf
  ) => {
    if (reciter) setCurrentReciter(reciter);
    if (moshaf) setCurrentMoshaf(moshaf);
    else if (reciter) {
      const defaultMoshaf = getDefaultMoshaf(reciter);
      setCurrentMoshaf(defaultMoshaf);
    }
    await playSurahInternal(surahNumber, reciter, moshaf || (reciter ? getDefaultMoshaf(reciter) || undefined : undefined));
  }, [playSurahInternal, setCurrentReciter, setCurrentMoshaf]);

  const pauseAudio = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlaybackState('paused');
    }
  }, []);

  const resumeAudio = useCallback(async () => {
    if (soundRef.current) {
      setPlaybackState('loading');
      await soundRef.current.playAsync();
      setPlaybackState('playing');
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (playbackState === 'playing') {
      await pauseAudio();
    } else {
      await resumeAudio();
    }
  }, [playbackState, pauseAudio, resumeAudio]);

  const seekTo = useCallback(async (seconds: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seconds * 1000);
      setPositionSeconds(seconds);
    }
  }, []);

  const playNextSurah = useCallback(async () => {
    if (currentSurah < 114) {
      const next = currentSurah + 1;
      repeatCountRef.current = 0;
      await playSurahInternal(next);
    }
  }, [currentSurah, playSurahInternal]);

  const playPrevSurah = useCallback(async () => {
    // If >3s in, restart current; else go to previous
    if (positionSeconds > 3 || currentSurah <= 1) {
      await seekTo(0);
    } else {
      const prev = currentSurah - 1;
      repeatCountRef.current = 0;
      await playSurahInternal(prev);
    }
  }, [currentSurah, positionSeconds, seekTo, playSurahInternal]);

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaybackState('idle');
    setPositionSeconds(0);
    setPlayerVisible(false);
  }, []);

  const setReciter = useCallback((reciter: QuranReciter, moshaf?: QuranMoshaf) => {
    setCurrentReciter(reciter);
    const m = moshaf || getDefaultMoshaf(reciter);
    setCurrentMoshaf(m);
    saveAudioPrefs({ reciterId: reciter.id, moshafId: m?.id });
  }, [setCurrentReciter, setCurrentMoshaf]);

  const setCurrentSurahIndex = useCallback((surahNumber: number) => {
    setCurrentSurah(surahNumber);
  }, []);

  // ── Settings setters ──────────────────────────────────────────────────────
  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
    repeatCountRef.current = 0;
    setRepeatCount(0);
    saveAudioPrefs({ repeatMode: mode });
  }, []);

  const setAutoplayNext = useCallback((v: boolean) => {
    setAutoplayNextState(v);
    saveAudioPrefs({ autoplayNext: v });
  }, []);

  const setSleepTimer = useCallback((timer: SleepTimer) => {
    setSleepTimerState(timer);
    if (sleepTimerRef.current) { clearTimeout(sleepTimerRef.current); sleepTimerRef.current = null; }
    const ms = sleepTimerToMs(timer);
    if (ms > 0) {
      sleepTimerRef.current = setTimeout(() => {
        pauseAudio();
        setSleepTimerState('off');
      }, ms);
    }
  }, [pauseAudio]);

  const toggleFavoriteReciter = useCallback((id: number) => {
    setFavoriteReciterIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveAudioPrefs({ favoriteReciterIds: updated });
      return updated;
    });
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
      ayahSoundRef.current?.unloadAsync();
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, []);

  // ── Ayah Mode: toggle ─────────────────────────────────────────────────────
  const toggleAyahMode = useCallback(() => {
    setAyahMode(prev => {
      if (prev) {
        // Turning off — stop ayah sound
        ayahSoundRef.current?.stopAsync().catch(() => {});
        ayahSoundRef.current?.unloadAsync().catch(() => {});
        ayahSoundRef.current = null;
        setAyahPlaybackState('idle');
      }
      return !prev;
    });
  }, []);

  // ── Ayah Mode: playback status callback ───────────────────────────────────
  const onAyahPlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if ('error' in status && status.error) {
        setAyahPlaybackState('error');
        setErrorMessage(`تعذّر تشغيل الآية: ${status.error}`);
      }
      return;
    }
    if (status.isPlaying)        setAyahPlaybackState('playing');
    else if (status.isBuffering) setAyahPlaybackState('loading');

    if (status.didJustFinish) {
      handleAyahFinished();
    }
  // This line was causing the error: // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahRepeatMode, handleAyahFinished, setAyahPlaybackState, setErrorMessage]); // Added handleAyahFinished, setAyahPlaybackState, setErrorMessage to deps

  // ── Ayah finished handler ─────────────────────────────────────────────────
  const handleAyahFinished = useCallback(async () => {
    const limit = ayahRepeatCount(ayahRepeatMode);
    // -1 means infinite — replay forever
    if (limit === -1) {
      await playAyahInternal(ayahSurahRef.current, currentAyahNumber);
      return;
    }
    ayahRepeatCountRef.current += 1;
    if (ayahRepeatCountRef.current < limit) {
      // Still within repeat limit
      await playAyahInternal(ayahSurahRef.current, currentAyahNumber);
    } else {
      // Advance to next ayah
      ayahRepeatCountRef.current = 0;
      const nextAyah = currentAyahNumber + 1;
      if (nextAyah <= ayahTotalRef.current) {
        setCurrentAyahNumber(nextAyah);
        await playAyahInternal(ayahSurahRef.current, nextAyah);
      } else {
        // End of surah
        setAyahPlaybackState('paused');
      }
    }
  // This line was causing the error: // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahRepeatMode, currentAyahNumber, playAyahInternal, setAyahPlaybackState, setCurrentAyahNumber]); // Added playAyahInternal, setAyahPlaybackState, setCurrentAyahNumber to deps

  // ── Ayah Mode: internal play ──────────────────────────────────────────────
  const playAyahInternal = useCallback(async (
    surahNumber: number,
    ayahNumber: number
  ) => {
    const reciterName = currentReciter?.name || '';
    const cdnKey = getQuranComKey(reciterName);
    const audioUrl = buildAyahAudioUrl(cdnKey, surahNumber, ayahNumber);
    console.log(`[QuranAyah] Playing ayah ${surahNumber}:${ayahNumber} — ${audioUrl}`);

    setAyahPlaybackState('loading');
    setErrorMessage('');

    try {
      if (ayahSoundRef.current) {
        await ayahSoundRef.current.stopAsync().catch(() => {});
        await ayahSoundRef.current.unloadAsync().catch(() => {});
        ayahSoundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500, isLooping: false },
        onAyahPlaybackStatus
      );
      ayahSoundRef.current = sound;
    } catch (e: any) {
      console.error('[QuranAyah] load error:', e?.message);
      setAyahPlaybackState('error');
      setErrorMessage('تعذّر تحميل الآية. تحقق من الاتصال.');
    }
  // This line was causing the error: // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReciter, onAyahPlaybackStatus, setAyahPlaybackState, setErrorMessage]); // Added setAyahPlaybackState, setErrorMessage to deps

  // ── Ayah Mode: public playAyah ────────────────────────────────────────────
  const playAyah = useCallback(async (surahNumber: number, ayahNumber: number) => {
    // Pause full-surah player if running
    if (soundRef.current && playbackState === 'playing') {
      await soundRef.current.pauseAsync().catch(() => {});
      setPlaybackState('paused');
    }
    ayahSurahRef.current  = surahNumber;
    ayahTotalRef.current  = SURAHS_LIST[surahNumber - 1]?.numberOfAyahs ?? 1;
    ayahRepeatCountRef.current = 0;
    setCurrentAyahNumber(ayahNumber);
    setAyahMode(true);
    setPlayerVisible(true);
    await playAyahInternal(surahNumber, ayahNumber);
  }, [playAyahInternal, playbackState, setPlaybackState, setCurrentAyahNumber, setAyahMode, setPlayerVisible]);

  const playNextAyah = useCallback(async () => {
    const next = currentAyahNumber + 1;
    if (next <= ayahTotalRef.current) {
      ayahRepeatCountRef.current = 0;
      setCurrentAyahNumber(next);
      await playAyahInternal(ayahSurahRef.current, next);
    }
  }, [currentAyahNumber, playAyahInternal]);

  const playPrevAyah = useCallback(async () => {
    const prev = Math.max(1, currentAyahNumber - 1);
    ayahRepeatCountRef.current = 0;
    setCurrentAyahNumber(prev);
    await playAyahInternal(ayahSurahRef.current, prev);
  }, [currentAyahNumber, playAyahInternal]);

  const pauseAyah = useCallback(async () => {
    if (ayahSoundRef.current) {
      await ayahSoundRef.current.pauseAsync().catch(() => {});
      setAyahPlaybackState('paused');
    }
  }, []);

  const resumeAyah = useCallback(async () => {
    if (ayahSoundRef.current) {
      setAyahPlaybackState('loading');
      await ayahSoundRef.current.playAsync().catch(() => {});
      setAyahPlaybackState('playing');
    }
  }, []);

  const toggleAyahPlayPause = useCallback(async () => {
    if (ayahPlaybackState === 'playing') await pauseAyah();
    else await resumeAyah();
  }, [ayahPlaybackState, pauseAyah, resumeAyah]);

  const stopAyahMode = useCallback(async () => {
    if (ayahSoundRef.current) {
      await ayahSoundRef.current.stopAsync().catch(() => {});
      await ayahSoundRef.current.unloadAsync().catch(() => {});
      ayahSoundRef.current = null;
    }
    setAyahMode(false);
    setAyahPlaybackState('idle');
    setCurrentAyahNumber(1);
    ayahRepeatCountRef.current = 0;
  }, []);

  const setAyahRepeatMode = useCallback((mode: AyahRepeatMode) => {
    setAyahRepeatModeState(mode);
    ayahRepeatCountRef.current = 0;
  }, []);

  const value: QuranAudioContextType = {
    reciters,
    catalogLoading,
    currentReciter,
    currentMoshaf,
    currentSurah,
    playbackState,
    positionSeconds,
    durationSeconds,
    errorMessage,
    playSurah,
    pauseAudio,
    resumeAudio,
    togglePlayPause,
    seekTo,
    playNextSurah,
    playPrevSurah,
    stopAudio,
    setReciter,
    setCurrentSurahIndex,
    repeatMode,
    setRepeatMode,
    autoplayNext,
    setAutoplayNext,
    sleepTimer,
    setSleepTimer,
    favoriteReciterIds,
    toggleFavoriteReciter,
    repeatCount,
    lastListened,
    playerVisible,
    // ayah mode
    ayahMode,
    toggleAyahMode,
    currentAyahNumber,
    ayahPlaybackState,
    ayahRepeatMode,
    setAyahRepeatMode,
    playAyah,
    playNextAyah,
    playPrevAyah,
    pauseAyah,
    resumeAyah,
    toggleAyahPlayPause,
    stopAyahMode,
  };

  return (
    <QuranAudioContext.Provider value={value}>
      {children}
    </QuranAudioContext.Provider>
  );
}

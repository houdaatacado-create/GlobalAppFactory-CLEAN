// Powered by OnSpace.AI
// Video Player Preferences Service
//
// Persists:
//   - Audio enabled (never mute after user explicitly tapped a video)
//   - Playback speed (0.5x – 2x)
//   - Last subtitle language selection
//   - Last audio track selection

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_AUDIO_ENABLED  = 'vp_audio_enabled';
const KEY_SPEED          = 'vp_speed';
const KEY_SUBTITLE_LANG  = 'vp_subtitle_lang';
const KEY_AUDIO_LANG     = 'vp_audio_lang';

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_AUDIO_ENABLED  = true;   // Always start with audio ON
const DEFAULT_SPEED          = 1.0;

// ─── In-memory cache (avoid repeated AsyncStorage reads) ─────────────────────

let _audioEnabled: boolean | null = null;
let _speed: number | null = null;
let _subtitleLang: string | null | undefined = undefined;  // undefined = not loaded
let _audioLang: string | null | undefined = undefined;

// ─── Audio enabled ────────────────────────────────────────────────────────────

export async function getAudioEnabled(): Promise<boolean> {
  if (_audioEnabled !== null) return _audioEnabled;
  try {
    const raw = await AsyncStorage.getItem(KEY_AUDIO_ENABLED);
    _audioEnabled = raw === null ? DEFAULT_AUDIO_ENABLED : raw === 'true';
  } catch {
    _audioEnabled = DEFAULT_AUDIO_ENABLED;
  }
  return _audioEnabled;
}

export async function setAudioEnabled(value: boolean): Promise<void> {
  _audioEnabled = value;
  try { await AsyncStorage.setItem(KEY_AUDIO_ENABLED, value ? 'true' : 'false'); } catch { /* ignore */ }
}

export function getAudioEnabledSync(): boolean {
  return _audioEnabled ?? DEFAULT_AUDIO_ENABLED;
}

// ─── Playback speed ───────────────────────────────────────────────────────────

export const SPEED_OPTIONS: { label: string; value: number }[] = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2.0 },
];

export async function getPlaybackSpeed(): Promise<number> {
  if (_speed !== null) return _speed;
  try {
    const raw = await AsyncStorage.getItem(KEY_SPEED);
    _speed = raw ? parseFloat(raw) : DEFAULT_SPEED;
    if (isNaN(_speed) || _speed <= 0) _speed = DEFAULT_SPEED;
  } catch {
    _speed = DEFAULT_SPEED;
  }
  return _speed;
}

export async function setPlaybackSpeed(value: number): Promise<void> {
  _speed = value;
  try { await AsyncStorage.setItem(KEY_SPEED, String(value)); } catch { /* ignore */ }
}

export function getPlaybackSpeedSync(): number {
  return _speed ?? DEFAULT_SPEED;
}

// ─── Subtitle language ────────────────────────────────────────────────────────

export async function getSubtitleLang(): Promise<string | null> {
  if (_subtitleLang !== undefined) return _subtitleLang;
  try {
    _subtitleLang = await AsyncStorage.getItem(KEY_SUBTITLE_LANG);
  } catch {
    _subtitleLang = null;
  }
  return _subtitleLang;
}

export async function setSubtitleLang(lang: string | null): Promise<void> {
  _subtitleLang = lang;
  try {
    if (lang) await AsyncStorage.setItem(KEY_SUBTITLE_LANG, lang);
    else await AsyncStorage.removeItem(KEY_SUBTITLE_LANG);
  } catch { /* ignore */ }
}

// ─── Audio language ───────────────────────────────────────────────────────────

export async function getAudioLang(): Promise<string | null> {
  if (_audioLang !== undefined) return _audioLang;
  try {
    _audioLang = await AsyncStorage.getItem(KEY_AUDIO_LANG);
  } catch {
    _audioLang = null;
  }
  return _audioLang;
}

export async function setAudioLang(lang: string): Promise<void> {
  _audioLang = lang;
  try { await AsyncStorage.setItem(KEY_AUDIO_LANG, lang); } catch { /* ignore */ }
}

// ─── Preload all prefs on app start ──────────────────────────────────────────

export async function preloadVideoPrefs(): Promise<void> {
  await Promise.all([
    getAudioEnabled(),
    getPlaybackSpeed(),
    getSubtitleLang(),
    getAudioLang(),
  ]);
}

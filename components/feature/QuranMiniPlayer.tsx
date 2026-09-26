// Powered by OnSpace.AI
// Quran Mini Player — Persistent bottom player for all Quran screens
// Stays visible while navigating within Quran section.
// Tap to expand to full player.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { useQuranAudio } from '../../hooks/useQuranAudio';
import { SURAH_NAMES_AR } from '../../services/quranAudioService';
import { QuranFullPlayer } from './QuranFullPlayer';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function QuranMiniPlayer() {
  const insets = useSafeAreaInsets();
  const {
    currentReciter, currentSurah, playbackState,
    positionSeconds, durationSeconds,
    togglePlayPause, playNextSurah, playPrevSurah,
    playerVisible, stopAudio,
  } = useQuranAudio();

  const [fullPlayerVisible, setFullPlayerVisible] = useState(false);

  if (!playerVisible || !currentReciter) return null;

  const isLoading = playbackState === 'loading';
  const isPlaying = playbackState === 'playing';
  const surahName = SURAH_NAMES_AR[currentSurah - 1] || `سورة ${currentSurah}`;
  const progress = durationSeconds > 0 ? positionSeconds / durationSeconds : 0;

  return (
    <>
      <Pressable
        style={[s.container, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]}
        onPress={() => setFullPlayerVisible(true)}
        accessible={false}
      >
        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${Math.min(progress * 100, 100)}%` as any }]} />
        </View>

        <View style={s.row}>
          {/* Info */}
          <View style={s.info}>
            <Text style={s.surahName} numberOfLines={1}>سورة {surahName}</Text>
            <Text style={s.reciterName} numberOfLines={1}>{currentReciter.name}</Text>
          </View>

          {/* Time */}
          <Text style={s.timeText}>
            {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
          </Text>

          {/* Controls */}
          <View style={s.controls}>
            <Pressable style={s.ctrlBtn} onPress={playPrevSurah} hitSlop={8}>
              <MaterialIcons name="skip-previous" size={22} color={Colors.textSecondary} />
            </Pressable>
            <Pressable style={s.playBtn} onPress={togglePlayPause} hitSlop={8}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <MaterialIcons
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={22}
                  color={Colors.textInverse}
                />
              )}
            </Pressable>
            <Pressable style={s.ctrlBtn} onPress={playNextSurah} hitSlop={8}>
              <MaterialIcons name="skip-next" size={22} color={Colors.textSecondary} />
            </Pressable>
            <Pressable style={s.ctrlBtn} onPress={stopAudio} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </Pressable>

      <QuranFullPlayer
        visible={fullPlayerVisible}
        onClose={() => setFullPlayerVisible(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    ...Shadow.md,
  },
  progressTrack: {
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  info: { flex: 1 },
  surahName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
    includeFontPadding: false,
  },
  reciterName: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    includeFontPadding: false,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
    minWidth: 80,
    textAlign: 'center',
    includeFontPadding: false,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctrlBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

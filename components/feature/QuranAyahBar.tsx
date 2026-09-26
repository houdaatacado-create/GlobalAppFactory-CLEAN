// Powered by OnSpace.AI
// Quran Ayah-by-Ayah Controls Bar
// Shown at the bottom of the Surah screen when تلاوة آية بآية is active.
// Displays current ayah, repeat mode selector, and prev/play/next controls.

import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { useQuranAudio } from '../../hooks/useQuranAudio';
import { SURAH_NAMES_AR } from '../../services/quranAudioService';
import { AYAH_REPEAT_MODE_OPTIONS, AyahRepeatMode } from '../../services/quranAudioService';

interface Props {
  surahNumber: number;
  totalAyahs: number;
}

export function QuranAyahBar({ surahNumber, totalAyahs }: Props) {
  const insets = useSafeAreaInsets();
  const {
    ayahMode,
    currentAyahNumber,
    ayahPlaybackState,
    ayahRepeatMode,
    setAyahRepeatMode,
    toggleAyahPlayPause,
    playNextAyah,
    playPrevAyah,
    stopAyahMode,
    currentReciter,
    toggleAyahMode,
  } = useQuranAudio();

  if (!ayahMode) return null;

  const isLoading = ayahPlaybackState === 'loading';
  const isPlaying = ayahPlaybackState === 'playing';
  const isError   = ayahPlaybackState === 'error';
  const surahName = SURAH_NAMES_AR[surahNumber - 1] || `سورة ${surahNumber}`;

  const handleRepeatPress = useCallback((mode: AyahRepeatMode) => {
    setAyahRepeatMode(mode);
  }, [setAyahRepeatMode]);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Header row: mode label + reciter + close */}
      <View style={styles.headerRow}>
        <View style={styles.modeBadge}>
          <MaterialIcons name="format-list-numbered" size={12} color={Colors.gold} />
          <Text style={styles.modeLabel}>تلاوة آية بآية</Text>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.surahInfo} numberOfLines={1}>
            سورة {surahName}
          </Text>
          {currentReciter ? (
            <Text style={styles.reciterInfo} numberOfLines={1}>{currentReciter.name}</Text>
          ) : null}
        </View>

        <Pressable style={styles.closeBtn} onPress={stopAyahMode} hitSlop={8}>
          <MaterialIcons name="close" size={16} color={Colors.textMuted} />
        </Pressable>
      </View>

      {/* Ayah counter */}
      <View style={styles.ayahCounterRow}>
        <Text style={styles.ayahCounter}>
          الآية
        </Text>
        <View style={styles.ayahNumBubble}>
          <Text style={styles.ayahNumText}>{currentAyahNumber}</Text>
        </View>
        <Text style={styles.ayahTotal}>/ {totalAyahs}</Text>

        {/* Progress dots (for short surahs) */}
        {totalAyahs <= 30 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dotsScroll}
            contentContainerStyle={styles.dotsRow}
          >
            {Array.from({ length: totalAyahs }, (_, i) => i + 1).map(n => (
              <View
                key={n}
                style={[
                  styles.dot,
                  n === currentAyahNumber && styles.dotActive,
                  n < currentAyahNumber && styles.dotDone,
                ]}
              />
            ))}
          </ScrollView>
        ) : (
          /* For long surahs: show a mini progress bar */
          <View style={styles.miniProgressTrack}>
            <View
              style={[
                styles.miniProgressFill,
                { width: `${(currentAyahNumber / totalAyahs) * 100}%` as any },
              ]}
            />
          </View>
        )}
      </View>

      {/* Repeat mode selector */}
      <View style={styles.repeatRow}>
        <MaterialIcons name="repeat" size={14} color={Colors.textMuted} />
        <Text style={styles.repeatLabel}>تكرار الآية:</Text>
        {AYAH_REPEAT_MODE_OPTIONS.map(opt => (
          <Pressable
            key={opt.mode}
            style={[styles.repeatChip, ayahRepeatMode === opt.mode && styles.repeatChipActive]}
            onPress={() => handleRepeatPress(opt.mode)}
          >
            <Text
              style={[styles.repeatChipText, ayahRepeatMode === opt.mode && styles.repeatChipTextActive]}
            >
              {opt.labelAr}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.ctrlBtn, currentAyahNumber <= 1 && styles.ctrlBtnDisabled]}
          onPress={playPrevAyah}
          disabled={currentAyahNumber <= 1}
          hitSlop={10}
        >
          <MaterialIcons
            name="skip-previous"
            size={28}
            color={currentAyahNumber <= 1 ? Colors.textMuted : Colors.textSecondary}
          />
        </Pressable>

        <Pressable style={styles.playBtn} onPress={toggleAyahPlayPause} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : isError ? (
            <MaterialIcons name="error-outline" size={24} color={Colors.textInverse} />
          ) : (
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={28}
              color={Colors.textInverse}
            />
          )}
        </Pressable>

        <Pressable
          style={[styles.ctrlBtn, currentAyahNumber >= totalAyahs && styles.ctrlBtnDisabled]}
          onPress={playNextAyah}
          disabled={currentAyahNumber >= totalAyahs}
          hitSlop={10}
        >
          <MaterialIcons
            name="skip-next"
            size={28}
            color={currentAyahNumber >= totalAyahs ? Colors.textMuted : Colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Error message */}
      {isError ? (
        <View style={styles.errorRow}>
          <MaterialIcons name="wifi-off" size={13} color={Colors.error} />
          <Text style={styles.errorText}>تعذّر تحميل الآية — تحقق من الاتصال</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 8,
    ...Shadow.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  modeLabel: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahInfo: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  reciterInfo: {
    fontSize: 10,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ayahCounter: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  ayahNumBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.extrabold,
    color: Colors.textInverse,
    includeFontPadding: false,
  },
  ayahTotal: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  dotsScroll: {
    flex: 1,
    maxHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.gold,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotDone: {
    backgroundColor: Colors.primary,
  },
  miniProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  repeatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  repeatChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 32,
    alignItems: 'center',
  },
  repeatChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  repeatChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  repeatChipTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: 4,
  },
  ctrlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnDisabled: {
    opacity: 0.35,
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
    paddingBottom: 4,
  },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    includeFontPadding: false,
  },
});

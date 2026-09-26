// Powered by OnSpace.AI
// Quran Full Player — Expanded audio player modal
// Controls: play/pause, seek, next/prev, repeat, sleep timer, favorite

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { useQuranAudio } from '../../hooks/useQuranAudio';
import {
  SURAH_NAMES_AR, RepeatMode, SleepTimer,
  REPEAT_MODE_LABELS, SLEEP_TIMER_LABELS,
} from '../../services/quranAudioService';
import { SURAHS_LIST } from '../../services/quranService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ProgressBar({
  position, duration, onSeek,
}: { position: number; duration: number; onSeek: (s: number) => void }) {
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <View style={pb.wrap}>
      <Pressable
        style={pb.track}
        onPress={e => {
          const { locationX, target } = e.nativeEvent;
          // Approximate — real implementation uses layout measurement
          const width = 300; // approximate
          const ratio = Math.max(0, Math.min(locationX / width, 1));
          onSeek(ratio * duration);
        }}
      >
        <View style={pb.fill} pointerEvents="none">
          <View style={[pb.filled, { width: `${progress * 100}%` as any }]} />
          <View style={[pb.thumb, { left: `${progress * 100}%` as any }]} />
        </View>
      </Pressable>
      <View style={pb.timeRow}>
        <Text style={pb.timeText}>{formatTime(position)}</Text>
        <Text style={pb.timeText}>-{formatTime(Math.max(0, duration - position))}</Text>
      </View>
    </View>
  );
}

const pb = StyleSheet.create({
  wrap: { width: '100%', paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  track: { width: '100%', height: 20, justifyContent: 'center' },
  fill: { position: 'relative', height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'visible' },
  filled: { position: 'absolute', left: 0, top: 0, height: '100%', backgroundColor: Colors.gold, borderRadius: 2 },
  thumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gold, marginLeft: -8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  timeText: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
});

// ─── REPEAT BUTTON ────────────────────────────────────────────────────────────

function RepeatButton() {
  const { repeatMode, setRepeatMode } = useQuranAudio();
  const CYCLE: RepeatMode[] = ['none', 'surah', 'once', 'three', 'five', 'ten', 'infinite'];

  const handlePress = () => {
    const idx = CYCLE.indexOf(repeatMode);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setRepeatMode(next);
  };

  const label = REPEAT_MODE_LABELS[repeatMode].ar;
  const active = repeatMode !== 'none';

  return (
    <Pressable style={[fp.ctrlSmallBtn, active && fp.ctrlSmallBtnActive]} onPress={handlePress}>
      <MaterialIcons name="repeat" size={16} color={active ? Colors.gold : Colors.textMuted} />
      <Text style={[fp.ctrlSmallText, active && { color: Colors.gold }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

// ─── SLEEP TIMER BUTTON ───────────────────────────────────────────────────────

function SleepTimerButton() {
  const { sleepTimer, setSleepTimer } = useQuranAudio();
  const CYCLE: SleepTimer[] = ['off', '5m', '10m', '15m', '30m', '45m', '60m'];

  const handlePress = () => {
    const idx = CYCLE.indexOf(sleepTimer);
    setSleepTimer(CYCLE[(idx + 1) % CYCLE.length]);
  };

  const active = sleepTimer !== 'off';
  const label = SLEEP_TIMER_LABELS[sleepTimer].ar;

  return (
    <Pressable style={[fp.ctrlSmallBtn, active && fp.ctrlSmallBtnActive]} onPress={handlePress}>
      <MaterialIcons name="bedtime" size={16} color={active ? Colors.gold : Colors.textMuted} />
      <Text style={[fp.ctrlSmallText, active && { color: Colors.gold }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

// ─── SURAH SELECTOR ───────────────────────────────────────────────────────────

function SurahList({ onSelect, currentSurah }: { onSelect: (n: number) => void; currentSurah: number }) {
  return (
    <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
      {SURAHS_LIST.map(s => (
        <Pressable
          key={s.number}
          style={[fp.surahRow, currentSurah === s.number && fp.surahRowActive]}
          onPress={() => onSelect(s.number)}
        >
          <View style={[fp.surahNum, currentSurah === s.number && fp.surahNumActive]}>
            <Text style={[fp.surahNumText, currentSurah === s.number && { color: Colors.textInverse }]}>
              {s.number}
            </Text>
          </View>
          <Text style={[fp.surahName, currentSurah === s.number && { color: Colors.gold }]}>
            {s.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── FULL PLAYER ──────────────────────────────────────────────────────────────

export function QuranFullPlayer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const {
    currentReciter, currentMoshaf, currentSurah,
    playbackState, positionSeconds, durationSeconds,
    togglePlayPause, seekTo,
    playNextSurah, playPrevSurah, playSurah,
    favoriteReciterIds, toggleFavoriteReciter,
    autoplayNext, setAutoplayNext,
    errorMessage,
  } = useQuranAudio();

  const [showSurahList, setShowSurahList] = useState(false);

  const isLoading = playbackState === 'loading';
  const isPlaying = playbackState === 'playing';
  const isError = playbackState === 'error';
  const surahName = SURAH_NAMES_AR[currentSurah - 1] || `سورة ${currentSurah}`;
  const isFav = currentReciter ? favoriteReciterIds.includes(currentReciter.id) : false;

  const handleSurahSelect = useCallback((n: number) => {
    setShowSurahList(false);
    if (currentReciter && currentMoshaf) {
      playSurah(n);
    }
  }, [currentReciter, currentMoshaf, playSurah]);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <LinearGradient
        colors={[Colors.surfaceElevated, Colors.background, '#020805']}
        style={[fp.container, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={fp.header}>
          <Pressable style={fp.headerBtn} onPress={onClose}>
            <MaterialIcons name="keyboard-arrow-down" size={28} color={Colors.textSecondary} />
          </Pressable>
          <Text style={fp.headerTitle}>القرآن الكريم</Text>
          <Pressable
            style={fp.headerBtn}
            onPress={() => currentReciter && toggleFavoriteReciter(currentReciter.id)}
          >
            <MaterialIcons
              name={isFav ? 'favorite' : 'favorite-border'}
              size={22}
              color={isFav ? '#EF4444' : Colors.textMuted}
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={fp.scrollContent}
        >
          {/* Album art / surah display */}
          <View style={fp.artWrap}>
            <LinearGradient
              colors={['#0a2a15', '#051a0c']}
              style={fp.art}
            >
              <Text style={fp.artSurahNum}>{currentSurah}</Text>
              <Text style={fp.artSurahName}>سورة {surahName}</Text>
            </LinearGradient>
          </View>

          {/* Track info */}
          <View style={fp.trackInfo}>
            <Pressable onPress={() => setShowSurahList(!showSurahList)} style={fp.surahTitleRow}>
              <Text style={fp.trackSurah}>سورة {surahName}</Text>
              <MaterialIcons name={showSurahList ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={Colors.textMuted} />
            </Pressable>
            <Text style={fp.trackReciter}>{currentReciter?.name || 'اختر قارئاً'}</Text>
            {currentMoshaf && (
              <Text style={fp.trackRiwaya}>{currentMoshaf.name}</Text>
            )}
          </View>

          {/* Surah list dropdown */}
          {showSurahList && (
            <View style={fp.surahListWrap}>
              <SurahList onSelect={handleSurahSelect} currentSurah={currentSurah} />
            </View>
          )}

          {/* Error */}
          {isError && errorMessage ? (
            <View style={fp.errorWrap}>
              <MaterialIcons name="error-outline" size={16} color={Colors.error} />
              <Text style={fp.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Progress */}
          <ProgressBar
            position={positionSeconds}
            duration={durationSeconds}
            onSeek={seekTo}
          />

          {/* Main controls */}
          <View style={fp.controls}>
            <Pressable style={fp.ctrlBtn} onPress={playPrevSurah} hitSlop={12}>
              <MaterialIcons name="skip-previous" size={32} color={Colors.textSecondary} />
            </Pressable>

            <Pressable style={fp.playBtn} onPress={togglePlayPause} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="large" color={Colors.textInverse} />
              ) : (
                <MaterialIcons
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={36}
                  color={Colors.textInverse}
                />
              )}
            </Pressable>

            <Pressable style={fp.ctrlBtn} onPress={playNextSurah} hitSlop={12}>
              <MaterialIcons name="skip-next" size={32} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Extra controls row */}
          <View style={fp.extraControls}>
            <RepeatButton />
            <SleepTimerButton />
            <Pressable
              style={[fp.ctrlSmallBtn, autoplayNext && fp.ctrlSmallBtnActive]}
              onPress={() => setAutoplayNext(!autoplayNext)}
            >
              <MaterialIcons name="playlist-play" size={16} color={autoplayNext ? Colors.gold : Colors.textMuted} />
              <Text style={[fp.ctrlSmallText, autoplayNext && { color: Colors.gold }]}>
                {autoplayNext ? 'تشغيل تلقائي' : 'بدون تشغيل تلقائي'}
              </Text>
            </Pressable>
          </View>

          {/* Surah navigation chips */}
          <View style={fp.navChips}>
            {[
              { n: Math.max(1, currentSurah - 2), label: SURAH_NAMES_AR[Math.max(0, currentSurah - 3)] },
              { n: Math.max(1, currentSurah - 1), label: SURAH_NAMES_AR[Math.max(0, currentSurah - 2)] },
              { n: currentSurah, label: SURAH_NAMES_AR[currentSurah - 1], current: true },
              { n: Math.min(114, currentSurah + 1), label: SURAH_NAMES_AR[Math.min(113, currentSurah)] },
              { n: Math.min(114, currentSurah + 2), label: SURAH_NAMES_AR[Math.min(113, currentSurah + 1)] },
            ].filter((c, i, arr) => arr.findIndex(x => x.n === c.n) === i).map(chip => (
              <Pressable
                key={chip.n}
                style={[fp.navChip, chip.current && fp.navChipActive]}
                onPress={() => !chip.current && handleSurahSelect(chip.n)}
              >
                <Text style={[fp.navChipText, chip.current && fp.navChipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Offline placeholder */}
          <View style={fp.offlineBanner}>
            <MaterialIcons name="download-for-offline" size={16} color={Colors.textMuted} />
            <Text style={fp.offlineBannerText}>
              تحميل للاستماع بدون إنترنت — قريباً
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const fp = StyleSheet.create({
  container:       { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 10 },
  headerBtn:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  scrollContent:   { alignItems: 'center', paddingBottom: 40 },
  artWrap:         { marginTop: Spacing.lg, marginBottom: Spacing.md },
  art:             { width: 220, height: 220, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  artSurahNum:     { fontSize: 40, fontWeight: FontWeight.bold, color: Colors.gold, marginBottom: 8, includeFontPadding: false },
  artSurahName:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', includeFontPadding: false },
  trackInfo:       { alignItems: 'center', paddingHorizontal: Spacing.xl, gap: 4, width: '100%' },
  surahTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trackSurah:      { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center', includeFontPadding: false },
  trackReciter:    { fontSize: FontSize.body, color: Colors.textSecondary, textAlign: 'center', includeFontPadding: false },
  trackRiwaya:     { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  errorWrap:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.error + '22', borderRadius: BorderRadius.md, padding: Spacing.sm, marginHorizontal: Spacing.xl, marginTop: 8 },
  errorText:       { flex: 1, fontSize: FontSize.sm, color: Colors.error, textAlign: 'right' },
  controls:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.lg },
  ctrlBtn:         { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  playBtn:         { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 }, android: { elevation: 8 } }) },
  extraControls:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: Spacing.md, flexWrap: 'wrap', paddingHorizontal: Spacing.md },
  ctrlSmallBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border },
  ctrlSmallBtnActive: { borderColor: Colors.gold + '55', backgroundColor: Colors.gold + '15' },
  ctrlSmallText:   { fontSize: 11, color: Colors.textMuted, maxWidth: 80 },
  navChips:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  navChip:         { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  navChipActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navChipText:     { fontSize: FontSize.sm, color: Colors.textSecondary },
  navChipTextActive:{ color: Colors.textPrimary, fontWeight: FontWeight.bold },
  offlineBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.xl, paddingHorizontal: Spacing.xl },
  offlineBannerText:{ fontSize: FontSize.sm, color: Colors.textMuted },
  surahListWrap:   { width: '100%', backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, marginTop: 8, marginHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  surahRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  surahRowActive:  { backgroundColor: Colors.overlayLight },
  surahNum:        { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  surahNumActive:  { backgroundColor: Colors.gold, borderColor: Colors.gold },
  surahNumText:    { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textMuted, includeFontPadding: false },
  surahName:       { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, textAlign: 'right' },
});

// Powered by OnSpace.AI
// Quran Surah Reader Screen — full-surah audio + آية بآية mode
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Modal, ViewToken,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../hooks/useApp';
import { useQuranAudio } from '../../hooks/useQuranAudio';
import {
  SURAHS_LIST, fetchSurah, fetchSurahTranslation,
  SurahWithAyahs, Ayah, TranslationAyah, TRANSLATION_EDITIONS,
} from '../../services/quranService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { QuranMiniPlayer } from '../../components/feature/QuranMiniPlayer';
import { QuranAyahBar } from '../../components/feature/QuranAyahBar';
import { ReciterSelector } from '../../components/feature/ReciterSelector';
import { QuranReciter, QuranMoshaf } from '../../services/quranAudioService';

interface AyahWithTranslation extends Ayah {
  translation?: string;
}

export default function SurahScreen() {
  const insets = useSafeAreaInsets();
  const { surah: surahParam } = useLocalSearchParams<{ surah: string }>();
  const surahNumber = parseInt(surahParam || '1', 10);
  const { t, language, isRTL } = useLanguage();
  const { updatePrefs } = useApp();
  const router = useRouter();

  const {
    playSurah,
    currentReciter,
    currentSurah: playingSurah,
    playbackState,
    playerVisible,
    togglePlayPause,
    // ayah mode
    ayahMode,
    toggleAyahMode,
    currentAyahNumber,
    ayahPlaybackState,
    playAyah,
    stopAyahMode,
  } = useQuranAudio();

  const [data, setData] = useState<SurahWithAyahs | null>(null);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(language !== 'ar');
  const [fontSize, setFontSize] = useState(22);
  const [selectedAyah, setSelectedAyah] = useState<AyahWithTranslation | null>(null);
  const [reciterSelectorVisible, setReciterSelectorVisible] = useState(false);

  const surahInfo = SURAHS_LIST[surahNumber - 1];
  const totalAyahs = surahInfo?.numberOfAyahs ?? 1;

  // FlatList ref for auto-scroll
  const flatListRef = useRef<FlatList<AyahWithTranslation>>(null);

  // ── Load surah ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadSurah();
    updatePrefs({ lastQuranSurah: surahNumber });
  }, [surahNumber]);

  const loadSurah = async () => {
    setLoading(true);
    try {
      const [surahData, transData] = await Promise.all([
        fetchSurah(surahNumber),
        fetchSurahTranslation(surahNumber, TRANSLATION_EDITIONS[language] || 'en.asad'),
      ]);
      if (surahData) setData(surahData);
      if (transData) setTranslations(transData);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-scroll to highlighted ayah in ayah mode ──────────────────────────
  useEffect(() => {
    if (!ayahMode || !flatListRef.current || !data) return;
    // Scroll to ayah index (0-based)
    const index = currentAyahNumber - 1;
    if (index >= 0 && index < (data.ayahs?.length ?? 0)) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3, // 30% from top — ayah stays in upper-middle
        });
      } catch { /* ignore out-of-range */ }
    }
  }, [currentAyahNumber, ayahMode, data]);

  // ── Audio handlers ────────────────────────────────────────────────────────
  const handleListenPress = useCallback(() => {
    if (ayahMode) {
      // In ayah mode, the listen button does nothing (AyahBar has its own controls)
      return;
    }
    if (currentReciter) {
      if (playingSurah === surahNumber && (playbackState === 'playing' || playbackState === 'paused')) {
        togglePlayPause();
      } else {
        playSurah(surahNumber);
      }
    } else {
      setReciterSelectorVisible(true);
    }
  }, [ayahMode, currentReciter, playSurah, surahNumber, playingSurah, playbackState, togglePlayPause]);

  const handleReciterSelect = useCallback((reciter: QuranReciter, moshaf: QuranMoshaf) => {
    playSurah(surahNumber, reciter, moshaf);
  }, [playSurah, surahNumber]);

  // Tap on ayah number badge — start ayah-by-ayah from that ayah
  const handleAyahTap = useCallback((ayahNumber: number) => {
    if (currentReciter) {
      playAyah(surahNumber, ayahNumber);
    } else {
      setReciterSelectorVisible(true);
    }
  }, [currentReciter, playAyah, surahNumber]);

  // Toggle ayah mode button
  const handleToggleAyahMode = useCallback(() => {
    if (ayahMode) {
      stopAyahMode();
    } else {
      // Start ayah mode from ayah 1 (or current if available)
      if (currentReciter) {
        playAyah(surahNumber, 1);
      } else {
        setReciterSelectorVisible(true);
      }
    }
  }, [ayahMode, stopAyahMode, currentReciter, playAyah, surahNumber]);

  const isThisSurahPlaying  = playingSurah === surahNumber && playbackState === 'playing';
  const isThisSurahLoading  = playingSurah === surahNumber && playbackState === 'loading';
  const isAyahModeActive    = ayahMode;
  const isAyahPlaying       = ayahPlaybackState === 'playing';
  const isAyahLoading       = ayahPlaybackState === 'loading';

  // Header listen button — changes label based on active mode
  let listenBtnIcon: string;
  let listenBtnLabel: string;
  if (isAyahModeActive) {
    listenBtnIcon  = isAyahPlaying ? 'pause' : isAyahLoading ? 'hourglass-empty' : 'format-list-numbered';
    listenBtnLabel = isAyahPlaying ? 'إيقاف' : isAyahLoading ? 'تحميل...' : 'آية بآية';
  } else {
    listenBtnIcon  = isThisSurahPlaying ? 'pause' : isThisSurahLoading ? 'hourglass-empty' : 'headphones';
    listenBtnLabel = isThisSurahPlaying ? 'إيقاف'  : isThisSurahLoading ? 'تحميل...' : 'استمع';
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const ayahs: AyahWithTranslation[] = (data?.ayahs || []).map(a => ({
    ...a,
    translation: translations.find(tr => tr.numberInSurah === a.numberInSurah)?.text,
  }));

  const renderAyah = ({ item }: { item: AyahWithTranslation }) => {
    const isActiveAyah = ayahMode && item.numberInSurah === currentAyahNumber;
    const isDoneAyah   = ayahMode && item.numberInSurah < currentAyahNumber;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.ayahRow,
          isActiveAyah && styles.ayahRowActive,
          isDoneAyah && styles.ayahRowDone,
          pressed && styles.pressed,
        ]}
        onLongPress={() => setSelectedAyah(item)}
      >
        {/* Ayah number badge — tap to start ayah-by-ayah from here */}
        <Pressable
          style={[
            styles.verseNum,
            isActiveAyah && styles.verseNumActive,
            isDoneAyah && styles.verseNumDone,
          ]}
          onPress={() => handleAyahTap(item.numberInSurah)}
          hitSlop={6}
        >
          {isActiveAyah ? (
            isAyahLoading ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : isAyahPlaying ? (
              <MaterialIcons name="volume-up" size={14} color={Colors.textInverse} />
            ) : (
              <Text style={[styles.verseNumText, styles.verseNumTextActive]}>
                {item.numberInSurah}
              </Text>
            )
          ) : (
            <Text style={[styles.verseNumText, isDoneAyah && styles.verseNumTextDone]}>
              {item.numberInSurah}
            </Text>
          )}
        </Pressable>

        {/* Ayah text */}
        <View style={styles.ayahContent}>
          <Text
            style={[
              styles.arabicText,
              { fontSize },
              isActiveAyah && styles.arabicTextActive,
              isDoneAyah && styles.arabicTextDone,
            ]}
          >
            {item.text}
          </Text>
          {showTranslation && item.translation ? (
            <Text style={[styles.translationText, isRTL && styles.textRight]}>
              {item.translation}
            </Text>
          ) : null}
        </View>

        {/* Pulse indicator on active ayah */}
        {isActiveAyah && isAyahPlaying ? (
          <View style={styles.activePulse} />
        ) : null}
      </Pressable>
    );
  };

  // Bottom inset: ayah bar is taller than mini player
  const bottomPad = ayahMode ? 210 : playerVisible ? 130 : 80;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={[styles.headerCenter, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.surahNameAr}>{surahInfo?.name}</Text>
          <Text style={styles.surahNameEn}>{surahInfo?.englishName}</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Full-surah listen button (hidden in ayah mode) */}
          {!ayahMode ? (
            <Pressable style={styles.listenBtn} onPress={handleListenPress}>
              <MaterialIcons name={listenBtnIcon as any} size={15} color={Colors.textInverse} />
              <Text style={styles.listenBtnText}>{listenBtnLabel}</Text>
            </Pressable>
          ) : null}

          {/* آية بآية toggle */}
          <Pressable
            style={[styles.ayahModeBtn, ayahMode && styles.ayahModeBtnActive]}
            onPress={handleToggleAyahMode}
          >
            <MaterialIcons
              name="format-list-numbered"
              size={15}
              color={ayahMode ? Colors.textInverse : Colors.gold}
            />
            <Text style={[styles.ayahModeBtnText, ayahMode && styles.ayahModeBtnTextActive]}>
              {ayahMode ? 'إنهاء' : 'آية بآية'}
            </Text>
          </Pressable>

          {/* Reciter selector icon */}
          <Pressable style={styles.iconBtn} onPress={() => setReciterSelectorVisible(true)}>
            <MaterialIcons
              name="record-voice-over"
              size={19}
              color={currentReciter ? Colors.gold : Colors.textMuted}
            />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setShowTranslation(prev => !prev)}
          >
            <MaterialIcons
              name="translate"
              size={20}
              color={showTranslation ? Colors.gold : Colors.textMuted}
            />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setFontSize(f => Math.min(f + 2, 32))}>
            <MaterialIcons name="text-increase" size={20} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setFontSize(f => Math.max(f - 2, 16))}>
            <MaterialIcons name="text-decrease" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Mode banner */}
      {ayahMode ? (
        <View style={styles.ayahModeBanner}>
          <MaterialIcons name="format-list-numbered" size={13} color={Colors.gold} />
          <Text style={styles.ayahModeBannerText}>
            {isAyahLoading
              ? 'جارٍ تحميل الآية...'
              : `الآية ${currentAyahNumber} من ${totalAyahs} — اضغط على رقم أي آية للبدء منها`}
          </Text>
        </View>
      ) : (isThisSurahPlaying || isThisSurahLoading) && currentReciter ? (
        <View style={styles.nowPlayingBanner}>
          <MaterialIcons name="volume-up" size={14} color={Colors.gold} />
          <Text style={styles.nowPlayingText} numberOfLines={1}>
            {isThisSurahLoading ? 'جارٍ التحميل...' : `يستمع: ${currentReciter.name}`}
          </Text>
        </View>
      ) : null}

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 ? (
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
      ) : null}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={ayahs}
          renderItem={renderAyah}
          keyExtractor={a => String(a.number)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: Spacing.md }}
          initialNumToRender={15}
          onScrollToIndexFailed={info => {
            // Fallback: wait a frame then try again
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 200);
          }}
        />
      )}

      {/* Ayah Action Modal */}
      <Modal
        visible={!!selectedAyah}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAyah(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBg} onPress={() => setSelectedAyah(null)} />
          <View style={styles.actionSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.ayahPreview} numberOfLines={3}>{selectedAyah?.text}</Text>
            <View style={styles.actionsGrid}>
              {[
                {
                  icon: 'format-list-numbered',
                  label: 'استمع آية بآية',
                  onPress: () => {
                    setSelectedAyah(null);
                    if (currentReciter && selectedAyah) {
                      playAyah(surahNumber, selectedAyah.numberInSurah);
                    } else {
                      setReciterSelectorVisible(true);
                    }
                  },
                },
                { icon: 'headphones', label: 'استمع السورة', onPress: () => { setSelectedAyah(null); playSurah(surahNumber); } },
                { icon: 'translate', label: t('translation'), onPress: () => { setSelectedAyah(null); setShowTranslation(true); } },
                { icon: 'bookmark', label: t('bookmark'), onPress: () => setSelectedAyah(null) },
                { icon: 'share', label: t('share'), onPress: () => setSelectedAyah(null) },
                { icon: 'auto-awesome', label: t('askAI'), onPress: () => setSelectedAyah(null) },
              ].map(action => (
                <Pressable key={action.label} style={styles.actionBtn} onPress={action.onPress}>
                  <MaterialIcons name={action.icon as any} size={24} color={Colors.gold} />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Reciter Selector */}
      <ReciterSelector
        visible={reciterSelectorVisible}
        onClose={() => setReciterSelectorVisible(false)}
        onSelect={handleReciterSelect}
        currentSurah={surahNumber}
      />

      {/* Bottom players — Ayah bar takes priority over mini player */}
      {ayahMode ? (
        <QuranAyahBar surahNumber={surahNumber} totalAyahs={totalAyahs} />
      ) : (
        <QuranMiniPlayer />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, gap: 6 },
  rowRev:         { flexDirection: 'row-reverse' },
  textRight:      { textAlign: 'right' },
  backBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  headerCenter:   { flex: 1, alignItems: 'center' },
  surahNameAr:    { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.gold, includeFontPadding: false },
  surahNameEn:    { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  headerActions:  { flexDirection: 'row', gap: 3, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' },

  // Buttons in header
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  listenBtnText:        { fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  ayahModeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md,
    paddingHorizontal: 9, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.gold + '55',
  },
  ayahModeBtnActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  ayahModeBtnText:       { fontSize: 12, fontWeight: FontWeight.bold, color: Colors.gold, includeFontPadding: false },
  ayahModeBtnTextActive: { color: Colors.textPrimary, includeFontPadding: false },
  iconBtn:               { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },

  // Banners
  nowPlayingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: 6,
    backgroundColor: Colors.gold + '15', borderRadius: BorderRadius.md,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.gold + '44',
  },
  nowPlayingText:   { flex: 1, fontSize: 11, color: Colors.gold, textAlign: 'right', includeFontPadding: false },
  ayahModeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: 6,
    backgroundColor: Colors.primary + '20', borderRadius: BorderRadius.md,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.primary + '55',
  },
  ayahModeBannerText: { flex: 1, fontSize: 11, color: Colors.textSecondary, textAlign: 'right', includeFontPadding: false },

  // Bismillah
  bismillah: {
    fontSize: 24, fontWeight: FontWeight.bold, color: Colors.gold,
    textAlign: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    lineHeight: 38, includeFontPadding: false,
  },

  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.body, color: Colors.textMuted, includeFontPadding: false },

  // Ayah rows
  ayahRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
    position: 'relative',
  },
  ayahRowActive: {
    backgroundColor: Colors.gold + '12',
    borderBottomColor: Colors.gold + '40',
    borderRightWidth: 3,
    borderRightColor: Colors.gold,
  },
  ayahRowDone: {
    opacity: 0.6,
  },
  pressed: { backgroundColor: Colors.surfaceLight },

  activePulse: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },

  // Verse number badge
  verseNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
    flexShrink: 0, marginTop: 4,
  },
  verseNumActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  verseNumDone: {
    backgroundColor: Colors.primary + '40',
    borderColor: Colors.primary,
  },
  verseNumText: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold,
    color: Colors.gold, includeFontPadding: false,
  },
  verseNumTextActive: { color: Colors.textInverse, includeFontPadding: false },
  verseNumTextDone:   { color: Colors.primaryLight, includeFontPadding: false },

  // Ayah content
  ayahContent:     { flex: 1, gap: 8 },
  arabicText: {
    textAlign: 'right', color: Colors.textPrimary,
    lineHeight: 44, fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  arabicTextActive: { color: Colors.gold },
  arabicTextDone:   { color: Colors.textMuted },
  translationText:  { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },

  // Ayah action modal
  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBg:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  actionSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 8 },
  ayahPreview:   { fontSize: 20, textAlign: 'right', color: Colors.gold, lineHeight: 34, includeFontPadding: false },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    flex: 1, minWidth: '28%', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  actionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, includeFontPadding: false, textAlign: 'center' },
});

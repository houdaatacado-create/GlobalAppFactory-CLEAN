// Powered by OnSpace.AI
// Quran Tab - Full surah list with search
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  Pressable, ListRenderItem,
} from 'react-native';
import { QuranMiniPlayer } from '../../components/feature/QuranMiniPlayer';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../hooks/useApp';
import { SURAHS_LIST, Surah } from '../../services/quranService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { useQuranAudio } from '../../hooks/useQuranAudio';

export default function QuranTab() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const { userPrefs } = useApp();
  const router = useRouter();
  const { lastListened, playSurah, currentReciter, playerVisible } = useQuranAudio();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz'>('surahs');

  const filtered = useMemo(() => {
    if (!search.trim()) return SURAHS_LIST;
    const q = search.toLowerCase();
    return SURAHS_LIST.filter(s =>
      s.name.includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  }, [search]);

  const renderSurah: ListRenderItem<Surah> = useCallback(({ item }) => {
    const isLastRead = userPrefs.lastQuranSurah === item.number;
    return (
      <Pressable
        style={({ pressed }) => [styles.surahRow, pressed && styles.pressed, isLastRead && styles.surahRowActive]}
        onPress={() => router.push(`/quran/${item.number}` as any)}
      >
        {/* Number Badge */}
        <View style={[styles.numBadge, isLastRead && styles.numBadgeActive]}>
          <Text style={[styles.numText, isLastRead && styles.numTextActive]}>{item.number}</Text>
        </View>

        {/* Info */}
        <View style={[styles.surahInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.surahName, isRTL && styles.textRight]}>{item.name}</Text>
          <Text style={[styles.surahSub, isRTL && styles.textRight]}>
            {item.englishName} · {item.numberOfAyahs} {t('verses')} · {item.revelationType === 'Meccan' ? t('meccan') : t('medinan')}
          </Text>
        </View>

        {/* Arabic display name */}
        {isRTL ? null : (
          <Text style={styles.arabicNameRight}>{item.name}</Text>
        )}

        {isLastRead ? (
          <View style={styles.lastReadBadge}>
            <MaterialIcons name="bookmark" size={12} color={Colors.textInverse} />
          </View>
        ) : null}
      </Pressable>
    );
  }, [isRTL, userPrefs.lastQuranSurah, t]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.textRight]}>{t('quranSection')}</Text>
        <Text style={styles.subtitle}>القرآن الكريم</Text>
      </View>

      {/* Last Read Banner */}
      {userPrefs.lastQuranSurah > 0 ? (
        <Pressable
          style={styles.lastReadBanner}
          onPress={() => router.push(`/quran/${userPrefs.lastQuranSurah}` as any)}
        >
          <View style={[styles.bannerLeft, isRTL && styles.rowRev]}>
            <MaterialIcons name="bookmark" size={20} color={Colors.gold} />
            <View>
              <Text style={styles.bannerLabel}>{t('lastRead')}</Text>
              <Text style={styles.bannerSurah}>
                {SURAHS_LIST[userPrefs.lastQuranSurah - 1]?.name} - {t('surah')} {userPrefs.lastQuranSurah}
              </Text>
            </View>
          </View>
          <View style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>{t('continuereading')}</Text>
            <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={Colors.textInverse} />
          </View>
        </Pressable>
      ) : null}

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, isRTL && styles.rowRev]}>
          <MaterialIcons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
            placeholder={t('searchQuran')}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['surahs', 'juz'] as const).map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab === 'surahs' ? t('allSurahs') : t('byJuz')}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Resume listening banner */}
      {lastListened && currentReciter && lastListened.positionSeconds > 30 ? (
        <Pressable
          style={styles.resumeBanner}
          onPress={() => playSurah(lastListened.surah)}
        >
          <MaterialIcons name="headphones" size={18} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeLabel}>متابعة الاستماع</Text>
            <Text style={styles.resumeSurah}>
              سورة {SURAHS_LIST[lastListened.surah - 1]?.name} — {currentReciter.name}
            </Text>
          </View>
          <MaterialIcons name="play-circle-filled" size={28} color={Colors.gold} />
        </Pressable>
      ) : null}

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderSurah}
        keyExtractor={s => String(s.number)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: playerVisible ? 130 : 80 }}
        initialNumToRender={20}
      />

      {/* Mini Player */}
      <QuranMiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, includeFontPadding: false },
  subtitle: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.semibold, marginTop: 2, includeFontPadding: false },
  textRight: { textAlign: 'right' },
  rowRev: { flexDirection: 'row-reverse' },
  lastReadBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bannerLabel: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  bannerSurah: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textPrimary, includeFontPadding: false },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  continueBtnText: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.semibold, includeFontPadding: false },
  searchWrap: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, includeFontPadding: false },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium, includeFontPadding: false },
  tabBtnTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  surahRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  pressed: { backgroundColor: Colors.surfaceLight },
  surahRowActive: { backgroundColor: Colors.overlayLight },
  numBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  numBadgeActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  numText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary, includeFontPadding: false },
  numTextActive: { color: Colors.textInverse },
  surahInfo: { flex: 1, gap: 2 },
  surahName: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textPrimary, includeFontPadding: false },
  surahSub: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  arabicNameRight: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.gold, includeFontPadding: false },
  resumeBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.gold + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
  },
  resumeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  resumeSurah: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right', includeFontPadding: false },
  lastReadBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
});

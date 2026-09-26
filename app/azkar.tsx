// Powered by OnSpace.AI
// Azkar Screen with counter
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../hooks/useLanguage';
import { AZKAR_DATA, AzkarCategory, Dhikr } from '../services/azkarService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

const CATEGORY_LABELS: Record<AzkarCategory, string> = {
  morning: 'morningAzkar',
  evening: 'eveningAzkar',
  sleep: 'sleepAzkar',
  afterPrayer: 'afterPrayer',
  travel: 'travelAzkar',
  mosque: 'azkarSection',
  food: 'azkarSection',
  rain: 'azkarSection',
  hardship: 'azkarSection',
};

const CATEGORY_ICONS: Record<AzkarCategory, keyof typeof MaterialIcons.glyphMap> = {
  morning: 'wb-twilight',
  evening: 'nights-stay',
  sleep: 'bedtime',
  afterPrayer: 'mosque',
  travel: 'flight',
  mosque: 'account-balance',
  food: 'restaurant',
  rain: 'water-drop',
  hardship: 'favorite',
};

function DhikrCard({ dhikr, lang, isRTL }: { dhikr: Dhikr; lang: string; isRTL: boolean }) {
  const [count, setCount] = useState(0);
  const isDone = count >= dhikr.repeatCount;

  const translation = dhikr.translations[lang] || dhikr.translations['en'] || '';
  const transliteration = dhikr.transliterations['en'] || '';

  return (
    <View style={[styles.dhikrCard, isDone && styles.dhikrCardDone]}>
      <Text style={[styles.arabicText, styles.textRight]}>{dhikr.arabicText}</Text>
      {transliteration ? (
        <Text style={[styles.translitText, isRTL ? styles.textRight : styles.textLeft]}>{transliteration}</Text>
      ) : null}
      {translation && lang !== 'ar' ? (
        <Text style={[styles.translationText, isRTL ? styles.textRight : styles.textLeft]}>{translation}</Text>
      ) : null}
      <Text style={[styles.sourceText, isRTL ? styles.textRight : styles.textLeft]}>{dhikr.source}</Text>

      {/* Counter */}
      <View style={[styles.counterRow, isRTL && styles.rowRev]}>
        <Text style={styles.countTarget}>
          {count}/{dhikr.repeatCount}
        </Text>
        <View style={[styles.counterBtns, isRTL && styles.rowRev]}>
          <Pressable style={styles.resetBtn} onPress={() => setCount(0)}>
            <MaterialIcons name="refresh" size={16} color={Colors.textMuted} />
          </Pressable>
          <Pressable
            style={[styles.countBtn, isDone && styles.countBtnDone]}
            onPress={() => !isDone && setCount(c => c + 1)}
          >
            {isDone ? (
              <MaterialIcons name="check" size={20} color={Colors.textInverse} />
            ) : (
              <Text style={styles.countBtnText}>{count}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function AzkarScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<AzkarCategory>('morning');

  const currentAzkar = AZKAR_DATA.find(g => g.category === activeCategory)?.dhikrList || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('azkarSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Category Bar */}
      <View style={styles.catBarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
          {AZKAR_DATA.map(group => (
            <Pressable
              key={group.category}
              style={[styles.catChip, activeCategory === group.category && styles.catChipActive]}
              onPress={() => setActiveCategory(group.category)}
            >
              <MaterialIcons
                name={CATEGORY_ICONS[group.category]}
                size={14}
                color={activeCategory === group.category ? Colors.textInverse : Colors.textSecondary}
              />
              <Text style={[styles.catText, activeCategory === group.category && styles.catTextActive]}>
                {t(CATEGORY_LABELS[group.category] as any)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Dhikr List */}
      <FlatList
        data={currentAzkar}
        renderItem={({ item }) => (
          <DhikrCard dhikr={item} lang={language} isRTL={isRTL} />
        )}
        keyExtractor={d => String(d.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  rowRev: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  catBarWrap: { marginBottom: Spacing.sm },
  catContent: { paddingHorizontal: Spacing.md, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  catTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  listContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 80 },
  dhikrCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: Spacing.md, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  dhikrCardDone: { borderColor: Colors.gold + '60' },
  arabicText: {
    fontSize: 22, fontWeight: FontWeight.bold, color: Colors.textPrimary,
    lineHeight: 36, includeFontPadding: false,
  },
  translitText: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 20, includeFontPadding: false },
  translationText: { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 24, includeFontPadding: false },
  sourceText: { fontSize: FontSize.xs, color: Colors.gold, includeFontPadding: false },
  counterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4,
  },
  countTarget: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.gold, includeFontPadding: false },
  counterBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resetBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  countBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6,
    elevation: 4,
  },
  countBtnDone: { backgroundColor: Colors.gold },
  countBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, includeFontPadding: false },
});

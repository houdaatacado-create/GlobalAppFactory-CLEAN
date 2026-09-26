// Powered by OnSpace.AI
// Learn Islam — Category List Screen with per-category progress bars
import React from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { LEARN_CATEGORIES, LessonCategory } from '../../services/learnService';
import { useLearnProgress } from '../../hooks/useLearnProgress';

export default function LearnIndexScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const { categoryProgress, loaded } = useLearnProgress();

  const handleCategoryPress = (category: LessonCategory) => {
    router.push(`/learn/${category.id}`);
  };

  const renderCategory = ({ item }: { item: LessonCategory }) => {
    const { completed, total } = categoryProgress(item.id);
    const pct = total > 0 ? completed / total : 0;
    const isDone = completed === total && total > 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.pathCard,
          isRTL && styles.pathCardRTL,
          pressed && styles.pressed,
        ]}
        onPress={() => handleCategoryPress(item)}
        android_ripple={{ color: Colors.gold + '22', borderless: false }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={language === 'ar' ? item.ar : item.en}
      >
        {/* Color-coded icon */}
        <View style={[styles.pathIcon, { backgroundColor: item.color + '22' }]}>
          <MaterialIcons name={item.icon as any} size={26} color={item.color} />
          {/* Done overlay */}
          {isDone && (
            <View style={styles.doneBadge}>
              <MaterialIcons name="check" size={10} color={Colors.textInverse} />
            </View>
          )}
        </View>

        {/* Text + progress */}
        <View style={[styles.pathInfo, isRTL && styles.pathInfoRTL]}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Text style={[styles.pathTitle, isRTL && styles.textRight]}>
              {language === 'ar' ? item.ar : item.en}
            </Text>
            {isDone && (
              <View style={styles.completedChip}>
                <MaterialIcons name="check-circle" size={11} color={Colors.success} />
                <Text style={styles.completedChipText}>
                  {language === 'ar' ? 'مكتمل' : 'Done'}
                </Text>
              </View>
            )}
          </View>

          {/* Progress label */}
          <Text style={[styles.pathSub, isRTL && styles.textRight]}>
            {loaded
              ? (language === 'ar'
                  ? `${completed} / ${total} درس`
                  : `${completed} / ${total} lessons`)
              : `${total} ${language === 'ar' ? 'درس' : 'lessons'}`}
          </Text>

          {/* Progress bar */}
          {loaded && total > 0 && (
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.round(pct * 100)}%` as any,
                    backgroundColor: isDone ? Colors.success : item.color,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Arrow — flipped for RTL */}
        <MaterialIcons
          name={isRTL ? 'chevron-left' : 'chevron-right'}
          size={22}
          color={Colors.gold}
          style={{ flexShrink: 0 }}
        />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
        >
          <MaterialIcons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={Colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>{t('learnSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Subheading */}
      <Text style={[styles.subheading, isRTL && styles.textRight]}>
        {language === 'ar' ? 'اختر مسار التعلم' : 'Choose your learning path'}
      </Text>

      {/* Category list */}
      <FlatList
        data={LEARN_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  rowRev:       { flexDirection: 'row-reverse' },
  textRight:    { textAlign: 'right' },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  subheading: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  listContent:  { paddingHorizontal: Spacing.md, paddingTop: 4 },

  // Category card
  pathCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  pathCardRTL:  { flexDirection: 'row-reverse' },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
    backgroundColor: Colors.surfaceElevated,
  },

  // Icon + done badge
  pathIcon: {
    width: 52, height: 52, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  doneBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.surfaceCard,
  },

  // Info column
  pathInfo:    { flex: 1, gap: 4 },
  pathInfoRTL: { alignItems: 'flex-end' },

  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  titleRowRTL: { flexDirection: 'row-reverse' },
  pathTitle: {
    fontSize: FontSize.body, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },

  // Completed chip
  completedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.success + '22', borderRadius: BorderRadius.full,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.success + '55',
  },
  completedChipText: {
    fontSize: 10, color: Colors.success,
    fontWeight: FontWeight.semibold, includeFontPadding: false,
  },

  pathSub: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    includeFontPadding: false,
  },

  // Progress bar
  progressBarTrack: {
    height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    height: '100%', borderRadius: 2,
    minWidth: 4,
  },
});

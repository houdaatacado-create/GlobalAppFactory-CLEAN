// Powered by OnSpace.AI
// Learn Islam — Lesson List for a Category (with completion badges)
import React from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import {
  getCategoryById, getLessonsForCategory,
  LessonCategory, Lesson,
} from '../../services/learnService';
import { useLearnProgress } from '../../hooks/useLearnProgress';

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const { isCompleted, categoryProgress, loaded } = useLearnProgress();

  const category: LessonCategory | undefined = getCategoryById(categoryId || '');
  const lessons: Lesson[] = getLessonsForCategory(categoryId || '');
  const { completed, total } = loaded && category ? categoryProgress(category.id) : { completed: 0, total: lessons.length };
  const pct = total > 0 ? completed / total : 0;

  if (!category) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <MaterialIcons name="error-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.errorText}>Category not found</Text>
        <Pressable style={styles.backBtnLarge} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const categoryName = language === 'ar' ? category.ar : category.en;

  const renderLesson = ({ item }: { item: Lesson }) => {
    const title = language === 'ar' ? item.ar.title : item.en.title;
    const desc  = language === 'ar' ? item.ar.shortDesc : item.en.shortDesc;
    const done  = isCompleted(item.id);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.lessonCard,
          isRTL && styles.lessonCardRTL,
          done && styles.lessonCardDone,
          pressed && styles.pressed,
        ]}
        onPress={() => router.push(`/learn/lesson/${item.id}`)}
        android_ripple={{ color: Colors.gold + '22', borderless: false }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {/* Number / check badge */}
        <View style={[
          styles.lessonNum,
          { backgroundColor: done ? Colors.success + '22' : category.color + '22' },
          done && styles.lessonNumDone,
        ]}>
          {done ? (
            <MaterialIcons name="check" size={18} color={Colors.success} />
          ) : (
            <Text style={[styles.lessonNumText, { color: category.color }]}>
              {item.lessonNumber}
            </Text>
          )}
        </View>

        {/* Lesson info */}
        <View style={[styles.lessonInfo, isRTL && styles.lessonInfoRTL]}>
          <Text
            style={[
              styles.lessonTitle,
              isRTL && styles.textRight,
              done && styles.lessonTitleDone,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {desc ? (
            <Text style={[styles.lessonDesc, isRTL && styles.textRight]} numberOfLines={1}>
              {desc}
            </Text>
          ) : null}
        </View>

        {/* Completed label / Arrow */}
        {done ? (
          <View style={styles.doneTag}>
            <Text style={styles.doneTagText}>
              {language === 'ar' ? 'مكتمل' : 'Done'}
            </Text>
          </View>
        ) : (
          <MaterialIcons
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={20}
            color={Colors.textMuted}
            style={{ flexShrink: 0 }}
          />
        )}
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
        <View style={[styles.headerCenter, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSub}>
            {loaded
              ? (language === 'ar'
                  ? `${completed} / ${total} مكتمل`
                  : `${completed} / ${total} completed`)
              : `${total} ${language === 'ar' ? 'درس' : 'lessons'}`}
          </Text>
        </View>
        {/* Category icon */}
        <View style={[styles.categoryIconWrap, { backgroundColor: category.color + '22' }]}>
          <MaterialIcons name={category.icon as any} size={22} color={category.color} />
        </View>
      </View>

      {/* Category progress bar */}
      {loaded && total > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(pct * 100)}%` as any,
                  backgroundColor: pct === 1 ? Colors.success : category.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressPct}>
            {Math.round(pct * 100)}%
          </Text>
        </View>
      )}

      {/* Lessons list */}
      {lessons.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="school" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا توجد دروس بعد' : 'No lessons yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  rowRev:        { flexDirection: 'row-reverse' },
  textRight:     { textAlign: 'right' },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerCenter:  { flex: 1, alignItems: 'flex-start' },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  headerSub: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    marginTop: 1, includeFontPadding: false,
  },
  categoryIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  // Progress bar
  progressWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  progressBarTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.border, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', borderRadius: 3, minWidth: 6,
  },
  progressPct: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    fontWeight: FontWeight.semibold, includeFontPadding: false,
    minWidth: 30, textAlign: 'right',
  },

  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  lessonCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  lessonCardRTL: { flexDirection: 'row-reverse' },
  lessonCardDone: {
    borderColor: Colors.success + '44',
    backgroundColor: Colors.success + '08',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
    backgroundColor: Colors.surfaceElevated,
  },

  // Number/check badge
  lessonNum: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonNumDone: {
    backgroundColor: Colors.success + '22',
    borderWidth: 1.5, borderColor: Colors.success + '55',
  },
  lessonNumText: { fontSize: FontSize.body, fontWeight: FontWeight.extrabold, includeFontPadding: false },

  lessonInfo:    { flex: 1 },
  lessonInfoRTL: { alignItems: 'flex-end' },
  lessonTitle: {
    fontSize: FontSize.body, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  lessonTitleDone: { color: Colors.textSecondary },
  lessonDesc: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    marginTop: 3, includeFontPadding: false,
  },

  // Done tag
  doneTag: {
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: Colors.success + '22',
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.success + '55',
    flexShrink: 0,
  },
  doneTagText: {
    fontSize: 11, color: Colors.success,
    fontWeight: FontWeight.semibold, includeFontPadding: false,
  },

  emptyWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText:   { fontSize: FontSize.body, color: Colors.textMuted, includeFontPadding: false },
  errorText:   { fontSize: FontSize.body, color: Colors.textMuted, marginTop: Spacing.md, includeFontPadding: false },
  backBtnLarge: {
    marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg,
  },
  backBtnText: { color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
});

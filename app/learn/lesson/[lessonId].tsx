// Powered by OnSpace.AI
// Learn Islam — Lesson Detail Screen with completion tracking
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../../constants/theme';
import {
  getLessonById, getCategoryById,
  getLessonsForCategory, Lesson,
} from '../../../services/learnService';
import { useLearnProgress } from '../../../hooks/useLearnProgress';

export default function LessonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const { isCompleted, toggleLesson } = useLearnProgress();

  const lesson = getLessonById(lessonId || '');
  const category = lesson ? getCategoryById(lesson.categoryId) : undefined;
  const allLessons = lesson ? getLessonsForCategory(lesson.categoryId) : [];
  const lessonIndex = lesson ? allLessons.findIndex(l => l.id === lesson.id) : -1;
  const prevLesson: Lesson | undefined = lessonIndex > 0 ? allLessons[lessonIndex - 1] : undefined;
  const nextLesson: Lesson | undefined = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : undefined;

  const [fontSize, setFontSize] = useState(16);
  const [toggling, setToggling] = useState(false);

  if (!lesson || !category) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <MaterialIcons name="error-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.errorText}>Lesson not found</Text>
        <Pressable style={styles.backBtnLarge} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{language === 'ar' ? 'عودة' : 'Go Back'}</Text>
        </Pressable>
      </View>
    );
  }

  const done = isCompleted(lesson.id);
  const title    = language === 'ar' ? lesson.ar.title    : lesson.en.title;
  const desc     = language === 'ar' ? lesson.ar.shortDesc : lesson.en.shortDesc;
  const body     = language === 'ar' ? lesson.ar.body     : lesson.en.body;
  const catName  = language === 'ar' ? category.ar        : category.en;

  const handleToggleComplete = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await toggleLesson(lesson.id);
    } finally {
      setToggling(false);
    }
  };

  // Navigate to next lesson and auto-mark current as complete
  const handleNextLesson = async (target: Lesson) => {
    if (!done) {
      await toggleLesson(lesson.id);
    }
    router.replace(`/learn/lesson/${target.id}`);
  };

  // Parse body — convert **bold** markers to styled segments
  const parseBody = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <View key={`sp-${lineIdx}`} style={{ height: 8 }} />;
      }
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const segments = parts.map((part, pi) => {
        const isBold = pi % 2 === 1;
        return (
          <Text
            key={`seg-${lineIdx}-${pi}`}
            style={[
              styles.bodyText,
              { fontSize },
              isRTL && styles.textRight,
              isBold && styles.bodyBold,
            ]}
          >
            {part}
          </Text>
        );
      });
      return (
        <Text key={`line-${lineIdx}`} style={[styles.bodyLine, isRTL && styles.textRight]}>
          {segments}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={Colors.textPrimary}
          />
        </Pressable>
        <View style={[styles.headerCenter, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.breadcrumb} numberOfLines={1}>
            {catName} · {language === 'ar' ? `درس ${lesson.lessonNumber}` : `Lesson ${lesson.lessonNumber}`}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={2}>{title}</Text>
        </View>
        {/* Font size controls */}
        <View style={styles.fontControls}>
          <Pressable style={styles.fontBtn} onPress={() => setFontSize(f => Math.min(f + 2, 26))} hitSlop={6}>
            <MaterialIcons name="text-increase" size={18} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.fontBtn} onPress={() => setFontSize(f => Math.max(f - 2, 13))} hitSlop={6}>
            <MaterialIcons name="text-decrease" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Category badge + progress info */}
      <View style={[styles.badgeRow, isRTL && styles.badgeRowRTL]}>
        <View style={[styles.categoryBadge, { backgroundColor: category.color + '22', borderColor: category.color + '55' }]}>
          <MaterialIcons name={category.icon as any} size={13} color={category.color} />
          <Text style={[styles.categoryBadgeText, { color: category.color }]}>{catName}</Text>
        </View>
        <View style={styles.numBadge}>
          <Text style={styles.numBadgeText}>
            {language === 'ar' ? `${lesson.lessonNumber} / ${allLessons.length}` : `${lesson.lessonNumber} of ${allLessons.length}`}
          </Text>
        </View>
        {/* Completion status chip */}
        {done && (
          <View style={styles.doneBadge}>
            <MaterialIcons name="check-circle" size={12} color={Colors.success} />
            <Text style={styles.doneBadgeText}>
              {language === 'ar' ? 'مكتمل' : 'Completed'}
            </Text>
          </View>
        )}
      </View>

      {/* Scrollable body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* Short description */}
        {desc ? (
          <View style={styles.descCard}>
            <MaterialIcons name="info-outline" size={16} color={Colors.gold} />
            <Text style={[styles.descText, isRTL && styles.textRight]}>{desc}</Text>
          </View>
        ) : null}

        {/* Main lesson body */}
        <View style={[styles.bodyCard, done && styles.bodyCardDone]}>
          {parseBody(body)}
        </View>

        {/* Mark complete / incomplete button (big, at end of content) */}
        <Pressable
          style={({ pressed }) => [
            styles.completeBtn,
            done && styles.completeBtnDone,
            (pressed || toggling) && styles.completeBtnPressed,
          ]}
          onPress={handleToggleComplete}
          disabled={toggling}
          accessibilityRole="button"
          accessibilityLabel={done
            ? (language === 'ar' ? 'إلغاء الإكمال' : 'Mark as Incomplete')
            : (language === 'ar' ? 'تحديد كمكتمل' : 'Mark as Complete')}
        >
          <MaterialIcons
            name={done ? 'check-circle' : 'radio-button-unchecked'}
            size={22}
            color={done ? Colors.textInverse : Colors.success}
          />
          <Text style={[styles.completeBtnText, done && styles.completeBtnTextDone]}>
            {done
              ? (language === 'ar' ? 'تم الإكمال ✓ — اضغط للإلغاء' : 'Completed ✓ — Tap to undo')
              : (language === 'ar' ? 'تحديد الدرس كمكتمل' : 'Mark lesson as complete')}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Prev / Next navigation */}
      <View style={[styles.navRow, isRTL && styles.navRowRev, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Pressable
          style={[styles.navBtn, !prevLesson && styles.navBtnDisabled]}
          onPress={() => prevLesson && router.replace(`/learn/lesson/${prevLesson.id}`)}
          disabled={!prevLesson}
        >
          <MaterialIcons
            name={isRTL ? 'chevron-right' : 'chevron-left'}
            size={20}
            color={prevLesson ? Colors.gold : Colors.textMuted}
          />
          <Text style={[styles.navBtnText, !prevLesson && styles.navBtnTextDisabled]} numberOfLines={1}>
            {prevLesson
              ? (language === 'ar' ? prevLesson.ar.title : prevLesson.en.title)
              : (language === 'ar' ? 'البداية' : 'Start')}
          </Text>
        </Pressable>

        {/* Next — also marks current as complete */}
        <Pressable
          style={[styles.navBtn, styles.navBtnNext, !nextLesson && styles.navBtnDisabled]}
          onPress={() => nextLesson && handleNextLesson(nextLesson)}
          disabled={!nextLesson}
        >
          <Text style={[styles.navBtnText, styles.navBtnTextNext, !nextLesson && styles.navBtnTextDisabled]} numberOfLines={1}>
            {nextLesson
              ? (language === 'ar' ? nextLesson.ar.title : nextLesson.en.title)
              : (language === 'ar' ? 'النهاية' : 'End')}
          </Text>
          <MaterialIcons
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={20}
            color={nextLesson ? Colors.gold : Colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  rowRev:        { flexDirection: 'row-reverse' },
  textRight:     { textAlign: 'right' },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, marginTop: 2,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerCenter:  { flex: 1 },
  breadcrumb: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    includeFontPadding: false, marginBottom: 3,
  },
  headerTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false, lineHeight: 26,
  },
  fontControls:  { flexDirection: 'column', gap: 4, flexShrink: 0, marginTop: 2 },
  fontBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
  },

  // Badge row
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  badgeRowRTL:    { flexDirection: 'row-reverse' },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, includeFontPadding: false },
  numBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border,
  },
  numBadgeText: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  doneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
    backgroundColor: Colors.success + '22', borderWidth: 1, borderColor: Colors.success + '55',
  },
  doneBadgeText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold, includeFontPadding: false },

  // Body
  bodyContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  descCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.gold + '12', borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.gold + '33',
  },
  descText: {
    flex: 1, fontSize: FontSize.sm, color: Colors.gold,
    lineHeight: 22, includeFontPadding: false,
  },
  bodyCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 2,
  },
  bodyCardDone: {
    borderColor: Colors.success + '44',
  },
  bodyLine:      { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  bodyText: {
    color: Colors.textPrimary, lineHeight: 28, includeFontPadding: false,
  },
  bodyBold:      { fontWeight: FontWeight.bold, color: Colors.gold },

  // Mark complete button
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: Spacing.sm,
    backgroundColor: Colors.success + '18',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderWidth: 1.5, borderColor: Colors.success + '55',
    minHeight: 52,
  },
  completeBtnDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  completeBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  completeBtnText: {
    fontSize: FontSize.body, fontWeight: FontWeight.semibold,
    color: Colors.success, includeFontPadding: false,
  },
  completeBtnTextDone: {
    color: Colors.textInverse,
  },

  // Prev / Next nav
  navRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  navRowRev:     { flexDirection: 'row-reverse' },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, minHeight: 48,
  },
  navBtnNext:         { justifyContent: 'flex-end' },
  navBtnDisabled:     { opacity: 0.35 },
  navBtnText: {
    flex: 1, fontSize: FontSize.sm, color: Colors.gold,
    fontWeight: FontWeight.semibold, includeFontPadding: false,
  },
  navBtnTextNext:     { textAlign: 'right' },
  navBtnTextDisabled: { color: Colors.textMuted },

  // Error state
  errorText: {
    fontSize: FontSize.body, color: Colors.textMuted,
    marginTop: Spacing.md, includeFontPadding: false,
  },
  backBtnLarge: {
    marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg,
  },
  backBtnText: { color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
});

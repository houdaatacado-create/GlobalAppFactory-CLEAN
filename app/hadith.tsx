// Powered by OnSpace.AI
// Hadith Screen - Coming soon with rich content
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

const SAMPLE_HADITHS = [
  {
    id: 1,
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    en: 'Actions are judged by intentions, and each person will be rewarded according to their intention.',
    source: 'رواه البخاري ومسلم',
    narrator: 'عمر بن الخطاب رضي الله عنه',
    topic: 'النية',
    grade: 'صحيح',
  },
  {
    id: 2,
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    en: 'None of you will have faith till he loves for his brother what he loves for himself.',
    source: 'رواه البخاري',
    narrator: 'أنس بن مالك رضي الله عنه',
    topic: 'الإيمان',
    grade: 'صحيح',
  },
  {
    id: 3,
    arabic: 'الدِّينُ النَّصِيحَةُ',
    en: 'Religion is sincerity (al-Nasihah).',
    source: 'رواه مسلم',
    narrator: 'تميم الداري رضي الله عنه',
    topic: 'الأخلاق',
    grade: 'صحيح',
  },
  {
    id: 4,
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    en: 'Whoever believes in Allah and the Last Day should say something good, or keep quiet.',
    source: 'رواه البخاري ومسلم',
    narrator: 'أبو هريرة رضي الله عنه',
    topic: 'الكلام',
    grade: 'صحيح',
  },
];

export default function HadithScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('hadithSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {SAMPLE_HADITHS.map(h => (
          <View key={h.id} style={styles.hadithCard}>
            <Text style={[styles.arabicText, styles.textRight]}>{h.arabic}</Text>
            {language !== 'ar' ? (
              <Text style={[styles.translationText, isRTL ? styles.textRight : styles.textLeft]}>{h.en}</Text>
            ) : null}
            <View style={[styles.metaRow, isRTL && styles.rowRev]}>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>{h.grade}</Text>
              </View>
              <Text style={styles.sourceText}>{h.source}</Text>
            </View>
            <View style={[styles.topicRow, isRTL && styles.rowRev]}>
              <MaterialIcons name="label" size={12} color={Colors.gold} />
              <Text style={styles.topicText}>{h.topic}</Text>
              <Text style={styles.narratorText}>· {h.narrator}</Text>
            </View>
            <Pressable style={[styles.askAiBtn, isRTL && { alignSelf: 'flex-start' }]}>
              <MaterialIcons name="auto-awesome" size={14} color={Colors.gold} />
              <Text style={styles.askAiText}>{t('askAI')}</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  listContent: { padding: Spacing.md, gap: Spacing.md },
  hadithCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: Spacing.md, gap: 10,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  arabicText: { fontSize: 20, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 34, includeFontPadding: false },
  translationText: { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 24, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gradeBadge: {
    backgroundColor: Colors.success + '22', borderRadius: BorderRadius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  gradeText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold, includeFontPadding: false },
  sourceText: { fontSize: FontSize.sm, color: Colors.gold, includeFontPadding: false },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topicText: { fontSize: FontSize.xs, color: Colors.gold, includeFontPadding: false },
  narratorText: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  askAiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end',
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 6,
  },
  askAiText: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.medium, includeFontPadding: false },
});

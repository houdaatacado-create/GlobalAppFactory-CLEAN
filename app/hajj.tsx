// Powered by OnSpace.AI
// Hajj & Umrah Guide Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

const UMRAH_STEPS = [
  { step: 1, icon: 'flight', ar: 'قبل السفر', en: 'Before Travel', desc_ar: 'التحضير والنية والتأشيرة', desc_en: 'Preparation, intention and visa' },
  { step: 2, icon: 'location-on', ar: 'الميقات', en: 'Meeqat', desc_ar: 'الوصول إلى الميقات', desc_en: 'Reaching the meeqat' },
  { step: 3, icon: 'self-improvement', ar: 'الإحرام', en: 'Ihram', desc_ar: 'لبس الإحرام والنية', desc_en: 'Wearing ihram and intention' },
  { step: 4, icon: 'radio-button-checked', ar: 'التلبية', en: 'Talbiyah', desc_ar: 'لبيك اللهم لبيك...', desc_en: 'Labbayk Allahumma Labbayk...' },
  { step: 5, icon: 'account-balance', ar: 'دخول مكة', en: 'Enter Makkah', desc_ar: 'الدعاء عند دخول المسجد الحرام', desc_en: 'Dua upon entering Al-Masjid Al-Haram' },
  { step: 6, icon: 'loop', ar: 'الطواف', en: 'Tawaf', desc_ar: '7 أشواط حول الكعبة المشرفة', desc_en: '7 circuits around the Kaabah' },
  { step: 7, icon: 'local-drink', ar: 'ماء زمزم', en: 'Zamzam Water', desc_ar: 'الشرب من ماء زمزم المبارك', desc_en: 'Drinking blessed Zamzam water' },
  { step: 8, icon: 'directions-walk', ar: 'السعي', en: 'Sa\'i', desc_ar: '7 أشواط بين الصفا والمروة', desc_en: '7 walks between Safa and Marwa' },
  { step: 9, icon: 'content-cut', ar: 'الحلق أو التقصير', en: 'Halq/Taqseer', desc_ar: 'حلق أو تقصير الشعر', desc_en: 'Shaving or trimming hair' },
  { step: 10, icon: 'check-circle', ar: 'انتهاء العمرة', en: 'Umrah Complete', desc_ar: 'تهانينا، عمرتك مقبولة بإذن الله', desc_en: 'Congratulations! Umrah accepted inshallah' },
];

export default function HajjScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'umrah' | 'hajj'>('umrah');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    setCompletedSteps(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('hajjSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['umrah', 'hajj'] as const).map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'umrah' ? (language === 'ar' ? 'العمرة' : 'Umrah') : (language === 'ar' ? 'الحج' : 'Hajj')}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'umrah' ? (
          <>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(completedSteps.length / UMRAH_STEPS.length) * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, isRTL && styles.textRight]}>
              {completedSteps.length}/{UMRAH_STEPS.length} {language === 'ar' ? 'خطوة' : 'steps'}
            </Text>

            {UMRAH_STEPS.map((step, idx) => {
              const isDone = completedSteps.includes(step.step);
              const isNext = !isDone && completedSteps.length === idx;
              return (
                <Pressable
                  key={step.step}
                  style={[styles.stepCard, isDone && styles.stepDone, isNext && styles.stepNext]}
                  onPress={() => toggleStep(step.step)}
                >
                  <View style={[styles.stepNum, isDone && styles.stepNumDone, isNext && styles.stepNumNext]}>
                    {isDone ? (
                      <MaterialIcons name="check" size={16} color={Colors.textInverse} />
                    ) : (
                      <Text style={[styles.stepNumText, isNext && { color: Colors.textInverse }]}>{step.step}</Text>
                    )}
                  </View>
                  <View style={[styles.stepInfo, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.stepTitle, isRTL && styles.textRight, isDone && styles.stepTitleDone]}>
                      {language === 'ar' ? step.ar : step.en}
                    </Text>
                    <Text style={[styles.stepDesc, isRTL && styles.textRight]}>
                      {language === 'ar' ? step.desc_ar : step.desc_en}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={step.icon as any}
                    size={22}
                    color={isDone ? Colors.success : isNext ? Colors.textInverse : Colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </>
        ) : (
          <View style={styles.comingSoon}>
            <MaterialIcons name="flight" size={64} color={Colors.gold} />
            <Text style={styles.comingSoonTitle}>{language === 'ar' ? 'دليل الحج' : 'Hajj Guide'}</Text>
            <Text style={styles.comingSoonDesc}>{t('comingSoon')}</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  rowRev: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  tabsRow: { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, padding: 3, gap: 3 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.body, color: Colors.textMuted, fontWeight: FontWeight.medium, includeFontPadding: false },
  tabTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  content: { padding: Spacing.md, gap: 10 },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 3 },
  progressText: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 8, includeFontPadding: false },
  stepCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  stepDone: { borderColor: Colors.success + '60', backgroundColor: Colors.success + '11' },
  stepNext: { borderColor: Colors.gold, backgroundColor: Colors.primary },
  stepNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  stepNumDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepNumNext: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  stepNumText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary, includeFontPadding: false },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textPrimary, includeFontPadding: false },
  stepTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  stepDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  comingSoon: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  comingSoonTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  comingSoonDesc: { fontSize: FontSize.body, color: Colors.textMuted, includeFontPadding: false },
});

// Powered by OnSpace.AI
// Islamic Calendar Screen
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

const ISLAMIC_EVENTS = [
  { id: 1, month: 1, day: 1, ar: 'رأس السنة الهجرية', en: 'Islamic New Year', icon: 'celebration', color: '#C9A84C' },
  { id: 2, month: 1, day: 10, ar: 'يوم عاشوراء', en: 'Ashura', icon: 'star', color: '#2D8A5E' },
  { id: 3, month: 3, day: 12, ar: 'المولد النبوي الشريف', en: 'Prophet Birthday', icon: 'auto-awesome', color: '#C9A84C' },
  { id: 4, month: 7, day: 27, ar: 'ليلة المعراج', en: 'Isra and Miraj', icon: 'nights-stay', color: '#1B6B47' },
  { id: 5, month: 8, day: 15, ar: 'ليلة النصف من شعبان', en: 'Mid Shaban', icon: 'star-half', color: '#9A7A30' },
  { id: 6, month: 9, day: 1, ar: 'أول رمضان', en: 'Ramadan Start', icon: 'wb-twilight', color: '#C9A84C' },
  { id: 7, month: 9, day: 27, ar: 'ليلة القدر', en: 'Laylatul Qadr', icon: 'stars', color: '#FFD700' },
  { id: 8, month: 10, day: 1, ar: 'عيد الفطر', en: 'Eid Al-Fitr', icon: 'celebration', color: '#C9A84C' },
  { id: 9, month: 12, day: 9, ar: 'يوم عرفة', en: 'Day of Arafah', icon: 'landscape', color: '#2D8A5E' },
  { id: 10, month: 12, day: 10, ar: 'عيد الأضحى', en: 'Eid Al-Adha', icon: 'celebration', color: '#C9A84C' },
];

const HIJRI_MONTHS_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const HIJRI_MONTHS_EN = ['Muharram', 'Safar', "Rabi' Al-Awwal", "Rabi' Al-Akhir", "Jumada Al-Awwal", "Jumada Al-Akhirah", 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu Al-Qi'dah", 'Dhu Al-Hijjah'];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('calendarSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Current Date Card */}
      <View style={styles.dateCard}>
        <View style={[styles.dateRow, isRTL && styles.rowRev]}>
          <View style={styles.hijriDate}>
            <Text style={styles.hijriDay}>١٥</Text>
            <Text style={[styles.hijriMonth, isRTL && styles.textRight]}>ربيع الأول ١٤٤٧</Text>
          </View>
          <View style={styles.dateDivider} />
          <View style={[styles.gregorianDate, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.gregDay}>{new Date().getDate()}</Text>
            <Text style={[styles.gregMonth, isRTL && styles.textRight]}>
              {new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      {/* Events List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {language === 'ar' ? 'المناسبات الإسلامية' : 'Islamic Events'}
        </Text>
        {ISLAMIC_EVENTS.map(event => (
          <View key={event.id} style={[styles.eventCard, isRTL && styles.rowRev]}>
            <View style={[styles.eventIcon, { backgroundColor: event.color + '22' }]}>
              <MaterialIcons name={event.icon as any} size={22} color={event.color} />
            </View>
            <View style={[styles.eventInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.eventTitle, isRTL && styles.textRight]}>
                {language === 'ar' ? event.ar : event.en}
              </Text>
              <Text style={[styles.eventDate, isRTL && styles.textRight]}>
                {event.day} {language === 'ar' ? HIJRI_MONTHS_AR[event.month - 1] : HIJRI_MONTHS_EN[event.month - 1]}
              </Text>
            </View>
            <MaterialIcons name="notifications-none" size={18} color={Colors.textMuted} />
          </View>
        ))}
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
  dateCard: { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  hijriDate: { alignItems: 'center' },
  hijriDay: { fontSize: 48, fontWeight: FontWeight.extrabold, color: Colors.gold, includeFontPadding: false },
  hijriMonth: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  dateDivider: { width: 1, height: 60, backgroundColor: Colors.border },
  gregorianDate: { alignItems: 'center' },
  gregDay: { fontSize: 48, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, includeFontPadding: false },
  gregMonth: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  content: { padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8, includeFontPadding: false },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  eventIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.textPrimary, includeFontPadding: false },
  eventDate: { fontSize: FontSize.sm, color: Colors.gold, marginTop: 2, includeFontPadding: false },
});

// Powered by OnSpace.AI
// Home Tab - Prayer Times + Quick Access Grid
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../hooks/useApp';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { PrayerTimesCard } from '../../components/feature/PrayerTimesCard';
import { HomeFeatureGrid } from '../../components/feature/HomeFeatureGrid';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

function getGreeting(lang: string): string {
  const h = new Date().getHours();
  const map: Record<string, Record<string, string>> = {
    ar: { morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء النور', night: 'تصبح على خير' },
    en: { morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening', night: 'Good Night' },
    pt: { morning: 'Bom Dia', afternoon: 'Boa Tarde', evening: 'Boa Noite', night: 'Boa Noite' },
    fr: { morning: 'Bonjour', afternoon: 'Bonne Après-midi', evening: 'Bonsoir', night: 'Bonne Nuit' },
    es: { morning: 'Buenos Días', afternoon: 'Buenas Tardes', evening: 'Buenas Tardes', night: 'Buenas Noches' },
    tr: { morning: 'Günaydın', afternoon: 'İyi Öğleden Sonralar', evening: 'İyi Akşamlar', night: 'İyi Geceler' },
    id: { morning: 'Selamat Pagi', afternoon: 'Selamat Siang', evening: 'Selamat Sore', night: 'Selamat Malam' },
    ur: { morning: 'صبح بخیر', afternoon: 'دوپہر بخیر', evening: 'شام بخیر', night: 'رات بخیر' },
    bn: { morning: 'শুভ সকাল', afternoon: 'শুভ বিকেল', evening: 'শুভ সন্ধ্যা', night: 'শুভ রাত' },
    ms: { morning: 'Selamat Pagi', afternoon: 'Selamat Tengah Hari', evening: 'Selamat Petang', night: 'Selamat Malam' },
  };
  const slot = h < 12 ? 'morning' : h < 16 ? 'afternoon' : h < 20 ? 'evening' : 'night';
  return (map[lang] || map['en'])[slot];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const { userPrefs } = useApp();
  const { setCity, hasLocation, city } = usePrayerTimes();
  const [cityInput, setCityInput] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const router = useRouter();

  const greeting = getGreeting(language);

  const handleSetCity = async () => {
    if (cityInput.trim()) {
      await setCity(cityInput.trim());
      setShowCityModal(false);
      setCityInput('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Image
          source={require('../../assets/images/hero_bg.png')}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['rgba(6,15,10,0.3)', 'rgba(6,15,10,0.9)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.headerContent, isRTL && { alignItems: 'flex-end' }]}>
          <View style={[styles.headerRow, isRTL && styles.rowRev]}>
            <View>
              <Text style={[styles.assalamu, isRTL && styles.textRight]}>{t('assalamu')}</Text>
              <Text style={[styles.greeting, isRTL && styles.textRight]}>{greeting}</Text>
            </View>
            <Pressable
              style={styles.locationBtn}
              onPress={() => setShowCityModal(true)}
            >
              <MaterialIcons name="location-on" size={16} color={Colors.gold} />
              <Text style={styles.locationText} numberOfLines={1}>
                {city || t('enterCity')}
              </Text>
            </Pressable>
          </View>

          {/* Search Bar */}
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push('/search' as any)}
          >
            <MaterialIcons name="search" size={20} color={Colors.textMuted} />
            <Text style={styles.searchPlaceholder}>{t('searchPlaceholder')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xxl + 20 }}
      >
        {/* Location prompt */}
        {!hasLocation ? (
          <Pressable style={styles.locationPrompt} onPress={() => setShowCityModal(true)}>
            <MaterialIcons name="location-searching" size={18} color={Colors.gold} />
            <Text style={[styles.locationPromptText, isRTL && styles.textRight]}>
              {t('locationPermission')}
            </Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.gold} />
          </Pressable>
        ) : null}

        {/* Prayer Times Card */}
        <PrayerTimesCard />

        {/* Feature Grid */}
        <HomeFeatureGrid />

        {/* Bottom spacing */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* City Modal */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalBg} onPress={() => setShowCityModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, isRTL && styles.textRight]}>{t('enterCity')}</Text>
            <TextInput
              style={[styles.cityInput, isRTL && { textAlign: 'right' }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={cityInput}
              onChangeText={setCityInput}
              onSubmitEditing={handleSetCity}
              autoFocus
            />
            <Pressable style={styles.citySubmit} onPress={handleSetCity}>
              <Text style={styles.citySubmitText}>{t('confirm')}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 220,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  headerContent: { padding: Spacing.md, gap: Spacing.sm },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowRev: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  assalamu: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxWidth: 140,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
    includeFontPadding: false,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,15,10,0.6)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPlaceholder: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    flex: 1,
    includeFontPadding: false,
  },
  scroll: { flex: 1 },
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  locationPromptText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  cityInput: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    includeFontPadding: false,
  },
  citySubmit: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  citySubmitText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    includeFontPadding: false,
  },
});

// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLanguage } from '../../hooks/useLanguage';

interface Feature {
  key: string;
  labelKey: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  route: string;
}

const FEATURES: Feature[] = [
  { key: 'prayer', labelKey: 'prayerSection', icon: 'mosque', color: '#2D8A5E', route: '/(tabs)/' },
  { key: 'qibla', labelKey: 'qiblaSection', icon: 'explore', color: '#C9A84C', route: '/qibla' },
  { key: 'quran', labelKey: 'quranSection', icon: 'menu-book', color: '#1B6B47', route: '/(tabs)/quran' },
  { key: 'hadith', labelKey: 'hadithSection', icon: 'format-quote', color: '#9A7A30', route: '/hadith' },
  { key: 'azkar', labelKey: 'azkarSection', icon: 'radio-button-checked', color: '#0F8A6A', route: '/azkar' },
  { key: 'learn', labelKey: 'learnSection', icon: 'school', color: '#1A7A5C', route: '/learn' },
  { key: 'hajj', labelKey: 'hajjSection', icon: 'flight', color: '#C9A84C', route: '/hajj' },
  { key: 'calendar', labelKey: 'calendarSection', icon: 'event', color: '#2D8A5E', route: '/calendar' },
  { key: 'watch', labelKey: 'watch', icon: 'play-circle-filled', color: '#9A3A20', route: '/(tabs)/watch' },
  { key: 'ai', labelKey: 'ai', icon: 'auto-awesome', color: '#8A2DBE', route: '/(tabs)/ai' },
];

export function HomeFeatureGrid() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, isRTL && styles.textRight]}>{t('quickAccess')}</Text>
      <View style={styles.grid}>
        {FEATURES.map(item => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
              <MaterialIcons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={[styles.cellLabel, isRTL && styles.textRight]} numberOfLines={2}>
              {t(item.labelKey as any)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  heading: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    includeFontPadding: false,
  },
  textRight: { textAlign: 'right' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: '18%',
    minWidth: 60,
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 14,
  },
});

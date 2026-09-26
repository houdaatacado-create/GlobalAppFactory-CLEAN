// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLanguage } from '../../hooks/useLanguage';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { PRAYER_KEYS, stripTimezone, formatMinutes } from '../../services/prayerService';

const PRAYER_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Fajr: 'wb-twilight',
  Sunrise: 'wb-sunny',
  Dhuhr: 'light-mode',
  Asr: 'cloud',
  Maghrib: 'nights-stay',
  Isha: 'bedtime',
};

export function PrayerTimesCard() {
  const { t, isRTL } = useLanguage();
  const { timings, nextPrayer, hijriDate, loading, hasLocation, city } = usePrayerTimes();

  const prayerNameKey: Record<string, string> = {
    Fajr: t('fajr'),
    Sunrise: t('sunrise'),
    Dhuhr: t('dhuhr'),
    Asr: t('asr'),
    Maghrib: t('maghrib'),
    Isha: t('isha'),
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <View>
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('prayerTimes')}</Text>
          {hijriDate ? (
            <Text style={[styles.hijriDate, isRTL && styles.textRight]}>{hijriDate}</Text>
          ) : null}
        </View>
        <MaterialIcons name="location-on" size={20} color={Colors.gold} />
      </View>

      {/* Next Prayer Banner */}
      {nextPrayer ? (
        <View style={styles.nextBanner}>
          <View style={[styles.nextRow, isRTL && styles.rowRev]}>
            <MaterialIcons name="notifications-active" size={16} color={Colors.goldGlow} />
            <Text style={styles.nextLabel}>{t('nextPrayer')}</Text>
          </View>
          <View style={[styles.nextInfo, isRTL && styles.rowRev]}>
            <Text style={styles.nextName}>{prayerNameKey[nextPrayer.name] || nextPrayer.name}</Text>
            <Text style={styles.nextTime}>{nextPrayer.time}</Text>
          </View>
          <Text style={[styles.countdown, isRTL && styles.textRight]}>
            {t('timeRemaining')}: {formatMinutes(nextPrayer.minutesLeft)}
          </Text>
        </View>
      ) : null}

      {/* Prayer List */}
      <View style={styles.prayerList}>
        {PRAYER_KEYS.map((key, i) => {
          const isNext = nextPrayer?.name === key;
          const time = timings ? stripTimezone(timings[key]) : '--:--';
          return (
            <View key={key} style={[
              styles.prayerRow,
              isRTL && styles.rowRev,
              isNext && styles.prayerRowActive,
              i < PRAYER_KEYS.length - 1 && styles.prayerBorder,
            ]}>
              <View style={[styles.iconCircle, isNext && styles.iconCircleActive]}>
                <MaterialIcons
                  name={PRAYER_ICONS[key] || 'access-time'}
                  size={16}
                  color={isNext ? Colors.textInverse : Colors.gold}
                />
              </View>
              <Text style={[styles.prayerName, isRTL && styles.textRight, isNext && styles.prayerNameActive]}>
                {prayerNameKey[key] || key}
              </Text>
              <Text style={[styles.prayerTime, isNext && styles.prayerTimeActive]}>{time}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  rowRev: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  hijriDate: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    marginTop: 2,
    includeFontPadding: false,
  },
  nextBanner: {
    backgroundColor: Colors.overlayLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  nextLabel: {
    fontSize: FontSize.xs,
    color: Colors.goldLight,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  nextInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nextName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  nextTime: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
    includeFontPadding: false,
  },
  countdown: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  prayerList: { gap: 0 },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  prayerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  prayerRowActive: {
    backgroundColor: Colors.overlayLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    marginHorizontal: -Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: Colors.gold,
  },
  prayerName: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  prayerNameActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  prayerTime: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  prayerTimeActive: {
    color: Colors.gold,
    fontWeight: FontWeight.bold,
  },
});

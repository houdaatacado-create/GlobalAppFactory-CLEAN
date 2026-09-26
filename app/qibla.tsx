// Powered by OnSpace.AI
// Qibla Compass Screen
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Easing } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../hooks/useLanguage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

// Qibla direction from a default location (mock - real app uses magnetometer)
const MOCK_QIBLA_DEGREE = 148; // Example: from somewhere in the world towards Mecca

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [currentDegree, setCurrentDegree] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Simulate compass movement (mock - real app uses expo-sensors)
  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      // Gentle oscillation to simulate real compass
      const noise = Math.sin(frame * 0.1) * 3;
      const target = MOCK_QIBLA_DEGREE + noise;
      setCurrentDegree(Math.round(target));

      Animated.timing(rotateAnim, {
        toValue: target,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const compassRotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => setIsCalibrating(false), 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background */}
      <LinearGradient
        colors={[Colors.primaryDeep, Colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('qiblaSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* Qibla Hero Image */}
        <View style={styles.qiblaImageWrap}>
          <Image
            source={require('../assets/images/qibla_hero.png')}
            style={styles.qiblaImage}
            contentFit="contain"
            transition={200}
          />
        </View>

        {/* Compass */}
        <View style={styles.compassWrap}>
          {/* Outer Ring */}
          <View style={styles.compassOuter}>
            {/* Compass Rose */}
            <Animated.View style={[styles.compassInner, { transform: [{ rotate: compassRotation }] }]}>
              {/* N S E W markers */}
              {['N', 'E', 'S', 'W'].map((dir, i) => (
                <Text
                  key={dir}
                  style={[
                    styles.compassDir,
                    {
                      transform: [
                        { rotate: `${i * 90}deg` },
                        { translateY: -80 },
                      ],
                    },
                    dir === 'N' && styles.compassN,
                  ]}
                >
                  {dir}
                </Text>
              ))}

              {/* Kaaba icon at qibla direction */}
              <View style={styles.qiblaPointer}>
                <MaterialIcons name="place" size={28} color={Colors.gold} />
              </View>
            </Animated.View>

            {/* Center dot */}
            <View style={styles.compassCenter}>
              <MaterialIcons name="mosque" size={20} color={Colors.gold} />
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.qiblaTitle, isRTL && styles.textRight]}>{t('qiblaDirection')}</Text>
          <Text style={styles.degreesText}>{currentDegree}° {t('degreesFromNorth')}</Text>
          <Text style={[styles.qiblaDesc, isRTL && styles.textRight]}>{t('qiblaDesc')}</Text>
        </View>

        {/* Calibrate Button */}
        <Pressable
          style={[styles.calibrateBtn, isCalibrating && styles.calibrateBtnActive]}
          onPress={handleCalibrate}
        >
          <MaterialIcons name="refresh" size={18} color={isCalibrating ? Colors.textInverse : Colors.gold} />
          <Text style={[styles.calibrateText, isCalibrating && { color: Colors.textInverse }]}>
            {isCalibrating ? t('loading') : t('calibrate')}
          </Text>
        </Pressable>
      </View>
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
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary,
    includeFontPadding: false,
  },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.lg, paddingTop: Spacing.sm },
  qiblaImageWrap: { width: 120, height: 120 },
  qiblaImage: { width: '100%', height: '100%' },
  compassWrap: { alignItems: 'center', justifyContent: 'center' },
  compassOuter: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 3, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20,
    elevation: 8,
  },
  compassInner: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  compassDir: {
    position: 'absolute',
    fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary,
    includeFontPadding: false,
  },
  compassN: { color: Colors.gold, fontSize: FontSize.body, fontWeight: FontWeight.extrabold },
  qiblaPointer: {
    position: 'absolute',
    top: -10,
  },
  compassCenter: {
    position: 'absolute',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  infoCard: { alignItems: 'center', gap: 6 },
  qiblaTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary,
    textAlign: 'center', includeFontPadding: false,
  },
  degreesText: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.gold,
    includeFontPadding: false,
  },
  qiblaDesc: {
    fontSize: FontSize.body, color: Colors.textSecondary, textAlign: 'center',
    includeFontPadding: false,
  },
  calibrateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.gold, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  calibrateBtnActive: { backgroundColor: Colors.gold },
  calibrateText: { fontSize: FontSize.body, color: Colors.gold, fontWeight: FontWeight.semibold, includeFontPadding: false },
});

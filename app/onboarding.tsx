// Powered by OnSpace.AI
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Pressable,
  FlatList, ListRenderItem, ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../hooks/useLanguage';
import { useApp } from '../hooks/useApp';
import { GoldButton } from '../components/ui/GoldButton';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  image: any;
  titleKey: string;
  descKey: string;
}

const SLIDES: Slide[] = [
  { id: '1', image: require('../assets/images/onboarding_1.png'), titleKey: 'onboarding1Title', descKey: 'onboarding1Desc' },
  { id: '2', image: require('../assets/images/onboarding_2.png'), titleKey: 'onboarding2Title', descKey: 'onboarding2Desc' },
  { id: '3', image: require('../assets/images/onboarding_3.png'), titleKey: 'onboarding3Title', descKey: 'onboarding3Desc' },
];

export default function OnboardingScreen() {
  const { t, isRTL } = useLanguage();
  const { completeOnboarding } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const goNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      await completeOnboarding();
      router.replace('/(tabs)/');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/');
  };

  const renderItem: ListRenderItem<Slide> = ({ item }) => (
    <View style={styles.slide}>
      <Image
        source={item.image}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(6,15,10,0.7)', 'rgba(6,15,10,0.97)']}
        style={StyleSheet.absoluteFillObject}
        locations={[0.3, 0.65, 1]}
      />
    </View>
  );

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Content Overlay */}
      <View style={[styles.overlay, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {/* Skip */}
        <Pressable
          style={[styles.skipBtn, { top: insets.top + Spacing.md }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>{t('skip')}</Text>
        </Pressable>

        {/* App logo area */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{t('appName')}</Text>
          </View>
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={[styles.title, isRTL && styles.textRight]}>
            {t(SLIDES[activeIndex].titleKey as any)}
          </Text>
          <Text style={[styles.desc, isRTL && styles.textRight]}>
            {t(SLIDES[activeIndex].descKey as any)}
          </Text>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {/* CTA */}
        <GoldButton
          label={isLast ? t('getStarted') : t('next')}
          onPress={goNext}
          size="lg"
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { width, height },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  skipBtn: {
    position: 'absolute',
    right: Spacing.xl,
  },
  skipText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.gold,
    includeFontPadding: false,
  },
  textWrap: { gap: Spacing.sm },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    includeFontPadding: false,
  },
  desc: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  textRight: { textAlign: 'right' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.gold,
  },
  btn: { width: '100%' },
});

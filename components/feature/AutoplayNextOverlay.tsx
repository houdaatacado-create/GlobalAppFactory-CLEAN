// Powered by OnSpace.AI
// AutoplayNextOverlay — shown at end of video with countdown to next video/episode

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

export interface NextVideoInfo {
  id: string;
  title: string;
  durationLabel: string;
  posterUri: string;
  isNextEpisode: boolean;
  episodeLabel?: string;
}

interface Props {
  visible: boolean;
  nextVideo: NextVideoInfo | null;
  countdownSeconds?: number;
  language: string;
  isRTL: boolean;
  onPlay: (videoId: string) => void;
  onCancel: () => void;
}

export default function AutoplayNextOverlay({
  visible,
  nextVideo,
  countdownSeconds = 10,
  language,
  isRTL,
  onPlay,
  onCancel,
}: Props) {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const progressAnim = useState(new Animated.Value(0))[0];

  const isAr = language === 'ar';

  // Reset + start countdown when visible
  useEffect(() => {
    if (!visible || !nextVideo) return;

    setCountdown(countdownSeconds);
    progressAnim.setValue(0);

    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: countdownSeconds * 1000,
      useNativeDriver: false,
    });
    anim.start();

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      anim.stop();
    };
  }, [visible, nextVideo, countdownSeconds]);

  // Auto-play when countdown hits 0
  useEffect(() => {
    if (countdown === 0 && visible && nextVideo) {
      onPlay(nextVideo.id);
    }
  }, [countdown, visible, nextVideo, onPlay]);

  if (!visible || !nextVideo) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.rowRev]}>
          <MaterialIcons name="play-circle-filled" size={20} color={Colors.gold} />
          <Text style={[styles.headerText, isRTL && styles.textRight]}>
            {nextVideo.isNextEpisode
              ? (isAr ? 'الحلقة التالية' : 'Next Episode')
              : (isAr ? 'التالي' : 'Up Next')}
          </Text>
          <Pressable style={styles.cancelBtn} onPress={onCancel} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Next video preview */}
        <Pressable
          style={[styles.preview, isRTL && styles.rowRev]}
          onPress={() => onPlay(nextVideo.id)}
        >
          <View style={styles.thumbWrap}>
            <Image
              source={{ uri: nextVideo.posterUri }}
              style={styles.thumb}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.thumbOverlay}>
              <MaterialIcons name="play-arrow" size={28} color="#fff" />
            </View>
          </View>
          <View style={[styles.info, isRTL && { alignItems: 'flex-end' }]}>
            {nextVideo.episodeLabel ? (
              <Text style={[styles.episodeLabel, isRTL && styles.textRight]}>
                {nextVideo.episodeLabel}
              </Text>
            ) : null}
            <Text
              style={[styles.title, isRTL && styles.textRight]}
              numberOfLines={2}
            >
              {nextVideo.title}
            </Text>
            <Text style={styles.duration}>{nextVideo.durationLabel}</Text>
          </View>
        </Pressable>

        {/* Countdown progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Action buttons */}
        <View style={[styles.actions, isRTL && styles.rowRev]}>
          <Pressable
            style={styles.playNowBtn}
            onPress={() => onPlay(nextVideo.id)}
          >
            <MaterialIcons name="play-arrow" size={18} color={Colors.textInverse} />
            <Text style={styles.playNowText}>
              {isAr ? 'شغّل الآن' : 'Play Now'}
            </Text>
          </Pressable>
          <Pressable style={styles.cancelBtnLarge} onPress={onCancel}>
            <Text style={styles.cancelText}>
              {isAr ? `إلغاء (${countdown}ث)` : `Cancel (${countdown}s)`}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,15,10,0.88)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
    includeFontPadding: false,
  },
  cancelBtn: {
    padding: 4,
  },
  preview: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  thumbWrap: {
    width: 110,
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: Colors.surfaceElevated,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  episodeLabel: {
    fontSize: 11,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
    includeFontPadding: false,
  },
  duration: {
    fontSize: 11,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  playNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
  },
  playNowText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    includeFontPadding: false,
  },
  cancelBtnLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  rowRev: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
});

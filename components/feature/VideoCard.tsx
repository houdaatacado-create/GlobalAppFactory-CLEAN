// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { Video, formatDuration } from '../../services/videoService';
import { useLanguage } from '../../hooks/useLanguage';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.44;

interface Props {
  video: Video;
  onPress: (video: Video) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VideoCard({ video, onPress, size = 'md' }: Props) {
  const { language, isRTL } = useLanguage();
  const title = (language === 'ar' ? video.titleAr : video.titleEn) || video.titleEn;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(video)}
    >
      <View style={styles.thumbContainer}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.overlay}>
          <View style={styles.playBtn}>
            <MaterialIcons name="play-arrow" size={22} color={Colors.textPrimary} />
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        {video.isKids ? (
          <View style={styles.kidsBadge}>
            <MaterialIcons name="child-care" size={10} color={Colors.textPrimary} />
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isRTL && styles.textRight]} numberOfLines={2}>{title}</Text>
        <View style={[styles.metaRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <MaterialIcons name="remove-red-eye" size={11} color={Colors.textMuted} />
          <Text style={styles.metaText}>
            {video.viewCount >= 1000000
              ? `${(video.viewCount / 1000000).toFixed(1)}M`
              : `${Math.floor(video.viewCount / 1000)}K`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  thumbContainer: { position: 'relative' },
  thumbnail: {
    width: '100%',
    height: CARD_W * 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  kidsBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.gold,
    borderRadius: 4,
    padding: 3,
  },
  info: { padding: 8 },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    lineHeight: 18,
    includeFontPadding: false,
  },
  textRight: { textAlign: 'right' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
});

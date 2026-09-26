// Powered by OnSpace.AI
// Video Detail Screen — Admin Dashboard Only
//
// YouTube-sourced videos are archived (admin_only visibility).
// Public users are redirected to the open-license player.
// This screen is retained for Admin Dashboard access only.

import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { getVideoById } from '../../services/videoService';
import { getOpenVideoById } from '../../services/openLicenseVideoService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

export default function VideoDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isRTL } = useLanguage();

  const handleBack = useCallback(() => router.back(), [router]);

  // Check if this is an open-license video — redirect to correct player
  const openLicenseVideo = getOpenVideoById(id || '');
  if (openLicenseVideo) {
    // Immediately redirect to the open player
    router.replace({ pathname: '/video/open-player', params: { id: id || '' } } as any);
    return null;
  }

  // For any non-static ID, always route to open-player — it will handle DB lookup
  if (id) {
    router.replace({ pathname: '/video/open-player', params: { id } } as any);
    return null;
  }

  const video = getVideoById(id || '');

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Pressable style={s.backBtn} onPress={handleBack}>
        <MaterialIcons
          name={isRTL ? 'arrow-forward' : 'arrow-back'}
          size={22}
          color={Colors.textPrimary}
        />
      </Pressable>

      <View style={s.centerWrap}>
        <View style={s.archiveCard}>
          <MaterialIcons name="inventory" size={52} color={Colors.textMuted} />
          <Text style={[s.archiveTitle, isRTL && s.textRight]}>
            {isRTL ? 'مؤرشف — للمشرفين فقط' : 'Archived — Admin Only'}
          </Text>
          <Text style={[s.archiveBody, isRTL && s.textRight]}>
            {isRTL
              ? 'هذا المحتوى من مكتبة يوتيوب المؤرشفة.\nيظهر فقط في لوحة تحكم المشرف.'
              : 'This content is from the archived YouTube library.\nIt appears only in the Admin Dashboard.'}
          </Text>
          {video ? (
            <View style={s.archiveInfo}>
              <Text style={s.archiveInfoLabel}>
                {isRTL ? 'العنوان' : 'Title'}
              </Text>
              <Text style={s.archiveInfoValue} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={s.archiveInfoLabel}>
                {isRTL ? 'القناة' : 'Channel'}
              </Text>
              <Text style={s.archiveInfoValue}>{video.channel}</Text>
              <Text style={s.archiveInfoLabel}>
                {isRTL ? 'النوع' : 'Source'}
              </Text>
              <Text style={s.archiveInfoValue}>
                YouTube (archived)
              </Text>
            </View>
          ) : (
            <Text style={s.archiveNotFound}>
              {isRTL ? 'معرّف الفيديو غير موجود' : 'Video ID not found'}
            </Text>
          )}
          <Pressable style={s.backToCatalogBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={16} color={Colors.textInverse} />
            <Text style={s.backToCatalogText}>
              {isRTL ? 'العودة للفهرس' : 'Back to Catalog'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  backBtn:            { margin: Spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  centerWrap:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  archiveCard:        { width: '100%', backgroundColor: Colors.surfaceCard, borderRadius: 20, padding: Spacing.lg, alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  archiveTitle:       { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textSecondary, textAlign: 'center', includeFontPadding: false },
  archiveBody:        { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, includeFontPadding: false },
  archiveInfo:        { width: '100%', backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 4 },
  archiveInfoLabel:   { fontSize: 11, color: Colors.textMuted, includeFontPadding: false },
  archiveInfoValue:   { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 6, includeFontPadding: false },
  archiveNotFound:    { fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  backToCatalogBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 16, paddingVertical: 10 },
  backToCatalogText:  { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  textRight:          { textAlign: 'right' },
});

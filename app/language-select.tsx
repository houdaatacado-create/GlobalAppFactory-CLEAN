// Powered by OnSpace.AI
// Language Selection Modal
import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../hooks/useLanguage';
import { SUPPORTED_LANGUAGES, Language } from '../constants/i18n';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

export default function LanguageSelectScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, changeLanguage, useDeviceLanguage, isRTL } = useLanguage();
  const router = useRouter();

  const handleSelect = async (code: Language['code']) => {
    await changeLanguage(code);
    router.back();
  };

  const handleUseDevice = async () => {
    await useDeviceLanguage();
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{t('changeLanguage')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Use Device Language (first item) */}
      <Pressable
        style={({ pressed }) => [styles.deviceLangRow, pressed && styles.pressed]}
        onPress={handleUseDevice}
      >
        <View style={styles.deviceLangIcon}>
          <MaterialIcons name="smartphone" size={22} color={Colors.primary} />
        </View>
        <View style={styles.langInfo}>
          <Text style={styles.langName}>{t('useDeviceLanguage')}</Text>
          <Text style={styles.langNameEn}>{t('useDeviceLanguageDesc')}</Text>
        </View>
        <MaterialIcons name="refresh" size={18} color={Colors.textMuted} />
      </Pressable>

      <View style={styles.divider} />

      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={l => l.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = item.code === language;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.langRow,
                isSelected && styles.langRowActive,
                pressed && styles.pressed,
              ]}
              onPress={() => handleSelect(item.code)}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <View style={styles.langInfo}>
                <Text style={styles.langName}>{item.name}</Text>
                <Text style={styles.langNameEn}>{item.nameEn} · {item.direction.toUpperCase()}</Text>
              </View>
              {isSelected ? (
                <View style={styles.checkCircle}>
                  <MaterialIcons name="check" size={16} color={Colors.textInverse} />
                </View>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowRev: { flexDirection: 'row-reverse' },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  deviceLangRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Colors.primary + '11',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  deviceLangIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.border },
  list: { padding: Spacing.md, gap: 8, paddingBottom: 40 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  langRowActive: { borderColor: Colors.gold, backgroundColor: Colors.overlayLight },
  pressed: { opacity: 0.8 },
  flag: { fontSize: 32 },
  langInfo: { flex: 1 },
  langName: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  langNameEn: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  emptyCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border,
  },
});

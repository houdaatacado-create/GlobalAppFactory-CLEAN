// Powered by OnSpace.AI
// Settings Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../hooks/useLanguage';
import { useApp } from '../hooks/useApp';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';
import { SUPPORTED_LANGUAGES } from '../constants/i18n';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const { userPrefs, updatePrefs } = useApp();
  const router = useRouter();
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRev]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('settingsSection')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Language */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('language')}</Text>
        <View style={styles.card}>
          <Pressable
            style={[styles.settingRow, isRTL && styles.rowRev]}
            onPress={() => router.push('/language-select')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary + '33' }]}>
                <MaterialIcons name="language" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t('changeLanguage')}</Text>
                <Text style={[styles.settingValue, isRTL && styles.textRight]}>
                  {currentLang?.flag} {currentLang?.name}
                </Text>
              </View>
            </View>
            <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Prayer */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('prayerSection')}</Text>
        <View style={styles.card}>
          <View style={[styles.settingRow, isRTL && styles.rowRev]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.gold + '33' }]}>
                <MaterialIcons name="notifications" size={20} color={Colors.gold} />
              </View>
              <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t('prayerNotifications')}</Text>
            </View>
            <Switch
              value={userPrefs.notifications}
              onValueChange={(val) => updatePrefs({ notifications: val })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={userPrefs.notifications ? Colors.gold : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <Pressable style={[styles.settingRow, isRTL && styles.rowRev]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.gold + '33' }]}>
                <MaterialIcons name="volume-up" size={20} color={Colors.gold} />
              </View>
              <View>
                <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t('adhanSound')}</Text>
                <Text style={[styles.settingValue, isRTL && styles.textRight]}>{userPrefs.adhanSound}</Text>
              </View>
            </View>
            <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('about')}</Text>
        <View style={styles.card}>
          <View style={[styles.settingRow, isRTL && styles.rowRev]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary + '33' }]}>
                <MaterialIcons name="info" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t('appName')} - نور</Text>
                <Text style={[styles.settingValue, isRTL && styles.textRight]}>Version 1.0.0</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Pressable style={[styles.settingRow, isRTL && styles.rowRev]} onPress={() => router.push('/privacy-policy' as any)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary + '33' }]}>
                <MaterialIcons name="security" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.settingLabel, isRTL && styles.textRight]}>
            <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t('privacyPolicy')}</Text>
              </Text>
            </View>
            <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Legal */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('legalSupport')}</Text>
        </Text>
        <View style={styles.card}>
          {([
            { icon: 'gavel',         label: t('termsOfUse'),     route: '/terms' },
            { icon: 'help',          label: t('supportCenter'),   route: '/support' },
            { icon: 'delete-forever',label: t('deleteAccount'),    route: '/delete-account' },
          ] as const).map((item, idx, arr) => (
            <React.Fragment key={item.route}>
              <Pressable style={[styles.settingRow, isRTL && styles.rowRev]} onPress={() => router.push(item.route as any)}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconBox, { backgroundColor: (item.icon === 'delete-forever' ? Colors.error : Colors.gold) + '22' }]}>
                    <MaterialIcons name={item.icon as any} size={20} color={item.icon === 'delete-forever' ? Colors.error : Colors.gold} />
                  </View>
                  <Text style={[styles.settingLabel, isRTL && styles.textRight, item.icon === 'delete-forever' && { color: Colors.error }]}>
                    {item.label}
                  </Text>
                </View>
                <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
              </Pressable>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.textMuted, marginTop: Spacing.md, marginBottom: 6,
    marginHorizontal: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5,
    includeFontPadding: false,
  },
  card: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', ...Shadow.sm,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconBox: { width: 38, height: 38, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: FontWeight.medium, includeFontPadding: false },
  settingValue: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 1, includeFontPadding: false },
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 66 },
});

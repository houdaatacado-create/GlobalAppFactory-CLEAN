// Powered by OnSpace.AI
// More Tab - Sections menu + settings access + auth
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Modal, TextInput, ActivityIndicator, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../hooks/useApp';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { SUPPORTED_LANGUAGES } from '../../constants/i18n';

interface MenuItem {
  key: string;
  labelKey: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  route: string;
  badge?: string;
}

const SECTIONS: MenuItem[] = [
  { key: 'azkar',    labelKey: 'azkarSection',   icon: 'radio-button-checked', color: '#2D8A5E', route: '/azkar' },
  { key: 'hadith',   labelKey: 'hadithSection',   icon: 'format-quote',         color: '#C9A84C', route: '/hadith' },
  { key: 'learn',    labelKey: 'learnSection',    icon: 'school',               color: '#1B6B47', route: '/learn' },
  { key: 'hajj',     labelKey: 'hajjSection',     icon: 'flight',               color: '#9A7A30', route: '/hajj' },
  { key: 'calendar', labelKey: 'calendarSection', icon: 'event',                color: '#0F8A6A', route: '/calendar' },
  { key: 'qibla',    labelKey: 'qiblaSection',    icon: 'explore',              color: '#C9A84C', route: '/qibla' },
];

// Admin items are NOT part of the public mobile app.
// All admin access happens through the separate secure web admin portal.

const SETTINGS_ITEMS: MenuItem[] = [
  { key: 'language',      labelKey: 'changeLanguage', icon: 'language',      color: '#2D8A5E', route: '/language-select' },
  { key: 'settings',      labelKey: 'settingsSection',icon: 'settings',      color: '#5A7A60', route: '/settings' },
  { key: 'notifications', labelKey: 'notifications',  icon: 'notifications', color: '#C9A84C', route: '/settings' },
  { key: 'privacy',       labelKey: 'privacy',         icon: 'security',      color: '#1B6B47', route: '/settings' },
  { key: 'about',         labelKey: 'about',           icon: 'info',          color: '#5A7A60', route: '/settings' },
];

function MenuRow({ item, isRTL, onPress }: { item: MenuItem; isRTL: boolean; onPress: () => void }) {
  const { t } = useLanguage();
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed, isRTL && styles.rowRev]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
        <MaterialIcons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={[styles.menuLabel, isRTL && styles.textRight]}>{t(item.labelKey as any)}</Text>
      {item.badge ? (
        <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
      ) : null}
      <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

// ─── Sign-In Modal ────────────────────────────────────────────────────────────

function SignInModal({ visible, onClose, isRTL, lang, onSuccess }: {
  visible: boolean;
  onClose: () => void;
  isRTL: boolean;
  lang: string;
  onSuccess: () => void;
}) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = {
    ar: { title: 'تسجيل الدخول', email: 'البريد الإلكتروني', pass: 'كلمة المرور', btn: 'دخول', cancel: 'إلغاء' },
    en: { title: 'Sign In',      email: 'Email address',       pass: 'Password',     btn: 'Sign In', cancel: 'Cancel' },
    pt: { title: 'Entrar',       email: 'E-mail',              pass: 'Senha',         btn: 'Entrar',  cancel: 'Cancelar' },
  };
  const c = copy[lang as keyof typeof copy] || copy.en;

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setEmail('');
      setPassword('');
      setError('');
      onSuccess();
      onClose();
    }
  }, [email, password, signIn, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={m.backdrop} onPress={handleClose}>
        <Pressable style={m.card} onPress={() => {}}>
          <View style={m.handle} />
          <Text style={[m.title, isRTL && m.textRight]}>{c.title}</Text>

          <TextInput
            style={[m.input, isRTL && m.textRight]}
            placeholder={c.email}
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={[m.input, isRTL && m.textRight]}
            placeholder={c.pass}
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={m.error}>{error}</Text> : null}

          <View style={[m.btnRow, isRTL && m.rowRev]}>
            <Pressable style={m.cancelBtn} onPress={handleClose}>
              <Text style={m.cancelText}>{c.cancel}</Text>
            </Pressable>
            <Pressable
              style={[m.signInBtn, loading && m.disabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color={Colors.textInverse} />
                : <Text style={m.signInText}>{c.btn}</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Sign-Out Confirmation Modal ──────────────────────────────────────────────

function SignOutModal({ visible, onClose, isRTL, lang, onConfirm }: {
  visible: boolean;
  onClose: () => void;
  isRTL: boolean;
  lang: string;
  onConfirm: () => void;
}) {
  const copy = {
    ar: { title: 'تسجيل الخروج', body: 'هل تريد تسجيل الخروج من حسابك؟', confirm: 'خروج', cancel: 'إلغاء' },
    en: { title: 'Sign Out',     body: 'Are you sure you want to sign out?',  confirm: 'Sign Out', cancel: 'Cancel' },
    pt: { title: 'Sair',         body: 'Tem certeza que deseja sair?',         confirm: 'Sair',     cancel: 'Cancelar' },
  };
  const c = copy[lang as keyof typeof copy] || copy.en;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={m.backdrop} onPress={onClose}>
        <Pressable style={m.card} onPress={() => {}}>
          <View style={m.handle} />
          <Text style={[m.title, isRTL && m.textRight]}>{c.title}</Text>
          <Text style={[m.body, isRTL && m.textRight]}>{c.body}</Text>
          <View style={[m.btnRow, isRTL && m.rowRev]}>
            <Pressable style={m.cancelBtn} onPress={onClose}>
              <Text style={m.cancelText}>{c.cancel}</Text>
            </Pressable>
            <Pressable style={[m.signInBtn, { backgroundColor: Colors.error }]} onPress={onConfirm}>
              <Text style={m.signInText}>{c.confirm}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MoreTab() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const { currentUser, signOut, isPremium, subscriptionStatus } = useApp();

  const [showSignIn, setShowSignIn]   = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);
  const isLoggedIn = !!currentUser;

  const handleAuthBtn = useCallback(() => {
    if (isLoggedIn) {
      setShowSignOut(true);
    } else {
      setShowSignIn(true);
    }
  }, [isLoggedIn]);

  const handleSignOut = useCallback(async () => {
    setShowSignOut(false);
    await signOut();
  }, [signOut]);

  const authBtnLabel = isLoggedIn ? t('logout') : t('login');

  const displayName = isLoggedIn
    ? (currentUser.email?.split('@')[0] || t('guestUser'))
    : t('guestUser');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.profileRow, isRTL && styles.rowRev]}>
            <View style={[styles.avatarCircle, isLoggedIn && { borderColor: Colors.primary }]}>
              <MaterialIcons name="person" size={32} color={isLoggedIn ? Colors.primary : Colors.gold} />
            </View>
            <View style={[styles.profileInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.profileName, isRTL && styles.textRight]}>{displayName}</Text>
              <View style={[styles.profileSubRow, isRTL && styles.rowRev]}>
                <Text style={styles.profileSub}>{currentLang?.flag} {currentLang?.name}</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="star" size={10} color={Colors.textInverse} />
                    <Text style={styles.premiumBadgeText}>{t('premium')}</Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable
              style={[styles.loginBtn, isLoggedIn && styles.signOutBtn]}
              onPress={handleAuthBtn}
            >
              <MaterialIcons
                name={isLoggedIn ? 'logout' : 'login'}
                size={16}
                color={Colors.textInverse}
              />
              <Text style={styles.loginBtnText}>{authBtnLabel}</Text>
            </Pressable>
          </View>

          {/* Subscription status strip for logged-in users */}
          {isLoggedIn && (
            <View style={[styles.subStrip, isRTL && styles.rowRev]}>
              <MaterialIcons
                name={isPremium ? 'verified' : 'lock'}
                size={13}
                color={isPremium ? Colors.gold : Colors.textMuted}
              />
              <Text style={[styles.subStripText, isPremium && { color: Colors.gold }]}>
                {isPremium
                  ? t('premiumActive')
                  : subscriptionStatus === 'expired'
                    ? t('aiExpired')
                    : t('freeAccount')}
              </Text>
            </View>
          )}
        </View>

        {/* Sections */}
        <Text style={[styles.sectionHeading, isRTL && styles.textRight, { marginHorizontal: Spacing.md }]}>
          {t('quickAccess')}
        </Text>
        <View style={styles.card}>
          {SECTIONS.map((item, i) => (
            <View key={item.key}>
              <MenuRow item={item} isRTL={isRTL} onPress={() => router.push(item.route as any)} />
              {i < SECTIONS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        {/* Admin / Editorial section is REMOVED from public app — use secure web admin portal */}

        {/* Settings */}
        <Text style={[styles.sectionHeading, isRTL && styles.textRight, { marginHorizontal: Spacing.md }]}>
          {t('settingsSection')}
        </Text>
        <View style={styles.card}>
          {SETTINGS_ITEMS.map((item, i) => (
            <View key={item.key}>
              <MenuRow item={item} isRTL={isRTL} onPress={() => router.push(item.route as any)} />
              {i < SETTINGS_ITEMS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        <Text style={styles.version}>نور v1.0.0 · Noor · نور</Text>
      </ScrollView>

      <SignInModal
        visible={showSignIn}
        onClose={() => setShowSignIn(false)}
        isRTL={isRTL}
        lang={language}
        onSuccess={() => {}}
      />
      <SignOutModal
        visible={showSignOut}
        onClose={() => setShowSignOut(false)}
        isRTL={isRTL}
        lang={language}
        onConfirm={handleSignOut}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  textRight:       { textAlign: 'right' },
  rowRev:          { flexDirection: 'row-reverse' },
  profileCard:     { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.md, gap: 10 },
  profileRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarCircle:    { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.gold },
  profileInfo:     { flex: 1 },
  profileName:     { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  profileSubRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  profileSub:      { fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  premiumBadge:    { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  premiumBadgeText:{ fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  loginBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 8 },
  signOutBtn:      { backgroundColor: Colors.error },
  loginBtnText:    { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  subStrip:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border },
  subStripText:    { fontSize: 12, color: Colors.textMuted, includeFontPadding: false },
  sectionHeading:  { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, includeFontPadding: false },
  card:            { marginHorizontal: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.sm },
  menuRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 14 },
  pressed:         { backgroundColor: Colors.surfaceLight },
  menuIcon:        { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel:       { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: FontWeight.medium, includeFontPadding: false },
  badge:           { backgroundColor: Colors.gold, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:       { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  divider:         { height: 1, backgroundColor: Colors.divider, marginLeft: 68 },
  version:         { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xl, includeFontPadding: false },
});

const m = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  card:        { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: 12, borderTopWidth: 1, borderColor: Colors.border },
  handle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 6 },
  title:       { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  body:        { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  textRight:   { textAlign: 'right' },
  rowRev:      { flexDirection: 'row-reverse' },
  input:       { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: FontSize.body, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  error:       { fontSize: FontSize.sm, color: Colors.error, includeFontPadding: false },
  btnRow:      { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:   { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: BorderRadius.lg, backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  cancelText:  { fontSize: FontSize.body, color: Colors.textMuted, fontWeight: FontWeight.medium, includeFontPadding: false },
  signInBtn:   { flex: 2, alignItems: 'center', paddingVertical: 13, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
  signInText:  { fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: FontWeight.bold, includeFontPadding: false },
  disabled:    { opacity: 0.6 },
});

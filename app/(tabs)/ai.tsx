// Powered by OnSpace.AI
// Islamic AI Guide Tab — Premium Feature (Production)
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Modal, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../hooks/useApp';
import { AIMessageBubble } from '../../components/feature/AIMessageBubble';
import {
  AIMessage, AI_SUGGESTED_QUESTIONS,
  sendIslamicAIMessage, generateMessageId,
} from '../../services/aiService';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { LanguageCode, TranslationKey } from '../../constants/i18n';

// ─── Premium Paywall ──────────────────────────────────────────────────────────

function PremiumPaywall({ isRTL, lang }: { isRTL: boolean; lang: string }) {
  const insets = useSafeAreaInsets();
  const [showSignIn, setShowSignIn] = useState(false);
  const { signIn, subscriptionStatus, subscriptionLoading } = useApp();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    setAuthError('');
    setAuthLoading(true);
    const { error } = await signIn(email.trim(), password.trim());
    setAuthLoading(false);
    if (error) {
      setAuthError(error);
    } else {
      setShowSignIn(false);
      setEmail('');
      setPassword('');
    }
  };

  if (subscriptionLoading) {
    return (
      <View style={pw.container}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={[pw.loadingText, isRTL && pw.textRight]}>{t('aiCheckingSub' as TranslationKey)}</Text>
      </View>
    );
  }

  const features = [
    t('aiFeature1' as TranslationKey),
    t('aiFeature2' as TranslationKey),
    t('aiFeature3' as TranslationKey),
    t('aiFeature4' as TranslationKey),
  ];

  return (
    <ScrollView contentContainerStyle={[pw.container, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
      {/* Icon */}
      <View style={pw.iconWrap}>
        <LinearGradient colors={[Colors.gold + '33', Colors.gold + '11']} style={pw.iconGrad}>
          <MaterialIcons name="auto-awesome" size={48} color={Colors.gold} />
        </LinearGradient>
      </View>

      {/* Headline */}
      <Text style={[pw.headline, isRTL && pw.textRight]}>{t('aiHeadline' as TranslationKey)}</Text>
      {subscriptionStatus === 'expired' ? (
        <Text style={[pw.expiredNote, isRTL && pw.textRight]}>{t('aiExpired' as TranslationKey)}</Text>
      ) : (
        <Text style={[pw.sub, isRTL && pw.textRight]}>{t('aiPremiumSub' as TranslationKey)}</Text>
      )}

      {/* Feature list */}
      <View style={[pw.featureList, isRTL && { alignItems: 'flex-end' }]}>
        {features.map((f, i) => (
          <View key={i} style={[pw.featureRow, isRTL && pw.rowRev]}>
            <MaterialIcons name="check-circle" size={18} color={Colors.gold} />
            <Text style={[pw.featureText, isRTL && pw.textRight]}>{f}</Text>
          </View>
        ))}
      </View>

      {/* CTA buttons */}
      <View style={pw.btnGroup}>
        <Pressable
          style={({ pressed }) => [pw.signInBtn, pressed && pw.pressed]}
          onPress={() => setShowSignIn(true)}
        >
          <MaterialIcons name="login" size={18} color={Colors.textInverse} />
          <Text style={pw.signInBtnText}>{t('aiSignIn' as TranslationKey)}</Text>
        </Pressable>

        <Text style={pw.orText}>{t('cancel').charAt(0) === 'C' ? 'or' : t('cancel').charAt(0) === 'A' ? 'ou' : t('cancel').charAt(0) === 'İ' ? 'veya' : 'or'}</Text>

        <Pressable style={({ pressed }) => [pw.upgradeBtn, pressed && pw.pressed]}>
          <MaterialIcons name="star" size={18} color={Colors.textInverse} />
          <Text style={pw.upgradeBtnText}>{t('aiUpgradePremium' as TranslationKey)}</Text>
        </Pressable>
      </View>

      {/* Sign-in modal */}
      <Modal visible={showSignIn} transparent animationType="slide" onRequestClose={() => setShowSignIn(false)}>
        <Pressable style={pw.modalBackdrop} onPress={() => setShowSignIn(false)}>
          <Pressable style={pw.modalCard} onPress={() => {}}>
            <Text style={[pw.modalTitle, isRTL && pw.textRight]}>{t('aiSignIn' as TranslationKey)}</Text>

            <TextInput
              style={[pw.modalInput, isRTL && { textAlign: 'right' }]}
              placeholder={t('aiEmailPlaceholder' as TranslationKey)}
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <TextInput
              style={[pw.modalInput, isRTL && { textAlign: 'right' }]}
              placeholder={t('aiPassPlaceholder' as TranslationKey)}
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {authError ? <Text style={pw.authError}>{authError}</Text> : null}

            <View style={[pw.modalBtnRow, isRTL && pw.rowRev]}>
              <Pressable style={pw.modalCancelBtn} onPress={() => { setShowSignIn(false); setAuthError(''); }}>
                <Text style={pw.modalCancelText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                style={[pw.modalLoginBtn, authLoading && pw.disabledBtn]}
                onPress={handleSignIn}
                disabled={authLoading}
              >
                {authLoading
                  ? <ActivityIndicator size="small" color={Colors.textInverse} />
                  : <Text style={pw.modalLoginText}>{t('aiLoginBtn' as TranslationKey)}</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const pw = StyleSheet.create({
  container:      { flexGrow: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingTop: 32, gap: 20 },
  loadingText:    { fontSize: FontSize.body, color: Colors.textMuted, marginTop: 12, includeFontPadding: false },
  iconWrap:       { marginBottom: 4 },
  iconGrad:       { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.gold + '44' },
  headline:       { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center', includeFontPadding: false, lineHeight: 30 },
  sub:            { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, includeFontPadding: false },
  expiredNote:    { fontSize: FontSize.sm, color: '#F39C12', textAlign: 'center', lineHeight: 20, includeFontPadding: false },
  featureList:    { width: '100%', gap: 10, marginVertical: 4 },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText:    { flex: 1, fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  btnGroup:       { width: '100%', gap: 10, marginTop: 8 },
  signInBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: 14, ...Shadow.sm },
  signInBtnText:  { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  orText:         { textAlign: 'center', fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  upgradeBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.gold, borderRadius: BorderRadius.xl, paddingVertical: 14, ...Shadow.sm },
  upgradeBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  pressed:        { opacity: 0.82, transform: [{ scale: 0.97 }] },
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: 12, borderTopWidth: 1, borderColor: Colors.border },
  modalTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4, includeFontPadding: false },
  modalInput:     { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: FontSize.body, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  authError:      { fontSize: FontSize.sm, color: Colors.error, includeFontPadding: false },
  modalBtnRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: BorderRadius.lg, backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  modalCancelText:{ fontSize: FontSize.body, color: Colors.textMuted, fontWeight: FontWeight.medium, includeFontPadding: false },
  modalLoginBtn:  { flex: 2, alignItems: 'center', paddingVertical: 13, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
  modalLoginText: { fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: FontWeight.bold, includeFontPadding: false },
  disabledBtn:    { opacity: 0.6 },
  textRight:      { textAlign: 'right' },
  rowRev:         { flexDirection: 'row-reverse' },
});

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export default function AITab() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const { isPremium, subscriptionLoading, session } = useApp();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const historySnapshot = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const currentMessages = [...historySnapshot, { role: 'user' as const, content: text.trim() }];

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    const assistantId = generateMessageId();
    setStreamingId(assistantId);
    const assistantMsg: AIMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    scrollToBottom();

    abortRef.current = new AbortController();

    try {
      let fullContent = '';

      const accessToken = session?.access_token || '';
      if (!accessToken) {
        const errText = t('aiSignInError' as TranslationKey);
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: errText } : m)
        );
        setLoading(false);
        setStreamingId(null);
        return;
      }

      await sendIslamicAIMessage({
        messages: currentMessages,
        language,
        accessToken,
        signal: abortRef.current.signal,
        onChunk: (chunk: string) => {
          fullContent += chunk;
          setMessages(prev =>
            prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
          );
          scrollToBottom();
        },
      });

    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      if (!isAbort) {
        const errorText = err?.message || t('aiGenericError' as TranslationKey);
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: errorText } : m)
        );
      }
    } finally {
      setLoading(false);
      setStreamingId(null);
      abortRef.current = null;
      scrollToBottom();
    }
  }, [loading, messages, language, session, scrollToBottom, t]);

  const handleFeedback = useCallback((id: string, type: 'helpful' | 'not_helpful' | 'reported') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: type } : m));
  }, []);

  const handleStopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const suggestions = AI_SUGGESTED_QUESTIONS.map(q => ({
    text: q[language as LanguageCode] || q.en,
  }));

  const isEmpty = messages.length === 0;

  // ── Show paywall for non-Premium users ────────────────────────────────────
  if (!isPremium && !subscriptionLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={[styles.headerRow, isRTL && styles.rowRev]}>
            <View style={styles.aiIconWrap}>
              <Image
                source={require('../../assets/images/ai_hero.png')}
                style={styles.aiHeaderImg}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient colors={['transparent', Colors.surface]} style={StyleSheet.absoluteFillObject} />
              <MaterialIcons name="auto-awesome" size={22} color={Colors.gold} style={styles.aiIcon} />
            </View>
            <View style={[styles.headerTextWrap, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.aiTitle, isRTL && styles.textRight]}>{t('aiTitle')}</Text>
              <View style={styles.premiumBadge}>
                <MaterialIcons name="star" size={11} color={Colors.textInverse} />
                <Text style={styles.premiumBadgeText}>{t('premium' as TranslationKey)}</Text>
              </View>
            </View>
          </View>
        </View>
        <PremiumPaywall isRTL={isRTL} lang={language} />
      </View>
    );
  }

  // ── Premium: full AI chat ─────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowRev]}>
          <View style={styles.aiIconWrap}>
            <Image
              source={require('../../assets/images/ai_hero.png')}
              style={styles.aiHeaderImg}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient colors={['transparent', Colors.surface]} style={StyleSheet.absoluteFillObject} />
            <MaterialIcons name="auto-awesome" size={22} color={Colors.gold} style={styles.aiIcon} />
          </View>
          <View style={[styles.headerTextWrap, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.aiTitle, isRTL && styles.textRight]}>{t('aiTitle')}</Text>
            <View style={[styles.headerBadgeRow, isRTL && styles.rowRev]}>
              <View style={[styles.premiumBadge, { backgroundColor: Colors.primary }]}>
                <MaterialIcons name="verified" size={11} color={Colors.gold} />
                <Text style={styles.premiumBadgeText}>{t('premium' as TranslationKey)}</Text>
              </View>
              <Text style={[styles.aiSubtitle, isRTL && styles.textRight]}>{t('aiSubtitle')}</Text>
            </View>
          </View>
          <Pressable style={styles.newChatBtn} onPress={() => { handleStopStreaming(); setMessages([]); }}>
            <MaterialIcons name="add" size={20} color={Colors.gold} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages or Empty State */}
        {isEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.sparkleCircle}>
              <MaterialIcons name="auto-awesome" size={40} color={Colors.gold} />
            </View>
            <Text style={[styles.emptyTitle, isRTL && styles.textRight]}>{t('aiSuggestions')}</Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.slice(0, 6).map((s, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}
                  onPress={() => sendMessage(s.text)}
                >
                  <Text style={[styles.suggestionText, isRTL && styles.textRight]} numberOfLines={2}>
                    {s.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={({ item }) => (
              <AIMessageBubble
                message={item}
                onFeedback={handleFeedback}
                isStreaming={item.id === streamingId}
              />
            )}
            keyExtractor={m => m.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Spacing.md }}
            onLayout={() => listRef.current?.scrollToEnd()}
          />
        )}

        {/* Thinking / Streaming Indicator */}
        {loading ? (
          <View style={[styles.thinkingRow, isRTL && styles.rowRev]}>
            {streamingId && messages.find(m => m.id === streamingId)?.content ? (
              <Pressable style={styles.stopBtn} onPress={handleStopStreaming}>
                <MaterialIcons name="stop" size={14} color={Colors.textInverse} />
                <Text style={styles.stopBtnText}>{t('stopStreaming' as TranslationKey)}</Text>
              </Pressable>
            ) : (
              <>
                <ActivityIndicator size="small" color={Colors.gold} />
                <Text style={styles.thinkingText}>{t('aiThinking')}</Text>
              </>
            )}
          </View>
        ) : null}

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
          <View style={[styles.inputWrap, isRTL && styles.rowRev]}>
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              placeholder={t('aiPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
              editable={!loading}
            />
            <Pressable
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <MaterialIcons
                name="send"
                size={20}
                color={input.trim() && !loading ? Colors.textInverse : Colors.textMuted}
              />
            </Pressable>
          </View>
          {/* Disclaimer */}
          <Text style={[styles.disclaimer, isRTL && styles.textRight]}>
            {t('disclaimerText' as TranslationKey)}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  rowRev: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  aiIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  aiHeaderImg: { ...StyleSheet.absoluteFillObject as any },
  aiIcon: { position: 'absolute' },
  headerTextWrap: { flex: 1, gap: 2 },
  aiTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.textPrimary, includeFontPadding: false },
  aiSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.gold, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start',
  },
  premiumBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textInverse, includeFontPadding: false },
  newChatBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.lg,
  },
  sparkleCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.borderLight,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  suggestionsGrid: { width: '100%', gap: 8 },
  suggestionChip: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  pressed: { opacity: 0.75 },
  suggestionText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
  thinkingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.xl, paddingVertical: 8,
  },
  thinkingText: { fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.error, borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  stopBtnText: { fontSize: 12, color: Colors.textInverse, fontWeight: FontWeight.bold, includeFontPadding: false },
  inputBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: {
    flex: 1, fontSize: FontSize.body, color: Colors.textPrimary,
    maxHeight: 120, includeFontPadding: false, lineHeight: 22,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surfaceElevated },
  disclaimer: {
    fontSize: 10, color: Colors.textMuted, textAlign: 'center',
    lineHeight: 14, includeFontPadding: false,
    paddingHorizontal: 8,
  },
});

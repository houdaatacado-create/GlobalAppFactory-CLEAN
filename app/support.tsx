// Powered by OnSpace.AI
// Support Page — Noor Islamic
// Public page — no login required
// Trilingual: Arabic | English | Portuguese (Brazil)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Lang = 'ar' | 'en' | 'pt';

const CONTACT_EMAIL = 'houdaatacado@gmail.com';

const STRINGS: Record<Lang, {
  dir: 'rtl' | 'ltr';
  title: string;
  subtitle: string;
  intro: string;
  emailLabel: string;
  emailCta: string;
  topics: { icon: string; heading: string; body: string }[];
  footer: string;
}> = {
  ar: {
    dir: 'rtl',
    title: 'مركز الدعم',
    subtitle: 'نور إسلامي',
    intro: 'فريق نور إسلامي هنا لمساعدتك. أرسل استفسارك على البريد الإلكتروني أدناه وسنرد في أقرب وقت ممكن.',
    emailLabel: 'البريد الإلكتروني للدعم',
    emailCta: 'أرسل رسالة',
    topics: [
      { icon: 'lock', heading: 'تسجيل الدخول والحساب', body: 'مشاكل تسجيل الدخول، إنشاء الحساب، نسيان كلمة المرور، حذف الحساب.' },
      { icon: 'card-membership', heading: 'الاشتراكات والمدفوعات', body: 'أسئلة حول الاشتراك المدفوع، رسوم غير متوقعة، إلغاء الاشتراك، مشكلات Google Play.' },
      { icon: 'build', heading: 'مشاكل تقنية', body: 'التطبيق لا يعمل، رسائل خطأ، مشكلات الأداء أو التعطل، تثبيت أو تحديث التطبيق.' },
      { icon: 'auto-awesome', heading: 'المساعد بالذكاء الاصطناعي', body: 'ردود غير دقيقة، مشكلات في المحادثة، اقتراحات لتحسين المساعد الإسلامي.' },
      { icon: 'place', heading: 'أوقات الصلاة والموقع', body: 'أوقات صلاة غير صحيحة، مشكلات إذن الموقع، تغيير المدينة يدوياً.' },
      { icon: 'menu-book', heading: 'القرآن والصوت والفيديو', body: 'مشاكل تشغيل القرآن أو الفيديو، الصوت لا يعمل، التلاوات، الأذكار.' },
      { icon: 'verified-user', heading: 'أسئلة الخصوصية', body: 'أسئلة حول جمع البيانات واستخدامها، إلغاء الأذونات، طلب الوصول إلى بياناتك الشخصية.' },
      { icon: 'delete-forever', heading: 'حذف الحساب', body: 'لطلب حذف حسابك وبياناتك الشخصية، راجع صفحة حذف الحساب أو تواصل معنا مباشرةً.' },
    ],
    footer: 'نسعى للرد على جميع الاستفسارات في أقرب وقت ممكن. شكراً لاستخدامك نور إسلامي.',
  },

  en: {
    dir: 'ltr',
    title: 'Support Center',
    subtitle: 'Noor Islamic',
    intro: 'The Noor Islamic team is here to help. Send your question to the email below and we will respond as soon as possible.',
    emailLabel: 'Support Email',
    emailCta: 'Send a Message',
    topics: [
      { icon: 'lock', heading: 'Login & Account Help', body: 'Login problems, account creation, forgot password, account deletion.' },
      { icon: 'card-membership', heading: 'Subscription Help', body: 'Premium subscription questions, unexpected charges, cancellation, Google Play billing issues.' },
      { icon: 'build', heading: 'Technical Problems', body: 'App not working, error messages, performance or crash issues, installation or update problems.' },
      { icon: 'auto-awesome', heading: 'AI Assistant Issues', body: 'Inaccurate responses, conversation problems, suggestions to improve the Islamic AI assistant.' },
      { icon: 'place', heading: 'Prayer Times & Location', body: 'Incorrect prayer times, location permission issues, manual city selection.' },
      { icon: 'menu-book', heading: 'Quran / Audio / Video', body: 'Quran or video playback problems, audio not working, recitations, Adhkar.' },
      { icon: 'verified-user', heading: 'Privacy Questions', body: 'Questions about data collection and use, revoking permissions, requesting access to your personal data.' },
      { icon: 'delete-forever', heading: 'Account Deletion', body: 'To request deletion of your account and personal data, see the Delete Account page or contact us directly.' },
    ],
    footer: 'We aim to respond to all inquiries as soon as possible. Thank you for using Noor Islamic.',
  },

  pt: {
    dir: 'ltr',
    title: 'Central de Suporte',
    subtitle: 'Noor Islamic',
    intro: 'A equipe do Noor Islamic está aqui para ajudar. Envie sua dúvida para o e-mail abaixo e responderemos o mais breve possível.',
    emailLabel: 'E-mail de Suporte',
    emailCta: 'Enviar Mensagem',
    topics: [
      { icon: 'lock', heading: 'Login e Conta', body: 'Problemas de login, criação de conta, esqueci minha senha, exclusão de conta.' },
      { icon: 'card-membership', heading: 'Ajuda com Assinatura', body: 'Dúvidas sobre assinatura Premium, cobranças inesperadas, cancelamento, problemas com o Google Play.' },
      { icon: 'build', heading: 'Problemas Técnicos', body: 'Aplicativo não funciona, mensagens de erro, problemas de desempenho ou falhas, instalação ou atualização.' },
      { icon: 'auto-awesome', heading: 'Assistente de IA', body: 'Respostas imprecisas, problemas na conversa, sugestões para melhorar o assistente islâmico.' },
      { icon: 'place', heading: 'Horários de Oração e Localização', body: 'Horários de oração incorretos, problemas de permissão de localização, seleção manual de cidade.' },
      { icon: 'menu-book', heading: 'Alcorão / Áudio / Vídeo', body: 'Problemas de reprodução do Alcorão ou vídeo, áudio sem funcionar, recitações, Adhkar.' },
      { icon: 'verified-user', heading: 'Perguntas sobre Privacidade', body: 'Dúvidas sobre coleta e uso de dados, revogar permissões, solicitar acesso aos seus dados pessoais.' },
      { icon: 'delete-forever', heading: 'Exclusão de Conta', body: 'Para solicitar a exclusão de sua conta e dados pessoais, veja a página Excluir Conta ou entre em contato diretamente.' },
    ],
    footer: 'Buscamos responder a todas as solicitações o mais breve possível. Obrigado por usar o Noor Islamic.',
  },
};

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
  { key: 'pt', label: 'Português' },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('ar');
  const d = STRINGS[lang];
  const isRTL = d.dir === 'rtl';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[s.header, isRTL && s.rowRev]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#F5F0E8" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, isRTL && s.textRight]}>{d.title}</Text>
          <Text style={[s.headerSub, isRTL && s.textRight]}>{d.subtitle}</Text>
        </View>
      </View>

      {/* Language Switcher */}
      <View style={s.langRow}>
        {LANG_LABELS.map(l => (
          <Pressable key={l.key} style={[s.langBtn, lang === l.key && s.langBtnActive]} onPress={() => setLang(l.key)}>
            <Text style={[s.langBtnText, lang === l.key && s.langBtnTextActive]}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>

        {/* Intro */}
        <Text style={[s.intro, isRTL && s.textRight]}>{d.intro}</Text>

        {/* Email CTA */}
        <View style={s.emailCard}>
          <Text style={[s.emailLabel, isRTL && s.textRight]}>{d.emailLabel}</Text>
          <Text style={[s.emailAddress, isRTL && s.textRight]}>{CONTACT_EMAIL}</Text>
          <Pressable
            style={s.emailBtn}
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Noor Islamic Support`)}
          >
            <MaterialIcons name="send" size={16} color="#060F0A" />
            <Text style={s.emailBtnText}>{d.emailCta}</Text>
          </Pressable>
        </View>

        {/* Topics */}
        {d.topics.map((topic, i) => (
          <View key={i} style={s.topicCard}>
            <View style={[s.topicHeader, isRTL && s.rowRev]}>
              <View style={s.topicIconWrap}>
                <MaterialIcons name={topic.icon as any} size={18} color="#C9A84C" />
              </View>
              <Text style={[s.topicHeading, isRTL && s.textRight]}>{topic.heading}</Text>
            </View>
            <Text style={[s.topicBody, isRTL && s.textRight]}>{topic.body}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <MaterialIcons name="favorite" size={16} color="#C9A84C" />
          <Text style={[s.footerText, isRTL && s.textRight]}>{d.footer}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#060F0A' },
  header:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  backBtn:           { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3225', alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { fontSize: 18, fontWeight: '700', color: '#F5F0E8' },
  headerSub:         { fontSize: 12, color: '#C9A84C', marginTop: 1 },
  langRow:           { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0D1F14', borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  langBtn:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1A3225', borderWidth: 1, borderColor: '#2A5038' },
  langBtnActive:     { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  langBtnText:       { fontSize: 13, color: '#A8B8A0', fontWeight: '600' },
  langBtnTextActive: { color: '#060F0A' },
  content:           { padding: 20, gap: 12 },
  intro:             { fontSize: 14, color: '#A8B8A0', lineHeight: 22, marginBottom: 4 },
  emailCard:         { backgroundColor: '#1B6B4722', borderRadius: 16, padding: 18, gap: 10, borderWidth: 1.5, borderColor: '#C9A84C44', alignItems: 'center' },
  emailLabel:        { fontSize: 12, color: '#5A7A60', fontWeight: '600' },
  emailAddress:      { fontSize: 16, color: '#C9A84C', fontWeight: '700' },
  emailBtn:          { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#C9A84C', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  emailBtnText:      { fontSize: 14, fontWeight: '700', color: '#060F0A' },
  topicCard:         { backgroundColor: '#0D1F14', borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: '#1E3D28' },
  topicHeader:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicIconWrap:     { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1A3225', alignItems: 'center', justifyContent: 'center' },
  topicHeading:      { fontSize: 14, fontWeight: '700', color: '#F5F0E8', flex: 1 },
  topicBody:         { fontSize: 13, color: '#A8B8A0', lineHeight: 20 },
  footer:            { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E3D28' },
  footerText:        { flex: 1, fontSize: 13, color: '#5A7A60', lineHeight: 20 },
  textRight:         { textAlign: 'right' },
  rowRev:            { flexDirection: 'row-reverse' },
});

// Powered by OnSpace.AI
// Delete Account Page — Noor Islamic
// Public page — no login required
// Trilingual: Arabic | English | Portuguese (Brazil)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
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
  steps: { icon: string; heading: string; body: string }[];
  note: string;
  contactLabel: string;
  contactBody: string;
  retainLabel: string;
  retainBody: string;
  timeLabel: string;
  timeBody: string;
}> = {
  ar: {
    dir: 'rtl',
    title: 'حذف حسابك في نور إسلامي',
    subtitle: 'إدارة الحساب والبيانات',
    intro: 'يحق لك طلب حذف حسابك في نور إسلامي وجميع البيانات الشخصية المرتبطة به. اتبع إحدى الطريقتين التاليتين.',
    steps: [
      {
        icon: 'smartphone',
        heading: 'من داخل التطبيق',
        body: 'افتح تطبيق نور إسلامي ← الإعدادات ← الحساب ← احذف الحساب.\nاتبع الخطوات لتأكيد الحذف.',
      },
      {
        icon: 'email',
        heading: 'عبر البريد الإلكتروني',
        body: `أرسل طلب الحذف من عنوان البريد الإلكتروني المرتبط بحسابك إلى:\n\n${CONTACT_EMAIL}\n\nاذكر في الطلب:\n• اسمك الكامل\n• البريد الإلكتروني للحساب\n• طلب صريح بحذف الحساب والبيانات`,
      },
    ],
    note: 'ما الذي سيُحذف؟',
    contactLabel: 'البيانات التي ستُحذف',
    contactBody: 'عند تأكيد الهوية، ستُحذف البيانات التالية:\n\n• الحساب وبيانات الدخول\n• معلومات الملف الشخصي\n• تقدم الدروس وبيانات الاستخدام\n• تاريخ المشاهدة والتفضيلات\n• أي بيانات شخصية مرتبطة بحسابك',
    retainLabel: 'البيانات التي قد تُحتفظ بها',
    retainBody: 'قد يتعين علينا الاحتفاظ ببعض المعلومات لفترة محدودة لأغراض:\n\n• الالتزامات القانونية أو التنظيمية\n• منع الاحتيال والأمان\n• حل النزاعات والتقاضي\n• متطلبات التسجيل المالي\n\nلن تُستخدم هذه البيانات لأي غرض آخر.',
    timeLabel: 'المدة الزمنية',
    timeBody: 'سيُعالَج طلب الحذف خلال 30 يوم عمل من تاريخ التحقق من الهوية. ستتلقى تأكيداً عبر البريد الإلكتروني عند اكتمال الحذف.',
  },

  en: {
    dir: 'ltr',
    title: 'Delete Your Noor Islamic Account',
    subtitle: 'Account & Data Management',
    intro: 'You have the right to request deletion of your Noor Islamic account and associated personal data. Use one of the two methods below.',
    steps: [
      {
        icon: 'smartphone',
        heading: 'In-App',
        body: 'Open Noor Islamic → Settings → Account → Delete Account.\nFollow the prompts to confirm deletion.',
      },
      {
        icon: 'email',
        heading: 'By Email',
        body: `Send a deletion request from the email address associated with your account to:\n\n${CONTACT_EMAIL}\n\nInclude in your request:\n• Your full name\n• Account email address\n• An explicit request to delete account and data`,
      },
    ],
    note: 'What happens to your data?',
    contactLabel: 'Data That Will Be Deleted',
    contactBody: 'Upon identity/account verification, the following will be deleted:\n\n• Account credentials and login information\n• Profile information\n• Lesson progress and usage data\n• Watch history and preferences\n• Any personal data associated with your account',
    retainLabel: 'Data That May Be Retained',
    retainBody: 'We may need to retain some information for a limited period for:\n\n• Legal or regulatory obligations\n• Fraud prevention and security\n• Dispute resolution and litigation\n• Financial recordkeeping requirements\n\nRetained data will not be used for any other purpose.',
    timeLabel: 'Processing Time',
    timeBody: 'Deletion requests are processed within 30 business days of identity verification. You will receive an email confirmation once deletion is complete.',
  },

  pt: {
    dir: 'ltr',
    title: 'Excluir sua Conta Noor Islamic',
    subtitle: 'Gerenciamento de Conta e Dados',
    intro: 'Você tem o direito de solicitar a exclusão de sua conta Noor Islamic e dos dados pessoais associados. Use um dos dois métodos abaixo.',
    steps: [
      {
        icon: 'smartphone',
        heading: 'No Aplicativo',
        body: 'Abra o Noor Islamic → Configurações → Conta → Excluir Conta.\nSiga as instruções para confirmar a exclusão.',
      },
      {
        icon: 'email',
        heading: 'Por E-mail',
        body: `Envie uma solicitação de exclusão do endereço de e-mail associado à sua conta para:\n\n${CONTACT_EMAIL}\n\nIncluir na solicitação:\n• Seu nome completo\n• E-mail da conta\n• Uma solicitação explícita de exclusão da conta e dos dados`,
      },
    ],
    note: 'O que acontece com seus dados?',
    contactLabel: 'Dados que Serão Excluídos',
    contactBody: 'Após verificação de identidade/conta, os seguintes dados serão excluídos:\n\n• Credenciais e informações de login\n• Informações de perfil\n• Progresso de lições e dados de uso\n• Histórico de exibição e preferências\n• Quaisquer dados pessoais associados à sua conta',
    retainLabel: 'Dados que Podem Ser Retidos',
    retainBody: 'Podemos precisar reter algumas informações por um período limitado para:\n\n• Obrigações legais ou regulatórias\n• Prevenção de fraudes e segurança\n• Resolução de disputas e litígios\n• Requisitos de registro financeiro\n\nOs dados retidos não serão usados para nenhum outro propósito.',
    timeLabel: 'Prazo de Processamento',
    timeBody: 'As solicitações de exclusão são processadas em até 30 dias úteis após a verificação de identidade. Você receberá uma confirmação por e-mail quando a exclusão for concluída.',
  },
};

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
  { key: 'pt', label: 'Português' },
];

export default function DeleteAccountScreen() {
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
          <Text style={[s.headerTitle, isRTL && s.textRight]} numberOfLines={2}>{d.title}</Text>
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

        {/* Warning banner */}
        <View style={[s.warnBanner, isRTL && s.rowRev]}>
          <MaterialIcons name="warning" size={20} color="#E74C3C" />
          <Text style={[s.warnText, isRTL && s.textRight]}>{d.intro}</Text>
        </View>

        {/* Steps */}
        {d.steps.map((step, i) => (
          <View key={i} style={s.stepCard}>
            <View style={[s.stepHeader, isRTL && s.rowRev]}>
              <View style={s.stepIconWrap}>
                <MaterialIcons name={step.icon as any} size={20} color="#C9A84C" />
              </View>
              <Text style={[s.stepHeading, isRTL && s.textRight]}>{step.heading}</Text>
            </View>
            <Text style={[s.stepBody, isRTL && s.textRight]}>{step.body}</Text>
          </View>
        ))}

        {/* Data info */}
        <Text style={[s.sectionNote, isRTL && s.textRight]}>{d.note}</Text>

        {[
          { label: d.contactLabel, body: d.contactBody, icon: 'delete-forever', color: '#E74C3C' },
          { label: d.retainLabel, body: d.retainBody,  icon: 'security',       color: '#F39C12' },
          { label: d.timeLabel,   body: d.timeBody,    icon: 'schedule',       color: '#3498DB' },
        ].map((item, i) => (
          <View key={i} style={s.infoCard}>
            <View style={[s.infoHeader, isRTL && s.rowRev]}>
              <MaterialIcons name={item.icon as any} size={16} color={item.color} />
              <Text style={[s.infoHeading, { color: item.color }, isRTL && s.textRight]}>{item.label}</Text>
            </View>
            <Text style={[s.infoBody, isRTL && s.textRight]}>{item.body}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={[s.contactFooter, isRTL && s.rowRev]}>
          <MaterialIcons name="email" size={16} color="#C9A84C" />
          <Text style={s.contactEmail}>{CONTACT_EMAIL}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#060F0A' },
  header:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  backBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3225', alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 16, fontWeight: '700', color: '#F5F0E8', lineHeight: 22 },
  headerSub:       { fontSize: 12, color: '#C9A84C', marginTop: 1 },
  langRow:         { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0D1F14', borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  langBtn:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1A3225', borderWidth: 1, borderColor: '#2A5038' },
  langBtnActive:   { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  langBtnText:     { fontSize: 13, color: '#A8B8A0', fontWeight: '600' },
  langBtnTextActive:{ color: '#060F0A' },
  content:         { padding: 20, gap: 12 },
  warnBanner:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#E74C3C11', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E74C3C44', marginBottom: 8 },
  warnText:        { flex: 1, fontSize: 14, color: '#A8B8A0', lineHeight: 22 },
  stepCard:        { backgroundColor: '#1A3225', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: '#2A5038' },
  stepHeader:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIconWrap:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D1F14', alignItems: 'center', justifyContent: 'center' },
  stepHeading:     { fontSize: 15, fontWeight: '700', color: '#F5F0E8', flex: 1 },
  stepBody:        { fontSize: 14, color: '#A8B8A0', lineHeight: 22 },
  sectionNote:     { fontSize: 16, fontWeight: '700', color: '#C9A84C', marginTop: 8 },
  infoCard:        { backgroundColor: '#0D1F14', borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: '#1E3D28' },
  infoHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoHeading:     { fontSize: 14, fontWeight: '700', flex: 1 },
  infoBody:        { fontSize: 13, color: '#A8B8A0', lineHeight: 20 },
  contactFooter:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, justifyContent: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E3D28' },
  contactEmail:    { fontSize: 14, color: '#C9A84C', fontWeight: '600' },
  textRight:       { textAlign: 'right' },
  rowRev:          { flexDirection: 'row-reverse' },
});

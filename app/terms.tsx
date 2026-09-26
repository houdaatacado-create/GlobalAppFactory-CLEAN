// Powered by OnSpace.AI
// Terms of Use — Noor Islamic
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

const LAST_UPDATED = 'September 24, 2026';
const CONTACT_EMAIL = 'houdaatacado@gmail.com';
const APP_NAME = 'Noor Islamic';

const STRINGS: Record<Lang, {
  dir: 'rtl' | 'ltr';
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
}> = {
  ar: {
    dir: 'rtl',
    title: 'شروط الاستخدام',
    subtitle: 'نور إسلامي',
    lastUpdated: `آخر تحديث: ${LAST_UPDATED}`,
    sections: [
      {
        heading: '1. القبول والاستخدام',
        body: `بتنزيل تطبيق نور إسلامي أو استخدامه، فإنك توافق على هذه الشروط. إن لم توافق على هذه الشروط، يُرجى عدم استخدام التطبيق.\n\nيُتاح هذا التطبيق للمستخدمين الذين تبلغ أعمارهم 13 عاماً فما فوق. يُوافق المستخدمون الذين تتراوح أعمارهم بين 13 و17 عاماً على أن استخدامهم يتم بإذن الولي الأمر.`,
      },
      {
        heading: '2. حسابات المستخدمين',
        body: `قد تُتيح بعض الميزات إنشاء حساب. أنت مسؤول عن:\n\n• الحفاظ على سرية بيانات تسجيل الدخول\n• جميع الأنشطة التي تجري من خلال حسابك\n• إخطارنا فوراً في حال الاشتباه باختراق الحساب\n\nيُحظر استخدام معلومات مضللة أو انتحال هوية أشخاص آخرين عند إنشاء الحساب.`,
      },
      {
        heading: '3. الاشتراكات المدفوعة وفوترة Google Play',
        body: `نور إسلامي مجاني للتنزيل وقد يقدم اشتراكات Premium اختيارية.\n\n• تُعالَج المدفوعات عبر Google Play وفقاً لشروط Google.\n• تُجدَّد الاشتراكات تلقائياً ما لم تُلغَ قبل 24 ساعة من نهاية فترة الاشتراك الحالية.\n• لإلغاء الاشتراك، راجع إعدادات Google Play على جهازك.\n• لا يتحمل نور إسلامي مسؤولية الأخطاء المتعلقة بالدفع من جانب Google.`,
      },
      {
        heading: '4. المساعد الإسلامي بالذكاء الاصطناعي',
        body: `يوفر نور إسلامي مساعداً إسلامياً مدعوماً بالذكاء الاصطناعي للأغراض التعليمية والمعلوماتية فقط.\n\n• ردود الذكاء الاصطناعي قد تحتوي على أخطاء أو عدم دقة.\n• لا تُعدّ ردود الذكاء الاصطناعي فتاوى دينية رسمية.\n• للمسائل الدينية المهمة، يُنصح بمراجعة علماء مؤهلين.\n• لا تُرسل عبر المساعد معلومات شخصية بالغة الحساسية.`,
      },
      {
        heading: '5. إخلاء المسؤولية عن المعلومات الدينية',
        body: `المحتوى الإسلامي في التطبيق (القرآن، الحديث، التفسير، الأذكار، الإرشادات) مقدَّم لأغراض تعليمية فقط.\n\n• لا يُشكّل هذا المحتوى فتوى دينية رسمية ولا يحل محل العلماء المؤهلين.\n• قد تنتشر اجتهادات متعددة في مسائل الفقه الإسلامي.\n• على المستخدم تحمّل مسؤولية التحقق من الأحكام الدينية الهامة مع علماء معتمدين.`,
      },
      {
        heading: '6. محتوى الفيديو واستخدامه',
        body: `محتوى الفيديو في نور إسلامي مرخَّص بموجب رخص مفتوحة (CC BY، CC BY-SA، ملكية عامة) أو مملوك لنا.\n\n• يُشغَّل المحتوى داخل التطبيق فقط.\n• يُحظر تنزيل المحتوى أو إعادة توزيعه أو نشره دون إذن صريح.\n• يُحظر استخدام المحتوى لأغراض تجارية دون ترخيص مناسب.`,
      },
      {
        heading: '7. الملكية الفكرية',
        body: `تطبيق نور إسلامي وتصاميمه وشعاراته وأكواده وواجهاته تعود ملكيتها لنا أو مرخَّصة لنا. يُمنح المستخدمون ترخيصاً محدوداً وشخصياً وغير قابل للتحويل لاستخدام التطبيق وفقاً لهذه الشروط.\n\nيُحظر نسخ التطبيق أو تعديله أو عكس هندسته أو إنشاء أعمال مشتقة منه.`,
      },
      {
        heading: '8. الاستخدامات المحظورة',
        body: `يُحظر استخدام التطبيق في أي مما يلي:\n\n• نشر محتوى مسيء أو مضلل أو غير قانوني\n• انتهاك حقوق الآخرين\n• محاولة اختراق أمان التطبيق أو أنظمته\n• استخدام وسائل آلية للوصول غير المصرح به\n• إعادة بيع الخدمة أو إساءة استخدامها\n• انتحال الهوية أو التظاهر بالانتماء إلى نور إسلامي`,
      },
      {
        heading: '9. تعليق الحساب وإنهائه',
        body: `نحتفظ بالحق في تعليق أو إنهاء حسابك في حال:\n\n• انتهاك هذه الشروط\n• الاشتباه بالاحتيال أو الاستخدام غير المشروع\n• عدم دفع رسوم الاشتراك\n• طلب المستخدم نفسه حذف الحساب\n\nيمكنك إنهاء حسابك في أي وقت من خلال إعدادات التطبيق.`,
      },
      {
        heading: '10. تحديد المسؤولية',
        body: `إلى الحد الذي يسمح به القانون المعمول به:\n\n• لا يتحمل نور إسلامي مسؤولية الأضرار غير المباشرة أو العرضية أو التبعية.\n• المحتوى الإسلامي مقدَّم "كما هو" دون ضمانات.\n• نور إسلامي ليس مسؤولاً عن قرارات دينية يتخذها المستخدمون بناءً على محتوى التطبيق.`,
      },
      {
        heading: '11. التغييرات في الخدمة',
        body: `نحتفظ بالحق في تعديل التطبيق أو الميزات أو الشروط في أي وقت. سنُعلم المستخدمين بالتغييرات الجوهرية من خلال:\n\n• إشعار داخل التطبيق\n• تحديث صفحة الشروط\n• البريد الإلكتروني (إن أمكن)\n\nاستمرار استخدامك للتطبيق بعد التغييرات يُعدّ قبولاً بها.`,
      },
      {
        heading: '12. التواصل معنا',
        body: `لأي استفسار أو شكوى أو طلب يتعلق بهذه الشروط:\n\n${CONTACT_EMAIL}`,
      },
    ],
  },

  en: {
    dir: 'ltr',
    title: 'Terms of Use',
    subtitle: 'Noor Islamic',
    lastUpdated: `Last Updated: ${LAST_UPDATED}`,
    sections: [
      {
        heading: '1. Acceptance & Use',
        body: `By downloading or using Noor Islamic, you agree to these Terms of Use. If you do not agree, please do not use the app.\n\nThe app is available to users aged 13 and over. Users aged 13–17 confirm that their use is authorized by a parent or guardian.`,
      },
      {
        heading: '2. User Accounts',
        body: `Some features may require an account. You are responsible for:\n\n• Keeping your login credentials confidential\n• All activity that occurs through your account\n• Notifying us immediately if you suspect account compromise\n\nYou must not use misleading information or impersonate others when creating an account.`,
      },
      {
        heading: '3. Premium Subscriptions & Google Play Billing',
        body: `Noor Islamic is free to download and may offer optional Premium subscriptions.\n\n• Payments are processed via Google Play under Google's terms.\n• Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period.\n• To cancel, manage subscriptions in your Google Play settings.\n• Noor Islamic is not responsible for billing errors on Google's side.`,
      },
      {
        heading: '4. AI-Generated Content',
        body: `Noor Islamic provides an AI-powered Islamic assistant for educational and informational purposes only.\n\n• AI responses may contain errors or inaccuracies.\n• AI responses do not constitute official religious rulings (fatwas).\n• For important religious matters, consult qualified Islamic scholars.\n• Do not share highly sensitive personal information with the AI assistant.`,
      },
      {
        heading: '5. Islamic/Religious Information Disclaimer',
        body: `Islamic content in the app (Quran, Hadith, Tafsir, Adhkar, guidance) is provided for educational purposes only.\n\n• This content does not constitute official religious rulings and does not replace qualified scholars.\n• Multiple scholarly opinions may exist on matters of Islamic jurisprudence.\n• Users are responsible for verifying important religious matters with qualified scholars.`,
      },
      {
        heading: '6. Video & Content Usage',
        body: `Video content in Noor Islamic is licensed under open licenses (CC BY, CC BY-SA, Public Domain) or owned by us.\n\n• Content plays inside the app only.\n• Downloading, redistributing or republishing content without explicit permission is prohibited.\n• Commercial use of content without an appropriate license is prohibited.`,
      },
      {
        heading: '7. Intellectual Property',
        body: `The Noor Islamic app, its design, logos, code and interfaces are owned by or licensed to us. Users are granted a limited, personal, non-transferable license to use the app under these terms.\n\nCopying, modifying, reverse-engineering or creating derivative works from the app is prohibited.`,
      },
      {
        heading: '8. Prohibited Use',
        body: `You may not use the app to:\n\n• Post offensive, misleading or unlawful content\n• Violate others' rights\n• Attempt to breach app security or systems\n• Use automated means for unauthorized access\n• Resell or abuse the service\n• Impersonate others or misrepresent affiliation with Noor Islamic`,
      },
      {
        heading: '9. Account Suspension & Termination',
        body: `We reserve the right to suspend or terminate your account if you:\n\n• Violate these Terms\n• Are suspected of fraud or unlawful use\n• Fail to pay subscription fees\n• Request deletion yourself\n\nYou may terminate your account at any time in app settings.`,
      },
      {
        heading: '10. Limitation of Liability',
        body: `To the extent permitted by applicable law:\n\n• Noor Islamic is not liable for indirect, incidental or consequential damages.\n• Islamic content is provided "as is" without warranties.\n• Noor Islamic is not responsible for religious decisions made by users based on app content.`,
      },
      {
        heading: '11. Changes to the Service',
        body: `We reserve the right to modify the app, features or these Terms at any time. We will notify users of material changes through:\n\n• In-app notification\n• Updated Terms page\n• Email (where applicable)\n\nContinued use after changes constitutes acceptance.`,
      },
      {
        heading: '12. Contact Us',
        body: `For any questions, complaints or requests regarding these Terms:\n\n${CONTACT_EMAIL}`,
      },
    ],
  },

  pt: {
    dir: 'ltr',
    title: 'Termos de Uso',
    subtitle: 'Noor Islamic',
    lastUpdated: `Última atualização: ${LAST_UPDATED}`,
    sections: [
      {
        heading: '1. Aceitação e Uso',
        body: `Ao baixar ou usar o Noor Islamic, você concorda com estes Termos de Uso. Se não concordar, por favor não use o aplicativo.\n\nO aplicativo está disponível para usuários com 13 anos ou mais. Usuários entre 13 e 17 anos confirmam que seu uso é autorizado por um responsável legal.`,
      },
      {
        heading: '2. Contas de Usuário',
        body: `Alguns recursos podem exigir uma conta. Você é responsável por:\n\n• Manter suas credenciais de login confidenciais\n• Toda atividade que ocorra em sua conta\n• Nos notificar imediatamente em caso de suspeita de comprometimento da conta\n\nNão use informações enganosas ou se faça passar por outras pessoas ao criar uma conta.`,
      },
      {
        heading: '3. Assinaturas Premium e Faturamento Google Play',
        body: `O Noor Islamic é gratuito para download e pode oferecer assinaturas Premium opcionais.\n\n• Os pagamentos são processados pelo Google Play conforme os termos do Google.\n• As assinaturas são renovadas automaticamente, a menos que canceladas pelo menos 24 horas antes do final do período atual.\n• Para cancelar, gerencie suas assinaturas nas configurações do Google Play.\n• O Noor Islamic não se responsabiliza por erros de cobrança do Google.`,
      },
      {
        heading: '4. Conteúdo Gerado por IA',
        body: `O Noor Islamic oferece um assistente islâmico com IA para fins educativos e informativos apenas.\n\n• As respostas da IA podem conter erros ou imprecisões.\n• As respostas da IA não constituem decisões religiosas oficiais (fatwas).\n• Para assuntos religiosos importantes, consulte estudiosos islâmicos qualificados.\n• Não compartilhe informações pessoais altamente sensíveis com o assistente de IA.`,
      },
      {
        heading: '5. Isenção de Responsabilidade sobre Informações Religiosas',
        body: `O conteúdo islâmico no aplicativo (Alcorão, Hadith, Tafsir, Adhkar, orientações) é fornecido apenas para fins educativos.\n\n• Este conteúdo não constitui decisões religiosas oficiais e não substitui estudiosos qualificados.\n• Podem existir múltiplas opiniões de estudiosos sobre matérias de jurisprudência islâmica.\n• Os usuários são responsáveis por verificar assuntos religiosos importantes com estudiosos qualificados.`,
      },
      {
        heading: '6. Uso de Vídeo e Conteúdo',
        body: `O conteúdo de vídeo no Noor Islamic é licenciado sob licenças abertas (CC BY, CC BY-SA, Domínio Público) ou é de nossa propriedade.\n\n• O conteúdo é reproduzido apenas dentro do aplicativo.\n• É proibido baixar, redistribuir ou republicar conteúdo sem permissão explícita.\n• O uso comercial de conteúdo sem licença adequada é proibido.`,
      },
      {
        heading: '7. Propriedade Intelectual',
        body: `O aplicativo Noor Islamic, seu design, logotipos, código e interfaces são de nossa propriedade ou licenciados para nós. Os usuários recebem uma licença limitada, pessoal e intransferível para usar o aplicativo nos termos destas condições.\n\nÉ proibido copiar, modificar, fazer engenharia reversa ou criar obras derivadas do aplicativo.`,
      },
      {
        heading: '8. Uso Proibido',
        body: `Você não pode usar o aplicativo para:\n\n• Publicar conteúdo ofensivo, enganoso ou ilegal\n• Violar os direitos de outros\n• Tentar violar a segurança do aplicativo ou seus sistemas\n• Usar meios automatizados para acesso não autorizado\n• Revender ou abusar do serviço\n• Se passar por outras pessoas ou falsamente se declarar afiliado ao Noor Islamic`,
      },
      {
        heading: '9. Suspensão e Encerramento de Conta',
        body: `Reservamo-nos o direito de suspender ou encerrar sua conta se você:\n\n• Violar estes Termos\n• For suspeito de fraude ou uso ilícito\n• Não pagar as taxas de assinatura\n• Solicitar a exclusão você mesmo\n\nVocê pode encerrar sua conta a qualquer momento nas configurações do aplicativo.`,
      },
      {
        heading: '10. Limitação de Responsabilidade',
        body: `Na medida permitida pela lei aplicável:\n\n• O Noor Islamic não é responsável por danos indiretos, incidentais ou consequentes.\n• O conteúdo islâmico é fornecido "como está", sem garantias.\n• O Noor Islamic não é responsável por decisões religiosas tomadas pelos usuários com base no conteúdo do aplicativo.`,
      },
      {
        heading: '11. Alterações no Serviço',
        body: `Reservamo-nos o direito de modificar o aplicativo, recursos ou estes Termos a qualquer momento. Notificaremos os usuários sobre alterações relevantes através de:\n\n• Notificação no aplicativo\n• Página de Termos atualizada\n• E-mail (quando aplicável)\n\nO uso contínuo após as alterações constitui aceitação.`,
      },
      {
        heading: '12. Contato',
        body: `Para quaisquer dúvidas, reclamações ou solicitações relacionadas a estes Termos:\n\n${CONTACT_EMAIL}`,
      },
    ],
  },
};

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
  { key: 'pt', label: 'Português' },
];

export default function TermsScreen() {
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
        <View style={[s.metaRow, isRTL && s.rowRev]}>
          <MaterialIcons name="update" size={13} color="#5A7A60" />
          <Text style={s.metaText}>{d.lastUpdated}</Text>
        </View>

        {d.sections.map((sec, i) => (
          <View key={i} style={s.section}>
            <Text style={[s.sectionHeading, isRTL && s.textRight]}>{sec.heading}</Text>
            <Text style={[s.sectionBody, isRTL && s.textRight]}>{sec.body}</Text>
          </View>
        ))}

        <View style={s.footer}>
          <MaterialIcons name="gavel" size={18} color="#C9A84C" />
          <Text style={s.footerText}>{APP_NAME} · {CONTACT_EMAIL}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#060F0A' },
  header:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3225', alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: '#F5F0E8' },
  headerSub:        { fontSize: 12, color: '#C9A84C', marginTop: 1 },
  langRow:          { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0D1F14', borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  langBtn:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1A3225', borderWidth: 1, borderColor: '#2A5038' },
  langBtnActive:    { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  langBtnText:      { fontSize: 13, color: '#A8B8A0', fontWeight: '600' },
  langBtnTextActive:{ color: '#060F0A' },
  content:          { padding: 20, gap: 4 },
  metaRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  metaText:         { fontSize: 12, color: '#5A7A60' },
  section:          { marginTop: 18, gap: 8 },
  sectionHeading:   { fontSize: 15, fontWeight: '700', color: '#C9A84C', borderLeftWidth: 3, borderLeftColor: '#1B6B47', paddingLeft: 10 },
  sectionBody:      { fontSize: 14, color: '#A8B8A0', lineHeight: 22 },
  footer:           { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, justifyContent: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E3D28' },
  footerText:       { fontSize: 13, color: '#5A7A60' },
  textRight:        { textAlign: 'right' },
  rowRev:           { flexDirection: 'row-reverse' },
});

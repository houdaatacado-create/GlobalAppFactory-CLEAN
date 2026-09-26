// Powered by OnSpace.AI
// Privacy Policy — Noor Islamic
// Public page — no login required
// Trilingual: Arabic | English | Portuguese (Brazil)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  StatusBar,
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
  contact: string;
  sections: { heading: string; body: string }[];
}> = {
  ar: {
    dir: 'rtl',
    title: 'سياسة الخصوصية',
    subtitle: 'نور إسلامي',
    lastUpdated: `آخر تحديث: ${LAST_UPDATED}`,
    contact: `للتواصل: ${CONTACT_EMAIL}`,
    sections: [
      {
        heading: 'مقدمة',
        body: `تحترم تطبيق "نور إسلامي" خصوصية مستخدميه وتلتزم بمعالجة المعلومات الشخصية بمسؤولية وشفافية. توضح هذه السياسة كيفية جمع البيانات واستخدامها ومشاركتها وحمايتها عند استخدامك لتطبيق نور إسلامي على نظام أندرويد أو غيره.`,
      },
      {
        heading: 'أذونات الموقع',
        body: `قد يطلب تطبيق نور إسلامي إذن الوصول إلى موقعك الجغرافي (التقريبي أو الدقيق) عند الضرورة لتقديم الميزات التالية:\n\n• أوقات الصلاة بناءً على موقعك الفعلي\n• تحديد اتجاه القبلة\n• الخدمات الإسلامية المرتبطة بالموقع\n• تحديد مدينة المستخدم للخدمات ذات الصلة\n\nلا يُستخدم موقعك للأغراض الإعلانية. يمكنك رفض إذن الموقع أو إلغاؤه في أي وقت من إعدادات أندرويد. يمكن استخدام التطبيق باختيار المدينة يدوياً إن رفضت إذن الموقع.`,
      },
      {
        heading: 'المساعد الإسلامي بالذكاء الاصطناعي',
        body: `يتضمن تطبيق نور إسلامي مساعداً إسلامياً مدعوماً بالذكاء الاصطناعي. قد تُعالَج الأسئلة والرسائل والنصوص التي يدخلها المستخدم لتوليد الردود.\n\nقد يتم استخدام موفري الذكاء الاصطناعي أو واجهات برمجة التطبيقات (APIs) من أطراف خارجية لمعالجة الطلبات. لا يُنصح بإرسال كلمات المرور أو المعلومات المصرفية أو أرقام الهوية الحكومية أو أي معلومات شخصية بالغة الحساسية عبر المساعد.\n\nإجابات الذكاء الاصطناعي في الأمور الدينية هي للأغراض التعليمية فقط وقد تحتوي على أخطاء. يُنصح بمراجعة علماء مؤهلين في المسائل الدينية المهمة.`,
      },
      {
        heading: 'الحساب وتسجيل الدخول',
        body: `إذا أتاح التطبيق إنشاء حساب أو تسجيل الدخول، فقد يعالج نور إسلامي المعلومات التالية:\n\n• عنوان البريد الإلكتروني\n• معرّف المستخدم / الحساب\n• معلومات المصادقة\n• تفضيلات الحساب\n\nتُستخدم هذه المعلومات فقط لتقديم الخدمة وإدارة حسابك.`,
      },
      {
        heading: 'محتوى الفيديو',
        body: `يتضمن تطبيق نور إسلامي محتوى فيديو دينياً وتعليمياً. تُشغَّل جميع مقاطع الفيديو داخل التطبيق دون إعادة توجيه خارجية. قد يُستخدم مزودو استضافة الفيديو (مثل Cloudflare Stream) لبث المحتوى. قد تعالج البنية التحتية للفيديو بيانات تقنية مثل:\n\n• عنوان IP\n• معلومات الجهاز\n• بيانات التشغيل والأداء\n• معلومات البث الضرورية لتقديم الخدمة\n\nلا تُباع هذه المعلومات كبيانات شخصية.`,
      },
      {
        heading: 'المحتوى الإسلامي',
        body: `يقدم التطبيق: القرآن الكريم، التلاوات، التفسير، الحديث الشريف، الأذكار، أوقات الصلاة، إرشادات الحج والعمرة، التعليم الإسلامي، الفيديوهات الدينية، والمساعد الإسلامي بالذكاء الاصطناعي.\n\nلا يشترط التطبيق على المستخدمين الإفصاح رسمياً عن ديانتهم لاستخدام الخدمة. لا تُباع الاهتمامات الدينية أو التفاعلات ولا تُستخدم لإنشاء ملفات إعلانية مبنية على المعتقد الديني.`,
      },
      {
        heading: 'الإشعارات',
        body: `عند تفعيل الإشعارات، قد يستخدم التطبيق:\n\n• رمز الإشعار (Push Token)\n• تفضيلات الإشعارات\n\nقد تتضمن الإشعارات تذكيرات الصلاة، الأذكار، التذكيرات الدينية، إشعارات الخدمة، وتحديثات التطبيق. يمكن تعطيل الإشعارات من الإعدادات.`,
      },
      {
        heading: 'الاشتراكات والمدفوعات',
        body: `نور إسلامي مجاني للتنزيل ويقدم اشتراكات مدفوعة اختيارية أو ميزات Premium. تُعالَج مدفوعات Google Play من قِبل Google مباشرةً. قد يتلقى نور إسلامي معلومات مثل:\n\n• حالة الاشتراك / الشراء\n• معرّف المنتج\n• تأكيد المعاملة\n\nلا يتلقى التطبيق ولا يخزن تفاصيل بطاقة الائتمان الكاملة — تُعالَج المدفوعات من قِبل Google Play.`,
      },
      {
        heading: 'البيانات التقنية',
        body: `بحسب الخدمات المستخدمة، قد يعالج التطبيق:\n\n• نوع الجهاز ونظام التشغيل وإصدار التطبيق\n• عنوان IP\n• بيانات الأعطال والتشخيص\n• بيانات الأداء ومعلومات الأمان\n• بيانات استخدام ميزات التطبيق`,
      },
      {
        heading: 'مزودو الخدمات الخارجيون',
        body: `قد يستخدم نور إسلامي موفري خدمات لأغراض منها:\n\n• الاستضافة السحابية وقواعد البيانات\n• المصادقة وتسجيل الدخول\n• الذكاء الاصطناعي\n• استضافة وبث الفيديو\n• الإشعارات الفورية\n• التحليلات وتقارير الأعطال\n• الاشتراكات والمدفوعات\n• الأمن والبنية التحتية\n\nيُشترط في هؤلاء الموفرين الالتزام بمعايير الخصوصية المناسبة.`,
      },
      {
        heading: 'مشاركة البيانات',
        body: `لا يبيع نور إسلامي معلوماتك الشخصية. لا تُشارك البيانات إلا مع موفري الخدمات عند الضرورة لتشغيل ميزات التطبيق أو الامتثال للقانون أو ضمان الأمان.`,
      },
      {
        heading: 'الاحتفاظ بالبيانات',
        body: `تُحتفظ بالمعلومات الشخصية فقط بالقدر اللازم لتقديم الخدمة أو الالتزامات القانونية أو الأمان أو منع الاحتيال أو إدارة الاشتراكات. تُحذف البيانات أو تُجهَّل عند انتفاء الحاجة إليها.`,
      },
      {
        heading: 'حذف الحساب والبيانات',
        body: `يمكن طلب حذف حسابك وبياناتك الشخصية عبر خيار حذف الحساب داخل التطبيق أو بالتواصل على:\n\n${CONTACT_EMAIL}\n\nيُرجى إرسال الطلب من عنوان البريد الإلكتروني المرتبط بحسابك. بعد التحقق، سيُحذف الحساب والبيانات المرتبطة به ما لم تكن هناك التزامات قانونية أو أمنية أو مالية تستوجب الاحتفاظ ببعضها.`,
      },
      {
        heading: 'تواصل معنا',
        body: `لأي استفسار أو طلب يتعلق بهذه السياسة، يرجى التواصل على:\n\n${CONTACT_EMAIL}`,
      },
    ],
  },

  en: {
    dir: 'ltr',
    title: 'Privacy Policy',
    subtitle: 'Noor Islamic',
    lastUpdated: `Last Updated: ${LAST_UPDATED}`,
    contact: `Contact: ${CONTACT_EMAIL}`,
    sections: [
      {
        heading: 'Introduction',
        body: `Noor Islamic respects users' privacy and is committed to handling personal information responsibly and transparently. This policy explains how data is collected, used, shared and protected when you use the Noor Islamic app.`,
      },
      {
        heading: 'Location',
        body: `Noor Islamic may request approximate or precise location permission when necessary for:\n\n• Prayer times based on your actual location\n• Qibla direction\n• Location-based Islamic services\n• Determining your city for relevant features\n\nYour location is NOT used for advertising. You may deny or revoke location permission at any time in Android settings. The app supports manual city selection if location permission is denied.`,
      },
      {
        heading: 'Islamic AI Assistant',
        body: `Noor Islamic contains an AI-powered Islamic assistant. Questions, messages and text you submit may be processed to generate responses. Third-party AI APIs/providers may be used. Do not submit passwords, banking details, government ID numbers or unnecessarily sensitive personal information.\n\nAI religious answers are for educational/informational purposes and may contain errors. Consult qualified scholars for important religious rulings.`,
      },
      {
        heading: 'Account / Login',
        body: `If the app allows account creation or sign-in, Noor Islamic may process:\n\n• Email address\n• User/account ID\n• Authentication information\n• Account preferences\n\nThis information is used only to provide the service and manage your account.`,
      },
      {
        heading: 'Video Content',
        body: `Noor Islamic contains religious and educational video content. All videos play inside the app — no external redirects. Video hosting providers (e.g. Cloudflare Stream) may be used. The video infrastructure may process technical data such as:\n\n• IP address\n• Device information\n• Playback and performance data\n• Streaming information necessary to deliver the video\n\nThis information is not sold as personal data.`,
      },
      {
        heading: 'Islamic Content',
        body: `The app provides: Quran, recitations, Tafsir, Hadith, Adhkar, prayer times, Hajj and Umrah guidance, Islamic education, religious videos and the Islamic AI assistant.\n\nUsers are not required to formally declare their religion to use the service. Religious interests or interactions are not sold or used to create advertising profiles based on religious belief.`,
      },
      {
        heading: 'Notifications',
        body: `If notifications are enabled, the app may use:\n\n• Push notification token\n• Notification preferences\n\nNotifications may include prayer reminders, Adhkar reminders, religious reminders, service notifications and app updates. Notifications can be disabled in settings.`,
      },
      {
        heading: 'Subscriptions & Payments',
        body: `Noor Islamic is free to download and may offer optional paid subscriptions or Premium features. Google Play payments are processed by Google directly. Noor Islamic may receive:\n\n• Subscription/purchase status\n• Product/subscription ID\n• Transaction confirmation\n\nNoor Islamic does NOT receive or store your complete credit-card details — payments are handled by Google Play.`,
      },
      {
        heading: 'Technical Data',
        body: `Depending on the services and SDKs used, the app may process:\n\n• Device type, operating system, app version\n• IP address\n• Crash and diagnostic data\n• Performance and security data\n• App feature usage`,
      },
      {
        heading: 'Third-Party Service Providers',
        body: `Noor Islamic may use service providers for:\n\n• Cloud hosting and databases\n• Authentication\n• Artificial intelligence\n• Video hosting and streaming\n• Push notifications\n• Analytics and crash reporting\n• Subscriptions and payments\n• Security and infrastructure\n\nProviders are required to maintain appropriate privacy standards.`,
      },
      {
        heading: 'Data Sharing',
        body: `Noor Islamic does not sell your personal information. Data is only shared with service providers when necessary to operate the app, comply with applicable law or maintain security.`,
      },
      {
        heading: 'Data Retention',
        body: `Personal information is retained only as long as necessary for providing the service, legal obligations, security, fraud prevention or subscription management. Data that is no longer necessary is deleted or anonymized.`,
      },
      {
        heading: 'Account and Data Deletion',
        body: `You may request deletion of your account and associated personal data via the Delete Account option inside the app or by contacting:\n\n${CONTACT_EMAIL}\n\nPlease send the request from the email address associated with your Noor Islamic account. After verification, your account and associated data will be deleted, except information that must be retained for legal, security or financial-recordkeeping obligations.`,
      },
      {
        heading: 'Contact Us',
        body: `For any privacy questions or requests, please contact:\n\n${CONTACT_EMAIL}`,
      },
    ],
  },

  pt: {
    dir: 'ltr',
    title: 'Política de Privacidade',
    subtitle: 'Noor Islamic',
    lastUpdated: `Última atualização: ${LAST_UPDATED}`,
    contact: `Contato: ${CONTACT_EMAIL}`,
    sections: [
      {
        heading: 'Introdução',
        body: `O Noor Islamic respeita a privacidade dos usuários e está comprometido em tratar informações pessoais de forma responsável e transparente. Esta política explica como os dados são coletados, usados, compartilhados e protegidos ao utilizar o aplicativo Noor Islamic.`,
      },
      {
        heading: 'Localização',
        body: `O Noor Islamic pode solicitar permissão de localização aproximada ou precisa quando necessário para:\n\n• Horários de oração com base na sua localização real\n• Direção da Qibla\n• Serviços islâmicos baseados em localização\n• Identificar sua cidade para recursos relevantes\n\nSua localização NÃO é usada para publicidade. Você pode negar ou revogar a permissão de localização nas configurações do Android. O aplicativo suporta seleção manual de cidade caso a permissão seja negada.`,
      },
      {
        heading: 'Assistente Islâmico com IA',
        body: `O Noor Islamic contém um assistente islâmico com inteligência artificial. Perguntas, mensagens e textos enviados podem ser processados para gerar respostas. APIs/provedores de IA de terceiros podem ser utilizados. Não envie senhas, dados bancários, números de documentos governamentais ou informações pessoais altamente sensíveis.\n\nRespostas de IA em assuntos religiosos têm caráter educativo e informativo, podendo conter erros. Consulte estudiosos qualificados para decisões religiosas importantes.`,
      },
      {
        heading: 'Conta / Login',
        body: `Se o aplicativo permitir criação de conta ou login, o Noor Islamic poderá processar:\n\n• Endereço de e-mail\n• ID do usuário/conta\n• Informações de autenticação\n• Preferências da conta\n\nEstas informações são utilizadas apenas para fornecer o serviço e gerenciar sua conta.`,
      },
      {
        heading: 'Conteúdo de Vídeo',
        body: `O Noor Islamic contém conteúdo de vídeo religioso e educativo. Todos os vídeos são reproduzidos dentro do aplicativo, sem redirecionamentos externos. Provedores de hospedagem de vídeo (ex.: Cloudflare Stream) podem ser utilizados. A infraestrutura de vídeo pode processar dados técnicos como:\n\n• Endereço IP\n• Informações do dispositivo\n• Dados de reprodução e desempenho\n• Informações de streaming necessárias para entregar o vídeo\n\nEstas informações não são vendidas como dados pessoais.`,
      },
      {
        heading: 'Conteúdo Islâmico',
        body: `O aplicativo oferece: Alcorão, recitações, Tafsir, Hadith, Adhkar, horários de oração, guia de Hajj e Umrah, educação islâmica, vídeos religiosos e o assistente islâmico com IA.\n\nOs usuários não são obrigados a declarar formalmente sua religião para usar o serviço. Interesses ou interações religiosas não são vendidos nem usados para criar perfis publicitários baseados em crenças religiosas.`,
      },
      {
        heading: 'Notificações',
        body: `Se as notificações estiverem ativadas, o aplicativo poderá usar:\n\n• Token de notificação push\n• Preferências de notificação\n\nAs notificações podem incluir lembretes de oração, Adhkar, lembretes religiosos, notificações de serviço e atualizações do aplicativo. As notificações podem ser desativadas nas configurações.`,
      },
      {
        heading: 'Assinaturas e Pagamentos',
        body: `O Noor Islamic é gratuito para download e pode oferecer assinaturas pagas opcionais ou recursos Premium. Os pagamentos do Google Play são processados pelo Google diretamente. O Noor Islamic pode receber:\n\n• Status da assinatura/compra\n• ID do produto/assinatura\n• Confirmação da transação\n\nO Noor Islamic NÃO recebe nem armazena os detalhes completos do cartão de crédito — os pagamentos são processados pelo Google Play.`,
      },
      {
        heading: 'Dados Técnicos',
        body: `Dependendo dos serviços e SDKs utilizados, o aplicativo pode processar:\n\n• Tipo de dispositivo, sistema operacional, versão do aplicativo\n• Endereço IP\n• Dados de falhas e diagnósticos\n• Dados de desempenho e segurança\n• Uso de recursos do aplicativo`,
      },
      {
        heading: 'Prestadores de Serviços Terceiros',
        body: `O Noor Islamic pode usar prestadores de serviços para:\n\n• Hospedagem em nuvem e bancos de dados\n• Autenticação\n• Inteligência artificial\n• Hospedagem e streaming de vídeo\n• Notificações push\n• Análises e relatórios de falhas\n• Assinaturas e pagamentos\n• Segurança e infraestrutura\n\nOs prestadores são obrigados a manter padrões adequados de privacidade.`,
      },
      {
        heading: 'Compartilhamento de Dados',
        body: `O Noor Islamic não vende suas informações pessoais. Os dados são compartilhados com prestadores de serviços apenas quando necessário para operar o aplicativo, cumprir a lei aplicável ou manter a segurança.`,
      },
      {
        heading: 'Retenção de Dados',
        body: `As informações pessoais são retidas apenas pelo tempo necessário para fornecer o serviço, obrigações legais, segurança, prevenção de fraudes ou gerenciamento de assinaturas. Dados que não são mais necessários são excluídos ou anonimizados.`,
      },
      {
        heading: 'Exclusão de Conta e Dados',
        body: `Você pode solicitar a exclusão de sua conta e dados pessoais associados pela opção Excluir Conta dentro do aplicativo ou entrando em contato:\n\n${CONTACT_EMAIL}\n\nEnvie a solicitação do endereço de e-mail associado à sua conta Noor Islamic. Após a verificação, sua conta e os dados associados serão excluídos, exceto as informações que devem ser retidas por obrigações legais, de segurança ou de registro financeiro.`,
      },
      {
        heading: 'Fale Conosco',
        body: `Para quaisquer dúvidas ou solicitações sobre privacidade, entre em contato:\n\n${CONTACT_EMAIL}`,
      },
    ],
  },
};

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
  { key: 'pt', label: 'Português' },
];

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('ar');
  const data = STRINGS[lang];
  const isRTL = data.dir === 'rtl';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[s.header, isRTL && s.rowRev]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#F5F0E8" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, isRTL && s.textRight]}>{data.title}</Text>
          <Text style={[s.headerSub, isRTL && s.textRight]}>{data.subtitle}</Text>
        </View>
      </View>

      {/* Language Switcher */}
      <View style={s.langRow}>
        {LANG_LABELS.map(l => (
          <Pressable
            key={l.key}
            style={[s.langBtn, lang === l.key && s.langBtnActive]}
            onPress={() => setLang(l.key)}
          >
            <Text style={[s.langBtnText, lang === l.key && s.langBtnTextActive]}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>
        {/* Meta */}
        <View style={[s.metaRow, isRTL && s.rowRev]}>
          <MaterialIcons name="update" size={13} color="#5A7A60" />
          <Text style={s.metaText}>{data.lastUpdated}</Text>
        </View>
        <View style={[s.metaRow, isRTL && s.rowRev]}>
          <MaterialIcons name="email" size={13} color="#5A7A60" />
          <Text style={s.metaText}>{data.contact}</Text>
        </View>

        {/* Sections */}
        {data.sections.map((sec, i) => (
          <View key={i} style={s.section}>
            <Text style={[s.sectionHeading, isRTL && s.textRight]}>{sec.heading}</Text>
            <Text style={[s.sectionBody, isRTL && s.textRight]}>{sec.body}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <MaterialIcons name="verified-user" size={18} color="#C9A84C" />
          <Text style={s.footerText}>{APP_NAME}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#060F0A' },
  header:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  backBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3225', alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: '#F5F0E8' },
  headerSub:       { fontSize: 12, color: '#C9A84C', marginTop: 1 },
  langRow:         { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0D1F14', borderBottomWidth: 1, borderBottomColor: '#1E3D28' },
  langBtn:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1A3225', borderWidth: 1, borderColor: '#2A5038' },
  langBtnActive:   { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  langBtnText:     { fontSize: 13, color: '#A8B8A0', fontWeight: '600' },
  langBtnTextActive:{ color: '#060F0A' },
  content:         { padding: 20, gap: 4 },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText:        { fontSize: 12, color: '#5A7A60' },
  section:         { marginTop: 20, gap: 8 },
  sectionHeading:  { fontSize: 16, fontWeight: '700', color: '#C9A84C', borderLeftWidth: 3, borderLeftColor: '#1B6B47', paddingLeft: 10 },
  sectionBody:     { fontSize: 14, color: '#A8B8A0', lineHeight: 22 },
  footer:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, justifyContent: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E3D28' },
  footerText:      { fontSize: 14, color: '#5A7A60' },
  textRight:       { textAlign: 'right' },
  rowRev:          { flexDirection: 'row-reverse' },
});

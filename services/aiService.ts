// Powered by OnSpace.AI
// Islamic AI Service — Production implementation via OnSpace AI (server-side)
//
// All AI calls go through the `islamic-ai` Supabase Edge Function.
// The Edge Function holds the API keys and verifies Premium entitlement
// before forwarding to google/gemini-3-flash-preview.
// No API keys are ever exposed to the mobile client.
//
// Auth strategy: the caller (ai.tsx) passes the access_token from AppContext's
// authenticated session directly. We never create a second Supabase client here,
// which was the cause of "Not authenticated" errors on Android.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AISource {
  type: 'quran' | 'hadith' | 'tafseer' | 'scholar';
  title: string;
  reference: string;
  text: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AISource[];
  timestamp: Date;
  feedback?: 'helpful' | 'not_helpful' | 'reported';
}

export interface AISuggestion {
  ar: string;
  en: string;
  pt: string;
  fr: string;
  es: string;
  tr: string;
  id: string;
  ur: string;
  bn: string;
  ms: string;
}

// ─── Suggested Questions ──────────────────────────────────────────────────────

export const AI_SUGGESTED_QUESTIONS: AISuggestion[] = [
  {
    ar: 'كيف أصلي الاستخارة؟',
    en: 'How do I pray Istikhara?',
    pt: 'Como faço a oração Istikhara?',
    fr: "Comment prier l'Istikhara?",
    es: '¿Cómo rezo la Istikhara?',
    tr: 'İstihare namazı nasıl kılınır?',
    id: 'Bagaimana cara shalat Istikharah?',
    ur: 'استخارہ کی نماز کیسے پڑھتے ہیں؟',
    bn: 'ইস্তেখারার নামাজ কীভাবে পড়তে হয়?',
    ms: 'Bagaimana cara solat Istikharah?',
  },
  {
    ar: 'ما هي أركان الإسلام الخمسة؟',
    en: 'What are the Five Pillars of Islam?',
    pt: 'Quais são os Cinco Pilares do Islã?',
    fr: "Quels sont les Cinq Piliers de l'Islam?",
    es: '¿Cuáles son los Cinco Pilares del Islam?',
    tr: "İslam'ın beş şartı nelerdir?",
    id: 'Apa saja Rukun Islam yang lima?',
    ur: 'اسلام کے پانچ ارکان کون سے ہیں؟',
    bn: 'ইসলামের পাঁচটি স্তম্ভ কী কী?',
    ms: 'Apakah Lima Rukun Islam?',
  },
  {
    ar: 'أعطني أحاديث عن الصبر',
    en: 'Give me hadiths about patience',
    pt: 'Me dê hadith sobre paciência',
    fr: 'Donnez-moi des hadiths sur la patience',
    es: 'Dame hadices sobre la paciencia',
    tr: 'Sabır hakkında hadisler ver bana',
    id: 'Berikan saya hadis tentang kesabaran',
    ur: 'صبر کے بارے میں احادیث دیں',
    bn: 'ধৈর্য সম্পর্কে হাদিস দিন',
    ms: 'Berikan saya hadis tentang kesabaran',
  },
  {
    ar: 'كيف أعمل العمرة خطوة بخطوة؟',
    en: 'How to perform Umrah step by step?',
    pt: 'Como realizar a Umrah passo a passo?',
    fr: "Comment effectuer l'Oumra étape par étape?",
    es: '¿Cómo realizar la Umrah paso a paso?',
    tr: 'Umre adım adım nasıl yapılır?',
    id: 'Bagaimana cara melakukan Umrah langkah demi langkah?',
    ur: 'عمرہ کیسے کریں قدم بہ قدم؟',
    bn: 'ধাপে ধাপে উমরাহ কীভাবে করবেন?',
    ms: 'Bagaimana cara melakukan Umrah langkah demi langkah?',
  },
  {
    ar: 'اشرح لي سورة الفاتحة',
    en: 'Explain Surah Al-Fatihah to me',
    pt: 'Explique-me a Surata Al-Fatihah',
    fr: 'Expliquez-moi la Sourate Al-Fatiha',
    es: 'Explícame la Sura Al-Fatiha',
    tr: 'Fatiha suresini bana açıkla',
    id: 'Jelaskan Surah Al-Fatihah kepada saya',
    ur: 'سورہ فاتحہ کی تشریح کریں',
    bn: 'সূরা আল-ফাতিহা ব্যাখ্যা করুন',
    ms: 'Terangkan Surah Al-Fatihah kepada saya',
  },
  {
    ar: 'أنا مسلم جديد، من أين أبدأ؟',
    en: 'I am a new Muslim, where do I start?',
    pt: 'Sou um novo muçulmano, por onde começo?',
    fr: "Je suis un nouveau musulman, par où commencer?",
    es: 'Soy un nuevo musulmán, ¿por dónde empiezo?',
    tr: 'Yeni Müslümanım, nereden başlamalıyım?',
    id: 'Saya mualaf, dari mana saya mulai?',
    ur: 'میں نومسلم ہوں، کہاں سے شروع کروں؟',
    bn: 'আমি নতুন মুসলিম, কোথা থেকে শুরু করব?',
    ms: 'Saya mualaf, di mana saya harus mulai?',
  },
];

// ─── Get edge function URL ────────────────────────────────────────────────────

function getEdgeUrl(): string {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/functions/v1/islamic-ai`;
}

// ─── Stream parser (SSE line-by-line) ────────────────────────────────────────

function parseSSEChunk(chunk: string): string {
  let result = '';
  const lines = chunk.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (data === '[DONE]') break;
    try {
      const parsed = JSON.parse(data);
      const delta = parsed.choices?.[0]?.delta?.content;
      if (typeof delta === 'string') result += delta;
    } catch {
      // partial chunk — skip
    }
  }
  return result;
}

// ─── Main AI call ─────────────────────────────────────────────────────────────
//
// Calls the islamic-ai edge function with the full conversation history.
// Supports streaming (mobile uses full-text fallback; web uses streaming).
// Calls onChunk(text) progressively during streaming.
// Returns the complete response text when done.

export async function sendIslamicAIMessage(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  language: string;
  /** Access token from AppContext's authenticated Supabase session */
  accessToken: string;
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const { messages, language, accessToken, onChunk, signal } = params;

  // Caller must supply the token — never fetch a second session here
  if (!accessToken) {
    const msg =
      language === 'ar' ? 'يرجى تسجيل الدخول لاستخدام المساعد الإسلامي' :
      language === 'pt' ? 'Por favor, entre para usar o Assistente Islâmico' :
      language === 'fr' ? 'Veuillez vous connecter pour utiliser l\'assistant islamique' :
      language === 'tr' ? 'İslami asistanı kullanmak için lütfen giriş yapın' :
      language === 'id' ? 'Silakan masuk untuk menggunakan Asisten Islam' :
      'Please sign in to use the Islamic AI assistant';
    throw new Error(msg);
  }

  const edgeUrl = getEdgeUrl();
  const useStream = !!onChunk; // only stream when a chunk callback is provided

  const response = await fetch(edgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages,
      language,
      stream: useStream,
    }),
    signal,
  });

  if (!response.ok) {
    // Read the error body from our edge function
    let errorCode = '';
    try {
      const errText = await response.text();
      const errJson = JSON.parse(errText);
      errorCode = errJson.error ?? '';
    } catch { /* use raw status */ }

    // Map edge function error codes → localized user messages
    const localizedError = (ar: string, en: string, pt: string) =>
      language === 'ar' ? ar : language === 'pt' ? pt : en;

    // 401 — not authenticated
    if (response.status === 401 || errorCode === 'unauthenticated') {
      throw new Error(localizedError(
        'يرجى تسجيل الدخول لاستخدام المساعد الإسلامي',
        'Please sign in to use the Islamic AI assistant',
        'Por favor, entre para usar o Assistente Islâmico',
      ));
    }
    // 403 — no premium subscription
    if (response.status === 403 || errorCode === 'premium_required') {
      throw new Error(localizedError(
        'الوصول إلى مساعد نور يتطلب اشتراكاً مميزاً',
        'Premium subscription required to use the Noor AI assistant',
        'Assinatura Premium necessária para usar o Assistente Noor',
      ));
    }
    // 503 — all AI models temporarily unavailable
    if (response.status === 503 || errorCode === 'ai_unavailable') {
      throw new Error(localizedError(
        'خدمة الذكاء الاصطناعي غير متاحة مؤقتاً، يرجى المحاولة لاحقاً',
        'The AI service is temporarily unavailable, please try again later',
        'O serviço de IA está temporariamente indisponível, tente novamente mais tarde',
      ));
    }
    // 500 / 502 — server-side error
    if (response.status >= 500 || errorCode === 'ai_upstream_error' || errorCode === 'internal_error' || errorCode === 'ai_not_configured') {
      throw new Error(localizedError(
        'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى',
        'A server error occurred, please try again',
        'Ocorreu um erro no servidor, tente novamente',
      ));
    }
    // Generic fallback
    throw new Error(localizedError(
      'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
      'An unexpected error occurred, please try again',
      'Ocorreu um erro inesperado, tente novamente',
    ));
  }

  // ── Streaming path (web + iOS where ReadableStream is available) ──────────
  if (useStream && response.body) {
    const reader = response.body.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const parsed = parseSSEChunk(chunk);
        if (parsed) {
          fullText += parsed;
          onChunk(parsed);
        }
      }
      return fullText;
    }
  }

  // ── Non-streaming fallback (Android, or when streaming not requested) ─────
  const text = await response.text();
  // Check if it's SSE format (edge function may stream even on fallback path)
  if (text.includes('data: ')) {
    const parsed = parseSSEChunk(text);
    if (parsed) {
      if (onChunk) onChunk(parsed);
      return parsed;
    }
  }
  // Try as JSON
  try {
    const json = JSON.parse(text);
    const content = json.choices?.[0]?.message?.content ?? json.choices?.[0]?.delta?.content ?? '';
    if (onChunk && content) onChunk(content);
    return content;
  } catch {
    if (onChunk && text) onChunk(text);
    return text;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

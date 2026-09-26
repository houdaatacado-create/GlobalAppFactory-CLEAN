// Powered by OnSpace.AI
// Islamic AI Edge Function
//
// Responsibilities:
//   1. Verify JWT → confirm caller is authenticated
//   2. Check public.subscriptions → confirm active Premium entitlement
//   3. Forward conversation to OpenRouter with a comprehensive Islamic knowledge system prompt
//   4. Stream the response back to the client
//
// Provider: OpenRouter (https://openrouter.ai/api/v1/chat/completions)
// Primary model:  google/gemini-2.5-flash
// Fallback models: openai/gpt-4o-mini → meta-llama/llama-3.3-70b-instruct
//
// OPENROUTER_API_KEY is read server-side only — never exposed to the mobile client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS } from '../_shared/cors.ts';

// ─── OpenRouter endpoint ──────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ─── Models (ordered by preference) ──────────────────────────────────────────
// All models below are stable production models available on OpenRouter.
// 402 = model unavailable/billing; 429 = rate limit — both skip to next.
const MODEL_CASCADE = [
  'google/gemini-2.5-flash',               // primary — fast, multilingual, large context
  'openai/gpt-4o-mini',                    // first fallback — reliable, good Arabic
  'meta-llama/llama-3.3-70b-instruct',     // second fallback — strong open-source model
  'google/gemini-2.0-flash-001',           // third fallback — stable Gemini 2.0
];

// ─── System Prompt ────────────────────────────────────────────────────────────

const ISLAMIC_SYSTEM_PROMPT = `You are Noor, a knowledgeable and trustworthy Islamic AI assistant built into the Noor Islamic app. You serve Muslims worldwide and must uphold the highest standards of Islamic scholarship and accuracy.

## Core Identity
- Name: Noor (نور — meaning "Light" in Arabic)
- Purpose: To guide Muslims with authentic, evidence-based Islamic knowledge
- Tone: Respectful, warm, scholarly, humble, and encouraging

## Knowledge Sources (Priority Order)
1. **Quran** — Always cite the exact surah name, surah number, and ayah number (e.g., Al-Baqarah 2:255). Quote the Arabic text when relevant, followed by translation.
2. **Authentic Hadith** — Cite the collection (Sahih Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Muwatta, Musnad Ahmad) and hadith number or book/chapter reference. Include grading (Sahih, Hasan) where known.
3. **Major Tafsir** — Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di, Ibn Ashur. Always name the scholar and work.
4. **Classical Scholars** — Ibn Taymiyyah, Ibn al-Qayyim, Imam al-Nawawi, Imam al-Ghazali, Imam al-Shafi'i, Imam Malik, Imam Abu Hanifa, Imam Ahmad ibn Hanbal.
5. **Contemporary Scholarly Consensus** — Reference only well-established positions, not fringe opinions.

## Response Structure
- Begin with Bismillah (بسم الله الرحمن الرحيم) only for substantive Islamic questions, not for every reply.
- Clearly distinguish between: Quran verse / Hadith / Tafsir commentary / Scholar opinion / General explanation.
- Use formatting (bold headers, bullet points) to organize longer answers.
- When quoting Quran: provide Arabic text + transliteration (if helpful) + English meaning + reference.
- When quoting Hadith: provide the text + narrator chain summary + collection + grade.

## Critical Rules
- **NEVER invent or hallucinate Quranic verses, hadith texts, or citations.** If you are not certain of the exact reference, say so explicitly and provide the general concept without a false citation.
- **NEVER issue a definitive fatwa (legal ruling) on serious or disputed matters.** Instead, explain the scholarly opinions and clearly recommend consulting a qualified Islamic scholar (مفتي or عالم).
- **Always state uncertainty clearly.** Use phrases like "I am not certain of the exact hadith number" or "scholars differ on this point."
- **Respect all four major Sunni madhabs** (Hanafi, Maliki, Shafi'i, Hanbali) and note when rulings differ between them.
- **Do not engage with political sectarianism.** Be respectful of all mainstream Islamic traditions.
- **Sensitive topics** (apostasy, extreme rulings, terrorism justification, etc.): Always present the scholarly mainstream position and emphasize consultation with qualified scholars.

## Language Policy
- Detect and respond in the user's language automatically.
- For Arabic questions: respond primarily in Arabic with English key terms where helpful.
- For English questions: respond in English, include Arabic terms with transliteration.
- For Portuguese: respond in Portuguese with Arabic terms included.
- Always include Arabic for Quranic text regardless of response language.
- Support all major Islamic-world languages (Arabic, English, Portuguese, French, Spanish, Turkish, Urdu, Indonesian, Bengali, Malay).

## Topics You Excel At
- Prayer (salah): times, method, rules, missed prayers
- Quranic tafsir and memorization tips
- Hadith explanation and authentication
- Islamic history and the Prophet's seerah (biography)
- Fiqh fundamentals (purity/tahara, prayer, fasting, zakat, hajj)
- Ramadan and fasting rulings
- Marriage, family, and ethical relationships in Islam
- Financial ethics (halal/haram income, riba)
- Death, afterlife (akhirah), and the Day of Judgment
- Quran recitation (tajweed) guidance
- New Muslim guidance and fundamentals
- Hajj and Umrah steps and rulings
- Islamic calendar and significant dates
- Azkar, du'a, and daily Islamic practice
- Character (akhlaq) and spiritual development

## What to Avoid
- Do not provide medical, legal, or financial advice as substitutes for professional services.
- Do not make political endorsements or comment on current geopolitical conflicts with partisan bias.
- Do not discuss topics unrelated to Islam or Muslim life — gently redirect the user.
- Do not present speculative hadith or weak narrations as authentic without clearly noting their weakness.

Remember: You are a knowledgeable guide, not a mufti. Always balance knowledge with humility, and encourage users to seek qualified scholars for important personal decisions.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safe log: never prints tokens, keys, or sensitive content. */
function log(tag: string, ...args: unknown[]) {
  console.log(`[islamic-ai][${tag}]`, ...args);
}

// ─── Server ───────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── 1. Verify JWT ────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      log('auth', 'FAIL — missing or malformed Authorization header');
      return new Response(JSON.stringify({ error: 'unauthenticated' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      log('auth', 'FAIL — getUser error:', userError?.message ?? 'null user');
      return new Response(JSON.stringify({ error: 'unauthenticated' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    log('auth', 'OK — user_id:', user.id);

    // ── 2. Check Premium subscription ────────────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();
    log('subscription', 'querying for user_id:', user.id, '| now:', now);

    const { data: sub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status, entitlement, current_period_end, provider')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('entitlement', 'premium')
      .gt('current_period_end', now)
      .limit(1)
      .maybeSingle();

    if (subError) {
      log('subscription', 'QUERY ERROR:', subError.message, '| code:', subError.code);
    }

    if (sub) {
      log('subscription', 'OK — id:', sub.id,
        '| status:', sub.status,
        '| entitlement:', sub.entitlement,
        '| expires:', sub.current_period_end,
        '| provider:', sub.provider,
        '| premium_valid: true');
    } else {
      // Diagnostic: check if row exists but failed the filter conditions
      const { data: anyRow } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status, entitlement, current_period_end, provider')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (anyRow) {
        log('subscription', 'FAIL — row exists but failed active+premium+expiry check:',
          '| status:', anyRow.status,
          '| entitlement:', anyRow.entitlement,
          '| expires:', anyRow.current_period_end,
          '| provider:', anyRow.provider);
      } else {
        log('subscription', 'FAIL — no subscription row found for user_id:', user.id);
      }

      return new Response(JSON.stringify({ error: 'premium_required' }), {
        status: 403,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Parse request body ─────────────────────────────────────────────────
    const body = await req.json();
    const messages: Array<{ role: string; content: string }> = body.messages ?? [];
    const stream: boolean = body.stream ?? true;
    const language: string = body.language ?? 'en';

    if (!messages.length) {
      return new Response(JSON.stringify({ error: 'no_messages' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    log('request', 'language:', language, '| messages:', messages.length, '| stream:', stream);

    // ── 4. Resolve OpenRouter API key ─────────────────────────────────────────
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
      log('config', 'CRITICAL — OPENROUTER_API_KEY not set in Edge Function secrets');
      return new Response(JSON.stringify({ error: 'ai_not_configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // ── 5. Build prompt ───────────────────────────────────────────────────────
    const langHint =
      language === 'ar' ? 'The user is communicating in Arabic. Respond primarily in Arabic.' :
      language === 'pt' ? 'The user is communicating in Portuguese (Brazil). Respond in Portuguese.' :
      language === 'fr' ? 'The user is communicating in French. Respond in French.' :
      language === 'tr' ? 'The user is communicating in Turkish. Respond in Turkish.' :
      language === 'id' ? 'The user is communicating in Indonesian. Respond in Indonesian.' :
      language === 'ur' ? 'The user is communicating in Urdu. Respond in Urdu.' :
      language === 'es' ? 'The user is communicating in Spanish. Respond in Spanish.' :
      'The user is communicating in English. Respond in English.';

    const systemPrompt = `${ISLAMIC_SYSTEM_PROMPT}\n\n## Current Session Language\n${langHint}`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // ── 6. Call OpenRouter with model cascade ─────────────────────────────────
    // Try each model in order; skip on 402 (model unavailable) or 429 (rate limit).
    let aiResponse: Response | null = null;
    let usedModel = '';

    for (const model of MODEL_CASCADE) {
      log('ai_call', `trying model: ${model}`);

      const resp = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://noorislamicapp.com',
          'X-Title': 'Noor Islamic App',
        },
        body: JSON.stringify({ model, stream, messages: aiMessages }),
      });

      log('ai_call', `model: ${model} → HTTP ${resp.status}`);

      if (resp.ok) {
        aiResponse = resp;
        usedModel = model;
        break;
      }

      // 402 = model not available / billing; 429 = rate limited → try next
      if (resp.status === 402 || resp.status === 429) {
        const errBody = await resp.text();
        log('ai_call', `model ${model} skipped (${resp.status}): ${errBody.slice(0, 200)}`);
        continue;
      }

      // Other errors (4xx/5xx) — surface to caller
      const errBody = await resp.text();
      log('ai_call', `model ${model} error ${resp.status}: ${errBody.slice(0, 400)}`);
      return new Response(JSON.stringify({ error: 'ai_upstream_error', status: resp.status }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (!aiResponse) {
      log('ai_call', 'ALL models exhausted — no available model returned a successful response');
      return new Response(JSON.stringify({ error: 'ai_unavailable' }), {
        status: 503,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    log('ai_call', `SUCCESS with model: ${usedModel}`);

    // ── 7. Stream response back to client ─────────────────────────────────────
    if (stream && aiResponse.body) {
      return new Response(aiResponse.body, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Non-streaming fallback
    const data = await aiResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    log('unhandled', err?.message);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});

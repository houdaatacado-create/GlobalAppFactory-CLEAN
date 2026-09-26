// Powered by OnSpace.AI
// Quran Audio Service — MP3Quran API v3 Integration
//
// Audio URLs are generated dynamically from the API response.
// No hardcoded MP3 URLs. No YouTube. No external redirects.
// All audio streams through the native in-app player.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface QuranMoshaf {
  id: number;
  name: string;            // e.g. "حفص عن عاصم"
  server: string;          // base URL — surah padded to 3 digits + .mp3
  surah_list: string;      // comma-separated surah numbers available
  surah_total: number;
  mosahf_id?: number;
}

export interface QuranReciter {
  id: number;
  name: string;            // Arabic name
  letter: string;          // first letter of name (for alphabetic grouping)
  moshaf: QuranMoshaf[];
  // Derived fields (not from API)
  featured?: boolean;
  name_en?: string;
}

export interface QuranReciterCatalog {
  reciters: QuranReciter[];
  fetchedAt: number;
}

// ─── FEATURED RECITER NAMES (Arabic — match against API names) ────────────────
export const FEATURED_RECITER_NAMES = [
  'مشاري راشد العفاسي',
  'عبد الرحمن السديس',
  'سعود الشريم',
  'ماهر المعيقلي',
  'ياسر الدوسري',
  'عبد الباسط عبد الصمد',
  'محمد صديق المنشاوي',
  'محمود خليل الحصري',
  'سعد الغامدي',
  'أحمد بن علي العجمي',
  'أبو بكر الشاطري',
  'محمد أيوب',
  'علي الحذيفي',
  'هاني الرفاعي',
  'عبد الله عواد الجهني',
  'صلاح البدير',
  'محمد جبريل',
  'محمود علي البنا',
  'عبد الله بصفر',
  'خليفة الطنيجي',
  'محسن القاسم',
  'عبد الله المطرود',
  'فارس عباد',
  'إدريس أبكر',
  'ناصر القطامي',
  'رعد الكردي',
];

// ─── RECITER NAME NORMALIZATION (handle common Arabic spelling variants) ───────
function normalizeArabicName(name: string): string {
  return name
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isFeaturedReciter(reciter: QuranReciter): boolean {
  const normName = normalizeArabicName(reciter.name);
  return FEATURED_RECITER_NAMES.some(fn => {
    const normFeatured = normalizeArabicName(fn);
    return normName.includes(normFeatured) || normFeatured.includes(normName);
  });
}

// ─── CACHE ────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'quran_reciters_v3';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedReciters(): Promise<QuranReciterCatalog | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const catalog: QuranReciterCatalog = JSON.parse(raw);
    // Never return a cached empty list — force a fresh fetch
    if (!catalog.reciters || catalog.reciters.length === 0) return null;
    if (Date.now() - catalog.fetchedAt > CACHE_TTL_MS) return null;
    return catalog;
  } catch {
    return null;
  }
}

export async function clearRecitersCache(): Promise<void> {
  try { await AsyncStorage.removeItem(CACHE_KEY); } catch { /* non-fatal */ }
}

async function saveRecitersCache(reciters: QuranReciter[]): Promise<void> {
  // Never cache an empty result
  if (!reciters || reciters.length === 0) return;
  try {
    const catalog: QuranReciterCatalog = { reciters, fetchedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
  } catch {
    // Non-fatal
  }
}

// ─── API FETCH ────────────────────────────────────────────────────────────────

// Last fetch error — exposed so UI can show real message
export let lastFetchError: string | null = null;

export async function fetchReciters(language = 'ar'): Promise<QuranReciter[]> {
  lastFetchError = null;

  // Try cache first
  const cached = await getCachedReciters();
  if (cached && cached.reciters.length > 0) {
    console.log(`[QuranAudio] Using cached catalog: ${cached.reciters.length} reciters`);
    return cached.reciters.map(r => ({ ...r, featured: isFeaturedReciter(r) }));
  }

  try {
    const url = `https://www.mp3quran.net/api/v3/reciters?language=${language}`;
    console.log(`[QuranAudio] Fetching reciters from: ${url}`);

    // AbortSignal.timeout() is NOT available in Hermes/React Native — use manual controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    let resp: Response;
    try {
      resp = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!resp.ok) {
      const msg = `HTTP ${resp.status} ${resp.statusText}`;
      lastFetchError = msg;
      throw new Error(msg);
    }

    let data: any;
    try {
      data = await resp!.json();
    } catch (jsonErr: any) {
      const msg = `JSON parse failed: ${jsonErr?.message}`;
      lastFetchError = msg;
      throw new Error(msg);
    }

    // Debug: log exact shape so we can diagnose any future mismatch
    console.log('[QuranAudio] MP3Quran raw response keys:', Object.keys(data ?? {}));
    console.log('[QuranAudio] reciters type:', typeof data?.reciters);
    console.log('[QuranAudio] reciters isArray:', Array.isArray(data?.reciters));

    // Defensive: always use Array.isArray before any array method
    const rawReciters: any[] = Array.isArray(data?.reciters) ? data.reciters : [];
    console.log(`[QuranAudio] Raw reciters count: ${rawReciters.length}`);

    if (rawReciters.length === 0) {
      lastFetchError = `API connected but returned 0 reciters (response keys: ${Object.keys(data ?? {}).join(', ')})`;
      return [];
    }

    // Normalize each reciter defensively — a bad entry is skipped, not a crash
    const reciters: QuranReciter[] = [];
    for (const r of rawReciters) {
      try {
        if (!r || !r.id || !r.name) continue;

        // Ensure moshaf is an array before any array methods
        const rawMoshafs: any[] = Array.isArray(r.moshaf) ? r.moshaf : [];

        const mushafs: QuranMoshaf[] = [];
        for (const m of rawMoshafs) {
          try {
            if (!m || !m.server) continue;
            // surah_list must be a string before calling .split()
            const surahListStr: string =
              typeof m.surah_list === 'string' ? m.surah_list :
              typeof m.surah_list === 'number' ? String(m.surah_list) :
              Array.isArray(m.surah_list) ? m.surah_list.join(',') : '';

            const serverStr = String(m.server);
            mushafs.push({
              id: Number(m.id) || 0,
              name: String(m.name || 'حفص عن عاصم'),
              server: serverStr.endsWith('/') ? serverStr : serverStr + '/',
              surah_list: surahListStr,
              surah_total: Number(m.surah_total) || 114,
              mosahf_id: m.mosahf_id,
            });
          } catch (mErr: any) {
            console.warn('[QuranAudio] Skipping bad moshaf entry:', mErr?.message);
          }
        }

        if (mushafs.length === 0) continue;

        reciters.push({
          id: Number(r.id),
          name: String(r.name),
          letter: typeof r.letter === 'string' ? r.letter : '',
          moshaf: mushafs,
          featured: false,
          name_en: typeof r.name_en === 'string' ? r.name_en : '',
        });
      } catch (rErr: any) {
        console.warn('[QuranAudio] Skipping bad reciter entry:', rErr?.message);
      }
    }

    console.log(`[QuranAudio] Valid normalized reciters: ${reciters.length} / ${rawReciters.length}`);

    console.log(`[QuranAudio] Parsed ${reciters.length} valid reciters`);

    // Mark featured
    const withFeatured = reciters.map(r => ({ ...r, featured: isFeaturedReciter(r) }));
    const featuredCount = withFeatured.filter(r => r.featured).length;
    console.log(`[QuranAudio] Featured reciters matched: ${featuredCount}`);

    await saveRecitersCache(withFeatured);
    return withFeatured;
  } catch (e: any) {
    const msg = e?.message || 'Unknown network error';
    lastFetchError = msg;
    console.error('[QuranAudio] fetchReciters error:', msg);

    // Try to return stale cache if available (ignore TTL on error)
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const catalog: QuranReciterCatalog = JSON.parse(raw);
        if (catalog.reciters && catalog.reciters.length > 0) {
          console.log(`[QuranAudio] Returning stale cache: ${catalog.reciters.length} reciters`);
          return catalog.reciters.map(r => ({ ...r, featured: isFeaturedReciter(r) }));
        }
      }
    } catch { /* ignore */ }

    return [];
  }
}

// ─── AUDIO URL GENERATION ─────────────────────────────────────────────────────

export function buildSurahAudioUrl(moshaf: QuranMoshaf, surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, '0');
  const server = moshaf.server.endsWith('/') ? moshaf.server : moshaf.server + '/';
  return `${server}${padded}.mp3`;
}

export function isSurahAvailable(moshaf: QuranMoshaf, surahNumber: number): boolean {
  // Guard: surah_list must be a non-empty string before calling .split()
  if (!moshaf || typeof moshaf.surah_list !== 'string' || !moshaf.surah_list.trim()) {
    return true; // assume all available if no list provided
  }
  const available = moshaf.surah_list
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));
  return available.includes(surahNumber);
}

// Get the best (default) Mushaf for a reciter — prefer Hafs
export function getDefaultMoshaf(reciter: QuranReciter): QuranMoshaf | null {
  if (!reciter.moshaf || reciter.moshaf.length === 0) return null;
  // Prefer Hafs (حفص)
  const hafs = reciter.moshaf.find(m =>
    m.name.includes('حفص') || m.name.toLowerCase().includes('hafs')
  );
  return hafs || reciter.moshaf[0];
}

// ─── AYAH REPEAT MODE ────────────────────────────────────────────────────────

export type AyahRepeatMode = 'once' | 'three' | 'five' | 'ten' | 'infinite';

export const AYAH_REPEAT_MODE_OPTIONS: { mode: AyahRepeatMode; labelAr: string; labelEn: string; count: number }[] = [
  { mode: 'once',     labelAr: '1×',       labelEn: '1×',         count: 1   },
  { mode: 'three',    labelAr: '3×',       labelEn: '3×',         count: 3   },
  { mode: 'five',     labelAr: '5×',       labelEn: '5×',         count: 5   },
  { mode: 'ten',      labelAr: '10×',      labelEn: '10×',        count: 10  },
  { mode: 'infinite', labelAr: '∞',        labelEn: '∞',          count: -1  },
];

export function ayahRepeatCount(mode: AyahRepeatMode): number {
  switch (mode) {
    case 'three':    return 3;
    case 'five':     return 5;
    case 'ten':      return 10;
    case 'infinite': return -1; // never auto-advance
    default:         return 1;
  }
}

// ─── AYAH-LEVEL AUDIO ─────────────────────────────────────────────────────────
// Uses Quran.com audio CDN for per-ayah audio
// URL format: https://verses.quran.com/{reciterKey}/{surah:3}{ayah:3}.mp3

export function buildAyahAudioUrl(
  reciterKey: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const surahPad = String(surahNumber).padStart(3, '0');
  const ayahPad  = String(ayahNumber).padStart(3, '0');
  return `https://verses.quran.com/${reciterKey}/${surahPad}${ayahPad}.mp3`;
}

// Quran.com reciter slug mapping — keyed by normalised Arabic name
// Fallback slug: Mishary Alafasy (most complete)
export const QURAN_COM_RECITER_KEYS: Record<string, string> = {
  'مشاري راشد العفاسي':    'Mishary_Rashid_Alafasy',
  'عبد الرحمن السديس':      'AbdurRahmanAsSudais_192',
  'سعود الشريم':             'SaudAlShuraim_128',
  'ماهر المعيقلي':           'MaherAlMuaiqly',
  'ياسر الدوسري':            'YasserAldossari_128',
  'عبد الباسط عبد الصمد':   'AbdulBasetAbdulSamad_Murattal_192',
  'محمد صديق المنشاوي':      'MuhammedSiddiqAlMinshawi',
  'محمود خليل الحصري':       'HaniRifai_192',
  'سعد الغامدي':              'SaadAlGhamdi',
  'أحمد بن علي العجمي':      'AhmedAjamy128',
  'أبو بكر الشاطري':         'AbuBakrAlShatri',
  'محمد أيوب':               'MohamedAyyub',
  'علي الحذيفي':              'AliAbdurRahmanAlHuthaify_128',
  'هاني الرفاعي':             'HaniRifai_192',
  'ناصر القطامي':             'NasserAlqatami_128',
  'رعد الكردي':               'RaadMuhammadAlKurdi_128',
  'فارس عباد':                'FaresAbbad_128',
  'إدريس أبكر':               'IdreesAbuker_32',
};

export const QURAN_COM_DEFAULT_KEY = 'Mishary_Rashid_Alafasy';

/** Map a reciter name (from MP3Quran) to a Quran.com CDN key. */
export function getQuranComKey(reciterName: string): string {
  if (!reciterName) return QURAN_COM_DEFAULT_KEY;
  // Try exact map
  if (QURAN_COM_RECITER_KEYS[reciterName]) return QURAN_COM_RECITER_KEYS[reciterName];
  // Try normalised match
  const norm = reciterName.replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  for (const [key, slug] of Object.entries(QURAN_COM_RECITER_KEYS)) {
    const normKey = key.replace(/أ|إ|آ/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
    if (norm.includes(normKey) || normKey.includes(norm)) return slug;
  }
  return QURAN_COM_DEFAULT_KEY;
}

// ─── RECITER SEARCH ───────────────────────────────────────────────────────────

export function searchReciters(reciters: QuranReciter[], query: string): QuranReciter[] {
  if (!query.trim()) return reciters;
  const q = normalizeArabicName(query.toLowerCase());
  return reciters.filter(r => {
    const norm = normalizeArabicName(r.name.toLowerCase());
    const normEn = (r.name_en || '').toLowerCase();
    return norm.includes(q) || normEn.includes(q);
  });
}

// ─── REPEAT MODE ─────────────────────────────────────────────────────────────

export type RepeatMode = 'none' | 'surah' | 'once' | 'three' | 'five' | 'ten' | 'infinite';

export const REPEAT_MODE_LABELS: Record<RepeatMode, { ar: string; en: string }> = {
  none:     { ar: 'بدون تكرار',    en: 'No Repeat'     },
  surah:    { ar: 'تكرار السورة',  en: 'Repeat Surah'  },
  once:     { ar: 'مرة واحدة',     en: 'Once'          },
  three:    { ar: 'ثلاث مرات',     en: '3 Times'       },
  five:     { ar: 'خمس مرات',      en: '5 Times'       },
  ten:      { ar: 'عشر مرات',      en: '10 Times'      },
  infinite: { ar: 'بدون توقف',     en: 'Continuous'    },
};

// ─── SLEEP TIMER ─────────────────────────────────────────────────────────────

export type SleepTimer = 'off' | '5m' | '10m' | '15m' | '30m' | '45m' | '60m';

export const SLEEP_TIMER_LABELS: Record<SleepTimer, { ar: string; en: string }> = {
  off:  { ar: 'إيقاف',       en: 'Off'      },
  '5m': { ar: 'بعد 5 دقائق', en: '5 min'   },
  '10m':{ ar: 'بعد 10 دق',   en: '10 min'  },
  '15m':{ ar: 'بعد 15 دق',   en: '15 min'  },
  '30m':{ ar: 'بعد 30 دق',   en: '30 min'  },
  '45m':{ ar: 'بعد 45 دق',   en: '45 min'  },
  '60m':{ ar: 'بعد 60 دق',   en: '60 min'  },
};

export function sleepTimerToMs(timer: SleepTimer): number {
  switch (timer) {
    case '5m':  return 5  * 60 * 1000;
    case '10m': return 10 * 60 * 1000;
    case '15m': return 15 * 60 * 1000;
    case '30m': return 30 * 60 * 1000;
    case '45m': return 45 * 60 * 1000;
    case '60m': return 60 * 60 * 1000;
    default: return 0;
  }
}

// ─── PERSISTENCE KEYS ─────────────────────────────────────────────────────────

export const AUDIO_PREFS_KEY = 'quran_audio_prefs_v2';

export interface QuranAudioPrefs {
  reciterId?: number;
  moshafId?: number;
  autoplayNext: boolean;
  repeatMode: RepeatMode;
  lastSurah: number;
  lastPositionSeconds: number;
  favoriteReciterIds: number[];
}

export const DEFAULT_AUDIO_PREFS: QuranAudioPrefs = {
  reciterId: undefined,
  moshafId: undefined,
  autoplayNext: true,
  repeatMode: 'none',
  lastSurah: 1,
  lastPositionSeconds: 0,
  favoriteReciterIds: [],
};

export async function loadAudioPrefs(): Promise<QuranAudioPrefs> {
  try {
    const raw = await AsyncStorage.getItem(AUDIO_PREFS_KEY);
    if (!raw) return DEFAULT_AUDIO_PREFS;
    return { ...DEFAULT_AUDIO_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIO_PREFS;
  }
}

export async function saveAudioPrefs(prefs: Partial<QuranAudioPrefs>): Promise<void> {
  try {
    const current = await loadAudioPrefs();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(updated));
  } catch { /* Non-fatal */ }
}

// ─── SURAH NAMES ─────────────────────────────────────────────────────────────
// Arabic names for all 114 surahs (used in player display)
export const SURAH_NAMES_AR = [
  'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس',
  'هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه',
  'الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم',
  'لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر',
  'فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق',
  'الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة',
  'الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج',
  'نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس',
  'التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد',
  'الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات',
  'القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر',
  'المسد','الإخلاص','الفلق','الناس',
];

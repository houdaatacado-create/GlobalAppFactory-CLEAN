// Powered by OnSpace.AI
// Video Service — Scalable catalog for Islamic Streaming Platform
// Batch 1 (50 videos): English — Yaqeen Institute, One Islam, Muslim Kids TV, PAC
// Batch 2 (40 videos): Portuguese, French, Arabic — FAMBRAS, Famille Musulmane, PAC, Zad Academy
// Batch 3 (100 videos): PT/FR/AR/ID/UR/FA/EN — PAC + FAMBRAS + Famille Musulmane
// Arabic Catalog Seed: Trusted channel definitions for 600+ Arabic long-form videos

// ─── ENUMS & TYPES ───────────────────────────────────────────────────────────

export type VideoCategory =
  | 'all'
  | 'quran_tafsir'
  | 'seerah_history'
  | 'prophet_stories'
  | 'hajj_umrah'
  | 'kids'
  | 'lectures'
  | 'documentaries'
  | 'documentary_film'
  | 'documentary_series'
  | 'series_episode'
  | 'islamic_program'
  | 'movies'
  | 'series'
  | 'learn'
  | 'ramadan'
  | 'islam_basics'
  | 'islamic_lifestyle'
  | 'islamic_finance'
  | 'new_muslims'
  | 'learn_prayer'
  | 'fiqh'
  | 'conversations'
  | 'hajj_health'
  | 'sacred_places'
  | 'ihram'
  | 'miqat'
  | 'civilization'
  | 'andalusia'
  | 'scholars'
  | 'ramadan_series'
  | 'mosques'
  | 'personalities';

export type ContentType =
  | 'documentary'
  | 'documentary_film'
  | 'documentary_series'
  | 'series_episode'
  | 'islamic_program'
  | 'kids_story'
  | 'lecture'
  | 'guide'
  | 'short_feature'
  | 'licensed_movie';

export type VideoLanguage =
  | 'ar' | 'en' | 'pt' | 'fr' | 'es' | 'tr' | 'id' | 'ur' | 'bn' | 'ms' | 'fa' | 'multi';

export type VideoAudience = 'General' | 'Kids' | 'Adults' | 'Women' | 'Beginners' | 'Family';

export type ReviewStatus =
  | 'Pending Editorial Review'
  | 'Approved'
  | 'Rejected'
  | 'Draft'
  | 'Pending Resolution';

export type RightsMode =
  | 'youtube_embed'
  | 'owned'
  | 'licensed'
  | 'public_domain'
  | 'creative_commons'
  | 'rights_pending';

// ─── PUBLIC VISIBILITY ────────────────────────────────────────────────────────
// 'public'     — shown in public Watch catalog (in-app playable only)
// 'admin_only' — visible only in Admin Dashboard (archived YouTube catalog)
export type ContentVisibility = 'public' | 'admin_only';

// ─── PLAYBACK TYPE ────────────────────────────────────────────────────────────
// Only 'in_app' content is shown publicly.
// YouTube content is archived ('youtube_embed') and admin-only.
export type PlaybackType = 'in_app' | 'youtube_embed' | 'external_link';

export type RightsStatus =
  | 'embed_only_pending_check'
  | 'cleared'
  | 'rejected'
  | 'licensed';

export type EmbedStatus =
  | 'unchecked'
  | 'verified'
  | 'failed'
  | 'pending_resolution';

export type SourceType = 'youtube' | 'vimeo' | 'hls' | 'licensed';

export interface VideoItem {
  id: string;
  // Titles (multi-language)
  title: string;
  titleAr?: string;
  titlePt?: string;
  titleFr?: string;
  titleId?: string;
  titleUr?: string;
  original_title?: string;
  // Descriptions
  description: string;
  descriptionAr?: string;
  descriptionPt?: string;
  descriptionFr?: string;
  // Creator
  channel: string;
  channel_id?: string;       // YouTube channel ID
  creator?: string;
  series?: string;
  series_name?: string;
  season_number?: number;
  episode_number?: number;
  // Classification
  category: VideoCategory;
  content_type?: ContentType;
  subcategory?: string;
  language: VideoLanguage;
  audience: VideoAudience;
  kids_safe?: boolean;
  // Status & Rights
  review_status: ReviewStatus;
  rights_mode?: RightsMode;
  rights_status: RightsStatus;
  rights_notes?: string;
  embed_status: EmbedStatus;
  embeddable?: boolean;
  priority: 'High' | 'Medium' | 'Low';
  islamic_relevance_score?: number; // 0–100
  // Source
  source_type: SourceType;
  youtube_video_id?: string;  // undefined = RESOLVE_BY_API
  thumbnail_url?: string;
  // Meta
  duration_minutes?: number;
  duration_seconds?: number;
  published_at?: string;
  year?: number;
  tags?: string[];
  isFeatured?: boolean;
  allow_download?: boolean;
  subtitles_available?: string[];
  premium?: boolean;
  // Public visibility control
  visibility?: ContentVisibility;   // default = 'admin_only' for youtube_embed source_type
  playback_type?: PlaybackType;     // default = 'youtube_embed' for youtube source_type
}

// ─── TRUSTED CHANNEL REGISTRY ────────────────────────────────────────────────
// Architecture for 600+ Arabic long-form catalog
export interface TrustedChannel {
  id: string;
  name: string;
  nameAr?: string;
  youtubeHandle: string;
  youtubeChannelId?: string;   // resolved via YouTube Data API
  language: VideoLanguage;
  target_count: number;        // editorial target
  content_focus: string[];
  minimum_duration_seconds: number;
  auto_import: boolean;        // whether to auto-import or manual only
}

export const TRUSTED_CHANNELS: TrustedChannel[] = [
  {
    id: 'tc_iqraa',
    name: 'IQRAA TV',
    nameAr: 'قناة اقرأ',
    youtubeHandle: '@iqraa',
    language: 'ar',
    target_count: 200,
    content_focus: ['documentary', 'seerah', 'islamic_history', 'prophet_stories',
      'ramadan_series', 'islamic_civilization', 'family', 'educational'],
    minimum_duration_seconds: 720, // 12 min
    auto_import: false,
  },
  {
    id: 'tc_alresalah',
    name: 'Al Resalah TV',
    nameAr: 'قناة الرسالة',
    youtubeHandle: '@alresalah',
    language: 'ar',
    target_count: 150,
    content_focus: ['seerah', 'history', 'islamic_personalities', 'family',
      'ramadan', 'islamic_civilization', 'stories', 'documentary'],
    minimum_duration_seconds: 720,
    auto_import: false,
  },
  {
    id: 'tc_aljazeera_doc',
    name: 'Al Jazeera Documentary',
    nameAr: 'الجزيرة الوثائقية',
    youtubeHandle: '@aljazeeradocumentary',
    language: 'ar',
    target_count: 120,
    content_focus: ['islamic_documentary', 'muslim_world', 'islamic_history',
      'islamic_civilization', 'andalusia', 'ottoman', 'quds', 'scholars'],
    minimum_duration_seconds: 1200, // 20 min
    auto_import: false,
    // Islamic relevance filter keywords for this channel:
    // الإسلام,المسلمون,السيرة,الأنبياء,الصحابة,مكة,المدينة,الحج,رمضان,الأندلس,ابن بطوطة,ابن سينا
  },
  {
    id: 'tc_saudi_tv',
    name: 'Saudi TV Official',
    nameAr: 'التلفزيون السعودي',
    youtubeHandle: '@sauditv',
    language: 'ar',
    target_count: 50,
    content_focus: ['makkah', 'madinah', 'haram', 'hajj', 'umrah', 'haramain_history',
      'imams', 'arafat', 'pilgrims'],
    minimum_duration_seconds: 720,
    auto_import: false,
  },
  {
    id: 'tc_haramain',
    name: 'General Presidency for Haramain Affairs',
    nameAr: 'الرئاسة العامة لشؤون الحرمين',
    youtubeHandle: '@makkah',
    language: 'ar',
    target_count: 40,
    content_focus: ['kaaba', 'kiswa', 'haram', 'zamzam', 'maqam_ibrahim',
      'nabawi', 'makkah_history', 'madinah_history', 'architecture'],
    minimum_duration_seconds: 720,
    auto_import: false,
  },
  {
    id: 'tc_ministry_hajj',
    name: 'Ministry of Hajj and Umrah',
    nameAr: 'وزارة الحج والعمرة',
    youtubeHandle: '@SaudiMOHU',
    language: 'ar',
    target_count: 40,
    content_focus: ['hajj_documentary', 'umrah', 'ihram', 'tawaf', 'sai',
      'mina', 'arafah', 'muzdalifah', 'jamaraat', 'pilgrimage_history'],
    minimum_duration_seconds: 720,
    auto_import: false,
  },
  {
    id: 'tc_pac',
    name: 'Pilgrims Awareness Center',
    nameAr: 'مركز الحجاج للتوعية',
    youtubeHandle: '@pilgrimsawareness',
    language: 'multi',
    target_count: 200,
    content_focus: ['hajj_guide', 'umrah_guide', 'ihram', 'tawaf', 'sai',
      'sacred_places', 'pilgrim_health', 'multilingual'],
    minimum_duration_seconds: 240,
    auto_import: false,
  },
  {
    id: 'tc_famille_musulmane',
    name: 'Famille Musulmane',
    youtubeHandle: '@famillemusulmane',
    language: 'fr',
    target_count: 50,
    content_focus: ['kids_prayer', 'wudu', 'prophet_stories_kids', 'islamic_education'],
    minimum_duration_seconds: 300,
    auto_import: false,
  },
  {
    id: 'tc_fambras',
    name: 'International Halal Academy / FAMBRAS',
    youtubeHandle: '@InternationalHalalAcademy',
    language: 'pt',
    target_count: 50,
    content_focus: ['halal_market', 'islam_basics', 'muslim_life_brazil',
      'islamic_finance', 'seerah', 'new_muslims'],
    minimum_duration_seconds: 300,
    auto_import: false,
  },
];

// ─── ARABIC CONTENT FILTERS ──────────────────────────────────────────────────
// Used by resolveYouTubeVideo() to score Islamic relevance
export const ARABIC_ISLAMIC_KEYWORDS = [
  'الإسلام', 'المسلمون', 'الحضارة الإسلامية', 'السيرة', 'محمد', 'الرسول',
  'الأنبياء', 'الصحابة', 'مكة', 'المدينة', 'الحرمين', 'الكعبة', 'الحج',
  'العمرة', 'رمضان', 'المساجد', 'الأندلس', 'العلماء المسلمين', 'التاريخ الإسلامي',
  'الدولة الإسلامية', 'الدولة العثمانية', 'القدس', 'المسجد الأقصى', 'الوقف',
  'المخطوطات الإسلامية', 'العلوم عند المسلمين', 'الرحالة المسلمون',
  'ابن بطوطة', 'الإدريسي', 'ابن سينا', 'الخوارزمي', 'ابن الهيثم',
  'وثائقي', 'وثائقية', 'السيرة النبوية', 'قصص الأنبياء', 'المسجد الحرام',
  'المسجد النبوي', 'كسوة الكعبة', 'زمزم', 'مقام إبراهيم', 'عرفة', 'منى',
  'مزدلفة', 'الجمرات', 'محراب', 'تاريخ مكة', 'تاريخ المدينة',
];

export const AUTO_REJECT_KEYWORDS = [
  'shorts', 'short', 'clip', 'trailer', 'live', 'بث مباشر', 'خبر عاجل',
  'نشرة أخبار', 'مقطع قصير', '#shorts', 'رياضة', 'كرة قدم', 'سياسة',
];

// ─────────────────────────────────────────────────────────────────────────────
//  CATALOG — BATCH 1: 50 ENGLISH VIDEOS
// ─────────────────────────────────────────────────────────────────────────────
const BATCH_1: VideoItem[] = [
  {
    id: 'q30s7_01', title: "Juz 1: Allah's Names in the Qur'an | Sh. Mohammad Elshinawy",
    description: "Qur'an 30 for 30 – Season 7. Exploring the divine names of Allah as revealed in the first juz.",
    channel: 'Yaqeen Institute', series: "Qur'an 30 for 30 – Season 7",
    category: 'quran_tafsir', content_type: 'lecture', language: 'en', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'Zcj1dm2evuY', isFeatured: true,
    tags: ['quran', 'tafsir', 'juz1', 'names of allah'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_02', title: 'Juz 2: The Lord of Rituals | Mufti Menk',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '4NG9AV7vJGI',
    tags: ['quran', 'tafsir', 'juz2'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_03', title: "Juz 3: How The Qur'an Makes You Rich | Dr. Tahir Wyatt",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '06w596oNzAw',
    tags: ['quran', 'tafsir', 'juz3'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_04', title: 'Juz 4: The Final Moments of This Life | Ahmad Hraichie',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'tHL82zmafoM',
    tags: ['quran', 'tafsir', 'juz4'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_05', title: "Juz 5: You Can't Fight Fire with Fire | Ust. Fatima Lette",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'gHx4kQkM1Wc',
    tags: ['quran', 'tafsir', 'juz5'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_06', title: 'Juz 6: Signs of A Hypocrite | Sh. Asim Khan',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'xa6Bj8FvnPg',
    tags: ['quran', 'tafsir', 'juz6'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_07', title: 'Juz 7: They Know Al-Lateef in Gaza | Dr. Farhan Abdul Azeez',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'qPSelnHIsw8',
    isFeatured: true, tags: ['quran', 'tafsir', 'juz7'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_08', title: "Juz 8: Whose Validation Do You Need? | Sh. Shabbir Hassan",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'JWSQ6IR98-c',
    tags: ['quran', 'tafsir', 'juz8'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_09', title: "Juz 9: How To Memorize Allah's Names | Dr. Haifaa Younis",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '0Nguw7xrDWA',
    tags: ['quran', 'tafsir', 'juz9'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_10', title: 'Juz 10: When Allah Goes To War For You | Dr. Suleiman Hani',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '9gwe-HMwZv0',
    tags: ['quran', 'tafsir', 'juz10'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_11', title: 'Juz 11: Stop Playing Games | Dr. Ovamir Anjum',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'wgHsETM42lo',
    tags: ['quran', 'tafsir', 'juz11'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_12', title: 'Juz 12: Allah Is Not Far | Sh. Omar Hedroug',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'Cm83o57tjSg',
    tags: ['quran', 'tafsir', 'juz12'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_13', title: "Juz 13: What Is 1% of Allah's Mercy? | Dr. Mohamed AbuTaleb",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'I56bg4keshE',
    tags: ['quran', 'tafsir', 'juz13', 'mercy'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_14', title: 'Juz 14: The Surah of Blessings | Ust. Taimiyyah Zubair',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'v_ULCFixvJE',
    tags: ['quran', 'tafsir', 'juz14'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_15', title: 'Juz 15: Join the Heavens in Glorifying Allah | Sh. Mohamud Mohamed',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'G6sXzPFpn_s',
    tags: ['quran', 'tafsir', 'juz15'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_16', title: 'Juz 16: Can You Be Patient With Allah? | Ust. Lobna Mulla',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '5yTp-40iEOQ',
    tags: ['quran', 'tafsir', 'juz16', 'sabr'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_17', title: 'Juz 17: When Allah Chooses You, How Will You Respond? | Sh. Yousef Wahb',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'sFaJph_x4uw',
    tags: ['quran', 'tafsir', 'juz17'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_18', title: "Juz 18: The Qur'an Is A Cure | Dr. Tesneem Alkiek",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'tQFk40eSGjA',
    tags: ['quran', 'tafsir', 'juz18'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_19', title: 'Juz 19: What Makes You Valuable to Allah? | Ust. Roohi Tahir',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '4qImREXNsKo',
    tags: ['quran', 'tafsir', 'juz19'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_20', title: "Juz 20: Allah's Loud and Silent Revelations | Sh. Hisham Abu Yusuf",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '-XWH3NIfdTA',
    tags: ['quran', 'tafsir', 'juz20'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_21', title: 'Juz 21: Allah Is The Author of History | Sr. Sarah Sultan',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'u5a2NtubPsQ',
    tags: ['quran', 'tafsir', 'juz21'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_22', title: 'Juz 22: Appreciating Muhammad ﷺ | Sh. Omar Hajjaj',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'wWSUvSvdBnc',
    tags: ['quran', 'tafsir', 'juz22', 'prophet'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_23', title: 'Juz 23: Facing Your Trials With Honor | Dr. Farah Islam',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'wDgTNn_DzjU',
    tags: ['quran', 'tafsir', 'juz23'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_24', title: 'Juz 24: Candid Conversations with Allah | Mufti Abdul Rahman Waheed',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'uMBUm3EyLwU',
    tags: ['quran', 'tafsir', 'juz24'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_25', title: 'Juz 25: God Is Not A Mystery | Sh. Ibrahim Hindy',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'Z8PlvICmEbs',
    tags: ['quran', 'tafsir', 'juz25'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_26', title: "Juz 26: Don't Run From Struggle | Sh. Mikaeel Smith",
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'WodoQu3VGf0',
    tags: ['quran', 'tafsir', 'juz26'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_27', title: 'Juz 27: The Night You Give Everything | Sh. Abu Bakr Zoud',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: '52HgWWGzEik',
    isFeatured: true, tags: ['quran', 'tafsir', 'juz27', 'laylat al-qadr'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_28', title: 'Juz 28: How To Truly Be Conscious of Allah | Dr. Jinan Yousef',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'veea7VAyDOs',
    tags: ['quran', 'tafsir', 'juz28'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_29', title: 'Juz 29: Your Spiritual Report Card | Dr. Nazir Khan',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'u6CXUeQ-goY',
    tags: ['quran', 'tafsir', 'juz29'], islamic_relevance_score: 95,
  },
  {
    id: 'q30s7_30', title: 'Juz 30: Love Al-Razzaq More Than Rizq | Sh. Navaid Aziz',
    description: "Qur'an 30 for 30 – Season 7.", channel: 'Yaqeen Institute',
    series: "Qur'an 30 for 30 – Season 7", category: 'quran_tafsir', content_type: 'lecture',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check',
    embed_status: 'unchecked', priority: 'High', source_type: 'youtube', youtube_video_id: 'riN-w2wqYRE',
    isFeatured: true, tags: ['quran', 'tafsir', 'juz30'], islamic_relevance_score: 95,
  },
  // The Firsts — Seerah
  { id: 'firsts_01', title: 'Zaid Ibn Amr (ra): A One Man Ummah', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'aJHYUDMJERM', isFeatured: true,
    tags: ['seerah', 'companions', 'firsts'], islamic_relevance_score: 92 },
  { id: 'firsts_02', title: 'Waraqa Ibn Nawfal: The First to Confirm Prophethood', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'EUETx5TTZ4g',
    tags: ['seerah', 'firsts'], islamic_relevance_score: 92 },
  { id: 'firsts_03', title: 'Khadijah (ra): His First Love, Our First Mother', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'gRBTQKlfC78',
    tags: ['seerah', 'khadijah'], islamic_relevance_score: 92 },
  { id: 'firsts_04', title: 'Umm Ayman (ra): The Woman Who Never Stopped Caring', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'QrrIdK5AjgI',
    tags: ['seerah', 'companions'], islamic_relevance_score: 92 },
  { id: 'firsts_05', title: 'Ali ibn Abi Talib (ra): Courageous & Steadfast', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'In91yLh_WFU',
    tags: ['seerah', 'ali', 'companions'], islamic_relevance_score: 92 },
  { id: 'firsts_06', title: 'The First Family: The Beautiful Marriage of Ali and Fatima', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'RbwnRZ30TVE',
    tags: ['seerah', 'family'], islamic_relevance_score: 90 },
  { id: 'firsts_07', title: 'The First Family - Part 2: From Love to the Pain of Death', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'zSa4kKwo_cs',
    tags: ['seerah', 'family'], islamic_relevance_score: 90 },
  { id: 'firsts_08', title: 'Abu Bakr (ra): Second to None in the Pursuit of God', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'Rck2DlxxkTc', isFeatured: true,
    tags: ['seerah', 'abu bakr', 'companions'], islamic_relevance_score: 92 },
  { id: 'firsts_09', title: 'Abu Bakr (ra) - Part 2: Setting His Own Standards', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'tbPimlm0r2w',
    tags: ['seerah', 'abu bakr'], islamic_relevance_score: 92 },
  { id: 'firsts_10', title: 'Abu Bakr (ra) - Part 3: There Will Never Be Another One', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'QCJfaDw-6zM',
    tags: ['seerah', 'abu bakr'], islamic_relevance_score: 92 },
  { id: 'firsts_11', title: 'Julaybib (ra): The Most Beautiful Story', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'gVobZS1AR_k',
    tags: ['seerah', 'companions'], islamic_relevance_score: 90 },
  { id: 'firsts_12', title: 'The Plague that Killed Sahaba and the Coronavirus', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'k8gVIyoXEUg',
    tags: ['seerah', 'history'], islamic_relevance_score: 88 },
  { id: 'firsts_13', title: 'Zayd Ibn Al Haritha (ra): Loved and Liberated', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'uM1YO0D-Hos',
    tags: ['seerah', 'companions'], islamic_relevance_score: 92 },
  { id: 'firsts_14', title: 'Sumayyah (ra): The First Martyr', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'YV0huLXPBz8', isFeatured: true,
    tags: ['seerah', 'martyrdom'], islamic_relevance_score: 92 },
  { id: 'firsts_15', title: 'Khabbab Ibn Al Aratt (ra) - Under Burning Hot Coals', description: 'The Firsts series.',
    channel: 'Yaqeen Institute', series: 'The Firsts', category: 'seerah_history', content_type: 'documentary',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'G4M8XJ13LS0',
    tags: ['seerah', 'companions'], islamic_relevance_score: 92 },
  // Prophet Stories
  { id: 'prophets_01', title: 'Introduction | Ep 1 | Stories Of The Prophets Series', description: 'Prophet stories intro.',
    channel: 'One Islam Productions', series: 'Stories Of The Prophets', category: 'prophet_stories',
    content_type: 'series_episode', language: 'en', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'k4hRONalWU4', isFeatured: true,
    tags: ['prophets', 'stories'], islamic_relevance_score: 90 },
  { id: 'prophets_02', title: 'The Story Of Prophet Yunus (AS) | EP 34', description: 'Story of Yunus (Jonah).',
    channel: 'One Islam Productions', series: 'Stories Of The Prophets', category: 'prophet_stories',
    content_type: 'series_episode', language: 'en', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'vO5YMfh9k5Y', tags: ['prophets', 'yunus'], islamic_relevance_score: 90 },
  // Kids
  { id: 'kids_01', title: 'Stories of the Prophets | Islamic Cartoon for Kids', description: 'Animated prophet stories.',
    channel: 'Muslim Kids TV', series: 'Islamic Cartoon for Kids', category: 'kids',
    content_type: 'kids_story', language: 'en', audience: 'Kids', kids_safe: true,
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '5NihvUBrAvk', tags: ['kids', 'prophets'], islamic_relevance_score: 88 },
  { id: 'kids_02', title: 'My Special Prayer | Islamic Stories for Kids', description: 'Child learning to pray.',
    channel: 'Muslim Kids TV', series: 'Islamic Stories for Kids', category: 'kids',
    content_type: 'kids_story', language: 'en', audience: 'Kids', kids_safe: true,
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '1c9vf842eDg', tags: ['kids', 'prayer'], islamic_relevance_score: 88 },
  // Hajj EN
  { id: 'hajj_en_01', title: 'How to Perform Umrah Step by Step',
    titleAr: 'كيفية أداء العمرة خطوة بخطوة',
    description: 'Step-by-step Umrah guide.', channel: 'Pilgrims Awareness Center',
    series: 'Umrah Guide', category: 'hajj_umrah', content_type: 'guide',
    language: 'en', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'bmyOs-Ba7rI', isFeatured: true,
    tags: ['hajj', 'umrah', 'guide'], islamic_relevance_score: 95 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  CATALOG — BATCH 2: 40 MULTILINGUAL VIDEOS
// ─────────────────────────────────────────────────────────────────────────────
const BATCH_2: VideoItem[] = [
  // Portuguese — Halal Cast
  { id: 'pt_halalcast_02', title: 'HALAL CAST #02 — Desmistificando o Islam',
    description: 'Quebrando mitos sobre o Islam no Brasil.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'islam_basics', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'MPzm-RdXjlM', isFeatured: true,
    tags: ['islam', 'brasil'], islamic_relevance_score: 85 },
  { id: 'pt_halalcast_01', title: 'HALAL CAST #01 — O Mercado Halal',
    description: 'Mercado halal global.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'islamic_lifestyle', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'csqvNwMadsI',
    tags: ['halal', 'mercado'], islamic_relevance_score: 72 },
  { id: 'pt_halalcast_03', title: 'HALAL CAST #03 — Moda Modesta',
    description: 'Moda islâmica no Brasil.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'islamic_lifestyle', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'yw7uRHu6Oks',
    tags: ['moda', 'modestia'], islamic_relevance_score: 75 },
  { id: 'pt_halalcast_04', title: 'HALAL CAST #04 — História do Halal no Brasil',
    description: 'Trajetória do Islam no Brasil.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'seerah_history', content_type: 'documentary',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'sAu__JxSU5E',
    tags: ['historia', 'brasil'], islamic_relevance_score: 78 },
  { id: 'pt_halalcast_05', title: 'Uma Muçulmana nas Redes Sociais — Mariam Chami',
    description: 'Identidade muçulmana no digital.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'islamic_lifestyle', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'JRgy5LZAn0Y', isFeatured: true,
    tags: ['mulher', 'identidade'], islamic_relevance_score: 80 },
  { id: 'pt_halalcast_06', title: 'Liderança na Visão Islâmica',
    description: 'Liderança e ética islâmica.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'lectures', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'yUio34tv-NA',
    tags: ['liderança', 'etica'], islamic_relevance_score: 78 },
  { id: 'pt_halalcast_07', title: 'Finanças Islâmicas',
    description: 'Introdução às finanças islâmicas.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'islamic_finance', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'hp3Yn9AR4ZI', isFeatured: true,
    tags: ['financas', 'halal'], islamic_relevance_score: 80 },
  { id: 'pt_halalcast_08', title: 'Samira Ghannoun — Vida e Fé',
    description: 'Testemunho de Samira Ghannoun.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'new_muslims', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'mWTZk4dFv0Q',
    tags: ['historia', 'testemunho'], islamic_relevance_score: 80 },
  { id: 'pt_halalcast_09', title: 'Sheikh Bukai — Profeta Muhammad ﷺ',
    description: 'Vida e legado do Profeta ﷺ.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'seerah_history', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'zmJz5297sxY', isFeatured: true,
    tags: ['profeta', 'seerah'], islamic_relevance_score: 88 },
  { id: 'pt_halalcast_10', title: 'Fé, Representatividade e Transformação',
    description: 'Conversão e transformação pelo Islam.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Halal Cast', category: 'new_muslims', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: '8Ijk6kfJl98', isFeatured: true,
    tags: ['conversao', 'fe'], islamic_relevance_score: 85 },
  // Momento Halal
  { id: 'pt_momento_01', title: 'Momento Halal com Fátima Cheaitou',
    description: 'Reflexões sobre o Islam.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Momento Halal', category: 'islam_basics', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'aIByFBQQ9kg', tags: ['islam'], islamic_relevance_score: 82 },
  { id: 'pt_momento_02', title: 'Momento Halal com Mansur Peixoto',
    description: 'História e fundamentos do Islam.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Momento Halal', category: 'islam_basics', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'v-5mZXv5IfA', tags: ['historia'], islamic_relevance_score: 82 },
  { id: 'pt_momento_03', title: 'Momento Halal — Especial Ramadan',
    description: 'Especial Ramadan.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Momento Halal', category: 'ramadan', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'hhgnGJz2iqQ', tags: ['ramadan'], islamic_relevance_score: 88 },
  { id: 'pt_momento_04', title: 'Momento Halal — Especial Ramadan 2026',
    description: 'Especial Ramadan 2026.', channel: 'International Halal Academy / FAMBRAS',
    series: 'Momento Halal', category: 'ramadan', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'OVHbRttmMNk', isFeatured: true,
    tags: ['ramadan'], islamic_relevance_score: 88 },
  { id: 'pt_pilares_01', title: 'Os 5 Pilares do Islam',
    description: 'Os cinco pilares do Islam para iniciantes.', channel: 'Reflexão Islâmica',
    series: 'Islamic Basics', category: 'islam_basics', content_type: 'lecture',
    language: 'pt', audience: 'Beginners', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'YvVAgRTPfRM', isFeatured: true,
    tags: ['pilares', 'iniciantes'], islamic_relevance_score: 90 },
  { id: 'pt_historia_01', title: 'O Profeta Muhammad e sua Influência no Iluminismo',
    description: 'Influência islâmica no Iluminismo.', channel: 'História Islâmica',
    series: 'História Islâmica', category: 'seerah_history', content_type: 'documentary',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'SCvEmbuEGzU',
    tags: ['historia', 'profeta'], islamic_relevance_score: 82 },
  { id: 'pt_hegira_01', title: 'A Hégira do Profeta Muhammad — Marco da História do Islam',
    description: 'A Hégira e seu significado.', channel: 'Arresala',
    series: 'As Chaves do Paraíso', category: 'seerah_history', content_type: 'documentary',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'UDRijs0hpyo',
    tags: ['hegira', 'seerah'], islamic_relevance_score: 85 },
  { id: 'pt_inteligencia_01', title: 'Islamismo — Mansur Peixoto',
    description: 'Entrevista sobre Islam no Brasil.', channel: 'Inteligência Ltda.',
    series: 'Long-form Interview', category: 'conversations', content_type: 'lecture',
    language: 'pt', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'uD70D1kMlJw',
    tags: ['entrevista', 'brasil'], islamic_relevance_score: 72 },
  // French — Famille Musulmane
  { id: 'fr_prayer_kids_01', title: "C'est Quoi la Prière ? — Explication pour Enfants",
    description: "Explication de la prière pour enfants.", channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: '6g_M8P-cvcw', isFeatured: true,
    tags: ['enfants', 'priere'], islamic_relevance_score: 90 },
  { id: 'fr_wudu_kids_01', title: 'Woudou (Ablutions) pour Enfants',
    description: "Ablutions pour enfants.", channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'I81QWTfOVFY',
    tags: ['wudu', 'enfants'], islamic_relevance_score: 90 },
  { id: 'fr_prayer_3d_01', title: 'Apprendre la Prière — Film Animation 3D Enfants',
    description: "Film d'animation 3D pour apprendre la prière.", channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: '8EbfA8opHKY', isFeatured: true,
    tags: ['priere', 'animation', 'enfants'], islamic_relevance_score: 90 },
  { id: 'fr_prayer_resume_01', title: 'Résumé de la Prière — Animation Islamique Enfants',
    description: "Résumé de la prière avec animation.", channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: '3IjqoeKa0JY',
    tags: ['priere', 'animation'], islamic_relevance_score: 90 },
  { id: 'fr_nuh_kids_01', title: "Histoire de Nûh (Noé) — Prophète pour Enfants",
    description: "Histoire du prophète Nûh pour enfants.", channel: 'Famille Musulmane',
    series: "Les Prophètes d'Allah", category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'PBdodG2eY1g',
    tags: ['nuh', 'prophete', 'enfants'], islamic_relevance_score: 90 },
  { id: 'fr_ibrahim_kids_01', title: "Histoire d'Ibrahim — Prophète pour Enfants",
    description: "Histoire du prophète Ibrahim pour enfants.", channel: 'Famille Musulmane',
    series: "Les Prophètes d'Allah", category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'cI6b_Ecno5A', isFeatured: true,
    tags: ['ibrahim', 'prophete', 'enfants'], islamic_relevance_score: 90 },
  { id: 'fr_umrah_01', title: "Comment accomplir la Omra étape par étape",
    description: "Guide Omra PAC.", channel: 'Pilgrims Awareness Center',
    series: 'Guide Omra', category: 'hajj_umrah', content_type: 'guide',
    language: 'fr', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'mJaGbmXa1YM', isFeatured: true,
    tags: ['omra', 'guide'], islamic_relevance_score: 92 },
  { id: 'fr_hajj_cailloux_01', title: 'Comment ramasser les cailloux pour la lapidation des Jamaraat ?',
    description: 'Instructions pour la lapidation.', channel: 'Pilgrims Awareness Center',
    series: 'Guide Hajj', category: 'hajj_umrah', content_type: 'guide',
    language: 'fr', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'dTCCyKugsWI',
    tags: ['hajj', 'jamaraat'], islamic_relevance_score: 92 },
  { id: 'fr_ihram_niyyah_01', title: "La condition de l'intention (Niyyah) dans l'Ihram",
    description: "L'importance de la Niyyah.", channel: 'Pilgrims Awareness Center',
    series: 'Ihram Guide', category: 'ihram', content_type: 'guide',
    language: 'fr', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'a8EYZvJoQ5A',
    tags: ['ihram', 'niyyah'], islamic_relevance_score: 92 },
  { id: 'fr_mina_01', title: 'Mina, site spirituel clé du Hajj',
    description: "Présentation de Mina.", channel: 'Pilgrims Awareness Center',
    series: 'Sacred Places', category: 'sacred_places', content_type: 'documentary',
    language: 'fr', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'VmgZIed-6qI',
    tags: ['mina', 'hajj'], islamic_relevance_score: 90 },
  // Arabic — PAC + Zad
  { id: 'ar_umrah_01', title: 'كيفية أداء العمرة خطوة بخطوة', titleAr: 'كيفية أداء العمرة خطوة بخطوة',
    description: 'Step-by-step Umrah guide.', descriptionAr: 'دليل تفصيلي لأداء العمرة.',
    channel: 'Pilgrims Awareness Center', series: 'دليل العمرة', category: 'hajj_umrah', content_type: 'guide',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'bmyOs-Ba7rI', isFeatured: true,
    tags: ['عمرة', 'حج'], islamic_relevance_score: 95 },
  { id: 'ar_ihram_wear_01', title: 'كيف ترتدي لباس الإحرام', titleAr: 'كيف ترتدي لباس الإحرام',
    description: 'How to wear Ihram.', channel: 'Pilgrims Awareness Center',
    series: 'دليل الإحرام', category: 'ihram', content_type: 'guide',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'n8v3fpfPeFE',
    tags: ['إحرام', 'لباس'], islamic_relevance_score: 92 },
  { id: 'ar_tawaf_01', title: 'كيفية أداء الطواف خطوة بخطوة', titleAr: 'كيفية أداء الطواف خطوة بخطوة',
    description: 'Tawaf guide.', channel: 'Pilgrims Awareness Center',
    series: 'دليل الطواف', category: 'hajj_umrah', content_type: 'guide',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'vNGdjGJ2m7k', isFeatured: true,
    tags: ['طواف', 'كعبة'], islamic_relevance_score: 95 },
  { id: 'ar_ihram_what_01', title: 'ما هو الإحرام؟', titleAr: 'ما هو الإحرام؟',
    description: 'What is Ihram?', channel: 'Pilgrims Awareness Center',
    series: 'دليل الإحرام', category: 'ihram', content_type: 'guide',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'CPMru-B3VS0',
    tags: ['إحرام'], islamic_relevance_score: 92 },
  { id: 'ar_haram_gates_01', title: 'تعرّف على بوابات الحرم المكي', titleAr: 'تعرّف على بوابات الحرم المكي',
    description: 'Gates of the Grand Mosque.', channel: 'Pilgrims Awareness Center',
    series: 'دليل الحرم', category: 'sacred_places', content_type: 'documentary',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'mjRwJqbfdtQ',
    tags: ['حرم', 'مكة'], islamic_relevance_score: 88 },
  { id: 'ar_women_umrah_01', title: 'حقيبة المرأة المعتمرة', titleAr: 'حقيبة المرأة المعتمرة',
    description: 'Essentials for women going to Umrah.', channel: 'Pilgrims Awareness Center',
    series: 'دليل العمرة', category: 'hajj_umrah', content_type: 'guide',
    language: 'ar', audience: 'Women', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'SYdnoWBJEno',
    tags: ['عمرة', 'نساء'], islamic_relevance_score: 90 },
  { id: 'ar_kids_wudu_01', title: 'تعليم الوضوء والصلاة للأطفال', titleAr: 'تعليم الوضوء والصلاة للأطفال',
    description: 'Teaching children Wudu and prayer.', channel: 'Sweet Kalima',
    series: 'تعليم الأطفال', category: 'kids', content_type: 'kids_story',
    language: 'ar', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'igws-HtOx84', isFeatured: true,
    tags: ['وضوء', 'صلاة', 'أطفال'], islamic_relevance_score: 92 },
  { id: 'ar_kids_ibrahim_01', title: 'قصة سيدنا إبراهيم للأطفال', titleAr: 'قصة سيدنا إبراهيم للأطفال',
    description: 'Story of Ibrahim for children.', channel: 'El Schoola - الاسكوله',
    series: 'قصص الأنبياء', category: 'kids', content_type: 'kids_story',
    language: 'ar', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'xqXCuTlgvVs',
    tags: ['قصص', 'أنبياء', 'أطفال'], islamic_relevance_score: 92 },
  { id: 'ar_seerah_zad_01', title: 'الرسول القدوة ﷺ — السيرة النبوية', titleAr: 'الرسول القدوة ﷺ',
    description: 'Seerah lecture from Zad Academy.', channel: 'Zad Academy',
    series: 'السيرة النبوية', category: 'seerah_history', content_type: 'lecture',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'GGSrG7U06aU', isFeatured: true,
    tags: ['سيرة', 'رسول'], islamic_relevance_score: 95 },
  { id: 'ar_fiqh_itikaf_01', title: 'الاعتكاف — محاضرة في الفقه', titleAr: 'الاعتكاف',
    description: 'Itikaf fiqh lecture.', channel: 'Zad Academy',
    series: 'الفقه', category: 'fiqh', content_type: 'lecture',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'Medium', source_type: 'youtube', youtube_video_id: 'ULtcHZvaaHQ',
    tags: ['فقه', 'اعتكاف'], islamic_relevance_score: 90 },
  { id: 'ar_tafsir_fatiha_01', title: 'من فضائل سورة الفاتحة', titleAr: 'من فضائل سورة الفاتحة',
    description: 'Virtues of Surah Al-Fatiha.', channel: 'Zad Academy',
    series: 'تفسير القرآن', category: 'quran_tafsir', content_type: 'lecture',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'ob2ECpn9IeE', isFeatured: true,
    tags: ['تفسير', 'فاتحة'], islamic_relevance_score: 95 },
  { id: 'ar_tafsir_fatiha_02', title: 'تلخيص ما تضمنته سورة الفاتحة من فوائد', titleAr: 'تلخيص سورة الفاتحة',
    description: 'Summary of Al-Fatiha benefits.', channel: 'Zad Academy',
    series: 'تفسير القرآن', category: 'quran_tafsir', content_type: 'lecture',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'ydGQPEhK9n4', isFeatured: true,
    tags: ['تفسير', 'فاتحة', 'فوائد'], islamic_relevance_score: 95 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  CATALOG — BATCH 3: 100 MULTILINGUAL VIDEOS (IDs 91–190)
//  PT (91–116) + FR (117–132) + AR (133–145) + ID (146–157) + UR (158–169)
//  FA (170–181) + EN (182–190) — SOURCE: PAC + FAMBRAS + Famille Musulmane
//  Videos with youtube_video_id = undefined are RESOLVE_BY_API
// ─────────────────────────────────────────────────────────────────────────────
const BATCH_3: VideoItem[] = [
  // ── PORTUGUESE 91–116 (International Halal Academy / FAMBRAS) ──
  { id: 'b3_pt_091', title: 'HALAL CAST #05 — Presença Halal no Mercado Brasileiro',
    description: 'Halal Cast. O crescimento do mercado halal no Brasil.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'vc5ZgNILxOw', tags: ['halal', 'brasil'], islamic_relevance_score: 72 },
  { id: 'b3_pt_092', title: 'HALAL CAST #08 — Carapreta: Um Case de Sucesso',
    description: 'Halal Cast. Case de sucesso no mercado halal brasileiro.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'mGe8nNOICVs', tags: ['halal', 'negocio'], islamic_relevance_score: 68 },
  { id: 'b3_pt_093', title: 'HALAL CAST #09 — Certificação Halal',
    description: 'Halal Cast. Tudo sobre certificação halal.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islam_basics',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'qwlW7dFddMg', tags: ['certificacao', 'halal'], islamic_relevance_score: 75 },
  { id: 'b3_pt_094', title: 'HALAL CAST #10 — A Importância da Rastreabilidade',
    description: 'Halal Cast. Rastreabilidade no mercado halal.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'kLc9V1tXTGI', tags: ['rastreabilidade', 'halal'], islamic_relevance_score: 68 },
  { id: 'b3_pt_095', title: 'HALAL CAST #11 — BRF: Protagonismo no Mercado Halal',
    description: 'Halal Cast. BRF e o mercado halal global.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'uN7n-yHbXew', tags: ['brf', 'halal'], islamic_relevance_score: 65 },
  { id: 'b3_pt_096', title: 'HALAL CAST #12 — Como Vender para o Mercado Árabe?',
    description: 'Halal Cast. Estratégias para o mercado árabe.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'conversations',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'bUo3FzT2Z7A', tags: ['mercado', 'arabe'], islamic_relevance_score: 65 },
  { id: 'b3_pt_097', title: 'HALAL CAST #14 — O Halal na Seara',
    description: 'Halal Cast. Halal na empresa Seara.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'lsa3aYYufKw', tags: ['seara', 'halal'], islamic_relevance_score: 65 },
  { id: 'b3_pt_098', title: 'HALAL CAST #15 — Quem é o Consumidor Muçulmano?',
    description: 'Halal Cast. Perfil do consumidor muçulmano.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'chEKFsnjVZk', tags: ['consumidor', 'muculmano'], islamic_relevance_score: 75 },
  { id: 'b3_pt_099', title: 'HALAL CAST #18 — Mourad',
    description: 'Halal Cast. Entrevista com Mourad.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'new_muslims',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'SSyGOqgnT0A', tags: ['entrevista'], islamic_relevance_score: 72 },
  { id: 'b3_pt_100', title: 'HALAL CAST #19 — Amakos da Amazônia',
    description: 'Halal Cast. Islam e sustentabilidade na Amazônia.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'fFZFQRi80-Y', tags: ['amazonia', 'sustentabilidade'], islamic_relevance_score: 70 },
  { id: 'b3_pt_101', title: 'HALAL CAST #20 — Global Halal Brazil Business Forum 2025',
    description: 'Halal Cast. Fórum de negócios halal no Brasil.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'OvTV7Wbsg-I', tags: ['forum', 'halal'], islamic_relevance_score: 65 },
  { id: 'b3_pt_102', title: 'HALAL CAST #22 — O Brasil Está Preparado para o Crescimento do Mercado Halal?',
    description: 'Halal Cast. Brasil e o mercado halal.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '-0w8ID75xFQ', tags: ['brasil', 'halal'], islamic_relevance_score: 65 },
  { id: 'b3_pt_103', title: 'HALAL CAST #23 — Brasil, o Gigante da Proteína Halal',
    description: 'Halal Cast. Brasil como exportador de proteína halal.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '-P6OBgaqugY', tags: ['proteina', 'halal'], islamic_relevance_score: 65 },
  { id: 'b3_pt_104', title: 'HALAL CAST #24 — Esclarecendo as Principais Dúvidas sobre o Halal',
    description: 'Halal Cast. Dúvidas respondidas sobre o Halal.',
    channel: 'International Halal Academy', series: 'Halal Cast', category: 'islam_basics',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'BvBAYyyubnI', tags: ['duvidas', 'halal'], islamic_relevance_score: 78 },
  { id: 'b3_pt_105', title: 'Momento Halal com Adel Yahya',
    description: 'Momento Halal. Reflexões com Adel Yahya.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islam_basics',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'qJMZPKTHIuk', tags: ['islam', 'reflexao'], islamic_relevance_score: 78 },
  { id: 'b3_pt_106', title: 'Momento Halal com Lina Ramadan',
    description: 'Momento Halal com Lina Ramadan.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islam_basics',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'UvRGPz_9qko', tags: ['islam'], islamic_relevance_score: 78 },
  { id: 'b3_pt_107', title: 'Momento Halal com Yousef Amer',
    description: 'Momento Halal. Finanças islâmicas com Yousef Amer.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_finance',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'qw35VWVU3J0', tags: ['financas', 'islamicas'], islamic_relevance_score: 80 },
  { id: 'b3_pt_108', title: 'Momento Halal com Soha Chabrawi',
    description: 'Momento Halal com Soha Chabrawi.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'J961uSsbRyE', tags: ['lifestyle', 'halal'], islamic_relevance_score: 75 },
  { id: 'b3_pt_109', title: 'Momento Halal com Alessandra Frisso',
    description: 'Vida muçulmana com Alessandra Frisso.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'new_muslims',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'vR3Rfj3Cy9I', tags: ['vida', 'muculmana'], islamic_relevance_score: 75 },
  { id: 'b3_pt_110', title: 'Momento Halal — PEC Halal',
    description: 'Momento Halal. PEC Halal no Congresso.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islam_basics',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'hQiaKoeFrGE', tags: ['pec', 'halal'], islamic_relevance_score: 68 },
  { id: 'b3_pt_111', title: 'Momento Halal com Delduque Martins',
    description: 'Momento Halal com Delduque Martins.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islam_basics',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '4sQ75wfaMJo', tags: ['halal', 'educacao'], islamic_relevance_score: 72 },
  { id: 'b3_pt_112', title: 'Momento Halal Especial Anuga 2025',
    description: 'Halal no evento Anuga 2025.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'm0KSeNNEvSQ', tags: ['anuga', 'halal'], islamic_relevance_score: 62 },
  { id: 'b3_pt_113', title: 'Momento Halal com Fernando Guinato',
    description: 'Turismo muslim-friendly com Fernando Guinato.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'Bkq1LsYhb1w', tags: ['turismo', 'halal'], islamic_relevance_score: 72 },
  { id: 'b3_pt_114', title: 'Momento Halal com Khaldoun',
    description: 'Halal pelo mundo com Khaldoun.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '4GLdRr-h1Y0', tags: ['mundo', 'halal'], islamic_relevance_score: 68 },
  { id: 'b3_pt_115', title: 'Momento Halal — Omar Chahine e Tamer Mansour',
    description: 'Halal global com Omar Chahine e Tamer Mansour.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'GXIZadkonwk', tags: ['global', 'halal'], islamic_relevance_score: 65 },
  { id: 'b3_pt_116', title: 'Momento Halal — Especial 1º Fórum Halal Anuga Select Brazil',
    description: 'Especial do 1º Fórum Halal no Anuga Select Brazil.',
    channel: 'International Halal Academy', series: 'Momento Halal', category: 'islamic_lifestyle',
    content_type: 'lecture', language: 'pt', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'Uev1JzDpiZU', tags: ['forum', 'anuga'], islamic_relevance_score: 62 },

  // ── FRENCH 117–132 (Famille Musulmane + PAC) ──
  { id: 'b3_fr_117', title: 'Apprendre la Prière Sans Musique — Animation Islamique Enfants',
    description: 'Apprendre la prière sans musique.', channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'J9V67mEGsbE',
    tags: ['priere', 'animation', 'enfants'], islamic_relevance_score: 90 },
  { id: 'b3_fr_118', title: 'Quand Faire la Prière ? — Les 5 Prières Expliquées aux Enfants',
    description: 'Les 5 prières pour enfants.', channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'r-wtH2n-M0I',
    tags: ['priere', 'enfants'], islamic_relevance_score: 90 },
  { id: 'b3_fr_119', title: 'Comment Faire la Prière — Pas à Pas pour Enfants',
    description: 'Prière pas à pas pour enfants.', channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'u6CBr6dJnik',
    tags: ['priere', 'enfants'], islamic_relevance_score: 90 },
  { id: 'b3_fr_120', title: 'Les Ablutions (Woudou) — Étapes Complètes pour Enfants',
    description: 'Ablutions complètes pour enfants.', channel: 'Famille Musulmane',
    series: 'La Prière pour les Petits', category: 'kids', content_type: 'kids_story',
    language: 'fr', audience: 'Kids', kids_safe: true, review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'G0QmF2SKDvo',
    tags: ['wudu', 'ablutions', 'enfants'], islamic_relevance_score: 90 },
  { id: 'b3_fr_121', title: 'Bismillah Édition 2018 — Chanson Islamique Enfants',
    description: 'Chanson Bismillah pour enfants.', channel: 'Famille Musulmane',
    category: 'kids', content_type: 'kids_story', language: 'fr', audience: 'Kids', kids_safe: true,
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: 'KuC7FFdIaQg', tags: ['bismillah', 'enfants'], islamic_relevance_score: 85 },
  { id: 'b3_fr_122', title: 'La Ilaha Illallah — Chant Islamique Enfants',
    description: 'Chant islamique pour enfants.', channel: 'Famille Musulmane',
    category: 'kids', content_type: 'kids_story', language: 'fr', audience: 'Kids', kids_safe: true,
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '8cT_0uqVwD8', tags: ['tawhid', 'enfants'], islamic_relevance_score: 88 },
  { id: 'b3_fr_123', title: "Bismillah — Adam & Meryem, Héros de l'Islam",
    description: 'Adam et Meryem héros de Islam.', channel: 'Famille Musulmane',
    category: 'kids', content_type: 'kids_story', language: 'fr', audience: 'Kids', kids_safe: true,
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: '2_1XffqQj8M', tags: ['bismillah', 'enfants'], islamic_relevance_score: 85 },
  { id: 'b3_fr_124', title: 'Quand commence le stationnement à Arafah (Wuquf) ?',
    description: "Le stationnement à Arafah.", channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fr', audience: 'General',
    review_status: 'Pending Editorial Review', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'unchecked', priority: 'High',
    source_type: 'youtube', youtube_video_id: 'zh1Gq_VlGwM', tags: ['arafah', 'hajj'], islamic_relevance_score: 92 },
  // FR 125–132: RESOLVE_BY_API
  { id: 'b3_fr_125', title: 'Directives pour les pèlerins diabétiques pendant le Hajj',
    description: 'Guide santé pour pèlerins diabétiques.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['sante', 'diabete', 'hajj'], islamic_relevance_score: 88 },
  { id: 'b3_fr_126', title: "Conseils de santé pour les patients asthmatiques pendant le Hajj",
    description: "Santé des asthmatiques au Hajj.", channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['sante', 'asthme', 'hajj'], islamic_relevance_score: 85 },
  { id: 'b3_fr_127', title: 'Comment se protéger de la grippe pendant le Hajj ?',
    description: 'Protection contre la grippe au Hajj.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['sante', 'grippe', 'hajj'], islamic_relevance_score: 82 },
  { id: 'b3_fr_128', title: 'La prière du vendredi à la Grande Mosquée',
    description: "Prière du vendredi à la Grande Mosquée.", channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['vendredi', 'mosquee'], islamic_relevance_score: 90 },
  { id: 'b3_fr_129', title: "La mosquée Al-Kheif - La plus grande mosquée de Mina",
    description: "Al-Kheif, grande mosquée de Mina.", channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['mosquee', 'mina'], islamic_relevance_score: 88 },
  { id: 'b3_fr_130', title: "Maqam Ibrahim - L'impact d'un prophète au cœur du Haram",
    description: 'Maqam Ibrahim au Haram.', channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['maqam', 'ibrahim', 'haram'], islamic_relevance_score: 92 },
  { id: 'b3_fr_131', title: 'Directives pour lapider les trois Jamaraat pendant les jours de Tashreeq',
    description: 'Lapidation des Jamaraat.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['jamaraat', 'tashreeq'], islamic_relevance_score: 90 },
  { id: 'b3_fr_132', title: 'Comment accomplir la lapidation de Jamrat Al-Aqaba ?',
    description: 'Lapidation de Jamrat Al-Aqaba.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fr', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['jamarat', 'aqaba'], islamic_relevance_score: 90 },

  // ── ARABIC 133–145 (PAC) ──
  { id: 'b3_ar_133', title: 'تعرّف على صفة الحج', titleAr: 'تعرّف على صفة الحج',
    description: 'Description of Hajj.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'صفة'], islamic_relevance_score: 95 },
  { id: 'b3_ar_134', title: 'تعرّف على مواقيت الإحرام وأحكامها', titleAr: 'مواقيت الإحرام وأحكامها',
    description: 'Ihram miqat rulings.', channel: 'Pilgrims Awareness Center',
    category: 'miqat', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['مواقيت', 'إحرام'], islamic_relevance_score: 95 },
  { id: 'b3_ar_135', title: 'كيف تحرم من الطائرة؟', titleAr: 'كيف تحرم من الطائرة؟',
    description: 'How to assume Ihram from the plane.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['إحرام', 'طائرة'], islamic_relevance_score: 92 },
  { id: 'b3_ar_136', title: 'أحكام الحج للمرأة', titleAr: 'أحكام الحج للمرأة',
    description: "Hajj rulings for women.", channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'نساء'], islamic_relevance_score: 95 },
  { id: 'b3_ar_137', title: 'تعرف على مزدلفة', titleAr: 'تعرف على مزدلفة',
    description: 'Learn about Muzdalifah.', channel: 'Pilgrims Awareness Center',
    series: 'دليل الحرم', category: 'sacred_places', content_type: 'documentary',
    language: 'ar', audience: 'General', review_status: 'Pending Editorial Review',
    rights_mode: 'youtube_embed', rights_status: 'embed_only_pending_check', embed_status: 'unchecked',
    priority: 'High', source_type: 'youtube', youtube_video_id: 'V73tFRtzzDM',
    tags: ['مزدلفة', 'حج'], islamic_relevance_score: 92 },
  { id: 'b3_ar_138', title: 'تشريعات التعجل والتأخر في الحج', titleAr: 'التعجل والتأخر في الحج',
    description: 'Rulings on early/late departure during Hajj.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'تعجل'], islamic_relevance_score: 90 },
  { id: 'b3_ar_139', title: 'سنن الإحرام المستحبة للمعتمر', titleAr: 'سنن الإحرام',
    description: 'Recommended Sunnah of Ihram.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['إحرام', 'سنن'], islamic_relevance_score: 92 },
  { id: 'b3_ar_140', title: 'الطريقة الصحيحة للاضطباع في العمرة', titleAr: 'الاضطباع في العمرة',
    description: 'Correct way to perform Idtiba in Umrah.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['اضطباع', 'عمرة'], islamic_relevance_score: 90 },
  { id: 'b3_ar_141', title: 'محظورات الإحرام للرجل', titleAr: 'محظورات الإحرام للرجل',
    description: 'Ihram prohibitions for men.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['إحرام', 'محظورات'], islamic_relevance_score: 92 },
  { id: 'b3_ar_142', title: 'لماذا شُرع الهدي للحاج؟', titleAr: 'الهدي في الحج',
    description: 'Why was Hady (sacrifice) prescribed for Hajj?', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['هدي', 'حج'], islamic_relevance_score: 90 },
  { id: 'b3_ar_143', title: 'إرشادات استخدام قطار المشاعر', titleAr: 'قطار المشاعر',
    description: 'Train guidance for pilgrims.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['قطار', 'مشاعر'], islamic_relevance_score: 85 },
  { id: 'b3_ar_144', title: 'محظورات الإحرام للمرأة', titleAr: 'محظورات الإحرام للمرأة',
    description: 'Ihram prohibitions for women.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ar', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['إحرام', 'نساء'], islamic_relevance_score: 92 },
  { id: 'b3_ar_145', title: 'كيف تبدأ الطواف حول الكعبة؟', titleAr: 'بداية الطواف',
    description: 'How to start Tawaf.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ar', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['طواف', 'كعبة'], islamic_relevance_score: 95 },

  // ── INDONESIAN 146–157 (PAC) ──
  { id: 'b3_id_146', title: 'Masjid Namirah dan Keutamaannya',
    description: 'Masjid Namirah dan keutamaannya dalam haji.', channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['masjid', 'namirah', 'haji'], islamic_relevance_score: 90 },
  { id: 'b3_id_147', title: 'Mengapa Jamaah Haji Disyariatkan Menyembelih Hady?',
    description: 'Hukum Hady dalam ibadah haji.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['hady', 'haji'], islamic_relevance_score: 90 },
  { id: 'b3_id_148', title: 'Ucapan Saat Melewati Rukun Yamani',
    description: 'Doa ketika melewati Rukun Yamani.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['tawaf', 'rukun yamani'], islamic_relevance_score: 90 },
  { id: 'b3_id_149', title: "Tips Menuju ke Al-Mas'aa - Panduan Sa'i",
    description: "Panduan Sa'i antara Safa dan Marwah.", channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ["sa'i", 'safa', 'marwah'], islamic_relevance_score: 92 },
  { id: 'b3_id_150', title: 'Panduan Haji untuk Jamaah Diabetes',
    description: 'Panduan kesehatan untuk jamaah diabetes.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['kesehatan', 'diabetes', 'haji'], islamic_relevance_score: 85 },
  { id: 'b3_id_151', title: 'Tips Kesehatan untuk Jamaah dengan Asma',
    description: 'Tips kesehatan asma selama haji.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['asma', 'kesehatan', 'haji'], islamic_relevance_score: 82 },
  { id: 'b3_id_152', title: 'Lokasi Mina dan Keutamaannya dalam Ibadah Haji',
    description: 'Mina dan keutamaannya.', channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['mina', 'haji'], islamic_relevance_score: 90 },
  { id: 'b3_id_153', title: 'Syarat dan Niat dalam Ihram',
    description: 'Syarat niat dalam ihram.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['ihram', 'niat'], islamic_relevance_score: 92 },
  { id: 'b3_id_154', title: 'Cara Mengumpulkan Batu untuk Melempar Jumrah',
    description: 'Cara mengumpulkan batu untuk jumrah.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['jumrah', 'batu'], islamic_relevance_score: 90 },
  { id: 'b3_id_155', title: 'Masjid Al-Kheif - Masjid Terbesar di Mina',
    description: 'Masjid Al-Kheif, masjid terbesar di Mina.', channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['masjid', 'mina'], islamic_relevance_score: 88 },
  { id: 'b3_id_156', title: 'Panduan Melempar Tiga Jumrah di Hari Tasyriq',
    description: 'Panduan melempar jumrah hari tasyriq.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['jumrah', 'tasyriq'], islamic_relevance_score: 90 },
  { id: 'b3_id_157', title: 'Cara Melempar Jamrah Al-Aqabah',
    description: 'Cara melempar Jamrah Al-Aqabah.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'id', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['jamrah', 'aqabah'], islamic_relevance_score: 90 },

  // ── URDU 158–169 (PAC) ──
  { id: 'b3_ur_158', title: 'خواتین کے لیے حج کے احکام',
    description: 'Hajj rulings for women in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ur', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'نساء'], islamic_relevance_score: 92 },
  { id: 'b3_ur_159', title: 'طواف کی دو رکعتیں',
    description: 'Two Rakahs of Tawaf in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['طواف', 'رکعت'], islamic_relevance_score: 90 },
  { id: 'b3_ur_160', title: 'ہوائی جہاز سے احرام کیسے باندھیں',
    description: 'Ihram from plane in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'طیارہ'], islamic_relevance_score: 90 },
  { id: 'b3_ur_161', title: 'خواتین کے لیے احرام کی ممانعتیں',
    description: 'Ihram prohibitions for women in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ur', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'خواتین'], islamic_relevance_score: 90 },
  { id: 'b3_ur_162', title: 'مردوں کے لیے احرام کی ممانعتیں',
    description: 'Ihram prohibitions for men in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'مردوں'], islamic_relevance_score: 90 },
  { id: 'b3_ur_163', title: 'احرام کا لباس کیسے پہنیں؟',
    description: 'How to wear Ihram garments in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'لباس'], islamic_relevance_score: 90 },
  { id: 'b3_ur_164', title: 'حج کی تفصیل کے بارے میں جانیں',
    description: 'Description of Hajj in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'تفصیل'], islamic_relevance_score: 95 },
  { id: 'b3_ur_165', title: 'احرام میں اضطباع کیسے کریں',
    description: 'Idtiba in Ihram in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'اضطباع'], islamic_relevance_score: 88 },
  { id: 'b3_ur_166', title: 'احرام کے میقات اور ان کے احکام',
    description: 'Miqat of Ihram in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'miqat', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['میقات', 'احرام'], islamic_relevance_score: 92 },
  { id: 'b3_ur_167', title: 'لُو سے بچاؤ کیسے کریں',
    description: 'Heatstroke prevention during Hajj in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['صحت', 'لو'], islamic_relevance_score: 80 },
  { id: 'b3_ur_168', title: 'مناسک کی ادائیگی کے دوران خارش سے کیسے بچیں',
    description: 'Skin care during rituals in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['صحت', 'مناسک'], islamic_relevance_score: 78 },
  { id: 'b3_ur_169', title: 'احرام کی سنتوں کے بارے میں جانیں',
    description: 'Sunnah of Ihram in Urdu.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'ur', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'سنتیں'], islamic_relevance_score: 90 },

  // ── PERSIAN / FARSI 170–181 (PAC) ──
  { id: 'b3_fa_170', title: 'چگونه در احرام ایدتبا را انجام دهیم',
    description: 'Idtiba in Ihram in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'اضطباع'], islamic_relevance_score: 90 },
  { id: 'b3_fa_171', title: 'چگونه لباس احرام را بپوشیم',
    description: 'How to wear Ihram in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'لباس'], islamic_relevance_score: 90 },
  { id: 'b3_fa_172', title: 'دو رکعت طواف - کجا نماز بخوانیم',
    description: 'Two Rakahs of Tawaf in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['طواف', 'نماز'], islamic_relevance_score: 90 },
  { id: 'b3_fa_173', title: 'چگونه از گرمازدگی جلوگیری کنیم',
    description: 'Heatstroke prevention in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['گرمازدگی', 'بهداشت'], islamic_relevance_score: 80 },
  { id: 'b3_fa_174', title: 'آشنایی با شرح حج',
    description: 'Description of Hajj in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'شرح'], islamic_relevance_score: 95 },
  { id: 'b3_fa_175', title: 'محرمات احرام برای زنان',
    description: 'Ihram prohibitions for women in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'fa', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'زنان'], islamic_relevance_score: 90 },
  { id: 'b3_fa_176', title: 'آشنایی با میقات های احرام و احکام آنها',
    description: 'Miqat of Ihram in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'miqat', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['میقات', 'احرام'], islamic_relevance_score: 92 },
  { id: 'b3_fa_177', title: 'قوانین حج برای زنان',
    description: 'Hajj rules for women in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fa', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'زنان'], islamic_relevance_score: 92 },
  { id: 'b3_fa_178', title: 'چگونه از هواپیما احرام ببندیم',
    description: 'Ihram from plane in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'هواپیما'], islamic_relevance_score: 88 },
  { id: 'b3_fa_179', title: 'محرمات احرام برای مردان',
    description: 'Ihram prohibitions for men in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'مردان'], islamic_relevance_score: 90 },
  { id: 'b3_fa_180', title: 'قوانین تعجیل و تأخیر در حج',
    description: 'Early/late departure rulings in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['حج', 'تعجل'], islamic_relevance_score: 88 },
  { id: 'b3_fa_181', title: 'احرام چیست؟',
    description: 'What is Ihram in Persian.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'fa', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['احرام', 'چیست'], islamic_relevance_score: 90 },

  // ── ENGLISH 182–190 (PAC) ──
  { id: 'b3_en_182', title: 'How to assume Ihram from the plane',
    description: 'Ihram from the plane guidance.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['ihram', 'plane'], islamic_relevance_score: 90 },
  { id: 'b3_en_183', title: 'How to prevent sunstrokes during Hajj',
    description: 'Sunstroke prevention for pilgrims.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_health', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'Medium',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['health', 'sunstroke', 'hajj'], islamic_relevance_score: 80 },
  { id: 'b3_en_184', title: 'Learn About the Description of Hajj',
    description: 'Comprehensive description of Hajj rituals.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['hajj', 'description'], islamic_relevance_score: 95 },
  { id: 'b3_en_185', title: 'What is Ihram',
    description: 'Explanation of Ihram.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['ihram', 'what is'], islamic_relevance_score: 90 },
  { id: 'b3_en_186', title: 'When Does the Standing at Arafah (Wuquf) Begin?',
    description: 'Wuquf at Arafah timing.', channel: 'Pilgrims Awareness Center',
    category: 'hajj_umrah', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['arafah', 'wuquf', 'hajj'], islamic_relevance_score: 92 },
  { id: 'b3_en_187', title: "How to perform Idtiba' in Ihram",
    description: "Idtiba in Ihram guide.", channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['ihram', 'idtiba'], islamic_relevance_score: 88 },
  { id: 'b3_en_188', title: 'The Miqats of Ihram: Locations, Rulings, and Guidelines',
    description: 'Complete guide to Miqat.', channel: 'Pilgrims Awareness Center',
    category: 'miqat', content_type: 'guide', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['miqat', 'ihram'], islamic_relevance_score: 92 },
  { id: 'b3_en_189', title: 'Learn About Mount Arafat (Jabal Ar-Rahmah)',
    description: 'Mount Arafat documentary.', channel: 'Pilgrims Awareness Center',
    category: 'sacred_places', content_type: 'documentary', language: 'en', audience: 'General',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['arafat', 'mount', 'hajj'], islamic_relevance_score: 92 },
  { id: 'b3_en_190', title: 'Prohibitions of Ihram for Women',
    description: 'Ihram prohibitions for women.', channel: 'Pilgrims Awareness Center',
    category: 'ihram', content_type: 'guide', language: 'en', audience: 'Women',
    review_status: 'Pending Resolution', rights_mode: 'youtube_embed',
    rights_status: 'embed_only_pending_check', embed_status: 'pending_resolution', priority: 'High',
    source_type: 'youtube', youtube_video_id: undefined, tags: ['ihram', 'women'], islamic_relevance_score: 90 },
];

// ─── MERGE ALL BATCHES ────────────────────────────────────────────────────────
export const VIDEO_CATALOG: VideoItem[] = [...BATCH_1, ...BATCH_2, ...BATCH_3];

// Resolved catalog = only videos with actual YouTube IDs (can be played now)
export const RESOLVED_CATALOG = VIDEO_CATALOG.filter(v => !!v.youtube_video_id);

// Pending resolution catalog
export const PENDING_RESOLUTION_CATALOG = VIDEO_CATALOG.filter(v => !v.youtube_video_id);

// ─── ARCHIVED YOUTUBE CATALOG (Admin Dashboard only) ─────────────────────────
// All YouTube videos are archived — admin_only, not shown publicly.
// Normal users never see these. Admin Dashboard can query this for future reference.
export const ARCHIVED_YOUTUBE_CATALOG = VIDEO_CATALOG.map(v => ({
  ...v,
  visibility: 'admin_only' as ContentVisibility,
  playback_type: 'youtube_embed' as PlaybackType,
}));

// ─── PUBLIC CATALOG (in-app playable content only) ───────────────────────────
// Public Watch section shows ONLY content with:
//   source_type NOT in ['youtube', 'vimeo']
//   playback_type = 'in_app'
//   visibility = 'public'
// Currently the YouTube batch catalog is fully archived.
// Open-license self-hosted content (openLicenseVideoService.ts) is the public library.
export function getPublicCatalog(): VideoItem[] {
  // YouTube/external source types are all admin_only
  return VIDEO_CATALOG.filter(v =>
    v.source_type !== 'youtube' &&
    v.source_type !== 'vimeo' &&
    v.visibility !== 'admin_only' &&
    v.review_status === 'Approved'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHELF DEFINITIONS — Netflix-style
// ─────────────────────────────────────────────────────────────────────────────
export type ShelfId = string;

export interface VideoShelf {
  id: ShelfId;
  labelKey: string;
  labelOverride?: Partial<Record<string, string>>;
  videos: VideoItem[];
}

// ─── QUERY HELPERS ────────────────────────────────────────────────────────────

export function getFeaturedVideos(lang?: string): VideoItem[] {
  let items = RESOLVED_CATALOG.filter(v => v.isFeatured && v.review_status !== 'Rejected');
  if (lang && lang !== 'en') {
    const mine = items.filter(v => v.language === lang);
    const rest = items.filter(v => v.language !== lang);
    items = [...mine, ...rest];
  }
  return items;
}

export function getVideosByCategory(category: VideoCategory): VideoItem[] {
  if (category === 'all') return RESOLVED_CATALOG.filter(v => v.review_status !== 'Rejected');
  return RESOLVED_CATALOG.filter(v => v.category === category && v.review_status !== 'Rejected');
}

export function getVideosByLanguage(lang: string): VideoItem[] {
  return RESOLVED_CATALOG.filter(
    v => (v.language === lang || v.language === 'multi') && v.review_status !== 'Rejected'
  );
}

export function getVideosByCategoryAndLanguage(category: VideoCategory, lang: string): VideoItem[] {
  return RESOLVED_CATALOG.filter(
    v => v.category === category && (v.language === lang || v.language === 'multi') && v.review_status !== 'Rejected'
  );
}

export function getKidsVideos(lang?: string): VideoItem[] {
  let items = RESOLVED_CATALOG.filter(v => v.audience === 'Kids' && v.review_status !== 'Rejected');
  if (lang && lang !== 'en') {
    const mine = items.filter(v => v.language === lang);
    const rest = items.filter(v => v.language !== lang);
    items = [...mine, ...rest];
  }
  return items;
}

export function getVideoById(id: string): VideoItem | undefined {
  return VIDEO_CATALOG.find(v => v.id === id);
}

export function getRelatedVideos(video: VideoItem, limit = 8): VideoItem[] {
  return RESOLVED_CATALOG.filter(
    v => v.id !== video.id &&
         (v.category === video.category || v.series === video.series) &&
         v.review_status !== 'Rejected'
  ).slice(0, limit);
}

export function getVideosBySeriesName(seriesName: string): VideoItem[] {
  return RESOLVED_CATALOG.filter(
    v => (v.series === seriesName || v.series_name === seriesName) && v.review_status !== 'Rejected'
  ).sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
}

export function getPendingResolutionVideos(): VideoItem[] {
  return PENDING_RESOLUTION_CATALOG;
}

export function getEditorialQueue(): VideoItem[] {
  return RESOLVED_CATALOG.filter(v => v.review_status === 'Pending Editorial Review');
}

// ─── LANGUAGE-AWARE SHELF BUILDER ────────────────────────────────────────────
export function getShelves(userLanguage: string): VideoShelf[] {
  const shelves: VideoShelf[] = [];

  // Featured (language-boosted)
  shelves.push({
    id: 'featured', labelKey: 'featured',
    videos: getFeaturedVideos(userLanguage).slice(0, 10),
  });

  // ── Portuguese shelves ──
  if (userLanguage === 'pt') {
    shelves.push(
      { id: 'pt_islam_basics', labelKey: 'islamParaIniciantes',
        labelOverride: { pt: 'Islam para Iniciantes', en: 'Islamic Basics (PT)', ar: 'أساسيات الإسلام' },
        videos: getVideosByLanguage('pt').filter(v => ['islam_basics', 'new_muslims'].includes(v.category)).slice(0, 10) },
      { id: 'pt_ramadan', labelKey: 'ramadanPt',
        labelOverride: { pt: 'Ramadan', en: 'Ramadan (PT)' },
        videos: getVideosByCategoryAndLanguage('ramadan', 'pt').slice(0, 10) },
      { id: 'pt_seerah', labelKey: 'prophetaPt',
        labelOverride: { pt: 'Profeta Muhammad ﷺ', en: 'Prophet (PT)' },
        videos: getVideosByCategoryAndLanguage('seerah_history', 'pt').slice(0, 10) },
      { id: 'pt_lifestyle', labelKey: 'vidaMuculmana',
        labelOverride: { pt: 'Vida Muçulmana e Halal', en: 'Muslim Life (PT)' },
        videos: getVideosByLanguage('pt').filter(v => ['islamic_lifestyle', 'conversations'].includes(v.category)).slice(0, 10) },
      { id: 'pt_finance', labelKey: 'financasIslamicas',
        labelOverride: { pt: 'Finanças Islâmicas', en: 'Islamic Finance (PT)' },
        videos: getVideosByCategoryAndLanguage('islamic_finance', 'pt').slice(0, 10) },
    );
  }

  // ── French shelves ──
  if (userLanguage === 'fr') {
    shelves.push(
      { id: 'fr_kids_prayer', labelKey: 'apprendrePriereFr',
        labelOverride: { fr: 'Apprendre la Prière', en: 'Learn to Pray (FR)' },
        videos: getVideosByLanguage('fr').filter(v => v.category === 'kids').slice(0, 10) },
      { id: 'fr_hajj', labelKey: 'guidePelerinFr',
        labelOverride: { fr: 'Guide du Pèlerin', en: 'Hajj & Umrah (FR)' },
        videos: getVideosByLanguage('fr').filter(v => ['hajj_umrah', 'ihram', 'sacred_places'].includes(v.category)).slice(0, 10) },
    );
  }

  // ── Arabic shelves ──
  if (userLanguage === 'ar') {
    shelves.push(
      { id: 'ar_quran_tafsir', labelKey: 'quranTafsirAr',
        labelOverride: { ar: 'القرآن والتفسير', en: 'Quran & Tafsir (AR)' },
        videos: getVideosByCategoryAndLanguage('quran_tafsir', 'ar').slice(0, 10) },
      { id: 'ar_seerah', labelKey: 'seerahAr',
        labelOverride: { ar: 'السيرة النبوية', en: 'Seerah (AR)' },
        videos: getVideosByCategoryAndLanguage('seerah_history', 'ar').slice(0, 10) },
      { id: 'ar_kids', labelKey: 'kidsAr',
        labelOverride: { ar: 'للأطفال', en: 'Kids (AR)' },
        videos: getVideosByLanguage('ar').filter(v => v.audience === 'Kids').slice(0, 10) },
      { id: 'ar_hajj', labelKey: 'hajjAr',
        labelOverride: { ar: 'الحج والعمرة', en: 'Hajj & Umrah (AR)' },
        videos: getVideosByLanguage('ar').filter(v => ['hajj_umrah', 'ihram', 'miqat', 'sacred_places'].includes(v.category)).slice(0, 10) },
      { id: 'ar_fiqh', labelKey: 'fiqhAr',
        labelOverride: { ar: 'رمضان والفقه', en: 'Fiqh & Ramadan (AR)' },
        videos: getVideosByLanguage('ar').filter(v => ['fiqh', 'ramadan'].includes(v.category)).slice(0, 10) },
    );
  }

  // ── Indonesian shelves ──
  if (userLanguage === 'id') {
    shelves.push(
      { id: 'id_hajj', labelKey: 'hajiUmrahId',
        labelOverride: { id: 'Haji & Umrah', en: 'Hajj & Umrah (ID)' },
        videos: getVideosByLanguage('id').filter(v => ['hajj_umrah', 'ihram', 'sacred_places'].includes(v.category)).slice(0, 10) },
    );
  }

  // ── Urdu shelves ──
  if (userLanguage === 'ur') {
    shelves.push(
      { id: 'ur_hajj', labelKey: 'hajjUr',
        labelOverride: { ur: 'حج و عمرہ', en: 'Hajj & Umrah (UR)' },
        videos: getVideosByLanguage('ur').filter(v => ['hajj_umrah', 'ihram', 'miqat'].includes(v.category)).slice(0, 10) },
    );
  }

  // ── Persian shelves ──
  if (userLanguage === 'fa') {
    shelves.push(
      { id: 'fa_hajj', labelKey: 'hajjFa',
        labelOverride: { fa: 'حج و عمره', en: 'Hajj & Umrah (FA)' },
        videos: getVideosByLanguage('fa').filter(v => ['hajj_umrah', 'ihram', 'miqat'].includes(v.category)).slice(0, 10) },
    );
  }

  // ── Universal shelves ──
  shelves.push(
    { id: 'quran_tafsir', labelKey: 'quranTafsir',
      videos: getVideosByCategoryAndLanguage('quran_tafsir', 'en').slice(0, 10) },
    { id: 'seerah_history', labelKey: 'seerahHistory',
      videos: getVideosByCategoryAndLanguage('seerah_history', 'en').slice(0, 10) },
    { id: 'prophet_stories', labelKey: 'prophetStories',
      videos: getVideosByCategory('prophet_stories').slice(0, 10) },
    { id: 'hajj_umrah', labelKey: 'hajjVideos',
      videos: getVideosByCategory('hajj_umrah').slice(0, 10) },
    { id: 'kids', labelKey: 'forKids',
      videos: getKidsVideos(userLanguage).slice(0, 10) },
    { id: 'in_your_language', labelKey: 'inYourLanguage',
      labelOverride: {
        ar: 'محتوى بلغتك',
        en: 'In Your Language',
        pt: 'No Seu Idioma',
        fr: 'Contenu dans votre langue',
        es: 'En Tu Idioma',
        tr: 'Dilinizde',
        id: 'Dalam Bahasa Anda',
        ur: 'آپ کی زبان میں',
        bn: 'আপনার ভাষায়',
        ms: 'Dalam Bahasa Anda',
        fa: 'به زبان شما',
      },
      videos: getVideosByLanguage(userLanguage).slice(0, 12) },
  );

  return shelves.filter(s => s.videos.length > 0);
}

// ─── DISPLAY HELPERS ─────────────────────────────────────────────────────────

export function getYouTubeThumbnail(youtubeId: string, quality: 'hq' | 'mq' | 'sd' = 'hq'): string {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}default.jpg`;
}

export function getVideoThumbnail(video: VideoItem): string {
  if (video.thumbnail_url) return video.thumbnail_url;
  if (video.youtube_video_id) return getYouTubeThumbnail(video.youtube_video_id, 'hq');
  return 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600';
}

export function getVideoTitle(video: VideoItem, language: string): string {
  if (language === 'ar' && video.titleAr) return video.titleAr;
  if (language === 'pt' && video.titlePt) return video.titlePt;
  if (language === 'fr' && video.titleFr) return video.titleFr;
  if (language === 'id' && video.titleId) return video.titleId;
  if (language === 'ur' && video.titleUr) return video.titleUr;
  return video.title;
}

export function getVideoDescription(video: VideoItem, language: string): string {
  if (language === 'ar' && video.descriptionAr) return video.descriptionAr;
  if (language === 'pt' && video.descriptionPt) return video.descriptionPt;
  if (language === 'fr' && video.descriptionFr) return video.descriptionFr;
  return video.description;
}

export function getShelfLabel(shelf: VideoShelf, language: string): string {
  return shelf.labelOverride?.[language] || shelf.labelKey;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── CATALOG STATS ────────────────────────────────────────────────────────────
export function getCatalogStats() {
  return {
    total: VIDEO_CATALOG.length,
    resolved: RESOLVED_CATALOG.length,
    pendingResolution: PENDING_RESOLUTION_CATALOG.length,
    pendingEditorial: RESOLVED_CATALOG.filter(v => v.review_status === 'Pending Editorial Review').length,
    byLanguage: {
      ar: VIDEO_CATALOG.filter(v => v.language === 'ar').length,
      en: VIDEO_CATALOG.filter(v => v.language === 'en').length,
      pt: VIDEO_CATALOG.filter(v => v.language === 'pt').length,
      fr: VIDEO_CATALOG.filter(v => v.language === 'fr').length,
      id: VIDEO_CATALOG.filter(v => v.language === 'id').length,
      ur: VIDEO_CATALOG.filter(v => v.language === 'ur').length,
      fa: VIDEO_CATALOG.filter(v => v.language === 'fa').length,
    },
    trustedChannels: TRUSTED_CHANNELS.length,
    arabicCatalogTarget: TRUSTED_CHANNELS
      .filter(c => c.language === 'ar')
      .reduce((sum, c) => sum + c.target_count, 0),
  };
}

// ─── CATEGORY CONFIG ─────────────────────────────────────────────────────────
export const VIDEO_CATEGORIES: { key: VideoCategory; iconName: string; labelKey: string }[] = [
  { key: 'all', iconName: 'grid-view', labelKey: 'allCategories' },
  { key: 'quran_tafsir', iconName: 'menu-book', labelKey: 'quranTafsir' },
  { key: 'seerah_history', iconName: 'history-edu', labelKey: 'seerahHistory' },
  { key: 'prophet_stories', iconName: 'star', labelKey: 'prophetStories' },
  { key: 'hajj_umrah', iconName: 'flight', labelKey: 'hajjVideos' },
  { key: 'islam_basics', iconName: 'auto-stories', labelKey: 'islamBasics' },
  { key: 'kids', iconName: 'child-care', labelKey: 'forKids' },
  { key: 'ramadan', iconName: 'nightlight', labelKey: 'ramadan' },
  { key: 'sacred_places', iconName: 'place', labelKey: 'sacredPlaces' },
  { key: 'documentaries', iconName: 'movie', labelKey: 'documentaries' },
  { key: 'lectures', iconName: 'record-voice-over', labelKey: 'lectures' },
];

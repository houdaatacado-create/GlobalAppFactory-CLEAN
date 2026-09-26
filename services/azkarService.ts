// Powered by OnSpace.AI
// Azkar Service - Islamic supplications data

export type AzkarCategory =
  | 'morning' | 'evening' | 'sleep' | 'afterPrayer'
  | 'travel' | 'mosque' | 'food' | 'rain' | 'hardship';

export interface Dhikr {
  id: number;
  arabicText: string;
  transliterations: Record<string, string>;
  translations: Record<string, string>;
  repeatCount: number;
  source: string;
  benefits?: Record<string, string>;
}

export interface AzkarGroup {
  category: AzkarCategory;
  dhikrList: Dhikr[];
}

export const AZKAR_DATA: AzkarGroup[] = [
  {
    category: 'morning',
    dhikrList: [
      {
        id: 1,
        arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        transliterations: {
          en: "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku walahul hamdu wahuwa ala kulli shay'in qadeer",
          fr: "Asbahna wa asbahal mulku lillah...",
          es: "Asbahna wa asbahal mulku lillah...",
        },
        translations: {
          ar: 'أصبحنا وأصبح الملك لله...',
          en: 'We have entered the morning, and the whole kingdom of Allah has entered the morning. Praise be to Allah, there is none worthy of worship except Allah alone without any partners.',
          pt: 'Chegamos à manhã, e todo o reino de Allah chegou à manhã. Louvado seja Allah, não há deus além de Allah sozinho sem parceiros.',
          fr: "Nous voici au matin, et tout le royaume d'Allah est au matin. Louange à Allah, il n'y a de dieu que Allah seul sans associés.",
          es: 'Hemos llegado a la mañana y todo el reino de Allah ha llegado a la mañana. Alabado sea Allah, no hay dios excepto Allah solo sin socios.',
          tr: 'Sabaha ulaştık, Allah\'ın mülkü de sabaha ulaştı. Allah\'a hamd olsun, Allah\'tan başka ibadete layık hiçbir ilah yoktur.',
          id: 'Kami memasuki pagi hari dan seluruh kerajaan Allah memasuki pagi hari. Segala puji bagi Allah, tidak ada Tuhan selain Allah.',
          ur: 'ہم نے صبح کی اور اللہ کی بادشاہی نے بھی صبح کی۔ تمام تعریفیں اللہ کے لیے ہیں۔',
          bn: 'আমরা সকালে উঠলাম এবং আল্লাহর রাজ্যও সকালে উঠল। সকল প্রশংসা আল্লাহর।',
          ms: 'Kami memasuki waktu pagi dan kerajaan Allah juga memasuki waktu pagi. Segala puji bagi Allah.',
        },
        repeatCount: 1,
        source: 'رواه مسلم',
      },
      {
        id: 2,
        arabicText: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
        transliterations: {
          en: "Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namootu wa ilaykan nushoor",
        },
        translations: {
          ar: 'اللهم بك أصبحنا...',
          en: 'O Allah, by You we have entered the morning, by You we have entered the evening, by You we live, by You we die, and to You is the resurrection.',
          pt: 'Ó Allah, por Ti chegamos à manhã, por Ti chegamos à noite, por Ti vivemos, por Ti morremos, e a Ti é a ressurreição.',
          fr: "Ô Allah, par Toi nous avons atteint le matin, par Toi nous avons atteint le soir...",
          es: 'Oh Allah, por Ti hemos llegado a la mañana, por Ti hemos llegado a la noche...',
          tr: "Allah'ım! Seninle sabahladık, seninle akşamladık, seninle yaşar, seninle ölürüz.",
          id: 'Ya Allah, dengan-Mu kami memasuki pagi, dengan-Mu kami memasuki petang...',
          ur: 'اے اللہ! تیری ہی توفیق سے ہم نے صبح کی اور تیری ہی توفیق سے شام کی...',
          bn: 'হে আল্লাহ! তোমার মাধ্যমে আমরা সকালে প্রবেশ করলাম...',
          ms: 'Ya Allah, dengan-Mu kami memasuki pagi...',
        },
        repeatCount: 1,
        source: 'رواه الترمذي',
      },
      {
        id: 3,
        arabicText: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
        transliterations: {
          en: 'Subhanallahi wa bihamdih',
          fr: 'Subhanallahi wa bihamdih',
        },
        translations: {
          ar: 'سبحان الله وبحمده',
          en: 'Glory be to Allah and praise Him',
          pt: 'Glória a Allah e louvor a Ele',
          fr: "Gloire à Allah et louange à Lui",
          es: 'Gloria a Allah y alabanza a Él',
          tr: "Allah'ı tesbih ederim ve O'na hamdederim",
          id: 'Maha Suci Allah dan segala puji bagi-Nya',
          ur: 'اللہ پاک ہے اور اس کی تعریف ہے',
          bn: 'আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর',
          ms: 'Maha Suci Allah dan segala puji bagi-Nya',
        },
        repeatCount: 100,
        source: 'رواه البخاري ومسلم',
      },
    ],
  },
  {
    category: 'evening',
    dhikrList: [
      {
        id: 4,
        arabicText: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
        transliterations: { en: "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah" },
        translations: {
          ar: 'أمسينا وأمسى الملك لله...',
          en: 'We have entered the evening and at this very time unto Allah belongs all dominion, and all praise is for Allah.',
          pt: 'Chegamos à tarde e neste momento todo o domínio pertence a Allah...',
          fr: "Nous voici au soir et le royaume d'Allah aussi...",
          es: 'Hemos llegado a la tarde y en este momento todo el dominio pertenece a Allah...',
          tr: "Akşamladık ve Allah'ın mülkü de akşamladı...",
          id: 'Kami memasuki sore hari dan kerajaan Allah juga memasuki sore hari...',
          ur: 'ہم نے شام کی اور اللہ کی بادشاہی نے بھی شام کی...',
          bn: 'আমরা সন্ধ্যায় প্রবেশ করলাম এবং আল্লাহর রাজ্যও সন্ধ্যায় প্রবেশ করল...',
          ms: 'Kami memasuki petang dan kerajaan Allah juga memasuki petang...',
        },
        repeatCount: 1,
        source: 'رواه مسلم',
      },
    ],
  },
  {
    category: 'afterPrayer',
    dhikrList: [
      {
        id: 5,
        arabicText: 'سُبْحَانَ اللَّهِ',
        transliterations: { en: 'Subhanallah' },
        translations: {
          ar: 'سبحان الله',
          en: 'Glory be to Allah',
          pt: 'Glória a Allah',
          fr: "Gloire à Allah",
          es: 'Gloria a Allah',
          tr: "Allah'ı tesbih ederim",
          id: 'Maha Suci Allah',
          ur: 'اللہ پاک ہے',
          bn: 'আল্লাহ পবিত্র',
          ms: 'Maha Suci Allah',
        },
        repeatCount: 33,
        source: 'رواه مسلم',
      },
      {
        id: 6,
        arabicText: 'الْحَمْدُ لِلَّهِ',
        transliterations: { en: 'Alhamdulillah' },
        translations: {
          ar: 'الحمد لله',
          en: 'All praise is for Allah',
          pt: 'Todo louvor é para Allah',
          fr: "Toute louange est pour Allah",
          es: 'Toda alabanza es para Allah',
          tr: "Tüm hamdler Allah'a aittir",
          id: 'Segala puji bagi Allah',
          ur: 'تمام تعریفیں اللہ کے لیے ہیں',
          bn: 'সকল প্রশংসা আল্লাহর',
          ms: 'Segala puji bagi Allah',
        },
        repeatCount: 33,
        source: 'رواه مسلم',
      },
      {
        id: 7,
        arabicText: 'اللَّهُ أَكْبَرُ',
        transliterations: { en: 'Allahu Akbar' },
        translations: {
          ar: 'الله أكبر',
          en: 'Allah is the Greatest',
          pt: 'Allah é o Maior',
          fr: "Allah est le Plus Grand",
          es: 'Allah es el Más Grande',
          tr: "Allah en büyüktür",
          id: 'Allah Maha Besar',
          ur: 'اللہ سب سے بڑا ہے',
          bn: 'আল্লাহ সর্বশ্রেষ্ঠ',
          ms: 'Allah Maha Besar',
        },
        repeatCount: 34,
        source: 'رواه مسلم',
      },
    ],
  },
];

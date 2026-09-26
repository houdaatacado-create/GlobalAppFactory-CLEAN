// Powered by OnSpace.AI
// Learn Islam — Static lesson data for all categories.
// Each lesson has a stable numeric id, a categoryId (slug), and full Arabic / English content.

export interface LessonCategory {
  id: string;         // slug used in navigation
  icon: string;       // MaterialIcons name
  color: string;
  ar: string;
  en: string;
  lessonsCount: number;
}

export interface Lesson {
  id: string;         // globally unique, e.g. "prayer-1"
  categoryId: string;
  lessonNumber: number;
  ar: {
    title: string;
    shortDesc: string;
    body: string;
  };
  en: {
    title: string;
    shortDesc: string;
    body: string;
  };
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export const LEARN_CATEGORIES: LessonCategory[] = [
  { id: 'newMuslim',  icon: 'person-add',          color: '#2D8A5E', ar: 'أنا مسلم جديد',      en: 'New Muslim',           lessonsCount: 6 },
  { id: 'wudu',       icon: 'water-drop',           color: '#1B6B47', ar: 'تعلم الوضوء',         en: 'Learn Wudu',           lessonsCount: 5 },
  { id: 'prayer',     icon: 'mosque',               color: '#C9A84C', ar: 'تعلم الصلاة',         en: 'Learn Prayer',         lessonsCount: 10 },
  { id: 'basics',     icon: 'star',                 color: '#9A7A30', ar: 'أساسيات الإسلام',     en: 'Islam Basics',         lessonsCount: 8 },
  { id: 'fasting',    icon: 'wb-twilight',          color: '#0F8A6A', ar: 'الصيام',              en: 'Fasting',              lessonsCount: 6 },
  { id: 'zakat',      icon: 'volunteer-activism',   color: '#2D8A5E', ar: 'الزكاة',              en: 'Zakat',                lessonsCount: 4 },
  { id: 'akhlaq',     icon: 'favorite',             color: '#C9A84C', ar: 'الأخلاق',             en: 'Ethics',               lessonsCount: 6 },
  { id: 'seerah',     icon: 'history',              color: '#1B6B47', ar: 'السيرة النبوية',      en: 'Seerah',               lessonsCount: 8 },
  { id: 'prophets',   icon: 'people',               color: '#9A3A20', ar: 'قصص الأنبياء',        en: "Prophets Stories",     lessonsCount: 8 },
];

// ─── LESSONS ──────────────────────────────────────────────────────────────────

export const ALL_LESSONS: Lesson[] = [

  // ── NEW MUSLIM ─────────────────────────────────────────────────────────────
  {
    id: 'newMuslim-1', categoryId: 'newMuslim', lessonNumber: 1,
    ar: {
      title: 'مرحباً بك في الإسلام',
      shortDesc: 'أول خطواتك في رحلة الإيمان',
      body: `الحمد لله الذي هداك إلى الإسلام.\n\nالإسلام هو الاستسلام لله وحده، وهو الدين الذي ارتضاه الله لعباده. قال تعالى: "إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ" (آل عمران: ٧).\n\n**أركان الإسلام الخمسة:**\n١. شهادة أن لا إله إلا الله وأن محمداً رسول الله\n٢. إقام الصلاة\n٣. إيتاء الزكاة\n٤. صوم رمضان\n٥. حج البيت لمن استطاع إليه سبيلاً\n\n**الخطوة الأولى:** النطق بالشهادتين بصدق وإخلاص: "أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله."\n\nمرحباً بك في أسرة المسلمين في كل أنحاء العالم.`,
    },
    en: {
      title: 'Welcome to Islam',
      shortDesc: 'Your first steps in the journey of faith',
      body: `Praise be to Allah who guided you to Islam.\n\nIslam means submission to Allah alone. Allah says: "Indeed, the religion in the sight of Allah is Islam" (Quran 3:19).\n\n**The Five Pillars of Islam:**\n1. Declaration of faith (Shahada)\n2. Prayer (Salah)\n3. Charity (Zakat)\n4. Fasting in Ramadan (Sawm)\n5. Pilgrimage to Mecca (Hajj)\n\n**First step:** Sincerely say the Shahada: "I bear witness that there is no god but Allah, and Muhammad is His messenger."\n\nWelcome to the Muslim family worldwide.`,
    },
  },
  {
    id: 'newMuslim-2', categoryId: 'newMuslim', lessonNumber: 2,
    ar: {
      title: 'أركان الإيمان الستة',
      shortDesc: 'ما يجب الإيمان به في الإسلام',
      body: `أركان الإيمان الستة هي ما يجب على كل مسلم أن يؤمن به:\n\n**١. الإيمان بالله**\nالإيمان بوجود الله ووحدانيته وصفاته العلا.\n\n**٢. الإيمان بالملائكة**\nالملائكة مخلوقات من نور تطيع الله دائماً.\n\n**٣. الإيمان بالكتب السماوية**\nالتوراة والإنجيل والزبور والقرآن الكريم.\n\n**٤. الإيمان بالرسل والأنبياء**\nمن آدم إلى محمد ﷺ خاتم الأنبياء.\n\n**٥. الإيمان باليوم الآخر**\nيوم القيامة والحساب والجنة والنار.\n\n**٦. الإيمان بالقدر خيره وشره**\nكل ما يجري في الكون بعلم الله وإرادته.`,
    },
    en: {
      title: 'The Six Pillars of Faith',
      shortDesc: 'What every Muslim must believe',
      body: `The six pillars of faith (Iman) are what every Muslim must believe in:\n\n**1. Belief in Allah**\nBelieving in His existence, oneness, and perfect attributes.\n\n**2. Belief in Angels**\nAngels are created from light and always obey Allah.\n\n**3. Belief in Divine Books**\nThe Torah, Gospel, Psalms, and the Quran.\n\n**4. Belief in Prophets and Messengers**\nFrom Adam to Muhammad ﷺ, the last prophet.\n\n**5. Belief in the Last Day**\nThe Day of Judgment, Paradise, and Hellfire.\n\n**6. Belief in Divine Decree**\nEverything happens by Allah's knowledge and will.`,
    },
  },
  {
    id: 'newMuslim-3', categoryId: 'newMuslim', lessonNumber: 3,
    ar: {
      title: 'الطهارة والنظافة في الإسلام',
      shortDesc: 'أهمية الطهارة وأنواعها',
      body: `الطهارة شرط أساسي للعبادة في الإسلام. قال النبي ﷺ: "الطهور شطر الإيمان."\n\n**أنواع الطهارة:**\n\n**١. الطهارة من الحدث الأصغر:** بالوضوء قبل الصلاة.\n\n**٢. الطهارة من الحدث الأكبر:** بالغسل عند الجنابة.\n\n**٣. إزالة النجاسة:** تنظيف الثوب والبدن والمكان من الأوساخ.\n\n**٤. التيمم:** عند عدم وجود الماء، بضرب الأرض بالكفين ومسح الوجه واليدين.\n\nالنظافة عبادة، ومن سنن الإسلام: قص الأظافر وإزالة الشعر الزائد وتنظيف الأسنان بالسواك.`,
    },
    en: {
      title: 'Purity and Cleanliness in Islam',
      shortDesc: 'The importance and types of purity',
      body: `Purity is essential for worship in Islam. The Prophet ﷺ said: "Cleanliness is half of faith."\n\n**Types of Purity:**\n\n**1. Minor ritual purity:** Performed through Wudu (ablution) before prayer.\n\n**2. Major ritual purity:** Performed through Ghusl (full bath) after major impurity.\n\n**3. Removing impurities:** Cleaning clothes, body, and prayer space.\n\n**4. Tayammum:** Dry ablution using clean earth when water is unavailable.\n\nCleanliness is an act of worship. Islamic hygienic practices include trimming nails, removing excess hair, and using the miswak (tooth stick).`,
    },
  },
  {
    id: 'newMuslim-4', categoryId: 'newMuslim', lessonNumber: 4,
    ar: {
      title: 'الأذكار اليومية',
      shortDesc: 'أذكار الصباح والمساء والنوم',
      body: `الذكر هو تذكر الله بالقلب واللسان. قال تعالى: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" (الرعد: ٢٨).\n\n**أذكار الصباح:**\n• "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ..."\n• "اللَّهُمَّ بِكَ أَصْبَحْنَا..."\n• الاستغفار ١٠٠ مرة\n• سبحان الله ٣٣ × الحمد لله ٣٣ × الله أكبر ٣٤\n\n**ذكر قبل النوم:**\n• آية الكرسي\n• قراءة سورة الإخلاص والمعوذتين ٣ مرات\n• "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا"\n\n**أذكار متفرقة:**\n• عند الأكل: "بِسْمِ اللَّهِ"\n• عند الدخول: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ..."`,
    },
    en: {
      title: 'Daily Remembrance (Dhikr)',
      shortDesc: 'Morning, evening, and bedtime supplications',
      body: `Dhikr means remembering Allah in the heart and on the tongue. Allah says: "Verily, in the remembrance of Allah do hearts find rest." (Quran 13:28)\n\n**Morning Adhkar:**\n• "We have reached the morning and at this very time unto Allah belongs all sovereignty..."\n• Seeking forgiveness (Istighfar) 100 times\n• SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x\n\n**Before sleeping:**\n• Recite Ayatul Kursi\n• Al-Ikhlas, Al-Falaq, An-Nas (×3 each)\n• "O Allah, in Your name I die and I live"\n\n**General remembrances:**\n• Before eating: "Bismillah"\n• Entering the home: supplicate for good`,
    },
  },
  {
    id: 'newMuslim-5', categoryId: 'newMuslim', lessonNumber: 5,
    ar: {
      title: 'التعامل مع غير المسلمين',
      shortDesc: 'قيم الإسلام في التعايش والبر',
      body: `الإسلام دين السلام والتعايش مع جميع البشر.\n\n**مبادئ التعامل:**\n\n• **البر والعدل:** يأمر الإسلام بحسن التعامل مع غير المسلمين في السلم، قال تعالى: "لَّا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ فِي الدِّينِ وَلَمْ يُخْرِجُوكُم مِّن دِيَارِكُمْ أَن تَبَرُّوهُمْ وَتُقْسِطُوا إِلَيْهِمْ" (الممتحنة: ٨).\n\n• **حق الجار:** لجيرانك حق عليك سواء كانوا مسلمين أم لا.\n\n• **الوفاء بالعهد:** يجب الوفاء بكل عهد ووعد مع غير المسلمين.\n\n• **الدعوة بالحكمة:** ادع إلى الإسلام بالحكمة والموعظة الحسنة دون إكراه.`,
    },
    en: {
      title: 'Dealing with Non-Muslims',
      shortDesc: "Islam's values of coexistence and kindness",
      body: `Islam is a religion of peace and coexistence with all people.\n\n**Principles of interaction:**\n\n• **Kindness and Justice:** Islam commands good treatment of non-Muslims in times of peace. Allah says: "Allah does not forbid you from those who do not fight you because of religion or expel you from your homes — from being righteous toward them and acting justly." (Quran 60:8)\n\n• **Neighbors' rights:** Your neighbors have rights over you regardless of their religion.\n\n• **Keeping promises:** Agreements and promises with non-Muslims must be honored.\n\n• **Wisdom in inviting to Islam:** Invite with wisdom and beautiful preaching, never through compulsion.`,
    },
  },
  {
    id: 'newMuslim-6', categoryId: 'newMuslim', lessonNumber: 6,
    ar: {
      title: 'التوبة والاستغفار',
      shortDesc: 'كيف تتوب إلى الله وتبدأ من جديد',
      body: `التوبة هي الرجوع إلى الله بعد الذنب. قال تعالى: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ" (البقرة: ٢٢٢).\n\n**شروط التوبة الصحيحة:**\n١. الإقلاع عن الذنب فوراً\n٢. الندم على ما فعل\n٣. العزم على عدم العودة\n٤. رد الحقوق إلى أصحابها (إن كان الذنب متعلقاً بحق الغير)\n\n**فضل التوبة:**\n• قال النبي ﷺ: "الإسلام يجب ما قبله" (أي يمحو كل ذنب سبقه)\n• التائب من الذنب كمن لا ذنب له\n• باب التوبة مفتوح دائماً ما دامت الروح في الجسد\n\n**دعاء التوبة:**\n"اللهم أنت ربي، لا إله إلا أنت، خلقتني وأنا عبدك..."`,
    },
    en: {
      title: 'Repentance and Seeking Forgiveness',
      shortDesc: 'How to repent to Allah and start anew',
      body: `Repentance (Tawbah) means returning to Allah after a sin. Allah says: "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves." (Quran 2:222)\n\n**Conditions of a valid repentance:**\n1. Immediately stop the sinful act\n2. Feel genuine remorse\n3. Firmly resolve not to return to it\n4. Restore others' rights (if the sin involved someone else)\n\n**The virtue of repentance:**\n• The Prophet ﷺ said: "Islam wipes out whatever came before it"\n• One who repents sincerely is as if they had no sin\n• The door of repentance is always open while the soul remains in the body\n\n**A repentance supplication:**\n"O Allah, You are my Lord, there is no god but You. You created me and I am Your servant..."`,
    },
  },

  // ── WUDU ───────────────────────────────────────────────────────────────────
  {
    id: 'wudu-1', categoryId: 'wudu', lessonNumber: 1,
    ar: {
      title: 'ما هو الوضوء؟',
      shortDesc: 'تعريف الوضوء وفضله',
      body: `الوضوء هو غسل أعضاء معينة من الجسم بالماء بنية التطهر للصلاة.\n\nقال النبي ﷺ: "لا تُقبل صلاةٌ بغير طهور"\n\n**فضل الوضوء:**\n• يغسل الذنوب والخطايا\n• نور للمؤمن يوم القيامة\n• سبب لدخول الجنة\n\nقال النبي ﷺ: "مَن تَوضَّأ فَأحسَنَ الوُضوءَ خَرَجَت خَطاياهُ مِن جَسَدِه حتَّى تَخرُجَ مِن تَحتِ أَظفارِه"`,
    },
    en: {
      title: 'What is Wudu?',
      shortDesc: 'Definition and virtues of ablution',
      body: `Wudu (ablution) is washing specific body parts with water with the intention of purification for prayer.\n\nThe Prophet ﷺ said: "No prayer is accepted without purification."\n\n**Virtues of Wudu:**\n• Washes away sins\n• A light for the believer on the Day of Judgment\n• A means to enter Paradise\n\nThe Prophet ﷺ said: "Whoever performs Wudu well, his sins leave his body, even from under his fingernails."`,
    },
  },
  {
    id: 'wudu-2', categoryId: 'wudu', lessonNumber: 2,
    ar: {
      title: 'فرائض الوضوء',
      shortDesc: 'الأعضاء الواجب غسلها',
      body: `فرائض الوضوء هي الأعضاء التي يجب غسلها:\n\n**١. النية** — في القلب قبل البدء\n\n**٢. غسل الوجه** — من منابت الشعر إلى أسفل الذقن، وما بين الأذنين\n\n**٣. غسل اليدين مع المرفقين** — اليد اليمنى ثم اليسرى\n\n**٤. مسح الرأس** — مسح جميع الرأس مرة واحدة\n\n**٥. غسل الرجلين مع الكعبين** — اليمنى ثم اليسرى\n\n**٦. الترتيب** — حسب الترتيب المذكور\n\n**٧. الموالاة** — المتابعة بدون تأخير طويل بين الأعضاء`,
    },
    en: {
      title: 'Obligatory Acts of Wudu',
      shortDesc: 'The required body parts to wash',
      body: `The obligatory acts of Wudu are the body parts that must be washed:\n\n**1. Intention (Niyyah)** — in the heart before beginning\n\n**2. Washing the face** — from the hairline to the chin, between the ears\n\n**3. Washing both arms to the elbows** — right arm first, then left\n\n**4. Wiping the head** — wipe the entire head once\n\n**5. Washing both feet to the ankles** — right first, then left\n\n**6. Order** — following this specific sequence\n\n**7. Continuity** — performing all acts without long gaps between them`,
    },
  },
  {
    id: 'wudu-3', categoryId: 'wudu', lessonNumber: 3,
    ar: {
      title: 'سنن الوضوء',
      shortDesc: 'الأعمال المستحبة في الوضوء',
      body: `سنن الوضوء هي أعمال يستحب فعلها لكمال الوضوء:\n\n• التسمية (قول "بسم الله") عند البدء\n• غسل الكفين ثلاثاً في البداية\n• المضمضة (إدارة الماء في الفم)\n• الاستنشاق (إدخال الماء في الأنف)\n• تخليل اللحية للرجل\n• تخليل الأصابع\n• البدء باليمين قبل اليسار\n• غسل كل عضو ثلاث مرات\n• قراءة الدعاء بعد الوضوء:\n"أَشهدُ أَن لا إِلهَ إِلَّا اللهُ وحدَه لا شريكَ لَه، وأَشهدُ أَنَّ مُحمَّداً عبدُهُ ورسولُه"`,
    },
    en: {
      title: 'Recommended Acts of Wudu',
      shortDesc: 'Sunnah actions for a complete Wudu',
      body: `Sunnah acts of Wudu are recommended practices that complete and perfect the ablution:\n\n• Saying "Bismillah" at the beginning\n• Washing both hands three times at the start\n• Rinsing the mouth (Madmadah)\n• Rinsing the nose (Istinshaq)\n• Combing the beard (for men)\n• Interlacing the fingers\n• Starting with the right side before the left\n• Washing each part three times\n• Reciting the supplication after Wudu:\n"I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and messenger."`,
    },
  },
  {
    id: 'wudu-4', categoryId: 'wudu', lessonNumber: 4,
    ar: {
      title: 'نواقض الوضوء',
      shortDesc: 'ما يبطل الوضوء',
      body: `نواقض الوضوء هي الأشياء التي تبطل الوضوء وتوجب تجديده:\n\n**١. الخروج من السبيلين**\nالبول والغائط والريح\n\n**٢. النوم العميق**\nالنوم المستغرق الذي يزول معه الوعي\n\n**٣. فقدان العقل**\nالجنون أو الإغماء أو السكر\n\n**٤. لمس الفرج باليد**\n(في مذهب بعض العلماء)\n\n**٥. أكل لحم الإبل**\n(رواه مسلم عن النبي ﷺ)\n\n**تنبيه:** لمس المرأة بشهوة ينقض الوضوء عند بعض العلماء.\n\nإذا شككت هل انتقض وضوؤك أم لا، فالأصل البقاء على الطهارة حتى تتيقن.`,
    },
    en: {
      title: 'What Nullifies Wudu',
      shortDesc: 'Things that invalidate your ablution',
      body: `These acts nullify your Wudu and require you to renew it:\n\n**1. Anything exiting from private parts**\nUrine, stool, or passing gas\n\n**2. Deep sleep**\nSleep that removes consciousness\n\n**3. Loss of consciousness**\nMadness, fainting, or intoxication\n\n**4. Touching private parts with the hand**\n(according to some scholars)\n\n**5. Eating camel meat**\n(narrated by Muslim from the Prophet ﷺ)\n\n**Note:** Touching a member of the opposite gender with desire nullifies Wudu according to some scholars.\n\nIf you are unsure whether your Wudu was broken, assume it is still valid until you are certain.`,
    },
  },
  {
    id: 'wudu-5', categoryId: 'wudu', lessonNumber: 5,
    ar: {
      title: 'التيمم — طهارة بدون ماء',
      shortDesc: 'كيف تتطهر عند عدم وجود الماء',
      body: `التيمم هو التطهر بالتراب الطاهر عند تعذر استخدام الماء. قال تعالى: "وَإِن كُنتُم مَّرْضَىٰ أَوْ عَلَىٰ سَفَرٍ... فَتَيَمَّمُوا صَعِيدًا طَيِّبًا" (النساء: ٤٣).\n\n**أسباب التيمم:**\n• عدم وجود الماء\n• المرض الذي يمنع استخدام الماء\n• الخوف من الضرر باستخدام الماء البارد\n\n**كيفية التيمم:**\n١. النية في القلب\n٢. ضرب الكفين على الأرض (أو التراب)\n٣. مسح الوجه بالكفين\n٤. مسح اليدين إلى الرسغين\n\n**يكفي ضربة واحدة للوجه واليدين معاً**\n\nيبطل التيمم عند وجود الماء أو زوال العذر.`,
    },
    en: {
      title: 'Tayammum — Purification Without Water',
      shortDesc: 'How to purify when water is unavailable',
      body: `Tayammum is purification using clean earth when water is unavailable. Allah says: "And if you are ill or on a journey... then perform tayammum with clean earth." (Quran 4:43)\n\n**Reasons for Tayammum:**\n• Water is not available\n• Illness that prevents using water\n• Fear of harm from cold water\n\n**How to perform Tayammum:**\n1. Make the intention in the heart\n2. Strike both palms on the ground (or earth)\n3. Wipe the face with both palms\n4. Wipe the hands up to the wrists\n\n**One strike is sufficient for both the face and hands**\n\nTayammum is invalidated when water becomes available or the excuse disappears.`,
    },
  },

  // ── PRAYER ─────────────────────────────────────────────────────────────────
  {
    id: 'prayer-1', categoryId: 'prayer', lessonNumber: 1,
    ar: {
      title: 'فرضية الصلاة وأوقاتها',
      shortDesc: 'الصلوات الخمس وأوقاتها',
      body: `الصلاة عماد الدين، وهي الركن الثاني من أركان الإسلام. قال تعالى: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا" (النساء: ١٠٣).\n\n**الصلوات الخمس وأوقاتها:**\n\n| الصلاة | الوقت | عدد الركعات |\n|--------|-------|-------------|\n| الفجر | من الفجر الصادق حتى الشروق | ٢ |\n| الظهر | من زوال الشمس حتى العصر | ٤ |\n| العصر | من بعد الظهر حتى الغروب | ٤ |\n| المغرب | بعد الغروب مباشرة | ٣ |\n| العشاء | من الغروب حتى منتصف الليل | ٤ |\n\n**حكم تارك الصلاة:** كبيرة من الكبائر، ويجب القضاء.`,
    },
    en: {
      title: 'Obligatory Prayer and Its Times',
      shortDesc: 'The five daily prayers and their times',
      body: `Prayer is the pillar of religion and the second pillar of Islam. Allah says: "Indeed, prayer has been decreed upon the believers a decree of specified times." (Quran 4:103)\n\n**The Five Daily Prayers:**\n\n| Prayer | Time | Rak'ahs |\n|--------|------|----------|\n| Fajr | From true dawn until sunrise | 2 |\n| Dhuhr | After midday until Asr | 4 |\n| Asr | After Dhuhr until sunset | 4 |\n| Maghrib | Immediately after sunset | 3 |\n| Isha | From sunset until midnight | 4 |\n\n**Missing prayers:** It is a major sin and they must be made up.`,
    },
  },
  {
    id: 'prayer-2', categoryId: 'prayer', lessonNumber: 2,
    ar: {
      title: 'شروط صحة الصلاة',
      shortDesc: 'ما يجب توافره قبل الصلاة',
      body: `لصحة الصلاة شروط يجب توافرها:\n\n**١. الإسلام** — المصلي يجب أن يكون مسلماً\n\n**٢. العقل** — لا صلاة على مجنون أو فاقد الوعي\n\n**٣. البلوغ** — الصلاة واجبة على البالغ\n\n**٤. الطهارة** — طهارة البدن والثوب والمكان من النجاسة، والوضوء\n\n**٥. ستر العورة** — الرجل من السرة إلى الركبة، والمرأة كل جسدها إلا الوجه والكفين\n\n**٦. استقبال القبلة** — التوجه نحو الكعبة المشرفة في مكة\n\n**٧. دخول وقت الصلاة** — لا تصح قبل وقتها`,
    },
    en: {
      title: 'Conditions for a Valid Prayer',
      shortDesc: 'What must be fulfilled before praying',
      body: `For a prayer to be valid, certain conditions must be met:\n\n**1. Islam** — the person must be Muslim\n\n**2. Sanity** — prayer is not obligatory for the insane or unconscious\n\n**3. Puberty** — prayer becomes obligatory upon reaching puberty\n\n**4. Purity** — body, clothing, and prayer area free from impurity, plus Wudu\n\n**5. Covering the Awrah** — men from navel to knee, women their entire body except face and hands\n\n**6. Facing the Qibla** — facing the Kaaba in Mecca\n\n**7. Prayer time has entered** — prayer is not valid before its time`,
    },
  },
  {
    id: 'prayer-3', categoryId: 'prayer', lessonNumber: 3,
    ar: {
      title: 'أركان الصلاة',
      shortDesc: 'الأعمال الأساسية في الصلاة',
      body: `أركان الصلاة هي الأعمال التي تبطل الصلاة بتركها:\n\n١. **النية** — في القلب عند تكبيرة الإحرام\n٢. **تكبيرة الإحرام** — "الله أكبر" في البداية\n٣. **القيام مع القدرة** — الوقوف للصلاة\n٤. **قراءة الفاتحة** — في كل ركعة\n٥. **الركوع** — الانحناء بحيث تصل اليدان للركبتين\n٦. **الرفع من الركوع والاعتدال**\n٧. **السجود** — على سبعة أعضاء: الجبهة مع الأنف، الكفان، الركبتان، أطراف القدمين\n٨. **الرفع من السجود والجلوس بين السجدتين**\n٩. **التشهد الأخير والجلوس له**\n١٠. **التسليم** — "السلام عليكم ورحمة الله" يميناً وشمالاً\n١١. **الترتيب بين الأركان**`,
    },
    en: {
      title: 'Pillars of Prayer',
      shortDesc: 'The essential acts within prayer',
      body: `The pillars of prayer are acts whose omission invalidates the prayer:\n\n1. **Intention** — in the heart at the opening takbeer\n2. **Opening Takbeer** — "Allahu Akbar" at the start\n3. **Standing (when able)** — standing upright for prayer\n4. **Reciting Al-Fatihah** — in every rak'ah\n5. **Bowing (Ruku)** — bending until the hands reach the knees\n6. **Rising from Ruku and standing upright**\n7. **Prostration (Sujood)** — on seven body parts: forehead with nose, both palms, both knees, toes of both feet\n8. **Rising from Sujood and sitting between prostrations**\n9. **Final Tashahhud and sitting for it**\n10. **Tasleem** — "As-salamu alaykum wa rahmatullah" right then left\n11. **Order** — maintaining the prescribed sequence`,
    },
  },
  {
    id: 'prayer-4', categoryId: 'prayer', lessonNumber: 4,
    ar: {
      title: 'تعلم صلاة الفجر خطوة بخطوة',
      shortDesc: 'دليل عملي لأداء صلاة الفجر',
      body: `صلاة الفجر ركعتان. وهنا دليل عملي:\n\n**التحضير:**\n• تأكد من وضوئك\n• استقبل القبلة\n• انوِ في قلبك: صلاة الفجر فرضاً\n\n**الركعة الأولى:**\n١. كبّر: "الله أكبر" (تكبيرة الإحرام)\n٢. اقرأ دعاء الاستفتاح (اختياري)\n٣. اقرأ الفاتحة\n٤. اقرأ سورة قصيرة (كالإخلاص)\n٥. اركع: "سبحان ربي العظيم" × ٣\n٦. ارفع: "سمع الله لمن حمده، ربنا ولك الحمد"\n٧. اسجد: "سبحان ربي الأعلى" × ٣\n٨. اجلس بين السجدتين\n٩. اسجد مرة ثانية\n\n**الركعة الثانية:**\nنفس الخطوات، ثم اجلس للتشهد وسلّم.`,
    },
    en: {
      title: 'Learn Fajr Prayer Step by Step',
      shortDesc: 'A practical guide to performing Fajr prayer',
      body: `Fajr prayer consists of 2 rak'ahs. Here is a practical guide:\n\n**Preparation:**\n• Ensure you have Wudu\n• Face the Qibla\n• Form the intention in your heart: Fajr prayer, obligatory\n\n**First Rak'ah:**\n1. Say: "Allahu Akbar" (opening Takbeer)\n2. Recite opening supplication (optional)\n3. Recite Al-Fatihah\n4. Recite a short surah (like Al-Ikhlas)\n5. Bow: "Subhana Rabbiyal Adheem" × 3\n6. Rise: "Sami' Allahu liman hamidah, Rabbana wa lakal hamd"\n7. Prostrate: "Subhana Rabbiyal A'la" × 3\n8. Sit between prostrations\n9. Prostrate a second time\n\n**Second Rak'ah:**\nSame steps, then sit for Tashahhud and say the Tasleem.`,
    },
  },
  {
    id: 'prayer-5', categoryId: 'prayer', lessonNumber: 5,
    ar: {
      title: 'التشهد والسلام',
      shortDesc: 'نص التشهد وكيفية الختام',
      body: `**التشهد:**\n"التَّحِيَّاتُ للهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيكَ أَيُّهَا النَّبِيُّ وَرَحمَةُ اللهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِين، أَشْهَدُ أَن لَّا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّداً عَبدُهُ وَرَسُولُهُ"\n\n**الصلاة على النبي (الإبراهيمية):**\n"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيتَ عَلَى إِبرَاهِيمَ وَعَلَى آلِ إِبرَاهِيمَ، إِنَّكَ حَمِيدٌ مَّجِيدٌ"\n\n**السلام:**\n• يسار: "السَّلَامُ عَلَيكُم وَرَحمَةُ اللهِ"\n• يمين: "السَّلَامُ عَلَيكُم وَرَحمَةُ اللهِ"`,
    },
    en: {
      title: 'Tashahhud and Tasleem',
      shortDesc: 'The text of Tashahhud and how to end prayer',
      body: `**The Tashahhud:**\n"All prayers and worship are for Allah. Peace be upon you, O Prophet, and the mercy and blessings of Allah. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger."\n\n**The Ibrahimiyya (salutation upon the Prophet):**\n"O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim. Indeed, You are Praiseworthy and Glorious."\n\n**The Tasleem:**\n• Turn right: "As-salamu alaykum wa rahmatullah"\n• Turn left: "As-salamu alaykum wa rahmatullah"`,
    },
  },
  {
    id: 'prayer-6', categoryId: 'prayer', lessonNumber: 6,
    ar: { title: 'سنن الصلاة', shortDesc: 'المستحبات والهيئات', body: `**سنن الصلاة الهيئية:**\n• رفع اليدين عند تكبيرة الإحرام والركوع والرفع منه\n• النظر إلى موضع السجود\n• وضع اليد اليمنى على اليسرى في القيام\n• الجهر بالقراءة في الفجر والأوليين من المغرب والعشاء\n• الإسرار في الظهر والعصر وآخر المغرب والعشاء\n\n**الأذكار بعد الصلاة:**\n• الاستغفار ثلاثاً\n• "اللهم أنت السلام..."\n• تسبيح ٣٣، تحميد ٣٣، تكبير ٣٤` },
    en: { title: 'Sunnah Acts of Prayer', shortDesc: 'Recommended practices and postures', body: `**Sunnah acts (postures) in prayer:**\n• Raising hands at the opening Takbeer, at Ruku, and when rising from it\n• Looking at the place of prostration\n• Placing the right hand over the left during standing\n• Reciting aloud in Fajr and the first two rak'ahs of Maghrib and Isha\n• Reciting silently in Dhuhr, Asr, and the last rak'ahs of Maghrib and Isha\n\n**Post-prayer Adhkar:**\n• Seek forgiveness three times\n• "O Allah, You are As-Salam..."\n• Tasbih 33×, Tahmid 33×, Takbir 34×` },
  },
  {
    id: 'prayer-7', categoryId: 'prayer', lessonNumber: 7,
    ar: { title: 'صلاة الجماعة', shortDesc: 'فضل الصلاة مع الجماعة', body: `قال النبي ﷺ: "صَلاةُ الجَماعَةِ تَفضُلُ صَلاةَ الفَذِّ بِسَبعٍ وعِشرينَ دَرَجَةً"\n\n**آداب صلاة الجماعة:**\n• تعديل الصفوف وسد الفُرج\n• متابعة الإمام لا مسابقته\n• المأموم يكبر بعد الإمام\n• لا يرفع قبل الإمام\n\n**من فضائل صلاة الفجر في الجماعة:**\nقال النبي ﷺ: "مَن صَلَّى الصُّبحَ في جَماعَةٍ فَهوَ في ذِمَّةِ الله"` },
    en: { title: 'Congregational Prayer', shortDesc: 'The virtue of praying in congregation', body: `The Prophet ﷺ said: "Prayer in congregation is twenty-seven degrees superior to prayer offered alone."\n\n**Etiquette of congregational prayer:**\n• Straighten the rows and fill the gaps\n• Follow the Imam — do not precede him\n• The follower says Takbeer after the Imam\n• Do not rise before the Imam\n\n**The virtue of Fajr in congregation:**\nThe Prophet ﷺ said: "Whoever prays Fajr in congregation is under the protection of Allah."` },
  },
  {
    id: 'prayer-8', categoryId: 'prayer', lessonNumber: 8,
    ar: { title: 'قضاء الصلاة الفائتة', shortDesc: 'كيف تقضي الصلوات الفائتة', body: `إذا فاتت المسلم صلاة فيجب عليه قضاؤها فوراً.\n\nقال النبي ﷺ: "من نام عن صلاةٍ أو نسيها فليُصلِّها إذا ذكرها"\n\n**كيفية القضاء:**\n• تُقضى الصلاة كما فاتت (أربع ركعات للظهر مثلاً)\n• يُستحب المبادرة بالقضاء فوراً\n• يجوز تأخير القضاء لعذر مع العزم عليه\n• لا كفارة للصلاة الفائتة إلا القضاء\n\n**ترتيب القضاء:**\nإذا فاتت أكثر من صلاة، يُستحب قضاؤها بالترتيب (الفجر ثم الظهر...) ما لم يضق الوقت.` },
    en: { title: 'Making Up Missed Prayers', shortDesc: 'How to make up prayers you have missed', body: `If a Muslim misses a prayer, they must make it up immediately.\n\nThe Prophet ﷺ said: "Whoever oversleeps or forgets a prayer should pray it when he remembers."\n\n**How to make up:**\n• Pray it as it was (e.g., 4 rak'ahs for Dhuhr)\n• Hasten to make it up immediately\n• Delaying is permitted if there is a valid reason, with firm intention\n• There is no expiation for missed prayers except to perform them\n\n**Order of make-up:**\nIf multiple prayers are missed, it is preferred to make them up in order (Fajr, then Dhuhr...) unless time is short.` },
  },
  {
    id: 'prayer-9', categoryId: 'prayer', lessonNumber: 9,
    ar: { title: 'الصلاة في السفر والقصر', shortDesc: 'تخفيف الصلاة للمسافر', body: `رحمة من الله أن يخفف على المسافر في صلاته:\n\n**القصر:** اختصار الصلاة الرباعية إلى ركعتين\n• الظهر ٢ بدلاً من ٤\n• العصر ٢ بدلاً من ٤\n• العشاء ٢ بدلاً من ٤\n• الفجر والمغرب لا تُقصران\n\n**الجمع:** الجمع بين صلاتين في وقت إحداهما\n• جمع تقديم: تقديم العصر إلى وقت الظهر\n• جمع تأخير: تأخير الظهر إلى وقت العصر\n\n**شرط المسافة:** تبدأ رخصة السفر عادةً من ٨٩ كيلومتراً فأكثر (خلاف بين العلماء).` },
    en: { title: 'Traveling and Shortening Prayer', shortDesc: 'Concessions for the traveler in prayer', body: `In His mercy, Allah has eased prayer for the traveler:\n\n**Qasr (shortening):** Reducing 4-rak'ah prayers to 2\n• Dhuhr: 2 instead of 4\n• Asr: 2 instead of 4\n• Isha: 2 instead of 4\n• Fajr and Maghrib are not shortened\n\n**Jama' (combining):** Combining two prayers in one time slot\n• Taqdum: advancing Asr to Dhuhr time\n• Ta'khir: delaying Dhuhr to Asr time\n\n**Distance requirement:** Travel concessions typically begin at ~89 km or more (scholars differ on the exact distance).` },
  },
  {
    id: 'prayer-10', categoryId: 'prayer', lessonNumber: 10,
    ar: { title: 'صلاة الجمعة', shortDesc: 'فريضة يوم الجمعة وشروطها', body: `صلاة الجمعة فريضة على كل مسلم بالغ حر مقيم قادر.\n\nقال تعالى: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ" (الجمعة: ٩)\n\n**مواصفات الجمعة:**\n• تُؤدى بدلاً من صلاة الظهر\n• ركعتان مع خطبتين\n• يُستحب الاغتسال والتطيب ولبس أجمل الثياب\n• التبكير إلى المسجد مستحب\n\n**من يُعذر عن الجمعة:**\nالمسافر، المريض، المرأة، الشيخ الكبير العاجز.` },
    en: { title: 'Friday Prayer (Jumu\'ah)', shortDesc: "The obligatory Friday prayer and its conditions", body: `Friday prayer is obligatory for every adult, free, resident Muslim who is able.\n\nAllah says: "O you who believe, when the call to prayer is made on Friday, hasten to the remembrance of Allah." (Quran 62:9)\n\n**Characteristics of Jumu'ah:**\n• Performed in place of Dhuhr prayer\n• 2 rak'ahs with two khutbahs (sermons)\n• It is recommended to bathe, apply fragrance, and wear fine clothes\n• Coming to the mosque early is recommended\n\n**Those excused from Jumu'ah:**\nTravelers, the sick, women, and elderly who are unable.` },
  },

  // ── BASICS ─────────────────────────────────────────────────────────────────
  {
    id: 'basics-1', categoryId: 'basics', lessonNumber: 1,
    ar: { title: 'توحيد الله', shortDesc: 'مفهوم التوحيد وأنواعه', body: `التوحيد هو إفراد الله بالعبادة والاعتقاد.\n\n**أنواع التوحيد:**\n\n**١. توحيد الربوبية**\nالإيمان بأن الله وحده هو الخالق الرازق المدبر لأمر الكون.\n\n**٢. توحيد الألوهية**\nإفراد الله بجميع أنواع العبادة من صلاة وصوم ودعاء وذبح وغيرها.\n\n**٣. توحيد الأسماء والصفات**\nالإيمان بما وصف الله به نفسه في القرآن وما وصفه به النبي ﷺ من أسماء وصفات، دون تحريف أو تعطيل أو تكييف أو تمثيل.\n\nالتوحيد هو سبب خلق الإنس والجن: "وَمَا خَلَقتُ الجِنَّ وَالإِنسَ إِلَّا لِيَعبُدونِ" (الذاريات: ٥٦)` },
    en: { title: 'Tawheed — Oneness of Allah', shortDesc: 'The concept and categories of Tawheed', body: `Tawheed is singling out Allah alone in worship and belief.\n\n**Categories of Tawheed:**\n\n**1. Tawheed Ar-Rububiyyah**\nBelieving that Allah alone is the Creator, Sustainer, and Disposer of all affairs.\n\n**2. Tawheed Al-Uluhiyyah**\nDedicating all acts of worship to Allah alone: prayer, fasting, supplication, sacrifice, etc.\n\n**3. Tawheed Al-Asma Was-Sifat**\nBelieving in Allah's names and attributes as described in the Quran and Sunnah, without distortion, denial, modality, or likening.\n\nTawheed is the purpose of creation: "I did not create jinn and mankind except to worship Me." (Quran 51:56)` },
  },
  {
    id: 'basics-2', categoryId: 'basics', lessonNumber: 2,
    ar: { title: 'الشرك وأنواعه', shortDesc: 'أكبر الذنوب وأقسام الشرك', body: `الشرك هو أن يجعل الإنسان لله شريكاً أو نداً في ما هو حق الله وحده.\n\nقال تعالى: "إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَاءُ" (النساء: ٤٨)\n\n**أقسام الشرك:**\n\n**الشرك الأكبر:** كالدعاء والاستغاثة والذبح لغير الله. يُحبط جميع الأعمال.\n\n**الشرك الأصغر:** مثل الرياء (فعل العبادة للناس). قال النبي ﷺ: "أخوف ما أخاف عليكم الشرك الأصغر". وهو لا يُحبط جميع الأعمال لكنه كبيرة.\n\n**شرك خفي:** مثل قول "ما شاء الله وشاء فلان" (والصحيح: ما شاء الله ثم شاء فلان)` },
    en: { title: 'Shirk — Associating Partners with Allah', shortDesc: 'The greatest sin and its categories', body: `Shirk means assigning a partner or equal to Allah in what belongs to Him alone.\n\nAllah says: "Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills." (Quran 4:48)\n\n**Categories of Shirk:**\n\n**Major Shirk:** Such as calling upon, seeking help from, or sacrificing for other than Allah. It nullifies all deeds.\n\n**Minor Shirk:** Such as Riya (showing off in worship). The Prophet ﷺ said: "The thing I fear most for you is minor shirk." It does not nullify all deeds but is a major sin.\n\n**Hidden Shirk:** Such as saying "Whatever Allah and so-and-so willed" (correct is: "Whatever Allah willed, then so-and-so willed")` },
  },
  {
    id: 'basics-3', categoryId: 'basics', lessonNumber: 3,
    ar: { title: 'النبي محمد ﷺ', shortDesc: 'حياة خاتم الأنبياء والمرسلين', body: `محمد بن عبدالله ﷺ خاتم الأنبياء والمرسلين.\n\n**ولادته:** ولد في مكة المكرمة عام ٥٧٠م في يوم الاثنين من ربيع الأول.\n\n**نزول الوحي:** جاءه الوحي وهو في الأربعين من عمره في غار حراء. وكان أول ما نزل: "اقرأ باسم ربك الذي خلق".\n\n**الهجرة:** هاجر إلى المدينة المنورة عام ٦٢٢م.\n\n**وفاته:** توفي ﷺ عام ٦٣٢م في المدينة المنورة.\n\n**أخلاقه:** وصفته السيدة عائشة بقولها: "كان خلقه القرآن". كان أكثر الناس جوداً وأشجعهم وأرحمهم.` },
    en: { title: 'The Prophet Muhammad ﷺ', shortDesc: 'The life of the final Prophet and Messenger', body: `Muhammad ibn Abdullah ﷺ is the final Prophet and Messenger.\n\n**Birth:** Born in Mecca in 570 CE on a Monday in the month of Rabi al-Awwal.\n\n**Revelation:** He received revelation at the age of 40 in the Cave of Hira. The first verse revealed was: "Read in the name of your Lord who created."\n\n**The Hijra:** He migrated to Medina in 622 CE.\n\n**Death:** He passed away in 632 CE in Medina.\n\n**Character:** Aisha described him saying: "His character was the Quran." He was the most generous, bravest, and most merciful of people.` },
  },
  {
    id: 'basics-4', categoryId: 'basics', lessonNumber: 4,
    ar: { title: 'القرآن الكريم', shortDesc: 'كلام الله المعجز وفضل تلاوته', body: `القرآن الكريم كلام الله نزل به جبريل على النبي ﷺ.\n\n**معلومات عن القرآن:**\n• ١١٤ سورة\n• ٦٢٣٦ آية\n• ٣٠ جزءاً\n• أُنزل على مدى ٢٣ سنة\n\n**فضل تلاوته:**\n• "اقرَؤُوا القُرآنَ فإنَّه يَأتي يَومَ القِيامَةِ شَفِيعاً لأصحابِه"\n• الحرف الواحد بعشر حسنات\n• "خَيرُكُم مَن تَعَلَّمَ القُرآنَ وعَلَّمَه"\n\n**حفظ القرآن:** أشرف ما يحفظه الإنسان. يبدأ بالسور القصيرة (جزء عم ثم تبارك).\n\n**آداب التلاوة:** الوضوء، استقبال القبلة، التدبر والتمهل، والاستعاذة بالله من الشيطان.` },
    en: { title: 'The Holy Quran', shortDesc: "Allah's miraculous word and the virtue of recitation", body: `The Holy Quran is the word of Allah, revealed to the Prophet ﷺ through the angel Jibril.\n\n**Facts about the Quran:**\n• 114 surahs\n• 6236 verses\n• 30 parts (juz)\n• Revealed over 23 years\n\n**Virtue of recitation:**\n• "Recite the Quran, for it will come on the Day of Resurrection as an intercessor for its companions"\n• Each letter earns ten good deeds\n• "The best of you are those who learn the Quran and teach it"\n\n**Memorizing the Quran:** The noblest thing a person can memorize. Begin with short surahs (Juz Amma, then Tabaraka).\n\n**Etiquette of recitation:** Having Wudu, facing the Qibla, pondering and reading slowly, and seeking refuge with Allah from Shaytan.` },
  },
  {
    id: 'basics-5', categoryId: 'basics', lessonNumber: 5,
    ar: { title: 'الحلال والحرام', shortDesc: 'مبادئ التحليل والتحريم في الإسلام', body: `الحلال ما أباحه الله والحرام ما نهى عنه.\n\n**قاعدة مهمة:** الأصل في الأشياء الإباحة حتى يثبت التحريم بدليل.\n\n**من المحرمات الكبرى:**\n• الشرك بالله\n• الزنا والفواحش\n• قتل النفس بغير حق\n• الخمر والمسكرات\n• أكل الميتة ولحم الخنزير\n• الربا\n• سحر وكهانة\n\n**الحلال واسع:**\nقال النبي ﷺ: "الحلال بيّن والحرام بيّن، وبينهما أمور مشتبهات" — فاتقِ الشبهات.\n\n**مقاصد الشريعة الإسلامية:** حفظ الدين، النفس، العقل، النسل، المال.` },
    en: { title: 'Halal and Haram', shortDesc: 'Principles of permissibility and prohibition', body: `Halal is what Allah has permitted; Haram is what He has forbidden.\n\n**Important principle:** Everything is originally permitted unless there is evidence of prohibition.\n\n**Major prohibitions:**\n• Shirk (associating partners with Allah)\n• Adultery and indecency\n• Killing unjustly\n• Alcohol and intoxicants\n• Eating carrion and pork\n• Usury (Riba)\n• Magic and fortune-telling\n\n**Halal is vast:**\nThe Prophet ﷺ said: "The halal is clear and the haram is clear, and between them are doubtful matters" — so avoid the doubtful.\n\n**Objectives of Islamic law:** Preserving religion, life, intellect, lineage, and wealth.` },
  },
  {
    id: 'basics-6', categoryId: 'basics', lessonNumber: 6,
    ar: { title: 'الجنة والنار', shortDesc: 'الدار الآخرة ووصفها في القرآن', body: `الجنة دار النعيم التي أعدها الله للمؤمنين المتقين.\n\nقال تعالى: "وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ" (البقرة: ٢٥)\n\n**من نعيم الجنة:**\n• ما لا عين رأت ولا أذن سمعت ولا خطر على قلب بشر\n• الرؤية إلى وجه الله الكريم\n• الخلود فيها إلى الأبد\n\n**النار:**\nأعدها الله للكافرين والمشركين والعاصين الذين لم يتوبوا.\n\n**أسباب دخول الجنة:**\n• الإيمان والعمل الصالح\n• الصبر والشكر\n• حسن الخلق وبر الوالدين` },
    en: { title: 'Paradise and Hellfire', shortDesc: 'The afterlife as described in the Quran', body: `Paradise is the abode of bliss that Allah prepared for the righteous believers.\n\nAllah says: "And give good tidings to those who believe and do righteous deeds that they will have gardens beneath which rivers flow." (Quran 2:25)\n\n**Blessings of Paradise:**\n• What no eye has seen, no ear has heard, and no human mind has imagined\n• Seeing the noble Face of Allah\n• Eternal dwelling therein\n\n**Hellfire:**\nAllah has prepared it for the disbelievers, polytheists, and sinners who did not repent.\n\n**Causes of entering Paradise:**\n• Faith and righteous deeds\n• Patience and gratitude\n• Good character and honoring parents` },
  },
  {
    id: 'basics-7', categoryId: 'basics', lessonNumber: 7,
    ar: { title: 'حقوق المسلم على أخيه', shortDesc: 'الحقوق الاجتماعية في الإسلام', body: `قال النبي ﷺ: "حقُّ المُسلِمِ على المُسلِمِ سِتٌّ"\n\n**الحقوق الستة:**\n١. إذا لقيته فسلّم عليه\n٢. إذا دعاك فأجبه\n٣. إذا استنصحك فانصحه\n٤. إذا عطس وحمد الله فشمّته\n٥. إذا مرض فعُده\n٦. إذا مات فاتبع جنازته\n\n**حقوق أخرى:**\n• نصر المظلوم\n• الدفاع عن عرضه في غيابه\n• المحبة في الله\n• التواضع والابتعاد عن الكبر والحسد` },
    en: { title: "A Muslim's Rights Over His Brother", shortDesc: 'Social rights and duties in Islam', body: `The Prophet ﷺ said: "A Muslim has six rights over another Muslim."\n\n**The six rights:**\n1. When you meet him, greet him with Salam\n2. When he invites you, accept his invitation\n3. When he seeks your advice, give him sincere advice\n4. When he sneezes and praises Allah, say "Yarhamukallah"\n5. When he is sick, visit him\n6. When he dies, follow his funeral procession\n\n**Other rights:**\n• Support him when he is wronged\n• Defend his honor in his absence\n• Love for the sake of Allah\n• Humility, avoiding arrogance and envy` },
  },
  {
    id: 'basics-8', categoryId: 'basics', lessonNumber: 8,
    ar: { title: 'المساجد وفضلها', shortDesc: 'بيوت الله ومكانتها في الإسلام', body: `المساجد بيوت الله في الأرض. قال النبي ﷺ: "أحبُّ البلادِ إلى اللهِ مساجدُها"\n\n**آداب دخول المسجد:**\n• الدخول بالقدم اليمنى\n• قول: "اللهم افتح لي أبواب رحمتك"\n• تحية المسجد (ركعتان)\n\n**آداب الجلوس في المسجد:**\n• الصمت وذكر الله\n• قراءة القرآن\n• الصلاة على النبي ﷺ\n\n**المساجد الثلاثة الأفضل:**\n• المسجد الحرام (مكة) — الصلاة فيه بمئة ألف صلاة\n• المسجد النبوي (المدينة) — الصلاة فيه بألف صلاة\n• المسجد الأقصى (القدس) — الصلاة فيه بخمسمئة صلاة` },
    en: { title: 'Mosques and Their Virtue', shortDesc: "Houses of Allah and their status in Islam", body: `Mosques are the houses of Allah on earth. The Prophet ﷺ said: "The most beloved places on earth to Allah are the mosques."\n\n**Etiquette of entering the mosque:**\n• Enter with the right foot\n• Say: "O Allah, open for me the doors of Your mercy"\n• Perform Tahiyyat al-Masjid (two rak'ahs)\n\n**Etiquette while in the mosque:**\n• Silence and remembrance of Allah\n• Reading the Quran\n• Sending blessings on the Prophet ﷺ\n\n**The three most virtuous mosques:**\n• Al-Masjid Al-Haram (Mecca) — prayer equals 100,000 prayers\n• Al-Masjid An-Nabawi (Medina) — prayer equals 1,000 prayers\n• Al-Masjid Al-Aqsa (Jerusalem) — prayer equals 500 prayers` },
  },

  // ── FASTING ────────────────────────────────────────────────────────────────
  {
    id: 'fasting-1', categoryId: 'fasting', lessonNumber: 1,
    ar: { title: 'فريضة الصيام', shortDesc: 'حكم الصيام وأدلته', body: `الصيام الركن الرابع من أركان الإسلام. قال تعالى: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ" (البقرة: ١٨٣)\n\n**فضل رمضان:**\n• تُفتح فيه أبواب الجنة وتُغلق أبواب النار\n• ليلة القدر خير من ألف شهر\n• من صامه إيماناً واحتساباً غُفر له ما تقدم من ذنبه\n\n**حكمة الصيام:**\n• تزكية النفس\n• تعلّم الصبر والإرادة\n• التضامن مع الفقراء\n• تقوية صلة العبد بربه` },
    en: { title: 'The Obligation of Fasting', shortDesc: 'The ruling on fasting and its evidence', body: `Fasting is the fourth pillar of Islam. Allah says: "O you who believe, fasting has been prescribed for you as it was prescribed for those before you, that you may become righteous." (Quran 2:183)\n\n**The virtue of Ramadan:**\n• Gates of Paradise are opened and gates of Hellfire are closed\n• Laylat al-Qadr is better than a thousand months\n• Whoever fasts with faith and seeking reward, his past sins are forgiven\n\n**Wisdom of fasting:**\n• Purifying the soul\n• Learning patience and willpower\n• Solidarity with the poor\n• Strengthening the bond between the servant and his Lord` },
  },
  {
    id: 'fasting-2', categoryId: 'fasting', lessonNumber: 2,
    ar: { title: 'شروط وجوب الصيام', shortDesc: 'من يجب عليه الصيام ومن يُعذر', body: `يجب الصيام على كل مسلم توافرت فيه الشروط التالية:\n\n**شروط الوجوب:**\n• الإسلام\n• البلوغ (يستحب للصغير دون البلوغ التدريب)\n• العقل\n• القدرة على الصيام\n• الإقامة (غير المسافر)\n• الخلو من موانع كالحيض والنفاس\n\n**من يُعذر:**\n• المريض الذي يتضرر بالصيام — يُفطر ويقضي\n• المسافر — يُفطر ويقضي\n• الحامل والمرضع — تُفطران وتقضيان وقد تكفّران\n• الشيخ الكبير العاجز — يُطعم عن كل يوم مسكيناً` },
    en: { title: 'Conditions of Obligatory Fasting', shortDesc: 'Who must fast and who is excused', body: `Fasting is obligatory upon every Muslim who meets the following conditions:\n\n**Conditions of obligation:**\n• Islam\n• Puberty (children below puberty are encouraged to practice)\n• Sanity\n• Physical ability to fast\n• Residency (not traveling)\n• Free from obstacles such as menstruation and postnatal bleeding\n\n**Those excused:**\n• The sick who would be harmed by fasting — break the fast and make it up\n• The traveler — breaks the fast and makes it up\n• Pregnant and nursing women — break the fast, make it up, and may pay fidya\n• The elderly who cannot fast — feed a poor person for each day missed` },
  },
  {
    id: 'fasting-3', categoryId: 'fasting', lessonNumber: 3,
    ar: { title: 'مفطرات الصيام', shortDesc: 'ما يبطل الصيام', body: `المفطرات هي الأشياء التي تُبطل الصيام وتوجب القضاء أو الكفارة:\n\n**المفطرات التي تُبطل الصيام:**\n• الأكل والشرب عمداً\n• الجماع\n• الاستقاءة عمداً\n• الحيض والنفاس\n• الردة\n• الحقن الغذائية (تُغني عن الطعام)\n\n**ما لا يُفطّر:**\n• الاستنشاق والمضمضة بدون ابتلاع\n• قطرات العين والأذن\n• الحقن في العضل التي ليست غذاء\n• السواك\n• الاحتلام\n• النسيان (من أكل أو شرب ناسياً فليتم صومه)` },
    en: { title: 'What Invalidates the Fast', shortDesc: 'Acts that break the fast', body: `These are acts that invalidate the fast and require making it up or expiation:\n\n**Invalidators of the fast:**\n• Eating or drinking intentionally\n• Sexual intercourse\n• Intentionally inducing vomiting\n• Menstruation and postnatal bleeding\n• Apostasy\n• Nutritional injections (those that substitute for food)\n\n**What does NOT break the fast:**\n• Rinsing the nose and mouth without swallowing\n• Eye and ear drops\n• Muscle injections that are not nutritional\n• Using miswak (tooth stick)\n• Wet dreams\n• Forgetting (one who eats or drinks forgetting they are fasting should complete their fast)` },
  },
  {
    id: 'fasting-4', categoryId: 'fasting', lessonNumber: 4,
    ar: { title: 'ليلة القدر والاعتكاف', shortDesc: 'أعظم ليالي العام وفضل الاعتكاف', body: `ليلة القدر خير من ألف شهر (نحو ٨٣ سنة). قال تعالى: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ"\n\n**متى تكون؟**\nفي أحد أوتار العشر الأواخر من رمضان، وأرجحها ليلة السابع والعشرين.\n\n**كيف تحييها:**\n• كثرة الصلاة والقيام\n• قراءة القرآن\n• الدعاء: "اللهم إنك عفو تحب العفو فاعف عني"\n• الصدقة والذكر\n\n**الاعتكاف:**\nاللبث في المسجد بنية التقرب إلى الله. سنة مؤكدة في العشر الأواخر. يُخصص وقته للعبادة والقرآن والذكر.` },
    en: { title: "Laylat Al-Qadr and I'tikaf", shortDesc: 'The greatest night and the retreat in the mosque', body: `Laylat al-Qadr is better than a thousand months (about 83 years). Allah says: "Indeed, We sent it down on the Night of Decree."\n\n**When is it?**\nIn one of the odd nights of the last ten nights of Ramadan, most likely the 27th night.\n\n**How to revive it:**\n• Abundant prayer and night worship\n• Reading the Quran\n• Supplication: "O Allah, You are All-Pardoning and love pardoning, so pardon me"\n• Charity and remembrance of Allah\n\n**I'tikaf:**\nResiding in the mosque with the intention of drawing closer to Allah. It is a confirmed Sunnah in the last ten nights, dedicated to worship, Quran, and remembrance.` },
  },
  {
    id: 'fasting-5', categoryId: 'fasting', lessonNumber: 5,
    ar: { title: 'زكاة الفطر', shortDesc: 'فريضة الصدقة في ختام رمضان', body: `زكاة الفطر صدقة واجبة تُؤدَّى في نهاية رمضان. قال النبي ﷺ: "فَرَضَ رسولُ اللهِ ﷺ زَكاةَ الفِطرِ طُهرةً للصائمِ مِن اللَّغوِ والرَّفَثِ وطُعمةً للمَساكينِ"\n\n**مقدارها:** صاع من طعام البلد (نحو ٢.٥ كيلو من الأرز أو القمح أو التمر)\n\n**وقت إخراجها:**\n• الأفضل: صبيحة يوم العيد قبل صلاة العيد\n• يجوز: من بداية رمضان\n• لا تجوز: بعد صلاة العيد إلا قضاءً\n\n**على من تجب؟** على كل مسلم قادر عن نفسه وعمن يعوله` },
    en: { title: "Zakat Al-Fitr", shortDesc: 'The obligatory charity at the end of Ramadan', body: `Zakat al-Fitr is an obligatory charity paid at the end of Ramadan. The Prophet ﷺ said: "The Messenger of Allah ﷺ made Zakat al-Fitr obligatory as a purification for the fasting person from vain and obscene speech, and as food for the poor."\n\n**Amount:** One sa' of the local staple food (about 2.5 kg of rice, wheat, or dates)\n\n**When to give it:**\n• Best: the morning of Eid before the Eid prayer\n• Permissible: from the beginning of Ramadan\n• Not acceptable: after the Eid prayer (becomes a regular charity)\n\n**Who must give it?** Every Muslim who is able, for themselves and those they support` },
  },
  {
    id: 'fasting-6', categoryId: 'fasting', lessonNumber: 6,
    ar: { title: 'صيام التطوع', shortDesc: 'الصيام المستحب على مدار العام', body: `الصيام التطوع قربة عظيمة من الله. قال النبي ﷺ: "من صام يوماً في سبيل الله بعّد الله وجهه عن النار سبعين خريفاً"\n\n**أنواع صيام التطوع:**\n\n• **ستة من شوال:** قال ﷺ: "من صام رمضان ثم أتبعه ستاً من شوال كان كصيام الدهر"\n\n• **يوم عرفة:** يكفّر ذنوب سنتين (الماضية والقادمة)\n\n• **يوم عاشوراء:** يكفّر ذنوب سنة ماضية\n\n• **صيام الاثنين والخميس:** "إنهما يومان تُعرض فيهما الأعمال على الله"\n\n• **الأيام البيض:** الثالث عشر والرابع عشر والخامس عشر من كل شهر هجري` },
    en: { title: 'Voluntary Fasting', shortDesc: 'Recommended fasts throughout the year', body: `Voluntary fasting is a great act of worship. The Prophet ﷺ said: "Whoever fasts a day for the sake of Allah, Allah will distance his face from the Fire by seventy autumns."\n\n**Types of voluntary fasting:**\n\n• **Six days of Shawwal:** The Prophet ﷺ said: "Whoever fasts Ramadan then follows it with six days of Shawwal, it is as if he fasted the entire year."\n\n• **Day of Arafah:** Expiates the sins of two years (past and coming)\n\n• **Day of Ashura:** Expiates the sins of the past year\n\n• **Mondays and Thursdays:** "These are two days when deeds are presented to Allah"\n\n• **The White Days:** 13th, 14th, and 15th of every Hijri month` },
  },

  // ── ZAKAT ──────────────────────────────────────────────────────────────────
  {
    id: 'zakat-1', categoryId: 'zakat', lessonNumber: 1,
    ar: { title: 'ما هي الزكاة؟', shortDesc: 'الركن الثالث من أركان الإسلام', body: `الزكاة الركن الثالث من أركان الإسلام. هي حق واجب في المال للفقراء وغيرهم.\n\nقال تعالى: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ" (البقرة: ٤٣)\n\n**فضل الزكاة:**\n• تطهير المال وتزكية النفس\n• سبب لزيادة البركة في المال\n• حماية للمجتمع من الفقر\n• تقوية الترابط الاجتماعي\n\n**شروط وجوب الزكاة:**\n• الإسلام\n• الحرية\n• ملك النصاب (الحد الأدنى للمال الذي تجب فيه الزكاة)\n• مرور الحول (سنة هجرية كاملة على المال)` },
    en: { title: 'What is Zakat?', shortDesc: 'The third pillar of Islam', body: `Zakat is the third pillar of Islam. It is an obligatory right in wealth for the poor and others.\n\nAllah says: "Establish prayer and give Zakat." (Quran 2:43)\n\n**Virtues of Zakat:**\n• Purifies wealth and the soul\n• A cause of blessings in wealth\n• Protects society from poverty\n• Strengthens social bonds\n\n**Conditions for Zakat to be obligatory:**\n• Islam\n• Freedom\n• Owning the Nisab (the minimum threshold of wealth)\n• Passage of one lunar year over the wealth` },
  },
  {
    id: 'zakat-2', categoryId: 'zakat', lessonNumber: 2,
    ar: { title: 'نصاب الزكاة ومقدارها', shortDesc: 'الحد الأدنى وكمية الزكاة الواجبة', body: `**نصاب زكاة الذهب:** ٨٥ جراماً\n**نصاب زكاة الفضة:** ٥٩٥ جراماً\n**نصاب زكاة المال (النقود):** ما يعادل قيمة ٨٥ جراماً من الذهب\n**مقدار الزكاة:** ٢.٥٪ من المال الذي بلغ النصاب وحال عليه الحول\n\n**مثال عملي:**\nإذا كان عندك ١٠٠,٠٠٠ ريال وبلغت النصاب وحال عليها الحول:\nالزكاة = ١٠٠,٠٠٠ × ٢.٥٪ = ٢٥٠٠ ريال\n\n**زكاة الزروع والثمار:**\n• ١٠٪ إذا سُقيت بالمطر\n• ٥٪ إذا سُقيت بالجهد والمال\n\n**زكاة عروض التجارة:** ٢.٥٪ من قيمة البضاعة كل سنة` },
    en: { title: 'Zakat Nisab and Amount', shortDesc: 'The minimum threshold and amount of Zakat', body: `**Gold Nisab:** 85 grams\n**Silver Nisab:** 595 grams\n**Cash Nisab:** Equivalent to the value of 85 grams of gold\n**Zakat rate:** 2.5% of wealth that has reached the Nisab and one lunar year has passed\n\n**Practical example:**\nIf you have 100,000 in savings, at Nisab threshold, after one year:\nZakat = 100,000 × 2.5% = 2,500\n\n**Zakat on crops and fruits:**\n• 10% if watered by rain\n• 5% if watered by effort and expense\n\n**Zakat on trade goods:** 2.5% of the value of goods each year` },
  },
  {
    id: 'zakat-3', categoryId: 'zakat', lessonNumber: 3,
    ar: { title: 'مصارف الزكاة', shortDesc: 'من يستحق الزكاة؟', body: `قال تعالى: "إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ" (التوبة: ٦٠)\n\n**الأصناف الثمانية:**\n١. **الفقراء** — من لا يجد ما يكفيه\n٢. **المساكين** — من يجد بعض الكفاية\n٣. **العاملون عليها** — جامعو الزكاة وموزعوها\n٤. **المؤلفة قلوبهم** — من يُراد تأليف قلبه للإسلام\n٥. **في الرقاب** — تحرير العبيد\n٦. **الغارمون** — المدينون لغير معصية\n٧. **في سبيل الله** — المجاهدون والطلاب\n٨. **ابن السبيل** — المسافر المنقطع` },
    en: { title: 'Recipients of Zakat', shortDesc: 'Who deserves to receive Zakat?', body: `Allah says: "Zakat is only for the poor and needy, and those employed to collect it, and those whose hearts are to be reconciled, and to free captives, and those in debt, and for the cause of Allah, and for the wayfarer." (Quran 9:60)\n\n**The eight categories:**\n1. **The poor (Fuqara)** — those who have nothing to meet their basic needs\n2. **The needy (Masakeen)** — those who have some but not enough\n3. **Zakat workers** — those who collect and distribute Zakat\n4. **Those whose hearts are reconciled** — those drawn toward Islam\n5. **For freeing captives** — historically, freeing slaves\n6. **The indebted** — those with debt not incurred in disobedience\n7. **In the cause of Allah** — fighters and students of knowledge\n8. **Wayfarers** — stranded travelers` },
  },
  {
    id: 'zakat-4', categoryId: 'zakat', lessonNumber: 4,
    ar: { title: 'الصدقة وفضلها', shortDesc: 'فضل الصدقة التطوعية وأنواعها', body: `الصدقة التطوعية من أعظم القربات إلى الله.\n\nقال النبي ﷺ: "الصدقة تطفئ الخطيئة كما يطفئ الماء النار"\n\n**فضائل الصدقة:**\n• تضاعف الحسنات\n• تقي من البلاء\n• سبب شفاء الأمراض\n• ظل للمتصدق يوم القيامة\n\n**أفضل الصدقات:**\n• الصدقة الجارية: وقف المسجد وحفر البئر\n• تعليم العلم\n• الدعاء للمسلمين\n• الابتسامة في وجه أخيك صدقة\n• إماطة الأذى عن الطريق صدقة\n• كل تسبيحة صدقة، وكل تكبيرة صدقة\n\nقال ﷺ: "أفضل الصدقة جهد المقل، وابدأ بمن تعول"` },
    en: { title: 'Charity and Its Virtue', shortDesc: 'The virtue of voluntary charity and its types', body: `Voluntary charity (Sadaqah) is one of the greatest acts of worship.\n\nThe Prophet ﷺ said: "Charity extinguishes sin as water extinguishes fire."\n\n**Virtues of charity:**\n• Multiplies good deeds\n• Wards off calamity\n• A cause of healing illness\n• A shade for the giver on the Day of Judgment\n\n**The best types of charity:**\n• Ongoing charity: building a mosque, digging a well\n• Teaching knowledge\n• Supplicating for Muslims\n• Smiling at your brother is charity\n• Removing harm from the road is charity\n• Every tasbih is charity, every takbeer is charity\n\nThe Prophet ﷺ said: "The best charity is that given by one who has little, and begin with those you support."` },
  },

  // ── AKHLAQ ─────────────────────────────────────────────────────────────────
  {
    id: 'akhlaq-1', categoryId: 'akhlaq', lessonNumber: 1,
    ar: { title: 'الصدق والأمانة', shortDesc: 'قيمة الصدق وأهمية الأمانة', body: `قال النبي ﷺ: "عليكم بالصدق؛ فإن الصدق يهدي إلى البر، والبر يهدي إلى الجنة"\n\n**الصدق في القول:** لا تقل إلا ما تعتقد أنه حق.\n**الصدق في العمل:** ابذل جهدك وأتقن عملك.\n**الصدق مع الله:** أخلص نيتك في العبادة.\n\n**الأمانة:**\nقال تعالى: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا"\n• أد الأمانة لصاحبها سواء مال أو سر أو وظيفة\n• الحفاظ على سر الناس من الأمانة\n• أداء العمل كاملاً من الأمانة\n\nكان النبي ﷺ يُلقَّب قبل البعثة بـ"الصادق الأمين"` },
    en: { title: 'Honesty and Trustworthiness', shortDesc: 'The value of truthfulness and faithfulness', body: `The Prophet ﷺ said: "Hold fast to truthfulness, for it guides to righteousness, and righteousness leads to Paradise."\n\n**Honesty in speech:** Only say what you believe to be true.\n**Honesty in action:** Give your best effort and perfect your work.\n**Honesty with Allah:** Make your worship purely for His sake.\n\n**Trustworthiness (Amanah):**\nAllah says: "Indeed, Allah commands you to return trusts to their rightful owners."\n• Return every trust — whether money, a secret, or a job responsibility\n• Keeping people's secrets is part of trustworthiness\n• Completing your work fully is part of trustworthiness\n\nThe Prophet ﷺ was known even before prophethood as "The Truthful and Trustworthy" (As-Sadiq Al-Ameen)` },
  },
  {
    id: 'akhlaq-2', categoryId: 'akhlaq', lessonNumber: 2,
    ar: { title: 'بر الوالدين', shortDesc: 'أعظم حقوق الإنسان بعد حق الله', body: `بر الوالدين من أعظم الطاعات. قال تعالى: "وَقَضَى رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا" (الإسراء: ٢٣)\n\n**معنى البر:**\n• طاعتهما في غير معصية الله\n• التواضع لهما\n• الإنفاق عليهما عند الحاجة\n• الدعاء لهما في حياتهما وبعد وفاتهما\n• عدم رفع الصوت عليهما\n\n**عقوق الوالدين:**\nمن الكبائر. قال ﷺ: "أكبر الكبائر: الإشراك بالله، وعقوق الوالدين"\n\n**بر الأم:** لها ثلاثة أضعاف حق الأب. قال رجل للنبي ﷺ: من أبر؟ قال: "أمك" ثلاثاً ثم قال "أباك".` },
    en: { title: 'Honoring Parents', shortDesc: "The greatest right of people after Allah's right", body: `Honoring parents is among the greatest acts of obedience. Allah says: "Your Lord has decreed that you worship none but Him, and that you be kind to parents." (Quran 17:23)\n\n**What honoring parents means:**\n• Obeying them in everything except disobeying Allah\n• Being humble with them\n• Supporting them financially when needed\n• Supplicating for them in life and after their death\n• Never raising your voice at them\n\n**Disobeying parents:**\nIt is among the major sins. The Prophet ﷺ said: "The greatest of major sins: associating partners with Allah, and disobeying parents."\n\n**The mother's right:** Three times that of the father. A man asked the Prophet ﷺ: who deserves my best company? He said: "Your mother" — three times — then: "Your father."` },
  },
  {
    id: 'akhlaq-3', categoryId: 'akhlaq', lessonNumber: 3,
    ar: { title: 'صلة الرحم', shortDesc: 'فضل التواصل مع الأهل والأقارب', body: `صلة الرحم من أعظم القربات. قال النبي ﷺ: "من أحب أن يُبسط له في رزقه، ويُنسأ له في أثره، فليصل رحمه"\n\n**معنى صلة الرحم:**\n• زيارة الأقارب بالقصد والفعل\n• الاتصال بهم والسؤال عن أحوالهم\n• مساعدتهم عند الحاجة\n• الدعاء لهم\n\n**درجات الأقارب:**\nالأقرب أحق بالصلة: الوالدان، الأولاد، الإخوة، الأعمام والعمات، الأخوال والخالات.\n\n**من لا يُقابل الوصل بالوصل:**\nقال ﷺ: "ليس الواصل بالمكافئ، ولكن الواصل الذي إذا قطعت رحمه وصلها"` },
    en: { title: 'Maintaining Family Ties', shortDesc: 'The virtue of connecting with relatives', body: `Maintaining family ties (Silat Ar-Rahim) is among the greatest acts of worship. The Prophet ﷺ said: "Whoever wishes for his provision to be expanded and his life to be lengthened should maintain family ties."\n\n**What maintaining ties means:**\n• Visiting relatives with intention and action\n• Calling them and asking about their wellbeing\n• Helping them in times of need\n• Supplicating for them\n\n**Degrees of relatives:**\nThe closest have priority: parents, children, siblings, paternal and maternal aunts and uncles.\n\n**The true maintainer of ties:**\nThe Prophet ﷺ said: "The one who maintains ties is not the one who reciprocates, but the one who, when ties are severed by the other, reconnects them."` },
  },
  {
    id: 'akhlaq-4', categoryId: 'akhlaq', lessonNumber: 4,
    ar: { title: 'الصبر والشكر', shortDesc: 'أعلى درجات الإيمان العملي', body: `الصبر نصف الإيمان، والشكر نصفه الآخر.\n\n**الصبر ثلاثة أنواع:**\n١. الصبر على طاعة الله (الاستمرار في العبادة)\n٢. الصبر عن معصية الله (مقاومة الشهوات)\n٣. الصبر على أقدار الله المؤلمة (المصائب والأمراض)\n\nقال تعالى: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ"\n\n**الشكر:**\n• شكر الله بالقلب: الاعتراف بنعمه\n• شكر الله باللسان: قول "الحمد لله"\n• شكر الله بالجوارح: استخدام النعم في طاعته\n\nقال تعالى: "لَئِن شَكَرتُم لَأَزِيدَنَّكُم"` },
    en: { title: 'Patience and Gratitude', shortDesc: 'The highest practical degrees of faith', body: `Patience is half of faith, and gratitude is the other half.\n\n**Three types of patience:**\n1. Patience in obeying Allah (continuing in worship)\n2. Patience from disobeying Allah (resisting desires)\n3. Patience with Allah's painful decrees (trials, illness)\n\nAllah says: "Indeed, the patient will be given their reward without account."\n\n**Gratitude:**\n• Gratitude of the heart: acknowledging Allah's blessings\n• Gratitude of the tongue: saying "Alhamdulillah"\n• Gratitude of the limbs: using blessings in obedience to Him\n\nAllah says: "If you are grateful, I will surely increase you."` },
  },
  {
    id: 'akhlaq-5', categoryId: 'akhlaq', lessonNumber: 5,
    ar: { title: 'التواضع وذم الكبر', shortDesc: 'فضيلة التواضع وخطر الكبر', body: `قال النبي ﷺ: "ما نقص مال من صدقة، وما زاد الله عبداً بعفو إلا عزاً، وما تواضع أحد لله إلا رفعه"\n\n**التواضع:**\n• عدم الترفع على الناس\n• قبول النصيحة من الآخرين\n• عدم التباهي بالمال أو العلم أو النسب\n• إكرام الضعفاء والفقراء\n\n**الكبر:**\nقال ﷺ: "لا يدخل الجنة من كان في قلبه مثقال ذرة من كبر"\n\nالكبر هو: رد الحق والاستهانة بالناس. والتكبر على الناس من الكبائر.\n\n**فرق بين الكبر والعزة:**\nالعزة بالله محمودة، والذل للباطل مذموم.` },
    en: { title: 'Humility and the Danger of Arrogance', shortDesc: 'The virtue of humility and the danger of pride', body: `The Prophet ﷺ said: "Charity does not decrease wealth; Allah only increases a servant's honor by pardoning, and no one humbles himself for Allah except that Allah raises him."\n\n**Humility:**\n• Not looking down on others\n• Accepting advice from others\n• Not boasting about wealth, knowledge, or lineage\n• Honoring the weak and the poor\n\n**Arrogance (Kibr):**\nThe Prophet ﷺ said: "No one with even an atom of arrogance in their heart will enter Paradise."\n\nArrogance is: rejecting the truth and belittling people. Arrogance toward people is among the major sins.\n\n**Difference between arrogance and dignity:**\nHonor from Allah is praiseworthy; submitting to falsehood is blameworthy.` },
  },
  {
    id: 'akhlaq-6', categoryId: 'akhlaq', lessonNumber: 6,
    ar: { title: 'العفو والتسامح', shortDesc: 'فضل العفو وأثره في المجتمع', body: `العفو من أسمى الأخلاق. قال تعالى: "وَأَن تَعْفُوا أَقْرَبُ لِلتَّقْوَى" (البقرة: ٢٣٧)\n\n**فضل العفو:**\n• يرفع صاحبه عند الله\n• يجلب المحبة في القلوب\n• سبب لمغفرة الله\n\nقال ﷺ: "ما زاد الله عبداً بعفو إلا عزاً"\n\n**الفرق بين العفو والمداهنة:**\n• العفو: التجاوز عن الحق الشخصي مع وضوح الموقف\n• المداهنة: السكوت عن الباطل حيث يجب الإنكار\n\n**التسامح المحمود في الإسلام:**\n• التسامح في حقوق الشخصية\n• التسامح مع من أساء إليك\n• لكن لا تسامح في حدود الله وأحكامه` },
    en: { title: 'Forgiveness and Tolerance', shortDesc: 'The virtue of forgiving and its effect on society', body: `Forgiveness is among the noblest of characteristics. Allah says: "And to forgive is nearer to righteousness." (Quran 2:237)\n\n**Virtue of forgiveness:**\n• Raises one's status with Allah\n• Brings love into hearts\n• A reason for Allah's forgiveness\n\nThe Prophet ﷺ said: "Allah only increases a servant's honor through forgiveness."\n\n**Difference between forgiveness and compromise:**\n• Forgiveness: overlooking a personal right while being clear about one's position\n• Compromise (mudahanah): staying silent about wrong where one should speak out\n\n**Praiseworthy tolerance in Islam:**\n• Tolerance in personal rights\n• Tolerating those who have wronged you\n• But no tolerance for the limits and rulings of Allah` },
  },

  // ── SEERAH ─────────────────────────────────────────────────────────────────
  {
    id: 'seerah-1', categoryId: 'seerah', lessonNumber: 1,
    ar: { title: 'مولد النبي ﷺ وطفولته', shortDesc: 'ولادة النبي ونشأته الأولى', body: `وُلد النبي محمد ﷺ في مكة المكرمة في عام الفيل (٥٧٠م) في يوم الاثنين.\n\n**نسبه الشريف:** محمد بن عبدالله بن عبدالمطلب بن هاشم، من أشرف قبائل العرب (قريش).\n\n**يتمه المبكر:** توفي والده عبدالله قبل ولادته، وتوفيت أمه آمنة وهو في السادسة من عمره، فكفله جده عبدالمطلب ثم عمه أبو طالب.\n\n**رضاعته:** أرضعته حليمة السعدية، وشُق صدره في بادئ الأمر وهو في رعايتها.\n\n**طفولته:** نشأ في بيئة بدوية مع قبيلة بني سعد، ثم عاد إلى مكة. عُرف بالصدق والأمانة منذ صغره.` },
    en: { title: "The Prophet's Birth and Childhood", shortDesc: "The Prophet's birth and early upbringing", body: `The Prophet Muhammad ﷺ was born in Mecca in the Year of the Elephant (570 CE) on a Monday.\n\n**His noble lineage:** Muhammad ibn Abdullah ibn Abdul-Muttalib ibn Hashim, from the most noble tribe of the Arabs (Quraysh).\n\n**Early orphanhood:** His father Abdullah died before his birth, and his mother Aminah died when he was six, so his grandfather Abdul-Muttalib and then his uncle Abu Talib cared for him.\n\n**His nursing:** He was nursed by Halimah As-Sa'diyyah, and his chest was split open while under her care.\n\n**His childhood:** He grew up in the Bedouin environment with the tribe of Bani Sa'd, then returned to Mecca. He was known for his honesty and trustworthiness from a young age.` },
  },
  {
    id: 'seerah-2', categoryId: 'seerah', lessonNumber: 2,
    ar: { title: 'النبي قبل البعثة', shortDesc: 'حياة النبي قبل الوحي', body: `قبل البعثة، عاش النبي ﷺ حياة نقية طاهرة.\n\n**صفاته قبل البعثة:**\n• عُرف بـ"الصادق الأمين" بين قومه\n• كان يعمل في رعي الأغنام والتجارة\n• رحل إلى الشام مرتين في التجارة\n• تزوج من السيدة خديجة بنت خويلد وهو في الخامسة والعشرين\n\n**تحنثه في غار حراء:**\nكان يتعبد في غار حراء في جبل النور. وهناك نزل عليه الوحي وهو في الأربعين من عمره.\n\n**بناء الكعبة:**\nشارك في إعادة بناء الكعبة وحكّم في النزاع على وضع الحجر الأسود.` },
    en: { title: "The Prophet Before Prophethood", shortDesc: "The Prophet's life before revelation", body: `Before prophethood, the Prophet ﷺ lived a pure and righteous life.\n\n**His qualities before prophethood:**\n• Known as "The Truthful and Trustworthy" among his people\n• Worked as a shepherd and merchant\n• Traveled to Syria twice for trade\n• Married Khadijah bint Khuwaylid at the age of 25\n\n**His worship in the Cave of Hira:**\nHe used to worship in the Cave of Hira on Jabal An-Nur. There, revelation came to him at the age of 40.\n\n**Rebuilding the Kaaba:**\nHe participated in rebuilding the Kaaba and judged in the dispute over placing the Black Stone.` },
  },
  {
    id: 'seerah-3', categoryId: 'seerah', lessonNumber: 3,
    ar: { title: 'بدء الوحي والدعوة السرية', shortDesc: 'أول ما نزل وبداية الدعوة', body: `نزل الوحي على النبي ﷺ وهو في غار حراء. جاءه جبريل وضمه ثلاث مرات، ثم قال:\n"اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" (العلق: ١)\n\n**أول من أسلم:**\n• من النساء: السيدة خديجة رضي الله عنها\n• من الرجال الأحرار: أبو بكر الصديق\n• من الصبيان: علي بن أبي طالب\n• من الموالي: زيد بن حارثة\n\n**الدعوة السرية (٣ سنوات):**\nكانت الدعوة في البداية سرية، تتم في دار الأرقم. جاهر النبي ﷺ بالإسلام بعد ثلاث سنوات بأمر ربه.` },
    en: { title: 'The Start of Revelation and Secret Dawah', shortDesc: 'The first revelation and beginning of the call', body: `Revelation descended upon the Prophet ﷺ while he was in the Cave of Hira. Jibril came and embraced him three times, then said:\n"Read in the name of your Lord who created." (Quran 96:1)\n\n**The first to embrace Islam:**\n• Among women: Lady Khadijah (may Allah be pleased with her)\n• Among free men: Abu Bakr As-Siddiq\n• Among youths: Ali ibn Abi Talib\n• Among freed slaves: Zayd ibn Harithah\n\n**The secret dawah (3 years):**\nThe call to Islam was initially secret, taking place in the House of Al-Arqam. The Prophet ﷺ proclaimed Islam publicly after three years by the command of his Lord.` },
  },
  {
    id: 'seerah-4', categoryId: 'seerah', lessonNumber: 4,
    ar: { title: 'الهجرة إلى المدينة', shortDesc: 'أعظم حدث في السيرة النبوية', body: `الهجرة كانت في السنة الثالثة عشرة من البعثة (٦٢٢م).\n\n**أسبابها:**\n• اشتداد أذى قريش للمسلمين\n• بيعة العقبة الثانية مع الأنصار\n• إذن الله للنبي ﷺ بالهجرة\n\n**الهجرة:**\nخرج النبي ﷺ مع أبي بكر ليلاً، واختبآ في غار ثور ثلاثة أيام. ثم انطلقا إلى المدينة. وصلا إلى قباء فبنى المسجد الأول، ثم دخل المدينة.\n\n**آثارها:**\n• بداية التقويم الهجري\n• بناء المجتمع الإسلامي في المدينة\n• بناء مسجد النبي ﷺ\n• المؤاخاة بين المهاجرين والأنصار` },
    en: { title: "The Hijra (Migration to Medina)", shortDesc: 'The greatest event in the Prophetic biography', body: `The Hijra took place in the thirteenth year of prophethood (622 CE).\n\n**Causes:**\n• Intensifying persecution of Muslims by Quraysh\n• The Second Pledge of Aqabah with the Ansar\n• Allah's permission for the Prophet ﷺ to migrate\n\n**The migration:**\nThe Prophet ﷺ left with Abu Bakr at night and hid in the Cave of Thawr for three days. They then set out to Medina. They arrived at Quba where he built the first mosque, then entered Medina.\n\n**Its impacts:**\n• Beginning of the Hijri calendar\n• Establishment of the Islamic community in Medina\n• Building the Prophet's Mosque ﷺ\n• Brotherhood between the Muhajirun (migrants) and Ansar (helpers)` },
  },
  {
    id: 'seerah-5', categoryId: 'seerah', lessonNumber: 5,
    ar: { title: 'غزوة بدر الكبرى', shortDesc: 'أول نصر للإسلام في المعارك', body: `غزوة بدر في السنة الثانية للهجرة (٦٢٤م). أول معركة كبرى بين المسلمين وقريش.\n\n**أرقام:**\n• المسلمون: ٣١٣ رجل\n• قريش: ~١٠٠٠ مقاتل\n\n**نتيجة المعركة:**\nانتصر المسلمون نصراً ساحقاً بنصر الله ومدد الملائكة.\n\n**أهميتها:**\nقال تعالى: "وَلَقَدْ نَصَرَكُمُ اللَّهُ بِبَدْرٍ وَأَنتُمْ أَذِلَّةٌ"\nسمى الله هذا اليوم يوم الفرقان (يوم الفصل بين الحق والباطل).\n\n**الدروس المستفادة:**\n• النصر من عند الله لا بالأعداد\n• الاستعداد الجيد مطلوب\n• الثقة بوعد الله` },
    en: { title: "The Battle of Badr", shortDesc: "Islam's first great military victory", body: `The Battle of Badr occurred in the second year of Hijra (624 CE), the first major battle between Muslims and Quraysh.\n\n**Numbers:**\n• Muslims: 313 men\n• Quraysh: ~1,000 fighters\n\n**Result:**\nThe Muslims achieved a decisive victory through Allah's help and the support of angels.\n\n**Its significance:**\nAllah says: "And Allah had already given you victory at Badr while you were few in number."\nAllah named this day Yawm Al-Furqan (the day of distinction between truth and falsehood).\n\n**Lessons:**\n• Victory comes from Allah, not from numbers\n• Good preparation is required\n• Trust in Allah's promise` },
  },
  {
    id: 'seerah-6', categoryId: 'seerah', lessonNumber: 6,
    ar: { title: 'فتح مكة المكرمة', shortDesc: 'يوم النصر الأعظم في السيرة', body: `فتح مكة في السنة الثامنة للهجرة (٦٣٠م). أعظم انتصار في سيرة النبي ﷺ.\n\n**أسبابه:** نقض قريش لصلح الحديبية.\n\n**الجيش:** ١٠٫٠٠٠ مقاتل دخلوا مكة دون قتال يُذكر.\n\n**موقف النبي ﷺ:**\nدخل مكة خاضعاً متواضعاً شاكراً لله. جمع أهل مكة وقال لهم: "ما تظنون أني فاعل بكم؟" قالوا: خيراً. فقال ﷺ: "اذهبوا فأنتم الطلقاء." عفا عن أعدائه عفواً شاملاً.\n\n**النتائج:**\n• تطهير الكعبة من الأصنام\n• إسلام أهل مكة جماعات\n• توطيد الدولة الإسلامية` },
    en: { title: "The Conquest of Mecca", shortDesc: "The greatest victory in the Prophetic biography", body: `The conquest of Mecca occurred in the eighth year of Hijra (630 CE), the greatest victory in the Prophet's biography ﷺ.\n\n**Causes:** Quraysh's violation of the Treaty of Hudaybiyyah.\n\n**The army:** 10,000 fighters entered Mecca with almost no fighting.\n\n**The Prophet's stance ﷺ:**\nHe entered Mecca humbly, grateful to Allah. He gathered the people of Mecca and asked: "What do you think I will do with you?" They said: "Good." He ﷺ said: "Go, for you are free." He granted general amnesty to his enemies.\n\n**Outcomes:**\n• Purifying the Kaaba of idols\n• The people of Mecca embracing Islam in groups\n• Consolidating the Islamic state` },
  },
  {
    id: 'seerah-7', categoryId: 'seerah', lessonNumber: 7,
    ar: { title: 'وفاة النبي ﷺ', shortDesc: 'آخر أيام حياة الرسول ﷺ', body: `توفي النبي ﷺ في ١٢ ربيع الأول سنة ١١هـ (٦٣٢م) في المدينة المنورة، في بيت السيدة عائشة رضي الله عنها.\n\n**آخر خطبه:**\nفي حجة الوداع قال: "إني تارك فيكم ما إن تمسكتم به لن تضلوا بعدي: كتاب الله وسنتي."\n\n**لحظة الوفاة:**\nرفع يده إلى السماء وقال: "اللهم الرفيق الأعلى"\n\n**خلافة أبي بكر الصديق:**\nبعد وفاته، قام أبو بكر رضي الله عنه وقال كلماته الشهيرة:\n"من كان يعبد محمداً فإن محمداً قد مات، ومن كان يعبد الله فإن الله حي لا يموت."` },
    en: { title: "The Death of the Prophet ﷺ", shortDesc: "The final days in the life of the Messenger ﷺ", body: `The Prophet ﷺ passed away on the 12th of Rabi al-Awwal, 11 AH (632 CE) in Medina, in the house of Aisha (may Allah be pleased with her).\n\n**His final sermon:**\nIn the Farewell Pilgrimage he said: "I am leaving among you that which, if you hold fast to it, you will never go astray: the Book of Allah and my Sunnah."\n\n**The moment of death:**\nHe raised his hand toward the sky and said: "O Allah, to the Highest Companion (in Paradise)."\n\n**Abu Bakr's leadership:**\nAfter his passing, Abu Bakr (may Allah be pleased with him) stood and said his famous words:\n"Whoever used to worship Muhammad, then Muhammad has died. Whoever used to worship Allah, then Allah is alive and does not die."` },
  },
  {
    id: 'seerah-8', categoryId: 'seerah', lessonNumber: 8,
    ar: { title: 'الخلفاء الراشدون', shortDesc: 'قادة الإسلام بعد النبي ﷺ', body: `الخلفاء الراشدون أربعة خلفوا النبي ﷺ في قيادة الأمة:\n\n**١. أبو بكر الصديق (١١-١٣هـ)**\nأقرب صاحب للنبي ﷺ. جمع القرآن. حارب المرتدين. فتح العراق والشام.\n\n**٢. عمر بن الخطاب (١٣-٢٣هـ)**\nبنى الدولة الإسلامية الكبرى. فتح الشام ومصر وفارس. أسس الديوان والتقويم الهجري.\n\n**٣. عثمان بن عفان (٢٣-٣٥هـ)**\nجمع القرآن في مصحف موحد. فتح أفريقيا وأجزاء من إيران وآسيا الوسطى.\n\n**٤. علي بن أبي طالب (٣٥-٤٠هـ)**\nابن عم النبي ﷺ وختنه. عُرف بالشجاعة والعلم والزهد.` },
    en: { title: "The Rightly-Guided Caliphs", shortDesc: "The leaders of Islam after the Prophet ﷺ", body: `The four Rightly-Guided Caliphs succeeded the Prophet ﷺ in leading the Muslim community:\n\n**1. Abu Bakr As-Siddiq (11-13 AH)**\nThe Prophet's closest companion ﷺ. Compiled the Quran. Fought the apostates. Opened Iraq and Syria.\n\n**2. Umar ibn Al-Khattab (13-23 AH)**\nBuilt the great Islamic state. Opened Syria, Egypt, and Persia. Established the diwan and the Hijri calendar.\n\n**3. Uthman ibn Affan (23-35 AH)**\nCompiled the Quran into a unified Mushaf. Opened North Africa and parts of Iran and Central Asia.\n\n**4. Ali ibn Abi Talib (35-40 AH)**\nThe Prophet's cousin and son-in-law ﷺ. Known for courage, knowledge, and asceticism.` },
  },

  // ── PROPHETS ───────────────────────────────────────────────────────────────
  {
    id: 'prophets-1', categoryId: 'prophets', lessonNumber: 1,
    ar: { title: 'آدم أبو البشر', shortDesc: 'قصة أول إنسان على الأرض', body: `آدم عليه السلام هو أول البشر وأول الأنبياء.\n\nخلقه الله من تراب ونفخ فيه من روحه. وعلّمه الأسماء كلها. وأسجد له الملائكة، فسجدوا إلا إبليس استكبر.\n\n**القصة:**\nأسكن الله آدم وزوجته حواء الجنة، ونهاهما عن شجرة واحدة. فوسوس لهما الشيطان فأكلا منها فأُهبطا إلى الأرض.\n\nتاب آدم إلى ربه: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ"\n\n**الدروس:**\n• الخطأ طبيعة البشر، والتوبة سبيل النجاة\n• عداوة الشيطان للإنسان أبدية` },
    en: { title: 'Adam, the Father of Humanity', shortDesc: 'The story of the first human on Earth', body: `Adam (peace be upon him) is the first human and the first prophet.\n\nAllah created him from clay and breathed His spirit into him. He taught him all the names. He commanded the angels to prostrate to him, and they all did except Iblis, who refused out of arrogance.\n\n**The story:**\nAllah settled Adam and his wife Hawwa (Eve) in Paradise and forbade them from one tree. Shaytan whispered to them and they ate from it, so they were sent down to Earth.\n\nAdam repented to his Lord: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers."\n\n**Lessons:**\n• Making mistakes is human nature; repentance is the path to salvation\n• Shaytan's enmity toward humanity is eternal` },
  },
  {
    id: 'prophets-2', categoryId: 'prophets', lessonNumber: 2,
    ar: { title: 'نوح والطوفان العظيم', shortDesc: 'قصة نوح ومعجزة الفلك', body: `نوح عليه السلام هو ثاني الأنبياء وأحد أولي العزم.\n\nدعا قومه إلى التوحيد ٩٥٠ سنة فما آمن معه إلا قليل.\n\n**أمر الله له:**\nأوحى الله إليه ببناء سفينة عظيمة. فبناها وحمل فيها من كل زوجين اثنين والمؤمنين.\n\n**الطوفان:**\nفتح الله أبواب السماء بمطر غزير وفجّر ينابيع الأرض. غرق جميع الكافرين حتى ابن نوح الذي أبى أن يركب.\n\n**الاستواء على الجودي:**\nاستوت السفينة على جبل الجودي. وقال الله: "يَا نُوحُ اهْبِطْ بِسَلَامٍ مِنَّا وَبَرَكَاتٍ"\n\n**الدرس:** الإيمان بالله ينجي ولو كان الكافر من الأهل.` },
    en: { title: "Noah and the Great Flood", shortDesc: "The story of Noah and the miracle of the Ark", body: `Noah (peace be upon him) is the second prophet and one of the five Messengers of Resolve.\n\nHe called his people to Tawheed for 950 years, yet only a few believed.\n\n**Allah's command:**\nAllah revealed to him to build a great ship. He built it and loaded it with pairs of every creature and the believers.\n\n**The flood:**\nAllah opened the gates of the sky with torrential rain and caused springs to gush from the earth. All the disbelievers drowned, even Noah's own son who refused to board.\n\n**Settling on Al-Judi:**\nThe ship came to rest on Mount Al-Judi. Allah said: "O Noah, descend with peace from Us and blessings."\n\n**Lesson:** Faith in Allah saves — even if the disbeliever is one's own family.` },
  },
  {
    id: 'prophets-3', categoryId: 'prophets', lessonNumber: 3,
    ar: { title: 'إبراهيم خليل الله', shortDesc: 'أبو الأنبياء وبناء الكعبة', body: `إبراهيم عليه السلام خليل الله وأبو الأنبياء.\n\n**من قصته:**\n• حطّم أصنام قومه وناظر نمرود\n• أُلقي في النار فكانت برداً وسلاماً\n• أُمر بذبح ابنه إسماعيل فصبر وامتثل فُدي بكبش\n• بنى الكعبة المشرفة مع ابنه إسماعيل\n\n**ملة إبراهيم:**\nقال تعالى: "وَمَن يَرْغَبُ عَن مِّلَّةِ إِبْرَاهِيمَ إِلَّا مَن سَفِهَ نَفْسَهُ"\n\nالإسلام هو ملة إبراهيم: التوحيد الخالص لله وحده.\n\n**دعاؤه لمكة:**\n"رَبِّ اجْعَلْ هَٰذَا بَلَدًا آمِنًا وَارْزُقْ أَهْلَهُ مِنَ الثَّمَرَاتِ"` },
    en: { title: "Ibrahim, the Friend of Allah", shortDesc: "The father of the prophets and builder of the Kaaba", body: `Ibrahim (peace be upon him) is the Friend of Allah (Khalilullah) and father of the prophets.\n\n**From his story:**\n• He smashed his people's idols and debated King Nimrod\n• Was thrown into a fire, and it became cool and peaceful for him\n• Was commanded to sacrifice his son Ismail; he obeyed patiently, and a ram was given as ransom\n• Built the Kaaba with his son Ismail\n\n**The way of Ibrahim:**\nAllah says: "And who would turn away from the religion of Ibrahim except one who makes a fool of himself?"\n\nIslam is the way of Ibrahim: pure Tawheed for Allah alone.\n\n**His supplication for Mecca:**\n"My Lord, make this a secure city and provide its people with fruits."` },
  },
  {
    id: 'prophets-4', categoryId: 'prophets', lessonNumber: 4,
    ar: { title: 'يوسف وقصة الصبر والإخلاص', shortDesc: 'أحسن القصص في القرآن الكريم', body: `سورة يوسف سمّاها الله "أَحْسَنَ الْقَصَصِ".\n\n**القصة:**\nيوسف عليه السلام رأى في منامه أن أحد عشر كوكباً والشمس والقمر ساجدون له. حسده إخوته فألقوه في بئر وباعوه إلى مصر. اشتراه عزيز مصر، فراودته امرأة العزيز عن نفسه فاستعصم. سُجن ظلماً.\n\n**في السجن:**\nعلّم معه رجلين تأويل الأحلام. أُخرج من السجن بعد سنوات بتفسيره لرؤيا الملك.\n\n**في مصر:**\nأصبح وزيراً لمصر. في المجاعة جاء إخوته فعرفهم وعفا عنهم.\n\n**الدرس:** الصبر والإخلاص والعفو طريق النصر.` },
    en: { title: "Yusuf and the Story of Patience and Sincerity", shortDesc: "The best of stories in the Holy Quran", body: `Surah Yusuf was named by Allah "the best of stories."\n\n**The story:**\nYusuf (peace be upon him) dreamed that eleven stars, the sun, and the moon were prostrating to him. His brothers became jealous, threw him in a well, and sold him in Egypt. The governor of Egypt bought him; the governor's wife attempted to seduce him but he remained steadfast. He was unjustly imprisoned.\n\n**In prison:**\nHe interpreted the dreams of two men. Years later, he was released after interpreting the king's dream.\n\n**In Egypt:**\nHe became the minister of Egypt. During a famine, his brothers came to him; he recognized them and forgave them.\n\n**Lesson:** Patience, sincerity, and forgiveness are the path to victory.` },
  },
  {
    id: 'prophets-5', categoryId: 'prophets', lessonNumber: 5,
    ar: { title: 'موسى ورسالته إلى فرعون', shortDesc: 'قصة كليم الله ونجاة بني إسرائيل', body: `موسى عليه السلام كليم الله، بعثه إلى فرعون وملئه.\n\n**من قصته:**\n• وُلد في زمن كان فرعون يذبح أبناء بني إسرائيل. وضعته أمه في صندوق في النيل فالتقطه آل فرعون.\n• كلّمه الله في الوادي المقدس طوى وأرسله إلى فرعون.\n• أجرى الله على يده المعجزات الكبرى: العصا والتسع آيات.\n• أغرق الله فرعون وجنده في البحر بعد عبور بني إسرائيل.\n• أُنزل عليه التوراة في الطور.\n\n**الدرس:** لا يُغلب من نصره الله، وفرعون مهما بلغ من الجبروت فهو ذليل أمام أمر الله.` },
    en: { title: "Musa and His Mission to Pharaoh", shortDesc: "The story of Allah's interlocutor and the salvation of the Israelites", body: `Musa (peace be upon him) is the one who spoke directly to Allah, sent to Pharaoh and his court.\n\n**From his story:**\n• Born when Pharaoh was slaughtering the sons of the Israelites. His mother placed him in a basket in the Nile, and Pharaoh's household took him in.\n• Allah spoke to him in the sacred valley of Tuwa and sent him to Pharaoh.\n• Allah performed great miracles through him: the staff and the nine signs.\n• Allah drowned Pharaoh and his army in the sea after the Israelites crossed.\n• The Torah was revealed to him on Mount Sinai.\n\n**Lesson:** Whoever Allah supports cannot be defeated; Pharaoh, no matter how great his tyranny, is humbled before Allah's command.` },
  },
  {
    id: 'prophets-6', categoryId: 'prophets', lessonNumber: 6,
    ar: { title: 'عيسى روح الله ومعجزاته', shortDesc: 'قصة المسيح عيسى ابن مريم', body: `عيسى عليه السلام روح الله وكلمته، وُلد من أم بلا أب بمعجزة ربانية.\n\n**ولادته:**\nقالت مريم: "رَبِّ أَنَّى يَكُونُ لِي وَلَدٌ وَلَمْ يَمْسَسْنِي بَشَرٌ" قال الله: "كَذَٰلِكِ اللَّهُ يَخْلُقُ مَا يَشَاءُ"\n\n**معجزاته:**\n• تكلّم في المهد طفلاً\n• أبرأ الأكمه والأبرص\n• أحيا الموتى بإذن الله\n• خلق من الطين طيراً بإذن الله\n\n**حقيقته في الإسلام:**\nعبد الله ورسوله، ليس ابن الله. رفعه الله حياً وسينزل قرب الساعة.\n\n**الدجال:**\nسينزل عيسى عليه السلام ليقتل الدجال ويكسر الصليب ويُقرر أن الإسلام هو دين الحق.` },
    en: { title: "Isa (Jesus), the Spirit of Allah, and His Miracles", shortDesc: "The story of al-Masih Isa ibn Maryam", body: `Isa (peace be upon him) is the spirit of Allah and His word, born from a mother without a father by a divine miracle.\n\n**His birth:**\nMaryam said: "My Lord, how can I have a child when no man has touched me?" Allah said: "Such is Allah; He creates what He wills."\n\n**His miracles:**\n• Spoke in the cradle as an infant\n• Healed the blind and the leper\n• Raised the dead by Allah's permission\n• Created a bird from clay by Allah's permission\n\n**His reality in Islam:**\nHe is a servant and messenger of Allah — not the son of God. Allah raised him alive, and he will descend near the Day of Judgment.\n\n**The Dajjal:**\nIsa (peace be upon him) will descend to kill the Dajjal (Antichrist), break the cross, and affirm that Islam is the true religion.` },
  },
  {
    id: 'prophets-7', categoryId: 'prophets', lessonNumber: 7,
    ar: { title: 'سليمان وملكه العظيم', shortDesc: 'قصة النبي الملك الذي ملك الإنس والجن', body: `سليمان عليه السلام نبي وملك أعطاه الله ملكاً لم يُعطه أحداً من قبل.\n\n**نعم الله عليه:**\n• علّمه منطق الطير\n• سخّر له الجن والشياطين والريح\n• أُعطي قدرة الكلام مع النمل\n\n**من قصته:**\nرسل إلى ملكة سبأ (بلقيس) يدعوها للإسلام. فجاءت فأسلمت.\n\n**دعاؤه:**\n"رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ"\n\n**الدرس:** الملك والثروة نعمة عظيمة إن استُخدمت في طاعة الله.` },
    en: { title: "Sulaiman and His Great Kingdom", shortDesc: "The story of the prophet-king who ruled jinn and mankind", body: `Sulaiman (peace be upon him) was a prophet and king whom Allah gave a dominion He had not given to anyone before.\n\n**Allah's blessings upon him:**\n• Taught the language of birds\n• Had jinn, devils, and the wind subjugated to him\n• Given the ability to speak with ants\n\n**From his story:**\nHe sent a letter to the Queen of Sheba (Bilqis) inviting her to Islam. She came and accepted Islam.\n\n**His supplication:**\n"My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents, and to do righteousness of which You approve."\n\n**Lesson:** Wealth and power are great blessings when used in obedience to Allah.` },
  },
  {
    id: 'prophets-8', categoryId: 'prophets', lessonNumber: 8,
    ar: { title: 'أيوب وصبره العظيم', shortDesc: 'قصة الصبر على البلاء', body: `أيوب عليه السلام ضرب به المثل في الصبر على البلاء.\n\n**قصته:**\nابتلاه الله بالمرض الشديد وفقدان المال والأهل لسنوات طويلة. لم يتركه أحد إلا زوجته الوفية.\n\n**صبره:**\nلم يتذمر من ربه، بل كان يذكر الله ويشكره.\n\n**دعاؤه:**\n"أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ"\n\n**الفرج:**\nاستجاب الله دعاءه وكشف ضره وردّ عليه أهله ومثلهم معهم.\n\n**الدرس:**\n• الصبر على البلاء يرفع الدرجات\n• الدعاء سلاح المؤمن في الشدة\n• بعد الضيق فرج وأي فرج\n\nقال ﷺ: "إن عظم الجزاء مع عظم البلاء"` },
    en: { title: "Ayyub (Job) and His Immense Patience", shortDesc: "The story of patience in the face of trials", body: `Ayyub (peace be upon him) is the epitome of patience in the face of calamity.\n\n**His story:**\nAllah tested him with severe illness, loss of wealth, and family for many long years. Everyone left him except his faithful wife.\n\n**His patience:**\nHe never complained against his Lord; instead, he continued to remember and thank Allah.\n\n**His supplication:**\n"Indeed, adversity has touched me, and You are the Most Merciful of the merciful."\n\n**The relief:**\nAllah answered his supplication, removed his hardship, and restored his family and doubled them.\n\n**Lessons:**\n• Patience during trials elevates one's rank with Allah\n• Supplication is the believer's weapon in hardship\n• After difficulty comes ease, and what ease it is!\n\nThe Prophet ﷺ said: "Indeed, the greatness of the reward comes with the greatness of the trial."` },
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function getCategoryById(id: string): LessonCategory | undefined {
  return LEARN_CATEGORIES.find(c => c.id === id);
}

export function getLessonsForCategory(categoryId: string): Lesson[] {
  return ALL_LESSONS.filter(l => l.categoryId === categoryId)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return ALL_LESSONS.find(l => l.id === lessonId);
}

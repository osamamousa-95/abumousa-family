/**
 * Scripture on kinship, and the site's message to the reader.
 * Hadith are given with their collector so the reader can verify.
 */

export interface Scripture {
  id: string;
  text: string;
  attribution: { ar: string; en: string };
  gloss: { ar: string; en: string };
  kind: 'quran' | 'hadith';
}

export const SCRIPTURE: Scripture[] = [
  {
    id: 'hujurat-13',
    kind: 'quran',
    text: '﴿يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ﴾',
    attribution: { ar: 'سورة الحجرات، الآية ١٣', en: 'Surat al-Hujurat, 49:13' },
    gloss: {
      ar: 'جُعلت الشعوب والقبائل ليعرف الناس بعضهم بعضاً، لا ليتفاضلوا. فحفظ النسب وسيلةٌ للتعارف والصلة، والكرم عند الله بالتقوى وحدها.',
      en: 'Peoples and tribes exist so that people may know one another, not so they may rank one another. Preserving lineage is a means to that knowing; honour before God rests on piety alone.',
    },
  },
  {
    id: 'nisa-1',
    kind: 'quran',
    text: '﴿وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ ۚ إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا﴾',
    attribution: { ar: 'سورة النساء، الآية ١', en: 'Surat al-Nisa, 4:1' },
    gloss: {
      ar: 'قُرنت تقوى الله بصلة الأرحام في آية واحدة، فدلّ ذلك على عظم شأنها.',
      en: 'Mindfulness of God and the ties of kinship are joined in a single verse — a sign of how weighty those ties are.',
    },
  },
  {
    id: 'anfal-75',
    kind: 'quran',
    text: '﴿وَأُولُو الْأَرْحَامِ بَعْضُهُمْ أَوْلَىٰ بِبَعْضٍ فِي كِتَابِ اللَّهِ﴾',
    attribution: { ar: 'سورة الأنفال، الآية ٧٥', en: 'Surat al-Anfal, 8:75' },
    gloss: {
      ar: 'ذوو القرابة أحقّ بعضهم ببعض في البرّ والنصرة والصلة.',
      en: 'Those bound by kinship have the first claim upon one another in kindness, support and connection.',
    },
  },
  {
    id: 'learn-lineage',
    kind: 'hadith',
    text: '«تَعَلَّمُوا مِن أَنسَابِكُم مَا تَصِلُونَ بِهِ أَرحَامَكُم، فَإِنَّ صِلَةَ الرَّحِمِ مَحَبَّةٌ فِي الأَهلِ، مَثرَاةٌ فِي المَالِ، مَنسَأَةٌ فِي الأَثَرِ»',
    attribution: { ar: 'رواه الترمذي، وحسّنه', en: 'Related by al-Tirmidhi, graded hasan' },
    gloss: {
      ar: 'هذا الحديث هو أصل هذا الموقع كله: أن تعلّم النسب ليس غايةً في ذاته، بل وسيلةٌ إلى صلة الرحم. فمن عرف قريبه وصله.',
      en: 'This hadith is the foundation of the entire site: learning lineage is not an end in itself but a means to maintaining kinship. One who knows a relative can reach them.',
    },
  },
  {
    id: 'rizq-athar',
    kind: 'hadith',
    text: '«مَن سَرَّهُ أَن يُبسَطَ لَهُ فِي رِزقِهِ، وَيُنسَأَ لَهُ فِي أَثَرِهِ، فَليَصِل رَحِمَهُ»',
    attribution: { ar: 'متفق عليه — رواه البخاري ومسلم', en: 'Agreed upon — al-Bukhari and Muslim' },
    gloss: {
      ar: 'وُعد واصلُ الرحم ببركةٍ في رزقه وأثرٍ يبقى بعده. وأيّ أثرٍ أبقى من اسمٍ محفوظ يقرؤه من بعدك؟',
      en: 'One who maintains kinship is promised blessing in provision and a legacy that outlasts them. And what legacy endures longer than a name preserved for those who come after?',
    },
  },
  {
    id: 'rahim-arsh',
    kind: 'hadith',
    text: '«الرَّحِمُ مُعَلَّقَةٌ بِالعَرشِ تَقُولُ: مَن وَصَلَنِي وَصَلَهُ اللهُ، وَمَن قَطَعَنِي قَطَعَهُ اللهُ»',
    attribution: { ar: 'متفق عليه — رواه البخاري ومسلم', en: 'Agreed upon — al-Bukhari and Muslim' },
    gloss: {
      ar: 'الرحم أمانةٌ معلّقة، من حفظها حُفظ، ومن أهملها ضاع منه ما هو أكبر.',
      en: 'Kinship is a trust held aloft: whoever keeps it is kept, and whoever neglects it loses something greater.',
    },
  },
];

/** The epigraph shown to every visitor. */
export const READER_MESSAGE = {
  ar: 'عائلةٌ حُملت في الرِّحال ثلاث مرات، فما سقط منها اسم. فاحفَظ ما بين يديك، فإنّ من بعدك سيسألك عنه.',
  en: 'A family carried on the move three times, and not one name was lost. Keep what is in your hands — those who come after will ask you for it.',
};

/**
 * The creator's shareable content — one source, read by both /about (as a
 * short block after the family content) and by his own person page (as a
 * fuller card). Keeping it in one place means the two never drift apart.
 *
 * Biography and birth date live in the database like any other family member
 * — see data/tree.json and prisma/seed.ts — because those are genuinely
 * generic Person fields. Only what has no equivalent in the genealogy schema
 * (vision, a message to the reader, interests, social links) lives here.
 */

// Must match the slug produced by personSlug('أسامة', '1.1.1.1.1.2.1.2.3').
// If the tree is reordered again, this constant needs updating to match.
export const CREATOR_SLUG = 'osama-1-1-1-1-1-2-1-2-3';

export const CREATOR = {
  name: { ar: 'أسامة وحيد سلمان أبو موسى', en: 'Osama Waheed Salman Abu Mousa' },
  generationLabel: {
    ar: 'الجيل التاسع من زين الدين الحربي',
    en: 'Ninth generation from Zain al-Din al-Harbi',
  },
  location: { ar: 'عمّان، الأردن', en: 'Amman, Jordan' },
  maritalStatus: { ar: 'متزوّج', en: 'Married' },
  fields: { ar: 'هندسة البرمجيات', en: 'Software engineering' },
  fieldsSecondary: { ar: 'خلفية دراسية في الهندسة المعمارية', en: 'Academic background in architecture' },
  interests: [
    { ar: 'الفلك', en: 'Astronomy' },
    { ar: 'العلوم', en: 'Science' },
    { ar: 'التكنولوجيا', en: 'Technology' },
  ],
  vision: {
    ar: 'أن يكبر هذا السجلّ بمشاركة كل فرد من العائلة، حتى يصبح مرجعاً حيّاً يُورَّث كما يُورَّث الاسم والأرض — لا عملاً يقف عند مئتين وسبعين اسماً، بل بداية.',
    en: 'That this record grows through the participation of every member of the family, until it becomes a living reference passed down like a name or a piece of land — not a project that stops at two hundred and seventy names, but a beginning.',
  },
  message: {
    ar: 'إن وجدت اسماً ناقصاً، أو خطأً، أو خبراً عن أحد أفراد العائلة — فراسلني. هذا السجلّ لكم جميعاً، لا لي وحدي، ولن يكتمل إلا بكم.',
    en: 'If you find a missing name, an error, or a story about a family member — write to me. This record belongs to all of you, not to me alone, and it will not be complete without you.',
  },
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/share/18JSABoTJ9/' },
    { label: 'Instagram', href: 'https://www.instagram.com/osamamousa204/' },
  ],
};

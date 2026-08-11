/**
 * Arabic → Latin transliteration for URLs and English search.
 *
 * Arabic slugs percent-encode into unreadable URLs that look broken when
 * shared. ASCII slugs stay readable in WhatsApp, in search results, and in
 * the address bar.
 */

const MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ٱ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 'a', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ئ': 'y',
  'ؤ': 'w', 'ء': '', 'ٰ': 'a',
};

/** Common names get a proper spelling rather than a mechanical one. */
const KNOWN: Record<string, string> = {
  'محمد': 'muhammad', 'أحمد': 'ahmad', 'احمد': 'ahmad',
  'عبد الله': 'abdullah', 'عبدالله': 'abdullah',
  'عبد الرحمن': 'abd-al-rahman', 'عبدالرحمن': 'abd-al-rahman',
  'عبد العاطي': 'abd-al-ati', 'عبدالعاطي': 'abd-al-ati',
  'عبد النبي': 'abd-al-nabi', 'عبدالنبي': 'abd-al-nabi',
  'عبد الكريم': 'abd-al-karim', 'عبد السلام': 'abd-al-salam',
  'زين الدين': 'zain-al-din', 'عز الدين': 'izz-al-din',
  'موسى': 'mousa', 'مسلم': 'muslim', 'سالم': 'salem', 'سلامة': 'salama',
  'سلمان': 'salman', 'سليمان': 'sulaiman', 'إبراهيم': 'ibrahim',
  'إسماعيل': 'ismail', 'اسماعيل': 'ismail', 'حسين': 'hussein',
  'حسن': 'hassan', 'حسان': 'hassan', 'خليل': 'khalil', 'فاطمة': 'fatima',
  'عائشة': 'aisha', 'مريم': 'maryam', 'أسامة': 'osama', 'وحيد': 'waheed',
  'وليد': 'walid', 'عمر': 'omar', 'يوسف': 'yusuf', 'يحيى': 'yahya',
  'خالد': 'khaled', 'سعاد': 'suad', 'نورهان': 'nourhan', 'راوية': 'rawya',
};

export function transliterate(input: string): string {
  const trimmed = input.trim();
  if (KNOWN[trimmed]) return KNOWN[trimmed];

  return trimmed
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // diacritics + tatweel
    .split('')
    .map((ch) => (MAP[ch] !== undefined ? MAP[ch] : /\s/.test(ch) ? '-' : ''))
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/** Readable ASCII slug; `path` guarantees uniqueness across repeated names. */
export function personSlug(name: string, path: string): string {
  const base = transliterate(name) || 'person';
  return `${base}-${path.replace(/\./g, '-')}`;
}

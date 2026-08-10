/**
 * Arabic text utilities.
 *
 * Naive LIKE queries fail on Arabic because the same name is written many ways:
 * أحمد / احمد, فاطمة / فاطمه, and diacritics may or may not be present.
 * Every searchable name is stored twice — as written, and normalised.
 */

const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g; // tashkeel + tatweel

export function normalizeArabic(input: string): string {
  return input
    .replace(DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function normalizeLatin(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['`’\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Arabic-Indic numerals in the ar locale, Western in en. */
export function formatNumber(value: number | string, locale: string): string {
  const s = String(value);
  if (locale !== 'ar') return s;
  return s.replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}

/** URL-safe slug that keeps Arabic letters readable. */
export function slugify(input: string): string {
  return input
    .replace(DIACRITICS, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

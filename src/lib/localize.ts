/**
 * Translatable database fields are stored as { ar, en }.
 * Everything reads them through here so the fallback rule lives in one place.
 */

export type Locale = 'ar' | 'en';
export type Localized = { ar: string; en?: string | null };

export interface LocalizedResult {
  value: string;
  /** True when we fell back to Arabic because no translation exists. */
  isFallback: boolean;
}

export function localize(
  field: unknown,
  locale: Locale
): LocalizedResult {
  if (!field || typeof field !== 'object') {
    return { value: '', isFallback: false };
  }
  const f = field as Localized;
  const wanted = locale === 'en' ? f.en : f.ar;
  if (wanted && wanted.trim()) return { value: wanted, isFallback: false };
  return { value: f.ar ?? '', isFallback: locale === 'en' };
}

/** Shorthand when the fallback flag is not needed. */
export function t(field: unknown, locale: Locale): string {
  return localize(field, locale).value;
}

/**
 * Historical dates are rarely exact. The notebook says "نحو ١٨١٢م" or gives
 * no date at all. Storing a single DateTime destroys that information, so we
 * keep display text plus a bounded range for sorting.
 */

export type DatePrecision =
  | 'EXACT' | 'CIRCA' | 'BEFORE' | 'AFTER' | 'RANGE' | 'UNKNOWN';

export interface FuzzyDate {
  text: string | null;
  earliest: Date | null;
  latest: Date | null;
  precision: DatePrecision;
}

export const UNKNOWN_DATE: FuzzyDate = {
  text: null, earliest: null, latest: null, precision: 'UNKNOWN',
};

const AR_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function toWesternDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => AR_DIGITS[d]);
}

const CIRCA_MARKERS = ['نحو', 'حوالي', 'حوالى', '~', 'circa', 'c.', 'ca.'];
const BEFORE_MARKERS = ['قبل', 'before'];
const AFTER_MARKERS = ['بعد', 'after'];

function yearBounds(year: number, precision: DatePrecision): [Date, Date] {
  switch (precision) {
    case 'CIRCA':
      return [new Date(Date.UTC(year - 5, 0, 1)), new Date(Date.UTC(year + 5, 11, 31))];
    case 'BEFORE':
      return [new Date(Date.UTC(year - 30, 0, 1)), new Date(Date.UTC(year, 11, 31))];
    case 'AFTER':
      return [new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year + 30, 11, 31))];
    default:
      return [new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year, 11, 31))];
  }
}

/**
 * Parse notebook date wording into a FuzzyDate.
 * Handles: "١٩٣٠م" · "نحو ١٨١٢م" · "قبل ١٩٤٨" · "١٨١٠-١٨١٥" · "" 
 */
export function parseFuzzyDate(raw: string | null | undefined): FuzzyDate {
  if (!raw) return UNKNOWN_DATE;
  const text = raw.trim();
  if (!text) return UNKNOWN_DATE;

  const western = toWesternDigits(text);
  const lower = western.toLowerCase();

  const range = western.match(/(\d{3,4})\s*[-–—]\s*(\d{3,4})/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    return {
      text,
      earliest: new Date(Date.UTC(Math.min(a, b), 0, 1)),
      latest: new Date(Date.UTC(Math.max(a, b), 11, 31)),
      precision: 'RANGE',
    };
  }

  const yearMatch = western.match(/(\d{3,4})/);
  if (!yearMatch) return { ...UNKNOWN_DATE, text };
  const year = Number(yearMatch[1]);

  let precision: DatePrecision = 'EXACT';
  if (CIRCA_MARKERS.some((m) => lower.includes(m))) precision = 'CIRCA';
  else if (BEFORE_MARKERS.some((m) => lower.includes(m))) precision = 'BEFORE';
  else if (AFTER_MARKERS.some((m) => lower.includes(m))) precision = 'AFTER';

  const [earliest, latest] = yearBounds(year, precision);
  return { text, earliest, latest, precision };
}

/**
 * A person is treated as living if no death date is recorded and they were
 * born (or are presumed born) within the last 100 years. Drives the privacy layer.
 */
export function computeIsLiving(birth: FuzzyDate, death: FuzzyDate): boolean {
  if (death.precision !== 'UNKNOWN' || death.text) return false;
  if (!birth.earliest) return true; // unknown birth, no death → assume living
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 100);
  return birth.earliest > cutoff;
}

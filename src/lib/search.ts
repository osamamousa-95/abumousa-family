import { normalizeArabic } from './arabic';

/**
 * Cumulative search: each word of the query is matched against a successive
 * ancestor. Typing «أحمد» finds every Ahmad; adding «محمد» keeps only those
 * whose father is Muhammad; adding «سالم» narrows to those whose grandfather
 * is Salem — the way a person actually names a relative.
 *
 * Connector words (بن، بنت، ابن) are ignored so the query may be written
 * either way.
 */
const CONNECTORS = new Set(['بن', 'بنت', 'ابن', 'ابنة', 'ب']);

export function tokenizeQuery(query: string): string[] {
  return query
    .split(/\s+/)
    .map((w) => normalizeArabic(w.trim()))
    .filter((w) => w.length > 0 && !CONNECTORS.has(w));
}

export function matchesLineage(ancestors: string[], tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  let tokenIndex = 0;
  for (const ancestor of ancestors) {
    const target = normalizeArabic(ancestor);
    if (!target.includes(tokens[tokenIndex] ?? '')) return false;

    let consumed = 1;
    while (tokenIndex + consumed < tokens.length) {
      const candidate = tokens.slice(tokenIndex, tokenIndex + consumed + 1).join(' ');
      if (!target.includes(candidate)) break;
      consumed++;
    }
    tokenIndex += consumed;
    if (tokenIndex === tokens.length) return true;
  }
  return false;
}

/** Exact first-name matches sort first, then shallower generations. */
export function rankResults<T extends { ancestors: string[]; generation: number }>(
  items: T[],
  tokens: string[]
): T[] {
  const first = tokens[0] ?? '';
  return [...items].sort((a, b) => {
    const aExact = normalizeArabic(a.ancestors[0] ?? '') === first ? 0 : 1;
    const bExact = normalizeArabic(b.ancestors[0] ?? '') === first ? 0 : 1;
    return aExact - bExact || a.generation - b.generation;
  });
}

import { normalizeArabic } from './arabic';

export type BulkGender = 'MALE' | 'FEMALE';

export interface BulkPersonDraft {
  key: string;
  name: string;
  gender: BulkGender;
  depth: number;
  parentKey: string | null;
  line: number;
}

export interface BulkParseResult {
  people: BulkPersonDraft[];
  warnings: string[];
}

const FEMALE_MARKER = /(?:\[أنثى\]|\(أنثى\)|\|\s*أنثى)$/u;

function cleanName(value: string): { name: string; gender: BulkGender } {
  const trimmed = value
    .replace(/^\s*(?:[-*•▪◦]|\d+[.)]|[٠-٩]+[.)])\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  const gender = FEMALE_MARKER.test(trimmed) ? 'FEMALE' : 'MALE';
  return {
    name: trimmed.replace(FEMALE_MARKER, '').trim(),
    gender,
  };
}

function indentation(line: string): number {
  const prefix = line.match(/^[ \t]*/u)?.[0] ?? '';
  return prefix.replace(/\t/g, '  ').length;
}

/** Parse an indented family list without guessing relationships from prose. */
export function parseBulkFamilyText(text: string): BulkParseResult {
  const people: BulkPersonDraft[] = [];
  const warnings: string[] = [];
  const stack: { depth: number; key: string }[] = [];

  text.split(/\r?\n/u).forEach((rawLine, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const value = rawLine.trim();
    if (!value || value.startsWith('#') || value.startsWith('//')) return;

    const parts = value.includes(':')
      ? value.split(':').map((part) => part.trim()).filter(Boolean)
      : [value];
    const names = parts.length > 1
      ? [parts[0], ...parts.slice(1).join(':').split(/[,،؛;]/u).map((part) => part.trim()).filter(Boolean)]
      : [value];
    const depth = Math.floor(indentation(rawLine) / 2);

    names.forEach((rawName, nameIndex) => {
      const parsed = cleanName(rawName);
      if (!parsed.name) return;
      if (parsed.name.length > 160) {
        warnings.push(`السطر ${lineNumber}: الاسم طويل جداً، راجعه.`);
      }

      while (stack.length > 0 && stack[stack.length - 1].depth >= depth + (nameIndex > 0 ? 1 : 0)) {
        stack.pop();
      }
      const parentKey = stack[stack.length - 1]?.key ?? null;
      const key = `${lineNumber}-${nameIndex}`;
      people.push({ key, name: parsed.name, gender: parsed.gender, depth, parentKey, line: lineNumber });
      stack.push({ depth: depth + (nameIndex > 0 ? 1 : 0), key });
    });
  });

  if (people.length === 0) warnings.push('لم يتم العثور على أسماء. اكتب اسماً واحداً في كل سطر.');
  if (people.length > 500) warnings.push('يمكن استيراد ٥٠٠ فرد كحد أقصى في العملية الواحدة.');
  if (people.some((person) => person.name.length < 2)) warnings.push('يوجد اسم قصير جداً؛ راجعه قبل الاستيراد.');

  const names = new Map<string, number>();
  for (const person of people) {
    const normalized = normalizeArabic(person.name);
    names.set(normalized, (names.get(normalized) ?? 0) + 1);
  }
  for (const [name, count] of names) {
    if (count > 1) warnings.push(`الاسم «${name}» مكرر ${count} مرات؛ هذا قد يكون صحيحاً بين الأقارب.`);
  }

  return { people, warnings };
}
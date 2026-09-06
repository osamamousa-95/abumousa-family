'use client';

import { useMemo, useState } from 'react';
import { parseBulkFamilyText } from '@/lib/bulk-family';
import { importPeopleFromText } from '@/server/actions/admin';
import { ActionForm } from './ActionForm';
import { PersonPicker, type AdminPerson } from './PersonEditor';

type JsonPerson = { name?: unknown; gender?: unknown; parent?: unknown; parentIndex?: unknown };

function jsonToIndentedText(value: unknown): string {
  const entries = Array.isArray(value) ? value : (value as { people?: unknown })?.people;
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('يجب أن يحتوي JSON على مصفوفة people غير فارغة.');

  const people = entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || typeof (entry as JsonPerson).name !== 'string') {
      throw new Error(`بيانات الفرد رقم ${index + 1} غير صالحة.`);
    }
    const person = entry as JsonPerson;
    const parentIndex = typeof person.parentIndex === 'number'
      ? person.parentIndex
      : typeof person.parent === 'number'
        ? person.parent
        : null;
    if (parentIndex !== null && (!Number.isInteger(parentIndex) || parentIndex < 0 || parentIndex >= index)) {
      throw new Error(`parentIndex للفرد رقم ${index + 1} يجب أن يشير إلى فرد سابق.`);
    }
    return {
      name: (person.name as string).trim(),
      gender: person.gender === 'FEMALE' || person.gender === 'أنثى' ? ' [أنثى]' : '',
      parentIndex,
    };
  });

  const depths: number[] = [];
  return people.map((person, index) => {
    const depth = person.parentIndex === null ? 0 : depths[person.parentIndex] + 1;
    depths[index] = depth;
    return `${'  '.repeat(depth)}${person.name}${person.gender}`;
  }).join('\n');
}

export function BulkPeopleImport({ people }: { people: AdminPerson[] }) {
  const [text, setText] = useState('');
  const [rootFather, setRootFather] = useState<AdminPerson | null>(null);
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const parsed = useMemo(() => parseBulkFamilyText(text), [text]);
  const names = new Map(parsed.people.map((person) => [person.key, person.name]));

  return (
    <section className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] font-bold">استيراد أفراد من نص طويل</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          ارفع ملف JSON أو الصق النص، راجع الأسماء والعلاقات، ثم اضغط الاستيراد.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm">
        <p className="font-semibold">الصيغة المقترحة</p>
        <pre dir="rtl" className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-7 text-[var(--color-muted)]">
{`صيغة JSON:
{
  "people": [
    { "name": "سلامة سالم أبو موسى" },
    { "name": "أحمد سلامة", "parentIndex": 0 },
    { "name": "محمد أحمد", "parentIndex": 1 }
  ]
}

أو نص متدرج:
سلامة سالم أبو موسى
  أحمد سلامة
    محمد أحمد
    فاطمة أحمد [أنثى]
  محمود سلامة

ويمكن أيضاً كتابة:
سالم أبو موسى: أحمد، محمود، فاطمة [أنثى]`}
        </pre>
        <p className="mt-2 text-xs text-[var(--color-muted)]">كل مسافة بادئة بمقدار مسافتين تعني جيلاً جديداً. استخدم [أنثى] عند الحاجة.</p>
      </div>

      <ActionForm action={importPeopleFromText} submitLabel={`استيراد ${parsed.people.length || ''} فرداً`} resetOnSuccess>
        <input type="hidden" name="rootFatherId" value={rootFather?.id ?? ''} />
        <label className="block text-sm">
          <span className="font-semibold">أب جميع الجذور (اختياري)</span>
          <div className="mt-1">
            <PersonPicker
              people={people}
              value={rootFather}
              onPick={setRootFather}
              locale="ar"
              placeholder="ابحث باسم الأب أو أحد كلماته…"
            />
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)]">اتركه فارغاً لإنشاء جذور جديدة.</p>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">رفع ملف JSON</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void file.text().then((content) => {
                try {
                  setText(jsonToIndentedText(JSON.parse(content)));
                  setFileMessage(`تم تحميل ${file.name}. راجع المعاينة قبل الاستيراد.`);
                } catch (error) {
                  setFileMessage(error instanceof Error ? error.message : 'تعذر قراءة ملف JSON.');
                }
              });
            }}
            className="mt-1 block w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm"
          />
          {fileMessage && <span className="mt-1 block text-xs text-[var(--color-muted)]">{fileMessage}</span>}
        </label>
        <textarea
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="ألصق هنا النص العائلي، اسماً في كل سطر…"
          rows={12}
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-sm leading-7 outline-none focus:border-[var(--color-primary)]"
          required
        />
        <p className="text-xs text-[var(--color-muted)]">سيُستخدم الأب المختار أعلاه للجذور. بقية العلاقات تُستنتج من المسافات البادئة.</p>
      </ActionForm>

      {parsed.people.length > 0 && (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <p className="text-sm font-semibold">المعاينة: {parsed.people.length} فرداً</p>
          <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto text-sm">
            {parsed.people.map((person) => (
              <li key={person.key} style={{ paddingInlineStart: `${person.depth * 20}px` }}>
                {person.name} <span className="text-xs text-[var(--color-muted)]">{person.gender === 'FEMALE' ? 'أنثى' : 'ذكر'}{person.parentKey ? ` ← ${names.get(person.parentKey)}` : ''}</span>
              </li>
            ))}
          </ul>
          {parsed.warnings.length > 0 && (
            <div className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-ox-700)]">
              {parsed.warnings.map((warning) => <p key={warning}>{warning}</p>)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
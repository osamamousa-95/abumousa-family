'use client';

import { useMemo, useState, useTransition } from 'react';
import { parseBulkFamilyText } from '@/lib/bulk-family';
import { analyzeBulkTextWithAi, importPeopleFromText } from '@/server/actions/admin';
import { ActionForm } from './ActionForm';
import type { AdminPerson } from './PersonEditor';

export function BulkPeopleImport({ people }: { people: AdminPerson[] }) {
  const [text, setText] = useState('');
  const [rootFatherId, setRootFatherId] = useState('');
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiPending, startAi] = useTransition();
  const parsed = useMemo(() => parseBulkFamilyText(text), [text]);
  const names = new Map(parsed.people.map((person) => [person.key, person.name]));

  return (
    <section className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] font-bold">استيراد أفراد من نص طويل</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          الصق النص، راجع الأسماء والعلاقات، ثم اضغط الاستيراد. لا تُحفظ البيانات قبل تأكيدك.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm">
        <p className="font-semibold">الصيغة المقترحة</p>
        <pre dir="rtl" className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-7 text-[var(--color-muted)]">
{`سلامة سالم أبو موسى
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
        <label className="block text-sm">
          <span className="font-semibold">أب جميع الجذور (اختياري)</span>
          <select name="rootFatherId" value={rootFatherId} onChange={(event) => setRootFatherId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2.5 outline-none focus:border-[var(--color-primary)]">
            <option value="">لا يوجد، أنشئ جذوراً جديدة</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.lineage}</option>)}
          </select>
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={aiPending || !text.trim()}
            onClick={() => startAi(async () => {
              const result = await analyzeBulkTextWithAi(text);
              setAiMessage(result.message);
              if (result.ok && result.text) setText(result.text);
            })}
            className="rounded-xl border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-paper)] disabled:opacity-50"
          >
            {aiPending ? 'جارٍ التحليل المحلي…' : 'تحليل بالنموذج المحلي'}
          </button>
          {aiMessage && <span className="text-xs text-[var(--color-muted)]">{aiMessage}</span>}
        </div>
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
'use client';

import { useMemo, useState } from 'react';
import { formatNumber } from '@/lib/arabic';
import { tokenizeQuery, matchesLineage, rankResults } from '@/lib/search';
import { PersonEditor, type AdminPerson } from './PersonEditor';
import { BulkPeopleImport } from './BulkPeopleImport';

export function PeopleManager({
  people, locale, canDelete, initialId,
}: {
  people: AdminPerson[]; locale: string; canDelete: boolean; initialId?: string;
}) {
  const preselected = initialId ? people.find((p) => p.id === initialId) ?? null : null;
  const [mode, setMode] = useState<'add' | 'bulk' | 'edit'>(preselected ? 'edit' : 'add');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<AdminPerson | null>(preselected);

  const results = useMemo(() => {
    const tokens = tokenizeQuery(q);
    if (tokens.length === 0 || tokens[0].length < 2) return [];
    return rankResults(people.filter((p) => matchesLineage(p.ancestors, tokens)), tokens).slice(0, 20);
  }, [q, people]);

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['add', 'bulk', 'edit'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setEditing(null); }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === m
                ? 'bg-[var(--color-primary)] text-white'
                : 'border border-[var(--color-line)] hover:border-[var(--color-primary)]'}`}
          >
            {m === 'add' ? 'إضافة فرد' : m === 'bulk' ? 'استيراد جماعي' : 'تعديل فرد'}
          </button>
        ))}
      </div>

      {mode === 'bulk' ? (
        <BulkPeopleImport people={people} />
      ) : mode === 'add' ? (
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
          <PersonEditor person={null} people={people} locale={locale} canDelete={false} />
        </section>
      ) : editing ? (
        <section className="rounded-2xl border border-[var(--color-line)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] font-bold">{editing.lineage}</h2>
            <button onClick={() => setEditing(null)} className="text-sm text-[var(--color-muted)]">
              ✕ رجوع
            </button>
          </div>
          <PersonEditor
            person={editing} people={people} locale={locale} canDelete={canDelete}
            onDone={() => setEditing(null)}
          />
        </section>
      ) : (
        <section>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث: الاسم، ثم اسم الأب، ثم الجدّ لتضييق النتائج…"
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {formatNumber(people.length, locale)} فرداً في الشجرة — كلهم قابلون للتعديل بلا استثناء.
          </p>
          <ul className="mt-4 space-y-1.5">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setEditing(r)}
                  className="flex w-full items-center gap-2 rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-start text-sm transition hover:border-[var(--color-primary)]"
                >
                  <span className="flex-1">{r.lineage}</span>
                  <span className="text-xs text-[var(--color-muted)]">
                    ج{formatNumber(r.generation, locale)}
                  </span>
                  {r.marriages.some((m) => m.isInternal) && (
                    <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] text-white">⚭</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { formatNumber } from '@/lib/arabic';
import { tokenizeQuery, matchesLineage, rankResults } from '@/lib/search';
import { computeKinship, type KinNode } from '@/lib/kinship';
import type { TreeNodeDTO } from '@/server/services/tree';

function PersonPicker({
  people,
  value,
  onPick,
  placeholder,
  locale,
}: {
  people: TreeNodeDTO[];
  value: TreeNodeDTO | null;
  onPick: (p: TreeNodeDTO | null) => void;
  placeholder: string;
  locale: string;
}) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const tokens = tokenizeQuery(q);
    if (tokens.length === 0 || tokens[0].length < 2) return [];
    return rankResults(people.filter((p) => matchesLineage(p.ancestors, tokens)), tokens).slice(0, 10);
  }, [q, people]);

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[var(--color-primary)] bg-[var(--color-paper-2)] px-4 py-3">
        <span className="text-sm font-semibold">{value.lineage}</span>
        <button
          onClick={() => { onPick(null); setQ(''); }}
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          aria-label="clear"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
      />
      {results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] shadow-xl">
          {results.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => { onPick(r); setQ(''); }}
                className="block w-full border-b border-[var(--color-line)] px-4 py-2.5 text-start last:border-0 hover:bg-[var(--color-paper-2)]"
              >
                <span className="block text-sm font-medium">{r.lineage}</span>
                <span className="text-xs text-[var(--color-muted)]">
                  {locale === 'ar' ? 'الجيل' : 'Gen'} {formatNumber(r.generation, locale)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RelationFinder({
  people,
  locale,
}: {
  people: TreeNodeDTO[];
  locale: string;
}) {
  const ar = locale === 'ar';
  const [a, setA] = useState<TreeNodeDTO | null>(null);
  const [b, setB] = useState<TreeNodeDTO | null>(null);

  const kinNodes: KinNode[] = useMemo(
    () => people.map((p) => ({ id: p.id, name: p.name, fatherId: p.fatherId })),
    [people]
  );

  const result = useMemo(() => {
    if (!a || !b) return null;
    return computeKinship(a.id, b.id, kinNodes);
  }, [a, b, kinNodes]);

  const ancestorName = result?.commonAncestorId
    ? people.find((p) => p.id === result.commonAncestorId)?.name
    : null;

  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        {ar ? 'ما صلة القرابة بيننا؟' : 'How are we related?'}
      </h2>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">
        {ar
          ? 'اختر اسمين من العائلة ليظهر لك جدُّهما المشترك ودرجة القرابة بينهما.'
          : 'Choose two names to see their common ancestor and the degree of kinship between them.'}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PersonPicker
          people={people} value={a} onPick={setA} locale={locale}
          placeholder={ar ? 'الاسم الأول…' : 'First name…'}
        />
        <PersonPicker
          people={people} value={b} onPick={setB} locale={locale}
          placeholder={ar ? 'الاسم الثاني…' : 'Second name…'}
        />
      </div>

      {result && (
        <div className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
          <p className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-primary)]">
            {ar ? result.label.ar : result.label.en}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
            {ar ? result.detail.ar : result.detail.en}
          </p>

          {ancestorName && result.kind !== 'unrelated' && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-4 text-sm">
              <span className="text-[var(--color-muted)]">
                {ar ? 'الجدّ المشترك' : 'Common ancestor'}
              </span>
              <span className="rounded-full bg-[var(--color-gold-100)] px-3 py-1 font-semibold text-[var(--color-gold-700)]">
                {ancestorName}
              </span>
              {result.upA > 0 && result.upB > 0 && (
                <span className="text-xs text-[var(--color-muted)]">
                  {ar
                    ? `يصعد إليه ${a?.name} بـ${formatNumber(result.upA, locale)}، و${b?.name} بـ${formatNumber(result.upB, locale)}`
                    : `${formatNumber(result.upA, locale)} up from ${a?.name}, ${formatNumber(result.upB, locale)} from ${b?.name}`}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

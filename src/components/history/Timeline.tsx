'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { TIMELINE } from '@/content/history';

const KIND_STYLE: Record<string, { dot: string; label: { ar: string; en: string } }> = {
  tribe: { dot: '#B8892B', label: { ar: 'القبيلة', en: 'Tribe' } },
  family: { dot: '#7B2D26', label: { ar: 'العائلة', en: 'Family' } },
  conflict: { dot: '#8A3B24', label: { ar: 'حرب', en: 'Conflict' } },
  migration: { dot: '#1F6FA8', label: { ar: 'هجرة', en: 'Migration' } },
};

export function Timeline({ locale }: { locale: string }) {
  const [filter, setFilter] = useState<string | null>(null);
  const kinds = Object.keys(KIND_STYLE);
  const items = filter ? TIMELINE.filter((e) => e.kind === filter) : TIMELINE;

  return (
    <div>
      <div className="mb-7 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            filter === null
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-line)] hover:border-[var(--color-primary)]'
          }`}
        >
          {locale === 'ar' ? 'الكل' : 'All'}
        </button>
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(filter === k ? null : k)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${
              filter === k
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[var(--color-line)] hover:border-[var(--color-primary)]'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: filter === k ? '#fff' : KIND_STYLE[k].dot }}
            />
            {locale === 'ar' ? KIND_STYLE[k].label.ar : KIND_STYLE[k].label.en}
          </button>
        ))}
      </div>

      <ol className="relative border-s-2 border-[var(--color-line)] ps-6">
        {items.map((e, i) => (
          <Reveal as="li" key={e.year + e.yearNum} delay={i * 60} className="relative pb-9 last:pb-0">
            <span
              className="absolute -start-[31px] top-1.5 h-4 w-4 rounded-full border-4 border-[var(--color-paper)]"
              style={{ background: KIND_STYLE[e.kind].dot }}
            />
            <time className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--color-primary)]">
              {e.year}
            </time>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">
              {locale === 'ar' ? e.title.ar : e.title.en}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-2)]">
              {locale === 'ar' ? e.body.ar : e.body.en}
            </p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

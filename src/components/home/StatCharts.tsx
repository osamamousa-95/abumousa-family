import { formatNumber } from '@/lib/arabic';
import type { FamilyStats } from '@/server/services/stats';

/**
 * Bars are plain CSS widths rather than a charting library — a dependency the
 * size of Recharts is unjustifiable for two bar charts, and this renders
 * entirely on the server with no client JavaScript at all.
 */
export function StatCharts({
  stats,
  locale,
}: {
  stats: FamilyStats;
  locale: string;
}) {
  const ar = locale === 'ar';
  const maxName = Math.max(...stats.topNames.map((n) => n.count), 1);
  const maxGen = Math.max(...stats.perGeneration.map((g) => g.count), 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
          {ar ? 'أكثر الأسماء تكراراً' : 'Most repeated names'}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {ar
            ? 'الأسماء التي تكرّرت في أكثر من فرد عبر الأجيال'
            : 'Names borne by more than one person across the generations'}
        </p>
        <ul className="mt-4 space-y-2.5">
          {stats.topNames.map((n) => (
            <li key={n.name}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{n.name}</span>
                <span className="text-xs text-[var(--color-muted)]">
                  {formatNumber(n.count, locale)}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-paper)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${(n.count / maxName) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
          {ar ? 'الأفراد في كل جيل' : 'People per generation'}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {ar
            ? 'من زين الدين في الجيل الأول إلى أحدث الأجيال'
            : 'From Zain al-Din in the first generation to the most recent'}
        </p>
        <ul className="mt-4 space-y-2">
          {stats.perGeneration.map((g) => (
            <li key={g.generation} className="flex items-center gap-3">
              <span className="w-6 flex-none text-xs text-[var(--color-muted)]">
                {formatNumber(g.generation, locale)}
              </span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-[var(--color-paper)]">
                <div
                  className="h-full rounded bg-[var(--color-gold-500)]"
                  style={{ width: `${(g.count / maxGen) * 100}%` }}
                />
              </div>
              <span className="w-8 flex-none text-end text-xs tabular-nums text-[var(--color-muted)]">
                {formatNumber(g.count, locale)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

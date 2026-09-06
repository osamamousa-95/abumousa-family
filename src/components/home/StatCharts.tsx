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
  const genderTotal = stats.males + stats.females + stats.unknownGender;
  const malePercent = genderTotal ? (stats.males / genderTotal) * 100 : 0;
  const femalePercent = genderTotal ? (stats.females / genderTotal) * 100 : 0;

  return (
    <div className="space-y-4">
      <section className="rounded-[var(--radius-card)] border-2 border-[var(--color-martyr-300)] bg-[var(--color-martyr-50)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-martyr-700)]">
              {ar ? 'ذكرى الشهداء' : 'In remembrance'}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-martyr-700)]">
              {formatNumber(stats.martyrs.length, locale)} {ar ? 'شهداء موثّقون' : 'documented martyrs'}
            </h3>
          </div>
          <span className="text-2xl text-[var(--color-martyr-500)]">✦</span>
        </div>
        {stats.martyrs.length > 0 && (
          <div className="martyr-marquee mt-4" aria-label={ar ? 'أسماء الشهداء' : 'Martyr names'}>
            <div className="martyr-marquee-track">
              {[...stats.martyrs, ...stats.martyrs].map((martyr, index) => (
                <span key={`${martyr.slug}-${index}`} className="martyr-pill">
                  <span aria-hidden>✦</span> {martyr.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {stats.internalMarriages > 0 && (
        <section className="rounded-[var(--radius-card)] border-2 border-[var(--color-primary)] bg-[var(--color-paper-2)] p-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-[var(--color-primary)]">
              {formatNumber(stats.internalMarriages, locale)}
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
              {ar ? '⚭ زيجة داخل العائلة' : '⚭ marriages within the family'}
            </h3>
            <span className="text-xs text-[var(--color-muted)]">
              {ar ? `من أصل ${formatNumber(stats.totalMarriages, locale)} زيجة مسجّلة`
                  : `of ${formatNumber(stats.totalMarriages, locale)} recorded`}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
            {ar
              ? 'زيجاتٌ الزوجان فيها كلاهما من ذرية زين الدين الحربي — فروعٌ التقت من جديد بعد أن تفرّقت أجيالاً.'
              : 'Marriages in which both partners descend from Zain al-Din al-Harbi — branches meeting again after generations apart.'}
          </p>
        </section>
      )}

    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
          {ar ? 'التوزيع حسب الجنس' : 'People by gender'}
        </h3>
        <div className="mt-5 flex items-center gap-5">
          <div
            className="relative h-28 w-28 flex-none rounded-full"
            style={{ background: `conic-gradient(var(--color-branch-ati) 0 ${malePercent}%, var(--color-ox-500) ${malePercent}% ${malePercent + femalePercent}%, var(--color-muted) ${malePercent + femalePercent}% 100%)` }}
            aria-label={`${stats.males} ${ar ? 'ذكور' : 'males'}, ${stats.females} ${ar ? 'إناث' : 'females'}`}
          >
            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-[var(--color-paper-2)] font-[family-name:var(--font-display)] text-xl font-extrabold">
              {formatNumber(stats.total, locale)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p><i className="stat-dot bg-[var(--color-branch-ati)]" />{formatNumber(stats.males, locale)} {ar ? 'ذكور' : 'males'}</p>
            <p><i className="stat-dot bg-[var(--color-ox-500)]" />{formatNumber(stats.females, locale)} {ar ? 'إناث' : 'females'}</p>
            {stats.unknownGender > 0 && <p><i className="stat-dot bg-[var(--color-muted)]" />{formatNumber(stats.unknownGender, locale)} {ar ? 'غير محدد' : 'unknown'}</p>}
          </div>
        </div>
      </section>

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
    </div>
  );
}

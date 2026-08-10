import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Link } from '@/i18n/routing';
import { prisma } from '@/server/db/prisma';
import { getLineageChain } from '@/server/services/tree';
import { formatNumber } from '@/lib/arabic';

export const revalidate = 3600;

async function load(slug: string) {
  return prisma.person.findUnique({
    where: { slug },
    include: {
      father: { select: { name: true, slug: true } },
      children: { orderBy: { sortOrder: 'asc' }, select: { name: true, slug: true, gender: true } },
      burialPlace: true,
      sources: { include: { source: true } },
      marriagesAsHusband: { include: { wife: { select: { name: true, slug: true } } } },
      marriagesAsWife: { include: { husband: { select: { name: true, slug: true } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: 'غير موجود' };
  return {
    title: p.name,
    description: `${p.name} — عائلة أبو موسى الحربي`,
    robots: p.isLiving ? { index: false } : { index: true },
  };
}

export default async function PersonPage({
  params,
}: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await load(slug);
  if (!p || p.status !== 'PUBLISHED') notFound();

  const t = await getTranslations('person');
  // Public viewer: living people expose name and position only — §1.3
  const redacted = p.isLiving;
  const chain = await getLineageChain(p.id);

  const spouses = [
    ...p.marriagesAsHusband.map((m) => m.wife?.name ?? m.wifeNameText),
    ...p.marriagesAsWife.map((m) => m.husband?.name ?? m.husbandNameText),
  ].filter(Boolean) as string[];

  const rows: { label: string; value: string | null }[] = [
    { label: t('born'), value: redacted ? null : p.birthDateText },
    { label: t('died'), value: redacted ? null : p.deathDateText },
    { label: t('burial'), value: redacted ? null : p.burialPlaceRaw },
    { label: t('spouse'), value: redacted ? null : spouses.join('، ') || null },
    { label: t('occupation'), value: redacted ? null : p.occupation },
  ].filter((r) => r.value);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
          {p.name}
          {p.nameConfidence === 'UNCERTAIN' && (
            <span title={t('uncertain')} className="ms-2 text-[var(--color-gold-500)]">٭</span>
          )}
        </h1>

        <div className="mt-4 rounded-xl bg-[var(--color-gold-100)] p-4 font-[family-name:var(--font-quran)] text-lg leading-loose">
          {chain}
        </div>

        <p className="mt-3 text-sm text-[var(--color-muted)]">
          الجيل {formatNumber(p.generation, locale)}
          {p.father && (
            <>
              {' · '}
              <Link href={`/person/${p.father.slug}`} className="hover:text-[var(--color-primary)]">
                ابن {p.father.name}
              </Link>
            </>
          )}
        </p>

        {rows.length > 0 && (
          <dl className="mt-7 divide-y divide-[var(--color-line)] rounded-xl border border-[var(--color-line)]">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-4 px-4 py-3">
                <dt className="w-28 flex-none text-sm text-[var(--color-muted)]">{r.label}</dt>
                <dd className="text-sm">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {redacted && (
          <p className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4 text-sm text-[var(--color-muted)]">
            {t('redacted')}
          </p>
        )}

        {!redacted && p.biography && (
          <section className="mt-8">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">{t('biography')}</h2>
            <p className="mt-2 leading-relaxed">{p.biography}</p>
          </section>
        )}

        {p.children.length > 0 && (
          <section className="mt-9">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              الأبناء والبنات ({formatNumber(p.children.length, locale)})
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.children.map((c) => (
                <Link
                  key={c.slug}
                  href={`/person/${c.slug}`}
                  className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  {c.name}
                  {c.gender === 'FEMALE' && (
                    <span className="ms-1 text-xs text-[var(--color-muted)]">(بنت)</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {p.sources.length > 0 && (
          <section className="mt-9 border-t border-[var(--color-line)] pt-5">
            <h2 className="text-sm font-bold text-[var(--color-muted)]">{t('source')}</h2>
            {p.sources.map((s) => (
              <p key={s.id} className="mt-1 text-sm text-[var(--color-muted)]">
                دفتر سلامة سالم أبو موسى{s.page ? `، ص ${s.page}` : ''}
              </p>
            ))}
          </section>
        )}

        <Link href="/tree" className="mt-10 inline-block text-sm text-[var(--color-primary)]">
          ← العودة إلى الشجرة
        </Link>
      </main>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/routing';
import { prisma } from '@/server/db/prisma';
import { getLineageChain } from '@/server/services/tree';
import { formatNumber } from '@/lib/arabic';
import { currentRole } from '@/server/auth/config';
import { CreatorCard } from '@/components/person/CreatorCard';
import { CREATOR_SLUG } from '@/content/creator';

export const revalidate = 3600;
export const dynamicParams = true;

async function load(slug: string) {
  const decoded = decodeURIComponent(slug);
  return prisma.person.findFirst({
    where: { OR: [{ slug }, { slug: decoded }] },
    include: {
      father: {
        select: {
          name: true, slug: true,
          children: { orderBy: { sortOrder: 'asc' }, select: { name: true, slug: true, gender: true } },
        },
      },
      children: {
        orderBy: { sortOrder: 'asc' },
        select: { name: true, slug: true, gender: true },
      },
      sources: { include: { source: true } },
      marriagesAsHusband: { include: { wife: { select: { name: true, slug: true, father: { select: { name: true } } } } } },
      marriagesAsWife: { include: { husband: { select: { name: true, slug: true, father: { select: { name: true } } } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: '—' };
  return {
    title: p.name,
    description: `${p.name} — عائلة أبو موسى الحربي`,
    robots: p.isLiving ? { index: false, follow: true } : { index: true, follow: true },
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
  const ar = locale === 'ar';
  const redacted = p.isLiving;
  const chain = await getLineageChain(p.id);

  const spouses = [
    ...p.marriagesAsHusband.map((m) => ({
      name: m.wife?.name ?? m.wifeNameText, slug: m.wife?.slug,
      fatherName: m.wife?.father?.name ?? null,
      isInternal: m.isInternal, note: m.notes,
    })),
    ...p.marriagesAsWife.map((m) => ({
      name: m.husband?.name ?? m.husbandNameText, slug: m.husband?.slug,
      fatherName: m.husband?.father?.name ?? null,
      isInternal: m.isInternal, note: m.notes,
    })),
  ].filter((s) => s.name);
  const internalSpouses = spouses.filter((s) => s.isInternal);
  const role = await currentRole();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  const siblings = (p.father?.children ?? []).filter((c) => c.slug !== p.slug);

  const facts: { label: string; value: string }[] = [];
  if (!redacted) {
    if (p.birthDateText) facts.push({ label: t('born'), value: p.birthDateText });
    if (p.deathDateText) facts.push({ label: t('died'), value: p.deathDateText });
    if (p.burialPlaceRaw) facts.push({ label: t('burial'), value: p.burialPlaceRaw });
    if (p.occupation) facts.push({ label: t('occupation'), value: p.occupation });
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {ar ? 'الجيل' : 'Generation'} {formatNumber(p.generation, locale)}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-extrabold">
            {p.name}
            {p.nameConfidence === 'UNCERTAIN' && (
              <span title={t('uncertain')} className="ms-2 align-super text-lg text-[var(--color-gold-500)]">٭</span>
            )}
          </h1>
          {p.nameLatin && (
            <p className="mt-1 text-sm text-[var(--color-muted)]" lang="en">{p.nameLatin}</p>
          )}
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-7 rounded-2xl bg-[var(--color-gold-100)] p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-700)]">
              {ar ? 'النسب' : 'Lineage'}
            </h2>
            <p className="mt-2 font-[family-name:var(--font-quran)] text-xl leading-loose">{chain}</p>
          </div>
        </Reveal>

        {facts.length > 0 && (
          <Reveal delay={120}>
            <dl className="mt-7 divide-y divide-[var(--color-line)] overflow-hidden rounded-xl border border-[var(--color-line)]">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-4 px-5 py-3.5">
                  <dt className="w-24 flex-none text-sm text-[var(--color-muted)]">{f.label}</dt>
                  <dd className="text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {isAdmin && (
          <Reveal delay={60}>
            <a
              href={`/${locale}/admin/people?id=${p.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              ✎ {ar ? 'تعديل بيانات هذا الفرد' : 'Edit this person'}
            </a>
          </Reveal>
        )}

        {internalSpouses.length > 0 && (
          <Reveal delay={100}>
            <section className="mt-7 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-paper-2)] p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                <span className="text-lg leading-none">⚭</span>
                {ar ? 'زواج من داخل العائلة' : 'A marriage within the family'}
              </p>
              {internalSpouses.map((s, i) => (
                <div key={i} className="mt-3">
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                    {p.name}
                    <span className="mx-2 text-[var(--color-primary)]">⚭</span>
                    {s.slug ? (
                      <Link href={`/person/${s.slug}`} className="hover:underline">{s.name}</Link>
                    ) : s.name}
                  </p>
                  {s.fatherName && (
                    <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                      {s.name} {ar ? 'بنت' : 'daughter of'} {s.fatherName}
                    </p>
                  )}
                  {s.note && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">{s.note}</p>
                  )}
                </div>
              ))}
              <p className="mt-4 border-t border-[var(--color-line)] pt-3 text-xs leading-relaxed text-[var(--color-muted)]">
                {ar
                  ? 'كلا الزوجين من ذرية زين الدين الحربي — فرعان من العائلة التقيا من جديد بعد أن تفرّقا أجيالاً.'
                  : 'Both partners descend from Zain al-Din al-Harbi — two branches of the family meeting again after generations apart.'}
              </p>
            </section>
          </Reveal>
        )}

        {!redacted && spouses.length > 0 && (
          <Reveal delay={140}>
            <section className="mt-7">
              <h2 className="text-sm font-bold text-[var(--color-muted)]">{t('spouse')}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {spouses.filter((s) => !s.isInternal).map((s, i) =>
                  s.slug ? (
                    <Link key={i} href={`/person/${s.slug}`}
                      className="rounded-full bg-[var(--color-gold-100)] px-4 py-1.5 text-sm font-medium text-[var(--color-gold-700)] hover:underline">
                      {s.name}
                    </Link>
                  ) : (
                    <span key={i} className="rounded-full bg-[var(--color-paper-2)] px-4 py-1.5 text-sm">{s.name}</span>
                  )
                )}
              </div>
            </section>
          </Reveal>
        )}

        {redacted && (
          <Reveal delay={140}>
            <p className="mt-7 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5 text-sm leading-relaxed text-[var(--color-muted)]">
              {t('redacted')}
            </p>
          </Reveal>
        )}

        {!redacted && p.biography && (
          <Reveal delay={160}>
            <section className="mt-9">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">{t('biography')}</h2>
              <p className="mt-3 whitespace-pre-line leading-loose text-[var(--color-ink-2)]">{p.biography}</p>
            </section>
          </Reveal>
        )}

        {/* الحقول الإضافية التي لا مقابل لها في نموذج البيانات العام —
            تظهر فقط على صفحة المعدّ نفسه، وليست ميزة عامة لكل فرد. */}
        {p.slug === CREATOR_SLUG && (
          <Reveal delay={170}>
            <section className="mt-9">
              <CreatorCard locale={locale} variant="compact" />
            </section>
          </Reveal>
        )}

        {p.children.length > 0 && (
          <Reveal delay={180}>
            <section className="mt-10">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                {ar ? 'الأبناء والبنات' : 'Children'}
                <span className="ms-2 text-sm font-normal text-[var(--color-muted)]">
                  {formatNumber(p.children.length, locale)}
                </span>
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.children.map((c) => (
                  <Link key={c.slug} href={`/person/${c.slug}`}
                    className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                    {c.name}
                    {c.gender === 'FEMALE' && (
                      <span className="ms-1 text-xs text-[var(--color-muted)]">{ar ? '(بنت)' : '(f)'}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {siblings.length > 0 && (
          <Reveal delay={200}>
            <section className="mt-9">
              <h2 className="text-sm font-bold text-[var(--color-muted)]">
                {ar ? 'الإخوة والأخوات' : 'Siblings'}
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {siblings.map((s) => (
                  <Link key={s.slug} href={`/person/${s.slug}`}
                    className="rounded-full bg-[var(--color-paper-2)] px-3 py-1 text-xs transition hover:text-[var(--color-primary)]">
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal delay={220}>
          <nav className="mt-12 flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] pt-6 text-sm">
            {p.father && (
              <Link href={`/person/${p.father.slug}`}
                className="rounded-full border border-[var(--color-line)] px-5 py-2 transition hover:border-[var(--color-primary)]">
                ↑ {ar ? 'الأب' : 'Father'}: {p.father.name}
              </Link>
            )}
            <Link href="/tree" className="text-[var(--color-primary)] hover:underline">
              {ar ? 'العودة إلى الشجرة' : 'Back to the tree'} →
            </Link>
          </nav>
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}

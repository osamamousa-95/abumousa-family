import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { Link } from '@/i18n/routing';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { ERAS } from '@/content/history';
import { READER_MESSAGE, SCRIPTURE } from '@/content/scripture';

export default async function HomePage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tn = await getTranslations('nav');

  const stats = [
    { value: 270, label: t('statPeople') },
    { value: 10, label: t('statGenerations') },
    { value: 10, label: t('statPlaces') },
    { value: 5, label: locale === 'ar' ? 'ديار' : 'homelands' },
  ];

  return (
    <>
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 h-80 opacity-[0.07]"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 50%, var(--color-primary) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-20 text-center">
          <Reveal>
            <Logo size={78} className="mx-auto text-[var(--color-primary)]" />
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-tight sm:text-5xl">
              {t('heroTitle')}
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
              {t('heroSubtitle')}
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/tree"
                className="rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:bg-[var(--color-primary-hover)]"
              >
                {t('exploreTree')}
              </Link>
              <Link
                href="/history"
                className="rounded-full border border-[var(--color-line)] px-7 py-3 text-sm font-semibold transition hover:border-[var(--color-primary)]"
              >
                {t('readHistory')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-5">
        <Reveal as="section" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-6 text-center"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-[var(--color-primary)]">
                <CountUp value={s.value} locale={locale} />
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">{s.label}</div>
            </div>
          ))}
        </Reveal>

        <Reveal as="section" className="mt-16">
          <blockquote className="rounded-2xl bg-[var(--color-gold-100)] p-7 text-center">
            <p className="font-[family-name:var(--font-quran)] text-lg leading-loose sm:text-xl">
              {locale === 'ar' ? READER_MESSAGE.ar : READER_MESSAGE.en}
            </p>
          </blockquote>
        </Reveal>

        <section className="mt-20">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {locale === 'ar' ? 'خمسة ديار' : 'Five Homelands'}
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              {locale === 'ar'
                ? 'رحلة امتدت قرنين، من بادية الحجاز إلى الشتات.'
                : 'A journey of two centuries, from the Hejaz steppe to the diaspora.'}
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {ERAS.map((era, i) => (
              <Reveal as="article" key={era.id} delay={i * 80}>
                <Link
                  href="/history"
                  className="group flex gap-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5 transition hover:border-[var(--color-primary)]"
                >
                  <span
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-base font-extrabold text-white"
                    style={{ background: era.accent }}
                  >
                    {era.order}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-[family-name:var(--font-display)] text-base font-bold group-hover:text-[var(--color-primary)]">
                      {locale === 'ar' ? era.title.ar : era.title.en}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                      {era.years} · {locale === 'ar' ? era.place.ar : era.place.en}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-[var(--color-ink-2)]">
                      {locale === 'ar' ? era.lead.ar : era.lead.en}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal as="section" className="mt-20">
          <article className="rounded-2xl border border-[var(--color-line)] p-7">
            <p className="font-[family-name:var(--font-quran)] text-xl leading-loose">
              {SCRIPTURE[3].text}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--color-gold-700)]">
              {locale === 'ar' ? SCRIPTURE[3].attribution.ar : SCRIPTURE[3].attribution.en}
            </p>
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              {locale === 'ar' ? SCRIPTURE[3].gloss.ar : SCRIPTURE[3].gloss.en}
            </p>
          </article>
        </Reveal>

        <Reveal as="section" className="mt-16">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-8 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              {locale === 'ar' ? 'ابحث عن اسمك' : 'Find your name'}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
              {locale === 'ar'
                ? 'الشجرة تضم ٢٧٠ اسماً في عشرة أجيال. اكتب اسمك أو اسم جدّك لترى عمود نسبك كاملاً إلى زين الدين الحربي.'
                : 'The tree holds 270 names across ten generations. Search your name or your grandfather\'s to see your full lineage back to Zain al-Din al-Harbi.'}
            </p>
            <Link
              href="/tree"
              className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              {tn('tree')}
            </Link>
          </div>
        </Reveal>
      </main>

      <SiteFooter />
    </>
  );
}

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { Link } from '@/i18n/routing';
import { formatNumber } from '@/lib/arabic';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tn = await getTranslations('nav');
  const tc = await getTranslations('credits');

  const stats = [
    { value: 271, label: t('statPeople') },
    { value: 10, label: t('statGenerations') },
    { value: 8, label: t('statPlaces') },
    { value: 70, label: t('statPages') },
  ];

  return (
    <>
    <SiteHeader />
    <main className="mx-auto max-w-4xl px-5 pb-24">
      <header className="flex flex-col items-center pt-20 pb-14 text-center">
        <Logo size={72} className="text-[var(--color-primary)]" />
        <h1 className="mt-7 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-tight sm:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--color-muted)]">
          {t('heroSubtitle')}
        </p>

        <nav className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/tree"
            className="rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            {t('exploreTree')}
          </Link>
          <Link
            href="/history"
            className="rounded-full border border-[var(--color-line)] px-6 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
          >
            {t('readHistory')}
          </Link>
        </nav>
      </header>

      <section
        aria-label={tn('home')}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-5 text-center"
          >
            <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-[var(--color-primary)]">
              {formatNumber(s.value, locale)}
            </div>
            <div className="mt-1 text-xs text-[var(--color-muted)]">{s.label}</div>
          </div>
        ))}
      </section>

      <footer className="mt-20 border-t border-[var(--color-line)] pt-8 text-center text-sm text-[var(--color-muted)]">
        <p>{tc('sourceLine')}</p>
        <p className="mt-1">{tc('preparedBy')}</p>
      </footer>
    </main>
    </>
  );
}

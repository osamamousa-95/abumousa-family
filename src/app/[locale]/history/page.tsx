import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { Timeline } from '@/components/history/Timeline';
import { Link } from '@/i18n/routing';
import { ERAS } from '@/content/history';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('history') };
}

export default async function HistoryPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const ar = locale === 'ar';

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Reveal>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold">
            {t('history')}
          </h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">
            {ar
              ? 'رحلة عائلة من بادية الحجاز إلى شمال النقب ثم الشتات — قرنان من الترحال والبقاء.'
              : 'The journey of a family from the Hejaz steppe to the northern Negev and then the diaspora — two centuries of movement and endurance.'}
          </p>
        </Reveal>

        <div className="mt-14 space-y-16">
          {ERAS.map((era) => (
            <Reveal as="article" key={era.id}>
              <header className="flex items-center gap-4">
                <span
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl font-[family-name:var(--font-display)] text-lg font-extrabold text-white"
                  style={{ background: era.accent }}
                >
                  {era.order}
                </span>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
                    {ar ? era.title.ar : era.title.en}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)]">
                    {era.years} · {ar ? era.place.ar : era.place.en}
                  </p>
                </div>
              </header>

              <p className="mt-6 border-s-4 ps-4 text-lg leading-relaxed"
                 style={{ borderColor: era.accent }}>
                {ar ? era.lead.ar : era.lead.en}
              </p>

              <div className="mt-5 space-y-4">
                {era.body.map((p, i) => (
                  <p key={i} className="leading-loose text-[var(--color-ink-2)]">
                    {ar ? p.ar : p.en}
                  </p>
                ))}
              </div>

              {era.quote && (
                <blockquote className="mt-6 rounded-xl bg-[var(--color-gold-100)] p-5 font-[family-name:var(--font-quran)] text-lg leading-loose">
                  «{ar ? era.quote.ar : era.quote.en}»
                </blockquote>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal as="section" className="mt-20">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            {ar ? 'الخط الزمني' : 'Timeline'}
          </h2>
          <p className="mt-2 mb-8 text-[var(--color-muted)]">
            {ar
              ? 'أحداث القبيلة والعائلة مرتّبة، من نزول حرب الحجاز إلى النكبة.'
              : 'Events of tribe and family in order, from Harb\'s arrival in the Hejaz to the Nakba.'}
          </p>
          <Timeline locale={locale} />
        </Reveal>

        <Reveal as="section" className="mt-16 rounded-2xl border border-[var(--color-line)] border-s-4 border-s-[var(--color-primary)] p-6">
          <h3 className="font-[family-name:var(--font-display)] font-bold">
            {ar ? 'ملاحظة في التأريخ' : 'A note on dating'}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
            {ar
              ? 'يرد في السجل الأصلي تاريخ ١٦١٠م لهجرة زين الدين، غير أن حساب الأجيال الخمسة الفاصلة بينه وبين جيل مواليد ١٩٣٠ يجعل ذلك مستحيلاً — إذ يقتضي متوسط جيل يقارب مئة عام. والأرجح أن الصواب ١٨١٠م، بسهو قلمٍ في خانة المئات عند النسخ. ويسند هذا الترجيح أن مجاعة الحجاز الكبرى وقعت فعلاً في تلك السنوات، وأن حروب النقب القبلية من وقائع القرن التاسع عشر، وأن مدافن الأجيال الأخيرة في خان يونس وعبسان لا تكون إلا بعد ١٩٤٨.'
              : 'The original record gives 1610 CE for Zain al-Din\'s migration, but the five generations separating him from those born around 1930 make that impossible — it would require an average generation of nearly a century. The likely correct date is 1810, a slip of the pen in the hundreds column. Supporting this: the great Hejaz famine fell in those years, the Negev tribal wars belong to the nineteenth century, and the burials of the latest generations in Khan Younis and Abasan can only postdate 1948.'}
          </p>
        </Reveal>

        <Reveal className="mt-12 flex flex-wrap gap-3">
          <Link href="/places" className="rounded-full border border-[var(--color-line)] px-6 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)]">
            {t('places')} →
          </Link>
          <Link href="/tribe" className="rounded-full border border-[var(--color-line)] px-6 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)]">
            {t('tribe')} →
          </Link>
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}

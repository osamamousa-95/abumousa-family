import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { TRIBE_ORIGINS, BANI_SALIM_CLANS, RELATED_FAMILIES } from '@/content/history';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tribe' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function TribePage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('tribe');
  const ar = locale === 'ar';

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Reveal>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">{t('subtitle')}</p>
        </Reveal>

        <Reveal className="mt-10 rounded-2xl bg-[var(--color-paper-2)] p-6">
          <p className="leading-loose">
            {ar
              ? 'حرب من أكبر قبائل الحجاز وأوسعها انتشاراً، تمتد ديارها من المدينة المنورة شمالاً إلى القنفذة جنوباً، ومن جدة والبحر الأحمر غرباً إلى ما وراء وادي الرمة شرقاً. وتنقسم إلى عمارتين كبيرتين: بني سالم وبني مسروح. وهذه العائلة من بني سالم.'
              : 'Harb is among the largest and most widespread tribes of the Hejaz, its lands reaching from Medina in the north to al-Qunfudhah in the south, and from Jeddah and the Red Sea eastward beyond Wadi al-Rummah. It divides into two great branches: Bani Salim and Bani Masruh. This family belongs to Bani Salim.'}
          </p>
        </Reveal>

        <section className="mt-14">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {t('originsTitle')}
            </h2>
          </Reveal>
          <div className="mt-6 space-y-3">
            {TRIBE_ORIGINS.map((o, i) => (
              <Reveal as="article" key={o.weight} delay={i * 70}>
                <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-[family-name:var(--font-display)] font-bold">
                      {ar ? o.view.ar : o.view.en}
                    </h3>
                    <span className="rounded-full bg-[var(--color-gold-100)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-gold-700)]">
                      {o.weight}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
                    {ar ? o.detail.ar : o.detail.en}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {t('clansTitle')}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{t('clansNote')}</p>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[BANI_SALIM_CLANS.marwah, BANI_SALIM_CLANS.maymun].map((g, i) => (
              <Reveal key={g.name.en} delay={i * 80}>
                <div className="h-full rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-[var(--color-primary)]">
                    {ar ? g.name.ar : g.name.en}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {g.clans.map((c) => (
                      <li
                        key={c}
                        className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-1 text-xs"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {t('relatedTitle')}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{t('relatedNote')}</p>
          </Reveal>
          <div className="mt-6 space-y-3">
            {RELATED_FAMILIES.map((f, i) => (
              <Reveal as="article" key={f.families} delay={i * 60}>
                <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{f.flag}</span>
                    <h3 className="font-[family-name:var(--font-display)] text-sm font-bold">
                      {ar ? f.country.ar : f.country.en}
                    </h3>
                  </div>
                  <p className="mt-2 font-semibold text-[var(--color-primary)]">
                    {f.families}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-2)]">
                    {ar ? f.note.ar : f.note.en}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

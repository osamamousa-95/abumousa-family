import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { PLACES } from '@/content/history';

import { MapSection } from '@/components/map/MapSection';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'places' });
  return { title: t('title'), description: t('subtitle') };
}

const ERA_COLOR: Record<string, string> = {
  hejaz: '#B8892B', egypt: '#5E6B47', palestine: '#7B2D26', diaspora: '#1F6FA8',
};

export default async function PlacesPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('places');
  const ar = locale === 'ar';
  const ordered = [...PLACES].sort((a, b) => a.order - b.order);

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

        <Reveal className="mt-10">
          <MapSection places={PLACES} locale={locale} />
        </Reveal>

        <div className="mt-14 space-y-4">
          {ordered.map((p, i) => (
            <Reveal as="article" key={p.id} delay={i * 50}>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: ERA_COLOR[p.era] }}
                  >
                    {p.order}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                      {ar ? p.name.ar : p.name.en}
                    </h2>
                    <p className="text-xs text-[var(--color-muted)]">
                      {ar ? p.region.ar : p.region.en}
                      {p.isBurial && (
                        <span className="ms-2 rounded-md bg-[var(--color-ox-100)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ox-700)]">
                          {t('burial')}
                        </span>
                      )}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
                      {ar ? p.body.ar : p.body.en}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';

export async function SiteFooter() {
  const t = await getTranslations('footer');

  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-paper-2)]">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="flex items-center justify-center gap-2 text-[var(--color-primary)]">
          <Logo size={30} />
          <span className="font-[family-name:var(--font-display)] text-base font-extrabold">
            {t('family')}
          </span>
        </div>

        <p className="mx-auto mt-5 max-w-lg text-center font-[family-name:var(--font-quran)] text-lg leading-loose text-[var(--color-muted)]">
          {t('verse')}
        </p>

        <dl className="mx-auto mt-9 max-w-xl space-y-3 border-t border-[var(--color-line)] pt-7 text-center text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {t('recordLabel')}
            </dt>
            <dd className="mt-1 font-semibold">سلامة سالم أبو موسى</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {t('researchLabel')}
            </dt>
            <dd className="mt-1 font-semibold">أسامة وحيد سلمان أبو موسى</dd>
          </div>
        </dl>

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--color-muted)]">
          {t('sources')}
        </p>
        <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
          {t('rights')}
        </p>
      </div>
    </footer>
  );
}

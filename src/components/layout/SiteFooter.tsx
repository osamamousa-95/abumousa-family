import { getTranslations, getLocale } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { READER_MESSAGE } from '@/content/scripture';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const locale = await getLocale();
  const ar = locale === 'ar';

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

        <p className="mx-auto mt-7 max-w-xl border-y border-[var(--color-line)] py-5 text-center font-[family-name:var(--font-quran)] text-base leading-loose">
          {ar ? READER_MESSAGE.ar : READER_MESSAGE.en}
        </p>

        <dl className="mx-auto mt-9 max-w-xl space-y-3 border-t border-[var(--color-line)] pt-7 text-center text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {t('recordLabel')}
            </dt>
            <dd className="mt-1 font-semibold">سلامة سالم أبو موسى</dd>
            <dd className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
              {ar
                ? 'حَفِظ أنساب العائلة وأخبارها ومدافنها جيلاً بعد جيل، وعلى ما دوّنه قام هذا السجلّ كله.'
                : 'He preserved the family\'s lineages, accounts and burial places generation after generation; on what he wrote this entire record rests.'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {t('researchLabel')}
            </dt>
            <dd className="mt-1 font-semibold">أسامة وحيد سلمان أبو موسى</dd>
            <dd className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
              {ar
                ? 'تفريغ السجلّ وتوثيقه، وتوسيع السياق التاريخي، وتصميم الموقع وبرمجته.'
                : 'Transcription and documentation, extension of the historical context, and the design and build of this site.'}
            </dd>
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

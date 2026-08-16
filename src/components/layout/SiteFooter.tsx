import { getTranslations, getLocale } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { READER_MESSAGE } from '@/content/scripture';
import { CREATOR } from '@/content/creator';

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

        <p className="mx-auto mt-7 max-w-xl border-y border-[var(--color-line)] py-5 text-center font-[family-name:var(--font-quran)] text-base leading-loose">
          {ar ? READER_MESSAGE.ar : READER_MESSAGE.en}
        </p>

        <dl className="mx-auto mt-9 max-w-xl space-y-4 text-center text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {ar ? 'كتابة السجلّ وتوثيقه ونقله' : 'Who wrote, documented and passed on the record'}
            </dt>
            <dd className="mt-1 font-semibold">سلامة سالم أبو موسى</dd>
            <dd className="mt-1 text-xs text-[var(--color-muted)]">
              {ar ? 'عليه يقوم كل اسمٍ وتاريخٍ في هذا الموقع' : 'On his work rests every name and date on this site'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {ar ? 'الإعداد والتصميم والتنفيذ' : 'Compilation, design and development'}
            </dt>
            <dd className="mt-1 font-semibold">أسامة وحيد سلمان أبو موسى</dd>
          </div>
        </dl>

        {/* التواصل — ظاهر لكل قارئ، لا مخبوءاً في صفحة داخلية */}
        <section className="mx-auto mt-10 max-w-lg rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold">
            {ar ? 'للتواصل مع مُعدّ السجلّ' : 'Contact the compiler'}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
            {ar
              ? 'لإضافة اسم ناقص، أو تصويب خطأ، أو إرسال خبرٍ أو صورة أو وثيقة عن أحد أفراد العائلة.'
              : 'To add a missing name, correct an error, or send a story, photograph or document about a family member.'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {CREATOR.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                {s.label}
              </a>
            ))}
          </div>
        </section>

        <p className="mt-9 text-center text-xs leading-relaxed text-[var(--color-muted)]">
          {t('sources')}
        </p>
        <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
          {t('rights')}
        </p>
      </div>
    </footer>
  );
}

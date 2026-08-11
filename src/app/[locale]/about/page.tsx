import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/routing';
import { SCRIPTURE, READER_MESSAGE } from '@/content/scripture';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === 'ar';
  return {
    title: ar ? 'عن المشروع' : 'About',
    description: ar
      ? 'عن هذا السجلّ ومن أعدّه، ولماذا وُجد.'
      : 'About this record, who compiled it, and why it exists.',
  };
}

const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/18JSABoTJ9/' },
  { label: 'Instagram', href: 'https://www.instagram.com/osamamousa204/' },
];

export default async function AboutPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const t = await getTranslations('nav');

  const work = ar
    ? [
        'تفريغ سجلّ العائلة المكتوب كاملاً وتحويله إلى قاعدة بيانات موثّقة — ٢٧٠ اسماً في عشرة أجيال، لكل اسم موضعه ومصدره',
        'التحقّق من التواريخ وتصويب ما وقع فيه سهو النسخ، ومنه تصحيح سنة الهجرة الأولى من ١٦١٠ إلى ١٨١٠ بحساب الأجيال ومطابقتها بأحداث التاريخ',
        'توسيع السياق التاريخي بالبحث في مصادر أنساب قبيلة حرب وتاريخ بئر السبع وقبائلها، وربط رواية العائلة بما ورد عند المؤرخين',
        'توثيق أماكن العائلة ومدافنها ورسمها على خريطة الهجرة',
        'تصميم الموقع وبرمجته بالكامل، وإتاحته بالعربية والإنجليزية',
      ]
    : [
        'Transcribing the family\u2019s written record into a documented database — 270 names across ten generations, each with its position and source',
        'Verifying dates and correcting copying errors, including the first migration year from 1610 to 1810 by generational arithmetic and historical corroboration',
        'Extending the historical context through research into the genealogy of the Harb tribe and the history of Beersheba and its tribes',
        'Documenting the family\u2019s places and burial sites and mapping the migration route',
        'Designing and building the site in full, in both Arabic and English',
      ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Reveal>
          <figure className="flex flex-col items-center text-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-[var(--color-gold-100)]">
              <Image
                src="/about/osama.jpg"
                alt={ar ? 'أسامة وحيد سلمان أبو موسى' : 'Osama Waheed Salman Abu Mousa'}
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="mt-5">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
                {ar ? 'أسامة وحيد سلمان أبو موسى' : 'Osama Waheed Salman Abu Mousa'}
              </h1>
              <p className="mt-2 text-[var(--color-muted)]">
                {ar
                  ? 'مهندس برمجيات — عمّان، الأردن'
                  : 'Software engineer — Amman, Jordan'}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {ar
                  ? 'الجيل التاسع من زين الدين الحربي'
                  : 'Ninth generation from Zain al-Din al-Harbi'}
              </p>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={80}>
          <section className="mt-12 space-y-4 leading-loose">
            <p>
              {ar
                ? 'مهندس برمجيات مقيم في عمّان، أعمل في تطوير أنظمة الويب منذ نحو ست سنوات، ودرست الهندسة المعمارية قبل أن أتحوّل إلى البرمجة. ولعلّ في الجمع بين الاثنين ما يفسّر هذا المشروع: فالمعمار يتعلّم أن يقرأ في البناء القديم أثر من بناه، والمبرمج يتعلّم أن ما لا يُوثَّق يضيع.'
                : 'A software engineer based in Amman, working in web systems for some six years. I studied architecture before turning to programming — and perhaps the combination explains this project: an architect learns to read in an old building the trace of whoever built it, and a programmer learns that whatever is not documented is lost.'}
            </p>
            <p>
              {ar
                ? 'جمعتني بالأنساب صلةٌ قديمة، إذ كنت أسأل عن أصلنا فلا أجد جواباً كاملاً — أسماء متفرقة في ذاكرة الكبار، وحكايات يعرف كلٌّ منها طرفاً. فكان هذا الموقع محاولةً لجمع ما تفرّق، قبل أن يتفرّق أكثر.'
                : 'Genealogy has held me for a long time. I would ask about our origin and never find a complete answer — scattered names in the memories of elders, and stories of which each person knew a fragment. This site is an attempt to gather what had scattered, before it scattered further.'}
            </p>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {ar ? 'لماذا هذا الموقع' : 'Why this site exists'}
            </h2>
            <div className="mt-4 space-y-4 leading-loose text-[var(--color-ink-2)]">
              <p>
                {ar
                  ? 'كل عائلة تملك ذاكرةً تعيش في صدور كبارها، فإذا رحلوا رحلت معهم. ونحن عائلة هُجّرت ثلاث مرات في قرنين — من الحجاز إلى مصر، ومن مصر إلى بئر السبع، ومن بئر السبع إلى خان يونس والشتات — وفي كل مرة كان يُفقد شيء: أرض، وبيت، وأسماء.'
                  : 'Every family holds a memory that lives in the breasts of its elders; when they go, it goes with them. Ours was displaced three times in two centuries — from the Hejaz to Egypt, from Egypt to Beersheba, from Beersheba to Khan Younis and the diaspora — and each time something was lost: land, a house, names.'}
              </p>
              <p>
                {ar
                  ? 'فأردت أن يكون لهذه العائلة مكانٌ واحد لا يُهجَّر: يجد فيه ابن العائلة اسمه وعمود نسبه، ويقرأ فيه الصغير من أين جاء، ويضيف إليه من يعرف ما لا نعرف. وأن يكون مفتوحاً بالعربية والإنجليزية معاً، لأنّ من أحفادنا من وُلد بعيداً ولا يقرأ العربية — وهم أولى الناس بأن نَصِلهم بجذرهم.'
                  : 'I wanted this family to have one place that cannot be displaced: where a member finds their name and their line of descent, where a child reads where they came from, and where those who know what we do not can add it. And open in Arabic and English together, because some of our grandchildren were born far away and do not read Arabic — and they are the ones most in need of being joined to their root.'}
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal delay={140}>
          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {ar ? 'ما أُنجز في هذا العمل' : 'What this work involved'}
            </h2>
            <ul className="mt-4 space-y-3">
              {work.map((w, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rotate-45 bg-[var(--color-gold-500)]" />
                  <span className="text-[var(--color-ink-2)]">{w}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={160}>
          <section className="mt-12 rounded-2xl border border-[var(--color-line)] border-s-4 border-s-[var(--color-primary)] p-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {ar ? 'المنهج' : 'Method'}
            </h2>
            <p className="mt-3 leading-loose text-[var(--color-ink-2)]">
              {ar
                ? 'اعتُمد في هذا السجلّ مبدأ واحد: لا يُثبت اسمٌ بلا مصدر، ولا يُقدَّم ترجيحٌ على أنه يقين. فما كان في السجل الأصلي غير واضح القراءة أُثبت وعليه علامة ٭، وما كان من التواريخ مستنبَطاً بالحساب ذُكر أنه ترجيح، وما لم يُعرف تُرك فراغاً ينتظر من يملؤه — فالفراغ المعلوم خيرٌ من الظنّ المكتوب.'
                : 'One principle governs this record: no name is entered without a source, and no probability is presented as certainty. What was unclear in the original record is entered with the mark ٭; dates inferred by calculation are stated as inference; and what is unknown is left blank, waiting for whoever can fill it — a known gap being better than a written guess.'}
            </p>
          </section>
        </Reveal>

        <Reveal delay={180}>
          <section className="mt-12 rounded-2xl bg-[var(--color-paper-2)] p-6 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {ar ? 'للتواصل والإضافة' : 'Contact and contributions'}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
              {ar
                ? 'إن كان عندك اسمٌ ناقص، أو تصويبٌ لخطأ، أو خبرٌ عن أحد أفراد العائلة أو صورة أو وثيقة — فأرجو أن تراسلني. هذا السجلّ يكبر بما تضيفه العائلة إليه.'
                : 'If you have a missing name, a correction, or a story, photograph or document about a family member, please write to me. This record grows by what the family adds to it.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {SOCIAL.map((s) => (
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
        </Reveal>

        <Reveal delay={200}>
          <section className="mt-14">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {ar ? 'في فضل صلة الرحم' : 'On the ties of kinship'}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {ar
                ? 'ليست معرفة النسب غايةً في ذاتها، بل وسيلةٌ إلى ما هو أعظم منها.'
                : 'Knowing lineage is not an end in itself, but a means to something greater.'}
            </p>
            <div className="mt-6 space-y-4">
              {SCRIPTURE.map((sc, i) => (
                <Reveal key={sc.id} delay={i * 60}>
                  <article className="rounded-2xl border border-[var(--color-line)] p-5">
                    <p className="font-[family-name:var(--font-quran)] text-xl leading-loose">
                      {sc.text}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[var(--color-gold-700)]">
                      {ar ? sc.attribution.ar : sc.attribution.en}
                    </p>
                    <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
                      {ar ? sc.gloss.ar : sc.gloss.en}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={220}>
          <blockquote className="mt-14 rounded-2xl bg-[var(--color-gold-100)] p-7 text-center">
            <p className="font-[family-name:var(--font-quran)] text-xl leading-loose text-[var(--color-ink)]">
              {ar ? READER_MESSAGE.ar : READER_MESSAGE.en}
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 text-center">
            <Link href="/tree" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              {ar ? 'ابدأ من الشجرة' : 'Start with the tree'} →
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}

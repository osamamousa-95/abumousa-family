import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';
import { CreatorCard } from '@/components/person/CreatorCard';
import { ChroniclerCard } from '@/components/about/ChroniclerCard';
import { Link } from '@/i18n/routing';
import { READER_MESSAGE } from '@/content/scripture';
import { CREATOR_SLUG } from '@/content/creator';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === 'ar';
  return {
    title: ar ? 'عن هذا السجلّ' : 'About this record',
    description: ar
      ? 'لماذا وُجد هذا السجلّ، ومنهجه، ومن يقف خلفه.'
      : 'Why this record exists, its method, and who stands behind it.',
  };
}

export default async function AboutPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const t = await getTranslations('nav');

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Reveal>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold">
            {ar ? 'لماذا وُجد هذا السجلّ' : 'Why this record exists'}
          </h1>
        </Reveal>

        <Reveal delay={80}>
          <section className="mt-6 space-y-4 leading-loose">
            <p>
              {ar
                ? 'كل عائلة تملك ذاكرةً تعيش في صدور كبارها، فإذا رحلوا رحلت معهم. ونحن عائلة هُجّرت ثلاث مرات في قرنين — من الحجاز إلى مصر، ومن مصر إلى بئر السبع، ومن بئر السبع إلى خان يونس والشتات — وفي كل مرة كان يُفقد شيء: أرض، وبيت، وأسماء.'
                : 'Every family holds a memory that lives in the breasts of its elders; when they go, it goes with them. Ours was displaced three times in two centuries — from the Hejaz to Egypt, from Egypt to Beersheba, from Beersheba to Khan Younis and the diaspora — and each time something was lost: land, a house, names.'}
            </p>
            <p>
              {ar
                ? 'فكان هذا السجلّ محاولةً لأن يكون لهذه العائلة مكانٌ واحد لا يُهجَّر: يجد فيه ابن العائلة اسمه وعمود نسبه، ويقرأ فيه الصغير من أين جاء، ويضيف إليه من يعرف ما لا نعرف. مفتوحٌ بالعربية والإنجليزية معاً، لأنّ من أحفادنا من وُلد بعيداً ولا يقرأ العربية — وهم أولى الناس بأن نَصِلهم بجذرهم.'
                : 'This record is an attempt to give the family one place that cannot be displaced: where a member finds their name and their line of descent, where a child reads where they came from, and where those who know what we do not can add it. Open in Arabic and English together, because some of our grandchildren were born far away and do not read Arabic — and they are the ones most in need of being joined to their root.'}
            </p>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="mt-10 rounded-2xl border border-[var(--color-line)] border-s-4 border-s-[var(--color-primary)] p-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {ar ? 'المنهج' : 'Method'}
            </h2>
            <p className="mt-3 leading-loose text-[var(--color-ink-2)]">
              {ar
                ? 'لا يُثبت اسمٌ بلا مصدر، ولا يُقدَّم ترجيحٌ على أنه يقين. فما كان غير واضح القراءة أُثبت وعليه علامة ٭، وما كان من التواريخ مستنبَطاً بالحساب ذُكر أنه ترجيح، وما لم يُعرف تُرك فراغاً ينتظر من يملؤه — فالفراغ المعلوم خيرٌ من الظنّ المكتوب.'
                : 'No name is entered without a source, and no probability is presented as certainty. What was unclear is entered with the mark ٭; dates inferred by calculation are stated as inference; and what is unknown is left blank, waiting for whoever can fill it — a known gap being better than a written guess.'}
            </p>
          </section>
        </Reveal>

        <Reveal delay={160}>
          <blockquote className="mt-14 rounded-2xl bg-[var(--color-gold-100)] p-7 text-center">
            <p className="font-[family-name:var(--font-quran)] text-xl leading-loose text-[var(--color-ink)]">
              {ar ? READER_MESSAGE.ar : READER_MESSAGE.en}
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-16"><ChroniclerCard locale={locale} /></div>
        </Reveal>

        {/* ── المعدّ — بعد كل المحتوى العائلي، لا قبله ── */}
        <Reveal delay={240}>
          <section className="mt-16">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {ar ? 'من نقل السجلّ ووسّعه' : 'Who transcribed and extended it'}
            </p>
            <CreatorCard locale={locale} variant="full" withPhoto showInterests={false} />
            <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
              <Link href={`/person/${CREATOR_SLUG}`} className="hover:text-[var(--color-primary)] hover:underline">
                {ar ? 'صفحته في شجرة العائلة ←' : 'His page in the family tree ←'}
              </Link>
            </p>
          </section>
        </Reveal>

        <Reveal delay={260}>
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

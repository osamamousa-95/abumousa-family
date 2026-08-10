import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('history') };
}

const ERAS = [
  {
    n: '١',
    title: 'الحجاز — ديار بني سالم',
    body: 'نشأت الأسرة في ديار قبيلة حرب الممتدة بين مكة والمدينة وينبع، من فرعها الكبير بني سالم — وهو المقصود بعبارة الدفتر «من عيال سالم». وفي مطلع القرن التاسع عشر عمّ القحط بلاد الحجاز حين انقطعت قوافل الميرة القادمة من مصر بسبب الحروب، وسجّل المؤرخ الجبرتي أن كثيراً من أهل المدينة ماتوا جوعاً. فخرج الناس مهاجرين إلى البلاد التي كان يأتيهم منها الطعام: مصر.',
    quote: 'عمّ القحط في بلاد الحجاز وعمّت المجاعات… ومن ضمن هؤلاء الناس هاجر زين الدين الحربي من قبيلة حرب من عيال سالم، هو وزوجته وولده الصغير موسى',
    cite: 'الدفتر، ص ١',
  },
  {
    n: '٢',
    title: 'مصر — كفر شبين، القليوبية',
    body: 'نزل زين الدين بأسرته قرية كفر شبين قرب شبين القناطر، وتوفي بعد نحو سنتين، وتوفيت زوجته بعده بست سنوات ودُفنت بجواره. ثم تزوّج موسى فتاة من قبائل عربية قدمت مع والدها من الجزيرة، فأنجب ستة أولاد وبنتاً — ومنهم امتدت العائلة كلها.',
    quote: null,
    cite: null,
  },
  {
    n: '٣',
    title: 'فلسطين — وادي الشلالة وبئر السبع',
    body: 'انتقلت الأسرة إلى شمال النقب واستقرت على الضفة الشرقية لوادي الشلالة في أرض زراعية خصبة. ويروي الدفتر حربين: أولى استمرت أربع سنوات هُزم فيها التياها — وكان أشهر مقاتلي أولاد موسى أكبرهم عبد العاطي — ثم حرب مع العزازمة قُتل فيها حسين وإسماعيل وعبد الرحمن أبناء موسى، ودُفنوا في قوز العز عند مقام الشيخ نوران. ثم توفي موسى ودُفن في الخلصة جنوب بئر السبع.',
    quote: 'ويُسمى بقوز العز لأنهم انتصروا فيه على أعدائهم واعتزوا بهذا الانتصار، ويُسمى بالقوز لأنه مرتفع عن الأراضي التي تحيط به',
    cite: 'الدفتر، ص ٣',
  },
  {
    n: '٤',
    title: 'خان يونس والشتات — وفرعٌ بقي في مصر',
    body: 'بعد نكبة ١٩٤٨ لجأت فروع بئر السبع إلى خان يونس وعبسان الصغيرة، ومنهما امتدت إلى الأردن وغيرها. أما فرع عبد النبي بن موسى فبقيت ذريته في مصر: مدافنهم في كفر شبين وشبين الكوم، وهم أقارب العائلة الباقون هناك إلى اليوم.',
    quote: null,
    cite: null,
  },
];

export default async function HistoryPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const tc = await getTranslations('credits');

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
          {t('history')}
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">
          رحلة العائلة في أربعة ديار، كما رواها دفتر الجدّ سلامة سالم أبو موسى.
        </p>

        <div className="mt-10 space-y-5">
          {ERAS.map((e) => (
            <article
              key={e.n}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-6"
            >
              <h2 className="flex items-center gap-3 font-[family-name:var(--font-display)] text-lg font-bold">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm text-white">
                  {e.n}
                </span>
                {e.title}
              </h2>
              <p className="mt-3 leading-relaxed">{e.body}</p>
              {e.quote && (
                <blockquote className="mt-4 rounded-lg border-s-4 border-[var(--color-gold-500)] bg-[var(--color-gold-100)] p-4 font-[family-name:var(--font-quran)] text-lg leading-loose">
                  «{e.quote}»
                  <footer className="mt-1 font-[family-name:var(--font-body)] text-xs text-[var(--color-muted)]">
                    — {e.cite}
                  </footer>
                </blockquote>
              )}
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-[var(--color-line)] border-s-4 border-s-[var(--color-primary)] p-5 text-sm leading-relaxed">
          <b>ملاحظة في التواريخ:</b> كُتب في الدفتر سنة ١٦١٠، لكن حساب الأجيال
          الخمسة بين زين الدين وجيل مواليد ١٩٣٠ يرجّح أن الصواب ١٨١٠ — سهو قلمٍ
          في خانة المئات عند النسخ. ويؤيده أن مجاعة الحجاز الكبرى وقعت فعلاً في
          تلك السنوات، وأن حروب النقب القبلية من وقائع القرن التاسع عشر.
        </section>

        <footer className="mt-12 border-t border-[var(--color-line)] pt-6 text-center text-xs text-[var(--color-muted)]">
          {tc('sourceLine')}
        </footer>
      </main>
    </>
  );
}

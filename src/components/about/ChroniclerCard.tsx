/**
 * The chronicler — the man who wrote the record down.
 * Everything on this site rests on what he preserved, so his section leads
 * the credits rather than trailing them.
 */
export function ChroniclerCard({ locale }: { locale: string }) {
  const ar = locale === 'ar';

  const contributions = ar
    ? [
        'كتب أنساب العائلة جيلاً بعد جيل، وأثبت أسماء الرجال والنساء معاً — وهو ما لا تفعله أكثر كتب الأنساب',
        'قيّد مدافن الأجداد بأسمائها ومواضعها: قوز العز والخلصة وكفر شبين وخان يونس',
        'حفظ رواية الهجرة الأولى من الحجاز، وسبب خروجها، وسنة وقوعها',
        'سجّل خبر الحربين مع التياها والعزازمة، وأسماء من استُشهدوا فيهما',
        'وثّق الفرع الذي بقي في مصر، فلولاه لانقطع خبر أقاربنا هناك',
      ]
    : [
        'He recorded the family lineages generation after generation, entering women alongside men — which most books of genealogy do not do',
        'He noted the ancestors burial places by name and location: Qawz al-Izz, al-Khalasa, Kafr Shubin, Khan Younis',
        'He preserved the account of the first migration from the Hejaz, its cause and its year',
        'He set down the two wars with the Tiyaha and the Azazma, and the names of those killed in them',
        'He documented the branch that remained in Egypt — without him, word of our relatives there would have been lost',
      ];

  return (
    <section className="rounded-2xl border-2 border-[var(--color-gold-500)] bg-[var(--color-gold-100)] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-700)]">
        {ar ? 'صاحب السجلّ' : 'The chronicler'}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl">
        سلامة سالم أبو موسى
      </h2>

      <p className="mt-5 leading-loose">
        {ar
          ? 'كل اسمٍ في هذه الشجرة، وكل تاريخٍ في هذه القصة، وكل مدفنٍ على هذه الخريطة — مصدره رجلٌ واحد جلس يكتب بيده ما كان يوشك أن يضيع. لم يكن مؤرخاً ولا نسّابةً محترفاً، بل ابن العائلة الذي رأى أن ذاكرة أهله تعيش في صدور الكبار وحدهم، وأنّ الكبار يرحلون.'
          : 'Every name in this tree, every date in this story, every burial place on this map traces back to one man who sat down and wrote by hand what was about to be lost. He was no historian nor professional genealogist, but a son of the family who saw that its memory lived only in the breasts of its elders — and that elders pass.'}
      </p>

      <p className="mt-4 leading-loose">
        {ar
          ? 'كتب في زمنٍ لم يكن فيه حاسوبٌ ولا قاعدة بيانات، ولا سبيل إلى التوثيق إلا الورق والقلم والذاكرة والسؤال. وكتب عن عائلةٍ مشتّتة بين مصر وفلسطين وغزة، فجمع في سجلٍّ واحد ما فرّقته ثلاث هجرات.'
          : 'He wrote in a time with no computer and no database, when documentation meant nothing but paper, pen, memory and asking. And he wrote of a family scattered between Egypt, Palestine and Gaza — gathering into one record what three migrations had pulled apart.'}
      </p>

      <div className="mt-6 border-t border-[var(--color-gold-500)] pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-700)]">
          {ar ? 'ما حفظه لنا' : 'What he preserved for us'}
        </p>
        <ul className="mt-3 space-y-2.5">
          {contributions.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-none rotate-45 bg-[var(--color-gold-700)]" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 border-t border-[var(--color-gold-500)] pt-5 font-[family-name:var(--font-quran)] text-lg leading-loose">
        {ar
          ? 'ما هذا الموقع إلا نقلٌ لما كتبه إلى وسيطٍ لا يبلى، وإضافةٌ إلى ما بدأه. فالفضل بعد الله لمن أمسك القلم أولاً.'
          : 'This site is no more than the transfer of what he wrote onto a medium that does not decay, and an addition to what he began. After God, the credit belongs to the one who first took up the pen.'}
      </p>
    </section>
  );
}

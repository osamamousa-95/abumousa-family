/** The chronicler — kept short by request; his credit leads the section. */
export function ChroniclerCard({ locale }: { locale: string }) {
  const ar = locale === 'ar';
  return (
    <section className="rounded-2xl border-2 border-[var(--color-gold-500)] bg-[var(--color-gold-100)] p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-700)]">
        {ar ? 'صاحب السجلّ' : 'The chronicler'}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold">
        سلامة سالم أبو موسى
      </h2>
      <p className="mt-4 leading-loose">
        {ar
          ? 'كل اسمٍ في هذه الشجرة، وكل مدفنٍ على هذه الخريطة، مصدره رجلٌ جلس يكتب بيده ما كان يوشك أن يضيع — أنساب العائلة ومدافنها ورواية هجرتها، وأثبت النساء مع الرجال. وما هذا الموقع إلا نقلٌ لما كتبه إلى وسيطٍ لا يبلى.'
          : 'Every name in this tree and every burial place on this map traces back to one man who sat and wrote by hand what was about to be lost — the family\u2019s lineages, its graves and the account of its migration, entering women alongside men. This site is no more than the transfer of his work onto a medium that does not decay.'}
      </p>
    </section>
  );
}

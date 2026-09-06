'use client';

import { useEffect, useState } from 'react';
import { CREATOR } from '@/content/creator';

export function ContributionNotice({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const ar = locale === 'ar';

  useEffect(() => {
    if (window.localStorage.getItem('family-tree-contribution-notice') !== 'dismissed') setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {ar ? 'سجلّ قيد البناء' : 'A record still being built'}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-extrabold">
              {ar ? 'ساعدنا في إكمال شجرة العائلة' : 'Help complete the family tree'}
            </h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-xl text-[var(--color-muted)]" aria-label={ar ? 'إغلاق' : 'Close'}>×</button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
          {ar
            ? 'هل لديك اسم ناقص، تصحيح، صورة، أو ملاحظة عن أحد أفراد العائلة؟ راسل المحرّر، فالشجرة قيد الإنشاء وتكبر بمساهماتكم وأفكاركم.'
            : 'Have a missing name, correction, photo, or family note? Contact the editor. The tree is under construction and grows through your contributions and ideas.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {CREATOR.social.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
              {social.label}
            </a>
          ))}
          <button type="button" onClick={() => { window.localStorage.setItem('family-tree-contribution-notice', 'dismissed'); setOpen(false); }} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
            {ar ? 'فهمت، لا تظهر مجدداً' : 'Got it, do not show again'}
          </button>
        </div>
      </div>
    </div>
  );
}
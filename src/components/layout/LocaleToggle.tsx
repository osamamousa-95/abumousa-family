'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

export function LocaleToggle({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      onClick={() =>
        startTransition(() => router.replace(pathname, { locale: switchTo }))
      }
      disabled={pending}
      className="rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] transition hover:bg-[var(--color-paper-2)] hover:text-[var(--color-primary)] disabled:opacity-50"
    >
      {label}
    </button>
  );
}

import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { Link } from '@/i18n/routing';

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const items = [
    { href: '/', label: t('home') },
    { href: '/tree', label: t('tree') },
    { href: '/history', label: t('history') },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center gap-2 px-5 py-3">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-primary)]">
          <Logo size={28} />
          <span className="font-[family-name:var(--font-display)] text-sm font-extrabold">
            أبو موسى
          </span>
        </Link>
        <div className="ms-auto flex gap-1">
          {items.slice(1).map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-paper-2)] hover:text-[var(--color-primary)]"
            >
              {i.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

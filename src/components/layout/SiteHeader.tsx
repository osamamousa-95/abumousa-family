import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { Link } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import { LocaleToggle } from './LocaleToggle';

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const c = await getTranslations('common');

  const items = [
    { href: '/tree', label: t('tree') },
    { href: '/history', label: t('history') },
    { href: '/places', label: t('places') },
    { href: '/tribe', label: t('tribe') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2.5">
        <Link
          href="/"
          className="flex flex-none items-center gap-2 text-[var(--color-primary)]"
        >
          <Logo size={26} />
          <span className="hidden font-[family-name:var(--font-display)] text-sm font-extrabold sm:inline">
            أبو موسى
          </span>
        </Link>

        <div className="mx-1 flex flex-1 gap-0.5 overflow-x-auto scrollbar-none">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-paper-2)] hover:text-[var(--color-primary)]"
            >
              {i.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-none items-center">
          <LocaleToggle label={c('toggleLanguage')} />
          <ThemeToggle label={c('toggleTheme')} />
        </div>
      </nav>
    </header>
  );
}

import type { ReactNode } from 'react';
import { auth, signOut } from '@/server/auth/config';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/Logo';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children, params,
}: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) return <>{children}</>;

  const user = session.user as { role?: string; mustChangePassword?: boolean; name?: string };
  const isSuper = user.role === 'SUPER_ADMIN';

  async function doSignOut() {
    'use server';
    await signOut({ redirectTo: `/${locale}` });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-paper-2)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-[var(--color-primary)]">
            <Logo size={24} />
            <span className="font-[family-name:var(--font-display)] text-sm font-extrabold">الإدارة</span>
          </Link>
          <nav className="mx-2 flex flex-1 gap-1 overflow-x-auto text-sm">
            <Link href="/admin/people" className="whitespace-nowrap rounded-full px-3 py-1.5 text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-primary)]">الأفراد</Link>
            {isSuper && <Link href="/admin/users" className="whitespace-nowrap rounded-full px-3 py-1.5 text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-primary)]">المشرفون</Link>}
            <Link href="/admin/password" className="whitespace-nowrap rounded-full px-3 py-1.5 text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-primary)]">كلمة المرور</Link>
            <Link href="/" className="whitespace-nowrap rounded-full px-3 py-1.5 text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-primary)]">الموقع ←</Link>
          </nav>
          <form action={doSignOut}>
            <button className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs hover:border-[var(--color-primary)]">خروج</button>
          </form>
        </div>
      </header>
      {user.mustChangePassword && (
        <div className="border-b border-[var(--color-gold-500)] bg-[var(--color-gold-100)] px-4 py-3 text-center text-sm">
          كلمة المرور الحالية مؤقتة — <Link href="/admin/password" className="font-semibold underline">غيّرها الآن</Link>
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

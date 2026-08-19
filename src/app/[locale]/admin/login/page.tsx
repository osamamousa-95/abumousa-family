import { redirect } from 'next/navigation';
import { signIn, auth } from '@/server/auth/config';
import { Logo } from '@/components/brand/Logo';

export default async function LoginPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  if ((await auth())?.user) redirect(`/${locale}/admin`);

  async function doLogin(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        identifier: formData.get('identifier'),
        password: formData.get('password'),
        redirectTo: '/ar/admin',
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
      redirect('/ar/admin/login?error=1');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <div className="text-center">
        <Logo size={48} className="mx-auto text-[var(--color-primary)]" />
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-extrabold">لوحة الإدارة</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">عائلة أبو موسى الحربي</p>
      </div>
      {error && (
        <p className="mt-6 rounded-xl border border-[var(--color-ox-300)] bg-[var(--color-ox-100)] p-3 text-center text-sm text-[var(--color-ox-700)]">
          بيانات الدخول غير صحيحة، أو الحساب معطَّل.
        </p>
      )}
      <form action={doLogin} className="mt-7 space-y-3">
        <input name="identifier" required autoComplete="username" placeholder="اسم المستخدم أو البريد"
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
        <input name="password" type="password" required autoComplete="current-password" placeholder="كلمة المرور"
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]" />
        <button className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]">
          دخول
        </button>
      </form>
    </main>
  );
}

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/server/auth/config';
import { requestOtp, changePassword } from '@/server/actions/admin';
import { ActionForm } from '@/components/admin/ActionForm';
import { Field } from '@/components/admin/Field';

export const dynamic = 'force-dynamic';

export default async function PasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);

  async function sendCode() {
    'use server';
    return requestOtp();
  }

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">تغيير كلمة المرور</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">اطلب رمز التحقق أولاً، ثم أدخله مع كلمة المرور الجديدة.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
          <h2 className="font-[family-name:var(--font-display)] font-bold">١ — اطلب الرمز</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">يُرسل إلى {session.user?.email}</p>
          <div className="mt-4">
            <ActionForm action={sendCode} submitLabel="إرسال رمز التحقق">
              <input type="hidden" name="_" value="1" />
            </ActionForm>
          </div>
        </section>
        <section className="rounded-2xl border border-[var(--color-line)] p-5">
          <h2 className="font-[family-name:var(--font-display)] font-bold">٢ — غيّر الكلمة</h2>
          <div className="mt-4">
            <ActionForm action={changePassword} submitLabel="تغيير كلمة المرور">
              <Field label="رمز التحقق" name="code" required placeholder="٦ أرقام" />
              <Field label="كلمة المرور الجديدة" name="password" type="password" required hint="١٠ محارف فأكثر" />
              <Field label="تأكيد كلمة المرور" name="confirm" type="password" required />
            </ActionForm>
          </div>
        </section>
      </div>
    </>
  );
}

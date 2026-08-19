import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/server/auth/config';
import { prisma } from '@/server/db/prisma';
import { createAdminUser, setUserActive, deleteUser } from '@/server/actions/admin';
import { ActionForm, ConfirmButton } from '@/components/admin/ActionForm';
import { Field } from '@/components/admin/Field';

export const dynamic = 'force-dynamic';

export default async function AdminUsers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requireSuperAdmin();
  if (!session) redirect(`/${locale}/admin`);

  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
  });
  const meId = (session.user as { id?: string }).id;

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">المشرفون</h1>
      <section className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">إضافة مشرف</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          تُعطى كلمة مرور مؤقتة، ويُطلب منه تغييرها عند أول دخول.
        </p>
        <div className="mt-4">
          <ActionForm action={createAdminUser} submitLabel="إضافة مشرف">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="الاسم" name="name" placeholder="أحمد" />
              <Field label="اسم المستخدم" name="username" required placeholder="ahmad" />
              <Field label="البريد الإلكتروني" name="email" type="email" required />
              <Field label="كلمة مرور مؤقتة" name="tempPassword" required hint="٨ محارف فأكثر" />
            </div>
          </ActionForm>
        </div>
      </section>
      <ul className="mt-8 divide-y divide-[var(--color-line)] rounded-xl border border-[var(--color-line)]">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {u.name ?? u.username}
                {u.id === meId && <span className="ms-2 text-xs text-[var(--color-muted)]">(أنت)</span>}
              </p>
              <p className="text-xs text-[var(--color-muted)]">{u.username} · {u.email}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              u.role === 'SUPER_ADMIN'
                ? 'bg-[var(--color-gold-100)] text-[var(--color-gold-700)]'
                : 'bg-[var(--color-paper-2)] text-[var(--color-muted)]'}`}>
              {u.role === 'SUPER_ADMIN' ? 'مشرف رئيسي' : 'مشرف'}
            </span>
            {!u.isActive && <span className="rounded-full bg-[var(--color-ox-100)] px-2.5 py-0.5 text-[11px] text-[var(--color-ox-700)]">معطَّل</span>}
            {u.mustChangePassword && <span className="rounded-full bg-[var(--color-gold-100)] px-2.5 py-0.5 text-[11px] text-[var(--color-gold-700)]">كلمة مرور مؤقتة</span>}
            {u.id !== meId && (
              <span className="flex gap-1.5">
                <ConfirmButton label={u.isActive ? 'تعطيل' : 'تفعيل'}
                  confirmText={u.isActive ? `تعطيل ${u.username}؟` : `تفعيل ${u.username}؟`}
                  onConfirm={() => setUserActive(u.id, !u.isActive)} />
                <ConfirmButton label="حذف" danger confirmText={`حذف ${u.username} نهائياً؟`}
                  onConfirm={() => deleteUser(u.id)} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

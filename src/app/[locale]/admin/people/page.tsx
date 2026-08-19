import { redirect } from 'next/navigation';
import { requireAdmin } from '@/server/auth/config';
import { getAdminPeople } from '@/server/services/admin-people';
import { PeopleManager } from '@/components/admin/PeopleManager';

export const dynamic = 'force-dynamic';

export default async function AdminPeople({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { locale } = await params;
  const { id } = await searchParams;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);

  const people = await getAdminPeople();
  const isSuper = (session.user as { role?: string }).role === 'SUPER_ADMIN';

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">إدارة الأفراد</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        تحكم كامل بكل حقول أي فرد. الترقيم والمسارات تُحسب تلقائياً، ولا حاجة لكتابة أي رمز.
      </p>
      <div className="mt-7">
        <PeopleManager people={people} locale={locale} canDelete={isSuper} initialId={id} />
      </div>
    </>
  );
}

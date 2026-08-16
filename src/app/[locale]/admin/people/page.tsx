import { redirect } from 'next/navigation';
import { requireAdmin } from '@/server/auth/config';
import { prisma } from '@/server/db/prisma';
import { PersonAdmin } from '@/components/admin/PersonAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminPeople({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);

  const rows = await prisma.person.findMany({
    orderBy: [{ generation: 'asc' }, { path: 'asc' }],
    select: {
      id: true, name: true, generation: true, gender: true, path: true,
      birthDateText: true, deathDateText: true, burialPlaceRaw: true, biography: true,
      father: { select: { name: true, father: { select: { name: true } } } },
    },
  });

  const people = rows.map((r) => ({
    id: r.id,
    name: r.name,
    generation: r.generation,
    gender: r.gender,
    lineage: [r.name, r.father?.name, r.father?.father?.name].filter(Boolean).join(' بن '),
    birthDateText: r.birthDateText ?? '',
    deathDateText: r.deathDateText ?? '',
    burialPlaceRaw: r.burialPlaceRaw ?? '',
    biography: r.biography ?? '',
  }));

  const isSuper = (session.user as { role?: string }).role === 'SUPER_ADMIN';

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">الأفراد</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        ابحث عن الأب أولاً ثم أضف ابنه — الترتيب يُحسب تلقائياً، ولا حاجة لكتابة أي رمز.
      </p>
      <div className="mt-7">
        <PersonAdmin people={people} locale={locale} canDelete={isSuper} />
      </div>
    </>
  );
}

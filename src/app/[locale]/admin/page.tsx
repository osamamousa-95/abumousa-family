import { redirect } from 'next/navigation';
import { requireAdmin } from '@/server/auth/config';
import { prisma } from '@/server/db/prisma';
import { Link } from '@/i18n/routing';
import { formatNumber } from '@/lib/arabic';

export const dynamic = 'force-dynamic';

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);

  const [people, males, females, gen, internal, admins, recent] = await Promise.all([
    prisma.person.count(),
    prisma.person.count({ where: { gender: 'MALE' } }),
    prisma.person.count({ where: { gender: 'FEMALE' } }),
    prisma.person.aggregate({ _max: { generation: true } }),
    prisma.marriage.count({ where: { isInternal: true } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
    prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
  ]);

  const cards = [
    { label: 'الأفراد', value: people },
    { label: 'الأجيال', value: gen._max.generation ?? 0 },
    { label: 'الذكور', value: males },
    { label: 'الإناث', value: females },
    { label: 'زيجات داخلية', value: internal },
    { label: 'المشرفون', value: admins },
  ];

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
        أهلاً {session.user?.name}
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4 text-center">
            <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-[var(--color-primary)]">
              {formatNumber(c.value, locale)}
            </div>
            <div className="mt-1 text-xs text-[var(--color-muted)]">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/admin/people" className="rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white">
          إدارة الأفراد
        </Link>
      </div>
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">آخر التعديلات</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">لا تعديلات بعد.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--color-line)] rounded-xl border border-[var(--color-line)]">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
                <span className="rounded-md bg-[var(--color-paper-2)] px-2 py-0.5 text-xs">{r.action}</span>
                <span>{(r.after as { name?: string })?.name ?? r.entity}</span>
                <span className="ms-auto text-xs text-[var(--color-muted)]">
                  {r.user?.name} · {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

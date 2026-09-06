import 'server-only';
import { prisma } from '@/server/db/prisma';
import type { AdminPerson } from '@/components/admin/PersonEditor';

/** Every person with every editable field, plus ancestor chains for search. */
export async function getAdminPeople(): Promise<AdminPerson[]> {
  const rows = await prisma.person.findMany({
    orderBy: [{ generation: 'asc' }, { sortOrder: 'asc' }],
    select: {
      id: true, name: true, nameLatin: true, generation: true, gender: true,
      sortOrder: true, fatherId: true, birthDateText: true, deathDateText: true,
      burialPlaceRaw: true, occupation: true, biography: true, notes: true,
      nameConfidence: true, isMartyr: true, isLiving: true, publicVisibility: true,
      children: { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, gender: true, sortOrder: true } },
      marriagesAsHusband: {
        select: { id: true, wifeNameText: true, isInternal: true, notes: true, wife: { select: { name: true } } },
      },
      marriagesAsWife: {
        select: { id: true, husbandNameText: true, isInternal: true, notes: true, husband: { select: { name: true } } },
      },
    },
  });

  const nameOf = new Map(rows.map((r) => [r.id, r.name]));
  const fatherOf = new Map(rows.map((r) => [r.id, r.fatherId]));

  return rows.map((r) => {
    const chain = [r.name];
    let cur = r.fatherId;
    let steps = 0;
    while (cur && steps < 12) {
      const nm = nameOf.get(cur);
      if (!nm) break;
      chain.push(nm);
      cur = fatherOf.get(cur) ?? null;
      steps++;
    }

    return {
      id: r.id,
      name: r.name,
      nameLatin: r.nameLatin ?? '',
      generation: r.generation,
      gender: r.gender,
      sortOrder: r.sortOrder,
      fatherId: r.fatherId,
      ancestors: chain,
      lineage: chain.slice(0, 4).join(' بن '),
      birthDateText: r.birthDateText ?? '',
      deathDateText: r.deathDateText ?? '',
      burialPlaceRaw: r.burialPlaceRaw ?? '',
      occupation: r.occupation ?? '',
      biography: r.biography ?? '',
      notes: r.notes ?? '',
      nameConfidence: r.nameConfidence,
      isMartyr: r.isMartyr,
      isLiving: r.isLiving,
      publicVisibility: r.publicVisibility,
      children: r.children,
      marriages: [
        ...r.marriagesAsHusband.map((m) => ({
          id: m.id, spouseName: m.wife?.name ?? m.wifeNameText ?? '—',
          isInternal: m.isInternal, notes: m.notes ?? '',
        })),
        ...r.marriagesAsWife.map((m) => ({
          id: m.id, spouseName: m.husband?.name ?? m.husbandNameText ?? '—',
          isInternal: m.isInternal, notes: m.notes ?? '',
        })),
      ],
    };
  });
}

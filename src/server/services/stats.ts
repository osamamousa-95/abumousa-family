import 'server-only';
import { prisma } from '@/server/db/prisma';

export interface FamilyStats {
  total: number;
  generations: number;
  males: number;
  females: number;
  topNames: { name: string; count: number }[];
  perGeneration: { generation: number; count: number }[];
}

/**
 * Aggregate figures for the homepage. Computed from the database so they can
 * never drift out of step with the tree the way hard-coded numbers do.
 */
export async function getFamilyStats(): Promise<FamilyStats | null> {
  const people = await prisma.person.findMany({
    where: { status: 'PUBLISHED' },
    select: { name: true, gender: true, generation: true },
  });
  if (people.length === 0) return null;

  const nameCount = new Map<string, number>();
  const genCount = new Map<number, number>();
  let males = 0;
  let females = 0;

  for (const p of people) {
    nameCount.set(p.name, (nameCount.get(p.name) ?? 0) + 1);
    genCount.set(p.generation, (genCount.get(p.generation) ?? 0) + 1);
    if (p.gender === 'FEMALE') females++;
    else if (p.gender === 'MALE') males++;
  }

  const topNames = [...nameCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .filter((n) => n.count > 1)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ar'))
    .slice(0, 8);

  const perGeneration = [...genCount.entries()]
    .map(([generation, count]) => ({ generation, count }))
    .sort((a, b) => a.generation - b.generation);

  return {
    total: people.length,
    generations: Math.max(...people.map((p) => p.generation)),
    males,
    females,
    topNames,
    perGeneration,
  };
}

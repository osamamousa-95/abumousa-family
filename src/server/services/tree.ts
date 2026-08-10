import 'server-only';
import { prisma } from '@/server/db/prisma';
import type { Viewer } from './privacy';
import { canSeeLivingDetails } from './privacy';

export interface TreeNodeDTO {
  id: string;
  slug: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  generation: number;
  path: string;
  fatherId: string | null;
  isLiving: boolean;
  isUncertain: boolean;
  isRedacted: boolean;
  notebookPage: string | null;
  burialPlace: string | null;
  spouseName: string | null;
  children: TreeNodeDTO[];
}

/**
 * The whole published tree in one query.
 *
 * At 271 people this serialises to roughly 60 KB; even at 3,000 it stays under
 * 100 KB gzipped. Below ~5,000 people, shipping the entire tree once is both
 * faster and far simpler than lazy-loading branches — search becomes instant
 * and client-side, and expansion costs no network round-trip.
 */
export async function getFullTree(viewer: Viewer): Promise<TreeNodeDTO | null> {
  const rows = await prisma.person.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ generation: 'asc' }, { sortOrder: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      gender: true,
      generation: true,
      path: true,
      fatherId: true,
      isLiving: true,
      nameConfidence: true,
      burialPlaceRaw: true,
      publicVisibility: true,
      sources: { select: { page: true }, take: 1 },
      marriagesAsHusband: {
        select: { wifeNameText: true, wife: { select: { name: true } } },
        take: 1,
      },
    },
  });

  if (rows.length === 0) return null;

  const canSeeLiving = canSeeLivingDetails(viewer);
  const byId = new Map<string, TreeNodeDTO>();
  const visible: typeof rows = [];

  for (const r of rows) {
    // Per-person overrides are absolute.
    if (r.publicVisibility === 'ADMIN' && viewer.kind !== 'member') continue;
    if (r.publicVisibility === 'MEMBERS' && !canSeeLiving) continue;
    visible.push(r);
  }

  for (const r of visible) {
    const redacted = r.isLiving && !canSeeLiving;
    const spouse =
      r.marriagesAsHusband[0]?.wife?.name ??
      r.marriagesAsHusband[0]?.wifeNameText ??
      null;

    byId.set(r.id, {
      id: r.id,
      slug: r.slug,
      name: r.name,
      gender: r.gender,
      generation: r.generation,
      path: r.path,
      fatherId: r.fatherId,
      isLiving: r.isLiving,
      isUncertain: r.nameConfidence === 'UNCERTAIN',
      isRedacted: redacted,
      // Living people expose name and tree position only — decision §1.3
      notebookPage: redacted ? null : r.sources[0]?.page ?? null,
      burialPlace: redacted ? null : r.burialPlaceRaw,
      spouseName: redacted ? null : spouse,
      children: [],
    });
  }

  let root: TreeNodeDTO | null = null;
  for (const node of byId.values()) {
    if (node.fatherId && byId.has(node.fatherId)) {
      byId.get(node.fatherId)!.children.push(node);
    } else if (!node.fatherId) {
      root = node;
    }
  }

  return root;
}

/** Flatten for search and counting. */
export function flattenTree(root: TreeNodeDTO | null): TreeNodeDTO[] {
  if (!root) return [];
  const out: TreeNodeDTO[] = [];
  const walk = (n: TreeNodeDTO) => {
    out.push(n);
    n.children.forEach(walk);
  };
  walk(root);
  return out;
}

/** "فلان بن فلان بن فلان" — the chain the notebook itself uses. */
export async function getLineageChain(personId: string): Promise<string> {
  const parts: { name: string; isFemale: boolean }[] = [];
  let currentId: string | null = personId;
  let guard = 0;

  while (currentId && guard < 40) {
    const p: { name: string; gender: string; fatherId: string | null } | null =
      await prisma.person.findUnique({
        where: { id: currentId },
        select: { name: true, gender: true, fatherId: true },
      });
    if (!p) break;
    parts.push({ name: p.name, isFemale: p.gender === 'FEMALE' });
    currentId = p.fatherId;
    guard++;
  }

  return parts
    .map((p, i) => {
      if (i === parts.length - 1) return p.name;
      const link = i === 0 && p.isFemale ? ' بنت ' : ' بن ';
      return p.name + link;
    })
    .join('');
}

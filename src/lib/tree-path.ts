/**
 * Hierarchical codes ("1.1.2.3") are derived, never typed by a contributor.
 * The family writes children oldest-to-youngest; that ordering is the input.
 */

export interface PathNode {
  id: string;
  fatherId: string | null;
  sortOrder: number;
}

export interface PathResult {
  id: string;
  path: string;
  generation: number;
}

/**
 * Recompute paths for an entire tree. O(n).
 * Roots (no father) are numbered 1, 2, 3… in sortOrder.
 */
export function computePaths(nodes: PathNode[]): PathResult[] {
  const childrenOf = new Map<string | null, PathNode[]>();
  for (const n of nodes) {
    const key = n.fatherId ?? null;
    const list = childrenOf.get(key);
    if (list) list.push(n);
    else childrenOf.set(key, [n]);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const out: PathResult[] = [];
  const walk = (fatherId: string | null, prefix: string, generation: number) => {
    const kids = childrenOf.get(fatherId) ?? [];
    kids.forEach((kid, i) => {
      const path = prefix ? `${prefix}.${i + 1}` : String(i + 1);
      out.push({ id: kid.id, path, generation });
      walk(kid.id, path, generation + 1);
    });
  };
  walk(null, '', 1);
  return out;
}

/** All descendants of a path — used as a SQL prefix filter. */
export function descendantPrefix(path: string): string {
  return `${path}.`;
}

export function isDescendantOf(path: string, ancestorPath: string): boolean {
  return path.startsWith(`${ancestorPath}.`);
}

/**
 * Kinship calculator.
 *
 * Given two people in a patrilineal tree, find their common ancestor and name
 * the relationship the way Arabic actually names it — عمّ, ابن عمّ, ابن أخ —
 * rather than in the abstract "second cousin twice removed" style, which has
 * no natural Arabic equivalent.
 */

export interface KinNode {
  id: string;
  name: string;
  fatherId: string | null;
}

export interface KinResult {
  kind:
    | 'same'
    | 'ancestor'      // A is an ancestor of B
    | 'descendant'    // A is a descendant of B
    | 'sibling'
    | 'uncle'         // A is the paternal uncle (or great-uncle) of B
    | 'nephew'        // A is the nephew of B
    | 'cousin'
    | 'unrelated';
  /** Steps from A up to the common ancestor. */
  upA: number;
  /** Steps from B up to the common ancestor. */
  upB: number;
  commonAncestorId: string | null;
  /** Cousin degree: 1 = أبناء عمومة مباشرون. */
  degree?: number;
  /** Generational offset between the two lines. */
  removed?: number;
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const AR_ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة'];
const EN_ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];

function ancestorsOf(id: string, byId: Map<string, KinNode>): string[] {
  const chain: string[] = [];
  let cur: string | null = id;
  let guard = 0;
  while (cur && guard < 60) {
    chain.push(cur);
    cur = byId.get(cur)?.fatherId ?? null;
    guard++;
  }
  return chain;
}

export function computeKinship(
  aId: string,
  bId: string,
  nodes: KinNode[]
): KinResult {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const a = byId.get(aId);
  const b = byId.get(bId);

  const none: KinResult = {
    kind: 'unrelated', upA: -1, upB: -1, commonAncestorId: null,
    label: { ar: 'لا صلة معروفة', en: 'No known relation' },
    detail: {
      ar: 'لم يُعثر على جدٍّ مشترك بين الاسمين في السجلّ.',
      en: 'No common ancestor was found between these two names in the record.',
    },
  };
  if (!a || !b) return none;

  if (aId === bId) {
    return {
      kind: 'same', upA: 0, upB: 0, commonAncestorId: aId,
      label: { ar: 'الشخص نفسه', en: 'The same person' },
      detail: { ar: 'اخترت الاسم نفسه مرتين.', en: 'You selected the same name twice.' },
    };
  }

  const chainA = ancestorsOf(aId, byId);
  const chainB = ancestorsOf(bId, byId);
  const indexB = new Map(chainB.map((id, i) => [id, i]));

  let commonId: string | null = null;
  let upA = -1;
  let upB = -1;
  for (let i = 0; i < chainA.length; i++) {
    const hit = indexB.get(chainA[i]);
    if (hit !== undefined) {
      commonId = chainA[i];
      upA = i;
      upB = hit;
      break;
    }
  }
  if (!commonId) return none;

  const ancestorName = byId.get(commonId)?.name ?? '';
  const nameA = a.name;
  const nameB = b.name;

  // A is an ancestor of B
  if (upA === 0) {
    const g = upB;
    const ar = g === 1 ? 'الأب' : g === 2 ? 'الجدّ' : g === 3 ? 'جدّ الأب' : `الجدّ الأعلى (${g} أجيال)`;
    const en = g === 1 ? 'father' : g === 2 ? 'grandfather' : `ancestor, ${g} generations up`;
    return {
      kind: 'ancestor', upA, upB, commonAncestorId: commonId,
      label: { ar, en },
      detail: {
        ar: `${nameA} هو ${ar} لـ${nameB}، بفارق ${g} من الأجيال.`,
        en: `${nameA} is the ${en} of ${nameB}, ${g} generation(s) apart.`,
      },
    };
  }

  // A is a descendant of B
  if (upB === 0) {
    const g = upA;
    const ar = g === 1 ? 'الابن' : g === 2 ? 'الحفيد' : `من الذرية (${g} أجيال)`;
    const en = g === 1 ? 'son' : g === 2 ? 'grandson' : `descendant, ${g} generations down`;
    return {
      kind: 'descendant', upA, upB, commonAncestorId: commonId,
      label: { ar, en },
      detail: {
        ar: `${nameA} هو ${ar} لـ${nameB}، بفارق ${g} من الأجيال.`,
        en: `${nameA} is the ${en} of ${nameB}, ${g} generation(s) apart.`,
      },
    };
  }

  // Siblings
  if (upA === 1 && upB === 1) {
    return {
      kind: 'sibling', upA, upB, commonAncestorId: commonId,
      label: { ar: 'أخوان', en: 'Siblings' },
      detail: {
        ar: `${nameA} و${nameB} إخوة، أبوهما ${ancestorName}.`,
        en: `${nameA} and ${nameB} are siblings; their father is ${ancestorName}.`,
      },
    };
  }

  // A is uncle / great-uncle of B
  if (upA === 1) {
    const g = upB - 1;
    const ar = g === 1 ? 'العمّ' : g === 2 ? 'عمّ الأب' : `عمّ الجدّ (${g} أجيال)`;
    return {
      kind: 'uncle', upA, upB, commonAncestorId: commonId,
      label: { ar, en: g === 1 ? 'paternal uncle' : `great-uncle (${g})` },
      detail: {
        ar: `${nameA} هو ${ar} لـ${nameB}. وجدُّهما المشترك ${ancestorName}.`,
        en: `${nameA} is the ${g === 1 ? 'paternal uncle' : 'great-uncle'} of ${nameB}. Their common ancestor is ${ancestorName}.`,
      },
    };
  }

  // A is nephew of B
  if (upB === 1) {
    const g = upA - 1;
    const ar = g === 1 ? 'ابن الأخ' : `من ذرية الأخ (${g} أجيال)`;
    return {
      kind: 'nephew', upA, upB, commonAncestorId: commonId,
      label: { ar, en: g === 1 ? 'nephew' : `grand-nephew (${g})` },
      detail: {
        ar: `${nameA} هو ${ar} لـ${nameB}. وجدُّهما المشترك ${ancestorName}.`,
        en: `${nameA} is the ${g === 1 ? 'nephew' : 'grand-nephew'} of ${nameB}. Their common ancestor is ${ancestorName}.`,
      },
    };
  }

  // Cousins
  const degree = Math.min(upA, upB) - 1;
  const removed = Math.abs(upA - upB);
  const ordAr = AR_ORD[Math.min(degree, AR_ORD.length - 1)] || `${degree}`;
  const ordEn = EN_ORD[Math.min(degree, EN_ORD.length - 1)] || `${degree}`;

  const labelAr =
    removed === 0
      ? degree === 1
        ? 'ابنا عمّ'
        : `أبناء عمومة من الدرجة ${ordAr}`
      : `أبناء عمومة من الدرجة ${ordAr}، مع فارق ${removed} من الأجيال`;

  const labelEn =
    removed === 0
      ? `${ordEn} cousins`
      : `${ordEn} cousins, ${removed} removed`;

  return {
    kind: 'cousin', upA, upB, commonAncestorId: commonId, degree, removed,
    label: { ar: labelAr, en: labelEn },
    detail: {
      ar:
        removed === 0
          ? `${nameA} و${nameB} ${labelAr}. وجدُّهما المشترك ${ancestorName} — يصعد إليه ${nameA} بـ${upA} من الآباء، و${nameB} بـ${upB}.`
          : `${nameA} و${nameB} تجمعهما قرابة من الدرجة ${ordAr} مع فارق ${removed} من الأجيال. وجدُّهما المشترك ${ancestorName}.`,
      en: `${nameA} and ${nameB} are ${labelEn}. Their common ancestor is ${ancestorName} — ${upA} step(s) up from ${nameA}, ${upB} from ${nameB}.`,
    },
  };
}

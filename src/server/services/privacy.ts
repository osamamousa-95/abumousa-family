/**
 * Privacy layer — approved decision §1.3.
 *
 * Living family members are exposed to the public as a name and a position in
 * the tree, nothing more. Several branches of this family live in Gaza, Khan
 * Younis and Abasan; publishing birth dates, residences, photographs and phone
 * numbers of living people is a real safety exposure, not a theoretical one.
 *
 * This runs at the data-access layer. A component can never receive a field it
 * is not allowed to render, so a forgotten check in the UI cannot leak anything.
 */

import type { Role } from '@prisma/client';

export type Viewer =
  | { kind: 'public' }
  | { kind: 'member'; role: Role }
  ;

/** Fields stripped from living people for viewers without member access. */
const RESTRICTED_FOR_LIVING = [
  'birthDateText', 'birthDateEarliest', 'birthDateLatest', 'birthDatePrecision',
  'residenceId', 'residence',
  'biography', 'occupation', 'notes',
  'phone', 'email',
  'media',
] as const;

const ALWAYS_PRIVATE = ['phone', 'email'] as const;

export function canSeeLivingDetails(viewer: Viewer): boolean {
  return viewer.kind === 'member';
}

export function isAdmin(viewer: Viewer): boolean {
  return (
    viewer.kind === 'member' &&
    (viewer.role === 'ADMIN' || viewer.role === 'SUPER_ADMIN')
  );
}

/**
 * Strip a person record according to the viewer.
 * Deceased ancestors — the historical material, and the point of the site —
 * remain fully public.
 */
export function applyPersonPrivacy<T extends Record<string, unknown>>(
  person: T & { isLiving?: boolean; publicVisibility?: string },
  viewer: Viewer
): Partial<T> | null {
  const result: Record<string, unknown> = { ...person };

  // Explicit per-person override always wins.
  if (person.publicVisibility === 'ADMIN' && !isAdmin(viewer)) return null;
  if (person.publicVisibility === 'MEMBERS' && !canSeeLivingDetails(viewer)) {
    return null;
  }

  for (const f of ALWAYS_PRIVATE) {
    if (!isAdmin(viewer)) delete result[f];
  }

  if (person.isLiving && !canSeeLivingDetails(viewer)) {
    for (const f of RESTRICTED_FOR_LIVING) delete result[f];
    result.isRedacted = true;
  }

  return result as Partial<T>;
}

export function applyPersonPrivacyList<T extends Record<string, unknown>>(
  people: (T & { isLiving?: boolean; publicVisibility?: string })[],
  viewer: Viewer
): Partial<T>[] {
  return people
    .map((p) => applyPersonPrivacy(p, viewer))
    .filter((p): p is Partial<T> => p !== null);
}

/** Notebook scans are admin-only — approved decision §1.6. */
export function canSeeNotebookScans(viewer: Viewer): boolean {
  return isAdmin(viewer);
}

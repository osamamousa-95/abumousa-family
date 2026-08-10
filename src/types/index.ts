import type { Locale } from '@/lib/localize';

export type { Locale };

/** Slim projection sent to the client for the interactive tree. */
export interface TreeNode {
  id: string;
  slug: string;
  name: string;
  nameLatin: string | null;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  generation: number;
  path: string;
  fatherId: string | null;
  isLiving: boolean;
  isUncertain: boolean;
  hasSpouse: boolean;
  notebookPage: string | null;
  burialPlace: string | null;
  children?: TreeNode[];
}

export interface PersonDetail extends TreeNode {
  birthDateText: string | null;
  deathDateText: string | null;
  biography: string | null;
  occupation: string | null;
  residence: string | null;
  spouses: { id: string | null; name: string; isInternal: boolean }[];
  sources: { title: string; page: string | null }[];
  isRedacted?: boolean;
}

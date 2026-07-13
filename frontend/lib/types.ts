export type SeedType =
  | 'PENSAMENTO'
  | 'PROJETO'
  | 'DOCUMENTO'
  | 'OBJETIVO'
  | 'CHECKLIST'
  | 'DIARIO'
  | 'ARTIGO'
  | 'LIVRO'
  | 'PLANEJAMENTO';

export type SeedStatus = 'SEMENTE' | 'CRESCENDO' | 'PROJETO' | 'COLHIDA';
export type SeedVisibility = 'PRIVATE' | 'PUBLIC';

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

export interface SeedOwner {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
}

export interface Seed {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  type: SeedType;
  status: SeedStatus;
  visibility: SeedVisibility;
  favorite: boolean;
  archived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versions?: SeedVersion[];
  owner?: SeedOwner;
  isOwner?: boolean;
  _count?: { comments: number; savedBy: number };
}

export interface Comment {
  id: string;
  seedId: string;
  content: string;
  createdAt: string;
  author: SeedOwner;
}

export interface ProfileStats {
  totalSeeds: number;
  byStatus: Record<SeedStatus, number>;
  publicSeeds: number;
  activeDays: number;
  contributions: number;
  memberSince: string;
}

export interface SeedVersion {
  id: string;
  seedId: string;
  content: string;
  note: string | null;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: 'USER' | 'AI';
  message: string;
  createdAt: string;
}

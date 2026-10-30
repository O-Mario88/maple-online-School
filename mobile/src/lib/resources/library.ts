import type { components } from '@/lib/api/schema';
import { isStaff } from '@/lib/roles';

export type Resource = components['schemas']['Resource'];
export type ClassResource = components['schemas']['ClassResource'];

const WHERE: Readonly<Record<Resource['visibility'], string>> = {
  private: 'Only you',
  institution_only: 'School library',
  platform_shared: 'Maple library',
  marketplace_public: 'Marketplace',
};

/** The address to open: the link a teacher added, or an uploaded file. */
export function resourceHref(r: Resource, mediaBase: string): string | null {
  if (r.external_url) return r.external_url;
  if (r.file_path) return mediaBase.replace(/\/+$/, '') + r.file_path;
  return null;
}

/** One line under the title: category, author and where it is shared. */
export function resourceDetail(r: Resource): string {
  return [r.category, r.author_name, WHERE[r.visibility]].filter(Boolean).join(' · ');
}

/** Checks the add-a-link form. Returns a message to show, or null when it is fine. */
export function checkNewLink(title: string, url: string): string | null {
  if (!title.trim()) return 'Give the resource a title.';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return null;
  } catch {
    // fall through to the message below
  }
  return 'Enter a web address starting with http:// or https://.';
}

interface MembershipLike {
  institution_id: number;
  institution_name: string;
  role: string;
  status: string;
}

export interface LibraryChoice {
  id: number;
  name: string;
}

/** School libraries the person can add to: schools where they are active staff. */
export function libraryChoices(memberships: readonly MembershipLike[]): LibraryChoice[] {
  return memberships
    .filter((m) => isStaff([m]))
    .map((m) => ({ id: m.institution_id, name: m.institution_name }));
}

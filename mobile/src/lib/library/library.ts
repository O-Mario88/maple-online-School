import type { components } from '@/lib/api/schema';
import { isStaff } from '@/lib/roles';

export type LibraryItem = components['schemas']['LibraryItem'];
export type AssignedReading = components['schemas']['AssignedReading'];
export type ContinueItem = components['schemas']['ContinueItem'];
export type ReadingRow = components['schemas']['ReadingRow'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Where uploaded files are served from. */
export const MEDIA_URL = process.env.EXPO_PUBLIC_MEDIA_URL ?? 'http://localhost:8000';

const TYPE_LABEL: Readonly<Record<string, string>> = {
  notes: 'Notes',
  textbook: 'Textbook',
  pdf: 'PDF',
  document: 'Document',
  video: 'Video',
  slides: 'Slides',
  worksheet: 'Worksheet',
  mock_exam: 'Past paper',
  revision: 'Revision',
  teacher_guide: 'Teacher guide',
};

const WHERE: Readonly<Record<string, string>> = {
  private: 'Only you',
  class: 'Shared with classes',
  institution: 'School library',
  global: 'Maple library',
};

/** The address to open: the link, or an uploaded file. */
export function itemHref(item: Pick<LibraryItem, 'external_url' | 'file_url'>, mediaBase: string): string | null {
  if (item.external_url) return item.external_url;
  if (item.file_url) return mediaBase.replace(/\/+$/, '') + item.file_url;
  return null;
}

/** What kind of item it is, in words ("Past paper"); anything unknown is a "Resource". */
export function typeLabel(contentType: string): string {
  return TYPE_LABEL[contentType] ?? 'Resource';
}

/** One line under the title: type, author, and where it is (or its review state). */
export function itemDetail(item: LibraryItem): string {
  const type = typeLabel(item.content_type);
  let where = WHERE[item.visibility_scope] ?? '';
  if (item.publication_status === 'under_review') where = 'Waiting for review';
  if (item.publication_status === 'rejected') where = 'Not approved';
  return [type, item.uploader_name, where].filter(Boolean).join(' · ');
}

/** "Due today", "Due tomorrow", "Due in N days", "Overdue", or null when there's no date. */
export function dueLabel(due: string | null | undefined, now: Date): string | null {
  if (!due) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueDate = new Date(due);
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const days = Math.round((dueDay - startOfToday) / DAY_MS);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

/** Checks the add-a-link form. Returns a message to show, or null when it is fine. */
export function checkNewLink(title: string, url: string): string | null {
  if (!title.trim()) return 'Give the item a title.';
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
  return memberships.filter((m) => isStaff([m])).map((m) => ({ id: m.institution_id, name: m.institution_name }));
}

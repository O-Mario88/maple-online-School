import type { components } from '@/lib/api/schema';

export type FamilyLink = components['schemas']['FamilyLink'];
export type LinkStatus = FamilyLink['status'];

export interface ParsedChildClaim {
  mode: 'qr' | 'code' | 'login';
  token: string;
}

/** How a link's status reads to a parent or a school. */
export function linkStatus(status: LinkStatus): { label: string; tone: 'warning' | 'good' | 'danger' } {
  switch (status) {
    case 'approved':
      return { label: 'Confirmed', tone: 'good' };
    case 'declined':
      return { label: 'Declined', tone: 'danger' };
    default:
      return { label: 'Waiting for the school', tone: 'warning' };
  }
}

export function relationshipLabel(relationship: string): string {
  if (!relationship) return 'Guardian';
  return relationship.charAt(0).toUpperCase() + relationship.slice(1);
}

/**
 * Parses a cross-school child claim input from a school-issued QR code URL,
 * an 8-character claim code, or a platform login handle / admission ID.
 */
export function parseChildClaimInput(raw: string): ParsedChildClaim | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^maple:\/\/claim\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
    const codeMatch = /[?&]code=([A-Za-z0-9-]+)/i.exec(trimmed) ?? /\/claim\/([A-Za-z0-9-]+)/i.exec(trimmed);
    const token = (codeMatch?.[1] ?? trimmed).toUpperCase();
    return { mode: 'qr', token };
  }

  if (trimmed.includes('@') || trimmed.includes('.')) {
    return { mode: 'login', token: trimmed.toLowerCase() };
  }

  const clean = trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (clean.length < 4) return null;
  return { mode: 'code', token: clean };
}

/** Lists the distinct Maple-powered schools represented across a parent's linked children. */
export function distinctChildSchools<T extends { school: string }>(children: readonly T[]): string[] {
  const seen = new Set<string>();
  for (const child of children) {
    if (child.school) seen.add(child.school);
  }
  return Array.from(seen);
}

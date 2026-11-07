/**
 * Text by role: every size, line height, weight and colour comes from the type scale and the
 * Maple tokens, so new screens never write a font size (the design-system ratchet counts them).
 * components/ui/Type.tsx draws it.
 */
import { Maple, TypeScale } from '@/constants/maple';

export type TypeRoleName = keyof typeof TypeScale;
export type TypeTone = 'default' | 'muted' | 'onDark';

const TITLES: ReadonlySet<TypeRoleName> = new Set(['pageTitle', 'sectionTitle', 'cardTitle', 'kpi']);
const QUIET: ReadonlySet<TypeRoleName> = new Set(['meta', 'bodySecondary']);

function colorFor(role: TypeRoleName, tone: TypeTone): string {
  if (tone === 'onDark') return Maple.white;
  if (tone === 'muted' || QUIET.has(role)) return Maple.secondary;
  return TITLES.has(role) ? Maple.navy : Maple.body;
}

/** The style for a role, and its heading level: 1 for the page title, 2 for section and card titles. */
export function typeRole(role: TypeRoleName, tone: TypeTone): { style: (typeof TypeScale)[TypeRoleName] & { color: string }; heading: 1 | 2 | null } {
  const heading = role === 'pageTitle' ? 1 : role === 'sectionTitle' || role === 'cardTitle' ? 2 : null;
  return { style: { ...TypeScale[role], color: colorFor(role, tone) }, heading };
}

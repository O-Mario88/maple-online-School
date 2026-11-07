/**
 * Who a designed portal frame (top bar and sidebar) shows as signed in. The
 * frames came with a sample person; once someone is signed in, the frame shows
 * them, so every page of a portal names the same person.
 */
export interface FrameMe {
  name: string;
  role: string;
  avatar?: number;
  initial: string;
  notifications: number;
}

const TITLES = new Set(['dr', 'mr', 'mrs', 'ms', 'miss', 'prof', 'sir', 'madam']);

function initialOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words.find((w) => !TITLES.has(w.replace(/\./g, '').toLowerCase())) ?? words[0] ?? '';
  return first.charAt(0).toUpperCase();
}

export function frameIdentity<T extends FrameMe>(fixture: T, signedInName: string | undefined): T {
  const name = signedInName?.trim();
  if (!name) return fixture;
  const same = name === fixture.name;
  return { ...fixture, name, initial: initialOf(name), avatar: same ? fixture.avatar : undefined };
}

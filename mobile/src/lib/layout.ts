/** Small layout helpers shared by the UI components. */

/** Up to two initials for an avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** How many equal columns at least `min` wide fit in `width`. */
export function gridColumns(width: number, min: number, gap: number, count: number): number {
  if (width <= 0) return 1;
  const fit = Math.max(1, Math.floor((width + gap) / (min + gap)));
  return Math.min(fit, Math.max(1, count));
}


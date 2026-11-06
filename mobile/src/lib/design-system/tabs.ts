/**
 * Keyboard movement for Maple tab bars (WAI-ARIA tabs pattern): arrows move
 * and wrap, Home and End jump to the ends. Returns null for any other key.
 */
export function nextTabKey<K extends string>(items: readonly { key: K }[], active: K, key: string): K | null {
  if (items.length === 0) return null;
  const i = Math.max(0, items.findIndex((t) => t.key === active));
  switch (key) {
    case 'ArrowRight':
      return items[(i + 1) % items.length].key;
    case 'ArrowLeft':
      return items[(i - 1 + items.length) % items.length].key;
    case 'Home':
      return items[0].key;
    case 'End':
      return items[items.length - 1].key;
    default:
      return null;
  }
}

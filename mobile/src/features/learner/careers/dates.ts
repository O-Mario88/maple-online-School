/** Whole days from one ISO date to another (only the date part is read). */
export function daysBetween(from: string, to: string): number {
  const day = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return Date.UTC(y, m - 1, d) / 86_400_000;
  };
  return day(to) - day(from);
}

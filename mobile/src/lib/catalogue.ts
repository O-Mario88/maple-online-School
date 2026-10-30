/** Searching, filtering and sorting the public catalogue of courses, live classes and past papers. */

export type CatalogueKind = 'course' | 'live' | 'paper' | 'bootcamp' | 'short';
export type PriceBand = 'any' | 'free' | 'under50k' | 'under100k';
export type CatalogueSort = 'popular' | 'rating' | 'priceLow' | 'priceHigh';

export interface CatalogueItem {
  id: string;
  kind: CatalogueKind;
  title: string;
  board: string;
  country: string;
  level: string;
  subject: string;
  teacher: string;
  rating: number;
  reviews: number;
  priceUGX: number;
}

export interface CatalogueFilters {
  query: string;
  kinds: readonly string[];
  boards: readonly string[];
  levels: readonly string[];
  subjects: readonly string[];
  countries: readonly string[];
  price: PriceBand;
}

export const EMPTY_FILTERS: CatalogueFilters = { query: '', kinds: [], boards: [], levels: [], subjects: [], countries: [], price: 'any' };

const PRICE_CEILING: Readonly<Record<PriceBand, number>> = { any: Infinity, free: 0, under50k: 50000, under100k: 100000 };

function matchesAny(selected: readonly string[], value: string): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesQuery(item: CatalogueItem, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = `${item.title} ${item.subject} ${item.teacher} ${item.board}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** Items matching every filter group; within a group, any ticked value matches. */
export function filterCatalogue<T extends CatalogueItem>(items: readonly T[], f: CatalogueFilters): T[] {
  const ceiling = PRICE_CEILING[f.price];
  return items.filter(
    (i) =>
      matchesQuery(i, f.query) &&
      matchesAny(f.kinds, i.kind) &&
      matchesAny(f.boards, i.board) &&
      matchesAny(f.levels, i.level) &&
      matchesAny(f.subjects, i.subject) &&
      matchesAny(f.countries, i.country) &&
      i.priceUGX <= ceiling,
  );
}

const COMPARE: Readonly<Record<CatalogueSort, (a: CatalogueItem, b: CatalogueItem) => number>> = {
  popular: (a, b) => b.reviews - a.reviews,
  rating: (a, b) => b.rating - a.rating,
  priceLow: (a, b) => a.priceUGX - b.priceUGX,
  priceHigh: (a, b) => b.priceUGX - a.priceUGX,
};

/** A sorted copy; the input is left as it was. */
export function sortCatalogue<T extends CatalogueItem>(items: readonly T[], sort: CatalogueSort): T[] {
  return [...items].sort(COMPARE[sort]);
}

/** How many items carry each value of a field, for the counts beside each filter. */
export function facetCounts(items: readonly CatalogueItem[], field: 'kind' | 'board' | 'level' | 'subject' | 'country'): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i[field]]: (acc[i[field]] ?? 0) + 1 }), {});
}

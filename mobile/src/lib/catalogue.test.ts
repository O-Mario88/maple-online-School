import { type CatalogueItem, EMPTY_FILTERS, facetCounts, filterCatalogue, filtersFromLink, sortCatalogue } from './catalogue';

const item = (over: Partial<CatalogueItem>): CatalogueItem => ({
  id: 'x',
  kind: 'course',
  title: 'Maths',
  board: 'UNEB',
  country: 'Uganda',
  level: 'Upper secondary',
  subject: 'Mathematics',
  teacher: 'Mr. Kato',
  rating: 4.5,
  reviews: 100,
  priceUGX: 50000,
  ...over,
});

const items = [
  item({ id: 'a', title: 'Mathematics Complete Course', priceUGX: 120000, rating: 4.8, reviews: 2100 }),
  item({ id: 'b', kind: 'paper', title: 'KCSE Past Papers', board: 'KCSE', country: 'Kenya', priceUGX: 30000, reviews: 3200 }),
  item({ id: 'c', kind: 'live', title: 'English Literature', board: 'IGCSE', subject: 'English', priceUGX: 0, rating: 4.9, reviews: 900 }),
];

describe('filterCatalogue', () => {
  it('returns everything with no filters', () => {
    expect(filterCatalogue(items, EMPTY_FILTERS).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('matches the search words against title, subject and teacher, ignoring case', () => {
    expect(filterCatalogue(items, { ...EMPTY_FILTERS, query: 'past PAPERS' }).map((i) => i.id)).toEqual(['b']);
    expect(filterCatalogue(items, { ...EMPTY_FILTERS, query: 'kato english' }).map((i) => i.id)).toEqual(['c']);
  });

  it('keeps items matching any ticked value within a group, and all groups together', () => {
    const f = { ...EMPTY_FILTERS, kinds: ['course', 'paper'], boards: ['KCSE'] };
    expect(filterCatalogue(items, f).map((i) => i.id)).toEqual(['b']);
  });

  it('filters free items and a price ceiling', () => {
    expect(filterCatalogue(items, { ...EMPTY_FILTERS, price: 'free' }).map((i) => i.id)).toEqual(['c']);
    expect(filterCatalogue(items, { ...EMPTY_FILTERS, price: 'under50k' }).map((i) => i.id)).toEqual(['b', 'c']);
  });
});

describe('sortCatalogue', () => {
  it('sorts by popularity, rating and price without changing the input', () => {
    const copy = [...items];
    expect(sortCatalogue(items, 'popular').map((i) => i.id)).toEqual(['b', 'a', 'c']);
    expect(sortCatalogue(items, 'rating').map((i) => i.id)).toEqual(['c', 'a', 'b']);
    expect(sortCatalogue(items, 'priceLow').map((i) => i.id)).toEqual(['c', 'b', 'a']);
    expect(items).toEqual(copy);
  });

  it('ranks by the popularity score when items carry one, not by review count', () => {
    const ranked = [
      { ...items[0], id: 'x', reviews: 10, popularity: 3 },
      { ...items[0], id: 'y', reviews: 900, popularity: 1 },
      { ...items[0], id: 'z', reviews: 50, popularity: 2 },
    ];
    expect(sortCatalogue(ranked, 'popular').map((i) => i.id)).toEqual(['x', 'z', 'y']);
  });
});

describe('facetCounts', () => {
  it('counts items per value', () => {
    expect(facetCounts(items, 'kind')).toEqual({ course: 1, paper: 1, live: 1 });
  });
});

describe('filtersFromLink', () => {
  it('starts Explore with the search and kind a link carries', () => {
    expect(filtersFromLink({ q: '  fractions ', kind: 'live' })).toEqual({ ...EMPTY_FILTERS, query: 'fractions', kinds: ['live'] });
  });

  it('ignores unknown kinds, other types and very long searches', () => {
    expect(filtersFromLink({ kind: 'banana' })).toEqual(EMPTY_FILTERS);
    expect(filtersFromLink({ q: ['a', 'b'] })).toEqual(EMPTY_FILTERS);
    expect(filtersFromLink({ q: 'x'.repeat(200) }).query).toHaveLength(80);
  });
});

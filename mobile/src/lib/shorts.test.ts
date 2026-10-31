import { EMPTY_SHORT_FILTERS, filterShorts, formatCount, ncdcDomain, stepClip, type ShortClip } from './shorts';

const clip = (over: Partial<ShortClip>): ShortClip => ({
  id: 'x',
  title: 'Multiply Fractions Easily',
  topic: 'Mathematics',
  board: 'UNEB',
  level: 'Primary',
  subject: 'Mathematics',
  type: 'Revision tip',
  language: 'English',
  teacher: 'Mr. James Kato',
  ...over,
});

const clips = [
  clip({ id: 'a' }),
  clip({ id: 'b', title: 'The Human Cell', topic: 'Science', subject: 'Biology', board: 'IGCSE', level: 'Lower secondary', type: 'Concept explanation' }),
  clip({ id: 'c', title: 'Study Smarter', topic: 'Study Tips', subject: 'Study skills', type: 'Teacher advice', language: 'French' }),
];

describe('filterShorts', () => {
  it('shows everything for "For You" with no filters', () => {
    expect(filterShorts(clips, EMPTY_SHORT_FILTERS).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('narrows by topic chip and ticked filters together', () => {
    expect(filterShorts(clips, { ...EMPTY_SHORT_FILTERS, topic: 'Science' }).map((c) => c.id)).toEqual(['b']);
    expect(filterShorts(clips, { ...EMPTY_SHORT_FILTERS, boards: ['UNEB'], languages: ['French'] }).map((c) => c.id)).toEqual(['c']);
  });

  it('searches title and teacher', () => {
    expect(filterShorts(clips, { ...EMPTY_SHORT_FILTERS, query: 'human' }).map((c) => c.id)).toEqual(['b']);
  });
});

describe('formatCount', () => {
  it('shortens big numbers the way the feed shows them', () => {
    expect(formatCount(980)).toBe('980');
    expect(formatCount(34000)).toBe('34K');
    expect(formatCount(1200)).toBe('1.2K');
    expect(formatCount(1200000)).toBe('1.2M');
    expect(formatCount(2000000)).toBe('2M');
  });
});

describe('stepClip', () => {
  it('moves to the next or previous short', () => {
    expect(stepClip(2, 1, 5)).toBe(3);
    expect(stepClip(2, -1, 5)).toBe(1);
  });

  it('stops at the first and last short instead of wrapping', () => {
    expect(stepClip(0, -1, 5)).toBe(0);
    expect(stepClip(4, 1, 5)).toBe(4);
  });

  it('stays at 0 when there are no shorts', () => {
    expect(stepClip(0, 1, 0)).toBe(0);
  });
});

describe('ncdcDomain', () => {
  it('tags UNEB clips with their NCDC learning domain', () => {
    expect(ncdcDomain({ board: 'UNEB', type: 'Concept explanation' })).toBe('knowledge');
    expect(ncdcDomain({ board: 'UNEB', type: 'Revision tip' })).toBe('skills');
  });

  it('leaves other exam boards untagged', () => {
    expect(ncdcDomain({ board: 'KCSE', type: 'Concept explanation' })).toBeNull();
  });
});

import { EMPTY_SHORT_FILTERS, filterShorts, formatCount, type ShortClip } from './shorts';

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

import { countOf } from './plural';

describe('countOf', () => {
  it('uses the singular for one and adds an s otherwise', () => {
    expect(countOf(1, 'draft')).toBe('1 draft');
    expect(countOf(0, 'draft')).toBe('0 drafts');
    expect(countOf(3, 'report card')).toBe('3 report cards');
  });

  it('takes an irregular plural', () => {
    expect(countOf(2, 'class', 'classes')).toBe('2 classes');
    expect(countOf(1, 'class', 'classes')).toBe('1 class');
  });
});

import { reviewProblem } from './review';

describe('reviewProblem', () => {
  it('accepts a rated review of a sentence or more', () => {
    expect(reviewProblem(5, 'Clear lessons and quick marking.')).toBeNull();
  });

  it('asks for stars and a few words first', () => {
    expect(reviewProblem(0, 'Clear lessons and quick marking.')).toBe('Choose a star rating.');
    expect(reviewProblem(4, 'ok')).toBe('Write at least 10 characters.');
  });

  it('holds back contact details and unkind words like squad chat does', () => {
    expect(reviewProblem(3, 'Call me on 0772 123 456 for notes')).toMatch(/Phone numbers/);
    expect(reviewProblem(1, 'This teacher is stupid and slow')).toMatch(/kind/);
  });
});

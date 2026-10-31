import { achievementLevel, domainOf, GENERIC_SKILLS, identifierFor, LEARNING_OUTCOMES, raceTotal, VALUES } from './cbc';

describe('identifierFor', () => {
  it('turns a score into the 1–3 identifier and its descriptor', () => {
    expect(identifierFor(3, 3)).toEqual({ id: 3, label: 'Outstanding' });
    expect(identifierFor(2, 3)).toEqual({ id: 2, label: 'Moderate' });
    expect(identifierFor(1, 3)).toEqual({ id: 1, label: 'Basic' });
  });

  it('uses the 1.5 and 2.5 cut-offs on the 0–3 scale', () => {
    expect(identifierFor(49, 100).id).toBe(1);
    expect(identifierFor(50, 100).id).toBe(2);
    expect(identifierFor(83, 100).id).toBe(2);
    expect(identifierFor(84, 100).id).toBe(3);
  });
});

describe('raceTotal', () => {
  it('adds Relevance, Accuracy, Coherence and Excellence out of 10', () => {
    expect(raceTotal({ relevance: 3, accuracy: 2, coherence: 3, excellence: 1 })).toEqual({ score: 9, max: 10 });
  });

  it('caps each domain at its maximum', () => {
    expect(raceTotal({ relevance: 5, accuracy: 3, coherence: 3, excellence: 2 })).toEqual({ score: 10, max: 10 });
  });
});

describe('achievementLevel', () => {
  it('weights continuous assessment 20% and the exam 80%', () => {
    expect(achievementLevel(100, 75)).toEqual({ level: 'A', label: 'Exceptional', percent: 80 });
    expect(achievementLevel(50, 50)).toEqual({ level: 'C', label: 'Satisfactory', percent: 50 });
  });

  it('runs from A to E', () => {
    expect(achievementLevel(70, 70).level).toBe('B');
    expect(achievementLevel(40, 40).level).toBe('D');
    expect(achievementLevel(10, 20).level).toBe('E');
  });
});

describe('domainOf', () => {
  it('reads the learning domain from the outcome verb', () => {
    expect(domainOf('understand how fractions of a whole are shared')).toBe('knowledge');
    expect(domainOf('know the parts of a fraction')).toBe('knowledge');
    expect(domainOf('be able to add fractions with unlike denominators')).toBe('skills');
    expect(domainOf('appreciate the use of fractions in sharing fairly')).toBe('values');
    expect(domainOf('show concern for accuracy when measuring')).toBe('values');
  });
});

describe('framework lists', () => {
  it('has the five generic skills, eight values and four learning outcomes', () => {
    expect(GENERIC_SKILLS).toHaveLength(5);
    expect(VALUES).toHaveLength(8);
    expect(LEARNING_OUTCOMES).toHaveLength(4);
  });
});

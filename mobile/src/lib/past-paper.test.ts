import { calculate, findPaper, markAnswer, numbersIn } from './past-paper';

describe('numbersIn', () => {
  it('reads the numbers out of a written answer', () => {
    expect(numbersIn('AC = 10 cm, area = 24cm²')).toEqual([10, 24]);
    expect(numbersIn('x = -2.5 or x = 3')).toEqual([-2.5, 3]);
  });
});

describe('markAnswer', () => {
  const expected = [{ part: '(a)', value: 10, marks: 5 }, { part: '(b)', value: 24, marks: 5 }];

  it('gives full marks when every expected value appears', () => {
    expect(markAnswer('AC = 10 cm and the area is 24 cm²', expected)).toEqual({ score: 10, outOf: 10, parts: [{ part: '(a)', correct: true }, { part: '(b)', correct: true }] });
  });

  it('gives part marks for the parts that are right', () => {
    expect(markAnswer('AC = 10 cm, area 48', expected).score).toBe(5);
  });

  it('allows a small rounding difference', () => {
    expect(markAnswer('10.01 and 24', expected).score).toBe(10);
  });
});

describe('calculate', () => {
  it('evaluates + − × ÷, brackets and decimals in order', () => {
    expect(calculate('6*6 + 8*8')).toBe(100);
    expect(calculate('(6+8) / 2')).toBe(7);
    expect(calculate('0.5 * 6 * 8')).toBe(24);
    expect(calculate('2 - -3')).toBe(5);
    expect(calculate('3 × 4 ÷ 2')).toBe(6);
  });

  it('returns null for anything it cannot read', () => {
    expect(calculate('2 +')).toBeNull();
    expect(calculate('alert(1)')).toBeNull();
    expect(calculate('1/0')).toBeNull();
  });
});

describe('findPaper', () => {
  const papers = [{ board: 'uneb-uce', subject: 'mathematics', year: '2025' }];
  it('finds a paper by its address, ignoring case', () => {
    expect(findPaper(papers, 'UNEB-UCE', 'Mathematics', '2025')).toBe(papers[0]);
    expect(findPaper(papers, 'kcse', 'mathematics', '2025')).toBeUndefined();
  });
});

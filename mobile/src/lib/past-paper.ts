/** Rules for the public past-paper page: finding a paper, marking the free question, and the calculator. */

/** How far a learner's number may be from the answer and still count (rounding). */
const TOLERANCE = 0.05;

export interface ExpectedPart {
  part: string;
  value: number;
  marks: number;
}

export interface Mark {
  score: number;
  outOf: number;
  parts: { part: string; correct: boolean }[];
}

/** Every number written in an answer, in order. */
export function numbersIn(text: string): number[] {
  return (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

/** Marks a written answer: each part scores when its value appears among the answer's numbers. */
export function markAnswer(text: string, expected: readonly ExpectedPart[]): Mark {
  const found = numbersIn(text);
  const parts = expected.map((e) => ({ part: e.part, correct: found.some((n) => Math.abs(n - e.value) <= TOLERANCE) }));
  const score = expected.reduce((sum, e, i) => sum + (parts[i].correct ? e.marks : 0), 0);
  return { score, outOf: expected.reduce((sum, e) => sum + e.marks, 0), parts };
}

/** Finds a paper by its address segments, ignoring case. */
export function findPaper<T extends { board: string; subject: string; year: string }>(papers: readonly T[], board?: string, subject?: string, year?: string): T | undefined {
  const b = board?.toLowerCase();
  const s = subject?.toLowerCase();
  return papers.find((p) => p.board === b && p.subject === s && p.year === year);
}

/**
 * A small, safe arithmetic calculator for the paper's Calculator tab:
 * + − × ÷, brackets, decimals and negative numbers. Never uses eval.
 * Returns null when the expression can't be read or divides by zero.
 */
export function calculate(input: string): number | null {
  const src = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(src)) return null;
  let pos = 0;
  const peek = () => src[pos];

  function number(): number {
    if (peek() === '(') {
      pos++;
      const v = sum();
      if (peek() !== ')') throw new Error('bracket');
      pos++;
      return v;
    }
    if (peek() === '-') {
      pos++;
      return -number();
    }
    const m = /^\d+(?:\.\d+)?/.exec(src.slice(pos));
    if (!m) throw new Error('number');
    pos += m[0].length;
    return Number(m[0]);
  }
  function product(): number {
    let v = number();
    while (peek() === '*' || peek() === '/') {
      const op = src[pos++];
      const r = number();
      if (op === '/' && r === 0) throw new Error('divide by zero');
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  function sum(): number {
    let v = product();
    while (peek() === '+' || peek() === '-') {
      const op = src[pos++];
      const r = product();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }

  try {
    const v = sum();
    return pos === src.length && Number.isFinite(v) ? Math.round(v * 1e10) / 1e10 : null;
  } catch {
    return null;
  }
}

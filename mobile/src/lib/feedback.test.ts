import { identifierFor, raceTotal } from '@/lib/cbc';
import { assignmentFeedback } from '@/mock/assignment-feedback';

import { chapterAt, mmss, waveform } from './feedback';

describe('chapterAt', () => {
  const chapters = [{ at: 0 }, { at: 42 }, { at: 88 }];

  it('finds the chapter playing at a moment', () => {
    expect(chapterAt(chapters, 0)).toBe(0);
    expect(chapterAt(chapters, 50)).toBe(1);
    expect(chapterAt(chapters, 400)).toBe(2);
  });
});

describe('mmss', () => {
  it('pads minutes and seconds', () => {
    expect(mmss(204)).toBe('03:24');
    expect(mmss(7)).toBe('00:07');
  });
});

describe('waveform', () => {
  it('gives the same bars every time, each between 0.2 and 1', () => {
    const bars = waveform(40);
    expect(bars).toHaveLength(40);
    expect(waveform(40)).toEqual(bars);
    expect(bars.every((b) => b >= 0.2 && b <= 1)).toBe(true);
  });
});

describe('the sample marked work', () => {
  it('scores 8 / 10 with RACE, which is identifier 2 (Moderate)', () => {
    const t = raceTotal(assignmentFeedback.race);
    expect(t).toEqual({ score: 8, max: 10 });
    expect(identifierFor(t.score, t.max)).toEqual({ id: 2, label: 'Moderate' });
  });

  it('gives each practice question four different options', () => {
    for (const q of assignmentFeedback.practice) expect(new Set(q.options).size).toBe(4);
  });
});

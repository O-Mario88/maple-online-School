import { estimateRoi, TUITION_PER_SUBJECT_UGX } from './roi';

describe('estimateRoi', () => {
  it('matches the reference example: 300 students, 3 subjects', () => {
    expect(estimateRoi(300, 3)).toEqual({ improvement: '+28–42%', costSavedUGX: 18_000_000, valueUGX: 36_000_000, multiple: 2 });
  });

  it('scales the saving with students and subjects', () => {
    expect(estimateRoi(100, 1).costSavedUGX).toBe(100 * TUITION_PER_SUBJECT_UGX);
  });

  it('treats empty or silly inputs as zero', () => {
    expect(estimateRoi(Number.NaN, 3)).toEqual({ improvement: '+28–42%', costSavedUGX: 0, valueUGX: 0, multiple: 2 });
    expect(estimateRoi(-50, 2).costSavedUGX).toBe(0);
  });
});

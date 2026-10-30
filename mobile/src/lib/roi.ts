/**
 * The school ROI estimate on /schools. It compares Maple with paying for
 * traditional extra tuition, per learner and subject, for a year. These are
 * marketing estimates, shown as such on the page.
 */

/** What a family typically pays for a year of extra tuition in one subject. */
export const TUITION_PER_SUBJECT_UGX = 20_000;

/** Value of better results, retention and reputation, as a multiple of the cost saved. */
const VALUE_MULTIPLE = 2;

/** The exam improvement range seen in pilot schools. */
const IMPROVEMENT = '+28–42%';

export interface RoiEstimate {
  improvement: string;
  costSavedUGX: number;
  valueUGX: number;
  multiple: number;
}

function count(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** Year-one estimate for a school with this many learners and subjects. */
export function estimateRoi(students: number, subjects: number): RoiEstimate {
  const costSavedUGX = count(students) * count(subjects) * TUITION_PER_SUBJECT_UGX;
  return { improvement: IMPROVEMENT, costSavedUGX, valueUGX: costSavedUGX * VALUE_MULTIPLE, multiple: VALUE_MULTIPLE };
}

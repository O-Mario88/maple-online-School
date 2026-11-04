import { levelFor, overallProgress, phaseStatus, planStatus, scalePhases, subjectAction } from './plan';

const PHASES = [
  { title: 'Build Foundations', from: 1, to: 6 },
  { title: 'Strengthen Skills', from: 7, to: 12 },
  { title: 'Exam Practice', from: 13, to: 20 },
  { title: 'Final Revision', from: 21, to: 24 },
];

describe('My Plan', () => {
  test('a phase is completed, in progress or upcoming by the week the learner is in', () => {
    expect(PHASES.map((p) => phaseStatus(p, 7))).toEqual(['done', 'current', 'upcoming', 'upcoming']);
    expect(phaseStatus(PHASES[0], 6)).toBe('current');
  });

  test('a subject is Strong from 85%, Good from 65%, otherwise Developing', () => {
    expect([0.88, 0.75, 0.7, 0.62, 0.58].map(levelFor)).toEqual(['Strong', 'Good', 'Good', 'Developing', 'Developing']);
  });

  test('strong subjects get Review; the rest Continue', () => {
    expect(subjectAction(0.88)).toBe('Review');
    expect(subjectAction(0.75)).toBe('Continue');
  });

  test('overall progress is the average across subjects', () => {
    expect(overallProgress([0.75, 0.58, 0.7, 0.88, 0.62])).toBe(71);
    expect(overallProgress([])).toBe(0);
  });

  test('on track when progress keeps up with the weeks gone', () => {
    expect(planStatus(71, 7, 24)).toBe('On track');
    expect(planStatus(20, 12, 24)).toBe('Behind');
  });

  test('a longer or shorter plan stretches every phase in proportion, with no gaps', () => {
    const twelve = scalePhases(PHASES, 24, 12);
    expect(twelve.map((p) => [p.from, p.to])).toEqual([[1, 3], [4, 6], [7, 10], [11, 12]]);
    expect(scalePhases(PHASES, 24, 36).map((p) => p.to)).toEqual([9, 18, 30, 36]);
    expect(scalePhases(PHASES, 24, 24)).toEqual(PHASES);
  });
});

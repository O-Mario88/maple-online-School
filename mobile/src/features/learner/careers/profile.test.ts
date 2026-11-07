import { careerProfile, LIKERT, PREFERENCE_STATEMENTS, withPreferences } from './profile';

const answers = { interests: ['science', 'technology', 'the environment'], strengths: ['Biology'], environments: ['lab'] };
const prefs = { 'real-world': 3, 'living-things': 3, creativity: 1, numbers: 2, helping: 2, outdoors: 2 };

describe('preferences and career profile', () => {
  test('statements come in the three kinds the assessment shows, on a four-point scale', () => {
    expect([...new Set(PREFERENCE_STATEMENTS.map((x) => x.group))]).toEqual(['Activities', 'Subjects', 'Work Preferences']);
    expect(LIKERT.map((l) => l.label)).toEqual(['Strongly Agree', 'Agree', 'Neutral', 'Disagree']);
  });

  test('agreeing with a statement adds its interest; neutral and disagree add nothing', () => {
    expect(withPreferences(answers, { helping: 2 }).interests).toEqual(['science', 'technology', 'the environment', 'working with people']);
    expect(withPreferences(answers, { helping: 1, creativity: 0 }).interests).toEqual(answers.interests);
    expect(withPreferences(answers, { outdoors: 3 }).interests).toEqual(answers.interests);
  });

  test('the profile rates five areas from the picks and the statements', () => {
    expect(careerProfile(answers, prefs).map((a) => [a.axis, a.level])).toEqual([
      ['Science', 'High'],
      ['Problem Solving', 'High'],
      ['Helping People', 'Medium'],
      ['Creativity', 'Low'],
      ['Working with Data', 'Medium'],
    ]);
    expect(careerProfile({ interests: [], strengths: [], environments: [] }, {}).every((a) => a.score === 0 && a.level === 'Low')).toBe(true);
  });
});

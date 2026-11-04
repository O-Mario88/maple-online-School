import { modesFrom } from './switcher-modes';

const designed = [
  { key: 'learner', portal: 'learner' as const, title: 'Learner Mode', tagline: 'Student • Sample Learner', detail: 'Your lessons and progress.', short: 'Lessons.', icon: 'cap' as const, tint: '#1463F3', tile: 11, photo: 21 },
  { key: 'tutor', portal: 'teacher' as const, title: 'Tutor Mode', tagline: 'Independent tutor • Sample Teacher', detail: 'Teach your own classes.', short: 'Teach.', icon: 'school' as const, tint: '#7C3AED', tile: 12, photo: 22 },
  { key: 'school-teacher', portal: 'teacher' as const, title: 'School Teacher Mode', tagline: 'Sample School', detail: 'Teach at school.', short: 'School.', icon: 'school' as const, tint: '#16A34A', tile: 13, photo: 23 },
];

describe('the role switcher cards', () => {
  test("each of the person's own modes gets the design's tile, colour and description", () => {
    const [learner] = modesFrom(['learner'], designed);
    expect(learner).toMatchObject({ key: 'learner', portal: 'learner', title: 'Learner Mode', detail: 'Your lessons and progress.', short: 'Lessons.', tint: '#1463F3', tile: 11 });
  });

  test("the design's sample person is left out: no name, no photo", () => {
    const [learner] = modesFrom(['learner'], designed);
    expect(learner.tagline).toBe('');
    expect(learner.photo).toBeUndefined();
  });

  test('a mode the design has no card for gets the plain icon card', () => {
    const [parent] = modesFrom(['parent'], designed);
    expect(parent).toMatchObject({ key: 'parent', title: 'Parent Mode', tile: undefined, icon: 'people' });
  });

  test('without design data every mode is the plain icon card', () => {
    expect(modesFrom(['learner', 'teacher'], undefined).map((m) => m.tile)).toEqual([undefined, undefined]);
  });
});

import { classesByLevel } from './academics';
import type { Class, ClassLevel } from './types';

const level = (id: number, name: string, grade: number): ClassLevel => ({ id, name, level: 1, internal_canonical_grade: grade });

const cls = (id: number, title: string, levelId: number, levelName: string): Class => ({
  id,
  institution: 1,
  subject: null,
  subject_name: '',
  class_level: levelId,
  class_level_name: levelName,
  teacher: 5,
  teacher_name: 'Teacher',
  title,
  visibility: 'institution',
  is_published: true,
  created_at: '2026-09-01T08:00:00Z',
});

describe('classesByLevel', () => {
  const levels = [level(3, 'S3', 10), level(1, 'S1', 8), level(2, 'S2', 9)];

  it('groups classes under their level, lowest level first, classes by title', () => {
    const groups = classesByLevel([cls(1, 'S3 West', 3, 'S3'), cls(2, 'S1 Blue', 1, 'S1'), cls(3, 'S3 East', 3, 'S3')], levels);
    expect(groups.map((g) => [g.name, g.classes.map((c) => c.title)])).toEqual([
      ['S1', ['S1 Blue']],
      ['S3', ['S3 East', 'S3 West']],
    ]);
  });

  it('keeps a class whose level is missing from the list, at the end', () => {
    const groups = classesByLevel([cls(1, 'Old class', 99, 'Form 1'), cls(2, 'S2 Red', 2, 'S2')], levels);
    expect(groups.map((g) => g.name)).toEqual(['S2', 'Form 1']);
  });
});

import { addSubject, cloneTemplate, filterSubjects, gradesIn, type Subject } from './curricula';

const subjects: readonly Subject[] = [
  { name: 'Mathematics', category: 'STEM', levels: 'P1 – S6', resources: 1240, papers: 3520, active: true },
  { name: 'Physics', category: 'STEM', levels: 'S1 – S6', resources: 640, papers: 1920, active: true },
  { name: 'Social Studies', category: 'Humanities', levels: 'P1 – S6', resources: 530, papers: 1450, active: true },
  { name: 'Integrated Science', category: 'STEM', levels: 'P1 – P7', resources: 420, papers: 980, active: true },
];

describe('gradesIn', () => {
  test('expands a level range into the grades it covers', () => {
    expect(gradesIn('P1 – P7')).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7']);
    expect(gradesIn('S1 – S6')).toEqual(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
    expect(gradesIn('P1 – S6')).toHaveLength(13);
    expect(gradesIn('P4 – S4')).toEqual(['P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4']);
  });
});

describe('filterSubjects', () => {
  test('filters by level, category and search', () => {
    expect(filterSubjects(subjects, { level: 'Primary', category: 'All Categories', query: '' }).map((s) => s.name)).toEqual(['Mathematics', 'Social Studies', 'Integrated Science']);
    expect(filterSubjects(subjects, { level: 'All Levels', category: 'STEM', query: 'phy' }).map((s) => s.name)).toEqual(['Physics']);
  });
});

describe('addSubject', () => {
  test('adds a new subject at the end', () => {
    const r = addSubject(subjects, { name: 'Kiswahili', category: 'Languages', levels: 'P4 – S4' });
    expect(r.error).toBeUndefined();
    expect(r.list.at(-1)?.name).toBe('Kiswahili');
  });

  test('refuses an empty name or a duplicate', () => {
    expect(addSubject(subjects, { name: ' ', category: 'STEM', levels: 'S1 – S6' }).error).toMatch(/name/i);
    expect(addSubject(subjects, { name: 'physics', category: 'STEM', levels: 'S1 – S6' }).error).toMatch(/already/i);
  });
});

describe('cloneTemplate', () => {
  test('gives the school its own versioned copy and records it', () => {
    const r = cloneTemplate({ short: 'UNEB', version: 3, clones: 12480 }, 'Green Valley Academy');
    expect(r.copyName).toBe('Green Valley Academy – UNEB (v3)');
    expect(r.framework.clones).toBe(12481);
  });
});

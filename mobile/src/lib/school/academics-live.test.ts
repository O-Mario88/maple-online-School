import type { Programme } from '@/lib/curriculum/programme';

import { academicsData, setupProgress } from './academics-live';
import type { Class, ClassLevel, Term } from './types';

const term = (id: number, name: string, start: string, end: string, active = false): Term => ({ id, institution: 1, name, start_date: start, end_date: end, is_active: active });
const level = (id: number, name: string, grade: number): ClassLevel => ({ id, name, level: 1, internal_canonical_grade: grade });
const cls = (id: number, title: string, levelId: number, levelName: string): Class => ({
  id,
  institution: 1,
  subject: null,
  subject_name: '',
  class_level: levelId,
  class_level_name: levelName,
  teacher: 5,
  teacher_name: 'T',
  title,
  visibility: 'institution',
  is_published: true,
  created_at: '2026-09-01T08:00:00Z',
});

const programme: Programme = {
  country: 'UG',
  tracks: [
    {
      id: 1,
      name: 'NCDC',
      rules: [],
      levels: [
        {
          id: 1,
          name: 'O-Level',
          classes: [
            { id: 1, name: 'S1', grade: 8, subjects: [{ id: 1, code: 'MATH', name: 'Mathematics', compulsory: true }, { id: 2, code: 'ART', name: 'Art', compulsory: false }] },
            { id: 2, name: 'S4', grade: 11, subjects: [{ id: 1, code: 'MATH', name: 'Mathematics', compulsory: true }] },
          ],
        },
      ],
    },
  ],
} as unknown as Programme;

describe('academicsData', () => {
  const today = new Date(2026, 10, 3);
  const data = academicsData({
    school: { name: 'Kampala Hill', country: 'Uganda', level: 'Secondary' },
    learners: 75,
    terms: [term(1, 'Term 1', '2026-02-02', '2026-05-01'), term(2, 'Term 3', '2026-09-14', '2026-12-04', true), term(3, 'Term 1', '2027-02-01', '2027-05-01')],
    classes: [cls(1, 'S1 Blue', 27, 'S1'), cls(2, 'S1 Red', 27, 'S1'), cls(3, 'S3 East', 1, 'S3')],
    levels: [level(1, 'S3', 10), level(27, 'S1', 8)],
    classLearners: new Map([
      [1, 30],
      [2, 25],
      [3, 20],
    ]),
    programme,
    today,
  });

  it('lists the school as its one campus', () => {
    expect(data.rows.campuses).toEqual([['1', 'Kampala Hill', 'Uganda', 'Secondary', '75', 'Active']]);
  });

  it('groups terms into academic years by the year they start', () => {
    expect(data.rows.years).toEqual([
      ['1', '2026', 'Feb 2, 2026', 'Dec 4, 2026', '2', 'Current'],
      ['2', '2027', 'Feb 1, 2027', 'May 1, 2027', '1', 'Upcoming'],
    ]);
  });

  it('marks each term current, closed or upcoming', () => {
    expect(data.rows.terms.map((r) => [r[1], r[2], r[5]])).toEqual([
      ['Term 1', '2026', 'Closed'],
      ['Term 3', '2026', 'Current'],
      ['Term 1', '2027', 'Upcoming'],
    ]);
  });

  it('shows each class level with its streams and learners', () => {
    expect(data.rows.streams).toEqual([
      ['1', 'S1', 'S1 Blue, S1 Red', '55', 'Active'],
      ['2', 'S3', 'S3 East', '20', 'Active'],
    ]);
  });

  it('lists curriculum subjects once, with the classes they run in', () => {
    expect(data.rows.subjects).toEqual([
      ['1', 'Art', 'ART', 'S1', 'Elective', 'Active'],
      ['2', 'Mathematics', 'MATH', 'S1 – S4', 'Core', 'Active'],
    ]);
  });

  it('leaves grading and competency empty until the API has them, and counts every table', () => {
    expect(data.rows.grading).toEqual([]);
    expect(data.rows.competency).toEqual([]);
    expect(data.counts).toEqual({ campuses: 1, years: 2, terms: 3, streams: 2, subjects: 2, grading: 0, competency: 0 });
  });

  it('counts one subject matrix per curriculum class that has subjects', () => {
    expect(data.matrices).toBe(2);
  });

  it("counts only the matrices for the school's own level when the curriculum names it", () => {
    const sub = [{ id: 1, code: 'MATH', name: 'Mathematics', compulsory: true }];
    const mixed = {
      country: 'UG',
      tracks: [
        {
          id: 1,
          name: 'NCDC',
          rules: [],
          levels: [
            { id: 1, name: 'Primary', classes: [{ id: 1, name: 'P1', grade: 1, subjects: sub }, { id: 2, name: 'P2', grade: 2, subjects: sub }] },
            { id: 2, name: 'Lower Secondary', classes: [{ id: 3, name: 'S1', grade: 8, subjects: sub }] },
            { id: 3, name: 'Advanced Secondary', classes: [{ id: 4, name: 'S5', grade: 12, subjects: sub }] },
          ],
        },
      ],
    } as unknown as Programme;
    const secondary = academicsData({ school: { name: 'X', country: 'Uganda', level: 'Secondary' }, learners: 0, terms: [], classes: [], levels: [], classLearners: new Map(), programme: mixed, today });
    expect(secondary.matrices).toBe(2);
  });
});

describe('setupProgress', () => {
  it('is the share of the seven academic parts that have anything set up', () => {
    expect(setupProgress({ campuses: 1, years: 2, terms: 2, streams: 2, subjects: 48, grading: 0, competency: 0 })).toBe(71);
    expect(setupProgress({ campuses: 1, years: 1, terms: 1, streams: 1, subjects: 1, grading: 1, competency: 1 })).toBe(100);
    expect(setupProgress({ campuses: 0, years: 0, terms: 0, streams: 0, subjects: 0, grading: 0, competency: 0 })).toBe(0);
  });
});

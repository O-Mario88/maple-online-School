import { type Answers, areaMatches, type CareerFacts, exploreFromStrengths, fieldList, matchCareers, careerStages, matchStrength, searchCareers, sortCareers, programStatus, stageFocus, strongestSubjects, subjectFit, subjectLinks } from './careers';

const c = (id: string, interests: string[], strengths: string[], environments: string[], field = 'General'): CareerFacts & { field: string } => ({ id, title: id, interests, strengths, environments, field });
const CAREERS = [
  c('nurse', ['helping people', 'science'], ['Biology', 'Chemistry'], ['hospital'], 'Health'),
  c('doctor', ['helping people', 'science'], ['Biology', 'Chemistry', 'Physics'], ['hospital', 'lab'], 'Health'),
  c('engineer', ['building things', 'numbers'], ['Mathematics', 'Physics'], ['field', 'office'], 'Engineering'),
  c('developer', ['technology', 'numbers'], ['Mathematics'], ['office'], 'ICT'),
  c('teacher', ['helping people', 'leading'], ['English'], ['classroom'], 'Education'),
  c('agronomist', ['nature', 'science'], ['Biology', 'Agriculture'], ['outdoors'], 'Agriculture'),
];

describe('career compass', () => {
  test('suggests several careers, best fit first, each with the reasons it matches', () => {
    const answers: Answers = { interests: ['helping people', 'science'], strengths: ['Biology', 'Chemistry'], environments: ['hospital'] };
    const top = matchCareers(CAREERS, answers);
    expect(top.slice(0, 2).map((m) => m.career.id)).toEqual(['nurse', 'doctor']);
    expect(top[0].reasons).toEqual(['Matches your interest in helping people and science', 'Uses your strengths in Biology and Chemistry', 'Suits working in a hospital']);
  });

  test('always offers at least three directions, so nobody gets a single “answer”', () => {
    const top = matchCareers(CAREERS, { interests: ['technology'], strengths: [], environments: [] });
    expect(top.length).toBeGreaterThanOrEqual(3);
    expect(top[0].career.id).toBe('developer');
    expect(top[1].reasons).toEqual(['A different direction worth exploring']);
  });

  test('subject fit compares a program’s essential subjects with the learner’s', () => {
    expect(subjectFit(['Biology', 'Chemistry'], ['Physics', 'Chemistry', 'Biology'])).toEqual({ status: 'meets', missing: [] });
    expect(subjectFit(['Biology', 'Chemistry'], ['Chemistry', 'Mathematics'])).toEqual({ status: 'partly', missing: ['Biology'] });
    expect(subjectFit(['Biology', 'Chemistry'], ['History'])).toEqual({ status: 'missing', missing: ['Biology', 'Chemistry'] });
    expect(subjectFit([], ['History'])).toEqual({ status: 'meets', missing: [] });
  });

  test('a program is verified on its own accreditation, with a review due after a year', () => {
    expect(programStatus({ status: 'accredited', verifiedOn: '2026-03-01' }, '2026-11-05')).toBe('verified');
    expect(programStatus({ status: 'accredited', verifiedOn: '2025-10-01' }, '2026-11-05')).toBe('review-due');
    expect(programStatus({ status: 'pending', verifiedOn: null }, '2026-11-05')).toBe('unverified');
  });

  test('guidance follows the learner’s stage: explore, then choose subjects, then apply', () => {
    expect(stageFocus('S.2').focus).toBe('Explore');
    expect(stageFocus('S.4').focus).toBe('Choose subjects');
    expect(stageFocus('S.6').focus).toBe('Apply');
    expect(stageFocus('P.7').focus).toBe('Explore');
  });

  test('a subject links to the careers that use it and the fields they belong to', () => {
    const links = subjectLinks(CAREERS, 'Biology');
    expect(links.careers.map((x) => x.id)).toEqual(['nurse', 'doctor', 'agronomist']);
    expect(links.fields).toEqual(['Health', 'Agriculture']);
    expect(links.sentence).toBe('Biology connects to careers in health and agriculture.');
    expect(subjectLinks(CAREERS, 'Latin').sentence).toBe('');
  });

  test('strengths point to areas worth exploring and the subjects to grow next, never a single prediction', () => {
    const r = exploreFromStrengths(CAREERS, ['Mathematics']);
    expect(r.fields).toEqual(['Engineering', 'ICT']);
    expect(r.growNext).toEqual(['Physics']);
    expect(exploreFromStrengths(CAREERS, []).fields).toEqual([]);
  });

  test('strongest subjects are the ones furthest along, skipping subjects not started', () => {
    const subjects = [
      { name: 'English', done: 18, total: 42 },
      { name: 'Mathematics', done: 24, total: 48 },
      { name: 'ICT', done: 0, total: 32 },
      { name: 'Science', done: 16, total: 44 },
    ];
    expect(strongestSubjects(subjects)).toEqual(['Mathematics', 'English']);
    expect(strongestSubjects(subjects, 3)).toEqual(['Mathematics', 'English', 'Science']);
    expect(strongestSubjects([{ name: 'ICT', done: 0, total: 32 }])).toEqual([]);
  });

  test('career fields read as a sentence list, keeping acronyms like ICT', () => {
    expect(fieldList(['Engineering', 'ICT', 'Education'])).toBe('engineering, ICT and education');
    expect(fieldList(['Health'])).toBe('health');
  });

  test('match strength is the share of a career’s interests, subjects and settings found in your answers', () => {
    const answers: Answers = { interests: ['science'], strengths: ['Biology', 'Chemistry'], environments: [] };
    // nurse: interests 2×3, strengths 2×2, settings 1×1 = 11; matched 3 + 4 = 7
    expect(matchStrength(CAREERS[0], answers)).toBe(64);
    expect(matchStrength(CAREERS[3], answers)).toBe(0);
  });

  test('career areas are ranked by their best-matching career, leaving out areas with no match', () => {
    const answers: Answers = { interests: ['helping people', 'science'], strengths: ['Biology', 'Chemistry'], environments: ['hospital'] };
    const withArea = CAREERS.map((x) => ({ ...x, area: x.field }));
    expect(areaMatches(withArea, answers).map((a) => [a.area, a.percent])).toEqual([
      ['Health', 100],
      ['Agriculture', 45],
      ['Education', 33],
    ]);
  });

  test('searching careers matches the title, field or related work, within an area when one is chosen', () => {
    const list = CAREERS.map((x) => ({ ...x, area: x.field, overview: '', related: x.id === 'teacher' ? ['Lecturer'] : [] }));
    expect(searchCareers(list, { query: 'NUR' }).map((x) => x.id)).toEqual(['nurse']);
    expect(searchCareers(list, { query: 'lecturer' }).map((x) => x.id)).toEqual(['teacher']);
    expect(searchCareers(list, { query: '', area: 'Health' }).map((x) => x.id)).toEqual(['nurse', 'doctor']);
    expect(searchCareers(list, { query: 'health', area: 'ICT' })).toEqual([]);
  });

  test('career filters narrow by study level, work setting, subject and field', () => {
    const list = CAREERS.map((x) => ({ ...x, area: x.field, overview: '', related: [], pathways: [{ level: x.id === 'teacher' ? 'Diploma' : 'Degree' }] }));
    expect(searchCareers(list, { query: '', level: 'Diploma' }).map((x) => x.id)).toEqual(['teacher']);
    expect(searchCareers(list, { query: '', environment: 'lab' }).map((x) => x.id)).toEqual(['doctor']);
    expect(searchCareers(list, { query: '', subject: 'Mathematics', field: 'ICT' }).map((x) => x.id)).toEqual(['developer']);
  });

  test('most relevant puts the closest match to your answers first; A–Z sorts by title', () => {
    const answers: Answers = { interests: ['technology'], strengths: ['Mathematics'], environments: [] };
    expect(sortCareers(CAREERS, answers, 'relevant').map((x) => x.id).slice(0, 2)).toEqual(['developer', 'engineer']);
    expect(sortCareers(CAREERS, answers, 'name').map((x) => x.id)).toEqual(['agronomist', 'doctor', 'developer', 'engineer', 'nurse', 'teacher'].sort());
  });

  test('a career path runs from today’s subjects to the work itself, in four stages', () => {
    const goal = { title: 'Nurse', essentials: ['Biology', 'Chemistry'], pathways: [{ level: 'Diploma', years: '3 years' }, { level: 'Degree', years: '4 years' }], progression: ['Enrolled nurse', 'Registered nurse'] };
    const stages = careerStages(goal, 'S.5', [{ award: 'Bachelor' }, { award: 'Diploma' }]);
    expect(stages.map((s) => s.when)).toEqual(['Now · S.5', 'Next year', 'After UACE', 'Your career']);
    expect(stages[0].body).toBe('Most programs ask for Biology and Chemistry at A-Level.');
    expect(stages[1].body).toBe('2 programs teach this: Bachelor, Diploma.');
    expect(stages[2].body).toBe('Diploma: 3 years · Degree: 4 years');
    expect(stages[3]).toEqual({ when: 'Your career', title: 'Nurse', body: 'Enrolled nurse → Registered nurse' });
    expect(careerStages({ ...goal, essentials: [] }, 'S.5', [])[1].body).toBe('No programs listed yet.');
  });
});

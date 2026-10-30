import { combinationsFor, describeRule, rulesFor, subjectCounts, type ProgrammeClass, type ProgrammeRule } from './programme';

const s1: ProgrammeClass = {
  id: 8,
  name: 'S3',
  grade: 10,
  subjects: [
    { id: 1, code: 'MATH', name: 'Mathematics', compulsory: true },
    { id: 2, code: 'ENG', name: 'English', compulsory: true },
    { id: 3, code: 'ICT', name: 'Information and Communication Technology', compulsory: false },
  ],
};

const names = new Map([
  ['ENG', 'English'],
  ['MATH', 'Mathematics'],
  ['ISC', 'Integrated Science'],
  ['SST', 'Social Studies'],
  ['PHY', 'Physics'],
  ['CHE', 'Chemistry'],
  ['PMATH', 'Principal Mathematics'],
]);

const rules: ProgrammeRule[] = [
  { key: 'electives-s3-s4', kind: 'elective_limit', classes: ['S3', 'S4'], max_electives: 2 },
  {
    key: 'exam-ple',
    kind: 'exam',
    board: 'UNEB',
    name: 'Primary Leaving Examination (PLE)',
    classes: ['P7'],
    subjects: ['ENG', 'MATH', 'ISC', 'SST'],
    note: 'Religious Education is assessed within Social Studies.',
  },
  {
    key: 'components-re',
    kind: 'components',
    classes: ['P4'],
    subject: 'RE',
    components: ['Christian Religious Education (CRE)', 'Islamic Religious Education (IRE)'],
    choose: 1,
  },
  {
    key: 'a-level-combinations',
    kind: 'combinations',
    classes: ['S5', 'S6'],
    combinations: [{ code: 'PCM', subjects: ['PHY', 'CHE', 'PMATH'] }],
  },
];

describe('subjectCounts', () => {
  it('counts compulsory subjects and electives', () => {
    expect(subjectCounts(s1)).toEqual({ compulsory: 2, electives: 1 });
  });
});

describe('rulesFor', () => {
  it('returns only the rules for that class', () => {
    expect(rulesFor(rules, 'S3').map((r) => r.key)).toEqual(['electives-s3-s4']);
    expect(rulesFor(rules, 'P7').map((r) => r.key)).toEqual(['exam-ple']);
    expect(rulesFor(rules, 'S1')).toEqual([]);
  });
});

describe('describeRule', () => {
  it('explains elective limits', () => {
    expect(describeRule(rules[0], names)).toBe('Learners choose up to 2 electives.');
  });

  it('names an exam and its subjects', () => {
    expect(describeRule(rules[1], names)).toBe(
      'UNEB Primary Leaving Examination (PLE): English, Mathematics, Integrated Science and Social Studies. Religious Education is assessed within Social Studies.',
    );
  });

  it('lists the options for a subject with components', () => {
    expect(describeRule(rules[2], names)).toBe(
      'One of: Christian Religious Education (CRE) or Islamic Religious Education (IRE).',
    );
  });
});

describe('combinationsFor', () => {
  it('spells out each combination with subject names', () => {
    expect(combinationsFor(rules, 'S5', names)).toEqual([
      { code: 'PCM', subjects: 'Physics, Chemistry and Principal Mathematics' },
    ]);
    expect(combinationsFor(rules, 'S3', names)).toEqual([]);
  });
});

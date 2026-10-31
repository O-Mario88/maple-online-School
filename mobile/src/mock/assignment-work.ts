/** Sample data for the assignment workspace: Assignment 3, Fraction Word Problems (fractions are written "2/3"). */
import { photos } from './photos';

const w = (n: string): number => photos.work[n];

export const assignmentWork = {
  id: 'a5',
  crumbs: ['Assignments', 'Mathematics', 'Fractions', 'Assignment 3'],
  phoneCrumbs: ['Assignments', 'Fractions', 'Assignment 3'],
  title: 'Assignment 3: Fraction Word Problems',
  due: 'Due Fri, 24 Oct 2026 • 11:59 PM',
  dueLong: 'Fri, 24 Oct 2026 • 11:59 PM',
  sub: 'Solve the word problems and show your working. Upload your handwritten work and record a short 60-second explanation.',
  kind: 'Activity of Integration',
  scenario: 'Amina helps at her aunt’s bakery and farm in Mukono. Use fractions to help the family share, measure and plan fairly.',
  competency: 'The learner uses fractions to solve real-life sharing and measuring problems.',
  domains: ['knowledge', 'skills', 'values'] as const,
  skills: ['computation', 'critical', 'communication'] as const,
  instructions: [
    'Solve the 4 fraction word problems.',
    'Show your working on paper and upload clear photos/scans.',
    'Record a 60-second viva explaining one of your solutions.',
    'Submit before the due date.',
  ],
  questions: [
    'A recipe uses 2/3 cup of sugar. If Amina makes 3 batches, how much sugar does she use in total?',
    'A 5/6 m ribbon is cut into 3 equal pieces. What is the length of each piece?',
    'A water tank is 3/4 full. After using 1/8, how full is the tank now?',
    'A farmer plants crops on 7/8 of a field and later plants on another 1/16 of the field. What fraction of the field is planted in total?',
  ],
  resources: [
    { title: 'Example Solution', meta: 'PDF • 1.2 MB', icon: w('res-pdf'), action: 'Download' },
    { title: 'Marking Guide', meta: 'PDF • 0.8 MB', icon: w('res-guide'), action: 'Download' },
    { title: 'Watch a Similar Example', meta: 'Video • 4 min', icon: w('res-video'), action: 'Watch' },
    { title: 'Ask a Teacher', meta: 'Get help if you’re stuck', icon: w('res-chat'), action: 'Open Chat' },
  ],
  editor: [
    '# Question 1 – My Solution',
    'Each batch uses 2/3 cup of sugar.',
    'For 3 batches: 2/3 × 3 = 6/3 = 2 cups.',
    'So Amina uses 2 cups of sugar in **total**.',
    '',
    '# Question 2 – My Solution',
    'The ribbon is 5/6 m long and is cut into 3 equal pieces.',
    'Each piece: 5/6 ÷ 3 = 5/18 m.',
    '',
    '# Question 3 – My Solution',
    '',
    '# Question 4 – My Solution',
    '',
  ].join('\n'),
  pages: [w('page-1'), w('page-2'), w('page-3')],
  viva: { frame: w('viva'), seconds: 43, max: 60 },
  vivaTips: ['Explain your working and reasoning', 'Speak clearly (up to 60 seconds)', 'You can re-record if needed', 'It shows this is your own work (Honesty)'],
  fileIcons: { text: w('file-text'), image: w('file-image'), video: w('file-video') },
  attempts: { used: 0, max: 3 },
  assessment: 'RACE, out of 10',
  countsToward: 'Continuous Assessment (20%)',
};

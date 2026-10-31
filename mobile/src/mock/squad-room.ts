/**
 * Sample study squads for the Squad Room: 5–8 learners each, a shared weekly goal,
 * a streak, a leaderboard, a moderated chat, study sessions, resources and tasks.
 * "Today" is Saturday 31 Oct 2026, so upcoming sessions fall in the next week.
 */
import { photos } from './photos';

const f = (n: string): number => photos.squadRoom[n];

export type DayMark = 'done' | 'today' | 'next';
export type ResourceKind = 'pdf' | 'video' | 'link' | 'sheet';

const people = {
  grace: { name: 'Grace K.', face: f('face-grace') },
  daniel: { name: 'Daniel', face: f('face-daniel') },
  aisha: { name: 'Aisha N.', face: f('face-aisha') },
  james: { name: 'James O.', face: f('face-james') },
  sarah: { name: 'Sarah M.', face: f('face-sarah') },
  michael: { name: 'Michael T.', face: f('face-michael') },
  ruth: { name: 'Ruth A.', face: null },
  peter: { name: 'Peter W.', face: null },
} as Record<string, { name: string; face: number | null }>;

const week: DayMark[] = ['done', 'done', 'done', 'done', 'done', 'today', 'next'];

const mathsCrew = {
  id: 'o-level-maths-crew',
  name: 'O-Level Maths Crew',
  level: 'O-Level',
  subject: 'Mathematics',
  icon: f('sq-maths'),
  code: 'MATH-6K2Q',
  moderator: 'Ms. Achieng',
  tagline: 'Practice together, solve problems, and help each other improve.\nConsistent practice leads to real progress!',
  members: ['grace', 'daniel', 'aisha', 'james', 'sarah', 'michael'],
  goal: { label: 'Solve 100 practice questions together', done: 68, target: 100, daysLeft: 3, mine: 18 },
  streak: { days: 12, week },
  scores: { grace: { week: 28, month: 96 }, daniel: { week: 18, month: 71 }, aisha: { week: 12, month: 64 }, james: { week: 8, month: 52 }, sarah: { week: 7, month: 40 }, michael: { week: 5, month: 33 } } as Record<string, { week: number; month: number }>,
  activity: { questions: 68, sessions: 5, resources: 12, messages: 94 },
  chat: [
    { id: 'c1', who: 'grace', time: '10:14 AM', text: 'Finally solved question 3! The trick is to make the denominators the same first. 🙌', reactions: {} as Record<string, number> },
    { id: 'c2', who: 'james', time: '10:18 AM', text: 'Nice! I was stuck on that too. Can someone explain question 5? 🤔', image: f('question'), reactions: {} as Record<string, number> },
    { id: 'c3', who: 'aisha', time: '10:21 AM', text: 'I recorded a quick explanation. Check this out! 🎥', voice: 42, reactions: { '👍': 4, '❤️': 2 } as Record<string, number> },
    { id: 'c4', who: 'daniel', time: '10:25 AM', text: "This helps a lot! I also found a similar question in our practice. Let's do it together in tonight's study session.", reactions: { '👍': 3 } as Record<string, number> },
  ] as { id: string; who: string; time: string; text: string; image?: number; voice?: number; reactions: Record<string, number> }[],
  sessions: [
    { id: 's1', when: 'Mon, 2 Nov • 7:00 PM – 8:00 PM', title: 'Fractions Practice Session', going: ['grace', 'aisha', 'james', 'sarah'], count: 6, live: true, icon: f('cal-1') },
    { id: 's2', when: 'Wed, 4 Nov • 7:00 PM – 8:00 PM', title: 'Past Paper Walkthrough (Paper 1)', going: ['grace', 'aisha', 'james', 'michael'], count: 5, live: false, icon: f('cal-2') },
  ],
  resources: [
    { id: 'r1', title: 'Fractions Summary Notes', meta: 'PDF • 2.1 MB', by: 'grace', kind: 'pdf' as ResourceKind },
    { id: 'r2', title: 'Solving Linear Equations (Video)', meta: 'Video • 8 min', by: 'aisha', kind: 'video' as ResourceKind },
    { id: 'r3', title: 'Top 50 O-Level Maths Questions', meta: 'Link • teacher-checked', by: 'james', kind: 'link' as ResourceKind },
    { id: 'r4', title: 'Squad Formula Sheet', meta: 'PDF • 1.4 MB', by: 'sarah', kind: 'sheet' as ResourceKind },
  ],
  tasks: [
    { id: 't1', title: 'Each solve 15 fractions questions', who: 'Everyone', due: 'Sun, 1 Nov', done: false },
    { id: 't2', title: 'Explain question 5 in the chat', who: 'Aisha N.', due: 'Done', done: true },
    { id: 't3', title: 'Upload Paper 1 marking guide', who: 'James O.', due: 'Tue, 3 Nov', done: false },
    { id: 't4', title: 'Make 10 flashcards on decimals', who: 'Daniel', due: 'Wed, 4 Nov', done: false },
  ],
};

type Squad = typeof mathsCrew;
const small = (over: Partial<Squad> & Pick<Squad, 'id' | 'name' | 'level' | 'subject' | 'icon' | 'members' | 'goal' | 'scores' | 'tagline'>): Squad => ({
  ...mathsCrew,
  code: `${over.subject.slice(0, 4).toUpperCase()}-${over.members.length}F7R`,
  streak: { days: 5, week: ['next', 'next', 'done', 'done', 'done', 'today', 'next'] },
  activity: { questions: over.goal.done, sessions: 2, resources: 4, messages: 31 },
  chat: [
    { id: 'x1', who: over.members[0], time: '9:02 AM', text: `Morning squad! Who is ready for ${over.subject} today?`, reactions: { '👍': 2 } },
    { id: 'x2', who: 'daniel', time: '9:10 AM', text: "I'm in. Let's start with the questions we got wrong yesterday.", reactions: {} },
  ],
  sessions: [{ ...mathsCrew.sessions[0], id: 'y1', title: `${over.subject} Revision Session`, going: over.members.slice(0, 3), count: over.members.length - 1 }],
  resources: mathsCrew.resources.slice(0, 2).map((r, i) => ({ ...r, title: i === 0 ? `${over.subject} Summary Notes` : `${over.subject} Explained (Video)` })),
  tasks: [
    { id: 'y1', title: `Share one ${over.subject} question you found hard`, who: 'Everyone', due: 'Sun, 1 Nov', done: false },
    { id: 'y2', title: 'Plan next week’s session', who: people[over.members[0]].name, due: 'Done', done: true },
  ],
  ...over,
});

const squads: Squad[] = [
  mathsCrew,
  small({
    id: 'science-explorers',
    name: 'Science Explorers',
    level: 'O-Level',
    subject: 'Biology',
    icon: f('sq-science'),
    tagline: 'Curious minds exploring living things, one experiment at a time.',
    members: ['aisha', 'daniel', 'ruth', 'james', 'peter', 'grace', 'sarah'],
    goal: { label: 'Finish 5 practical write-ups together', done: 3, target: 5, daysLeft: 3, mine: 1 },
    scores: { aisha: { week: 9, month: 30 }, daniel: { week: 7, month: 26 }, ruth: { week: 6, month: 22 }, james: { week: 5, month: 21 }, peter: { week: 4, month: 18 }, grace: { week: 3, month: 15 }, sarah: { week: 2, month: 9 } },
  }),
  small({
    id: 'exam-ready-2026',
    name: 'Exam Ready 2026',
    level: 'Senior 4',
    subject: 'UCE Revision',
    icon: f('sq-exam'),
    tagline: 'Past papers every week until the UCE exams.',
    members: ['james', 'daniel', 'grace', 'michael', 'sarah', 'aisha', 'ruth', 'peter'],
    goal: { label: 'Complete 8 timed past papers', done: 5, target: 8, daysLeft: 3, mine: 1 },
    scores: { james: { week: 3, month: 9 }, daniel: { week: 2, month: 8 }, grace: { week: 2, month: 7 }, michael: { week: 1, month: 6 }, sarah: { week: 1, month: 5 }, aisha: { week: 1, month: 4 }, ruth: { week: 0, month: 3 }, peter: { week: 0, month: 2 } },
  }),
  small({
    id: 'stem-girls',
    name: 'STEM Girls',
    level: 'O-Level',
    subject: 'Physics',
    icon: f('sq-stem'),
    tagline: 'Girls who build, code and solve together.',
    members: ['sarah', 'aisha', 'grace', 'ruth', 'daniel'],
    goal: { label: 'Build one simple circuit each', done: 3, target: 5, daysLeft: 3, mine: 0 },
    scores: { sarah: { week: 4, month: 12 }, aisha: { week: 3, month: 11 }, grace: { week: 3, month: 9 }, ruth: { week: 2, month: 7 }, daniel: { week: 1, month: 5 } },
  }),
];

export const squadRoom = {
  me: 'daniel',
  people,
  squads,
  headerIcon: f('squads'),
  icons: {
    target: f('target'),
    flame: f('flame'),
    trophy: f('trophy'),
    chat: f('chat'),
    medal: f('medal'),
    crown: f('crown'),
    calendar: f('cal-head'),
    resources: f('res-head'),
    hero: f('hero'),
  },
  resourceIcons: { pdf: f('res-pdf'), video: f('res-video'), link: f('res-link'), sheet: f('res-sheet') } as Record<ResourceKind, number>,
  activityIcons: { questions: f('act-questions'), sessions: f('act-sessions'), resources: f('act-resources'), messages: f('act-messages') },
};

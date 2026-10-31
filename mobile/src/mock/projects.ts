/** Sample data for the learner's Projects page: Amina's eight NCDC competency projects, assessed with RACE. */
import type { GenericSkill, RaceScore } from '@/lib/cbc';
import type { ProjectStatus } from '@/lib/projects';

import { photos } from './photos';

const pj = (n: string): number => photos.projects[n];
const lh = (n: string): number => photos.learnerHome[n];

type Task = { title: string; state: 'done' | 'doing' | 'todo' };

export interface Project {
  id: string;
  title: string;
  subject: string;
  status: ProjectStatus;
  date: string;
  progress: number;
  thumb: number;
  hero: number;
  card: string;
  description: string;
  objectives: { knowledge: string; skills: string; values: string };
  skills: GenericSkill[];
  tasks: Task[];
  instructions: string[];
  /** RACE marks, once the teacher has assessed the work. */
  race?: RaceScore;
  /** Identifiers (1–3): KUSVA domains, the five generic skills, the four graduate-profile outcomes. */
  competency?: { kusva: number[]; skills: number[]; profile: number[] };
  feedback?: { teacher: string; date: string; text: string };
}

const ALL_SKILLS: GenericSkill[] = ['critical', 'creativity', 'communication', 'cooperation', 'computation'];

const projects: Project[] = [
  {
    id: 'greener-school',
    title: 'Growing a Greener School',
    subject: 'Science',
    status: 'in_progress',
    date: 'Due: Oct 30, 2026',
    progress: 0.6,
    thumb: pj('thumb-1'),
    hero: pj('hero'),
    card: 'Design and implement a school garden to promote environmental conservation and healthy living.',
    description: 'Design and implement a school garden to promote environmental conservation, healthy living, and teamwork. You will research suitable plants, prepare the garden, grow the plants, and present your findings.',
    objectives: { knowledge: 'Plant growth, ecosystems', skills: 'Planting, caring, data collection', values: 'Appreciate and care for the environment' },
    skills: ALL_SKILLS,
    tasks: [
      { title: 'Research and choose plants suitable for our local environment', state: 'done' },
      { title: 'Prepare the garden space and plant the seeds', state: 'done' },
      { title: 'Take photos and keep a growth record (at least 4 weeks)', state: 'doing' },
      { title: 'Write a short report with findings and reflections', state: 'todo' },
      { title: 'Present your project to the class (video or live)', state: 'todo' },
    ],
    instructions: [
      'Work in your garden team of four. Agree who does what and record it.',
      'Choose two plants that grow well in our climate and explain why.',
      'Measure and record plant height every Monday and Thursday.',
      'Write your report: what you did, what you found, and what you would change.',
      'Present for 3–5 minutes. Show your growth chart and photos.',
    ],
    race: { relevance: 3, accuracy: 2, coherence: 2, excellence: 1 },
    competency: { kusva: [2, 3, 3], skills: [3, 2, 3, 2, 2], profile: [2, 3, 2, 3] },
    feedback: {
      teacher: 'Mr. David',
      date: 'Oct 20, 2026',
      text: 'Excellent work! Your garden design shows strong understanding of plant needs and environmental care. You worked well with your team and presented clear findings. Keep improving your data analysis and try to add more creative ideas.',
    },
  },
  {
    id: 'waste-solutions',
    title: 'Creative Waste Solutions',
    subject: 'Social Studies',
    status: 'completed',
    date: 'Submitted: Oct 12, 2026',
    progress: 0.85,
    thumb: pj('thumb-2'),
    hero: pj('thumb-2'),
    card: 'Create useful items from recycled materials and present their importance to the community.',
    description: 'Collect clean waste from home and school, turn it into something useful, and show your community why reusing materials matters.',
    objectives: { knowledge: 'Types of waste, reuse and recycling', skills: 'Designing and making from recycled materials', values: 'Social responsibility and respect for the environment' },
    skills: ['creativity', 'communication', 'cooperation'],
    tasks: [
      { title: 'Survey the waste at home and in school for one week', state: 'done' },
      { title: 'Design and make two useful items from waste', state: 'done' },
      { title: 'Present your items at the school assembly', state: 'done' },
    ],
    instructions: ['Collect only clean, safe waste.', 'Sketch your design before you make it.', 'Explain how your item helps the community.'],
    race: { relevance: 3, accuracy: 3, coherence: 2, excellence: 1 },
    competency: { kusva: [3, 3, 3], skills: [2, 3, 3, 3, 2], profile: [3, 3, 2, 3] },
    feedback: { teacher: 'Ms. Grace', date: 'Oct 14, 2026', text: 'Very creative! Your pencil holders were useful and well made. Next time, explain the steps of your making more clearly.' },
  },
  {
    id: 'community-story',
    title: 'My Community Story',
    subject: 'English',
    status: 'upcoming',
    date: 'Due: Nov 10, 2026',
    progress: 0,
    thumb: pj('thumb-3'),
    hero: pj('thumb-3'),
    card: 'Research and write a story about a local hero in your community.',
    description: 'Interview someone who helps your community, then write and illustrate their story.',
    objectives: { knowledge: 'Parts of a story, interview questions', skills: 'Interviewing, writing and editing', values: 'Respect for humanity and social harmony' },
    skills: ['communication', 'cooperation', 'creativity'],
    tasks: [
      { title: 'Choose a local hero and ask permission to interview them', state: 'todo' },
      { title: 'Write your questions and hold the interview', state: 'todo' },
      { title: 'Write, edit and illustrate the story', state: 'todo' },
    ],
    instructions: ['Ask an adult at home to help you arrange the interview.', 'Write at least 300 words.'],
  },
  {
    id: 'healthy-eating',
    title: 'Healthy Eating Campaign',
    subject: 'Integrated',
    status: 'completed',
    date: 'Submitted: Oct 5, 2026',
    progress: 0.92,
    thumb: pj('thumb-4'),
    hero: pj('thumb-4'),
    card: 'Create a campaign to promote balanced nutrition among learners.',
    description: 'Plan a campaign that helps learners choose balanced meals, using posters, a short talk and a class survey.',
    objectives: { knowledge: 'Food groups and a balanced diet', skills: 'Surveying, poster design, public speaking', values: 'Social responsibility and hard work' },
    skills: ['communication', 'computation', 'creativity', 'cooperation'],
    tasks: [
      { title: 'Survey what learners eat at break', state: 'done' },
      { title: 'Make posters and a 2-minute talk', state: 'done' },
      { title: 'Run the campaign and survey again', state: 'done' },
    ],
    instructions: ['Show your survey results as a bar graph.', 'Use simple, positive messages on your posters.'],
    race: { relevance: 3, accuracy: 3, coherence: 3, excellence: 1 },
    competency: { kusva: [3, 3, 3], skills: [3, 3, 3, 3, 3], profile: [3, 3, 3, 3] },
    feedback: { teacher: 'Mr. David', date: 'Oct 8, 2026', text: 'Outstanding campaign. Your before-and-after survey showed real change. Well done!' },
  },
  {
    id: 'simple-machine',
    title: 'Design a Simple Machine',
    subject: 'Mathematics',
    status: 'attention',
    date: 'Due: Oct 28, 2026',
    progress: 0.2,
    thumb: pj('thumb-5'),
    hero: pj('thumb-5'),
    card: 'Build a simple machine and explain how it makes work easier.',
    description: 'Build a lever, pulley or ramp from local materials, measure the effort it saves, and explain how it works.',
    objectives: { knowledge: 'Levers, pulleys and ramps', skills: 'Measuring force and distance, building a model', values: 'Hard work for self-reliance and creativity' },
    skills: ['critical', 'computation', 'creativity'],
    tasks: [
      { title: 'Choose your machine and draw a labelled plan', state: 'done' },
      { title: 'Build the model', state: 'todo' },
      { title: 'Measure the effort with and without it', state: 'todo' },
      { title: 'Explain your results in a short video', state: 'todo' },
    ],
    instructions: ['Use safe materials only.', 'Record measurements in a table.'],
    feedback: { teacher: 'Mr. David', date: 'Oct 22, 2026', text: 'Your plan is good, but the model is behind schedule. Please bring your materials on Monday so we can catch up.' },
  },
  {
    id: 'wildlife-diary',
    title: 'Wildlife Watch Diary',
    subject: 'Science',
    status: 'in_progress',
    date: 'Due: Nov 3, 2026',
    progress: 0.45,
    thumb: lh('book-1'),
    hero: lh('book-1'),
    card: 'Observe and record animals and birds around your home for three weeks.',
    description: 'Keep a diary of the animals and birds you see, where and when, and look for patterns.',
    objectives: { knowledge: 'Habitats and animal behaviour', skills: 'Observing and recording data', values: 'Respect for the environment' },
    skills: ['critical', 'computation', 'communication'],
    tasks: [
      { title: 'Set up your diary pages', state: 'done' },
      { title: 'Record sightings every day for three weeks', state: 'doing' },
      { title: 'Draw a chart of what you saw most', state: 'todo' },
    ],
    instructions: ['Never touch or disturb the animals.', 'Note the time, place and weather each day.'],
  },
  {
    id: 'town-map',
    title: 'Our Town Map',
    subject: 'Social Studies',
    status: 'completed',
    date: 'Submitted: Sep 28, 2026',
    progress: 0.88,
    thumb: lh('course-4'),
    hero: lh('course-4'),
    card: 'Draw a map of your town showing key places, services and roads.',
    description: 'Make a map of your town with a key, showing schools, health centres, markets and roads.',
    objectives: { knowledge: 'Maps, keys and directions', skills: 'Drawing to scale, using a compass', values: 'Social responsibility' },
    skills: ['computation', 'communication', 'cooperation'],
    tasks: [
      { title: 'Walk the area and note key places', state: 'done' },
      { title: 'Draw the map with a key and compass', state: 'done' },
    ],
    instructions: ['Use a scale of 1 cm to 100 m.', 'Add a key and a north arrow.'],
    race: { relevance: 3, accuracy: 2, coherence: 3, excellence: 1 },
    competency: { kusva: [3, 3, 2], skills: [3, 2, 3, 3, 3], profile: [2, 3, 3, 3] },
    feedback: { teacher: 'Ms. Grace', date: 'Sep 30, 2026', text: 'A clear, well-labelled map. Check your scale on the market road.' },
  },
  {
    id: 'inventors-fair',
    title: 'Young Inventors Fair',
    subject: 'Integrated',
    status: 'upcoming',
    date: 'Due: Nov 20, 2026',
    progress: 0,
    thumb: lh('book-2'),
    hero: lh('book-2'),
    card: 'Invent something that solves a problem at home and show it at the fair.',
    description: 'Find a small problem at home, invent a solution, and present it at the school fair.',
    objectives: { knowledge: 'How inventions solve problems', skills: 'Designing, testing and improving', values: 'Creativity, innovativeness and integrity' },
    skills: ['creativity', 'critical', 'communication'],
    tasks: [
      { title: 'Find a problem at home worth solving', state: 'todo' },
      { title: 'Sketch and build your invention', state: 'todo' },
    ],
    instructions: ['Explain who your invention helps.', 'Show at least one improvement you made after testing.'],
  },
];

export const projectsPage = {
  projects,
  subjects: ['Science', 'Social Studies', 'English', 'Integrated', 'Mathematics'],
  pageIcon: pj('page'),
  statIcons: { total: pj('stat-1'), completed: pj('stat-2'), in_progress: pj('stat-3'), upcoming: pj('stat-4'), attention: pj('stat-5') },
  raceIcons: { relevance: pj('race-r'), accuracy: pj('race-a'), coherence: pj('race-c'), excellence: pj('race-e') },
  compIcons: Array.from({ length: 12 }, (_, i) => pj(`comp-${i + 1}`)),
  sectionIcons: { kusva: pj('sec-kusva'), skills: pj('sec-skills'), profile: pj('sec-profile') },
  subjectIcon: pj('subject'),
  teacherPhoto: pj('teacher'),
  attachments: [
    { title: 'Project Guide.pdf', meta: '2.4 MB (PDF)', icon: pj('att-pdf') },
    { title: 'Planting Tips.mp4', meta: '15 mins (Video)', icon: pj('att-video') },
    { title: 'Sample Report.docx', meta: '1.1 MB (DOCX)', icon: pj('att-docx') },
    { title: 'More Resources', meta: '5 items', icon: pj('att-more') },
  ],
  discussion: [
    { who: 'Mr. David', text: 'Remember to measure your plants on Monday and Thursday.', when: 'Oct 21' },
    { who: 'Brian (team)', text: 'I watered the beans today. They are 6 cm now!', when: 'Oct 23' },
  ],
};

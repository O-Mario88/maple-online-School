/**
 * The Digital Library book reader sample: "Our Environment" (Social Studies, Primary 6), read by
 * Amina N. Pages 12–15 are written out; other pages show their chapter's summary. Illustrative.
 */
import type { IconName } from '@/lib/icons';

export type Block =
  | { kind: 'tag'; text: string }
  | { kind: 'title'; text: string }
  | { kind: 'rule' }
  | { kind: 'para'; id: string; text: string }
  | { kind: 'idea'; title: string; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'bullets'; items: readonly { bold: string; text: string }[] }
  | { kind: 'figure'; caption: string; image?: number }
  | { kind: 'media'; media: 'video' | 'audio'; image: number; title: string; caption: string }
  | { kind: 'uses'; items: readonly { icon: IconName; color: string; bold?: string; text: string }[] };

export interface PageSpread {
  left: readonly Block[];
  right: readonly Block[];
}

export interface Unit {
  id: string;
  title: string;
  chapters: readonly { id: string; title: string; start: number; summary: string }[];
}

export const learner = { id: 'learner-amina', name: 'Amina N.', level: 'Primary 6', avatar: require('./images/pp-sarah.png') as number, notifications: 3 };

export const units: readonly Unit[] = [
  {
    id: 'u1',
    title: 'Unit 1: Our Environment',
    chapters: [
      { id: 'c1', title: 'Chapter 1: Understanding Our Environment', start: 12, summary: 'The environment is everything around us: living things like people, animals and plants, and non-living things like land, water, air and sunlight.' },
      { id: 'c2', title: 'Chapter 2: Natural Resources', start: 19, summary: 'Natural resources are things from nature that people use: water, soil, forests, minerals and wildlife. Some can be renewed and some cannot.' },
      { id: 'c3', title: 'Chapter 3: Environmental Conservation', start: 26, summary: 'Conservation means using resources wisely so they last: planting trees, saving water and keeping wetlands safe.' },
      { id: 'c4', title: 'Chapter 4: People and the Environment', start: 33, summary: 'People change the environment by farming, building and travelling. These changes can help or harm it.' },
    ],
  },
  { id: 'u2', title: 'Unit 2: Climate and Weather', chapters: [{ id: 'c5', title: 'Chapter 5: Weather and Seasons', start: 40, summary: 'Weather is the condition of the air each day; climate is the usual weather of a place over many years.' }] },
  { id: 'u3', title: 'Unit 3: Land and Water Resources', chapters: [{ id: 'c6', title: 'Chapter 6: Soil, Lakes and Rivers', start: 45, summary: 'Soil grows our food and lakes and rivers give us water, fish and transport. Both need care.' }] },
  { id: 'u4', title: 'Unit 4: Environmental Challenges', chapters: [{ id: 'c7', title: 'Chapter 7: Pollution and Deforestation', start: 49, summary: 'Pollution makes air, water and land dirty; cutting too many trees causes soil erosion and less rain.' }] },
  { id: 'u5', title: 'Unit 5: Sustainable Living', chapters: [{ id: 'c8', title: 'Chapter 8: Living Sustainably', start: 53, summary: 'Sustainable living means meeting our needs today without spoiling the environment for tomorrow.' }] },
];

export const book = {
  id: 'our-environment',
  title: 'Our Environment',
  subject: 'Social Studies',
  level: 'Primary 6',
  rating: 4.8,
  readers: 1246,
  format: 'eBook',
  kind: 'book' as const,
  unit: 'page' as const,
  play: 'Read Aloud',
  /** Drawn from the chapter-one landscape rather than a photo. */
  art: 'environment' as const,
  pages: 56,
  offline: true,
  cover: require('./images/lib-t-our-environment.png') as number,
  about: 'Explains the components, importance and conservation of the environment for Primary 6 learners.',
  chapters: units.flatMap((u) => u.chapters.map((c) => ({ id: c.id, title: c.title.replace(/^Chapter \d+: /, ''), start: c.start }))),
  /** Read aloud length for the open page, in seconds. */
  audioSeconds: 390,
};

/** Where Amina left off last time: page 12, with 38 of 56 pages read. */
export const saved = {
  lastPage: 12,
  read: [...Array.from({ length: 24 }, (_, i) => i + 1), 26, 27, 28, 29, 30, 31, 33, 34, 35, 36, 37, 38, 40, 41],
};

export const spreads: Readonly<Record<number, PageSpread>> = {
  12: {
    left: [
      { kind: 'tag', text: 'Chapter 1' },
      { kind: 'title', text: 'Understanding Our Environment' },
      { kind: 'rule' },
      { kind: 'para', id: 'p1', text: 'Our environment is everything around us. It includes living things, such as people, animals and plants, and non-living things, such as land, water, air and sunlight. All these things work together to make life possible.' },
      { kind: 'idea', title: 'Key Idea', text: 'The environment is our home. We must understand it, use it wisely and protect it for future generations.' },
      { kind: 'heading', text: 'Components of the Environment' },
      { kind: 'para', id: 'p2', text: 'The environment is made up of two main components:' },
      {
        kind: 'bullets',
        items: [
          { bold: 'The natural environment', text: ' – things that occur in nature, such as forests, rivers, mountains, soil and the weather.' },
          { bold: 'The human-made environment', text: ' – things created by people, such as houses, roads, schools and farms.' },
        ],
      },
    ],
    right: [
      { kind: 'figure', caption: 'Figure 1.1: A natural environment with forests, a river and mountains.' },
      { kind: 'heading', text: 'The Importance of the Environment' },
      { kind: 'para', id: 'p3', text: 'Our environment provides many things we need to live. It gives us:' },
      {
        kind: 'uses',
        items: [
          { icon: 'flask', color: '#1E88E5', text: 'Water for drinking, cooking and cleaning.' },
          { icon: 'sparkle', color: '#22A55A', bold: 'Food', text: ' from plants and animals.' },
          { icon: 'cloud', color: '#3B6FD8', text: 'Clean air for breathing.' },
          { icon: 'home', color: '#F59E0B', text: 'Materials such as wood, clay and sand for building.' },
          { icon: 'star', color: '#F5B301', text: 'A pleasant place to live, learn and play.' },
        ],
      },
    ],
  },
  13: {
    left: [
      { kind: 'heading', text: 'Living and Non-living Things' },
      { kind: 'para', id: 'p4', text: 'Living things grow, feed, breathe, move and reproduce. Examples are people, cows, fish, birds and trees. Non-living things do not do these things. Examples are stones, water, air and soil.' },
      { kind: 'idea', title: 'Did You Know?', text: 'Lake Victoria, shared by Uganda, Kenya and Tanzania, is the largest lake in Africa. Millions of people depend on it for water and fish.' },
      { kind: 'para', id: 'p5', text: 'Living and non-living things depend on each other. Plants need soil, water and sunlight to grow. Animals need plants for food and shelter.' },
    ],
    right: [
      { kind: 'heading', text: 'Our School Environment' },
      { kind: 'para', id: 'p6', text: 'Your school is part of the environment. It has buildings, a compound, trees, a garden and a water source. Keeping it clean keeps everyone healthy.' },
      {
        kind: 'bullets',
        items: [
          { bold: 'Sweep and slash', text: ' the compound every week.' },
          { bold: 'Use the rubbish pit', text: ' and never litter.' },
          { bold: 'Water the school garden', text: ' and the trees you planted.' },
        ],
      },
    ],
  },
  14: {
    left: [
      { kind: 'heading', text: 'How People Use the Environment' },
      { kind: 'para', id: 'p7', text: 'People use land for farming and building, rivers for water and transport, and forests for timber, firewood and medicine. Using these resources well helps families and the country to grow.' },
      { kind: 'idea', title: 'Think About It', text: 'Which things in your home come from the environment? Make a list and share it with your class.' },
    ],
    right: [
      { kind: 'heading', text: 'Harming the Environment' },
      { kind: 'para', id: 'p8', text: 'Some activities harm the environment: cutting trees without replanting, burning rubbish, draining swamps and pouring waste into rivers. These cause soil erosion, dirty water and less rain.' },
      {
        kind: 'bullets',
        items: [
          { bold: 'Deforestation', text: ' – cutting down many trees.' },
          { bold: 'Pollution', text: ' – making air, water or land dirty.' },
        ],
      },
    ],
  },
  15: {
    left: [
      { kind: 'heading', text: 'Caring for Our Environment' },
      { kind: 'para', id: 'p9', text: 'Everyone can help: plant a tree, turn off taps, recycle bottles and paper, and keep wetlands safe. Small actions by many people make a big difference.' },
    ],
    right: [
      { kind: 'idea', title: 'Chapter Summary', text: 'The environment has natural and human-made parts. It gives us water, food, air and materials. We must use it wisely and protect it.' },
      { kind: 'para', id: 'p10', text: 'Next, in Chapter 2, you will learn about natural resources and how to use them without wasting them.' },
    ],
  },
};

export const dictionary: Readonly<Record<string, string>> = {
  environment: 'Everything around us, both living and non-living, that affects how we live.',
  natural: 'Made by nature, not by people.',
  conservation: 'Protecting and using resources carefully so that they last.',
  resources: 'Things people use to meet their needs, such as water, land and forests.',
  pollution: 'Making air, water or land dirty and harmful.',
  deforestation: 'Cutting down many trees without planting new ones.',
  ecosystem: 'A community of living things and their surroundings working together.',
  wetland: 'Land that is wet most of the year, such as a swamp.',
  generations: 'People born and living at about the same time; future generations are people not yet born.',
};

export const translations: readonly { language: string; text: string }[] = [
  { language: 'Luganda', text: 'Obutonde bwe maka gaffe. Tulina okubutegeera, okubukozesa obulungi n’okubukuuma ku lw’emirembe egijja.' },
  { language: 'Kiswahili', text: 'Mazingira ni nyumbani kwetu. Lazima tuyaelewe, tuyatumie kwa busara na tuyalinde kwa vizazi vijavyo.' },
  { language: 'French', text: 'L’environnement est notre maison. Nous devons le comprendre, l’utiliser avec sagesse et le protéger pour les générations futures.' },
];

export interface Question {
  id: string;
  q: string;
  options: readonly string[];
  answer: number;
}

export const quickQuestions: readonly Question[] = [
  { id: 'q1', q: 'What is the environment?', options: ['Only plants and animals', 'Everything around us', 'Only buildings', 'Only the weather'], answer: 1 },
  { id: 'q2', q: 'Which of these is a non-living thing?', options: ['A tree', 'A cow', 'Water', 'A bird'], answer: 2 },
  { id: 'q3', q: 'A school is part of the…', options: ['Natural environment', 'Human-made environment', 'Weather', 'Forest'], answer: 1 },
  { id: 'q4', q: 'Which gives us clean air?', options: ['Burning rubbish', 'Trees and plants', 'Cars', 'Factories'], answer: 1 },
  { id: 'q5', q: 'Why should we protect the environment?', options: ['For future generations', 'To waste water', 'To cut trees', 'It does not matter'], answer: 0 },
];

export const chapterQuiz: readonly Question[] = [
  { id: 'k1', q: 'Name the two main components of the environment.', options: ['Natural and human-made', 'Hot and cold', 'Land and sky', 'Plants and stones'], answer: 0 },
  { id: 'k2', q: 'Which is part of the natural environment?', options: ['Road', 'River', 'House', 'Farm'], answer: 1 },
  { id: 'k3', q: 'Wood, clay and sand are used for…', options: ['Breathing', 'Building', 'Drinking', 'Playing'], answer: 1 },
  { id: 'k4', q: 'Cutting many trees without replanting is called…', options: ['Conservation', 'Recycling', 'Deforestation', 'Irrigation'], answer: 2 },
  { id: 'k5', q: 'Which action helps the environment?', options: ['Littering', 'Draining swamps', 'Planting trees', 'Burning bush'], answer: 2 },
];

export const activity = {
  title: 'Map Your School Environment',
  steps: ['Walk around your school compound with a friend.', 'Draw a map showing living things (trees, animals) in green and non-living things (buildings, water tanks) in blue.', 'Mark one place that needs care and write how your class can help.', 'Photograph your map and upload it here for your teacher.'],
};

export const summaries: Readonly<Record<string, readonly string[]>> = {
  c1: ['The environment is everything around us.', 'It has natural and human-made parts.', 'It gives us water, food, air and building materials.', 'We must use it wisely and protect it.'],
};

export const tutorAnswers: readonly { match: RegExp; answer: string }[] = [
  { match: /non.?living|living/i, answer: 'Living things grow, feed, breathe, move and reproduce, like a cow or a mango tree. Non-living things don’t, like a stone or water. Look at page 13 for more examples.' },
  { match: /human.?made|natural/i, answer: 'Natural things come from nature (rivers, forests). Human-made things are built by people (schools, roads). Try sorting five things in your classroom into the two groups!' },
  { match: /protect|conserv|care/i, answer: 'You can protect the environment by planting trees, saving water, using rubbish pits and recycling. Chapter 3 explains conservation in detail.' },
];

export const related: readonly { title: string; meta: string; kind: 'video' | 'pdf' | 'doc'; thumb?: number }[] = [
  { title: 'The Environment Around Us', meta: 'Video • 6 min', kind: 'video', thumb: require('./images/sdash-hero-mountain.jpg') as number },
  { title: 'Environmental Conservation', meta: 'Article • 4 pages (PDF)', kind: 'pdf' },
  { title: 'Caring for Our Environment', meta: 'Worksheet • 3 pages', kind: 'doc' },
];

/** Sample data for the learner's Digital Library and its reader. Fractions are written "2/3" (drawn stacked). */
import { photos } from './photos';

const l = (n: string): number => photos.library[n];

export interface ShelfBook {
  id: string;
  title: string;
  subject: string;
  /** The short tag on the cover card, e.g. "R.E.". */
  tag: string;
  level: string;
  type: 'E-books' | 'Audiobooks' | 'Videos' | 'Articles' | 'Practice Papers' | 'Teacher Guides' | 'Flashcards';
  language: string;
  publisher: string;
  rating: number;
  cover: number;
}

const book = (id: string, title: string, subject: string, tag: string, cover: number, rating: number, over: Partial<ShelfBook> = {}): ShelfBook => ({
  id,
  title,
  subject,
  tag,
  level: 'Primary 6',
  type: 'E-books',
  language: 'English',
  publisher: 'Maple',
  rating,
  cover,
  ...over,
});

const books: ShelfBook[] = [
  book('p6-maths', 'Primary Mathematics Learner’s Book 6', 'Mathematics', 'Mathematics', l('rec-1'), 4.8, { publisher: 'NCDC' }),
  book('p6-english', 'English for Primary 6', 'English', 'English', l('t-p6-english'), 4.7, { publisher: 'Fountain' }),
  book('p6-science', 'Integrated Science Learner’s Book 6', 'Science', 'Science', l('rec-3'), 4.6, { publisher: 'NCDC' }),
  book('our-uganda', 'Our Uganda', 'Social Studies', 'Social Studies', l('t-our-uganda'), 4.6, { publisher: 'Fountain' }),
  book('p6-ict', 'Computer Skills for Primary 6', 'ICT', 'ICT', l('rec-5'), 4.5),
  book('p6-cre', 'Christian Religious Education 6', 'Religious Education', 'R.E.', l('rec-6'), 4.7, { publisher: 'NCDC' }),
  book('animal-world', 'Amazing Animal World', 'Science', 'Science', l('t-animal-world'), 4.8, { publisher: 'Oxford' }),
  book('fractions', 'Fractions and Decimals', 'Mathematics', 'Mathematics', l('t-fractions'), 4.8),
  book('solar-system', 'The Solar System', 'Science', 'Science', l('t-solar-system'), 4.9, { type: 'Videos' }),
  book('life-skills', 'Life Skills for Everyday Living', 'Life Skills', 'Life Skills', l('t-life-skills'), 4.6),
  book('coding-kids', 'Coding for Kids', 'ICT', 'ICT', l('t-coding-kids'), 4.8),
  book('child-story', 'A Ugandan Child’s Story', 'English', 'English', l('t-child-story'), 4.7),
  book('healthy-habits', 'Healthy Habits', 'Life Skills', 'Life Skills', l('t-healthy-habits'), 4.6, { type: 'Videos' }),
  book('maps-world', 'Maps and Our World', 'Social Studies', 'Social Studies', l('t-maps-world'), 4.8, { publisher: 'Cambridge' }),
  book('christian-values', 'Christian Values in Daily Life', 'Religious Education', 'R.E.', l('t-christian-values'), 4.7),
  book('simple-machines', 'Simple Machines', 'Science', 'Science', l('t-simple-machines'), 4.5, { type: 'Videos' }),
  book('climate-change', 'Climate Change and Our Planet', 'Science', 'Science', l('t-climate-change'), 4.8),
  book('creative-writing', 'Creative Writing Made Easy', 'English', 'English', l('t-creative-writing'), 4.7, { publisher: 'Oxford' }),
  book('money-me', 'Money and Me', 'Life Skills', 'Life Skills', l('t-money-me'), 4.8, { language: 'Swahili' }),
  book('digital-safety', 'Digital Safety for Learners', 'ICT', 'ICT', l('t-digital-safety'), 4.6, { type: 'Videos' }),
  book('uganda-stories', 'Stories from Uganda', 'Social Studies', 'Social Studies', l('t-uganda-stories'), 4.7, { language: 'Luganda', publisher: 'Fountain' }),
  book('science-home', 'Science Experiments at Home', 'Science', 'Science', l('t-science-home'), 4.6),
  book('model-essays', 'Model Essays and Comprehension', 'English', 'English', l('t-model-essays'), 4.8, { type: 'Teacher Guides' }),
  book('ple-top100', 'Top 100 Practice Questions – PLE', 'Mathematics', 'Mathematics', l('t-ple-top100'), 4.8, { type: 'Practice Papers' }),
  book('our-environment', 'Our Environment', 'Science', 'Science', l('t-our-environment'), 4.7),
  book('bible-stories', 'Bible Stories for Children', 'Religious Education', 'R.E.', l('t-bible-stories'), 4.8, { type: 'Audiobooks' }),
  book('uganda-pictures', 'Uganda in Pictures', 'Social Studies', 'Social Studies', l('t-uganda-pictures'), 4.6),
  book('project-ideas', 'Project Ideas for Primary Learners', 'Life Skills', 'Life Skills', l('t-project-ideas'), 4.7),
  book('p6-revision', 'Primary 6 Revision Pack', 'Mixed Subjects', 'Mixed Subjects', l('teach-1'), 4.9, { type: 'Practice Papers' }),
  book('water-cycle', 'The Water Cycle', 'Science', 'Science', l('c-water-cycle'), 4.7),
  book('reading-comp', 'Reading Comprehension', 'English', 'English', l('c-reading-comp'), 4.6),
  book('maths-olevel', 'Mathematics for O-Level', 'Mathematics', 'Mathematics', l('book'), 4.8, { level: 'Senior 1', publisher: 'Oxford' }),
];

/** 48 cards: eight written ones, then simplifying practice made from fraction pairs. */
const written = [
  { front: 'What is a fraction?', back: 'A fraction is a number that represents a part of a whole. It is written in the form a/b where a is the numerator and b is the denominator.', tag: 'Definition' },
  { front: 'What is the numerator?', back: 'The top number of a fraction. It tells how many equal parts we have.', tag: 'Definition' },
  { front: 'What is the denominator?', back: 'The bottom number of a fraction. It tells how many equal parts make the whole.', tag: 'Definition' },
  { front: 'What are equivalent fractions?', back: 'Fractions that name the same amount, such as 1/2 = 2/4 = 3/6.', tag: 'Definition' },
  { front: 'How do you compare fractions with the same denominator?', back: 'Compare the numerators. The larger numerator gives the larger fraction: 5/8 > 3/8.', tag: 'Method' },
  { front: 'Write 0.5 as a fraction.', back: '0.5 = 5/10 = 1/2', tag: 'Practice' },
  { front: 'Write 3/4 as a decimal.', back: '3/4 = 75/100 = 0.75', tag: 'Practice' },
  { front: 'Which is larger: 2/3 or 3/5?', back: '2/3 = 10/15 and 3/5 = 9/15, so 2/3 is larger.', tag: 'Practice' },
];
const PAIRS = [
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [3, 5],
  [5, 6],
  [3, 8],
  [5, 8],
];
const made = Array.from({ length: 40 }, (_, i) => {
  const [n, d] = PAIRS[i % PAIRS.length];
  const k = 2 + Math.floor(i / PAIRS.length);
  return { front: `Simplify ${n * k}/${d * k}.`, back: `${n * k}/${d * k} = ${n}/${d} (divide top and bottom by ${k})`, tag: 'Practice' };
});

export const libraryHub = {
  books,
  hero: l('hero2'),
  subjects: [
    { name: 'Mathematics', count: '1,342 resources', icon: l('subj-math') },
    { name: 'English', count: '2,156 resources', icon: l('subj-english') },
    { name: 'Science', count: '1,876 resources', icon: l('subj-science') },
    { name: 'Social Studies', count: '1,208 resources', icon: l('subj-social') },
    { name: 'ICT', count: '986 resources', icon: l('subj-ict') },
    { name: 'Languages', count: '642 resources', icon: l('subj-languages') },
    { name: 'Life Skills', count: '624 resources', icon: l('subj-life') },
    { name: 'Religious Education', count: '512 resources', icon: l('subj-re') },
  ],
  levels: ['Nursery', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'Primary 7', 'Senior 1', 'Senior 2', 'Senior 3', 'Senior 4'],
  recommended: ['animal-world', 'p6-english', 'fractions', 'our-uganda', 'solar-system', 'life-skills'],
  /** Reading progress, with the small square thumbnails the side column uses. */
  continue: [
    { id: 'fractions', progress: 0.68, thumb: l('c-fractions') },
    { id: 'child-story', progress: 0.4, thumb: l('c-child-story') },
    { id: 'simple-machines', progress: 0.25, thumb: l('c-simple-machines') },
  ],
  completed: [
    { id: 'water-cycle', on: 'Oct 20, 2026', thumb: l('c-water-cycle') },
    { id: 'reading-comp', on: 'Oct 15, 2026', thumb: l('c-reading-comp') },
    { id: 'maps-world', on: 'Oct 10, 2026', thumb: l('c-maps-world') },
  ],
  popular: ['coding-kids', 'child-story', 'healthy-habits', 'maps-world', 'christian-values', 'simple-machines'],
  newArrivals: ['climate-change', 'creative-writing', 'money-me', 'digital-safety', 'uganda-stories', 'science-home'],
  teacherPicks: ['model-essays', 'ple-top100', 'our-environment', 'bible-stories', 'uganda-pictures', 'project-ideas'],
  myLibrary: [
    { title: 'My Books', meta: '24 books saved', icon: l('my-1') },
    { title: 'Bookmarks', meta: '18 bookmarks', icon: l('my-2') },
    { title: 'Notes & Highlights', meta: '36 notes', icon: l('my-3') },
    { title: 'Recently Viewed', meta: '8 items', icon: l('my-4') },
  ],
  filters: {
    types: [
      ['E-books', 1245],
      ['Audiobooks', 238],
      ['Videos', 412],
      ['Articles', 936],
      ['Practice Papers', 286],
      ['Teacher Guides', 164],
      ['Flashcards', 320],
    ] as [string, number][],
    languages: ['English', 'Luganda', 'French', 'Swahili', 'Other'],
    publishers: ['Maple', 'NCDC', 'Oxford', 'Cambridge', 'Fountain', 'Other'],
  },
  reader: {
    publisherLine: 'Oxford University Press  •  2023',
    pages: 320,
    startPage: 12,
    contents: [
      { title: '2.1 Whole Numbers', page: 4 },
      { title: '2.2 Factors and Multiples', page: 8 },
      { title: '2.3 Fractions and Decimals', page: 11 },
      { title: '2.4 Percentages', page: 18 },
      { title: '2.5 Ratio and Proportion', page: 24 },
    ],
    /** Pages 11–13 are in this sample; the rest of the book shows a preview note. */
    content: {
      11: [
        { kind: 'h2', num: '2.3', title: 'Fractions and Decimals' },
        { kind: 'p', text: 'We use fractions every day: half a loaf of bread, a quarter of an hour, three-quarters of a tank of water.' },
        { kind: 'p', text: 'In this section you will learn to read, write, compare and convert fractions and decimals.' },
        { kind: 'takeaway', title: 'You will be able to', text: 'Compare fractions, find equivalent fractions and change fractions to decimals.' },
      ],
      12: [
        { kind: 'h2', num: '2.3', title: 'Fractions and Decimals' },
        { kind: 'p', text: 'A fraction is a number that represents a part of a whole. It can be written in the form a/b where a is the numerator and b is the denominator.' },
        { kind: 'mark', text: 'Fractions can be equivalent. For example,', rest: '1/2 = 2/4 = 3/6.' },
        { kind: 'h3', num: '2.3.1', title: 'Comparing Fractions' },
        { kind: 'p', text: 'To compare fractions with the same denominator, compare the numerators. The fraction with the larger numerator is the larger fraction.' },
        { kind: 'example', title: 'Example 1', lines: ['Compare 3/8 and 5/8.', 'Since 5 > 3, 5/8 is greater than 3/8.'] },
        { kind: 'takeaway', title: 'Key Takeaway', text: 'Fractions with the same denominator are compared by their numerators.' },
      ],
      13: [
        { kind: 'h3', num: '2.3.2', title: 'Fractions to Decimals' },
        { kind: 'p', text: 'To change a fraction to a decimal, make the denominator 10, 100 or 1000, or divide the numerator by the denominator.' },
        { kind: 'example', title: 'Example 2', lines: ['Write 3/4 as a decimal.', '3/4 = 75/100 = 0.75'] },
        { kind: 'takeaway', title: 'Key Takeaway', text: 'Tenths, hundredths and thousandths turn straight into decimals.' },
      ],
    } as Record<number, ({ kind: 'h2' | 'h3'; num: string; title: string } | { kind: 'p'; text: string } | { kind: 'mark'; text: string; rest: string } | { kind: 'example'; title: string; lines: string[] } | { kind: 'takeaway'; title: string; text: string })[]>,
    note: 'Important:\nSame denominator\n→ compare\nnumerators.',
    definitions: {
      numerator: 'The top number of a fraction: how many equal parts you have.',
      denominator: 'The bottom number of a fraction: how many equal parts make the whole.',
      equivalent: 'Having the same value, such as 1/2 and 2/4.',
    } as Record<string, string>,
    pie: l('pie'),
    shelf: [
      { name: 'Mathematics', count: '248 books', icon: l('r-math') },
      { name: 'English', count: '312 books', icon: l('r-english') },
      { name: 'Science', count: '286 books', icon: l('r-science') },
      { name: 'Social Studies', count: '198 books', icon: l('r-social') },
      { name: 'ICT', count: '124 books', icon: l('r-ict') },
      { name: 'Exam Revision', count: '420 resources', icon: l('r-exam') },
      { name: 'Teacher Lists', count: '56 curated lists', icon: l('r-lists') },
    ],
    types: ['All', 'Textbooks', 'Revision Guides', 'Past Papers', 'Teacher Lists', 'My Books', 'Flashcards'],
    menu: ['Library Home', 'My Books', 'Teacher Reading Lists', 'Flashcard Decks', 'Downloads', 'Notes & Highlights', 'Recently Viewed'],
    recommended: [
      { title: 'Mathematics for O-Level', meta: 'Oxford, 2023', rating: 4.8, cover: l('r-rec-1') },
      { title: 'A-Level Biology Revision', meta: 'CGP, 2024', rating: 4.7, cover: l('r-rec-2') },
      { title: 'English Language Skills', meta: 'Cambridge, 2023', rating: 4.6, cover: l('r-rec-3') },
      { title: 'Uganda History', meta: 'Fountain, 2022', rating: 4.5, cover: l('r-rec-4') },
    ],
    lists: [
      { title: 'O-Level Maths Essentials', who: 'Ms. Achieng', count: '12 books', icon: l('r-list-1') },
      { title: 'O-Level Science Core', who: 'Mr. Okello', count: '15 books', icon: l('r-list-2') },
      { title: 'Exam Revision Pack', who: 'Ms. Nambasa', count: '18 books', icon: l('r-list-3') },
      { title: 'Top 100 Past Questions', who: 'Maple Teachers', count: '100 resources', icon: l('r-list-4') },
    ],
    autoIcon: l('r-auto'),
    deckIcon: l('r-deck'),
    decks: {
      'My Decks': { name: 'Fractions and Decimals', cards: [...written, ...made] },
      'Class Decks': { name: 'Equivalent Fractions (Ms. Achieng)', cards: [written[3], written[4], ...made.slice(0, 22)] },
      Saved: { name: 'Saved cards', cards: [written[0], written[3]] },
    },
    /** Cards already rated in "My Decks": 12 Good and 3 Hard, so the deck shows 28%. */
    startRatings: { ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [8 + i, 'good'])), 20: 'hard', 21: 'hard', 22: 'hard' } as Record<number, 'again' | 'hard' | 'good' | 'easy'>,
  },
};

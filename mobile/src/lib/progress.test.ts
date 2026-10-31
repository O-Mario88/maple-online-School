import { leafState, nextMilestone, overall, REVIEW_BELOW, type SkillTree, topicState, treeCounts } from './progress';

const tree: SkillTree = {
  root: { id: 'root', name: 'Numbers', done: 8, total: 8 },
  topics: [
    {
      id: 'fractions',
      name: 'Fractions',
      done: 6,
      total: 6,
      accuracy: 88,
      prereq: ['root'],
      leaves: [
        { id: 'equiv', name: 'Equivalent', mastered: true },
        { id: 'word', name: 'Word Problems', mastered: true, due: true },
      ],
    },
    {
      id: 'percent',
      name: 'Percentages',
      done: 4,
      total: 6,
      accuracy: REVIEW_BELOW - 5,
      prereq: ['root'],
      leaves: [
        { id: 'calc', name: 'Calculations', mastered: false, started: true, accuracy: 72 },
        { id: 'real', name: 'Real-life', mastered: false, after: 'calc' },
      ],
    },
    { id: 'ratio', name: 'Ratio', done: 3, total: 6, accuracy: 74, prereq: ['root'], leaves: [] },
    { id: 'algebra', name: 'Algebra Basics', done: 0, total: 8, accuracy: 0, prereq: ['root', 'percent'], leaves: [{ id: 'expr', name: 'Expressions', mastered: false }] },
  ],
  capstone: { id: 'advanced', name: 'Algebra Advanced', done: 0, total: 12, prereq: ['algebra', 'ratio'] },
};
const topic = (id: string) => tree.topics.find((t) => t.id === id)!;

describe('topicState', () => {
  it('is mastered when every skill is done', () => {
    expect(topicState(tree, 'root')).toBe('mastered');
    expect(topicState(tree, 'fractions')).toBe('mastered');
  });

  it('needs review when recent accuracy is low, otherwise is in progress', () => {
    expect(topicState(tree, 'percent')).toBe('review');
    expect(topicState(tree, 'ratio')).toBe('progress');
  });

  it('stays locked until every prerequisite is mastered', () => {
    expect(topicState(tree, 'algebra')).toBe('locked');
    expect(topicState(tree, 'advanced')).toBe('locked');
  });
});

describe('leafState', () => {
  it('turns a mastered skill amber when it is due for review', () => {
    expect(leafState(tree, topic('fractions'), topic('fractions').leaves[0])).toBe('mastered');
    expect(leafState(tree, topic('fractions'), topic('fractions').leaves[1])).toBe('review');
  });

  it('locks a skill that comes after one not yet mastered, or whose topic is locked', () => {
    expect(leafState(tree, topic('percent'), topic('percent').leaves[0])).toBe('progress');
    expect(leafState(tree, topic('percent'), topic('percent').leaves[1])).toBe('locked');
    expect(leafState(tree, topic('algebra'), topic('algebra').leaves[0])).toBe('locked');
  });
});

describe('treeCounts', () => {
  it('counts every node on the map by state', () => {
    expect(treeCounts(tree)).toEqual({ mastered: 3, review: 2, progress: 2, locked: 4 });
  });
});

describe('nextMilestone', () => {
  it('names the unfinished topic that blocks the next locked one', () => {
    expect(nextMilestone(tree)).toEqual({ unlock: 'Algebra Basics', topic: 'Percentages', left: 2, done: 4, total: 6 });
  });

  it('is null when nothing is locked', () => {
    const open: SkillTree = { ...tree, topics: [tree.topics[0]], capstone: { ...tree.capstone, prereq: ['fractions'] } };
    expect(nextMilestone(open)).toBeNull();
  });
});

describe('overall', () => {
  it('adds up the subjects and rounds the percentage', () => {
    expect(overall([{ done: 24, total: 48 }, { done: 18, total: 42 }])).toEqual({ done: 42, total: 90, percent: 47 });
  });
});

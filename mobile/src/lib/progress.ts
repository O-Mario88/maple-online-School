/**
 * The learner's skill tree for one subject: a root topic, branch topics with skill counts and
 * their key skills, and a capstone. Colours are worked out, not stored:
 * gold = mastered, amber = needs review, blue = in progress, grey = locked.
 */

export type MapState = 'mastered' | 'review' | 'progress' | 'locked';

/** Recent accuracy (%) under which an unlocked topic or started skill needs review. */
export const REVIEW_BELOW = 60;

export interface Leaf {
  id: string;
  name: string;
  mastered: boolean;
  /** Mastered, but spaced repetition says it is time to review. */
  due?: boolean;
  started?: boolean;
  accuracy?: number;
  /** A sibling skill that must be mastered first. */
  after?: string;
}

export interface Topic {
  id: string;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  /** Topic ids ('root' for the root) that must be mastered first. */
  prereq: readonly string[];
  leaves: readonly Leaf[];
}

export interface SkillTree {
  root: { id: string; name: string; done: number; total: number };
  topics: readonly Topic[];
  capstone: { id: string; name: string; done: number; total: number; prereq: readonly string[] };
}

function node(tree: SkillTree, id: string) {
  if (id === tree.root.id) return { ...tree.root, prereq: [] as readonly string[], accuracy: 100 };
  if (id === tree.capstone.id) return { ...tree.capstone, accuracy: 100 };
  return tree.topics.find((t) => t.id === id);
}

/** The colour of the root, a topic or the capstone. */
export function topicState(tree: SkillTree, id: string): MapState {
  const n = node(tree, id);
  if (!n) return 'locked';
  if (n.prereq.some((p) => topicState(tree, p) !== 'mastered')) return 'locked';
  if (n.done >= n.total) return 'mastered';
  return n.accuracy < REVIEW_BELOW ? 'review' : 'progress';
}

/** The colour of one key skill under its topic. */
export function leafState(tree: SkillTree, topic: Topic, leaf: Leaf): MapState {
  if (topicState(tree, topic.id) === 'locked') return 'locked';
  const before = leaf.after ? topic.leaves.find((l) => l.id === leaf.after) : undefined;
  if (leaf.after && !before?.mastered) return 'locked';
  if (leaf.mastered && !leaf.due) return 'mastered';
  if (leaf.due || (leaf.started && (leaf.accuracy ?? 100) < REVIEW_BELOW)) return 'review';
  return 'progress';
}

/** How many nodes on the map are in each state. */
export function treeCounts(tree: SkillTree): Record<MapState, number> {
  const out: Record<MapState, number> = { mastered: 0, review: 0, progress: 0, locked: 0 };
  out[topicState(tree, tree.root.id)] += 1;
  for (const t of tree.topics) {
    out[topicState(tree, t.id)] += 1;
    for (const l of t.leaves) out[leafState(tree, t, l)] += 1;
  }
  out[topicState(tree, tree.capstone.id)] += 1;
  return out;
}

/** The next unlock: the first locked topic and the unfinished topic standing in its way. */
export function nextMilestone(tree: SkillTree): { unlock: string; topic: string; left: number; done: number; total: number } | null {
  const ordered = [...tree.topics, tree.capstone];
  for (const t of ordered) {
    if (topicState(tree, t.id) !== 'locked') continue;
    const blocker = t.prereq.map((p) => node(tree, p)).find((p) => p && topicState(tree, p.id) !== 'locked' && topicState(tree, p.id) !== 'mastered');
    if (blocker) return { unlock: t.name, topic: blocker.name, left: blocker.total - blocker.done, done: blocker.done, total: blocker.total };
  }
  return null;
}

export function overall(subjects: readonly { done: number; total: number }[]): { done: number; total: number; percent: number } {
  const done = subjects.reduce((s, x) => s + x.done, 0);
  const total = subjects.reduce((s, x) => s + x.total, 0);
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

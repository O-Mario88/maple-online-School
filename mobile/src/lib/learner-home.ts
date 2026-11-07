/** Rules for the learner's home: the task filter. (Results use the CBC identifiers in lib/cbc.) */

export type TaskKind = 'assignment' | 'test' | 'project' | 'reading';
export type TaskFilter = 'all' | Exclude<TaskKind, 'reading'>;


export function taskCounts(tasks: readonly { kind: TaskKind }[]): Record<TaskFilter, number> {
  const count = (k: TaskKind) => tasks.filter((t) => t.kind === k).length;
  return { all: tasks.length, assignment: count('assignment'), test: count('test'), project: count('project') };
}

export function filterTasks<T extends { kind: TaskKind }>(tasks: readonly T[], filter: TaskFilter): T[] {
  return filter === 'all' ? [...tasks] : tasks.filter((t) => t.kind === filter);
}

const ATTENTION = "Here's what needs your attention today.";

/**
 * The hero's one sentence: the learner's two strongest subjects by score,
 * then the nudge to today's work. Subjects without a numeric score are skipped.
 */
export function heroMessage(subjects: readonly { subject: string; score: string }[]): string {
  const best = subjects
    .map((s) => ({ name: s.subject, score: Number.parseFloat(s.score) }))
    .filter((s) => Number.isFinite(s.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((s) => s.name);
  if (best.length === 0) return ATTENTION;
  return `You're making progress in ${best.join(' and ')}. ${ATTENTION}`;
}

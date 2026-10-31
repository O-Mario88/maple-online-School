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

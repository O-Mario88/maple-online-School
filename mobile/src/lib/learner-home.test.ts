import { filterTasks, taskCounts } from './learner-home';

describe('tasks', () => {
  const tasks = [
    { id: '1', kind: 'assignment' },
    { id: '2', kind: 'assignment' },
    { id: '3', kind: 'test' },
    { id: '4', kind: 'project' },
    { id: '5', kind: 'reading' },
  ] as const;

  it('counts every task and each kind', () => {
    expect(taskCounts(tasks)).toEqual({ all: 5, assignment: 2, test: 1, project: 1 });
  });

  it('filters by kind, or shows everything', () => {
    expect(filterTasks(tasks, 'test').map((t) => t.id)).toEqual(['3']);
    expect(filterTasks(tasks, 'all')).toHaveLength(5);
  });
});

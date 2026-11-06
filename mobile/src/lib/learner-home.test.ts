import { filterTasks, heroMessage, taskCounts } from './learner-home';

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

describe('hero message', () => {
  const subjects = [
    { subject: 'Mathematics', score: '86%' },
    { subject: 'English', score: '82%' },
    { subject: 'Social Studies', score: '91%' },
    { subject: 'ICT', score: '88%' },
  ];

  it('names the two strongest subjects, best first', () => {
    expect(heroMessage(subjects)).toBe("You're making progress in Social Studies and ICT. Here's what needs your attention today.");
  });

  it('names a single subject on its own', () => {
    expect(heroMessage([{ subject: 'Science', score: '78%' }])).toBe("You're making progress in Science. Here's what needs your attention today.");
  });

  it('falls back to a plain line when there are no subjects or scores', () => {
    expect(heroMessage([])).toBe("Here's what needs your attention today.");
    expect(heroMessage([{ subject: 'Art', score: '—' }])).toBe("Here's what needs your attention today.");
  });
});

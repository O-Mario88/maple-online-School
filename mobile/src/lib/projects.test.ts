import { filterProjects, overallIdentifier, pageOf, projectStats } from './projects';

const p = (id: string, status: 'in_progress' | 'completed' | 'upcoming' | 'attention', subject = 'Science', title = id) => ({ id, status, subject, title });
const projects = [
  p('a', 'in_progress', 'Science', 'Growing a Greener School'),
  p('b', 'completed', 'Social Studies', 'Creative Waste Solutions'),
  p('c', 'upcoming', 'English', 'My Community Story'),
  p('d', 'completed', 'Integrated', 'Healthy Eating Campaign'),
  p('e', 'attention', 'Mathematics', 'Design a Simple Machine'),
  p('f', 'in_progress'),
  p('g', 'completed'),
  p('h', 'upcoming'),
];

describe('projectStats', () => {
  it('counts each status with its share, rounding halves to even as the reference does', () => {
    expect(projectStats(projects)).toEqual({
      total: 8,
      completed: { count: 3, percent: 38 },
      in_progress: { count: 2, percent: 25 },
      upcoming: { count: 2, percent: 25 },
      attention: { count: 1, percent: 12 },
    });
  });

  it('copes with no projects', () => {
    expect(projectStats([]).completed).toEqual({ count: 0, percent: 0 });
  });
});

describe('overallIdentifier', () => {
  it('averages the competency identifiers', () => {
    expect(overallIdentifier([2, 3, 3, 3, 2, 3, 2, 2, 2, 3, 2, 3])).toEqual({ id: 3, label: 'Outstanding' });
    expect(overallIdentifier([2, 2, 3])).toEqual({ id: 2, label: 'Moderate' });
  });
});

describe('filterProjects', () => {
  it('filters by status, subject and search words', () => {
    expect(filterProjects(projects, { status: 'completed' }).map((x) => x.id)).toEqual(['b', 'd', 'g']);
    expect(filterProjects(projects, { subject: 'English' }).map((x) => x.id)).toEqual(['c']);
    expect(filterProjects(projects, { query: 'greener' }).map((x) => x.id)).toEqual(['a']);
    expect(filterProjects(projects, {})).toHaveLength(8);
  });
});

describe('pageOf', () => {
  it('slices a page and says how many pages there are', () => {
    expect(pageOf(projects, 1, 5)).toEqual({ items: projects.slice(0, 5), pages: 2, from: 1, to: 5, total: 8 });
    expect(pageOf(projects, 2, 5)).toEqual({ items: projects.slice(5), pages: 2, from: 6, to: 8, total: 8 });
  });
});

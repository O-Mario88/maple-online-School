import { ACADEMICS_QUICK_ACTIONS, ACADEMICS_TABLES, academicsAction } from './academicsShape';

describe('what the Academics buttons do in a real build', () => {
  test('terms, years, grades and subjects open their forms', () => {
    expect(academicsAction('Add Term')).toBe('term');
    expect(academicsAction('New Academic Year')).toBe('term');
    expect(academicsAction('Add Grade')).toBe('grade');
    expect(academicsAction('Manage Matrix')).toBe('curriculum');
  });

  test('anything the API has no form for yet is unavailable, never a toast', () => {
    expect(academicsAction('Add Campus')).toBeNull();
    expect(academicsAction('Import from Template')).toBeNull();
    expect(academicsAction('Edit Main Campus')).toBeNull();
  });

  test('every button the page draws is either wired or marked unavailable', () => {
    const labels = [...ACADEMICS_QUICK_ACTIONS.map((q) => q.label), ...ACADEMICS_TABLES.flatMap((t) => t.actions)];
    const wired = labels.filter((l) => academicsAction(l) !== null);
    expect(wired.length).toBeGreaterThan(0);
    expect(labels.length).toBeGreaterThan(wired.length);
  });
});

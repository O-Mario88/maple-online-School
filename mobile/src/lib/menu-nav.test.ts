import { menuScreenId } from './menu-nav';

describe('menu navigation', () => {
  test('the same page with the same address is one screen, so opening it again reuses it', () => {
    expect(menuScreenId('learn/plan', {})).toBe(menuScreenId('learn/plan', {}));
    expect(menuScreenId('learn/careers', { tab: 'events', page: '2' })).toBe(menuScreenId('learn/careers', { page: '2', tab: 'events' }));
  });

  test('a different page or different address keeps its own screen', () => {
    expect(menuScreenId('learn/plan', {})).not.toBe(menuScreenId('learn/progress', {}));
    expect(menuScreenId('learn/careers', { tab: 'events' })).not.toBe(menuScreenId('learn/careers', { tab: 'counselor' }));
    expect(menuScreenId('learn/lesson', { id: 'a' })).not.toBe(menuScreenId('learn/lesson', { id: 'b' }));
  });

  test('list values and empty values are read the same way every time', () => {
    expect(menuScreenId('learn/squads', { tags: ['a', 'b'] })).toBe('learn/squads?tags=a,b');
    expect(menuScreenId('learn/plan', { tab: undefined })).toBe('learn/plan');
  });
});

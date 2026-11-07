import { collectPages } from './pages';

const pages = [
  { results: [1, 2], next: '?page=2' },
  { results: [3, 4], next: '?page=3' },
  { results: [5], next: null },
];

describe('collectPages', () => {
  it('reads page after page until there is no next page', async () => {
    const asked: number[] = [];
    const all = await collectPages(async (page) => {
      asked.push(page);
      return pages[page - 1];
    });
    expect(all).toEqual([1, 2, 3, 4, 5]);
    expect(asked).toEqual([1, 2, 3]);
  });

  it('stops on an empty page even if the server says there is more', async () => {
    const all = await collectPages(async () => ({ results: [], next: '?page=2' }));
    expect(all).toEqual([]);
  });

  it('stops at the page limit so a broken server cannot loop forever', async () => {
    let calls = 0;
    await collectPages(async () => {
      calls += 1;
      return { results: [calls], next: 'more' };
    }, 5);
    expect(calls).toBe(5);
  });
});

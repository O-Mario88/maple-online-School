/** The API's lists come 20 to a page; a safety cap stops a misbehaving server looping forever. */
const MAX_PAGES = 200;

export interface ListPage<T> {
  results: readonly T[];
  next?: string | null;
}

/** Read every page of a list, starting at page 1, until there is no next page. */
export async function collectPages<T>(fetchPage: (page: number) => Promise<ListPage<T>>, maxPages = MAX_PAGES): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const { results, next } = await fetchPage(page);
    all.push(...results);
    if (!next || results.length === 0) break;
  }
  return all;
}

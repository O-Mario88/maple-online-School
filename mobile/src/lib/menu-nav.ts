import { type Href, router } from 'expo-router';

type Params = Readonly<Record<string, string | readonly string[] | undefined>>;

/**
 * One id per page and address. Menus open pages with it, so a page that is already open is
 * brought back as it was (scroll, filters, typed text) instead of stacking a fresh copy on top.
 */
export function menuScreenId(name: string, params: Params): string {
  const query = Object.keys(params)
    .filter((k) => params[k] !== undefined)
    .sort()
    .map((k) => {
      const v = params[k];
      return `${k}=${Array.isArray(v) ? v.join(',') : String(v)}`;
    })
    .join('&');
  return query ? `${name}?${query}` : name;
}

/** Open a page from a menu (tab bar, sidebar, top bar, drawer): reuses the open copy of that page. */
export function openMenuPage(href: Href): void {
  router.push(href, { dangerouslySingular: (name, params) => menuScreenId(name, params as Params) });
}
